// Lightweight themed horizontal bar chart (no external dependencies).
export default function BarChart({ data = [], title, unit = '', max }) {
  if (!data.length) {
    return <p className="chart-empty">No data to chart yet.</p>;
  }

  const ceiling = max || Math.max(...data.map((d) => d.value || 0), 1);

  return (
    <div className="chart-block">
      {title && <h5 className="chart-title">{title}</h5>}
      <ul className="bar-chart">
        {data.map((d, i) => {
          const pct = Math.max(2, Math.round(((d.value || 0) / ceiling) * 100));
          return (
            <li key={i} className="bar-row">
              <span className="bar-label" title={d.label}>{d.label}</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: `${pct}%` }} />
              </span>
              <span className="bar-value">
                {d.value}
                {unit}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
