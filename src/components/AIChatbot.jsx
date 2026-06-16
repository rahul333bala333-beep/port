import { useState, useRef, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { useProjects } from '../context/ProjectsContext';
import { fetchCertificates } from '../services/certificateService';
import { askPortfolioAI, parseCharts } from '../services/aiService';
import {
  buildPortfolioContext,
  skillsChart,
  techDistribution,
  certDistribution,
} from '../data/portfolioData';
import PieChart from './charts/PieChart';
import BarChart from './charts/BarChart';
import '../styles/AIChatbot.css';

function ChartRenderer({ spec }) {
  if (!spec || !Array.isArray(spec.data)) return null;
  if (spec.type === 'pie') {
    return <PieChart title={spec.title} data={spec.data} />;
  }
  return <BarChart title={spec.title} data={spec.data} unit={spec.unit || ''} />;
}

const SUGGESTIONS = [
  'What are the strongest skills?',
  'Show projects by technology',
  'Break down certificates by category',
];

export default function AIChatbot() {
  const { profile } = useProfile();
  const { projects } = useProjects();

  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState('chat');
  const [certs, setCerts] = useState([]);
  const [certsLoaded, setCertsLoaded] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm ${profile?.name?.split(' ')[0] || 'the'} portfolio's AI assistant. Ask me about skills, projects, or certifications — I can chart them too. 📊`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Analytics tab AI summary
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  const scrollRef = useRef(null);

  // Pull certificates once the widget is first opened.
  useEffect(() => {
    if (isOpen && !certsLoaded) {
      setCertsLoaded(true);
      fetchCertificates()
        .then((data) => setCerts(data || []))
        .catch(() => setCerts(profile?.certificates || []));
    }
  }, [isOpen, certsLoaded, profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, tab]);

  const context = () => buildPortfolioContext({ profile, projects, certs });

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await askPortfolioAI(
        nextMessages.map((m) => ({ role: m.role, content: m.content })),
        context()
      );
      const { text: cleanText, charts } = parseCharts(reply);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: cleanText || 'Here you go:', charts },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${err.message}`, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError('');
    try {
      const reply = await askPortfolioAI(
        [
          {
            role: 'user',
            content:
              'Write a polished 3-4 sentence professional summary of this person for a recruiter, highlighting their strongest skills, project focus, and certifications. Do not include any charts.',
          },
        ],
        context()
      );
      setSummary(parseCharts(reply).text);
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  const skills = skillsChart();
  const tech = techDistribution(projects);
  const certPie = certDistribution(certs);

  return (
    <>
      <button
        className={`ai-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
        title="AI Portfolio Assistant"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {isOpen && (
        <div className="ai-panel glass-card">
          <div className="ai-header">
            <div className="ai-header-title">
              <span className="ai-dot" />
              <strong>AI Portfolio Assistant</strong>
            </div>
            <div className="ai-tabs">
              <button className={tab === 'chat' ? 'active' : ''} onClick={() => setTab('chat')}>
                💬 Chat
              </button>
              <button className={tab === 'analytics' ? 'active' : ''} onClick={() => setTab('analytics')}>
                📊 Analytics
              </button>
            </div>
          </div>

          {tab === 'chat' ? (
            <>
              <div className="ai-messages" ref={scrollRef}>
                {messages.map((m, i) => (
                  <div key={i} className={`ai-msg ${m.role} ${m.isError ? 'error' : ''}`}>
                    <div className="ai-bubble">{m.content}</div>
                    {m.charts &&
                      m.charts.map((spec, ci) => (
                        <div className="ai-chart-wrap" key={ci}>
                          <ChartRenderer spec={spec} />
                        </div>
                      ))}
                  </div>
                ))}
                {loading && (
                  <div className="ai-msg assistant">
                    <div className="ai-bubble ai-typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
              </div>

              {messages.length <= 1 && (
                <div className="ai-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} disabled={loading}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <form
                className="ai-input-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about skills, projects, certs…"
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !input.trim()}>
                  ➤
                </button>
              </form>
            </>
          ) : (
            <div className="ai-analytics" ref={scrollRef}>
              <BarChart title="🛠️ Skill Proficiency" data={skills} unit="%" max={100} />
              <PieChart title="💻 Projects by Technology" data={tech} />
              <PieChart title="🎓 Certificates by Category" data={certPie} />

              <div className="ai-summary">
                <button className="ai-summary-btn" onClick={generateSummary} disabled={summaryLoading}>
                  {summaryLoading ? 'Generating…' : '✨ Generate AI Summary'}
                </button>
                {summaryError && <p className="ai-summary-error">⚠️ {summaryError}</p>}
                {summary && <p className="ai-summary-text">{summary}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
