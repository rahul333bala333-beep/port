// Lightweight themed donut chart (no external dependencies).
const PALETTE = [
  '#915EFF',
  '#00CEF5',
  '#FF6B9D',
  '#FFD166',
  '#06D6A0',
  '#EF476F',
  '#7C4DFF',
  '#4DD0E1',
  '#FFA726',
  '#A3E635',
];

function polarToCartesian(cx, cy, r, angle) {
  const a = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function PieChart({ data = [], title, size = 180 }) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

  if (!data.length || total === 0) {
    return <p className="chart-empty">No data to chart yet.</p>;
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const strokeW = size * 0.18;

  let cursor = 0;
  const segments = data.map((d, i) => {
    const fraction = d.value / total;
    const startAngle = cursor * 360;
    cursor += fraction;
    const endAngle = cursor * 360;
    return {
      ...d,
      color: PALETTE[i % PALETTE.length],
      pct: Math.round(fraction * 100),
      // A tiny gap avoids touching segments looking merged.
      path: arcPath(cx, cy, r, startAngle + 1, Math.max(startAngle + 1.5, endAngle - 1)),
    };
  });

  return (
    <div className="chart-block">
      {title && <h5 className="chart-title">{title}</h5>}
      <div className="pie-chart">
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={title || 'Pie chart'}>
          {segments.map((s, i) => (
            <path
              key={i}
              d={s.path}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
          ))}
          <text x={cx} y={cy} className="pie-center-text" textAnchor="middle" dominantBaseline="central">
            {total}
          </text>
        </svg>
        <ul className="chart-legend">
          {segments.map((s, i) => (
            <li key={i}>
              <span className="legend-swatch" style={{ background: s.color }} />
              <span className="legend-label">{s.label}</span>
              <span className="legend-value">{s.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
