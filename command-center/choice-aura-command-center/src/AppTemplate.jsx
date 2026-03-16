// ─── COMMAND CENTER TEMPLATE ─────────────────────────────────────────────────
// Two themes: "clean" (default) and "hud" (gamified RTS).
// Toggle in top-right corner. Replace placeholder text with your own data.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, createContext, useContext } from "react";

// ─── THEME DEFINITIONS ───────────────────────────────────────────────────────

const CLEAN = {
  name: "clean",
  bg: "#f7f3ec",
  surface: "#ffffff",
  surfaceAlt: "#f2ede4",
  surfaceHover: "#ede7dc",
  border: "#ddd6c8",
  borderStrong: "#b8a99a",
  text: "#2a2520",
  textSub: "#5a534a",
  textMuted: "#8a8078",
  textLabel: "#a09080",
  accent: "#7a5c44",
  green: "#4e7c5f",
  gold: "#9e7b2f",
  ember: "#b86a2e",
  magenta: "#8a4a6e",
  red: "#b84040",
  violet: "#6a4a8a",
  cyan: "#3a6b7a",
  font: "Georgia, 'Times New Roman', serif",
  fontSans: "system-ui, -apple-system, sans-serif",
  fontMono: "'Courier New', monospace",
  radius: "8px",
  radiusSm: "4px",
  shadow: "0 1px 6px rgba(0,0,0,0.08)",
  shadowHover: "0 4px 16px rgba(0,0,0,0.12)",
};

const HUD = {
  name: "hud",
  bg: "#0a0a0f",
  surface: "rgba(255,255,255,0.015)",
  surfaceAlt: "rgba(255,255,255,0.02)",
  surfaceHover: "rgba(0,240,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(0,240,255,0.4)",
  text: "#ffffff",
  textSub: "rgba(255,255,255,0.5)",
  textMuted: "rgba(255,255,255,0.3)",
  textLabel: "rgba(255,255,255,0.2)",
  accent: "#00f0ff",
  green: "#00ff88",
  gold: "#ffd700",
  ember: "#ff6a00",
  magenta: "#ff0066",
  red: "#ff2244",
  violet: "#a855f7",
  cyan: "#00f0ff",
  font: "'Courier New', monospace",
  fontSans: "system-ui",
  fontMono: "'Courier New', monospace",
  radius: "0px",
  radiusSm: "0px",
  shadow: "none",
  shadowHover: "none",
};

const ThemeCtx = createContext(CLEAN);
const useT = () => useContext(ThemeCtx);

// ─── DATA ─────────────────────────────────────────────────────────────────────

const REVENUE_PATHS = [
  { amount: "TBD", label: "revenue stream 1", source: "Revenue Source — description", status: "pending" },
  { amount: "TBD", label: "revenue stream 2", source: "Revenue Source — description", status: "pending" },
  { amount: "TBD", label: "revenue stream 3", source: "Revenue Source — description", status: "pending" },
];

const CONTENT_NODES = [
  { type: "channel type", name: "Channel Name", detail: "Platform — description\nDetails about this channel", status: "active", tag: "LIVE" },
  { type: "channel type", name: "Channel Name", detail: "Platform — description\nDetails about this channel", status: "active", tag: "LIVE" },
  { type: "channel type", name: "Channel Name", detail: "Platform — description\nDetails about this channel", status: "pending", tag: "PENDING" },
];

const THREE_JOBS = [
  { num: "01", title: "Job Title", color: "green", status: "ACTIVE", detail: "Describe what this job is and how it generates revenue.", blocker: null },
  { num: "02", title: "Job Title", color: "ember", status: "PENDING", detail: "Describe what this job is and what it needs to get started.", blocker: null },
  { num: "03", title: "Job Title", color: "ember", status: "PENDING", detail: "Describe what this job is and what it needs to get started.", blocker: null },
];

const EXTERNAL_PROJECTS = [
  { name: "External Project 1", status: "planning", desc: "Describe this revenue-generating external project.", icon: "📦" },
  { name: "External Project 2", status: "not started", desc: "Describe this revenue-generating external project.", icon: "📦" },
  { name: "External Project 3", status: "not started", desc: "Describe this revenue-generating external project.", icon: "📦" },
];

const INTERNAL_PROJECTS = [
  { name: "Internal Project 1", status: "planned", desc: "Describe this system-building internal project.", icon: "🔧", priority: "medium" },
  { name: "Internal Project 2", status: "not started", desc: "Describe this system-building internal project.", icon: "🔧", priority: "medium" },
  { name: "Internal Project 3", status: "not started", desc: "Describe this system-building internal project.", icon: "🔧", priority: "medium" },
];

const MINI_PROJECTS = [
  { name: "AI Mini-Project 1", status: "queued", desc: "Describe this AI-outsourced mini project." },
  { name: "AI Mini-Project 2", status: "queued", desc: "Describe this AI-outsourced mini project." },
  { name: "AI Mini-Project 3", status: "queued", desc: "Describe this AI-outsourced mini project." },
];

const AGENTS = [
  { name: "Agent Name", subtitle: "Agent Role", icon: "🤖", status: "deployed", colorKey: "green", role: "What this agent does", cost: "Cost to run", upkeep: "Ongoing costs", revenue: "How it generates revenue", resources: ["Resource 1", "Resource 2"], desc: "Describe what this agent does and what value it creates." },
  { name: "Agent Name", subtitle: "Agent Role", icon: "🔨", status: "in progress", colorKey: "cyan", role: "What this agent does", cost: "Cost to run", upkeep: "Ongoing costs", revenue: "How it generates revenue", resources: ["Resource 1", "Resource 2"], desc: "Describe what this agent does and what value it creates." },
  { name: "Agent Name", subtitle: "Agent Role", icon: "⏳", status: "not deployed", colorKey: "ember", role: "What this agent does", cost: "Cost to run", upkeep: "Ongoing costs", revenue: "How it generates revenue", resources: ["Resource 1", "Resource 2"], desc: "Describe what this agent does and what value it creates." },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const statusColor = (s, t) => {
  if (s === "active" || s === "live" || s === "deployed") return t.green;
  if (s === "in progress") return t.cyan;
  if (s === "complete") return t.gold;
  if (s === "new") return t.magenta;
  if (s === "pending" || s === "planning" || s === "scheduled") return t.ember;
  return t.textLabel;
};

const jobColor = (colorKey, t) => ({ green: t.green, ember: t.ember, cyan: t.cyan, gold: t.gold, magenta: t.magenta })[colorKey] || t.ember;

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function StatusDot({ status, size = 8 }) {
  const t = useT();
  const color = statusColor(status, t);
  const [opacity, setOpacity] = useState(1);
  useEffect(() => {
    let frame;
    const animate = () => { setOpacity(0.4 + 0.6 * Math.abs(Math.sin(Date.now() / 1000))); frame = requestAnimationFrame(animate); };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, opacity, flexShrink: 0, boxShadow: t.name === "hud" ? `0 0 ${size}px ${color}` : "none" }} />
  );
}

function Tag({ status, label }) {
  const t = useT();
  const color = statusColor(status, t);
  if (t.name === "clean") {
    return (
      <span style={{ display: "inline-block", fontSize: 10, fontFamily: t.fontSans, fontWeight: 600, letterSpacing: 0.5, padding: "2px 8px", borderRadius: t.radiusSm, background: color + "18", color: color, border: `1px solid ${color}30` }}>
        {label}
      </span>
    );
  }
  return (
    <span style={{ display: "inline-block", fontSize: 9, fontFamily: t.fontMono, letterSpacing: 2, padding: "2px 8px", color, border: `1px solid ${color}`, textTransform: "uppercase" }}>
      {label}
    </span>
  );
}

function SectionHeader({ children, color }) {
  const t = useT();
  const c = color || t.accent;
  if (t.name === "clean") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 14px", paddingBottom: 8, borderBottom: `2px solid ${t.border}` }}>
        <span style={{ fontFamily: t.fontSans, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: t.textMuted, textTransform: "uppercase" }}>{children}</span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 14px", paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ width: 6, height: 6, background: c, boxShadow: `0 0 8px ${c}`, flexShrink: 0 }} />
      <span style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 5, color: t.textLabel, textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

function Card({ children, hoverAccent, style = {} }) {
  const t = useT();
  const [hovered, setHovered] = useState(false);
  const accent = hoverAccent || t.accent;
  const base = t.name === "clean"
    ? { background: t.surface, border: `1px solid ${hovered ? accent + "50" : t.border}`, borderRadius: t.radius, boxShadow: hovered ? t.shadowHover : t.shadow, transition: "all 0.2s", transform: hovered ? "translateY(-2px)" : "none" }
    : { background: hovered ? t.surfaceHover : t.surface, border: `1px solid ${hovered ? accent + "40" : t.border}`, transition: "all 0.3s", transform: hovered ? "translateY(-2px)" : "none" };
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ ...base, ...style }}>
      {children}
    </div>
  );
}

function ProgressBar({ value, max, color, label }) {
  const t = useT();
  const c = color || t.accent;
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: 1, fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, fontWeight: t.name === "clean" ? 600 : 400, textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 10, color: c, fontFamily: t.fontMono }}>{value}/{max}</span>
      </div>
      <div style={{ height: t.name === "clean" ? 6 : 4, background: t.name === "clean" ? t.border : "rgba(255,255,255,0.06)", borderRadius: t.name === "clean" ? 99 : 0 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: t.name === "clean" ? 99 : 0, boxShadow: t.name === "hud" ? `0 0 8px ${c}40` : "none", transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function CollapseSection({ title, accent, children, defaultOpen = false }) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpen);
  const c = accent || t.accent;
  if (t.name === "clean") {
    return (
      <div style={{ marginBottom: 6 }}>
        <div onClick={() => setOpen(!open)} style={{ background: open ? t.surfaceAlt : t.surface, border: `1px solid ${t.border}`, borderRadius: open ? `${t.radius} ${t.radius} 0 0` : t.radius, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
          <span style={{ fontFamily: t.fontSans, fontSize: 12, fontWeight: 700, color: open ? t.text : t.textSub, letterSpacing: 0.5 }}>{title}</span>
          <span style={{ color: t.textMuted, fontSize: 11, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
        </div>
        {open && (
          <div style={{ border: `1px solid ${t.border}`, borderTop: "none", borderRadius: `0 0 ${t.radius} ${t.radius}`, padding: 16, background: t.surface }}>
            {children}
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 8 }}>
      <div onClick={() => setOpen(!open)} style={{ border: `1px solid ${open ? c + "30" : t.border}`, padding: "12px 16px", background: open ? `${c}06` : t.surface, cursor: "pointer", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 6, height: 6, background: c, boxShadow: `0 0 6px ${c}`, flexShrink: 0 }} />
          <span style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 3, color: open ? c : t.textMuted, textTransform: "uppercase" }}>{title}</span>
        </div>
        <span style={{ color: t.textLabel, fontSize: 12, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
      </div>
      {open && <div style={{ border: `1px solid ${c}15`, borderTop: "none", padding: 16, background: "rgba(255,255,255,0.01)" }}>{children}</div>}
    </div>
  );
}

// ─── HUD-ONLY EFFECTS ────────────────────────────────────────────────────────

function Scanlines() {
  return <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 9999, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)" }} />;
}

function GridBG() {
  return <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />;
}

function GlitchTitle({ text }) {
  const t = useT();
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    if (t.name !== "hud") return;
    const iv = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 150); }, 3000 + Math.random() * 2000);
    return () => clearInterval(iv);
  }, [t.name]);
  if (t.name === "clean") {
    return <span style={{ fontFamily: t.fontSans, fontWeight: 800, fontSize: 20, letterSpacing: 1, color: t.text }}>{text}</span>;
  }
  return (
    <span style={{ fontFamily: t.fontMono, fontWeight: 900, fontSize: 20, letterSpacing: 4, color: t.accent, textShadow: glitch ? `2px 0 ${t.magenta}, -2px 0 ${t.cyan}` : `0 0 20px ${t.accent}40`, transition: "text-shadow 0.05s", display: "inline-block", transform: glitch ? `translate(${Math.random() * 2 - 1}px, ${Math.random() * 2 - 1}px)` : "none" }}>
      {text}
    </span>
  );
}

// ─── THEME TOGGLE ────────────────────────────────────────────────────────────

function ThemeToggle({ theme, onToggle }) {
  const t = useT();
  const isClean = theme === "clean";
  if (t.name === "clean") {
    return (
      <button onClick={onToggle} title="Switch to HUD theme" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 99, cursor: "pointer", fontFamily: t.fontSans, fontSize: 11, fontWeight: 600, color: t.textSub, transition: "all 0.2s" }}>
        <span style={{ fontSize: 13 }}>⚡</span> HUD MODE
      </button>
    );
  }
  return (
    <button onClick={onToggle} title="Switch to clean theme" style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "transparent", border: `1px solid ${t.accent}40`, cursor: "pointer", fontFamily: t.fontMono, fontSize: 9, letterSpacing: 2, color: t.accent, transition: "all 0.2s" }}>
      <span style={{ fontSize: 12 }}>◈</span> CLEAN MODE
    </button>
  );
}

// ─── NODE CARD ───────────────────────────────────────────────────────────────

function NodeCard({ node }) {
  const t = useT();
  const sc = statusColor(node.status, t);
  return (
    <Card hoverAccent={sc} style={{ padding: 16, minHeight: 110, position: "relative" }}>
      <div style={{ position: "absolute", top: 12, right: 12 }}><StatusDot status={node.status} /></div>
      <div style={{ fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, fontSize: 9, letterSpacing: t.name === "clean" ? 1 : 3, color: t.textLabel, marginBottom: 6, textTransform: "uppercase", fontWeight: t.name === "clean" ? 600 : 400 }}>{node.type}</div>
      <div style={{ fontFamily: t.name === "clean" ? t.fontSans : t.fontSans, fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 4 }}>{node.name}</div>
      <div style={{ fontSize: 11, color: t.textSub, lineHeight: 1.6, whiteSpace: "pre-line" }}>{node.detail}</div>
      {node.tag && <div style={{ marginTop: 8 }}><Tag status={node.status} label={node.tag} /></div>}
    </Card>
  );
}

// ─── REVENUE CARD ────────────────────────────────────────────────────────────

function RevenueCard({ r }) {
  const t = useT();
  return (
    <Card style={{ padding: "16px 18px", textAlign: "center" }}>
      <div style={{ fontFamily: t.fontMono, fontWeight: 900, fontSize: 26, color: t.gold, textShadow: t.name === "hud" ? `0 0 20px ${t.gold}30` : "none" }}>{r.amount}</div>
      <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: 1, marginTop: 2, fontFamily: t.fontSans }}>{r.label}</div>
      <div style={{ fontSize: 11, color: t.textSub, marginTop: 6, fontFamily: t.fontSans }}>{r.source}</div>
    </Card>
  );
}

// ─── PROJECT CARD ────────────────────────────────────────────────────────────

function ProjectCard({ project, accent }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const sc = statusColor(project.status, t);
  const a = accent || sc;
  return (
    <div onClick={() => setOpen(!open)} style={{ border: `1px solid ${open ? a + "40" : t.border}`, padding: "14px 16px", background: open ? (t.name === "clean" ? t.surfaceAlt : `${a}06`) : t.surface, cursor: "pointer", transition: "all 0.2s", marginBottom: 8, borderRadius: t.radius }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{project.icon}</span>
          <span style={{ fontFamily: t.fontSans, fontWeight: 700, fontSize: 14, color: t.text }}>{project.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusDot status={project.status} size={6} />
          <Tag status={project.status} label={project.status} />
          <span style={{ color: t.textMuted, fontSize: 12, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
        </div>
      </div>
      {open && <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.border}`, fontSize: 12, color: t.textSub, lineHeight: 1.7 }}>{project.desc}</div>}
    </div>
  );
}

// ─── THREE JOBS PANEL ────────────────────────────────────────────────────────

function ThreeJobsPanel() {
  const t = useT();
  const [open, setOpen] = useState(null);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {THREE_JOBS.map((job, i) => {
          const color = jobColor(job.color, t);
          return (
            <div key={i} onClick={() => setOpen(open === i ? null : i)}
              style={{ border: `1px solid ${open === i ? color + "50" : color + "25"}`, padding: 18, background: open === i ? (t.name === "clean" ? t.surfaceAlt : `${color}06`) : (t.name === "clean" ? t.surface : `${color}04`), cursor: "pointer", transition: "all 0.2s", borderRadius: t.radius, boxShadow: open === i ? (t.name === "clean" ? t.shadowHover : `0 0 20px ${color}15`) : (t.name === "clean" ? t.shadow : "none") }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: t.fontMono, fontSize: 26, fontWeight: 900, color: t.name === "clean" ? color + "60" : color + "40", lineHeight: 1 }}>JOB {job.num}</div>
                  <div style={{ fontFamily: t.fontSans, fontWeight: 800, fontSize: 16, color: t.text, marginTop: 4 }}>{job.title}</div>
                  <div style={{ fontSize: 9, color, fontFamily: t.fontMono, letterSpacing: 2, marginTop: 4 }}>{job.status}</div>
                </div>
                <StatusDot status={job.status === "ACTIVE" ? "active" : "pending"} size={8} />
              </div>
              {open === i && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${color}20` }}>
                  {job.detail && <div style={{ fontSize: 12, color: t.textSub, lineHeight: 1.7, marginBottom: 8, fontFamily: t.fontSans }}>{job.detail}</div>}
                  {job.blocker && <div style={{ fontSize: 10, color: t.red, fontFamily: t.fontMono, letterSpacing: 1 }}>⚠ {job.blocker}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TAB VIEWS ───────────────────────────────────────────────────────────────

function InfrastructureView() {
  const t = useT();
  return (
    <div>
      <SectionHeader>Three Jobs — Current Situation</SectionHeader>
      <ThreeJobsPanel />
      <SectionHeader>Revenue Paths</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {REVENUE_PATHS.map((r, i) => <RevenueCard key={i} r={r} />)}
      </div>
      <SectionHeader>Content Infrastructure</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {CONTENT_NODES.map((n, i) => <NodeCard key={i} node={n} />)}
      </div>
    </div>
  );
}

function ProjectsView() {
  const t = useT();
  return (
    <div>
      <SectionHeader>External Projects — Revenue Generating</SectionHeader>
      {EXTERNAL_PROJECTS.map((p, i) => <ProjectCard key={i} project={p} accent={t.magenta} />)}
      <SectionHeader>Internal Projects — System Building</SectionHeader>
      {INTERNAL_PROJECTS.map((p, i) => <ProjectCard key={i} project={p} accent={t.cyan} />)}
      <SectionHeader>AI Outsource Mini-Projects</SectionHeader>
      {MINI_PROJECTS.map((p, i) => (
        <div key={i} style={{ border: `1px solid ${t.border}`, padding: "12px 16px", marginBottom: 6, background: t.surface, borderRadius: t.radius }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: t.textSub, fontFamily: t.fontSans }}>▸ {p.name}</span>
            <Tag status="queued" label={p.status} />
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, fontFamily: t.fontSans }}>{p.desc}</div>
        </div>
      ))}
    </div>
  );
}

function PlayerView() {
  const t = useT();
  const activeContent = CONTENT_NODES.filter(n => n.status === "active").length;
  const totalContent = CONTENT_NODES.length;
  const totalProjects = EXTERNAL_PROJECTS.length + INTERNAL_PROJECTS.length;
  const startedProjects = [...EXTERNAL_PROJECTS, ...INTERNAL_PROJECTS].filter(p => p.status !== "not started" && p.status !== "uncreated").length;

  return (
    <div>
      {/* Player Card */}
      <div style={{ border: `1px solid ${t.name === "clean" ? t.border : t.accent + "25"}`, padding: 24, background: t.name === "clean" ? t.surface : `linear-gradient(135deg, ${t.cyan}05, ${t.magenta}03)`, borderRadius: t.radius, boxShadow: t.name === "clean" ? t.shadow : "none", position: "relative", overflow: "hidden" }}>
        {t.name === "hud" && <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: `radial-gradient(circle, ${t.cyan}06, transparent)` }} />}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 72, height: 72, border: `2px solid ${t.name === "clean" ? t.border : t.accent + "40"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, background: t.name === "clean" ? t.surfaceAlt : `${t.cyan}08`, flexShrink: 0, borderRadius: t.name === "clean" ? "50%" : 0 }}>⚡</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, fontSize: t.name === "clean" ? 9 : 8, letterSpacing: t.name === "clean" ? 2 : 4, color: t.textLabel, fontWeight: t.name === "clean" ? 600 : 400, textTransform: "uppercase" }}>OPERATOR</div>
            <div style={{ fontFamily: t.fontSans, fontWeight: 900, fontSize: 26, color: t.text, marginBottom: 2, marginTop: 2 }}>USER</div>
            <div style={{ fontSize: 12, color: t.gold, fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, letterSpacing: t.name === "clean" ? 1 : 2, fontWeight: t.name === "clean" ? 600 : 400 }}>YOUR BRAND — FOUNDER</div>
            <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
              {[["—", "DAY", t.cyan], ["—", "FOLLOWERS", t.gold], ["—", "LIKES", t.green], ["—", "BOOKMARKS", t.magenta]].map(([val, lbl, col], i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: col, fontFamily: t.fontMono }}>{val}</div>
                  <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: 2, fontFamily: t.fontSans, fontWeight: 600, textTransform: "uppercase" }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <ProgressBar label="Content Channels" value={activeContent} max={totalContent} color={t.green} />
          <ProgressBar label="Projects Activated" value={startedProjects} max={totalProjects} color={t.magenta} />
        </div>
      </div>

      <SectionHeader>Operator Identity</SectionHeader>
      <div style={{ border: `1px solid ${t.border}`, background: t.surface, borderRadius: t.radius, overflow: "hidden", boxShadow: t.name === "clean" ? t.shadow : "none" }}>
        {t.name === "clean"
          ? <div style={{ height: 3, background: `linear-gradient(90deg, ${t.gold}, ${t.ember}, ${t.accent})`, opacity: 0.7 }} />
          : <div style={{ height: 2, background: `linear-gradient(90deg, ${t.gold}, ${t.magenta}, ${t.cyan})`, opacity: 0.6 }} />}
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { label: "GIFTS", color: t.green, content: "Your unique gifts..." },
              { label: "PURPOSE", color: t.cyan, content: "Your purpose..." },
              { label: "BACKGROUND", color: t.magenta, content: "Your background..." },
              { label: "IDEOLOGY", color: t.gold, content: "Your values..." },
            ].map((card, i) => (
              <div key={i} style={{ border: `1px solid ${card.color + (t.name === "clean" ? "25" : "15")}`, padding: 14, background: card.color + (t.name === "clean" ? "08" : "04"), borderRadius: t.radiusSm }}>
                <div style={{ fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, fontSize: 9, letterSpacing: 2, color: card.color, marginBottom: 6, fontWeight: 700, textTransform: "uppercase" }}>◆ {card.label}</div>
                <div style={{ fontSize: 12, color: t.textMuted, fontStyle: "italic", fontFamily: t.fontSans }}>{card.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionHeader>Mental Highlight Reel</SectionHeader>
      <div style={{ border: `1px dashed ${t.border}`, padding: 24, textAlign: "center", background: t.name === "clean" ? t.surfaceAlt : "rgba(255,215,0,0.01)", borderRadius: t.radius }}>
        <div style={{ fontSize: 24 }}>🏆</div>
        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8, fontFamily: t.fontSans, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Accomplishments Tracking — Coming Soon</div>
        <div style={{ fontSize: 11, color: t.textLabel, marginTop: 4, fontFamily: t.fontSans }}>Every win gets logged here under your player profile.</div>
      </div>

      <SectionHeader>Content Infrastructure</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {CONTENT_NODES.map((n, i) => <NodeCard key={i} node={n} />)}
      </div>
    </div>
  );
}

function GameBlocksView() {
  const t = useT();
  return (
    <div>
      <SectionHeader>Master Block — Framework</SectionHeader>
      <div style={{ border: `1px solid ${t.red + (t.name === "clean" ? "30" : "20")}`, padding: 16, background: t.red + (t.name === "clean" ? "08" : "04"), borderRadius: t.radius }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <StatusDot status="pending" />
          <span style={{ fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, fontSize: 11, color: t.red, letterSpacing: t.name === "clean" ? 1 : 2, fontWeight: 700, textTransform: "uppercase" }}>Main Problem</span>
        </div>
        <div style={{ fontSize: 13, color: t.textMuted, fontStyle: "italic", fontFamily: t.fontSans }}>Define your main problem and meta-problem here...</div>
      </div>

      <SectionHeader>Operating Principles</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {[1, 2, 3, 4].map(i => (
          <Card key={i} style={{ padding: 14 }}>
            <div style={{ fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, fontSize: t.name === "clean" ? 10 : 10, color: t.gold, letterSpacing: t.name === "clean" ? 1 : 2, marginBottom: 6, fontWeight: 700, textTransform: "uppercase" }}>Principle {i}</div>
            <div style={{ fontSize: 11, color: t.textMuted, fontStyle: "italic", fontFamily: t.fontSans }}>Describe this operating principle...</div>
          </Card>
        ))}
      </div>

      <SectionHeader>Prompts Vault</SectionHeader>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ border: `1px solid ${t.border}`, padding: "10px 14px", marginBottom: 6, background: t.name === "clean" ? t.surface : "rgba(0,240,255,0.02)", fontSize: 12, color: t.textMuted, fontFamily: t.fontSans, lineHeight: 1.6, fontStyle: "italic", borderRadius: t.radius }}>
          <span style={{ color: t.accent, marginRight: 8, fontStyle: "normal" }}>›</span>Your prompt {i}...
        </div>
      ))}

      <SectionHeader>External Services</SectionHeader>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {["Service 1", "Service 2", "Service 3"].map((s, i) => (
          <div key={i} style={{ border: `1px solid ${t.border}`, padding: "8px 14px", fontSize: 11, color: t.textSub, fontFamily: t.fontSans, borderRadius: t.radius, background: t.surface }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentsView() {
  const t = useT();
  const deployed = AGENTS.filter(a => a.status === "deployed").length;
  const building = AGENTS.filter(a => a.status === "in progress").length;
  const standby = AGENTS.filter(a => a.status === "not deployed").length;

  return (
    <div>
      {/* Summary bar */}
      <div style={{ border: `1px solid ${t.name === "clean" ? t.border : t.violet + "30"}`, padding: "14px 18px", marginBottom: 20, background: t.name === "clean" ? t.surface : `${t.violet}06`, borderRadius: t.radius, boxShadow: t.name === "clean" ? t.shadow : "none", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚔</span>
          <div>
            <div style={{ fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, fontSize: t.name === "clean" ? 12 : 10, color: t.name === "clean" ? t.text : t.violet, letterSpacing: t.name === "clean" ? 0.5 : 3, fontWeight: 700 }}>Agent Command Center</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2, fontFamily: t.fontSans }}>AI units deployed. Click any agent to inspect.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[{ label: "DEPLOYED", val: deployed, color: t.green }, { label: "BUILDING", val: building, color: t.cyan }, { label: "STANDBY", val: standby, color: t.textLabel }].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 20, fontWeight: 900, color, textShadow: t.name === "hud" && color !== t.textLabel ? `0 0 10px ${color}40` : "none" }}>{val}</div>
              <div style={{ fontFamily: t.fontSans, fontSize: 9, color: t.textMuted, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent cards */}
      {[{ filter: "deployed", label: "Deployed — Active Units", color: t.green }, { filter: "in progress", label: "In Progress — Under Construction", color: t.cyan }, { filter: "not deployed", label: "Not Deployed — Awaiting Resources", color: t.textLabel }].map(({ filter, label, color }) => {
        const agents = AGENTS.filter(a => a.status === filter);
        if (!agents.length) return null;
        return (
          <div key={filter}>
            <SectionHeader color={color}>{label}</SectionHeader>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 12, marginBottom: 8 }}>
              {agents.map((agent, i) => {
                const agentColor = jobColor(agent.colorKey, t);
                return <AgentCard key={i} agent={agent} color={agentColor} />;
              })}
            </div>
          </div>
        );
      })}

      {/* Unlock chain */}
      <SectionHeader color={t.gold}>Unlock Chain — Deploy Order</SectionHeader>
      <div style={{ border: `1px solid ${t.name === "clean" ? t.border : "rgba(255,215,0,0.12)"}`, padding: 16, background: t.name === "clean" ? t.surface : "rgba(255,215,0,0.02)", borderRadius: t.radius, boxShadow: t.name === "clean" ? t.shadow : "none" }}>
        {AGENTS.map((agent, i) => {
          const color = jobColor(agent.colorKey, t);
          return (
            <div key={i} style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: i < AGENTS.length - 1 ? `1px solid ${t.border}` : "none", alignItems: "flex-start" }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 18, fontWeight: 900, color: color + "60", flexShrink: 0, minWidth: 32 }}>0{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.fontSans, fontWeight: 700, fontSize: 13, color: t.text }}>{agent.name}</div>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2, fontFamily: t.fontSans }}>Deploy this agent — define what it unlocks</div>
                <div style={{ fontSize: 10, color, fontFamily: t.fontMono, letterSpacing: 1, marginTop: 4 }}>→ UNLOCKS: Describe what deploying this agent enables</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgentCard({ agent, color }) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  return (
    <div onClick={() => setExpanded(!expanded)} style={{ border: `1px solid ${expanded ? color + "50" : color + "25"}`, background: expanded ? (t.name === "clean" ? t.surfaceAlt : `${color}08`) : (t.name === "clean" ? t.surface : `${color}03`), cursor: "pointer", transition: "all 0.2s", borderRadius: t.radius, overflow: "hidden", boxShadow: t.name === "clean" ? (expanded ? t.shadowHover : t.shadow) : "none" }}>
      <div style={{ height: t.name === "clean" ? 3 : 2, background: color, opacity: agent.status === "deployed" ? (t.name === "clean" ? 0.7 : 1) : 0.3, boxShadow: t.name === "hud" && agent.status === "deployed" ? `0 0 8px ${color}` : "none" }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: color + "10", flexShrink: 0, borderRadius: t.name === "clean" ? "50%" : 0 }}>{agent.icon}</div>
            <div>
              <div style={{ fontFamily: t.fontSans, fontWeight: 800, fontSize: 16, color: t.text }}>{agent.name}</div>
              <div style={{ fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, fontSize: 9, color, letterSpacing: t.name === "clean" ? 1 : 3, marginTop: 2, fontWeight: 600, textTransform: "uppercase" }}>{agent.subtitle}</div>
              <div style={{ fontFamily: t.fontSans, fontSize: 10, color: t.textMuted, marginTop: 2 }}>{agent.role}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <StatusDot status={agent.status} size={7} />
              <Tag status={agent.status} label={agent.status} />
            </div>
            <span style={{ color: t.textMuted, fontSize: 11, transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[{ label: "⚡ COST / UPKEEP", color: t.red, main: agent.cost, sub: agent.upkeep }, { label: "💰 REVENUE", color: t.gold, main: agent.revenue, sub: "" }].map((info, i) => (
            <div key={i} style={{ border: `1px solid ${t.border}`, padding: "8px 10px", background: t.name === "clean" ? t.surfaceAlt : "rgba(255,255,255,0.02)", borderRadius: t.radiusSm }}>
              <div style={{ fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, fontSize: 8, color: info.color, letterSpacing: 1, marginBottom: 4, fontWeight: 700, textTransform: "uppercase" }}>{info.label}</div>
              <div style={{ fontSize: 10, color: t.textSub, lineHeight: 1.5, fontFamily: t.fontSans }}>{info.main}</div>
              {info.sub && <div style={{ fontSize: 9, color: t.textMuted, marginTop: 2, fontFamily: t.fontSans }}>{info.sub}</div>}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          <span style={{ fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, fontSize: 9, color: t.textLabel, letterSpacing: 1, alignSelf: "center", fontWeight: 600, textTransform: "uppercase" }}>Requires:</span>
          {agent.resources.map((r, i) => (
            <span key={i} style={{ fontSize: 9, color: t.textSub, border: `1px solid ${t.border}`, padding: "2px 8px", fontFamily: t.fontSans, borderRadius: t.radiusSm, background: t.surfaceAlt }}>{r}</span>
          ))}
        </div>
        {expanded && <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.border}`, fontSize: 12, color: t.textSub, lineHeight: 1.8, fontFamily: t.fontSans }}>{agent.desc}</div>}
      </div>
    </div>
  );
}

function CodexView() {
  const t = useT();
  return (
    <div>
      <div style={{ border: `1px solid ${t.name === "clean" ? t.border : t.ember + "25"}`, padding: 14, marginBottom: 20, background: t.name === "clean" ? t.surface : `${t.ember}06`, borderRadius: t.radius, boxShadow: t.name === "clean" ? t.shadow : "none", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>📜</span>
        <div>
          <div style={{ fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, fontSize: t.name === "clean" ? 13 : 10, letterSpacing: t.name === "clean" ? 0.5 : 3, color: t.name === "clean" ? t.text : t.ember, fontWeight: 700 }}>Codex — Full Operating Reference</div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2, fontFamily: t.fontSans }}>Your backend context + operating manual.</div>
        </div>
      </div>
      <CollapseSection title="Your Operating System" accent={t.gold}>
        <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.8, fontStyle: "italic", fontFamily: t.fontSans }}>
          Describe your operating system, framework, or philosophy here. This is your private reference — the mental model that drives everything.
        </div>
      </CollapseSection>
    </div>
  );
}

function PlaceholderView({ icon, label }) {
  const t = useT();
  return (
    <div style={{ border: `1px solid ${t.border}`, padding: 40, textAlign: "center", background: t.name === "clean" ? t.surface : "rgba(255,255,255,0.01)", borderRadius: t.radius, boxShadow: t.name === "clean" ? t.shadow : "none" }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 2, fontFamily: t.fontSans, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 12, color: t.textLabel, letterSpacing: 1, marginTop: 6 }}>— Coming Soon —</div>
    </div>
  );
}

// ─── NAV TAB ─────────────────────────────────────────────────────────────────

function NavTab({ label, active, onClick, accent }) {
  const t = useT();
  const c = accent || t.accent;
  if (t.name === "clean") {
    return (
      <button onClick={onClick} style={{ background: active ? t.surface : "transparent", border: `1px solid ${active ? t.borderStrong : t.border}`, color: active ? t.text : t.textMuted, fontFamily: t.fontSans, fontSize: 11, fontWeight: active ? 700 : 500, letterSpacing: 0.5, padding: "8px 16px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s", borderRadius: t.radius, boxShadow: active ? t.shadow : "none" }}>
        {label}
      </button>
    );
  }
  return (
    <button onClick={onClick} style={{ background: active ? `${c}12` : "transparent", border: `1px solid ${active ? c + "50" : t.border}`, color: active ? c : t.textMuted, fontFamily: t.fontMono, fontSize: 10, letterSpacing: 3, padding: "8px 16px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.3s", position: "relative", textShadow: active ? `0 0 8px ${c}40` : "none" }}>
      {active && <div style={{ position: "absolute", top: -1, left: 10, right: 10, height: 2, background: c, boxShadow: `0 0 8px ${c}` }} />}
      {label}
    </button>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "infra", label: "Infrastructure", accentKey: "cyan" },
  { id: "projects", label: "Projects", accentKey: "magenta" },
  { id: "agents", label: "Agents", accentKey: "violet" },
  { id: "player", label: "Player Profile", accentKey: "gold" },
  { id: "game", label: "Game Blocks", accentKey: "green" },
  { id: "codex", label: "Codex", accentKey: "ember" },
  { id: "research", label: "Field Research", accentKey: "cyan" },
  { id: "strategies", label: "Strategies", accentKey: "gold" },
];

export default function AppTemplate() {
  const [activeTab, setActiveTab] = useState("infra");
  const [time, setTime] = useState(new Date());
  const [themeName, setThemeName] = useState("clean");
  const t = themeName === "clean" ? CLEAN : HUD;

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const renderView = () => {
    switch (activeTab) {
      case "infra": return <InfrastructureView />;
      case "projects": return <ProjectsView />;
      case "agents": return <AgentsView />;
      case "player": return <PlayerView />;
      case "game": return <GameBlocksView />;
      case "codex": return <CodexView />;
      case "research": return <PlaceholderView icon="🔭" label="Field Research" />;
      case "strategies": return <PlaceholderView icon="♟️" label="Strategies" />;
      default: return <InfrastructureView />;
    }
  };

  return (
    <ThemeCtx.Provider value={t}>
      <div style={{ background: t.bg, color: t.text, fontFamily: t.fontSans, minHeight: "100vh", transition: "background 0.3s, color 0.3s" }}>
        {t.name === "hud" && <><div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 9999, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)" }} /><div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} /></>}

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

          {/* HEADER */}
          <div style={{ border: `1px solid ${t.name === "clean" ? t.border : "rgba(0,240,255,0.2)"}`, padding: "14px 20px", marginBottom: 8, background: t.name === "clean" ? t.surface : "rgba(0,240,255,0.03)", borderRadius: t.name === "clean" ? t.radius : 0, boxShadow: t.name === "clean" ? t.shadow : "none", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            {t.name === "hud" && <div style={{ position: "absolute", top: -1, left: 20, width: 200, height: 2, background: t.accent, boxShadow: `0 0 10px ${t.accent}` }} />}
            <div>
              <GlitchTitle text="COMMAND CENTER" />
              <div style={{ fontSize: t.name === "clean" ? 11 : 10, letterSpacing: t.name === "clean" ? 1 : 3, color: t.textMuted, marginTop: 2, fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, textTransform: "uppercase" }}>Operator HUD — Your Operating System</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 16, fontSize: 11, color: t.textMuted, fontFamily: t.name === "clean" ? t.fontSans : t.fontMono }}>
                <span>Day <strong style={{ color: t.gold }}>—</strong></span>
                <span>{time.toLocaleTimeString("en-US", { hour12: false })}</span>
              </div>
              <ThemeToggle theme={themeName} onToggle={() => setThemeName(n => n === "clean" ? "hud" : "clean")} />
            </div>
          </div>

          {/* QUEST BAR */}
          <div style={{ border: `1px solid ${t.name === "clean" ? t.border : t.magenta + "30"}`, padding: "8px 16px", marginBottom: 10, background: t.name === "clean" ? t.surfaceAlt : `${t.magenta}05`, borderRadius: t.name === "clean" ? t.radius : 0, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, fontSize: 9, color: t.magenta, border: `1px solid ${t.magenta + (t.name === "clean" ? "40" : "")}`, padding: "2px 8px", letterSpacing: 2, textShadow: t.name === "hud" ? `0 0 8px ${t.magenta}` : "none", borderRadius: t.name === "clean" ? 99 : 0, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}>QUEST</span>
            <span style={{ fontSize: t.name === "clean" ? 13 : 13, color: t.textSub, fontStyle: t.name === "clean" ? "italic" : "normal", fontFamily: t.fontSans }}>Define your main quest here...</span>
          </div>

          {/* NAV TABS */}
          <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" }}>
            {TABS.map(tab => (
              <NavTab key={tab.id} label={tab.label} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} accent={t[tab.accentKey]} />
            ))}
          </div>

          {/* CONTENT */}
          <div style={{ minHeight: 400 }}>{renderView()}</div>

          {/* FOOTER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, paddingTop: 14, borderTop: `1px solid ${t.border}`, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 16 }}>
              {[{ c: t.green, l: "Active" }, { c: t.cyan, l: "Building" }, { c: t.magenta, l: "New" }, { c: t.ember, l: "Pending" }, { c: t.textLabel, l: "Dormant" }].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.c }} />
                  <span style={{ fontSize: 9, color: t.textLabel, fontFamily: t.fontSans, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{item.l}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 9, color: t.textLabel, fontFamily: t.name === "clean" ? t.fontSans : t.fontMono, letterSpacing: t.name === "clean" ? 1 : 2, textTransform: "uppercase" }}>Command Center — Template v1.0</div>
          </div>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
