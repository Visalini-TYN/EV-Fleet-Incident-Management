import {
  LayoutDashboard, Car, AlertCircle, FileText, Settings, FilePlus,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Command Center", active: true },
  { icon: Car, label: "Vehicle Fleet", active: false },
  { icon: AlertCircle, label: "Incident Queue", active: false },
  { icon: FileText, label: "Service Logs", active: false },
  { icon: Settings, label: "System Admin", active: false },
];

export default function Sidebar() {
  return (
    <aside style={{
      width: "220px", minWidth: "220px", height: "100vh",
      background: "white", borderRight: "1px solid #e5e7eb",
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0,
      boxShadow: "1px 0 0 #f1f5f9",
    }}>

      {/* Brand */}
      <div style={{ padding: "28px 24px 12px" }}>
        <h1 style={{ fontSize: "19px", fontWeight: 800, color: "#0d4f8b", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
          FleetCore EV
        </h1>
        <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px", fontWeight: 500 }}>
          Enterprise Command
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 12px 0" }}>
        {navItems.map((item) => (
          <button
            key={item.label}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 14px", borderRadius: "10px",
              fontSize: "13px", fontWeight: item.active ? 600 : 500,
              background: item.active ? "#0d4f8b" : "transparent",
              color: item.active ? "white" : "#64748b",
              border: "none", cursor: "pointer", marginBottom: "2px",
              textAlign: "left", transition: "background 0.15s, color 0.15s",
              boxShadow: item.active ? "0 2px 8px rgba(13,79,139,0.2)" : "none",
            }}
            onMouseEnter={e => {
              if (!item.active) {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.color = "#1e293b";
              }
            }}
            onMouseLeave={e => {
              if (!item.active) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#64748b";
              }
            }}
          >
            <item.icon size={17} strokeWidth={item.active ? 2.2 : 1.8} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div style={{ margin: "0 20px", borderTop: "1px solid #f1f5f9" }} />

      {/* New Incident Button */}
      <div style={{ padding: "16px 16px 20px" }}>
        <button style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: "8px", background: "#0d4f8b", color: "white",
          fontSize: "13px", fontWeight: 700, padding: "12px 16px",
          borderRadius: "12px", border: "none", cursor: "pointer",
          boxShadow: "0 2px 8px rgba(13,79,139,0.25)", transition: "background 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "#0b4379")}
          onMouseLeave={e => (e.currentTarget.style.background = "#0d4f8b")}
        >
          <FilePlus size={15} strokeWidth={2} />
          New Incident Report
        </button>
      </div>
    </aside>
  );
}