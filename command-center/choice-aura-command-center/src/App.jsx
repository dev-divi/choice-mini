import { useState, useEffect, createContext, useContext, useRef, useCallback } from "react";

// ─── TIKTOK LIVE STATS ───────────────────────────────────────────────
function formatCount(n) {
  if (n == null) return null;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function useTikTokStats(handle = "tylerchoice") {
  const [stats, setStats] = useState({ followers: null, likes: null, loading: true, error: false });
  const timerRef = useRef(null);

  useEffect(() => {
    const PROFILE_URL = `https://www.tiktok.com/@${handle}`;

    // Three proxies tried in order — first success wins
    const PROXIES = [
      (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
      (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
      (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    ];

    // Parse TikTok HTML — tries multiple embedded data formats
    const parseHTML = (html) => {
      // Format 1: __UNIVERSAL_DATA_FOR_REHYDRATION__ (newer TikTok)
      const m1 = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
      if (m1) {
        try {
          const json = JSON.parse(m1[1]);
          const scope = json?.["__DEFAULT_SCOPE__"] ?? json;
          const s = scope?.["webapp.user-detail"]?.userInfo?.stats;
          if (s?.followerCount != null) return { followers: s.followerCount, likes: s.heartCount };
        } catch { /* try next */ }
      }
      // Format 2: SIGI_STATE (older TikTok)
      const m2 = html.match(/window\["SIGI_STATE"\]\s*=\s*(\{[\s\S]*?\});\s*window\[/);
      if (m2) {
        try {
          const json = JSON.parse(m2[1]);
          const users = json?.UserModule?.users || {};
          const uid = Object.keys(users)[0];
          const s = json?.UserModule?.stats?.[uid];
          if (s?.followerCount != null) return { followers: s.followerCount, likes: s.heartCount };
        } catch { /* try next */ }
      }
      // Format 3: __NEXT_DATA__ (some TikTok pages)
      const m3 = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (m3) {
        try {
          const json = JSON.parse(m3[1]);
          const s = json?.props?.pageProps?.userInfo?.stats;
          if (s?.followerCount != null) return { followers: s.followerCount, likes: s.heartCount };
        } catch { /* try next */ }
      }
      throw new Error("no parseable data in response");
    };

    const fetchStats = async () => {
      for (const makeProxy of PROXIES) {
        try {
          const res = await fetch(makeProxy(PROFILE_URL), { cache: "no-store" });
          if (!res.ok) continue;
          const ct = res.headers.get("content-type") || "";
          let html = ct.includes("json") ? ((await res.json()).contents || "") : await res.text();
          const { followers, likes } = parseHTML(html);
          setStats({ followers: formatCount(followers), likes: formatCount(likes), loading: false, error: false, ts: Date.now() });
          return; // success — stop trying proxies
        } catch { continue; }
      }
      setStats(prev => ({ ...prev, loading: false, error: true }));
    };

    fetchStats();
    timerRef.current = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(timerRef.current);
  }, [handle]);

  return stats;
}

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

// ─── THEME SYSTEM ────────────────────────────────────────────────────
const CLEAN = {
  name: "clean",
  bg: "#f7f3ec", surface: "#ffffff", surfaceAlt: "#f2ede4",
  surfaceHover: "#ede7dc", border: "#ddd6c8", borderMed: "#c8bfb2",
  text: "#2a2520", textSub: "#5a534a", textMuted: "#8a8078", textLabel: "#a09080", textFaint: "#c8bfb2",
  c: "#1a7a8a", g: "#9e7b2f", gr: "#2e7a50", mg: "#9a3060", em: "#b05028", re: "#c03030", vi: "#7040b0", te: "#2a7060", li: "#608020",
  fontBody: "system-ui, -apple-system, sans-serif", fontMono: "'Courier New', monospace",
};
const HUD = {
  name: "hud",
  bg: "#0a0a0f", surface: "rgba(255,255,255,0.015)", surfaceAlt: "rgba(255,255,255,0.01)",
  surfaceHover: "rgba(0,240,255,0.06)", border: "rgba(255,255,255,0.08)", borderMed: "rgba(255,255,255,0.15)",
  text: "#e0e0e0", textSub: "rgba(255,255,255,0.5)", textMuted: "rgba(255,255,255,0.35)", textLabel: "rgba(255,255,255,0.25)", textFaint: "rgba(255,255,255,0.12)",
  c: CYAN, g: GOLD, gr: GREEN, mg: MAGENTA, em: EMBER, re: RED, vi: VIOLET, te: TEAL, li: LIME,
  fontBody: "system-ui, sans-serif", fontMono: "'Courier New', monospace",
};
const ThemeCtx = createContext(HUD);
const useT = () => useContext(ThemeCtx);

function ThemeToggle({ theme, onToggle }) {
  const isClean = theme === "clean";
  return (
    <button onClick={onToggle} style={{
      background: isClean ? "rgba(0,240,255,0.06)" : "rgba(247,243,236,0.08)",
      border: isClean ? "1px solid rgba(0,240,255,0.3)" : "1px solid rgba(247,243,236,0.3)",
      color: isClean ? CYAN : "#8a7a6a",
      fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2,
      padding: "6px 14px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.3s",
    }}>
      {isClean ? "⚡ HUD MODE" : "◈ CLEAN MODE"}
    </button>
  );
}

// ─── DATA ────────────────────────────────────────────────────────────
const REVENUE_PATHS = [
  { amount: "$2-4", label: "per sale (5 vids/wk cap)", source: "TikTok Shop Affiliate", status: "pending" },
  { amount: "TBD", label: "per sale — system built", source: "Dropshipping AutoDS", status: "pending" },
  { amount: "$67", label: "per conversion", source: "TikTok Commission — Linktree", status: "live" },
  { amount: "8.5%", label: "per sale", source: "Amazon Affiliate — Linktree", status: "live" },
  { amount: "$25", label: "per sale", source: "CapCut Edits Tutorial", status: "active" },
  { amount: "1:1", label: "mentorship sessions", source: "Choice Aura", status: "active", link: "https://choiceaura.netlify.app/" },
];

const CONTENT_NODES = [
  { type: "primary channel", name: "@tylerchoice", detail: "TikTok Main — 1,510 followers\nViral: 20K+ views (Day 20)\n22.8K total likes", status: "active", tag: "LIVE" },
  { type: "training ground", name: "@nie.aura", detail: "TikTok Nie — worst videos go here\nFailures that trained the skills", status: "active", tag: "LIVE" },
  { type: "video", name: "@tylerchoicemedia", detail: "YouTube — hopecore edits\nNew channel, long-term play", status: "active", tag: "LIVE" },
  { type: "crosspost", name: "Instagram", detail: "Crossposting TikToks\nRunning through end of March", status: "active", tag: "LIVE" },
  { type: "written", name: "Substack / Kit", detail: "@niearchive blog\nNewsletter with recovered articles", status: "dormant", tag: "DORMANT" },
  { type: "legacy", name: "@EVA-9.0", detail: "YouTube shorts\nWinding down", status: "dormant", tag: "WINDING DOWN" },
];

const COMMERCE_NODES = [
  { type: "job 1 — affiliate", name: "TikTok Shop Affiliate", detail: "5 videos/week cap\nEmbed products in main content — doesn't look like an ad", status: "needs planning", tag: "NEEDS PLANNING" },
  { type: "job 3 — dropshipping", name: "TikTok Shop Seller (AutoDS)", detail: "Full AI system built\nCan run parts manually without API keys", status: "pending", tag: null },
  { type: "storefront", name: "Shopify Store", detail: "choiceaurastore.myshopify.com\n3-month free trial active\nNeeds product + branding overhaul", status: "pending", tag: "NEEDS WORK" },
  { type: "link hub", name: "Linktree", detail: "linktr.ee/tylerchoice\n$67 TikTok commission\nAmazon affiliate 8.5%", status: "active", tag: "LIVE — EARNING" },
];

const CLIENT_NODES = [
  { type: "scheduling", name: "Calendly", detail: "40-min sessions, after 3pm\ncalendly.com/tylerchoice/", status: "active", tag: "LIVE" },
  { type: "calls", name: "Zoom", detail: "Connected to Calendly\nFree tier — 40 min cap", status: "active", tag: "LIVE" },
  { type: "next call", name: "No Call Scheduled", detail: "No upcoming session booked\nOpen slot — needs to be filled", status: "pending", tag: "EMPTY" },
  { type: "⚡ PRIMARY PLAY", name: "DMs — Work These NOW", detail: "Warm leads from 20K viral video\nThis is the unlock for everything else\nConsulting $ → buys samples → buys API keys\nThis is the move.", status: "active", tag: "ACTIVE PLAY" },
];

const AI_WORKFLOW_AGENTS = [];

const SOCIAL_MEDIA = [
  { name: "Fall Asleep While I Play Elden Ring Series", status: "ready to push", desc: "YouTube series. Ambient, long-form gameplay content designed for sleep/background viewing.", icon: "🎮" },
  { name: "Day Series Instagram Campaign", status: "ready to push", desc: "Day series auto-posting to Instagram. Bio CTA live.", icon: "📺" },
];

const EXTERNAL_PROJECTS = [
  { name: "Journal Ad Campaign", status: "planning", desc: "Up to 100 advertisements for journals sold on TikTok Shop. Show prototype in journal, show Claude creating it.", icon: "📓" },
  { name: "Salina — Frontend Automation", status: "on hold", desc: "Frontend automation project. Viral script created through nanobanana. Look into Higgsfield AI.", icon: "🎬" },
];

const INTERNAL_PROJECTS = [
  { name: "Tyler Dashboard Card", status: "complete", desc: "Player profile card for the dashboard.", icon: "🎴", priority: "critical" },
  { name: "Mental Highlight Reel", status: "planned", desc: "Dashboard page tracking accomplishments under Tyler's player profile.", icon: "🏆", priority: "medium" },
  { name: "Build Tyler's Personal LLM", status: "not started", desc: "A personal LLM trained on Tyler's voice, personality, content, and system — replicates Tyler's thinking and style.", icon: "🧠", priority: "medium" },
  { name: "Internal Research Agent", status: "uncreated", desc: "Agent that searches for current game-like AI automations for making money.", icon: "🔬", priority: "medium" },
];

const MINI_PROJECTS = [
  { name: "Substack → High-Converting Newsletter", status: "queued", desc: "Make the substack a highly converting newsletter to get paid." },
  { name: "Learn TJR Trading Strategy", status: "queued", desc: "Learn from TJR's PDF so we can teach the Crypto Agent later." },
  { name: "Tyler Personality Tracker", status: "queued", desc: "Start tracking Tyler's personality and traits so Claude can replicate him." },
];

const OPERATING_PRINCIPLES = [
  { title: "MONEY IN", desc: "Take the shortest path to getting money in account. Prioritize money in first." },
  { title: "NO COST", desc: "Getting to MVP should cost zero or low resources." },
  { title: "QUALIFIED DATA", desc: "Create products and services only from what the audience asked for." },
  { title: "EVERY ACTION = MORE MONEY", desc: "Making a video doing a task = an asset. Ordering a product = advertise it + commission + refund." },
];

const TYLER_PROMPTS = [
  "Hey based on what you know about me what can you do for me now? What do you think would be helpful to do right now?",
  "Hey build something cool for me tonight based on what you know about me",
  "Hey, go on (X.com or other) review what people in the [my niche or other] community are saying. Find their challenges, then build out apps for them.",
];

const THREE_JOBS = [
  {
    num: "01", title: "Tyler Choice TikTok", color: "#00ff88", status: "ACTIVE — MOVE NOW",
    detail: "Main TikTok presence. Drive commissions through Shop Affiliate and close 1:1 consulting clients from DMs.",
    blocker: null,
    subtrees: [
      {
        name: "TikTok Shop Affiliate", status: "needs planning",
        children: [
          { name: "Journal Ad Campaign", status: "planning" }
        ]
      },
      { name: "1:1 Mentorship", status: "active", link: "https://choiceaura.netlify.app/" },
      {
        name: "TikTok Live", status: "planned",
        children: [
          { name: "TETR.IO", status: "planned" },
          { name: "EDM Livestream", status: "planned" },
        ]
      },
      { name: "90 Day Challenge", status: "active", nameColor: "#ff2244", note: "NEEDS ATTENTION !!", children: [
        { name: "Sharing Prompts Planning", status: "needs work" },
      ]},
    ]
  },
  {
    num: "02", title: "Choice Aura Shop TikTok", color: "#00f0ff", status: "IN PROGRESS",
    detail: "Selling physical products through TikTok Shop. Campaigns running in parallel.",
    blocker: null,
    subtrees: [
      { name: "One Piece Tape Campaign", status: "in progress", detail: "Day 3", nameColor: "#ff2244", note: "NEEDS ATTENTION !!" },
      { name: "Printify T-Shirts Campaign", status: "in progress" },
      { name: "Salina — Frontend Automation", status: "on hold" },
      { name: "Shopify Store", status: "on hold" },
    ]
  },
  {
    num: "03", title: "AI Automation", color: "#ff6a00", status: "BUILDING",
    detail: "AI agent pipeline: Clark (shop automation), Nina (product factory), Nami (crypto), Zoro (competitor analysis).",
    blocker: null,
    subtrees: [
      {
        name: "Digital Twin", status: "in progress",
        children: [
          {
            name: "HeyGen Digital Twin", status: "active", link: "https://app.heygen.com/create-v4/b8491a2df4fd4649a4bd7352855e90eb?avatarCreated=true",
            children: [
              { name: "Tutorial", status: "active", link: "https://www.youtube.com/watch?v=heLwJQBDklU" },
            ]
          },
          {
            name: "Kling AI NextGen Initiative Grant", status: "in progress",
            children: [
              { name: "Kling Dashboard", status: "ready to start", link: "https://app.klingai.com/global/omni/new?klingVersion=3.0-omni&model=video" },
              { name: "Kling AI NextGen Initiative — 300K Grant", status: "needs work", link: "https://docs.google.com/forms/d/e/1FAIpQLSeitcH0m9TUrC9ryA_v78gCdvgs-3epmfSlXhWuA3PYjB48Ug/formResponse" },
            ]
          },
        ]
      },
      {
        name: "Hacker AI Production", status: "planned",
        children: [
          {
            name: "Google Docs", status: "active",
            children: [
              { name: "Hacker Route: AI Production Workflow", status: "active", link: "https://docs.google.com/document/d/1hWSVdlY90eKe7Gh1suRKmRVYxykwkJSok3_3HpmWNF0/edit?tab=t.0" },
              { name: "Kling 3.0: Solid-State Video Prompting", status: "active", link: "https://docs.google.com/document/d/1AbF8P7FaQ4gpLAA4ywvPuhrg-gj1rUH54rN8kpKcTpc/edit?tab=t.0" },
              { name: "AI Video Production: Art Director to Cinematographer", status: "active", link: "https://docs.google.com/spreadsheets/d/1NYNqzi-_xkDKbsOu06qsR6N1kMEosqDVegC9esrvjpo/edit?gid=781853171#gid=781853171" },
            ]
          },
        ]
      },
    ]
  },
  {
    num: "04", title: "Portfolio", color: "#a855f7", status: "PLANNED",
    detail: "Portfolio presence — projects, work, and identity.",
    blocker: null,
    subtrees: [
      { name: "CapCut Edits Tutorial", status: "active", price: "$25", link: "https://tr.ee/3b-1UGQYAJ" },
      { name: "Operator Dashboard", status: "active", link: "https://choice-operator-dashboard.netlify.app/" },
      { name: "Clark — Shop Automation", status: "complete", link: "" },
    ]
  },
];

// ─── AGENTS DATA ──────────────────────────────────────────────────────
const AGENTS = [
  {
    name: "Clark",
    subtitle: "Shop Automation",
    icon: "🤖",
    status: "deployed",
    color: GREEN,
    role: "Full Pipeline — Revenue Generation",
    cost: "$0 now (API keys blocked)",
    upkeep: "AutoDS API + Kalodata subscription",
    revenue: "30%+ margin per drop sale — passive income",
    resources: ["AutoDS API", "Kalodata", "Claude API", "Shopify"],
    sub_agents: ["Scout", "Sourcing", "Creative", "Launch"],
    desc: "4-agent pipeline. Finds trending products via Kalodata (500+ daily sales, 15%+ conversion), matches US suppliers via AutoDS, writes viral ad copy via Claude, imports to Shopify with SEO-optimized listings. System is fully built — blocked on API keys.",
  },
  {
    name: "Salina",
    subtitle: "Frontend Automation",
    icon: "🎬",
    status: "in progress",
    color: CYAN,
    role: "Content Production — Scale",
    cost: "Low",
    upkeep: "Higgsfield AI + nanobanana",
    revenue: "Enables 10x content velocity → more affiliate + shop income",
    resources: ["nanobanana", "Higgsfield AI", "CapCut"],
    sub_agents: [],
    desc: "Automates viral script creation and video production pipeline. nanobanana for scripts, Higgsfield AI for video generation. Frees Tyler's production time — more content with less effort.",
  },
  {
    name: "Nina",
    subtitle: "Product Factory",
    icon: "🏭",
    status: "not deployed",
    color: EMBER,
    role: "Product Creation — Digital Sales",
    cost: "Medium",
    upkeep: "Claude API + email platform + Gumroad",
    revenue: "Digital product sales — MVPs launched on demand",
    resources: ["Claude API", "Kit/ConvertKit", "Gumroad"],
    sub_agents: [],
    desc: "Research agent → identifies audience pain points → creates products/MVPs → launches them → runs email and ad campaigns automatically. Full product business on autopilot.",
  },
  {
    name: "Nami",
    subtitle: "Crypto Agent",
    icon: "₿",
    status: "not deployed",
    color: GOLD,
    role: "Capital Deployment — Trading",
    cost: "Medium (exchange fees + initial capital)",
    upkeep: "Exchange API + trading platform fees",
    revenue: "Strategy-defined crypto trading returns",
    resources: ["Exchange API", "Strategy PDF", "Claude API"],
    sub_agents: [],
    desc: "Reads a PDF strategy style file and executes trades based on its rules. Allocates capital autonomously. High risk, high ceiling. Requires TJR trading strategy PDF to be ready first.",
  },
  {
    name: "Zoro",
    subtitle: "Competitor Agent",
    icon: "🔍",
    status: "not deployed",
    color: MAGENTA,
    role: "Intelligence — Content Strategy",
    cost: "OpenClaw subscription",
    upkeep: "OpenClaw + Claude API",
    revenue: "Indirect — better intel = sharper content = more views = more income",
    resources: ["OpenClaw", "TikTok data", "Claude API"],
    sub_agents: [],
    desc: "Deep reverse-engineering of specific TikTok influencers. Scrapes and analyzes content patterns, hook structures, posting schedules, viral triggers. Requires OpenClaw to function.",
  },
];

// ─── CODEX DATA ──────────────────────────────────────────────────────
const ACTIVE_WHEELS = [
  { name: "TikTok main (@tylerchoice)", platform: "TikTok", stage: "Point 8", notes: "1,510 followers. 22.8K total likes. Viral hit Day 20 (15.8K views). Day 29. Retention/data phase.", status: "active" },
  { name: "Nie account (@nie.aura)", platform: "TikTok", stage: "Ongoing", notes: "Worst videos go here. Failures that trained the skills for viral success.", status: "active" },
  { name: "1-on-1 Calls", platform: "Calendly/Zoom", stage: "Point 1-2", notes: "Just set up Calendly. 40-min sessions. No bookings yet. Intention + tools phase.", status: "pending" },
  { name: "Hopecore Edits", platform: "TikTok/YouTube", stage: "?", notes: "'How did you make this?' reactions. Long-term play. Sooraj-level aspiration.", status: "active" },
  { name: "YouTube @tylerchoicemedia", platform: "YouTube", stage: "Point 1", notes: "Just launched with hopecore edit.", status: "new" },
  { name: "YouTube @EVA-9.0", platform: "YouTube", stage: "Winding down", notes: "Was posting TikTok shorts here.", status: "dormant" },
  { name: "Instagram", platform: "Instagram", stage: "Active", notes: "Crossposting TikToks. Running through end of March.", status: "active" },
  { name: "Substack @niearchive", platform: "Substack", stage: "Point 1-2", notes: "New blog launched.", status: "dormant" },
  { name: "Kit Newsletter", platform: "Kit/ConvertKit", stage: "Recovered", notes: "Many articles written. Previously built. Recovered recently.", status: "dormant" },
];

const PAST_WHEELS = [
  { name: "TheZenWorld.news", happened: "Website. People liked it. No audience.", fed: "Writing skills, spiritual content foundation" },
  { name: "Meditation with Tyler (YouTube)", happened: "People liked it. Got stuck.", fed: "Mindfulness facilitation skills, space holding" },
  { name: "Mindfulness Course", happened: "Tried to launch. Stalled (Point 3?)", fed: "Call structure — 10-min mindfulness opening" },
  { name: "YouTube launch attempts", happened: "Multiple channels tried", fed: "Understanding of platform mechanics" },
  { name: "TikTok edits (early)", happened: "Choice Media Edits, Anime, Gaming — few videos, moved to main", fed: "Format experimentation" },
  { name: "Robert Oliver edits", happened: "Was already copying his style before being accepted for faceless channels.", fed: "Edit skills, production technique" },
  { name: "90-Day Challenge", happened: "Most recent structured attempt", fed: "Daily discipline, content momentum → viral video" },
  { name: "WildMaskPotentiality", happened: "Fourth Way content. Didn't take off.", fed: "Teaching framework development" },
  { name: "Kit products + newsletter", happened: "Products and articles built", fed: "Email infrastructure, written content library" },
  { name: "Business systems / product launch", happened: "Tried to set up product infrastructure", fed: "Launch funnel knowledge" },
];

const GAME_2025_LEVELS = [
  { level: 1, name: "Create Business", period: "Pre-March 2025", status: "COMPLETED", pct: 100, color: GREEN, notes: "Landing page, newsletter, lead magnets, MVP, register business, mindfulness certification, YouTube program, 1:1 coaching service. All 8/8 tasks done." },
  { level: 2, name: "Launch MVP", period: "March-April 2025", status: "~70%", pct: 70, color: GREEN, notes: "Product launch, email sequences, $5 ads, Gumroad payment, pre-launch sequence, Coming Soon page." },
  { level: 3, name: "Run The Wheels", period: "April-June 2025", status: "HEAVY OUTPUT", pct: 80, color: GOLD, notes: "Newsletters, ads ($30 trauma targeted), YouTube videos, books published, Fourth Way research, Conscious Heroes Initiative, Enneagram book." },
  { level: 4, name: "(unnamed)", period: "June-July 2025", status: "~30%", pct: 30, color: EMBER, notes: "Ray of Creation video, 'What Is The Fourth Way' book published, 17-hour work session." },
  { level: 5, name: "North Star", period: "August 2025", status: "~7%", pct: 7, color: RED, notes: "Client outreach game (4 weeks), MVP backend, client tracker, business plan. Momentum dropped here." },
  { level: 6, name: "Cosmos", period: "Aug-Sept 2025", status: "INTENTION SET", pct: 40, color: MAGENTA, notes: "'GO VIRAL ON TIKTOK, VIDEO EDITS, MAJOR HEALING CHANGES' — the intention that manifested 6 months later." },
  { level: 7, name: "SuperCosmos", period: "November 2025", status: "Stalled", pct: 5, color: "rgba(255,255,255,0.2)", notes: "Mostly unpopulated." },
  { level: 8, name: "Cosmic", period: "December 2025", status: "Partial", pct: 15, color: "rgba(255,255,255,0.2)", notes: "RTB Productions (Wheel 3), clips, daily tasks." },
];

const LARGE_WHEELS = [
  { name: "The Game 2025", period: "March - Dec 2025", type: "MASTER WHEEL", desc: "Points 1-5 completed with massive output. Stalled at Point 6 (Level 5 at 7% — pulled back before going public with client outreach). 'GO VIRAL ON TIKTOK' set as Level 6 intention — manifested 6 months later." },
  { name: "YouTube/TikTok Viral Quest", period: "July 2025 - Feb 2026", type: "COMPLETED FULL CYCLE", desc: "Pt1: July intention → Pt2: Aug tools → Pt3: Sept shame → Pt4: Sept 20 first viral → Pt5: Oct campaigns → Pt6: Nov-Dec tatakae → Pt7: Jan-Feb presentations → Pt8: Feb 25 viral → CURRENTLY HERE" },
  { name: "The Edit Skill Wheel", period: "Aug 2025 - ongoing", type: "ACTIVE", desc: "Robert Oliver edits → anime edits → hopecore edits → face-to-camera with edit skills. Each sub-wheel trained the next. 'How did you make this?' reactions = serious long-term play." },
  { name: "SuperEdit / Tatakae Club", period: "Nov 2025 - Feb 2026", type: "STALLED", desc: "Built Nov, continued Dec. Failed upload Jan 10. Re-released as campaign Feb — didn't work. Stalled wheel but skills fed forward." },
  { name: "90-Day Video Challenge", period: "Feb 8, 2026 - ongoing", type: "ACTIVE", desc: "Its own wheel with its own momentum. Viral hit landed within this wheel on Feb 25." },
  { name: "Nie Videos", period: "Jan 7, 2026 - ongoing", type: "BORN FROM CATALYST", desc: "Started after getting upset (Jan 7). 'Worst videos go here.' Emotional catalyst + spiritual healing (Jan 9) = neutralizing force. Fed directly into voice/authenticity that made viral video land." },
  { name: "Adobe After Effects Wheel", period: "Feb 24, 2026 - ???", type: "POINT 1", desc: "Just got access. New capability. Timing: one day before going viral. The tool arrived at the threshold." },
];

const PRODUCTS_CREATED = [
  "Mindfulness Program (MVP)", "'What Is The Fourth Way' book", "'Steps To That' Edition III (published)",
  "'Thoughts of An Eternal Nature' (published)", "'Magnetism' book/lead magnet", "Trauma Healing product",
  "Energetic Healing product", "Various newsletters and articles", "Law of Three lead magnet",
  "Enneagram lead magnet", "Ray of Creation video", "Fool + Trickster video", "Know Being video",
  "Evangelion video", "Conscious Heroes Initiative", "Self-Remembering Enneagram (invented April 23, 2025)",
  "Multiple ad campaigns (Meta/Facebook/Instagram)"
];

const VIRAL_TIMELINE = [
  { date: "July 30, 2025", event: "Intention set: go viral on YouTube" },
  { date: "Aug 10, 2025", event: "First YouTube short posted" },
  { date: "Aug 21, 2025", event: "Learned about TikTok edits (pivot point)" },
  { date: "Sept 2025", event: "Lots of edits. Dealing with inner shame heavily." },
  { date: "Sept 20, 2025", event: "First viral on TikTok", highlight: true },
  { date: "Oct 20-29, 2025", event: "Videogame campaign — successfully went viral", highlight: true },
  { date: "Nov 2025", event: "Started 'SuperEdit' tatakae club. Worked on it the whole month." },
  { date: "Jan 7, 2026", event: "Started making nie videos after getting upset — catalyst moment", highlight: true },
  { date: "Jan 9, 2026", event: "Received spiritual healing" },
  { date: "Feb 8, 2026", event: "Day 1 of current TikTok run (90-day challenge)" },
  { date: "Feb 24, 2026", event: "Got access to Adobe After Effects (new wheel potential)" },
  { date: "Feb 25, 2026", event: "Went viral — the video that changed everything", highlight: true },
  { date: "Feb 28, 2026", event: "1,204 followers. Point 8 retention. 20+ DMs processed." },
];

const CREATOR_INSPIRATIONS = [
  { name: "Sooraj Saxena", note: "Amazingly high production value. Captures inner dialogue up to resolution. Tyler's long-term model. '2025 bio: want to learn how I make skits like this? course link in bio.'" },
  { name: "Cristina Mendez", note: "High-quality inspirational content" },
  { name: "'Try Again' edit creator", note: "Specific edit style Tyler admires" },
  { name: "Squid", note: "Content style Tyler studies" },
];

const GOALS_HISTORICAL = [
  { goal: "CREATE BUSINESS", status: "done" },
  { goal: "Launch MVP", status: "mostly done" },
  { goal: "Run a sustainable business sharing what he cares about", status: "in progress" },
  { goal: "The Work, Getting Work Out There, YouTube", status: "in progress" },
  { goal: "GO VIRAL ON TIKTOK", status: "done", note: "Written ~Aug 2025, manifested Feb 2026" },
  { goal: "MAJOR HEALING CHANGES", status: "in progress" },
  { goal: "VIDEO EDITS", status: "done" },
  { goal: "See the future me who has 100 happy clients", status: "in progress" },
];

const SPIRITUAL_FRAMEWORK = [
  "Fourth Way (Gurdjieff, Ouspensky)",
  "Enneagram as process map, not personality typing",
  "Law of Three: Active/Passive/Neutral — affirming/denying/reconciling",
  "Law of Seven: octaves, intervals, shocks",
  "Three levels: Exoteric (many gods, A influence), Mesoteric (one god, B influence), Esoteric (contact with God, C influence)",
  "Humility is accepting there is more to learn (Active beginner's mind)",
];

const SPIRITUAL_QUOTES = [
  "Whenever you have found the Truth, do not keep it in your heart. If you keep it in your heart, it will die.",
  "Consciousness has to be a constant flow; only then do you remain conscious. Consciousness is river-like. The moment you become stagnant you lose consciousness.",
  "I let go, and it turns out this was already done for me.",
  "My proof to god of trust in him is by actions... worrying about time passing by isn't trusting god",
];

const JOURNAL_ENTRIES = [
  "I'm worried as a writer, researcher, that I won't take advantage of AI's capabilities... it's not a tech problem, it's a larger problem of infrastructure and real world stuff",
  "These hopecore edits when am I going to work on them again — long-term play, 'how did you make this?' audience reactions are serious",
  "Isn't it crazy that first discussions with Claude were about how the 300 view face videos weren't the play and then we now have this viral video?",
  "I'm tired of failures. I'm tired of showing up in a way that doesn't land. Not enough intention.",
  "I must not show god that I don't trust him by taking more action. I must remember constantly every second every moment that my proof to god of trust in him is by actions",
  "I've been afraid this whole time of showing these people I'm not great, of disappointing them all",
];

const TYLER_IS = [
  "Thinking partner for consciousness/AI disruption questions",
  "Helps people process the existential weight of AI and transformation",
  "Space holder",
  "Someone building in public alongside his audience",
  "Fourth Way practitioner applying ancient systems to modern reality",
  "Finding out who I am and flying. Cooking peak content. At speed. With quality. For your pleasure.",
];

const TYLER_IS_NOT = [
  "Not an AI business consultant",
  "Not a ChatGPT tutorial guy",
  "Not a business tactics advisor",
  "Not a coach performing helpfulness",
];

const WHAT_TYLER_DOES_1ON1 = [
  "10 minutes mindfulness opening — usually this IS the value of the whole call",
  "Space holding — while they sort their plans",
  "Offering resources he knows about",
  "Answering questions",
  "Self-inquiry guidance",
  "Can lead someone through trauma work but it takes 1-2 hours and costs him for a day — OFF THE TABLE for now",
  "40-minute Calendly slot (Zoom free tier cap)",
];

const HERO_JOURNEY = "Call to Quest → Copy viral content strategy → 'WTF are we doing, we need help' → Take advice from helpers and mentors → Face unexpected challenges ('oh fuck this is actually hard') → DEATH AND REBIRTH PHASE: our content doesn't work! → Mentor tells us what to expect → We learn and gain understanding → Our understanding transforms, we transform → We change what didn't work → We return to what we tried to do before → THIS TIME IT WORKS → 'Now we can create viral content on demand $$$$$'";

const CODEX_PROMPTS = [
  { name: "Blind Spot Check", prompt: "Review entire conversation for actions Tyler should be taking but hasn't. Use after long strategy sessions." },
  { name: "Critical Reassessment", prompt: "Critically re-evaluate everything that you just wrote — used when instincts say don't trust, or something sounds too good, or for important decisions." },
];

// ─── HELPERS ─────────────────────────────────────────────────────────
const statusColor = (s, t) => {
  const g = t?.name === "clean" ? t.gr : GREEN;
  const c = t?.name === "clean" ? t.c : CYAN;
  const gold = t?.name === "clean" ? t.g : GOLD;
  const m = t?.name === "clean" ? t.mg : MAGENTA;
  const e = t?.name === "clean" ? t.em : EMBER;
  if (s === "active" || s === "live" || s === "deployed") return g;
  if (s === "ready to push") return c;
  if (s === "in progress") return c;
  if (s === "complete") return gold;
  if (s === "new" || s === "just unlocked") return m;
  if (s === "pending" || s === "planning" || s === "needs planning" || s === "needs work" || s === "due tonight" || s === "scheduled") return e;
  if (s === "ready to start") return c;
  if (s === "on hold") return t?.name === "clean" ? t.mg : MAGENTA;
  if (s === "not started" || s === "uncreated" || s === "queued" || s === "not deployed") return t?.name === "clean" ? t.textFaint : "rgba(255,255,255,0.2)";
  return t?.name === "clean" ? t.textFaint : "rgba(255,255,255,0.15)";
};

const tagStyle = (s) => {
  const c = statusColor(s);
  return { color: c, borderColor: c, border: `1px solid ${c}`, padding: "2px 8px", fontSize: 9, letterSpacing: 2, fontFamily: "'Courier New', monospace", textTransform: "uppercase", display: "inline-block" };
};

// ─── COMPONENTS ──────────────────────────────────────────────────────
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
  const t = useT();
  return (
    <button onClick={onClick} style={{
      background: active ? `${accent}${t.name === "clean" ? "18" : "12"}` : t.surface,
      border: `1px solid ${active ? accent + (t.name === "clean" ? "70" : "50") : t.border}`,
      color: active ? accent : t.textMuted,
      fontFamily: t.fontMono, fontSize: 10, letterSpacing: 3, padding: "8px 16px",
      cursor: "pointer", textTransform: "uppercase", transition: "all 0.3s", position: "relative",
      textShadow: active && t.name === "hud" ? `0 0 8px ${accent}40` : "none",
    }}>
      {active && t.name === "hud" && <div style={{ position: "absolute", top: -1, left: 10, right: 10, height: 2, background: accent, boxShadow: `0 0 8px ${accent}` }} />}
      {active && t.name === "clean" && <div style={{ position: "absolute", bottom: -1, left: 10, right: 10, height: 2, background: accent }} />}
      {label}
    </button>
  );
}

function SectionHeader({ children, color }) {
  const t = useT();
  const c = color || t.c;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 14px", paddingBottom: 6, borderBottom: `1px solid ${t.border}` }}>
      <div style={{ width: 6, height: 6, background: c, boxShadow: t.name === "hud" ? `0 0 8px ${c}` : "none", flexShrink: 0 }} />
      <span style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 5, color: t.textLabel, textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

function CatHeader({ children, color = CYAN }) {
  const t = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "26px 0 10px" }}>
      <div style={{ width: 3, height: 26, background: color, boxShadow: t.name === "hud" ? `0 0 8px ${color}` : "none", flexShrink: 0 }} />
      <span style={{ fontFamily: "'Barlow Semi Condensed', 'Arial Black', sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: 3, color, textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

function NodeCard({ node }) {
  const t = useT();
  const [hovered, setHovered] = useState(false);
  const sc = statusColor(node.status, t);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ border: `1px solid ${hovered ? t.c + (t.name === "clean" ? "50" : "40") : t.border}`, padding: 16, position: "relative", background: hovered ? t.surfaceHover : t.surface, transition: "all 0.3s", transform: hovered ? "translateY(-2px)" : "none", minHeight: 120, boxShadow: hovered ? (t.name === "clean" ? "0 4px 16px rgba(0,0,0,0.1)" : "none") : "none" }}>
      <div style={{ position: "absolute", top: 10, right: 12 }}><PulsingDot color={sc} /></div>
      <div style={{ fontFamily: t.fontMono, fontSize: 8, letterSpacing: 3, color: t.textLabel, marginBottom: 6, textTransform: "uppercase" }}>{node.type}</div>
      <div style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: 16, color: t.text, marginBottom: 4 }}>{node.name}</div>
      <div style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.6, whiteSpace: "pre-line" }}>{node.detail}</div>
      {node.tag && <div style={{ color: sc, border: `1px solid ${sc}`, padding: "2px 8px", fontSize: 9, letterSpacing: 2, fontFamily: t.fontMono, textTransform: "uppercase", display: "inline-block", marginTop: 8 }}>{node.tag}</div>}
    </div>
  );
}

function RevenueCard({ r }) {
  const t = useT();
  const [hovered, setHovered] = useState(false);
  const inner = (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ border: `1px solid ${hovered ? t.g + (t.name === "clean" ? "80" : "40") : t.name === "clean" ? t.border : "rgba(255,215,0,0.15)"}`, padding: "14px 18px", background: hovered ? (t.name === "clean" ? t.surfaceHover : "rgba(255,215,0,0.04)") : t.surface, transition: "all 0.3s", textAlign: "center", transform: hovered ? "translateY(-2px)" : "none", boxShadow: hovered && t.name === "clean" ? "0 4px 16px rgba(0,0,0,0.1)" : "none", cursor: r.link ? "pointer" : "default" }}>
      <div style={{ fontFamily: t.fontMono, fontWeight: 900, fontSize: 26, color: t.g, textShadow: t.name === "hud" ? `0 0 20px ${GOLD}30` : "none" }}>{r.amount}</div>
      <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: 1, marginTop: 2 }}>{r.label}</div>
      <div style={{ fontSize: 11, color: t.textSub, marginTop: 6, fontFamily: t.fontBody }}>{r.source}</div>
      {r.link && <div style={{ fontSize: 8, color: t.g, fontFamily: "'Courier New', monospace", letterSpacing: 2, marginTop: 6 }}>↗ OPEN</div>}
    </div>
  );
  return r.link
    ? <a href={r.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{inner}</a>
    : inner;
}

function ProjectCard({ project, accent = CYAN }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const sc = statusColor(project.status, t);
  return (
    <div onClick={() => setOpen(!open)} style={{ border: `1px solid ${open ? accent + (t.name === "clean" ? "50" : "30") : t.border}`, padding: "14px 16px", background: open ? (t.name === "clean" ? t.surfaceHover : `${accent}06`) : t.surface, cursor: "pointer", transition: "all 0.3s", marginBottom: 8, boxShadow: open && t.name === "clean" ? "0 2px 12px rgba(0,0,0,0.08)" : "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{project.icon}</span>
          <span style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: 14, color: t.text }}>{project.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PulsingDot color={sc} size={6} />
          <span style={{ color: sc, border: `1px solid ${sc}`, padding: "2px 8px", fontSize: 9, letterSpacing: 2, fontFamily: t.fontMono, textTransform: "uppercase", display: "inline-block" }}>{project.status}</span>
          <span style={{ color: t.textLabel, fontSize: 12, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
        </div>
      </div>
      {open && <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.border}`, fontSize: 12, color: t.textMuted, lineHeight: 1.7, whiteSpace: "pre-line", fontFamily: t.fontBody }}>{project.desc}</div>}
    </div>
  );
}

function ProgressBar({ value, max, color = CYAN, label }) {
  const t = useT();
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: t.textLabel, letterSpacing: 1, fontFamily: t.fontMono }}>{label}</span>
        <span style={{ fontSize: 10, color, fontFamily: t.fontMono }}>{value}/{max}</span>
      </div>
      <div style={{ height: 4, background: t.border }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, boxShadow: t.name === "hud" ? `0 0 8px ${color}40` : "none", transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function CodexSection({ title, accent = EMBER, children, defaultOpen = false }) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 8 }}>
      <div onClick={() => setOpen(!open)} style={{ border: `1px solid ${open ? accent + (t.name === "clean" ? "50" : "30") : t.border}`, padding: "12px 16px", background: open ? (t.name === "clean" ? t.surfaceHover : `${accent}06`) : t.surface, cursor: "pointer", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 6, height: 6, background: accent, boxShadow: t.name === "hud" ? `0 0 6px ${accent}` : "none", flexShrink: 0 }} />
          <span style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 3, color: open ? accent : t.textMuted, textTransform: "uppercase" }}>{title}</span>
        </div>
        <span style={{ color: t.textLabel, fontSize: 12, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
      </div>
      {open && <div style={{ border: `1px solid ${accent}${t.name === "clean" ? "25" : "15"}`, borderTop: "none", padding: 16, background: t.surfaceAlt }}>{children}</div>}
    </div>
  );
}

// ─── TAB VIEWS ───────────────────────────────────────────────────────
function SubtreeRow({ sub, job, depth = 0 }) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const sc = statusColor(sub.status, t);
  const hasChildren = sub.children && sub.children.length > 0;

  return (
    <div style={{ marginBottom: 3 }}>
      <div
        onClick={e => { e.stopPropagation(); if (hasChildren) setExpanded(!expanded); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px",
          paddingLeft: 12 + depth * 24,
          background: hovered ? `${job.color}12` : "transparent",
          borderLeft: `3px solid ${hovered || expanded ? job.color + "80" : job.color + "20"}`,
          cursor: hasChildren ? "pointer" : "default",
          transition: "all 0.2s",
        }}
      >
        {hasChildren && (
          <span style={{
            fontSize: 10, color: job.color, fontFamily: "'Courier New', monospace",
            transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s",
            flexShrink: 0, display: "inline-block",
          }}>▶</span>
        )}
        {!hasChildren && <span style={{ width: 12, flexShrink: 0 }} />}
        <span style={{ fontSize: 14, color: sub.nameColor ? sub.nameColor : (hovered ? t.text : t.textSub), fontFamily: t.fontBody, flex: 1, fontWeight: hovered ? 700 : 500, transition: "all 0.2s", letterSpacing: 0.3, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {sub.name}
          {sub.note && <span style={{ fontSize: 9, color: GOLD, fontFamily: "'Courier New', monospace", letterSpacing: 2, fontWeight: 700 }}>{sub.note}</span>}
        </span>
        {sub.price && (
          <span style={{ fontSize: 13, fontWeight: 700, color: GOLD, fontFamily: "'Courier New', monospace", flexShrink: 0, textShadow: `0 0 8px ${GOLD}60` }}>{sub.price}</span>
        )}
        {sub.link && (
          <a href={sub.link} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ fontSize: 10, color: job.color, fontFamily: "'Courier New', monospace", letterSpacing: 1, textDecoration: "none", opacity: hovered ? 1 : 0.5, transition: "opacity 0.2s", flexShrink: 0 }}>
            ↗ OPEN
          </a>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: sc, boxShadow: `0 0 6px ${sc}`, flexShrink: 0 }} />
          <span style={{ color: sc, fontSize: 9, letterSpacing: 1.5, fontFamily: "'Courier New', monospace", textTransform: "uppercase" }}>{sub.status}</span>
        </div>
      </div>
      {hasChildren && expanded && (
        <div style={{ marginTop: 2 }}>
          {sub.children.map((child, k) => (
            <SubtreeRow key={k} sub={child} job={job} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ThreeJobsPanel() {
  const t = useT();
  const [open, setOpen] = useState(null);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
        {THREE_JOBS.map((job, i) => (
          <div key={i} style={{ border: `1px solid ${job.color}30`, background: t.name === "clean" ? t.surface : `${job.color}05`, transition: "all 0.3s", overflow: "hidden" }}>
            {/* Top accent bar */}
            <div style={{ height: 3, background: job.color, opacity: 0.8, boxShadow: t.name === "hud" ? `0 0 10px ${job.color}` : "none" }} />
            {/* Job header — clickable for detail */}
            <div onClick={() => setOpen(open === i ? null : i)} style={{ padding: "20px 20px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 30, fontWeight: 900, color: job.color + (t.name === "clean" ? "90" : "40"), lineHeight: 1 }}>JOB {job.num}</div>
                <div style={{ fontFamily: "system-ui", fontWeight: 800, fontSize: 20, color: t.text, marginTop: 6 }}>{job.title}</div>
                <div style={{ fontSize: 10, color: job.color, fontFamily: "'Courier New', monospace", letterSpacing: 2, marginTop: 5 }}>{job.status}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <PulsingDot color={job.color} size={10} />
                {job.detail && <span style={{ fontSize: 10, color: t.textLabel, fontFamily: "'Courier New', monospace", transform: open === i ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>}
              </div>
            </div>
            {/* Expanded detail */}
            {open === i && job.detail && (
              <div style={{ margin: "0 20px 14px", padding: "12px 14px", background: `${job.color}08`, borderLeft: `3px solid ${job.color}40` }}>
                <div style={{ fontSize: 12, color: t.textSub, lineHeight: 1.8 }}>{job.detail}</div>
                {job.blocker && <div style={{ fontSize: 11, color: RED, fontFamily: "'Courier New', monospace", letterSpacing: 1, marginTop: 8 }}>⚠ {job.blocker}</div>}
              </div>
            )}
            {/* Subtree list */}
            {job.subtrees && job.subtrees.length > 0 && (
              <div style={{ padding: "0 10px 16px" }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: t.textLabel, letterSpacing: 3, padding: "6px 10px 8px", textTransform: "uppercase" }}>Branches</div>
                {job.subtrees.map((sub, j) => (
                  <SubtreeRow key={j} sub={sub} job={job} depth={0} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkBtn({ btn }) {
  const [open, setOpen] = useState(false);
  const btnStyle = {
    padding: "13px 26px",
    border: `1px solid ${btn.color}40`,
    background: open ? `${btn.color}18` : `${btn.color}08`,
    color: btn.color,
    fontFamily: "'Barlow Semi Condensed', 'Arial Black', sans-serif",
    fontSize: 15,
    letterSpacing: 2,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex", alignItems: "center", gap: 10,
    borderColor: open ? `${btn.color}80` : `${btn.color}40`,
  };

  if (btn.children) {
    return (
      <div style={{ position: "relative" }}>
        <div style={btnStyle} onClick={() => setOpen(!open)}
          onMouseEnter={e => { e.currentTarget.style.background = `${btn.color}18`; e.currentTarget.style.borderColor = `${btn.color}80`; }}
          onMouseLeave={e => { if (!open) { e.currentTarget.style.background = `${btn.color}08`; e.currentTarget.style.borderColor = `${btn.color}40`; }}}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: btn.color, display: "inline-block", boxShadow: `0 0 8px ${btn.color}`, flexShrink: 0 }} />
          {btn.label}
          <span style={{ fontSize: 10, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", marginLeft: 2 }}>▼</span>
        </div>
        {open && (
          <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 100, marginTop: 4, minWidth: "100%", border: `1px solid ${btn.color}40`, background: "#0a0a0f", boxShadow: `0 8px 24px rgba(0,0,0,0.6)` }}>
            {btn.children.map((child, j) => (
              <a key={j} href={child.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                <div style={{ padding: "10px 16px", color: btn.color, fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: 12, letterSpacing: 1, fontWeight: 600, borderBottom: j < btn.children.length - 1 ? `1px solid ${btn.color}15` : "none", whiteSpace: "nowrap", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = `${btn.color}15`}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  ↗ {child.label}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <a href={btn.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      <div style={btnStyle}
        onMouseEnter={e => { e.currentTarget.style.background = `${btn.color}18`; e.currentTarget.style.borderColor = `${btn.color}80`; }}
        onMouseLeave={e => { e.currentTarget.style.background = `${btn.color}08`; e.currentTarget.style.borderColor = `${btn.color}40`; }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: btn.color, display: "inline-block", boxShadow: `0 0 8px ${btn.color}`, flexShrink: 0 }} />
        {btn.label} ↗
      </div>
    </a>
  );
}

const QUICKSCRIPT_CATEGORIES = [
  {
    label: "PRODUCT + OFFER CREATION PROMPTS",
    color: GOLD,
    prompts: [
      `Analyze this offer using value equation math and rewrite it 10x more compelling.`,
      `Turn this product into 5 different monetisable offers: high-ticket, low-ticket, subscription, toolkit, agency.`,
      `Create 12 new product variations based on unmet customer needs.`,
      `Rewrite this offer in the style of Hormozi's $100M Offers framework.`,
      `Identify 20 additional bonuses we could ethically add without increasing cost.`,
      `Generate 8 'fast-action' bonus ideas for a limited-time launch.`,
      `Turn this service into a productized, fixed-scope, fixed-price system.`,
      `Break this offer into 10 modular components for upsells and downsells.`,
      `Write a 12-month product roadmap with sequential offers.`,
      `Create 15 micro-offers under £50 to build buyer intent.`,
      `Improve this offer's clarity and guarantee: [paste offer]`,
      `Identify 20 objections stopping someone buying this product.`,
      `Turn these objections into 20 buying triggers.`,
      `Create 6 high-value bundles that increase perceived value.`,
      `Reposition this offer as a premium category king.`,
      `Turn this in-person service into a scalable AI-powered system.`,
      `Rewrite this offer for CEOs → rewrite for creators → rewrite for solopreneurs.`,
      `Create 12 pricing-tier frameworks with rationale.`,
      `Invent 20 new hooks tied to this product's transformation.`,
      `Generate 20 'what's included' points for a landing page.`,
      `Identify 15 irresistible guarantees.`,
      `Turn this bland feature list into 20 emotional-benefit bullets.`,
      `Create a competitor-proof angle for [product].`,
      `List 12 potential add-on services that increase AOV.`,
      `Build a 3-step upsell ladder.`,
      `Turn this niche into 15 micro-niches to dominate.`,
      `Create 6 niching frameworks for this offer.`,
      `Craft a compelling mission-driven angle.`,
      `Rewrite this offer for luxury buyers.`,
      `Generate 10 real-world demonstrations that showcase value.`,
      `Create an offer that shortcuts the user's hardest steps.`,
      `Rewrite this product into a subscription with recurring value.`,
      `Invent 8 new product lines based on buyer psychology.`,
      `Do a 20-point offer audit.`,
      `Generate 12 founder stories that strengthen the offer.`,
      `Turn this product into a B2B licensing model.`,
      `Rewrite the offer for US, UK, and EU buyers.`,
      `Turn customer complaints into product upgrades.`,
      `Create a 'done-with-you' version of this service.`,
      `Build a version with AI automation as the core value.`,
      `Generate 6 VIP premium tiers.`,
      `Turn this digital product into a physical version.`,
      `Turn this physical product into a digital companion.`,
      `Create 12 onboarding frameworks.`,
      `Write a product spec sheet with all benefits.`,
      `Invent 10 'category creation' angles.`,
      `Rewrite this offer to sell without discounts.`,
      `Identify 10 places where perceived value is leaking.`,
      `Turn this into a viral TikTok Shop bundle.`,
      `Invent a new category name for this product.`,
      `Create a launch stack with irresistible bonuses.`,
      `List 20 'aha moments' that make users feel value.`,
      `Rewrite the offer using prestige framing.`,
      `Explain why this offer feels expensive and fix it.`,
      `Turn this into a partnership or affiliate program.`,
    ],
  },
  {
    label: "MARKETING & ADS PROMPTS",
    color: MAGENTA,
    links: [
      { icon: "💎", label: "Marketing & Ads Expert — Gemini", link: "https://gemini.google.com/gem/1Mp21czM4QC9Y8mrW2fmIjsDD4OPrmT3z?usp=sharing" },
      { icon: "🤖", label: "Marketing & Ads Expert — OpenAI", link: "https://chatgpt.com/g/g-695c312e16848191be435f3e439a846f-marketing-and-ads-prompt-expert" },
    ],
    prompts: [
      `Act as a performance marketer. Turn this website into 12 high-converting ad angles: [URL]`,
      `Turn this product into 20 TikTok hooks based on curiosity, POV, and emotional payoff: [product]`,
      `Create a full Meta Ads campaign structure for [niche] with budgets, audiences, and warm → cold funnels.`,
      `Rewrite this landing page using $100M Offers principles: [paste copy]`,
      `Analyze these competitors and extract their winning messaging patterns: [URLs]`,
      `Give me 25 YouTube pre-roll ad scripts using the first 5-second 'scroll-break' rule for [product].`,
      `Generate 15 UGC ad scripts following the 'Problem → Chaos → Solution' format.`,
      `Write 10 long-form advertorial angles for [product] with clickthrough CTAs.`,
      `Give me 15 'Testimonial-style' ad scripts with timestamped beats.`,
      `Identify the deepest emotional desire behind buying [product].`,
      `Draft a 3-step retargeting funnel with custom creative concepts.`,
      `Generate 30 variations of high-intent Meta primary text.`,
      `Turn this article into 15 ad hooks worth split-testing: [link]`,
      `Give me 25 'I tried X so you don't have to' short-form angles.`,
      `Craft 10 direct-response Facebook headlines using the 4U formula.`,
      `Give me 20 TikTok-style creator scripts with trending sounds.`,
      `Turn my product reviews into 15 UGC scripts: [reviews]`,
      `Generate a 5-step top-of-funnel acquisition campaign for [brand].`,
      `Rewrite this email sequence for conversions: [email]`,
      `Turn this product page into 18 problem-first ad hooks.`,
      `Give me 12 fear-based angles that stay ethical.`,
      `Give me Apple-style ads for [brand].`,
      `Give me Duolingo-style unhinged ad ideas.`,
      `Create 10 hooks using Lindy messaging principles.`,
      `Break this offer into 25 micro pain points users pay to remove.`,
      `Generate 10 Meta Ads theme testing concepts.`,
      `Create 15 meme-ad concepts for [brand].`,
      `Give me 20 tweets that would go viral promoting [tool].`,
      `Generate a 'founder reaction' ad script mocking competitors.`,
      `Create 8 scarcity-based angles without sounding scammy.`,
      `Give me 10 user-persona-specific ad angles.`,
      `Turn this customer avatar into 10 emotional before/after states.`,
      `Turn this value prop into 20 ad hooks using the 'contrarian rule'.`,
      `Write a Twitter thread selling [offer] without telling people you're selling.`,
      `Generate a 3-video funnel for TikTok Shop promoting [product].`,
      `Create 10 AI influencer scripts promoting [product].`,
      `Give me 20 'unexpected payoff' short-form hooks.`,
      `Break down the top 10 angles competitors use and remake them better.`,
      `Give me 20 POV-style TikTok hooks specific to [product].`,
      `Turn this raw footage idea into a full UGC TikTok ad concept.`,
      `Generate 12 newsletter-style ads for native advertising.`,
      `Turn this PDF into 15 Twitter ad angles.`,
      `Give me 10 'start with the controversy' ad scripts.`,
      `Create 10 founder-on-iPhone ads promoting [product].`,
      `Give me 15 carousel ad ideas.`,
      `Turn this feature list into 20 benefits using deeper layers.`,
      `Create a complete warm retargeting funnel with scripts.`,
      `Write an advertorial for [product] framed as new research.`,
      `Give me 10 landing page hero headlines.`,
      `Write 8 call-to-action variations based on motivation types.`,
      `Give me 25 hooks written like Hormozi.`,
      `Write 20 TikTok-style 'quick cuts' ad scripts.`,
      `Generate 12 curiosity gaps promoting [offer].`,
      `Turn this lead magnet into 9 ads.`,
      `Create a 3-theme UGC testing framework.`,
      `Shorten this ad into 10 viral 3-second hooks.`,
      `Rewrite this script for YouTube ads.`,
      `Give me 10 influencer collaboration scripts.`,
      `Generate 15 ad variations for each buying stage.`,
      `Turn this 3-minute script into a TikTok Shop short.`,
      `Give me 8 founder story ads.`,
      `Make 20 pain-based TikTok hooks.`,
      `Turn this review section into short-form ad beats.`,
      `Create 10 'meta' ads that break the fourth wall.`,
      `Write 6 long-form cold email ads.`,
      `Give me 10 hype-style listicle ads.`,
      `Write 12 viral TikTok-style ad comments.`,
      `Generate 10 seasonal angles.`,
      `Turn this offer into 15 'This changes everything' angles.`,
      `Analyze this audience and invent 12 new hooks they've never seen.`,
      `Create 10 'duet'-friendly TikTok ad concepts.`,
      `Craft 15 curiosity headlines for newsletter ads.`,
      `Turn this FAQ section into 15 ads.`,
      `Generate 10 'build tension → release tension' hooks.`,
      `Give me 8 product demos using no real footage.`,
      `Create 20 PPC-style headlines.`,
      `Rewrite these ads with 10% more punch.`,
      `Turn this landing page into 12 ads.`,
      `Give me 7 'step-by-step' ads for TikTok.`,
      `Write 10 B2B ads that feel like B2C.`,
    ],
  },
  {
    label: "GROWTH & VIRALITY PROMPTS",
    color: LIME,
    links: [
      { icon: "💎", label: "Growth & Virality Expert — Gemini", link: "https://gemini.google.com/gem/1bu2bDXeJnA_e8CUttihARV4POT5Bpnqj?usp=sharing" },
      { icon: "🤖", label: "Growth & Virality Expert — OpenAI", link: "https://chatgpt.com/g/g-695c387ace0481919a779a2ce68440f3-growth-and-virality-prompt-expert" },
    ],
    prompts: [
      `Create 20 viral hook frameworks for TikTok and YouTube Shorts.`,
      `Identify 20 relatable pain points for [audience] that go viral.`,
      `Turn this boring concept into 15 viral-first ideas.`,
      `Create 10 provocative takes that spark debate in the niche.`,
      `Rewrite this into a viral Twitter/X thread.`,
      `Make this idea 10x more shareable.`,
      `Find 12 ways to productise this into a viral challenge.`,
      `Turn this into a 30-day content challenge users will join.`,
      `Rewrite this for maximum virality in vertical video.`,
      `Give me 10 MrBeast-style viral titles for this niche.`,
      `Create 20 viral storytelling templates that hook instantly.`,
      `Generate 15 ways to make this content emotionally punchy.`,
      `Rewrite this script using curiosity gaps.`,
      `Create 10 'pattern interrupt' edits ideas.`,
      `Identify 10 trends about to go viral in this industry.`,
      `Create 12 viral frameworks based on polarisation.`,
      `Make this content more controversial but still safe.`,
      `Turn this TikTok trend into content for my product.`,
      `Translate this idea into a meme series.`,
      `Turn this idea into a viral UGC challenge.`,
      `Give me 15 tweet hooks that force shares.`,
      `Rewrite this idea to be more unexpected and disruptive.`,
      `Turn my story into a viral transformation arc.`,
      `Create 20 short-form video hook formulas.`,
      `Identify 10 archetypes that always perform.`,
      `Make this niche more interesting by adding conflict.`,
      `Create a viral loop mechanic for user growth.`,
      `Rewrite this CTA to generate reposts.`,
      `Turn my offer into a viral giveaway idea.`,
      `Create 10 formats that use curiosity loops.`,
      `Turn these insights into viral carousels.`,
      `Make this post 10x more controversial.`,
      `Generate a viral thread based on this screenshot.`,
      `Rewrite this script in TikTok-native pacing.`,
      `Create a viral 'duet bait' script.`,
      `Give me 10 viral POV-style scripts.`,
      `Rewrite these testimonials to be more viral.`,
      `Create a viral hook based on common misconceptions.`,
      `Turn this dataset into a viral visualisation.`,
      `Write 12 hooks based on emotional tension.`,
    ],
  },
  {
    label: "AI UGC, CREATIVES & CONTENT PRODUCTION",
    color: TEAL,
    links: [
      { icon: "💎", label: "AI UGC & Content Expert — Gemini", link: "https://gemini.google.com/gem/132A4kvqg62ZulVAMuQIFJJmjJS7Il7MA?usp=sharing" },
      { icon: "🤖", label: "AI UGC & Content Expert — OpenAI", link: "https://chatgpt.com/g/g-695c3aa4fd808191a2809e2a34341155-ai-ugc-creatives-and-content-production-expert" },
    ],
    prompts: [
      `Generate a full 60s UGC script using (Hook → Story → Demo → CTA).`,
      `Turn this product into 10 Maxfusion-ready AI influencer shot lists.`,
      `Rewrite this script for a female wellness creator.`,
      `Rewrite this script for a male creator.`,
      `Generate 15 object-in-hand shot variations.`,
      `Turn this raw image into 12 Nano Banana editing prompts.`,
      `Create 10 talking-head script templates for AI avatars.`,
      `Write a 7-scene TikTok ad storyboard.`,
      `Create a 15-shot UGC filming plan.`,
      `Rewrite this like a native TikTok creator.`,
      `Rewrite this for a tech/product reviewer voice.`,
      `Turn this testimonial into a short-form UGC ad.`,
      `Rewrite this script as a POV skit.`,
      `Create 12 'founder on iPhone' raw scripts.`,
      `Create 10 side-by-side comparison script structures.`,
      `Turn this feature list into a voiceover script.`,
      `Write 20 Nano Banana Pro edit prompts for realism.`,
      `Make 12 'scroll-stopping' frames for the hook.`,
      `Improve this shot list for pacing.`,
      `Create 8 'before/after' transformation shots.`,
      `Turn this idea into a CapCut template script.`,
      `Write 15 influencer-style intro lines.`,
      `Generate 10 humorous UGC angles.`,
      `Turn this long script into 10 micro clips.`,
      `Create 10 Maxfusion avatar scenarios.`,
      `Write scripts for skincare, fitness, finance, tech, food variations.`,
      `Rewrite this into TikTok-native pacing.`,
      `Create 12 #TikTokMadeMeBuyIt angles.`,
      `Turn this into a product-in-hand explainer.`,
      `Write 10 POV ads from the product's perspective.`,
      `Turn this into an unboxing video.`,
      `Create 8 UGC ads that don't show a face.`,
      `Rewrite this script for Gen Z humour.`,
      `Write a 30s voiceover-only ad script.`,
      `Create 10 talking AI avatar ideas using Maxfusion ai.`,
      `Turn this landing page into a TikTok UGC script.`,
      `Write 10 ASMR-style product scripts.`,
      `Generate 12 realism-improving prompts for AI-generated faces.`,
      `Turn this offer into a 3-part UGC funnel.`,
      `Create 10 lifestyle-shot prompts.`,
      `Write 6 emotional storytelling ads.`,
      `Turn this YouTube script into 10 TikToks.`,
      `Write a Green Screen reaction ad.`,
    ],
  },
  {
    label: "SALES, OUTBOUND & DEMAND GEN",
    color: EMBER,
    links: [
      { icon: "💎", label: "Sales, Outbound & Demand Gen — Gemini", link: "https://gemini.google.com/gem/1MaXcdLb984qg-e9Ay7u_sEVUBYbrjGvz?usp=sharing" },
      { icon: "🤖", label: "Sales, Outbound & Demand Gen — OpenAI", link: "https://chatgpt.com/g/g-695c3ca2009c819196cd04fee677b77a-sales-outbound-and-demand-gen-expert" },
    ],
    prompts: [
      `Write an outbound sequence using pain → agitation → solution.`,
      `Rewrite this cold DM to sound human, not salesy.`,
      `Turn the website into a personalised cold DM: [URL]`,
      `Create 10 opener lines that get responses.`,
      `Turn this case study into a LinkedIn DM script.`,
      `Rewrite this DM for founders → rewrite for CMOs → rewrite for coaches.`,
      `Generate 8 follow-up messages that don't annoy people.`,
      `Turn my offer into 10 irresistible one-liners.`,
      `Rewrite this outreach for 90% shorter responses.`,
      `Create a nurture sequence for LinkedIn comments.`,
      `Rewrite this email for high-authority buyers.`,
      `Generate 10 call openers for sales calls.`,
      `Write a 7-email nurture sequence.`,
      `Turn this product into a 'value drop' message.`,
      `Rewrite my outbound like a top closer.`,
      `Turn this DM into a voice note script.`,
      `Generate 10 permission-based cold DMs.`,
      `Turn my profile into a daily inbound machine.`,
      `Create scripts for selling without pitching.`,
      `Rewrite this proposal to close faster.`,
      `Analyse this transcript and tell me what to improve.`,
      `Create a 'soft ask' CTA for my DMs.`,
      `Turn this comment into a lead.`,
      `Write 10 LinkedIn hook lines that spark DMs.`,
      `Rewrite this for humour and personality.`,
      `Generate 10 objection responses.`,
      `Turn objections into buying triggers.`,
      `Rewrite this email for 50% shorter length.`,
      `Rewrite this for 90% more authority.`,
      `Create a frictionless booking CTA.`,
      `Create a 3-email reactivation sequence.`,
      `Rewrite this DM for maximum intrigue.`,
      `Generate 10 'value-first' outreach angles.`,
      `Create 6 high-touch follow-ups.`,
      `Write a 'breakup email' that gets replies.`,
      `Turn this case study into a one-message close.`,
      `Rewrite this into an irresistible angle.`,
      `Write 8 'pattern interrupt' openers.`,
      `Turn this script into a 60s voice note.`,
      `Rewrite this to sound like a founder, not a salesperson.`,
      `Analyse this LinkedIn profile and generate personalised DMs.`,
      `Turn this offer into a demand creation post.`,
      `Create 10 lead magnets based on the offer.`,
      `Rewrite this landing page headline for clarity.`,
      `Fix this CTA to reduce friction.`,
      `Create 10 inbound traps for LinkedIn.`,
    ],
  },
  {
    label: "SYSTEMS, AUTOMATION & OPERATIONS",
    color: CYAN,
    links: [
      { icon: "💎", label: "Systems, Automation & Ops — Gemini", link: "https://gemini.google.com/gem/1VDPzymg0eSGdhnJyCDCI1LTzJmGKSnc1?usp=sharing" },
      { icon: "🤖", label: "Systems, Automation & Ops — OpenAI", link: "https://chatgpt.com/g/g-695c3e8a29d88191a0431b1ead07bc66-systems-automations-and-operations-expert" },
    ],
    prompts: [
      `Turn this workflow into a step-by-step SOP.`,
      `Rewrite this SOP into a checklist.`,
      `Create a Notion dashboard plan for this project.`,
      `Turn this process into automation opportunities.`,
      `Create a weekly operating cadence.`,
      `Generate a company-level operating system.`,
      `Rewrite this so a VA can do it.`,
      `Turn this into a hiring spec.`,
      `Create onboarding docs from this process.`,
      `Create an execution playbook for [team].`,
      `Rewrite this workflow with AI integrations.`,
      `Create a training manual for this task.`,
      `Turn this into a repeatable 7-step process.`,
      `Identify inefficiencies in this workflow.`,
      `Rewrite this SOP using bulletproof clarity.`,
      `Create a CEO dashboard structure.`,
      `Turn this idea into a 90-day sprint.`,
      `Generate 12 automations using Zapier/Make.`,
      `Rewrite this to eliminate founder dependency.`,
      `Create a scalable agency operating system.`,
      `Create a customer success process.`,
      `Rewrite this into a service delivery workflow.`,
      `Turn this into a media buying operating system.`,
      `Turn this clip editing workflow into an SOP.`,
      `Create a reporting system for KPIs.`,
      `Rewrite this into a replicable content workflow.`,
      `Turn this team into a pod structure.`,
      `Create a recruitment pipeline workflow.`,
      `Rewrite this for operational efficiency.`,
    ],
  },
  {
    label: "ICP, MARKET RESEARCH & POSITIONING",
    color: VIOLET,
    links: [
      { icon: "💎", label: "ICP, Market Research & Positioning — Gemini", link: "https://gemini.google.com/gem/1XSN7zMjx71rxLBFAruaYDVryYzaG516z?usp=sharing" },
      { icon: "🤖", label: "ICP, Market Research & Positioning — OpenAI", link: "https://chatgpt.com/g/g-695c40476a8081918b765acb06da031d-icp-market-research-and-positioning-expert" },
    ],
    prompts: [
      `Identify 20 unmet needs in this niche.`,
      `Create 12 buyer personas with pains → desires → beliefs.`,
      `Rewrite the ICP at sophistication level 1 → 5.`,
      `Turn competitors' weaknesses into our strengths.`,
      `Rewrite this position so it stands alone in the market.`,
      `Create a category name for this business.`,
      `Identify 20 gaps in this industry we can exploit.`,
      `Map the top 15 buyer objections.`,
      `Turn this product into 10 different ICP variations.`,
      `Rewrite the brand story to attract premium buyers.`,
      `Turn this niche into 10 subcultures.`,
      `Identify the status markers buyers want.`,
      `Rewrite this positioning to sound elite.`,
      `Create a competitor map with white-space analysis.`,
      `Rewrite this product so it sells on identity, not utility.`,
      `Identify the emotional job-to-be-done.`,
      `Rewrite this messaging for sophistication-level 6.`,
      `Turn this into a contrarian position.`,
      `Rewrite this offer using loss aversion.`,
      `Identify outdated beliefs the brand can challenge.`,
    ],
  },
  {
    label: "STRATEGY, PLANNING & DECISION MAKING",
    color: GREEN,
    links: [
      { icon: "💎", label: "Strategy, Planning & Decision Making — Gemini", link: "https://gemini.google.com/gem/1XeZCRSget0zpe_taaKSeUOl_nbscUMrp?usp=sharing" },
      { icon: "🤖", label: "Strategy, Planning & Decision Making — OpenAI", link: "https://chatgpt.com/g/g-695c41be68d881918bcba13c93499fc1-strategy-planning-and-decision-making-expert" },
    ],
    prompts: [
      `Create a simulation of best/worst-case outcomes.`,
      `Turn this idea into a 12-month game plan.`,
      `Rewrite this strategy for 1-person execution.`,
      `Create a moat around this business.`,
      `Turn this idea into a step-by-step success path.`,
      `Rewrite this plan using first-principles reasoning.`,
      `Identify where this plan has hidden risk.`,
      `Rewrite this with 100x more clarity.`,
      `Turn this goal into a reverse-engineered roadmap.`,
      `Create a model for asymmetric bets.`,
      `Rewrite this plan for a lean version.`,
      `Turn this idea into 3 strategic options.`,
      `Rewrite this using anti-fragile principles.`,
      `Identify the leverage points in this system.`,
      `Rewrite this workflow to maximise ROI.`,
      `Create 3 versions of this strategy: cheap, mid, elite.`,
      `Identify the bottlenecks preventing scalability.`,
      `Turn this into a flywheel system.`,
      `Rewrite this to reduce founder burnout.`,
      `Create a contingency plan.`,
    ],
  },
  {
    label: "WRITING, EDITING & CONVERSION COPY",
    color: GOLD,
    links: [
      { icon: "💎", label: "Writing, Editing & Conversion — Gemini", link: "https://gemini.google.com/gem/1JgJgZcRsUFLa3dOTIG7JGoX24H1EDykO?usp=sharing" },
      { icon: "🤖", label: "Writing, Editing & Conversion — OpenAI", link: "https://chatgpt.com/g/g-695c43459bdc81919158227c44fe016e-writing-editing-and-conversion-copy-expert" },
    ],
    prompts: [
      `Rewrite this landing page for conversion.`,
      `Turn this long paragraph into punchy bullets.`,
      `Rewrite this story with more emotional power.`,
      `Turn this into a headline with clarity + intrigue.`,
      `Rewrite this using PAS.`,
      `Rewrite this using AIDA.`,
      `Rewrite this using the Big Domino belief.`,
      `Rewrite this using the Lindy method.`,
      `Rewrite this for more personality.`,
      `Turn this into a founder story.`,
      `Rewrite for prestige/luxury tone.`,
      `Make this more controversial.`,
      `Rewrite this for speed readers.`,
      `Turn this tweet into a long-form post.`,
      `Rewrite this into an email promo.`,
      `Make this sound 10x more confident.`,
      `Rewrite for TikTok-style pacing.`,
      `Rewrite this to be more persuasive.`,
      `Rewrite this for a sophisticated buyer.`,
      `Rewrite this for an emotional buyer.`,
      `Rewrite this for a logical buyer.`,
      `Rewrite this as a viral hook.`,
      `Turn this essay into a viral thread.`,
      `Rewrite this into a speech or video script.`,
      `Rewrite into a 'copy-and-paste' template.`,
      `Compress this text to 50% length.`,
      `Turn this text into a CTA-first ad.`,
      `Rewrite this for 5 alternative angles.`,
      `Rewrite for humour.`,
      `Rewrite this for higher clarity.`,
    ],
  },
];

function QuickScriptPanel({ cat }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(null);
  const t = useT();

  const copy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "10px 20px",
          border: `1px solid ${cat.color}${open ? "80" : "40"}`,
          background: open ? `${cat.color}18` : `${cat.color}08`,
          color: cat.color,
          fontFamily: "'Barlow Semi Condensed', 'Arial Black', sans-serif",
          fontSize: 13, letterSpacing: 2, fontWeight: 600,
          cursor: "pointer", transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${cat.color}18`; e.currentTarget.style.borderColor = `${cat.color}80`; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = `${cat.color}08`; e.currentTarget.style.borderColor = `${cat.color}40`; }}}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cat.color, boxShadow: `0 0 6px ${cat.color}`, flexShrink: 0 }} />
        {cat.label}
        <span style={{ fontSize: 9, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>{cat.prompts.length} prompts</span>
      </div>
      {open && (
        <div style={{ border: `1px solid ${cat.color}25`, borderTop: "none", background: "#0a0a0f" }}>
          {cat.links && cat.links.length > 0 && (
            <div style={{ display: "flex", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${cat.color}15`, flexWrap: "wrap" }}>
              {cat.links.map((l, j) => (
                <a key={j} href={l.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", border: `1px solid ${cat.color}40`, background: `${cat.color}08`, color: cat.color, fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${cat.color}18`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${cat.color}08`; }}
                  >
                    <span style={{ fontSize: 13 }}>{l.icon}</span> {l.label} ↗
                  </div>
                </a>
              ))}
            </div>
          )}
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
          {cat.prompts.map((p, i) => (
            <div key={i} onClick={() => copy(p, i)}
              style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 16px", borderBottom: i < cat.prompts.length - 1 ? `1px solid ${cat.color}10` : "none", cursor: "pointer", transition: "background 0.15s", background: copied === i ? `${cat.color}20` : "transparent" }}
              onMouseEnter={e => { if (copied !== i) e.currentTarget.style.background = `${cat.color}10`; }}
              onMouseLeave={e => { if (copied !== i) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: cat.color + "60", minWidth: 24, paddingTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 12, color: copied === i ? cat.color : "rgba(255,255,255,0.65)", lineHeight: 1.6, flex: 1, fontFamily: "system-ui" }}>{p}</span>
              <span style={{ fontSize: 9, color: copied === i ? cat.color : "rgba(255,255,255,0.2)", fontFamily: "'Courier New', monospace", letterSpacing: 1, flexShrink: 0, paddingTop: 2 }}>{copied === i ? "COPIED ✓" : "COPY"}</span>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LinkButtons({ buttons }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
      {buttons.map((btn, i) => <LinkBtn key={i} btn={btn} />)}
    </div>
  );
}

function InfrastructureView() {
  const t = useT();
  return (
    <div>
      <SectionHeader>Three Jobs — What You're Working On</SectionHeader>
      <ThreeJobsPanel />
      <SectionHeader>External Projects — Revenue Generating</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12, marginBottom: 8 }}>
        {EXTERNAL_PROJECTS.map((p, i) => <ExternalProjectCard key={i} project={p} />)}
      </div>
      <SectionHeader>Social Media</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12, marginBottom: 8 }}>
        {SOCIAL_MEDIA.map((p, i) => <ExternalProjectCard key={i} project={p} />)}
      </div>
      <CatHeader color={VIOLET}>AI Workflow Agents</CatHeader>
      <LinkButtons buttons={[
        { label: "GEM PRO", link: "https://lace-wolfberry-965.notion.site/450-GEMINI-3-PRO-FLASH-PROMPTS-2cc1f6060c488130970cf1ebc1d53e1c", color: GOLD },
        { label: "GPT", link: "https://chatgpt.com/", color: GREEN },
        { label: "GROK", link: "https://x.com/i/grok?conversation=2031638398050676836", color: CYAN },
        { label: "GEM — PRODUCT + OFFER CREATION EXPERT", link: "https://gemini.google.com/gem/4cbe4df1747f", color: VIOLET },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12, marginBottom: 8 }}>
        {AI_WORKFLOW_AGENTS.map((p, i) => <ExternalProjectCard key={i} project={p} />)}
      </div>
      <CatHeader color={MAGENTA}>Graphic Design Workflow</CatHeader>
      <LinkButtons buttons={[
        { label: "FROMSOFTWARE IMAGE CREATOR (ELDEN RING)", link: "https://rezuaq.be/new-area/image-creator/", color: EMBER },
        { label: "CHOICE T-SHIRTS", link: "https://www.canva.com/design/DAHEjHuwIHQ/b4c2U6aztoBMAuSjefCDSQ/edit?ui=e30&referrer=https%3A%2F%2Fwww.canva.com%2F", color: MAGENTA },
      ]} />
      <CatHeader color={GREEN}>Shop Workflow</CatHeader>
      <LinkButtons buttons={[
        { label: "KALODATA", link: "https://www.kalodata.com/product", color: CYAN },
        { label: "FASTMOSS", link: "https://www.fastmoss.com/", color: GREEN },
      ]} />
      <CatHeader color={TEAL}>More AI-Auto Workflow</CatHeader>
      <LinkButtons buttons={[
        { label: "MAKE.COM — FIRST AI AGENT", link: "https://help.make.com/create-your-first-ai-agent", color: CYAN },
        { label: "CREWAI MULTI-AGENT OPEN SOURCE", link: "https://crewai.com/open-source", color: GREEN },
        { label: "RTS AI AUTOMATION CONCEPT ARTICLE", link: "https://www.proofofconcept.pub/p/real-time-strategy-games-and-ai-interfaces", color: EMBER },
        { label: "N8N — AI VIRAL VIDEOS VEO3 → TIKTOK", link: "https://n8n.io/workflows/8642-generate-ai-viral-videos-with-veo-3-and-upload-to-tiktok/", color: MAGENTA },
        { label: "GOOGLE AI STUDIO — VEO 3.1", link: "https://aistudio.google.com/prompts/new_video?model=veo-3.1-fast-generate-preview", color: TEAL },
        { label: "GOOGLE AI STUDIO — NANO BANANA 2", link: "https://aistudio.google.com/prompts/new_chat?model=models%2Fgemini-3.1-flash-image-preview&prompt=Generate%20an%20image%20of%20a%20banana%20wearing%20a%20costume.", color: LIME },
      ]} />
      <CatHeader color={RED}>Media</CatHeader>
      <LinkButtons buttons={[
        { label: "YOUTUBE EDM PLAYLIST", link: "https://www.youtube.com/playlist?list=PLwgC-cD-X2_UHYNefBtw80urYufVvA8N5", color: RED },
        { label: "OSHO DISCOURSES", link: "https://oshoworld.com/the-book-of-wisdom-vol-1-01", color: GOLD },
        { label: "SOULS IMPROVEMENT COMMUNITY (SKOOL)", link: "https://www.skool.com/souls-improvement-8514", color: VIOLET },
        { label: "BT — YOUTUBE PROFITS", link: "https://community.brendaturner.com/c/program-materials/sections/863316/lessons/3278031", color: TEAL },
        { label: "CLAUDE ARTICLE", link: "https://www.newyorker.com/tech/annals-of-technology/claude-shannon-the-father-of-the-information-age-turns-1100100", color: MAGENTA },
        { label: "ONE PIECE QUOTES FOR VIDEOS", link: "https://www.youtube.com/watch?v=XMtmljz1Kq8", color: GOLD },
        { label: "CLAUDE'S BODY REDDIT PROJECT", color: VIOLET, children: [
          { label: "Theo — Controlling a Vector Robot", link: "https://www.reddit.com/r/claudexplorers/comments/1qaad1s/theo_controlling_a_vector_robot_through_mcp_or_in/" },
          { label: "Claude's Body Part 3 (Final)", link: "https://www.reddit.com/r/claudexplorers/comments/1qayn66/claudes_body_part_3_final_for_now/" },
          { label: "AutonCorp Biodome", link: "https://autoncorp.com/biodome/" },
        ]},
      ]} />
      <CatHeader color={CYAN}>Command Center</CatHeader>
      <LinkButtons buttons={[
        { label: "NETLIFY", link: "https://app.netlify.com/", color: CYAN },
        { label: "SHOPIFY STORE", link: "https://admin.shopify.com/store/choiceaurastore", color: GREEN },
        { label: "SUBSTACK", link: "https://substack.com/@tylerchoice", color: EMBER },
      ]} />
      <CatHeader color={GOLD}>Quickscripts</CatHeader>
      {QUICKSCRIPT_CATEGORIES.map((cat, i) => <QuickScriptPanel key={i} cat={cat} />)}
      <SectionHeader>Commerce Infrastructure</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 12 }}>
        {COMMERCE_NODES.map((n, i) => <NodeCard key={i} node={n} />)}
      </div>
      <SectionHeader>Revenue Paths</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 30 }}>
        {REVENUE_PATHS.map((r, i) => <RevenueCard key={i} r={r} />)}
      </div>
      <div style={{ textAlign: "center", margin: "30px 0 10px", padding: 20, border: `1px solid ${t.name === "clean" ? t.border : "rgba(255,215,0,0.1)"}`, background: t.name === "clean" ? t.surfaceAlt : "rgba(255,215,0,0.02)" }}>
        <div style={{ fontSize: 28 }}>🔥</div>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 3, color: t.g, marginTop: 6 }}>BONFIRE LIT — POINT 8 SURRENDER</div>
        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4, fontStyle: "italic" }}>"I let go, and it turns out this was already done for me."</div>
      </div>
    </div>
  );
}

function ProjectsView() {
  const t = useT();
  return (
    <div>
      <SectionHeader>Internal Projects — System Building</SectionHeader>
      {INTERNAL_PROJECTS.map((p, i) => <ProjectCard key={i} project={p} accent={CYAN} />)}
      <SectionHeader>AI Outsource Mini-Projects</SectionHeader>
      {MINI_PROJECTS.map((p, i) => (
        <div key={i} style={{ border: `1px solid ${t.border}`, padding: "12px 16px", marginBottom: 6, background: t.surface }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: t.textSub, fontFamily: t.fontBody }}>▸ {p.name}</span>
            <span style={tagStyle("queued")}>{p.status}</span>
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6 }}>{p.desc}</div>
        </div>
      ))}
    </div>
  );
}

function PlayerView() {
  const t = useT();
  const liveStats = useTikTokStats("tylerchoice");
  const activeContent = CONTENT_NODES.filter(n => n.status === "active").length;
  const totalContent = CONTENT_NODES.length;
  const activeCommerce = COMMERCE_NODES.filter(n => n.status === "active" || n.status === "new").length;
  const totalCommerce = COMMERCE_NODES.length;
  const totalProjects = EXTERNAL_PROJECTS.length + INTERNAL_PROJECTS.length;
  const startedProjects = [...EXTERNAL_PROJECTS, ...INTERNAL_PROJECTS].filter(p => p.status !== "not started" && p.status !== "uncreated").length;

  return (
    <div>
      <div style={{ border: `1px solid ${CYAN}25`, padding: 24, background: `linear-gradient(135deg, ${CYAN}05, ${MAGENTA}03)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: `radial-gradient(circle, ${CYAN}06, transparent)` }} />
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 80, height: 80, border: `2px solid ${CYAN}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, background: `${CYAN}08`, flexShrink: 0 }}>⚡</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, letterSpacing: 4, color: t.textLabel }}>OPERATOR</div>
            <div style={{ fontFamily: t.fontBody, fontWeight: 900, fontSize: 28, color: t.text, marginBottom: 2 }}>TYLER CHOICE</div>
            <div style={{ fontSize: 12, color: GOLD, fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>CHOICE AURA — FOUNDER</div>
            <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
              {[[liveStats.followers || "1,510", "FOLLOWERS", GOLD], [liveStats.likes || "22.8K", "LIKES", GREEN]].map(([val, lbl, col], i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: col, fontFamily: "'Courier New', monospace" }}>{val}</div>
                  <div style={{ fontSize: 8, color: t.textMuted, letterSpacing: 2 }}>{lbl}</div>
                </div>
              ))}
              {liveStats.error && <div style={{ fontSize: 8, color: RED, fontFamily: "'Courier New', monospace", letterSpacing: 1, alignSelf: "flex-end" }}>⚠ LIVE OFFLINE</div>}
              {!liveStats.error && !liveStats.loading && <div style={{ fontSize: 8, color: GREEN, fontFamily: "'Courier New', monospace", letterSpacing: 1, alignSelf: "flex-end", opacity: 0.6 }}>● LIVE</div>}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <ProgressBar label="CONTENT CHANNELS" value={activeContent} max={totalContent} color={GREEN} />
          <ProgressBar label="COMMERCE NODES" value={activeCommerce} max={totalCommerce} color={GOLD} />
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
              <div style={{ fontFamily: t.fontBody, fontWeight: 900, fontSize: 20, color: t.text }}>TYLER</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 3, color: `${GOLD}90` }}>OPERATOR DOSSIER</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { label: "GIFTS", color: GREEN, content: <div style={{ fontSize: 16, fontWeight: 700, color: t.text, fontFamily: t.fontBody }}>Voice</div> },
              { label: "PURPOSE", color: CYAN, content: <div style={{ fontSize: 12, color: t.textSub, lineHeight: 1.6 }}>Help people understand themselves, find out who they are</div> },
              { label: "AI BACKGROUND", color: MAGENTA, content: <div style={{ fontSize: 12, color: t.textSub, lineHeight: 1.6 }}>Grappling with AI ethics for a decade, Computer Information Systems</div> },
              { label: "IDEOLOGY", color: GOLD, content: <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["Freedom", "Inspiration", "Liberation"].map((v, i) => <span key={i} style={{ fontSize: 10, color: GOLD, border: `1px solid ${GOLD}30`, padding: "2px 8px", fontFamily: "'Courier New', monospace" }}>{v}</span>)}</div> },
            ].map((card, i) => (
              <div key={i} style={{ border: `1px solid ${card.color}15`, padding: 14, background: `${card.color}04` }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, letterSpacing: 3, color: card.color, marginBottom: 6 }}>◆ {card.label}</div>
                {card.content}
              </div>
            ))}
            <div style={{ border: `1px solid ${t.border}`, padding: 14, background: t.surface, gridColumn: "1 / -1" }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, letterSpacing: 3, color: t.textMuted, marginBottom: 8 }}>◆ PERSONAL GOALS</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[["Awareness", CYAN], ["Consciousness", MAGENTA], ["Self-Realization", GOLD]].map(([g, c], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 4, height: 4, background: c, boxShadow: `0 0 6px ${c}` }} />
                    <span style={{ fontSize: 13, color: t.textSub, fontFamily: t.fontBody, fontWeight: 600 }}>{g}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionHeader>Meta-Problem: Tyler's Operating System</SectionHeader>
      <div style={{ border: `1px solid ${t.border}`, padding: 16, background: t.surface, fontSize: 12, color: t.textMuted, lineHeight: 1.8 }}>
        <div style={{ color: EMBER, fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>◆ CONTEXT WINDOW CONSTRAINTS</div>
        Too little direction → paralysis. Too much planning → paralysis.<br />
        <div style={{ color: CYAN, fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 2, marginTop: 12, marginBottom: 8 }}>◆ TYLER'S WORKFLOW</div>
        What can this do? → Break into categories → Delegate strategy to high-end models → Delegate work to low-end models → Consider better tools → Breakdown to ELI5
        <div style={{ color: GREEN, fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 2, marginTop: 12, marginBottom: 8 }}>◆ INTRINSIC MOTIVATORS</div>
        Seeing status. Seeing room to grow. Map of the territory before making moves.
      </div>

      <SectionHeader>Mental Highlight Reel</SectionHeader>
      <div style={{ border: `1px dashed ${GOLD}20`, padding: 20, textAlign: "center", background: t.surface }}>
        <div style={{ fontSize: 24 }}>🏆</div>
        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8, fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>ACCOMPLISHMENTS TRACKING — COMING SOON</div>
        <div style={{ fontSize: 11, color: t.textLabel, marginTop: 4 }}>Every win gets logged here under your player profile.</div>
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
      <div style={{ border: `1px solid ${RED}20`, padding: 16, background: `${RED}04` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <PulsingDot color={RED} />
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: RED, letterSpacing: 2 }}>THREAT LEVEL: CRITICAL</span>
        </div>
        <div style={{ fontSize: 13, color: t.textSub, lineHeight: 1.8 }}>
          <strong style={{ color: t.text }}>MAIN PROBLEM:</strong> Collect Initial Resources — Need immediate money to begin using OpenClaw.<br />
          <strong style={{ color: t.text }}>META-PROBLEM:</strong> Tyler — limited mental resources, context window, intrinsic motivators, scope creep threat.
        </div>
      </div>
      <SectionHeader>Get Rich Operating Principles</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {OPERATING_PRINCIPLES.map((p, i) => (
          <div key={i} style={{ border: `1px solid ${t.name === "clean" ? t.border : "rgba(255,215,0,0.12)"}`, padding: 14, background: t.name === "clean" ? t.surfaceAlt : "rgba(255,215,0,0.02)" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: GOLD, letterSpacing: 2, marginBottom: 6 }}>{p.title}</div>
            <div style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.6 }}>{p.desc}</div>
          </div>
        ))}
      </div>
      <SectionHeader>Tyler's Prompts Vault</SectionHeader>
      {TYLER_PROMPTS.map((p, i) => (
        <div key={i} style={{ border: `1px solid ${t.name === "clean" ? t.border : "rgba(0,240,255,0.08)"}`, padding: "10px 14px", marginBottom: 6, background: t.surface, fontSize: 12, color: t.textSub, fontFamily: "'Courier New', monospace", lineHeight: 1.6 }}>
          <span style={{ color: CYAN, marginRight: 8 }}>›</span>{p}
        </div>
      ))}
      <SectionHeader>Game External Files — Services</SectionHeader>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {["fastmoss", "Maxfusion.ai", "AUTODS", "Socialone", "SalesSpy", "Colordata"].map((s, i) => (
          <div key={i} style={{ border: `1px solid ${t.border}`, padding: "8px 14px", fontSize: 11, color: t.textMuted, fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>{s}</div>
        ))}
      </div>
      <SectionHeader>Enneagram Wheel System</SectionHeader>
      <div style={{ border: `1px dashed ${t.border}`, padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 24 }}>☸</div>
        <div style={{ fontSize: 10, color: t.textLabel, marginTop: 8, fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>SEE CODEX TAB FOR FULL ENNEAGRAM SYSTEM</div>
      </div>
    </div>
  );
}

// ─── AGENTS VIEW ─────────────────────────────────────────────────────
function ExternalProjectCard({ project }) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const sc = statusColor(project.status, t);
  const isActive = ["live", "active", "deployed", "complete", "in progress"].includes(project.status);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        border: `1px solid ${expanded ? sc + "50" : sc + "20"}`,
        background: expanded ? `${sc}08` : t.surface,
        cursor: "pointer",
        transition: "all 0.3s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* top accent bar */}
      <div style={{ height: 2, background: sc, opacity: isActive ? 1 : 0.3, boxShadow: isActive ? `0 0 8px ${sc}` : "none" }} />
      <div style={{ padding: "16px 18px" }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: expanded ? 10 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48,
              border: `1px solid ${sc}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, background: `${sc}10`, flexShrink: 0,
              boxShadow: isActive ? `0 0 12px ${sc}30` : "none",
            }}>
              {project.icon}
            </div>
            <div>
              <div style={{ fontFamily: t.fontBody, fontWeight: 900, fontSize: 18, color: t.text, letterSpacing: 1 }}>{project.name}</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: sc, letterSpacing: 3, marginTop: 2 }}>EXTERNAL PROJECT</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: t.textLabel, letterSpacing: 2, marginTop: 2 }}>REVENUE GENERATING</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <PulsingDot color={sc} size={7} />
              <span style={{ ...tagStyle(project.status) }}>{project.status}</span>
            </div>
            <span style={{ color: t.textLabel, fontSize: 11, transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
          </div>
        </div>
        {expanded && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${sc}20` }}>
            <div style={{ fontSize: 12, color: t.textSub, lineHeight: 1.8, whiteSpace: "pre-line" }}>{project.desc}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function AgentCard({ agent }) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const sc = statusColor(agent.status, t);
  const isDeployed = agent.status === "deployed";

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        border: `1px solid ${expanded ? agent.color + "50" : agent.color + "20"}`,
        background: expanded ? `${agent.color}08` : t.surface,
        cursor: "pointer",
        transition: "all 0.3s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* top accent bar */}
      <div style={{ height: 2, background: agent.color, opacity: isDeployed ? 1 : 0.3, boxShadow: isDeployed ? `0 0 8px ${agent.color}` : "none" }} />

      <div style={{ padding: "16px 18px" }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48,
              border: `1px solid ${agent.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, background: `${agent.color}10`, flexShrink: 0,
              boxShadow: isDeployed ? `0 0 12px ${agent.color}30` : "none",
            }}>
              {agent.icon}
            </div>
            <div>
              <div style={{ fontFamily: t.fontBody, fontWeight: 900, fontSize: 18, color: t.text, letterSpacing: 1 }}>{agent.name}</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: agent.color, letterSpacing: 3, marginTop: 2 }}>{agent.subtitle}</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: t.textLabel, letterSpacing: 2, marginTop: 2 }}>{agent.role}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <PulsingDot color={sc} size={7} />
              <span style={{ ...tagStyle(agent.status) }}>{agent.status}</span>
            </div>
            <span style={{ color: t.textLabel, fontSize: 11, transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
          </div>
        </div>

        {/* Sub-agents row */}
        {agent.sub_agents.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: t.textLabel, letterSpacing: 2, alignSelf: "center" }}>SUB-AGENTS:</span>
            {agent.sub_agents.map((sa, i) => (
              <span key={i} style={{ fontSize: 9, color: agent.color, border: `1px solid ${agent.color}30`, padding: "2px 8px", fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>{sa}</span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ border: `1px solid ${t.border}`, padding: "8px 10px", background: t.surfaceAlt }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: RED, letterSpacing: 2, marginBottom: 4 }}>⚡ COST / UPKEEP</div>
            <div style={{ fontSize: 10, color: t.textSub, lineHeight: 1.5 }}>{agent.cost}</div>
            <div style={{ fontSize: 9, color: t.textMuted, marginTop: 2 }}>{agent.upkeep}</div>
          </div>
          <div style={{ border: `1px solid ${t.border}`, padding: "8px 10px", background: t.surfaceAlt }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: GOLD, letterSpacing: 2, marginBottom: 4 }}>💰 REVENUE</div>
            <div style={{ fontSize: 10, color: t.textSub, lineHeight: 1.5 }}>{agent.revenue}</div>
          </div>
        </div>

        {/* Resources */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: t.textLabel, letterSpacing: 2, alignSelf: "center" }}>REQUIRES:</span>
          {agent.resources.map((r, i) => (
            <span key={i} style={{ fontSize: 9, color: t.textMuted, border: `1px solid ${t.border}`, padding: "2px 8px", fontFamily: "'Courier New', monospace" }}>{r}</span>
          ))}
        </div>

        {/* Expanded description */}
        {expanded && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${agent.color}20` }}>
            <div style={{ fontSize: 12, color: t.textSub, lineHeight: 1.8 }}>{agent.desc}</div>
          </div>
        )}
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
      {/* Command summary bar */}
      <div style={{ border: `1px solid ${VIOLET}30`, padding: "14px 18px", marginBottom: 20, background: `${VIOLET}06`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚔</span>
          <div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: VIOLET, letterSpacing: 3 }}>AGENT COMMAND CENTER</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>AI units deployed across the map. Click any agent to inspect.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {[
            { label: "DEPLOYED", val: deployed, color: GREEN },
            { label: "BUILDING", val: building, color: CYAN },
            { label: "STANDBY", val: standby, color: t.textLabel },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 22, fontWeight: 900, color, textShadow: (color !== t.textLabel && t.name === "hud") ? `0 0 10px ${color}40` : "none" }}>{val}</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: t.textLabel, letterSpacing: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Deployed agents */}
      {deployed > 0 && (
        <>
          <SectionHeader color={GREEN}>Deployed — Active Units</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12, marginBottom: 8 }}>
            {AGENTS.filter(a => a.status === "deployed").map((a, i) => <AgentCard key={i} agent={a} />)}
          </div>
        </>
      )}

      {/* Building */}
      {building > 0 && (
        <>
          <SectionHeader color={CYAN}>In Progress — Under Construction</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12, marginBottom: 8 }}>
            {AGENTS.filter(a => a.status === "in progress").map((a, i) => <AgentCard key={i} agent={a} />)}
          </div>
        </>
      )}

      {/* Standby */}
      {standby > 0 && (
        <>
          <SectionHeader color={t.textLabel}>Not Deployed — Awaiting Resources</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12, marginBottom: 8 }}>
            {AGENTS.filter(a => a.status === "not deployed").map((a, i) => <AgentCard key={i} agent={a} />)}
          </div>
        </>
      )}

      {/* Resource unlock chain */}
      <SectionHeader color={GOLD}>Unlock Chain — Deploy Order</SectionHeader>
      <div style={{ border: `1px solid ${t.name === "clean" ? t.border : "rgba(255,215,0,0.12)"}`, padding: 16, background: t.name === "clean" ? t.surfaceAlt : "rgba(255,215,0,0.02)" }}>
        {[
          { step: "01", label: "Consulting $ IN", detail: "Work DMs → book calls → first payment lands", color: GREEN, unlocks: "Clark API keys + Nami capital + Zoro OpenClaw" },
          { step: "02", label: "Clark FULLY LIVE", detail: "API keys paid → pipeline runs → drop sales start", color: CYAN, unlocks: "Passive income stream begins" },
          { step: "03", label: "Salina COMPLETE", detail: "Viral scripts on demand → content velocity 10x", color: CYAN, unlocks: "TikTok Shop affiliate + views scale" },
          { step: "04", label: "Nina DEPLOYED", detail: "Product research + launch agent running", color: EMBER, unlocks: "Digital product revenue stream" },
          { step: "05", label: "Zoro ACTIVATED", detail: "OpenClaw funded → competitor intel flowing", color: MAGENTA, unlocks: "Content strategy optimized by data" },
          { step: "06", label: "Nami LIVE", detail: "Capital ready → strategy PDF loaded → trades begin", color: GOLD, unlocks: "Crypto returns compound" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: i < 5 ? `1px solid ${t.border}` : "none", alignItems: "flex-start" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 20, fontWeight: 900, color: `${item.color}50`, flexShrink: 0, minWidth: 36 }}>{item.step}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: 13, color: t.text }}>{item.label}</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{item.detail}</div>
              <div style={{ fontSize: 10, color: item.color, fontFamily: "'Courier New', monospace", letterSpacing: 1, marginTop: 4 }}>→ UNLOCKS: {item.unlocks}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodexView() {
  const t = useT();
  return (
    <div>
      <div style={{ border: `1px solid ${EMBER}25`, padding: 14, marginBottom: 20, background: `${EMBER}06`, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>📜</span>
        <div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 3, color: EMBER }}>CODEX — FULL OPERATING REFERENCE</div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>Claude's backend context + Tyler's operating manual. Last updated: March 2026 (Day 29)</div>
        </div>
      </div>

      <CodexSection title="Current Position — Point 8 Retention/Surrender" accent={EMBER} defaultOpen={true}>
        <div style={{ fontSize: 12, color: t.textSub, lineHeight: 1.8 }}>The viral video (Day 20, 15.8K+ views) was Point 7 — Presentation. Now in Point 8: collecting data, processing DMs, learning from feedback, surrendering outcomes. The danger is letting the wheel die at Point 8 from overwhelm, fear of disappointing people, or the emotional cost of holding space for 20+ strangers.</div>
      </CodexSection>

      <CodexSection title="Active Wheels & Stages" accent={CYAN}>
        {ACTIVE_WHEELS.map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 0", borderBottom: i < ACTIVE_WHEELS.length - 1 ? `1px solid ${t.border}` : "none" }}>
            <PulsingDot color={statusColor(w.status, t)} size={6} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: 13, color: t.text }}>{w.name}</span>
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: CYAN, border: `1px solid ${CYAN}30`, padding: "1px 6px", letterSpacing: 1 }}>{w.stage}</span>
              </div>
              <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{w.platform} — {w.notes}</div>
            </div>
          </div>
        ))}
      </CodexSection>

      <CodexSection title="Large Wheels Visible — Full Cycle Map" accent={MAGENTA}>
        {LARGE_WHEELS.map((w, i) => (
          <div key={i} style={{ border: `1px solid ${t.border}`, padding: 14, marginBottom: 8, background: t.surface }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
              <div><span style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: 14, color: t.text }}>{w.name}</span><span style={{ fontSize: 10, color: t.textLabel, marginLeft: 8 }}>{w.period}</span></div>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: MAGENTA, border: `1px solid ${MAGENTA}30`, padding: "2px 6px", letterSpacing: 1 }}>{w.type}</span>
            </div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, lineHeight: 1.6 }}>{w.desc}</div>
          </div>
        ))}
      </CodexSection>

      <CodexSection title="The Game 2025 — Master Wheel Levels" accent={GOLD}>
        <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 12 }}>Gamified Notion system tracking the entire year's progression.</div>
        {GAME_2025_LEVELS.map((lv, i) => (
          <div key={i} style={{ marginBottom: 10, padding: "10px 14px", border: `1px solid ${t.border}`, background: t.surface }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 16, fontWeight: 900, color: lv.color }}>{lv.level}</span>
                <span style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: 13, color: t.text }}>{lv.name}</span>
                <span style={{ fontSize: 10, color: t.textLabel }}>{lv.period}</span>
              </div>
              <span style={{ ...tagStyle(lv.pct === 100 ? "active" : lv.pct > 50 ? "planning" : "not started") }}>{lv.status}</span>
            </div>
            <div style={{ height: 3, background: t.border, marginBottom: 6 }}><div style={{ height: "100%", width: `${lv.pct}%`, background: lv.color, transition: "width 0.5s" }} /></div>
            <div style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.5 }}>{lv.notes}</div>
          </div>
        ))}
        <div style={{ marginTop: 12, padding: 12, border: `1px solid ${GOLD}15`, background: `${GOLD}04` }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2, color: GOLD, marginBottom: 8 }}>PRODUCTS & DELIVERABLES CREATED</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {PRODUCTS_CREATED.map((p, i) => <span key={i} style={{ fontSize: 10, color: t.textMuted, border: `1px solid ${t.border}`, padding: "2px 8px", background: t.surface }}>{p}</span>)}
          </div>
        </div>
      </CodexSection>

      <CodexSection title="Past Wheels — Fed Forward" accent={t.borderMed}>
        {PAST_WHEELS.map((w, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: i < PAST_WHEELS.length - 1 ? `1px solid ${t.border}` : "none" }}>
            <span style={{ fontSize: 11, color: t.textFaint, fontFamily: "'Courier New', monospace", flexShrink: 0 }}>→</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: 12, color: t.textSub }}>{w.name}</span>
              <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{w.happened}</div>
              <div style={{ fontSize: 10, color: GREEN, marginTop: 2 }}>Fed → {w.fed}</div>
            </div>
          </div>
        ))}
      </CodexSection>

      <CodexSection title="YouTube/TikTok Viral Quest — Timeline" accent={MAGENTA}>
        <div style={{ position: "relative", paddingLeft: 20 }}>
          <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 1, background: `${MAGENTA}20` }} />
          {VIRAL_TIMELINE.map((e, i) => (
            <div key={i} style={{ position: "relative", paddingBottom: 12, paddingLeft: 16 }}>
              <div style={{ position: "absolute", left: -17, top: 4, width: 8, height: 8, borderRadius: "50%", background: e.highlight ? MAGENTA : t.border, boxShadow: e.highlight ? `0 0 6px ${MAGENTA}` : "none" }} />
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: e.highlight ? MAGENTA : t.textMuted, letterSpacing: 1 }}>{e.date}</div>
              <div style={{ fontSize: 12, color: e.highlight ? t.textSub : t.textMuted, marginTop: 2 }}>{e.event}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, padding: 12, border: `1px solid ${MAGENTA}15`, background: `${MAGENTA}04`, fontSize: 11, color: t.textMuted, lineHeight: 1.6, fontStyle: "italic" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2, color: MAGENTA, marginBottom: 6, fontStyle: "normal" }}>HERO'S JOURNEY CYCLE</div>
          {HERO_JOURNEY}
        </div>
      </CodexSection>

      <CodexSection title="Goals — Active & Historical" accent={GOLD}>
        <div style={{ border: `1px solid ${GOLD}20`, padding: 14, marginBottom: 12, background: `${GOLD}06` }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2, color: GOLD, marginBottom: 6 }}>ACTIVE GOAL — MARCH 2026</div>
          <div style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: 15, color: t.text }}>Solving the Infinite Money Glitch</div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>AI automation + online revenue infrastructure → scalable income. $100K in 2026 target.</div>
        </div>
        {GOALS_HISTORICAL.map((g, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
            <span style={{ fontSize: 12, color: g.status === "done" ? GREEN : EMBER }}>{g.status === "done" ? "✓" : "◦"}</span>
            <span style={{ fontSize: 12, color: g.status === "done" ? t.textSub : t.textMuted }}>{g.goal}</span>
            {g.note && <span style={{ fontSize: 9, color: MAGENTA, fontFamily: "'Courier New', monospace" }}>← {g.note}</span>}
          </div>
        ))}
        <div style={{ marginTop: 10, padding: 10, border: `1px solid ${t.border}`, fontSize: 11, color: t.textMuted, lineHeight: 1.6 }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2, color: t.textLabel, marginBottom: 4 }}>PRE-VIRAL INTENTION CHAIN</div>
          July 30, 2025: "Go viral on YouTube" → Aug 2025 Level 6: "GO VIRAL ON TIKTOK" → Feb 25, 2026: Viral video lands (7 months later, different wheel)
        </div>
      </CodexSection>

      <CodexSection title="Operator Identity — What Tyler Is & Does" accent={CYAN}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={{ border: `1px solid ${GREEN}15`, padding: 14, background: `${GREEN}04` }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2, color: GREEN, marginBottom: 8 }}>WHAT TYLER IS</div>
            {TYLER_IS.map((item, i) => <div key={i} style={{ fontSize: 11, color: t.textSub, lineHeight: 1.6, padding: "3px 0" }}>▸ {item}</div>)}
          </div>
          <div style={{ border: `1px solid ${RED}15`, padding: 14, background: `${RED}04` }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2, color: RED, marginBottom: 8 }}>WHAT TYLER IS NOT</div>
            {TYLER_IS_NOT.map((item, i) => <div key={i} style={{ fontSize: 11, color: t.textSub, lineHeight: 1.6, padding: "3px 0" }}>✕ {item}</div>)}
          </div>
        </div>
        <div style={{ border: `1px solid ${t.border}`, padding: 14, background: t.surface }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2, color: CYAN, marginBottom: 8 }}>WHAT TYLER DOES IN 1-ON-1S</div>
          {WHAT_TYLER_DOES_1ON1.map((item, i) => <div key={i} style={{ fontSize: 11, color: t.textSub, lineHeight: 1.6, padding: "3px 0" }}>▸ {item}</div>)}
        </div>
      </CodexSection>

      <CodexSection title="Creator Inspirations" accent={MAGENTA}>
        {CREATOR_INSPIRATIONS.map((c, i) => (
          <div key={i} style={{ padding: "8px 0", borderBottom: i < CREATOR_INSPIRATIONS.length - 1 ? `1px solid ${t.border}` : "none" }}>
            <span style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: 13, color: t.text }}>{c.name}</span>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{c.note}</div>
          </div>
        ))}
      </CodexSection>

      <CodexSection title="Spiritual Framework — Fourth Way" accent={GOLD}>
        {SPIRITUAL_FRAMEWORK.map((s, i) => <div key={i} style={{ fontSize: 11, color: t.textSub, lineHeight: 1.6, padding: "4px 0" }}>◆ {s}</div>)}
        <div style={{ marginTop: 12, padding: 12, border: `1px dashed ${GOLD}15`, background: `${GOLD}02` }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2, color: GOLD, marginBottom: 8 }}>GUIDING QUOTES</div>
          {SPIRITUAL_QUOTES.map((q, i) => <div key={i} style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.6, padding: "4px 0", fontStyle: "italic" }}>"{q}"</div>)}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: t.textMuted, lineHeight: 1.6, padding: 10, border: `1px solid ${t.border}` }}>
          <strong style={{ color: t.textSub }}>The enlightened person Tyler spoke with told him:</strong> He still hasn't accepted the machine-like part of himself — the robot, the instinctual one.
        </div>
      </CodexSection>

      <CodexSection title="Journal Entries — Feb 28, 2026" accent={t.borderMed}>
        {JOURNAL_ENTRIES.map((j, i) => (
          <div key={i} style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.7, padding: "6px 0", borderBottom: i < JOURNAL_ENTRIES.length - 1 ? `1px solid ${t.border}` : "none", fontStyle: "italic" }}>"{j}"</div>
        ))}
      </CodexSection>

      <CodexSection title="System Prompts — Safety Check" accent={RED}>
        {CODEX_PROMPTS.map((p, i) => (
          <div key={i} style={{ border: "1px solid rgba(255,34,68,0.1)", padding: "10px 14px", marginBottom: 6, background: "rgba(255,34,68,0.02)" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2, color: RED, marginBottom: 4 }}>{p.name.toUpperCase()}</div>
            <div style={{ fontSize: 12, color: t.textSub, fontFamily: "'Courier New', monospace", lineHeight: 1.6 }}><span style={{ color: CYAN, marginRight: 8 }}>›</span>{p.prompt}</div>
          </div>
        ))}
      </CodexSection>

      <CodexSection title="Key Inflection Points — Timeline" accent={CYAN}>
        {[
          { date: "Pre-2024", event: "TheZenWorld, Meditation with Tyler, various websites — building skills in the dark" },
          { date: "2024", event: "Fourth Way YouTube (WildMaskPotentiality), business systems attempts, Kit newsletter" },
          { date: "Late 2024 / Early 2025", event: "Started TikTok. Choice Media channels. Nie account for worst videos." },
          { date: "~Feb 2026", event: "Started 90-Day Challenge. Robert Oliver edits. Hopecore edits begin." },
          { date: "Feb 8, 2026", event: "Day 1 of current TikTok run" },
          { date: "Feb 26, 2026 (Day 19)", event: "'Want' video — pinned, 10K views" },
          { date: "Feb 25, 2026 (Day ~18)", event: "Viral video — 15.8K+ views, 18.1K on second count. 1,040 followers (from 511)." },
          { date: "Feb 28, 2026 (Day 22)", event: "1,204 followers. 20+ DMs processed. Calendly set up. Point 8 retention work." },
        ].map((e, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: CYAN, minWidth: 160, flexShrink: 0 }}>{e.date}</span>
            <span style={{ fontSize: 11, color: t.textSub }}>{e.event}</span>
          </div>
        ))}
      </CodexSection>

      <CodexSection title="Accounts & Links" accent={t.borderMed}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 6 }}>
          {[
            { label: "TikTok main", value: "@tylerchoice" }, { label: "TikTok Nie", value: "@nie.aura" },
            { label: "YouTube (new)", value: "@tylerchoicemedia" }, { label: "YouTube (shorts)", value: "@EVA-9.0 (winding down)" },
            { label: "YouTube (4th Way)", value: "@wildmaskpotentiality (inactive)" }, { label: "Instagram", value: "Crossposting through March" },
            { label: "Substack", value: "substack.com/@niearchive" }, { label: "Calendly", value: "calendly.com/tylerchoice/" },
            { label: "Linktree", value: "linktr.ee/tylerchoice" }, { label: "Shopify", value: "choiceaurastore.myshopify.com" },
          ].map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", border: `1px solid ${t.border}`, background: t.surface }}>
              <span style={{ fontSize: 10, color: t.textMuted, fontFamily: "'Courier New', monospace" }}>{a.label}</span>
              <span style={{ fontSize: 11, color: t.textSub }}>{a.value}</span>
            </div>
          ))}
        </div>
      </CodexSection>
    </div>
  );
}

// ─── FIELD RESEARCH VIEW ─────────────────────────────────────────────
function FieldResearchView() {
  const t = useT();
  return (
    <div>
      <SectionHeader color={TEAL}>Field Research</SectionHeader>
      <div style={{ border: `1px solid ${TEAL}20`, padding: 40, textAlign: "center", background: `${TEAL}04` }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>🔭</div>
        <div style={{ fontSize: 11, color: TEAL, letterSpacing: 3, marginBottom: 8 }}>FIELD RESEARCH</div>
        <div style={{ fontSize: 12, color: t.textLabel, letterSpacing: 1 }}>— COMING SOON —</div>
      </div>
    </div>
  );
}

// ─── STRATEGIES VIEW ─────────────────────────────────────────────────
function StrategiesView() {
  const t = useT();
  return (
    <div>
      <SectionHeader color={LIME}>Strategies</SectionHeader>
      <div style={{ border: `1px solid ${LIME}20`, padding: 40, textAlign: "center", background: `${LIME}04` }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>♟️</div>
        <div style={{ fontSize: 11, color: LIME, letterSpacing: 3, marginBottom: 8 }}>STRATEGIES</div>
        <div style={{ fontSize: 12, color: t.textLabel, letterSpacing: 1 }}>— COMING SOON —</div>
      </div>
    </div>
  );
}

// ─── TETRIS VIEW ─────────────────────────────────────────────────────
const TW = 10, TH = 20, TC = 26;
const TPIECES = [
  { color: CYAN,    rots: [[[0,1],[1,1],[2,1],[3,1]],[[2,0],[2,1],[2,2],[2,3]]] },
  { color: GOLD,    rots: [[[0,0],[1,0],[0,1],[1,1]]] },
  { color: VIOLET,  rots: [[[0,0],[1,0],[2,0],[1,1]],[[0,0],[1,0],[1,1],[1,2]],[[1,0],[0,1],[1,1],[2,1]],[[0,0],[0,1],[1,1],[0,2]]] },
  { color: GREEN,   rots: [[[1,0],[2,0],[0,1],[1,1]],[[0,0],[0,1],[1,1],[1,2]]] },
  { color: RED,     rots: [[[0,0],[1,0],[1,1],[2,1]],[[1,0],[0,1],[1,1],[0,2]]] },
  { color: EMBER,   rots: [[[0,0],[0,1],[1,1],[2,1]],[[0,0],[1,0],[0,1],[0,2]],[[0,0],[1,0],[2,0],[2,1]],[[1,0],[1,1],[0,2],[1,2]]] },
  { color: MAGENTA, rots: [[[2,0],[0,1],[1,1],[2,1]],[[0,0],[0,1],[0,2],[1,2]],[[0,0],[1,0],[2,0],[0,1]],[[1,0],[0,1],[1,1],[1,2]]] },
];
function tNewPiece() {
  const p = TPIECES[Math.floor(Math.random() * TPIECES.length)];
  return { p, r: 0, x: 3, y: 0 };
}
function tCells(pc) {
  return pc.p.rots[pc.r % pc.p.rots.length].map(([dx, dy]) => [pc.x + dx, pc.y + dy]);
}
function tValid(board, pc) {
  return tCells(pc).every(([x, y]) => x >= 0 && x < TW && y >= 0 && y < TH && !board[y]?.[x]);
}
function tLock(board, pc) {
  const b = board.map(r => [...r]);
  tCells(pc).forEach(([x, y]) => { if (y >= 0) b[y][x] = pc.p.color; });
  return b;
}
function tClearLines(board) {
  const kept = board.filter(r => r.some(c => !c));
  const n = TH - kept.length;
  return { board: [...Array.from({ length: n }, () => Array(TW).fill(null)), ...kept], n };
}

function TetrisView() {
  const t = useT();
  const emptyBoard = () => Array.from({ length: TH }, () => Array(TW).fill(null));
  const [board, setBoard] = useState(emptyBoard);
  const [cur, setCur] = useState(null);
  const [nxt, setNxt] = useState(tNewPiece);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [over, setOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [running, setRunning] = useState(false);

  const ref = useRef({});
  useEffect(() => { ref.current = { board, cur, nxt, score, lines, level, over, paused, running }; });

  const doSpawn = useCallback((b, n, sc, li, lv) => {
    const { board: b2, n: cleared } = tClearLines(b);
    const pts = [0, 100, 300, 500, 800][Math.min(cleared, 4)] * lv;
    const newLines = li + cleared;
    setBoard(b2); setScore(sc + pts); setLines(newLines); setLevel(Math.floor(newLines / 10) + 1);
    if (!tValid(b2, n)) { setOver(true); return; }
    setCur(n); setNxt(tNewPiece());
  }, []);

  const doLock = useCallback((c) => {
    const { board: b, nxt: n, score: sc, lines: li, level: lv } = ref.current;
    doSpawn(tLock(b, c), n, sc, li, lv);
  }, [doSpawn]);

  const doDrop = useCallback(() => {
    const { cur: c, board: b, over: o, paused: p } = ref.current;
    if (!c || o || p) return;
    const moved = { ...c, y: c.y + 1 };
    if (tValid(b, moved)) setCur(moved); else doLock(c);
  }, [doLock]);

  useEffect(() => {
    if (!running || over) return;
    const iv = setInterval(doDrop, Math.max(80, 800 - (level - 1) * 70));
    return () => clearInterval(iv);
  }, [running, over, level, doDrop]);

  useEffect(() => {
    if (!running) return;
    const h = (e) => {
      const { cur: c, board: b, over: o, paused: p } = ref.current;
      if (e.key === 'p' || e.key === 'P') { if (!o) setPaused(x => !x); return; }
      if (o || p || !c) return;
      if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowLeft') { const m={...c,x:c.x-1}; if(tValid(b,m)) setCur(m); }
      else if (e.key === 'ArrowRight') { const m={...c,x:c.x+1}; if(tValid(b,m)) setCur(m); }
      else if (e.key === 'ArrowDown') doDrop();
      else if (e.key === 'ArrowUp') { const m={...c,r:(c.r+1)%c.p.rots.length}; if(tValid(b,m)) setCur(m); }
      else if (e.key === ' ') { let hy=c.y; while(tValid(b,{...c,y:hy+1})) hy++; doLock({...c,y:hy}); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [running, doDrop, doLock]);

  const startGame = () => {
    const p1 = tNewPiece(), p2 = tNewPiece();
    setBoard(emptyBoard()); setCur(p1); setNxt(p2);
    setScore(0); setLines(0); setLevel(1);
    setOver(false); setPaused(false); setRunning(true);
  };

  const ghost = (() => {
    if (!cur || over) return null;
    let gy = cur.y;
    while (tValid(board, { ...cur, y: gy + 1 })) gy++;
    return gy !== cur.y ? { ...cur, y: gy } : null;
  })();

  const activeCellSet = cur && !over ? new Set(tCells(cur).map(([x,y]) => `${x},${y}`)) : new Set();
  const ghostCellSet  = ghost ? new Set(tCells(ghost).map(([x,y]) => `${x},${y}`)) : new Set();
  const curColorMap   = cur && !over ? Object.fromEntries(tCells(cur).map(([x,y]) => [`${x},${y}`, cur.p.color])) : {};
  const nxtCellSet    = nxt ? new Set(nxt.p.rots[0].map(([dx,dy]) => `${dx},${dy}`)) : new Set();
  const isHud = t.name === 'hud';

  return (
    <div>
      <SectionHeader color={RED}>Tetris</SectionHeader>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Board */}
        <div style={{ position: 'relative', border: `1px solid ${RED}30`, background: isHud ? '#050508' : '#f0ece4', flexShrink: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TW}, ${TC}px)` }}>
            {Array.from({ length: TH }, (_, ri) => Array.from({ length: TW }, (_, ci) => {
              const key = `${ci},${ri}`;
              const isAct = activeCellSet.has(key);
              const isGh  = !isAct && ghostCellSet.has(key);
              const col   = isAct ? curColorMap[key] : board[ri][ci];
              return (
                <div key={key} style={{
                  width: TC, height: TC, boxSizing: 'border-box',
                  background: col ? col : isGh ? `${cur?.p.color}18` : 'transparent',
                  border: col
                    ? `1px solid ${col}88`
                    : isGh
                    ? `1px solid ${cur?.p.color}35`
                    : `1px solid ${isHud ? 'rgba(255,255,255,0.04)' : '#e0dbd0'}`,
                  boxShadow: col && isHud ? `inset 0 0 8px ${col}40` : 'none',
                }} />
              );
            }))}
          </div>
          {(!running || over || paused) && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
            }}>
              {!running && !over && <div style={{ fontSize: 11, color: CYAN, letterSpacing: 4, fontFamily: t.fontMono, textShadow: `0 0 12px ${CYAN}` }}>// TETRIS //</div>}
              {over && <div style={{ fontSize: 14, color: RED, letterSpacing: 4, fontFamily: t.fontMono, textShadow: `0 0 12px ${RED}` }}>GAME OVER</div>}
              {over && <div style={{ fontSize: 11, color: GOLD, fontFamily: t.fontMono }}>SCORE: {score.toLocaleString()}</div>}
              {paused && !over && <div style={{ fontSize: 13, color: GOLD, letterSpacing: 4, fontFamily: t.fontMono, textShadow: `0 0 10px ${GOLD}` }}>PAUSED</div>}
              <button onClick={paused && !over ? () => setPaused(false) : startGame} style={{
                background: 'transparent', border: `1px solid ${CYAN}`, color: CYAN,
                fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2,
                padding: '8px 24px', cursor: 'pointer',
                textShadow: `0 0 8px ${CYAN}80`,
              }}>
                {over ? '[ RESTART ]' : paused ? '[ RESUME ]' : '[ START ]'}
              </button>
              {paused && !over && (
                <button onClick={startGame} style={{
                  background: 'transparent', border: `1px solid ${RED}60`, color: RED,
                  fontFamily: t.fontMono, fontSize: 10, letterSpacing: 2,
                  padding: '6px 18px', cursor: 'pointer',
                }}>[ NEW GAME ]</button>
              )}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 130 }}>
          {[
            { label: 'SCORE', value: score.toLocaleString(), color: GOLD },
            { label: 'LINES', value: lines, color: CYAN },
            { label: 'LEVEL', value: level, color: GREEN },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ border: `1px solid ${color}25`, padding: '10px 14px', background: isHud ? `${color}07` : t.surface }}>
              <div style={{ fontSize: 9, color, letterSpacing: 3, marginBottom: 4, fontFamily: t.fontMono }}>{label}</div>
              <div style={{ fontSize: 22, color, fontFamily: t.fontMono, textShadow: isHud ? `0 0 12px ${color}50` : 'none' }}>{value}</div>
            </div>
          ))}
          <div style={{ border: `1px solid ${VIOLET}25`, padding: '10px 14px', background: isHud ? `${VIOLET}06` : t.surface }}>
            <div style={{ fontSize: 9, color: VIOLET, letterSpacing: 3, marginBottom: 10, fontFamily: t.fontMono }}>NEXT</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 14px)', gap: 2 }}>
              {Array.from({ length: 8 }, (_, i) => {
                const ci = i % 4, ri = Math.floor(i / 4);
                const has = nxtCellSet.has(`${ci},${ri}`);
                const c = has ? nxt?.p.color : null;
                return (
                  <div key={i} style={{
                    width: 14, height: 14,
                    background: c || 'transparent',
                    border: c ? `1px solid ${c}80` : '1px solid transparent',
                    boxShadow: c && isHud ? `0 0 4px ${c}` : 'none',
                  }} />
                );
              })}
            </div>
          </div>
          <div style={{ border: `1px solid ${t.border}`, padding: '10px 14px', background: isHud ? 'rgba(255,255,255,0.015)' : t.surface }}>
            <div style={{ fontSize: 9, color: t.textLabel, letterSpacing: 3, marginBottom: 8, fontFamily: t.fontMono }}>KEYS</div>
            {[['← →','Move'],['↑','Rotate'],['↓','Soft drop'],['SPC','Hard drop'],['P','Pause']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: CYAN, fontFamily: t.fontMono }}>{k}</span>
                <span style={{ fontSize: 9, color: t.textMuted }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────
const TABS = [
  { id: "infra", label: "Infrastructure", accent: CYAN },
  { id: "projects", label: "Projects", accent: MAGENTA },
  { id: "agents", label: "Agents", accent: VIOLET },
  { id: "player", label: "Player Profile", accent: GOLD },
  { id: "game", label: "Game Blocks", accent: GREEN },
  { id: "codex", label: "Codex", accent: EMBER },
  { id: "research", label: "Field Research", accent: TEAL },
  { id: "strategies", label: "Strategies", accent: LIME },
  { id: "tetris", label: "Tetris", accent: RED },
];

export default function App({ themeName = "hud", setThemeName = null }) {
  const [activeTab, setActiveTab] = useState("infra");
  const [time, setTime] = useState(new Date());
  const liveStats = useTikTokStats("tylerchoice");
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
      case "research": return <FieldResearchView />;
      case "strategies": return <StrategiesView />;
      case "tetris": return <TetrisView />;
      default: return <InfrastructureView />;
    }
  };

  return (
    <ThemeCtx.Provider value={t}>
      <div style={{ background: t.bg, color: t.text, fontFamily: t.fontBody, minHeight: "100vh", overflow: "hidden" }}>
        {t.name === "hud" && <Scanlines />}
        {t.name === "hud" && <GridBG />}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
          {/* HUD TOP */}
          <div style={{ border: `1px solid ${t.c}${t.name === "clean" ? "40" : "20"}`, padding: "12px 20px", marginBottom: 6, background: t.name === "clean" ? t.surface : "rgba(0,240,255,0.03)", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            {t.name === "hud" && <div style={{ position: "absolute", top: -1, left: 20, width: 200, height: 2, background: CYAN, boxShadow: `0 0 10px ${CYAN}` }} />}
            <div>
              {t.name === "hud" ? <GlitchText text="CHOICE AURA" fontSize={20} /> : <span style={{ fontFamily: t.fontMono, fontWeight: 900, fontSize: 20, letterSpacing: 4, color: t.c }}>CHOICE AURA</span>}
              <div style={{ fontSize: 10, letterSpacing: 3, color: t.textLabel, marginTop: 2 }}>An interface between human and AI.</div>
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 18, fontSize: 10, letterSpacing: 2, color: t.textMuted, flexWrap: "wrap", alignItems: "center" }}>
                <span>FOLLOWERS <span style={{ color: t.g }}>{liveStats.followers || "1,510"}</span></span>
                <span>LIKES <span style={{ color: t.g }}>{liveStats.likes || "22.8K"}</span></span>
                {!liveStats.loading && !liveStats.error && <span style={{ fontSize: 8, color: GREEN, opacity: 0.5 }}>●</span>}
                {liveStats.error && <span style={{ fontSize: 8, color: RED, opacity: 0.7 }}>⚠</span>}
                <span>{time.toLocaleTimeString("en-US", { hour12: false })}</span>
              </div>
              <ThemeToggle theme={themeName} onToggle={() => setThemeName && setThemeName(n => n === "clean" ? "hud" : "clean")} />
            </div>
          </div>
          {/* QUEST BAR */}
          <div style={{ border: `1px solid ${t.mg}30`, padding: "8px 16px", marginBottom: 6, background: `${t.mg}05`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mg, border: `1px solid ${t.mg}`, padding: "2px 8px", letterSpacing: 2, textShadow: t.name === "hud" ? `0 0 8px ${t.mg}` : "none", whiteSpace: "nowrap" }}>QUEST</span>
            <span style={{ fontSize: 13, color: t.textSub }}>SOLVING THE <strong style={{ color: t.g, textShadow: t.name === "hud" ? `0 0 12px ${t.g}30` : "none" }}>INFINITE MONEY GLITCH</strong> — <strong style={{ color: t.g }}>$100K / 2026</strong></span>
          </div>
          {/* SUPPORT BAR */}
          <div style={{ border: `1px solid ${t.gr}20`, padding: "8px 16px", marginBottom: 16, background: `${t.gr}04`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.gr, border: `1px solid ${t.gr}`, padding: "2px 8px", letterSpacing: 2, whiteSpace: "nowrap" }}>SUPPORT</span>
            <span style={{ fontSize: 12, color: t.textSub }}>If this project has added value to your life, consider supporting it. Cash App: <strong style={{ color: t.gr }}>$HeavenIsGreen</strong></span>
          </div>
          {/* NAV TABS */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {TABS.map(tab => <NavTab key={tab.id} label={tab.label} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} accent={tab.accent} />)}
          </div>
          {/* CONTENT */}
          <div style={{ minHeight: 400 }}>{renderView()}</div>
          {/* BOTTOM HUD */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 30, paddingTop: 12, borderTop: `1px solid ${t.border}`, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 14 }}>
              {[{ c: GREEN, l: "ACTIVE" }, { c: VIOLET, l: "AGENTS" }, { c: MAGENTA, l: "NEW" }, { c: EMBER, l: "PENDING" }, { c: t.textFaint, l: "DORMANT" }].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.c, boxShadow: (item.c !== t.textFaint && t.name === "hud") ? `0 0 6px ${item.c}` : "none" }} />
                  <span style={{ fontSize: 9, color: t.textLabel, letterSpacing: 2 }}>{item.l}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 9, color: t.textFaint, letterSpacing: 2 }}>MARCH 2026 — TYLER CHOICE — v4.1</div>
          </div>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
