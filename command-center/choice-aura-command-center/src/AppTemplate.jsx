// ─── COMMAND CENTER TEMPLATE ────────────────────────────────────────────────
// Blank starter template. Replace placeholder text with your own data.
// Rename to App.jsx (or import in main.jsx) to activate.
// ────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const CYAN = "#00f0ff";
const MAGENTA = "#ff0066";
const GOLD = "#ffd700";
const EMBER = "#ff6a00";
const GREEN = "#00ff88";
const RED = "#ff2244";
const VIOLET = "#a855f7";
const TEAL = "#00d4aa";
const LIME = "#aaff00";
const BG = "#0a0a0f";

// ─── DATA ────────────────────────────────────────────────────────────────────

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
  { num: "01", title: "Job Title", color: "#00ff88", status: "ACTIVE", unlock: "", detail: "Describe what this job is and how it generates revenue.", blocker: null },
  { num: "02", title: "Job Title", color: "#ff6a00", status: "PENDING", unlock: "", detail: "Describe what this job is and what it needs to get started.", blocker: null },
  { num: "03", title: "Job Title", color: "#ff6a00", status: "PENDING", unlock: "", detail: "Describe what this job is and what it needs to get started.", blocker: null },
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
  {
    name: "Agent Name",
    subtitle: "Agent Role",
    icon: "🤖",
    status: "deployed",
    color: GREEN,
    role: "What this agent does",
    cost: "Cost to run",
    upkeep: "Ongoing costs",
    revenue: "How it generates revenue",
    resources: ["Resource 1", "Resource 2"],
    sub_agents: [],
    desc: "Describe what this agent does, how it works, and what value it creates.",
  },
  {
    name: "Agent Name",
    subtitle: "Agent Role",
    icon: "🔨",
    status: "in progress",
    color: CYAN,
    role: "What this agent does",
    cost: "Cost to run",
    upkeep: "Ongoing costs",
    revenue: "How it generates revenue",
    resources: ["Resource 1", "Resource 2"],
    sub_agents: [],
    desc: "Describe what this agent does, how it works, and what value it creates.",
  },
  {
    name: "Agent Name",
    subtitle: "Agent Role",
    icon: "⏳",
    status: "not deployed",
    color: EMBER,
    role: "What this agent does",
    cost: "Cost to run",
    upkeep: "Ongoing costs",
    revenue: "How it generates revenue",
    resources: ["Resource 1", "Resource 2"],
    sub_agents: [],
    desc: "Describe what this agent does, how it works, and what value it creates.",
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const statusColor = (s) => {
  if (s === "active" || s === "live" || s === "deployed") return GREEN;
  if (s === "in progress") return CYAN;
  if (s === "complete") return GOLD;
  if (s === "new" || s === "just unlocked") return MAGENTA;
  if (s === "pending" || s === "planning" || s === "due tonight" || s === "scheduled") return EMBER;
  if (s === "not started" || s === "uncreated" || s === "queued" || s === "not deployed") return "rgba(255,255,255,0.2)";
  return "rgba(255,255,255,0.15)";
};

const tagStyle = (s) => {
  const c = statusColor(s);
  return { color: c, borderColor: c, border: `1px solid ${c}`, padding: "2px 8px", fontSize: 9, letterSpacing: 2, fontFamily: "'Courier New', monospace", textTransform: "uppercase", display: "inline-block" };
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Scanlines() {
  return <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 9999, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)" }} />;
}

function GridBG() {
  return <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />;
}

function GlitchText({ text, fontSize = 24, color = CYAN }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 150); }, 3000 + Math.random() * 2000);
    return () => clearInterval(iv);
  }, []);
  return <span style={{ fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize, letterSpacing: 4, color, textShadow: glitch ? `2px 0 ${MAGENTA}, -2px 0 ${CYAN}` : `0 0 20px ${color}40`, transition: "text-shadow 0.05s", display: "inline-block", transform: glitch ? `translate(${Math.random() * 2 - 1}px, ${Math.random() * 2 - 1}px)` : "none" }}>{text}</span>;
}

function PulsingDot({ color, size = 8 }) {
  const [opacity, setOpacity] = useState(1);
  useEffect(() => {
    let frame;
    const animate = () => { setOpacity(0.4 + 0.6 * Math.abs(Math.sin(Date.now() / 1000))); frame = requestAnimationFrame(animate); };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color, boxShadow: `0 0 ${size}px ${color}`, opacity, flexShrink: 0 }} />;
}

function NavTab({ label, active, onClick, accent = CYAN }) {
  return (
    <button onClick={onClick} style={{ background: active ? `${accent}12` : "transparent", border: `1px solid ${active ? accent + "50" : "rgba(255,255,255,0.08)"}`, color: active ? accent : "rgba(255,255,255,0.4)", fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 3, padding: "8px 16px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.3s", position: "relative", textShadow: active ? `0 0 8px ${accent}40` : "none" }}>
      {active && <div style={{ position: "absolute", top: -1, left: 10, right: 10, height: 2, background: accent, boxShadow: `0 0 8px ${accent}` }} />}
      {label}
    </button>
  );
}

function SectionHeader({ children, color = CYAN }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 14px", paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ width: 6, height: 6, background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
      <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, letterSpacing: 5, color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

function NodeCard({ node }) {
  const [hovered, setHovered] = useState(false);
  const sc = statusColor(node.status);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ border: `1px solid ${hovered ? CYAN + "40" : "rgba(255,255,255,0.08)"}`, padding: 16, position: "relative", background: hovered ? `${CYAN}06` : "rgba(255,255,255,0.015)", transition: "all 0.3s", transform: hovered ? "translateY(-2px)" : "none", minHeight: 120 }}>
      <div style={{ position: "absolute", top: 10, right: 12 }}><PulsingDot color={sc} /></div>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, letterSpacing: 3, color: "rgba(255,255,255,0.2)", marginBottom: 6, textTransform: "uppercase" }}>{node.type}</div>
      <div style={{ fontFamily: "system-ui", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 4 }}>{node.name}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{node.detail}</div>
      {node.tag && <div style={{ ...tagStyle(node.status), marginTop: 8 }}>{node.tag}</div>}
    </div>
  );
}

function RevenueCard({ r }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ border: `1px solid ${hovered ? GOLD + "40" : "rgba(255,215,0,0.15)"}`, padding: "14px 18px", background: hovered ? "rgba(255,215,0,0.04)" : "rgba(255,215,0,0.02)", transition: "all 0.3s", textAlign: "center", transform: hovered ? "translateY(-2px)" : "none" }}>
      <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 26, color: GOLD, textShadow: `0 0 20px ${GOLD}30` }}>{r.amount}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginTop: 2 }}>{r.label}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 6, fontFamily: "system-ui" }}>{r.source}</div>
    </div>
  );
}

function ProjectCard({ project, accent = CYAN }) {
  const [open, setOpen] = useState(false);
  const sc = statusColor(project.status);
  return (
    <div onClick={() => setOpen(!open)} style={{ border: `1px solid ${open ? accent + "30" : "rgba(255,255,255,0.06)"}`, padding: "14px 16px", background: open ? `${accent}06` : "rgba(255,255,255,0.01)", cursor: "pointer", transition: "all 0.3s", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{project.icon}</span>
          <span style={{ fontFamily: "system-ui", fontWeight: 700, fontSize: 14, color: "#fff" }}>{project.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PulsingDot color={sc} size={6} />
          <span style={{ ...tagStyle(project.status) }}>{project.status}</span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
        </div>
      </div>
      {open && <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{project.desc}</div>}
    </div>
  );
}

function ProgressBar({ value, max, color = CYAN, label }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 1, fontFamily: "'Courier New', monospace" }}>{label}</span>
        <span style={{ fontSize: 10, color, fontFamily: "'Courier New', monospace" }}>{value}/{max}</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}40`, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function CodexSection({ title, accent = EMBER, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 8 }}>
      <div onClick={() => setOpen(!open)} style={{ border: `1px solid ${open ? accent + "30" : "rgba(255,255,255,0.06)"}`, padding: "12px 16px", background: open ? `${accent}06` : "rgba(255,255,255,0.01)", cursor: "pointer", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 6, height: 6, background: accent, boxShadow: `0 0 6px ${accent}`, flexShrink: 0 }} />
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, letterSpacing: 3, color: open ? accent : "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{title}</span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
      </div>
      {open && <div style={{ border: `1px solid ${accent}15`, borderTop: "none", padding: 16, background: "rgba(255,255,255,0.01)" }}>{children}</div>}
    </div>
  );
}

// ─── TAB VIEWS ───────────────────────────────────────────────────────────────

function ThreeJobsPanel() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
        {THREE_JOBS.map((job, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{ border: `1px solid ${job.color}30`, padding: 16, background: `${job.color}05`, cursor: "pointer", transition: "all 0.3s", boxShadow: open === i ? `0 0 20px ${job.color}15` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 28, fontWeight: 900, color: `${job.color}40`, lineHeight: 1 }}>JOB {job.num}</div>
                <div style={{ fontFamily: "system-ui", fontWeight: 800, fontSize: 16, color: "#fff", marginTop: 4 }}>{job.title}</div>
                <div style={{ fontSize: 9, color: job.color, fontFamily: "'Courier New', monospace", letterSpacing: 2, marginTop: 4 }}>{job.status}</div>
              </div>
              <PulsingDot color={job.color} size={8} />
            </div>
            {open === i && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${job.color}20` }}>
                {job.detail && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 8 }}>{job.detail}</div>}
                {job.blocker && <div style={{ fontSize: 10, color: RED, fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>⚠ {job.blocker}</div>}
                {job.unlock && <div style={{ fontSize: 10, color: job.color, fontFamily: "'Courier New', monospace", letterSpacing: 1, marginTop: 6 }}>→ {job.unlock}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InfrastructureView() {
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
  return (
    <div>
      <SectionHeader>External Projects — Revenue Generating</SectionHeader>
      {EXTERNAL_PROJECTS.map((p, i) => <ProjectCard key={i} project={p} accent={MAGENTA} />)}
      <SectionHeader>Internal Projects — System Building</SectionHeader>
      {INTERNAL_PROJECTS.map((p, i) => <ProjectCard key={i} project={p} accent={CYAN} />)}
      <SectionHeader>AI Outsource Mini-Projects</SectionHeader>
      {MINI_PROJECTS.map((p, i) => (
        <div key={i} style={{ border: "1px solid rgba(255,255,255,0.05)", padding: "12px 16px", marginBottom: 6, background: "rgba(255,255,255,0.01)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "system-ui" }}>▸ {p.name}</span>
            <span style={tagStyle("queued")}>{p.status}</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>{p.desc}</div>
        </div>
      ))}
    </div>
  );
}

function PlayerView() {
  const activeContent = CONTENT_NODES.filter(n => n.status === "active").length;
  const totalContent = CONTENT_NODES.length;
  const totalProjects = EXTERNAL_PROJECTS.length + INTERNAL_PROJECTS.length;
  const startedProjects = [...EXTERNAL_PROJECTS, ...INTERNAL_PROJECTS].filter(p => p.status !== "not started" && p.status !== "uncreated").length;

  return (
    <div>
      <div style={{ border: `1px solid ${CYAN}25`, padding: 24, background: `linear-gradient(135deg, ${CYAN}05, ${MAGENTA}03)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: `radial-gradient(circle, ${CYAN}06, transparent)` }} />
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 80, height: 80, border: `2px solid ${CYAN}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, background: `${CYAN}08`, flexShrink: 0 }}>⚡</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, letterSpacing: 4, color: "rgba(255,255,255,0.2)" }}>OPERATOR</div>
            <div style={{ fontFamily: "system-ui", fontWeight: 900, fontSize: 28, color: "#fff", marginBottom: 2 }}>USER</div>
            <div style={{ fontSize: 12, color: GOLD, fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>YOUR BRAND — FOUNDER</div>
            <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
              {[["—", "DAY", CYAN], ["—", "FOLLOWERS", GOLD], ["—", "LIKES", GREEN], ["—", "BOOKMARKS", MAGENTA]].map(([val, lbl, col], i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: col, fontFamily: "'Courier New', monospace" }}>{val}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <ProgressBar label="CONTENT CHANNELS" value={activeContent} max={totalContent} color={GREEN} />
          <ProgressBar label="PROJECTS ACTIVATED" value={startedProjects} max={totalProjects} color={MAGENTA} />
        </div>
      </div>

      <SectionHeader>Operator Identity</SectionHeader>
      <div style={{ border: `1px solid ${GOLD}20`, background: `linear-gradient(160deg, rgba(255,215,0,0.03), rgba(255,0,102,0.02), rgba(0,240,255,0.02))`, overflow: "hidden" }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${GOLD}, ${MAGENTA}, ${CYAN})`, opacity: 0.6 }} />
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ width: 48, height: 48, border: `1px solid ${GOLD}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, background: `${GOLD}08`, flexShrink: 0 }}>🎤</div>
            <div>
              <div style={{ fontFamily: "system-ui", fontWeight: 900, fontSize: 20, color: "#fff" }}>USER</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 3, color: `${GOLD}90` }}>OPERATOR DOSSIER</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { label: "GIFTS", color: GREEN, content: <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Your unique gifts...</div> },
              { label: "PURPOSE", color: CYAN, content: <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Your purpose...</div> },
              { label: "BACKGROUND", color: MAGENTA, content: <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Your background...</div> },
              { label: "IDEOLOGY", color: GOLD, content: <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Your values...</div> },
            ].map((card, i) => (
              <div key={i} style={{ border: `1px solid ${card.color}15`, padding: 14, background: `${card.color}04` }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, letterSpacing: 3, color: card.color, marginBottom: 6 }}>◆ {card.label}</div>
                {card.content}
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionHeader>Mental Highlight Reel</SectionHeader>
      <div style={{ border: `1px dashed ${GOLD}20`, padding: 20, textAlign: "center", background: "rgba(255,215,0,0.01)" }}>
        <div style={{ fontSize: 24 }}>🏆</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8, fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>ACCOMPLISHMENTS TRACKING — COMING SOON</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>Every win gets logged here under your player profile.</div>
      </div>

      <SectionHeader>Content Infrastructure</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {CONTENT_NODES.map((n, i) => <NodeCard key={i} node={n} />)}
      </div>
    </div>
  );
}

function GameBlocksView() {
  return (
    <div>
      <SectionHeader>Master Block — Framework</SectionHeader>
      <div style={{ border: `1px solid ${RED}20`, padding: 16, background: `${RED}04` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <PulsingDot color={RED} />
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: RED, letterSpacing: 2 }}>MAIN PROBLEM</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Define your main problem and meta-problem here...</div>
      </div>

      <SectionHeader>Operating Principles</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ border: "1px solid rgba(255,215,0,0.12)", padding: 14, background: "rgba(255,215,0,0.02)" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: GOLD, letterSpacing: 2, marginBottom: 6 }}>PRINCIPLE {i}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Describe this operating principle...</div>
          </div>
        ))}
      </div>

      <SectionHeader>Prompts Vault</SectionHeader>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ border: "1px solid rgba(0,240,255,0.08)", padding: "10px 14px", marginBottom: 6, background: "rgba(0,240,255,0.02)", fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Courier New', monospace", lineHeight: 1.6, fontStyle: "italic" }}>
          <span style={{ color: CYAN, marginRight: 8 }}>›</span>Your prompt {i}...
        </div>
      ))}

      <SectionHeader>External Services</SectionHeader>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {["Service 1", "Service 2", "Service 3"].map((s, i) => (
          <div key={i} style={{ border: "1px solid rgba(255,255,255,0.06)", padding: "8px 14px", fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>{s}</div>
        ))}
      </div>
    </div>
  );
}

// ─── AGENTS VIEW ─────────────────────────────────────────────────────────────

function AgentCard({ agent }) {
  const [expanded, setExpanded] = useState(false);
  const sc = statusColor(agent.status);
  const isDeployed = agent.status === "deployed";

  return (
    <div onClick={() => setExpanded(!expanded)} style={{ border: `1px solid ${expanded ? agent.color + "50" : agent.color + "20"}`, background: expanded ? `${agent.color}08` : `${agent.color}03`, cursor: "pointer", transition: "all 0.3s", position: "relative", overflow: "hidden" }}>
      <div style={{ height: 2, background: agent.color, opacity: isDeployed ? 1 : 0.3, boxShadow: isDeployed ? `0 0 8px ${agent.color}` : "none" }} />
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, border: `1px solid ${agent.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, background: `${agent.color}10`, flexShrink: 0, boxShadow: isDeployed ? `0 0 12px ${agent.color}30` : "none" }}>
              {agent.icon}
            </div>
            <div>
              <div style={{ fontFamily: "system-ui", fontWeight: 900, fontSize: 18, color: "#fff", letterSpacing: 1 }}>{agent.name}</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: agent.color, letterSpacing: 3, marginTop: 2 }}>{agent.subtitle}</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: 2, marginTop: 2 }}>{agent.role}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <PulsingDot color={sc} size={7} />
              <span style={{ ...tagStyle(agent.status) }}>{agent.status}</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.06)", padding: "8px 10px", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: RED, letterSpacing: 2, marginBottom: 4 }}>⚡ COST / UPKEEP</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{agent.cost}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{agent.upkeep}</div>
          </div>
          <div style={{ border: "1px solid rgba(255,255,255,0.06)", padding: "8px 10px", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: GOLD, letterSpacing: 2, marginBottom: 4 }}>💰 REVENUE</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{agent.revenue}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: 2, alignSelf: "center" }}>REQUIRES:</span>
          {agent.resources.map((r, i) => (
            <span key={i} style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", padding: "2px 8px", fontFamily: "'Courier New', monospace" }}>{r}</span>
          ))}
        </div>
        {expanded && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${agent.color}20` }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>{agent.desc}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function AgentsView() {
  const deployed = AGENTS.filter(a => a.status === "deployed").length;
  const building = AGENTS.filter(a => a.status === "in progress").length;
  const standby = AGENTS.filter(a => a.status === "not deployed").length;

  return (
    <div>
      <div style={{ border: `1px solid ${VIOLET}30`, padding: "14px 18px", marginBottom: 20, background: `${VIOLET}06`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚔</span>
          <div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: VIOLET, letterSpacing: 3 }}>AGENT COMMAND CENTER</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>AI units deployed across the map. Click any agent to inspect.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {[
            { label: "DEPLOYED", val: deployed, color: GREEN },
            { label: "BUILDING", val: building, color: CYAN },
            { label: "STANDBY", val: standby, color: "rgba(255,255,255,0.25)" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 22, fontWeight: 900, color, textShadow: color !== "rgba(255,255,255,0.25)" ? `0 0 10px ${color}40` : "none" }}>{val}</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {deployed > 0 && (
        <>
          <SectionHeader color={GREEN}>Deployed — Active Units</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12, marginBottom: 8 }}>
            {AGENTS.filter(a => a.status === "deployed").map((a, i) => <AgentCard key={i} agent={a} />)}
          </div>
        </>
      )}
      {building > 0 && (
        <>
          <SectionHeader color={CYAN}>In Progress — Under Construction</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12, marginBottom: 8 }}>
            {AGENTS.filter(a => a.status === "in progress").map((a, i) => <AgentCard key={i} agent={a} />)}
          </div>
        </>
      )}
      {standby > 0 && (
        <>
          <SectionHeader color="rgba(255,255,255,0.2)">Not Deployed — Awaiting Resources</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12, marginBottom: 8 }}>
            {AGENTS.filter(a => a.status === "not deployed").map((a, i) => <AgentCard key={i} agent={a} />)}
          </div>
        </>
      )}

      <SectionHeader color={GOLD}>Unlock Chain — Deploy Order</SectionHeader>
      <div style={{ border: "1px solid rgba(255,215,0,0.12)", padding: 16, background: "rgba(255,215,0,0.02)" }}>
        {[
          { step: "01", label: AGENTS[0].name, detail: "Deploy this agent first — define what it unlocks", color: GREEN, unlocks: "Describe what deploying this agent enables" },
          { step: "02", label: AGENTS[1].name, detail: "Deploy this agent second", color: CYAN, unlocks: "Describe what deploying this agent enables" },
          { step: "03", label: AGENTS[2].name, detail: "Deploy this agent third", color: EMBER, unlocks: "Describe what deploying this agent enables" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "flex-start" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 20, fontWeight: 900, color: `${item.color}50`, flexShrink: 0, minWidth: 36 }}>{item.step}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "system-ui", fontWeight: 700, fontSize: 13, color: "#fff" }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{item.detail}</div>
              <div style={{ fontSize: 10, color: item.color, fontFamily: "'Courier New', monospace", letterSpacing: 1, marginTop: 4 }}>→ UNLOCKS: {item.unlocks}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodexView() {
  return (
    <div>
      <div style={{ border: `1px solid ${EMBER}25`, padding: 14, marginBottom: 20, background: `${EMBER}06`, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>📜</span>
        <div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 3, color: EMBER }}>CODEX — FULL OPERATING REFERENCE</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Your backend context + operating manual. Last updated: —</div>
        </div>
      </div>

      <CodexSection title="Your Operating System" accent={GOLD} defaultOpen={false}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, fontStyle: "italic" }}>
          Describe your operating system, framework, or philosophy here. This is your private reference — the mental model that drives everything.
        </div>
      </CodexSection>
    </div>
  );
}

function FieldResearchView() {
  return (
    <div>
      <div style={{ border: `1px solid ${TEAL}20`, padding: 40, textAlign: "center", background: `${TEAL}04` }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>🔭</div>
        <div style={{ fontSize: 11, color: TEAL, letterSpacing: 3, marginBottom: 8 }}>FIELD RESEARCH</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>— COMING SOON —</div>
      </div>
    </div>
  );
}

function StrategiesView() {
  return (
    <div>
      <div style={{ border: `1px solid ${LIME}20`, padding: 40, textAlign: "center", background: `${LIME}04` }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>♟️</div>
        <div style={{ fontSize: 11, color: LIME, letterSpacing: 3, marginBottom: 8 }}>STRATEGIES</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>— COMING SOON —</div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "infra", label: "Infrastructure", accent: CYAN },
  { id: "projects", label: "Projects", accent: MAGENTA },
  { id: "agents", label: "Agents", accent: VIOLET },
  { id: "player", label: "Player Profile", accent: GOLD },
  { id: "game", label: "Game Blocks", accent: GREEN },
  { id: "codex", label: "Codex", accent: EMBER },
  { id: "research", label: "Field Research", accent: TEAL },
  { id: "strategies", label: "Strategies", accent: LIME },
];

export default function AppTemplate() {
  const [activeTab, setActiveTab] = useState("infra");
  const [time, setTime] = useState(new Date());

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
      case "research": return <FieldResearchView />;
      case "strategies": return <StrategiesView />;
      default: return <InfrastructureView />;
    }
  };

  return (
    <div style={{ background: BG, color: "#e0e0e0", fontFamily: "'Courier New', monospace", minHeight: "100vh", overflow: "hidden" }}>
      <Scanlines />
      <GridBG />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
        {/* HUD TOP */}
        <div style={{ border: "1px solid rgba(0,240,255,0.2)", padding: "12px 20px", marginBottom: 6, background: "rgba(0,240,255,0.03)", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ position: "absolute", top: -1, left: 20, width: 200, height: 2, background: CYAN, boxShadow: `0 0 10px ${CYAN}` }} />
          <div>
            <GlitchText text="COMMAND CENTER" fontSize={20} />
            <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>OPERATOR HUD — YOUR OPERATING SYSTEM</div>
          </div>
          <div style={{ display: "flex", gap: 18, fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.35)", flexWrap: "wrap" }}>
            <span>DAY <span style={{ color: GOLD }}>—</span></span>
            <span>{time.toLocaleTimeString("en-US", { hour12: false })}</span>
          </div>
        </div>
        {/* QUEST BAR */}
        <div style={{ border: `1px solid ${MAGENTA}30`, padding: "8px 16px", marginBottom: 6, background: `${MAGENTA}05`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: MAGENTA, border: `1px solid ${MAGENTA}`, padding: "2px 8px", letterSpacing: 2, textShadow: `0 0 8px ${MAGENTA}`, whiteSpace: "nowrap" }}>QUEST</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Define your main quest here...</span>
        </div>
        {/* NAV TABS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", marginTop: 10 }}>
          {TABS.map(t => <NavTab key={t.id} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} accent={t.accent} />)}
        </div>
        {/* CONTENT */}
        <div style={{ minHeight: 400 }}>{renderView()}</div>
        {/* BOTTOM HUD */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 30, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 14 }}>
            {[{ c: GREEN, l: "ACTIVE" }, { c: VIOLET, l: "AGENTS" }, { c: MAGENTA, l: "NEW" }, { c: EMBER, l: "PENDING" }, { c: "rgba(255,255,255,0.15)", l: "DORMANT" }].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.c }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 2 }}>{item.l}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", letterSpacing: 2 }}>COMMAND CENTER — TEMPLATE v1.0</div>
        </div>
      </div>
    </div>
  );
}
