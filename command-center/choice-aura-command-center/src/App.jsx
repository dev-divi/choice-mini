import { useState, useEffect, createContext, useContext, useRef } from "react";

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
    const PROXY = "https://api.allorigins.win/get?url=";
    const TT_URL = encodeURIComponent(`https://www.tiktok.com/@${handle}`);

    const fetchStats = async () => {
      try {
        const res = await fetch(`${PROXY}${TT_URL}`, { cache: "no-store" });
        const data = await res.json();
        const html = data.contents || "";
        const match = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/);
        if (!match) throw new Error("no script tag");
        const json = JSON.parse(match[1]);
        const s = json?.["webapp.user-detail"]?.userInfo?.stats;
        if (!s) throw new Error("no stats");
        setStats({ followers: formatCount(s.followerCount), likes: formatCount(s.heartCount), loading: false, error: false, ts: Date.now() });
      } catch {
        setStats(prev => ({ ...prev, loading: false, error: true }));
      }
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
  { type: "job 2 — affiliate", name: "TikTok Shop Affiliate", detail: "5 videos/week cap\nEmbed products in main content — doesn't look like an ad", status: "pending", tag: null },
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

const EXTERNAL_PROJECTS = [
  { name: "Journal Ad Campaign", status: "planning", desc: "Up to 100 advertisements for journals sold on TikTok Shop. Show prototype in journal, show Claude creating it.", icon: "📓" },
  { name: "Day Series FB/IG Campaign", status: "in progress", desc: "Running autonomously. Day series auto-posting to IG, crossposting to FB separately. Queue ends ~March 17 (Day 11). Bio CTA live on IG. Facebook bio still pending.", icon: "📺" },
  { name: "Clark — Shop Automation", status: "complete", desc: "AI agents: find products, find suppliers, setup dropshipping stores, find & refine viral scripts.\n\nWorktree: githubswarm → choicemini > .claude > worktrees > inspiring-edison", icon: "🤖" },
  { name: "Salina — Frontend Automation", status: "in progress", desc: "Frontend automation project. Viral script created through nanobanana. Look into Higgsfield AI.", icon: "🎬" },
  { name: "Nina — Product Factory", status: "not started", desc: "Agent researches audience needs → creates products/MVPs → launches them → runs email/ad campaigns.", icon: "🏭" },
  { name: "Nami — Crypto Agent", status: "not started", desc: "Allocates resources and trades based on a PDF strategy style file.", icon: "₿" },
  { name: "Zoro — Competitor Agent", status: "not started", desc: "Research & reverse-engineering of specific TikTok influencers. Requires OpenClaw.", icon: "🔍" },
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
  { num: "01", title: "1:1 Services", color: "#00ff88", status: "ACTIVE — MOVE NOW", unlock: "Already unlocked", detail: "", blocker: null },
  { num: "02", title: "TikTok Shop Affiliate", color: "#00ff88", status: "ACTIVE", unlock: "", detail: "5 videos/week cap. Embed products naturally into main content — doesn't look like an ad. Same products can go in main content and drive commission. Scales without extra effort.", blocker: null },
  { num: "03", title: "Dropshipping (AutoDS)", color: "#ff6a00", status: "SYSTEM BUILT", unlock: "", detail: "Full AI automation system built. Can source, list, and fulfill without touching product. Can run parts manually while waiting for API keys. High exponential upside.", blocker: null },
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
  if (s === "in progress") return c;
  if (s === "complete") return gold;
  if (s === "new" || s === "just unlocked") return m;
  if (s === "pending" || s === "planning" || s === "due tonight" || s === "scheduled") return e;
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
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ border: `1px solid ${hovered ? t.g + (t.name === "clean" ? "80" : "40") : t.name === "clean" ? t.border : "rgba(255,215,0,0.15)"}`, padding: "14px 18px", background: hovered ? (t.name === "clean" ? t.surfaceHover : "rgba(255,215,0,0.04)") : t.surface, transition: "all 0.3s", textAlign: "center", transform: hovered ? "translateY(-2px)" : "none", boxShadow: hovered && t.name === "clean" ? "0 4px 16px rgba(0,0,0,0.1)" : "none" }}>
      <div style={{ fontFamily: t.fontMono, fontWeight: 900, fontSize: 26, color: t.g, textShadow: t.name === "hud" ? `0 0 20px ${GOLD}30` : "none" }}>{r.amount}</div>
      <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: 1, marginTop: 2 }}>{r.label}</div>
      <div style={{ fontSize: 11, color: t.textSub, marginTop: 6, fontFamily: t.fontBody }}>{r.source}</div>
    </div>
  );
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
function ThreeJobsPanel() {
  const t = useT();
  const [open, setOpen] = useState(null);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
        {THREE_JOBS.map((job, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{ border: `1px solid ${job.color}30`, padding: 16, background: t.name === "clean" ? t.surface : `${job.color}05`, cursor: "pointer", transition: "all 0.3s", boxShadow: open === i ? `0 0 20px ${job.color}15` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 28, fontWeight: 900, color: t.name === "clean" ? job.color + "90" : job.color + "40", lineHeight: 1 }}>JOB {job.num}</div>
                <div style={{ fontFamily: "system-ui", fontWeight: 800, fontSize: 16, color: t.text, marginTop: 4 }}>{job.title}</div>
                <div style={{ fontSize: 9, color: job.color, fontFamily: "'Courier New', monospace", letterSpacing: 2, marginTop: 4 }}>{job.status}</div>
              </div>
              <PulsingDot color={job.color} size={8} />
            </div>
            {open === i && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${job.color}20` }}>
                {job.detail && <div style={{ fontSize: 12, color: t.textSub, lineHeight: 1.7, marginBottom: 8 }}>{job.detail}</div>}
                {job.blocker && <div style={{ fontSize: 10, color: t.re, fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>⚠ {job.blocker}</div>}
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
  const t = useT();
  return (
    <div>
      <SectionHeader>Three Jobs — Current Situation</SectionHeader>
      <ThreeJobsPanel />
      <SectionHeader>Revenue Paths</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {REVENUE_PATHS.map((r, i) => <RevenueCard key={i} r={r} />)}
      </div>
      <SectionHeader>Commerce Infrastructure</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {COMMERCE_NODES.map((n, i) => <NodeCard key={i} node={n} />)}
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
      <SectionHeader>External Projects — Revenue Generating</SectionHeader>
      {EXTERNAL_PROJECTS.map((p, i) => <ProjectCard key={i} project={p} accent={MAGENTA} />)}
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
              {[["29", "DAY", CYAN], [liveStats.followers || "1,510", "FOLLOWERS", GOLD], [liveStats.likes || "22.8K", "LIKES", GREEN], ["1,100", "BOOKMARKS", MAGENTA]].map(([val, lbl, col], i) => (
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
              <div style={{ fontSize: 10, letterSpacing: 3, color: t.textLabel, marginTop: 2 }}>COMMAND CENTER — OPERATOR HUD + CLAUDE BACKEND CONTEXT</div>
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 18, fontSize: 10, letterSpacing: 2, color: t.textMuted, flexWrap: "wrap", alignItems: "center" }}>
                <span>DAY <span style={{ color: t.g }}>29</span></span>
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
