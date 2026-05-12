const data = [
  { day: "MON", value: 30 },
  { day: "TUE", value: 45 },
  { day: "WED", value: 28 },
  { day: "THU", value: 60 },
  { day: "FRI", value: 38 },
  { day: "SAT", value: 72, isToday: true },
  { day: "SUN", value: 20 },
];

const BAR_W = 28;
const BAR_GAP = 10;
const CHART_H = 110;
const MAX_VAL = Math.max(...data.map((d) => d.value));
const TOTAL_W = data.length * (BAR_W + BAR_GAP) - BAR_GAP;

export default function AnalyticsTrend() {
  return (
    <div className="fleet-card p-6" style={{ display: "flex", flexDirection: "column" }}>
      <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
        Analytics Trend
      </h2>
      <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
        Incident volume (Last 7 Days)
      </p>

      <div style={{ marginTop: "16px", flex: 1 }}>
        <svg
          viewBox={`0 0 ${TOTAL_W + 10} ${CHART_H + 28}`}
          style={{ width: "100%", display: "block", overflow: "visible" }}
          aria-label="Incident volume bar chart"
        >
          {data.map((d, i) => {
            const barH = Math.max(4, (d.value / MAX_VAL) * CHART_H);
            const x = i * (BAR_W + BAR_GAP) + 5;
            const y = CHART_H - barH;
            return (
              <g key={d.day}>
                {/* Bar */}
                <rect
                  x={x} y={y}
                  width={BAR_W} height={barH}
                  rx={5} ry={5}
                  fill={d.isToday ? "#6b7c2d" : "#bfdbfe"}
                />
                {/* Today glow overlay */}
                {d.isToday && (
                  <rect
                    x={x} y={y}
                    width={BAR_W} height={barH}
                    rx={5} ry={5}
                    fill="rgba(107,124,45,0.15)"
                  />
                )}
                {/* Day label */}
                <text
                  x={x + BAR_W / 2}
                  y={CHART_H + 18}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={d.isToday ? 700 : 600}
                  fill={d.isToday ? "#6b7c2d" : "#94a3b8"}
                  fontFamily="Inter, sans-serif"
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
