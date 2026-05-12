import { Sparkles, ArrowLeftRight } from "lucide-react";

const timelineEvents = [
  { label: "Escalated to Manager", time: "4h 12m ago", active: true },
  { label: "Vendor Notified", time: "3h 55m ago", active: false },
  { label: "Initial Report", time: "5h 02m ago", active: false },
];

export default function ReviewPanel() {
  return (
    <div className="fleet-card p-6" style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Title */}
      <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", lineHeight: "1.3" }}>
        Incident Review<br />Panel
      </h2>
      <p style={{ fontSize: "13px", color: "#0d4f8b", fontWeight: 600, marginTop: "6px" }}>
        INC-9921 • Vehicle #EV-402
      </p>

      {/* AI Recommendation */}
      <div style={{
        background: "#eff6ff", border: "1px solid #bfdbfe",
        borderRadius: "12px", padding: "14px", marginTop: "18px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px" }}>
          <Sparkles size={15} color="#0d4f8b" />
          <span style={{ fontSize: "10px", fontWeight: 800, color: "#0d4f8b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            AI Recommendation
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.55" }}>
          Immediate reassignment suggested based on vendor delay and part unavailability.
        </p>
      </div>

      {/* Timeline */}
      <div style={{ marginTop: "18px", flex: 1 }}>
        <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
          Incident History Timeline
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {timelineEvents.map((evt, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{
                marginTop: "5px", width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                background: evt.active ? "#0d4f8b" : "#cbd5e1",
              }} />
              <div>
                <p style={{ fontSize: "12px", color: evt.active ? "#0f172a" : "#64748b", fontWeight: evt.active ? 600 : 400 }}>
                  {evt.label}
                </p>
                <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{evt.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <button style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: "8px", background: "#0d4f8b", color: "white",
          fontSize: "13px", fontWeight: 700, padding: "12px",
          borderRadius: "12px", border: "none", cursor: "pointer",
          boxShadow: "0 2px 8px rgba(13,79,139,0.25)", transition: "background 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "#0b4379")}
          onMouseLeave={e => (e.currentTarget.style.background = "#0d4f8b")}
        >
          <ArrowLeftRight size={15} /> Reassign Vendor
        </button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {["Reject", "Resolve"].map(label => (
            <button key={label} style={{
              padding: "11px", border: "1px solid #e2e8f0",
              borderRadius: "12px", fontSize: "13px", fontWeight: 600,
              color: "#374151", background: "white", cursor: "pointer", transition: "background 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={e => (e.currentTarget.style.background = "white")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}