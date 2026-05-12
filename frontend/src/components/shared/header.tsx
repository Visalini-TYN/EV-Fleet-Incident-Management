import { Bell, Clock3, CircleHelp, Search, User } from "lucide-react";

export default function Header() {
  return (
    <header style={{
      height: "64px", background: "white",
      borderBottom: "1px solid #e5e7eb",
      padding: "0 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexShrink: 0, position: "sticky", top: 0, zIndex: 10,
      boxShadow: "0 1px 0 #f1f5f9",
    }}>

      {/* Search */}
      <div style={{ position: "relative", width: "280px" }}>
        <Search style={{
          position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
          width: "15px", height: "15px", color: "#94a3b8"
        }} />
        <input
          type="text"
          placeholder="Search incidents, vehicles, or vendors"
          style={{
            width: "100%", height: "38px",
            paddingLeft: "38px", paddingRight: "14px",
            borderRadius: "10px", border: "1px solid #e2e8f0",
            background: "#f8fafc", fontSize: "13px", color: "#334155",
            outline: "none", fontFamily: "inherit",
          }}
        />
      </div>

      {/* Title */}
      <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" }}>
        Incident Management
      </h2>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {[Bell, Clock3, CircleHelp].map((Icon, i) => (
          <button key={i} style={{
            width: "36px", height: "36px", borderRadius: "8px",
            border: "none", background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#64748b", transition: "background 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Icon size={17} />
          </button>
        ))}

        {/* Avatar */}
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "linear-gradient(135deg, #92400e, #78350f)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid #f1f5f9", marginLeft: "4px",
        }}>
          <span style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>JD</span>
        </div>

        <button style={{
          width: "34px", height: "34px", borderRadius: "8px",
          border: "none", background: "transparent", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#64748b", transition: "background 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <User size={16} />
        </button>
      </div>
    </header>
  );
}