import { CERT_CATEGORIES, DEFAULT_CATEGORY } from '../services/certificateService';

// Single source of truth for skills so the Skills page, charts and AI all agree.
export const skillsData = [
  { skill: 'HTML5', level: 90, group: 'Frontend' },
  { skill: 'CSS3', level: 85, group: 'Frontend' },
  { skill: 'JavaScript', level: 80, group: 'Frontend' },
  { skill: 'React', level: 75, group: 'Frontend' },
  { skill: 'Git & GitHub', level: 85, group: 'Tools' },
  { skill: 'UI/UX Design', level: 80, group: 'Design' },
  { skill: 'Cybersecurity', level: 70, group: 'Security' },
  { skill: 'Problem Solving', level: 85, group: 'Soft Skills' },
];

export const experienceData = [
  {
    role: 'Full Stack Development Intern',
    org: 'Aathesh Soft Infotech Pvt Ltd',
    date: 'Nov 2025 - Dec 2025',
  },
  {
    role: 'Vendor Ledger Management System',
    org: 'Frontend Development Project',
    date: 'Nov 2025',
  },
  {
    role: 'Security Operations Checklist',
    org: 'Cybersecurity Project',
    date: 'Dec 2025',
  },
];

/** Skills as a bar-chart dataset. */
export function skillsChart() {
  return skillsData
    .map((s) => ({ label: s.skill, value: s.level }))
    .sort((a, b) => b.value - a.value);
}

/** Count how often each technology appears across projects (pie dataset). */
export function techDistribution(projects = []) {
  const counts = {};
  projects.forEach((p) => {
    (p.tech || []).forEach((t) => {
      const key = String(t).trim();
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

/** Count certificates per category (pie dataset). */
export function certDistribution(certs = []) {
  const counts = {};
  certs.forEach((c) => {
    const id = c.category || DEFAULT_CATEGORY;
    counts[id] = (counts[id] || 0) + 1;
  });
  return CERT_CATEGORIES.filter((cat) => counts[cat.id]).map((cat) => ({
    label: `${cat.icon} ${cat.label}`,
    value: counts[cat.id],
  }));
}

/**
 * Builds a compact text summary of the whole portfolio for the AI model.
 * Pulls live projects/certificates so the assistant always answers on
 * up-to-date data.
 */
export function buildPortfolioContext({ profile, projects = [], certs = [] }) {
  const lines = [];

  lines.push(`Name: ${profile?.name || 'N/A'}`);
  lines.push(`Title: ${profile?.title || ''} — ${profile?.subtitle || ''}`);
  if (profile?.bio) lines.push(`Bio: ${profile.bio}`);
  lines.push(
    `Education: ${profile?.degree || ''} at ${profile?.college || ''} (${profile?.degreeYears || ''}), CGPA ${profile?.cgpa || ''}`
  );
  lines.push(
    `Stats: ${profile?.yearsLearning || ''} years learning, ${profile?.projectsCompleted || ''} projects, ${profile?.certifications || ''} certifications`
  );

  lines.push('');
  lines.push('SKILLS (name: proficiency%):');
  skillsData.forEach((s) => lines.push(`- ${s.skill}: ${s.level}% [${s.group}]`));

  lines.push('');
  lines.push('EXPERIENCE:');
  experienceData.forEach((e) => lines.push(`- ${e.role}, ${e.org} (${e.date})`));

  lines.push('');
  lines.push(`PROJECTS (${projects.length}):`);
  projects.forEach((p) =>
    lines.push(`- ${p.title}: ${p.description || ''} | Tech: ${(p.tech || []).join(', ')}`)
  );

  lines.push('');
  lines.push(`CERTIFICATES (${certs.length}):`);
  certs.forEach((c) => {
    const cat = CERT_CATEGORIES.find((x) => x.id === (c.category || DEFAULT_CATEGORY));
    lines.push(`- ${c.title} by ${c.issuer || ''} (${c.date || ''}) [${cat ? cat.label : 'Other'}]`);
  });

  return lines.join('\n');
}
