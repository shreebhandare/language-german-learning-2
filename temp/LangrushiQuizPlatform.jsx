import { useState, useEffect, useRef } from "react";
import {
  Home, BookOpen, BarChart3, Settings, LogOut, Search, Bell, User,
  ArrowRight, ArrowLeft, Lock, Eye, EyeOff, Trash2, Pencil, Download,
  Upload, Plus, MoreVertical, Lightbulb, Star, Trophy, Target,
  CheckCircle, XCircle, AlertTriangle, Info, PartyPopper, X, Check,
  Volume2, Image, PenLine, ChevronDown, ChevronUp, Menu, Shield,
  BookMarked, Clock, Award, TrendingUp, Users, LayoutDashboard,
  FileText, PlayCircle, RefreshCw, ExternalLink, Globe, Mail,
  CreditCard, ChevronRight, Loader2, AlertCircle
} from "lucide-react";

/* ────────────────────────────────────────────
   DESIGN TOKENS
──────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --brand-50: #EAF0F6;
    --brand-100: #D6E1EF;
    --brand-500: #355C96;
    --brand-600: #294875;
    --brand-700: #1E3658;
    --brand-800: #15263E;
    --brand-900: #0D1827;

    --accent-50: #FDE8E7;
    --accent-500: #F11810;
    --accent-600: #D1150E;

    --success-50: #F0FDF4;
    --success-200: #BBF7D0;
    --success-500: #22C55E;
    --success-600: #16A34A;

    --error-50: #FEF2F2;
    --error-200: #FECACA;
    --error-500: #EF4444;
    --error-600: #DC2626;

    --warning-50: #FFFBEB;
    --warning-200: #FDE68A;
    --warning-500: #F59E0B;
    --warning-600: #D97706;

    --info-50: #EFF6FF;
    --info-200: #BFDBFE;
    --info-500: #3B82F6;
    --info-600: #2563EB;

    --white: #FFFFFF;
    --gray-50: #F7F7F7;
    --gray-100: #EAEAEA;
    --gray-200: #D4D4D4;
    --gray-300: #BDBDBD;
    --gray-400: #9E9E9E;
    --gray-500: #757575;
    --gray-600: #545454;
    --gray-700: #333333;
    --gray-800: #1A1A1A;
    --gray-900: #000000;

    --backdrop: rgba(0, 0, 0, 0.5);
    --blur-locked: rgba(255, 255, 255, 0.7);

    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);

    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-2xl: 24px;
    --radius-full: 9999px;

    --font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-display: 'DM Serif Display', Georgia, serif;
  }

  body { font-family: var(--font-sans); background: var(--gray-50); color: var(--gray-900); line-height: 1.5; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--gray-100); }
  ::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: var(--radius-full); }

  /* Animations */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes confetti { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(80px) rotate(360deg); opacity: 0; } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .animate-fadeIn { animation: fadeIn 0.4s ease forwards; }
  .animate-scaleIn { animation: scaleIn 0.3s ease forwards; }
  .animate-slideUp { animation: slideUp 0.3s ease forwards; }

  /* Utility */
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }

  /* Focus styles */
  button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible {
    outline: 2px solid var(--brand-600);
    outline-offset: 2px;
  }

  /* Skeleton animation */
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, var(--gray-100) 25%, var(--gray-200) 50%, var(--gray-100) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius-md);
  }
`;

/* ────────────────────────────────────────────
   MOCK DATA
──────────────────────────────────────────── */
const QUIZZES = [
  { id: 1, title: "Der/Die/Das — Articles", category: "Grammar", level: "A1", type: "MCQ", access: "free", questions: 20, completed: true, score: 85 },
  { id: 2, title: "German Cases: Nominativ", category: "Grammar", level: "A2", type: "Fill-Blank", access: "registered", questions: 15, completed: false, score: null },
  { id: 3, title: "Akkusativ & Dativ", category: "Grammar", level: "B1", type: "MCQ", access: "premium", questions: 25, completed: false, score: null },
  { id: 4, title: "Modal Verbs (können/müssen)", category: "Verbs", level: "A2", type: "MCQ", access: "free", questions: 18, completed: true, score: 72 },
  { id: 5, title: "Verb Conjugation Present", category: "Verbs", level: "A1", type: "Fill-Blank", access: "registered", questions: 20, completed: false, score: null },
  { id: 6, title: "Adjective Declension", category: "Grammar", level: "B1", type: "MCQ", access: "premium", questions: 22, completed: false, score: null },
  { id: 7, title: "Separable Verbs", category: "Verbs", level: "B1", type: "True-False", access: "registered", questions: 16, completed: true, score: 93 },
  { id: 8, title: "German Word Order", category: "Syntax", level: "B2", type: "MCQ", access: "premium", questions: 30, completed: false, score: null },
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    text: "Which article is correct for the noun \"Haus\" (house)?",
    type: "MCQ",
    options: ["der Haus", "die Haus", "das Haus", "den Haus"],
    correct: 2,
    explanation: "\"Haus\" is a neuter noun, so it takes the article \"das\". Neuter nouns in German often end in -haus, -chen, -lein, or -um.",
    hint: "Think about the gender category — neuter nouns often use 'das'."
  },
  {
    id: 2,
    text: "\"Die Katze ___ auf dem Sofa.\" Fill in the correct verb form.",
    type: "Fill-Blank",
    answer: "sitzt",
    explanation: "The verb \"sitzen\" (to sit) conjugated with third-person singular \"sie\" (she) becomes \"sitzt\". The pattern is: ich sitze, du sitzt, er/sie/es sitzt.",
    hint: "Conjugate 'sitzen' for third-person singular (sie/er/es)."
  },
  {
    id: 3,
    text: "Is the following sentence grammatically correct? \"Ich habe gestern ins Kino gegangen.\"",
    type: "True-False",
    correct: false,
    explanation: "The sentence is INCORRECT. \"Gehen\" (to go) uses the auxiliary verb \"sein\" not \"haben\". Correct: \"Ich bin gestern ins Kino gegangen.\"",
    hint: "Verbs of motion usually use 'sein' as the auxiliary verb in Perfekt."
  },
];

/* ────────────────────────────────────────────
   SHARED COMPONENTS
──────────────────────────────────────────── */

// Badge
const Badge = ({ type, children, size = "sm" }) => {
  const configs = {
    level: { bg: "var(--brand-50)", color: "var(--brand-700)" },
    free: { bg: "var(--success-50)", color: "var(--success-600)" },
    registered: { bg: "var(--info-50)", color: "var(--info-600)" },
    premium: { bg: "#FFFBEB", color: "#B45309" },
    locked: { bg: "var(--gray-100)", color: "var(--gray-400)" },
    new: { bg: "var(--brand-600)", color: "var(--white)" },
    type: { bg: "var(--gray-100)", color: "var(--gray-600)" },
  };
  const cfg = configs[type] || configs.type;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: size === "sm" ? "2px 10px" : "4px 14px",
      borderRadius: "var(--radius-full)",
      backgroundColor: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 600, letterSpacing: "0.01em",
      whiteSpace: "nowrap",
    }}>
      {type === "locked" && <Lock size={10} />}
      {type === "premium" && <Star size={10} />}
      {children}
    </span>
  );
};

// Button
const Btn = ({ variant = "primary", size = "md", children, onClick, disabled, loading, fullWidth, type = "button", style: extStyle }) => {
  const sizes = { sm: { h: 32, px: 12, fs: 14 }, md: { h: 40, px: 16, fs: 16 }, lg: { h: 48, px: 24, fs: 16 }, xl: { h: 56, px: 32, fs: 18 } };
  const s = sizes[size];
  const variants = {
    primary: { bg: "var(--accent-500)", color: "#fff", border: "none" },
    secondary: { bg: "#fff", color: "var(--brand-600)", border: "1px solid var(--brand-600)" },
    ghost: { bg: "transparent", color: "var(--brand-600)", border: "none" },
    destructive: { bg: "var(--error-500)", color: "#fff", border: "none" },
    premium: { bg: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#78350F", border: "none" },
    dark: { bg: "var(--gray-800)", color: "#fff", border: "none" },
  };
  const v = variants[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs,
        background: disabled ? "var(--gray-300)" : v.bg,
        color: disabled ? "var(--gray-500)" : v.color,
        border: v.border, borderRadius: "var(--radius-md)",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        fontFamily: "var(--font-sans)", fontWeight: 600,
        display: "inline-flex", alignItems: "center", gap: 8,
        justifyContent: "center", transition: "all 0.15s ease",
        width: fullWidth ? "100%" : "auto", flexShrink: 0,
        ...extStyle,
      }}
    >
      {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
      {children}
    </button>
  );
};

// Input
const Input = ({ label, type = "text", placeholder, value, onChange, error, icon, rightIcon, onRightIconClick }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-700)" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", height: 48,
            padding: `0 ${rightIcon ? 44 : 16}px 0 ${icon ? 44 : 16}px`,
            border: `1px solid ${error ? "var(--error-500)" : focused ? "var(--brand-500)" : "var(--gray-200)"}`,
            borderRadius: "var(--radius-md)",
            background: error ? "var(--error-50)" : "#fff",
            color: "var(--gray-900)", fontSize: 16,
            fontFamily: "var(--font-sans)",
            outline: focused ? `2px solid ${error ? "var(--error-500)" : "var(--brand-500)"}` : "none",
            outlineOffset: 2, transition: "all 0.15s ease",
          }}
        />
        {rightIcon && (
          <button onClick={onRightIconClick} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray-500)" }}>
            {rightIcon}
          </button>
        )}
      </div>
      {error && <span style={{ fontSize: 12, color: "var(--error-500)" }}>{error}</span>}
    </div>
  );
};

// Progress Bar
const ProgressBar = ({ value, max, color }) => (
  <div style={{ width: "100%", height: 8, background: "var(--gray-200)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
    <div style={{
      height: "100%", width: `${(value / max) * 100}%`,
      background: color || "var(--brand-600)", borderRadius: "var(--radius-full)",
      transition: "width 0.5s ease",
    }} role="progressbar" aria-valuenow={value} aria-valuemax={max} />
  </div>
);

// Toast
const Toast = ({ toast, onClose }) => {
  const configs = {
    success: { bg: "var(--success-50)", border: "var(--success-200)", icon: <CheckCircle size={18} color="var(--success-500)" /> },
    error: { bg: "var(--error-50)", border: "var(--error-200)", icon: <XCircle size={18} color="var(--error-500)" /> },
    warning: { bg: "var(--warning-50)", border: "var(--warning-200)", icon: <AlertTriangle size={18} color="var(--warning-500)" /> },
    info: { bg: "var(--info-50)", border: "var(--info-200)", icon: <Info size={18} color="var(--info-500)" /> },
  };
  const cfg = configs[toast.type] || configs.info;
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div role="alert" aria-live="polite" style={{
      position: "fixed", top: 16, right: 16, zIndex: 60,
      minWidth: 320, maxWidth: 400, padding: "12px 16px",
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)",
      display: "flex", alignItems: "center", gap: 10,
      animation: "slideDown 0.3s ease",
    }}>
      {cfg.icon}
      <span style={{ flex: 1, fontSize: 14, color: "var(--gray-800)" }}>{toast.message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)" }}><X size={16} /></button>
    </div>
  );
};

// Conversion Modal (non-dismissible)
const ConversionModal = ({ type, onAction, onSecondary }) => {
  const isRegister = type === "register";
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "var(--backdrop)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" style={{
        width: "100%", maxWidth: 420, background: "#fff",
        borderRadius: "var(--radius-2xl)", padding: 40,
        boxShadow: "var(--shadow-xl)", animation: "scaleIn 0.3s ease",
        textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", margin: "0 auto 24px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isRegister ? "var(--warning-50)" : "linear-gradient(135deg, #FEF3C7, #FDE68A)",
        }}>
          {isRegister ? <Lock size={32} color="var(--warning-500)" /> : <Star size={32} color="#B45309" />}
        </div>
        <h2 id="modal-title" style={{ fontSize: 24, fontWeight: 700, color: "var(--gray-900)", marginBottom: 12, fontFamily: "var(--font-display)" }}>
          {isRegister ? "Free Account Required" : "Upgrade to Premium"}
        </h2>
        <p style={{ fontSize: 16, color: "var(--gray-500)", marginBottom: 24 }}>
          {isRegister ? "Create a free account to access this quiz and track your progress." : "Unlock all premium quizzes and accelerate your German learning."}
        </p>
        <div style={{ textAlign: "left", marginBottom: 28 }}>
          {(isRegister
            ? ["Access 50+ free quizzes", "Track your progress", "Get personalized recommendations", "No credit card required"]
            : ["Unlimited premium quizzes", "Detailed explanations & hints", "Offline access", "Priority support"]
          ).map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 15, color: "var(--gray-700)" }}>
              {isRegister ? <CheckCircle size={18} color="var(--success-500)" /> : <Star size={18} color="#F59E0B" />}
              {b}
            </div>
          ))}
        </div>
        {!isRegister && (
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: "#B45309", fontFamily: "var(--font-display)" }}>€9.99</span>
            <span style={{ fontSize: 16, color: "var(--gray-500)" }}>/month</span>
          </div>
        )}
        <Btn variant={isRegister ? "primary" : "premium"} size="xl" fullWidth onClick={onAction} style={{ marginBottom: 12 }}>
          {isRegister ? "Create Free Account" : "Start Premium — €9.99/mo"}
        </Btn>
        <button onClick={onSecondary} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--brand-600)", fontFamily: "var(--font-sans)" }}>
          {isRegister ? "Maybe later" : "Continue with free plan"}
        </button>
        <p style={{ marginTop: 16, fontSize: 12, color: "var(--gray-400)" }}>
          {isRegister ? "By signing up, you agree to our Terms & Privacy Policy." : "Cancel anytime. GDPR compliant. Secure payment."}
        </p>
      </div>
    </div>
  );
};

// Quiz Card
const QuizCard = ({ quiz, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const isLocked = quiz.access === "premium";
  const levelColors = { A1: "var(--success-500)", A2: "var(--info-500)", B1: "var(--warning-500)", B2: "var(--error-500)" };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(quiz)}
      style={{
        background: "#fff", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--gray-200)", overflow: "hidden",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "all 0.2s ease", cursor: "pointer",
        position: "relative",
      }}
    >
      {/* Image area */}
      <div style={{ height: 140, background: `linear-gradient(135deg, var(--brand-50) 0%, var(--brand-100) 100%)`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BookOpen size={40} color="var(--brand-500)" opacity={0.6} />
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <span style={{
            padding: "3px 8px", borderRadius: "var(--radius-full)", fontSize: 11, fontWeight: 700,
            background: levelColors[quiz.level] || "var(--brand-600)", color: "#fff",
          }}>{quiz.level}</span>
        </div>
        {quiz.completed && (
          <div style={{ position: "absolute", top: 8, right: 8 }}>
            <CheckCircle size={20} color="var(--success-500)" fill="var(--success-50)" />
          </div>
        )}
        {isLocked && (
          <div style={{
            position: "absolute", inset: 0, background: "var(--blur-locked)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
            backdropFilter: "blur(2px)",
          }}>
            <Lock size={24} color="var(--gray-500)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-600)" }}>Premium</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-900)", marginBottom: 4, lineHeight: 1.4 }}>{quiz.title}</div>
        <div style={{ fontSize: 13, color: "var(--gray-400)", marginBottom: 10 }}>{quiz.category} · {quiz.questions} questions</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Badge type="type">{quiz.type}</Badge>
            <Badge type={quiz.access}>{quiz.access === "free" ? "Free" : quiz.access === "registered" ? "Member" : "Premium"}</Badge>
          </div>
          <ArrowRight size={16} color="var(--brand-600)" />
        </div>
        {quiz.completed && quiz.score && (
          <div style={{ marginTop: 10 }}>
            <ProgressBar value={quiz.score} max={100} color={quiz.score >= 70 ? "var(--success-500)" : "var(--warning-500)"} />
            <span style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4, display: "block" }}>Score: {quiz.score}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton Loader
const SkeletonCard = () => (
  <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
    <div className="skeleton" style={{ height: 140 }} />
    <div style={{ padding: 16 }}>
      <div className="skeleton" style={{ height: 18, width: "80%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <div className="skeleton" style={{ height: 22, width: 50 }} />
        <div className="skeleton" style={{ height: 22, width: 60 }} />
      </div>
    </div>
  </div>
);

// Cookie Consent Banner
const CookieBanner = ({ onAccept, onDecline }) => (
  <div style={{
    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 55,
    background: "var(--gray-900)", color: "#fff", padding: "16px 24px",
    display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
  }}>
    <Shield size={20} color="var(--brand-500)" style={{ flexShrink: 0 }} />
    <p style={{ flex: 1, fontSize: 14, color: "var(--gray-300)", minWidth: 200 }}>
      We use cookies to improve your experience and comply with GDPR.{" "}
      <a href="#" style={{ color: "var(--brand-500)" }}>Learn more</a>
    </p>
    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
      <Btn variant="ghost" size="sm" onClick={onDecline} style={{ color: "var(--gray-400)" }}>Decline</Btn>
      <Btn variant="primary" size="sm" onClick={onAccept}>Accept All</Btn>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   PAGE: LANDING
──────────────────────────────────────────── */
const LandingPage = ({ navigate }) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const features = [
    { icon: <BookOpen size={24} color="var(--brand-600)" />, title: "5 Question Types", desc: "MCQ, Fill-in-Blank, True/False, Audio & Image quizzes." },
    { icon: <BarChart3 size={24} color="var(--brand-600)" />, title: "Progress Tracking", desc: "Monitor your improvement across all grammar topics." },
    { icon: <Target size={24} color="var(--brand-600)" />, title: "A1 to C2 Levels", desc: "Structured content from beginner to mastery." },
    { icon: <Trophy size={24} color="var(--brand-600)" />, title: "Instant Feedback", desc: "Learn from detailed explanations after each answer." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 20, background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--brand-600)", cursor: "pointer" }} onClick={() => navigate("landing")}>
          🇩🇪 Langrushi
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="ghost" size="sm" onClick={() => navigate("login")}>Log in</Btn>
          <Btn variant="primary" size="sm" onClick={() => navigate("register")}>Start Free</Btn>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 32px 60px", background: "linear-gradient(180deg, var(--brand-50) 0%, #fff 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(0deg, var(--brand-600) 0, var(--brand-600) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, var(--brand-600) 0, var(--brand-600) 1px, transparent 1px, transparent 40px)" }} />
        <div className="animate-fadeIn" style={{ position: "relative", maxWidth: 720 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "var(--brand-50)", borderRadius: "var(--radius-full)", fontSize: 13, fontWeight: 600, color: "var(--brand-700)", marginBottom: 24, border: "1px solid var(--brand-100)" }}>
            <Star size={12} /> German Grammar Made Simple
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700, color: "var(--gray-900)", lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.02em" }}>
            Master German Grammar<br />
            <span style={{ color: "var(--brand-600)" }}>One Quiz at a Time</span>
          </h1>
          <p style={{ fontSize: "clamp(16px, 2vw, 18px)", color: "var(--gray-500)", maxWidth: 560, margin: "0 auto 36px" }}>
            Structured quizzes from A1 to C2 with instant feedback, progress tracking, and expert explanations.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn variant="primary" size="lg" onClick={() => navigate("quiz-library")}>
              Browse Quizzes <ArrowRight size={18} />
            </Btn>
            <Btn variant="secondary" size="lg" onClick={() => navigate("register")}>
              Create Free Account
            </Btn>
          </div>
          <p style={{ marginTop: 16, fontSize: 13, color: "var(--gray-400)" }}>No credit card required · GDPR compliant</p>
        </div>
      </section>

      {/* Featured Quizzes */}
      <section style={{ padding: "64px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--brand-600)", marginBottom: 8 }}>FEATURED QUIZZES</p>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--gray-900)", fontFamily: "var(--font-display)" }}>Start Learning Today</h2>
        </div>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {QUIZZES.slice(0, 4).map(q => (
              <QuizCard key={q.id} quiz={q} onClick={() => navigate("quiz-start", { quiz: q })} />
            ))}
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Btn variant="secondary" size="lg" onClick={() => navigate("quiz-library")}>View All Quizzes <ArrowRight size={18} /></Btn>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "64px 32px", background: "var(--gray-50)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--gray-900)", fontFamily: "var(--font-display)" }}>Why Langrushi?</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 24, border: "1px solid var(--gray-200)" }}>
                <div style={{ width: 48, height: 48, background: "var(--brand-50)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "var(--gray-900)", marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: "var(--gray-500)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section style={{ padding: "64px 32px", maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--gray-900)", fontFamily: "var(--font-display)", marginBottom: 12 }}>Simple Pricing</h2>
        <p style={{ fontSize: 16, color: "var(--gray-500)", marginBottom: 32 }}>Start free. Upgrade when you're ready.</p>
        <Btn variant="primary" size="lg" onClick={() => navigate("pricing")}>View Plans <ArrowRight size={18} /></Btn>
      </section>

      {/* Footer */}
      <footer style={{ background: "var(--gray-50)", borderTop: "1px solid var(--gray-200)", padding: "40px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--brand-600)", marginBottom: 8 }}>🇩🇪 Langrushi</div>
            <p style={{ fontSize: 13, color: "var(--gray-400)" }}>German Grammar Practice Platform</p>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Privacy Policy", "Terms of Service", "GDPR", "Contact"].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: "var(--gray-500)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: "16px auto 0", borderTop: "1px solid var(--gray-200)", paddingTop: 16, fontSize: 12, color: "var(--gray-400)" }}>
          © 2026 Langrushi. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

/* ────────────────────────────────────────────
   PAGE: QUIZ LIBRARY
──────────────────────────────────────────── */
const QuizLibraryPage = ({ navigate, user }) => {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [accessFilter, setAccessFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [conversionModal, setConversionModal] = useState(null);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

  const levels = ["All", "A1", "A2", "B1", "B2", "C1", "C2"];
  const types = ["All", "MCQ", "Fill-Blank", "True-False", "Audio", "Image"];
  const accesses = ["All", "Free", "Member", "Premium"];

  const filtered = QUIZZES.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) || q.category.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === "All" || q.level === levelFilter;
    const matchType = typeFilter === "All" || q.type === typeFilter;
    const matchAccess = accessFilter === "All" || q.access === accessFilter.toLowerCase();
    return matchSearch && matchLevel && matchType && matchAccess;
  });

  const handleQuizClick = (quiz) => {
    if (quiz.access === "premium" && (!user || user.plan !== "premium")) {
      setConversionModal("upgrade");
    } else if (quiz.access === "registered" && !user) {
      setConversionModal("register");
    } else {
      navigate("quiz-start", { quiz });
    }
  };

  const FilterChip = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: "var(--radius-full)", fontSize: 13, fontWeight: 500,
      background: active ? "var(--brand-600)" : "#fff",
      color: active ? "#fff" : "var(--gray-600)",
      border: `1px solid ${active ? "var(--brand-600)" : "var(--gray-200)"}`,
      cursor: "pointer", transition: "all 0.15s ease", whiteSpace: "nowrap",
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, height: 64 }}>
            <button onClick={() => navigate("landing")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
              <ArrowLeft size={18} /> Back
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-900)", flex: 1 }}>Quiz Library</h1>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
              <input
                placeholder="Search quizzes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36, paddingRight: 12, height: 36, border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)", fontSize: 14, fontFamily: "var(--font-sans)", width: 220, outline: "none" }}
              />
            </div>
          </div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 8, paddingBottom: 12, overflowX: "auto" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-400)", display: "flex", alignItems: "center", flexShrink: 0 }}>Level:</span>
            {levels.map(l => <FilterChip key={l} label={l} active={levelFilter === l} onClick={() => setLevelFilter(l)} />)}
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-400)", display: "flex", alignItems: "center", flexShrink: 0, marginLeft: 8 }}>Type:</span>
            {types.map(t => <FilterChip key={t} label={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />)}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 32px" }}>
        <p style={{ fontSize: 14, color: "var(--gray-400)", marginBottom: 16 }}>{filtered.length} quizzes found</p>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 32px" }}>
            <Search size={48} color="var(--gray-300)" style={{ margin: "0 auto 16px", display: "block" }} />
            <h3 style={{ fontSize: 20, fontWeight: 600, color: "var(--gray-700)", marginBottom: 8 }}>No quizzes found</h3>
            <p style={{ color: "var(--gray-400)", marginBottom: 20 }}>Try adjusting your filters or search term.</p>
            <Btn variant="secondary" size="md" onClick={() => { setSearch(""); setLevelFilter("All"); setTypeFilter("All"); }}>Clear Filters</Btn>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filtered.map(q => <QuizCard key={q.id} quiz={q} onClick={handleQuizClick} />)}
          </div>
        )}
      </div>

      {conversionModal && (
        <ConversionModal
          type={conversionModal}
          onAction={() => { setConversionModal(null); navigate(conversionModal === "register" ? "register" : "pricing"); }}
          onSecondary={() => setConversionModal(null)}
        />
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   PAGE: QUIZ START
──────────────────────────────────────────── */
const QuizStartPage = ({ navigate, data }) => {
  const quiz = data?.quiz || QUIZZES[0];
  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 560, width: "100%", background: "#fff", borderRadius: "var(--radius-2xl)", padding: 40, boxShadow: "var(--shadow-lg)", animation: "fadeIn 0.4s ease" }}>
        <button onClick={() => navigate("quiz-library")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 6, fontSize: 14, marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to Library
        </button>
        <div style={{ width: "100%", height: 160, background: "linear-gradient(135deg, var(--brand-50), var(--brand-100))", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <BookOpen size={56} color="var(--brand-500)" opacity={0.7} />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          <Badge type="level">{quiz.level}</Badge>
          <Badge type="type">{quiz.type}</Badge>
          <Badge type={quiz.access}>{quiz.access === "free" ? "Free" : quiz.access === "registered" ? "Member" : "Premium"}</Badge>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--gray-900)", marginBottom: 8, fontFamily: "var(--font-display)" }}>{quiz.title}</h1>
        <p style={{ fontSize: 15, color: "var(--gray-500)", marginBottom: 24 }}>{quiz.category} · {quiz.questions} questions · Estimated 8 min</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
          {[
            { icon: <FileText size={16} />, label: "Questions", value: quiz.questions },
            { icon: <Clock size={16} />, label: "Est. Time", value: "~8 min" },
            { icon: <Award size={16} />, label: "Pass Score", value: "70%" },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: "12px 8px", textAlign: "center" }}>
              <div style={{ color: "var(--brand-600)", display: "flex", justifyContent: "center", marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-900)" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <Btn variant="primary" size="xl" fullWidth onClick={() => navigate("quiz-session", { quiz })}>
          Start Quiz <ArrowRight size={20} />
        </Btn>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   PAGE: QUIZ SESSION
──────────────────────────────────────────── */
const QuizSessionPage = ({ navigate, data }) => {
  const quiz = data?.quiz || QUIZZES[0];
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [fillText, setFillText] = useState("");
  const [tfAnswer, setTfAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [scores, setScores] = useState([]);
  const [startTime] = useState(Date.now());

  const q = QUIZ_QUESTIONS[Math.min(qIdx, QUIZ_QUESTIONS.length - 1)];
  const total = QUIZ_QUESTIONS.length;
  const progress = qIdx / total;

  const isCorrect = () => {
    if (q.type === "MCQ") return selected === q.correct;
    if (q.type === "Fill-Blank") return fillText.trim().toLowerCase() === q.answer?.toLowerCase();
    if (q.type === "True-False") return tfAnswer === q.correct;
    return false;
  };

  const handleSubmit = () => {
    if (!submitted) {
      const correct = isCorrect();
      setScores(prev => [...prev, correct]);
      setSubmitted(true);
    } else {
      const nextIdx = qIdx + 1;
      if (nextIdx >= total) {
        const finalScores = scores;
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        navigate("quiz-completion", { quiz, scores: finalScores, elapsed });
      } else {
        setQIdx(nextIdx);
        setSelected(null);
        setFillText("");
        setTfAnswer(null);
        setSubmitted(false);
        setShowHint(false);
      }
    }
  };

  const canSubmit = submitted || (
    q.type === "MCQ" ? selected !== null :
    q.type === "Fill-Blank" ? fillText.trim().length > 0 :
    tfAnswer !== null
  );

  const correct = submitted && isCorrect();

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)", display: "flex", flexDirection: "column" }}>
      {/* Top progress bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#fff", borderBottom: "1px solid var(--gray-200)" }}>
        <div style={{ height: 8, background: "var(--gray-200)" }}>
          <div style={{ height: "100%", width: `${((qIdx + (submitted ? 1 : 0)) / total) * 100}%`, background: "var(--brand-600)", transition: "width 0.5s ease" }} role="progressbar" aria-valuenow={qIdx + 1} aria-valuemax={total} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 48 }}>
          <button onClick={() => navigate("quiz-library")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
            <X size={18} /> Quit
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)" }}>Question {qIdx + 1} of {total}</span>
          <div style={{ width: 60 }} />
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 100px" }}>
        <div style={{ width: "100%", maxWidth: 640 }}>
          {/* Question */}
          <h2 style={{ fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 700, color: "var(--gray-900)", textAlign: "center", marginBottom: 32, lineHeight: 1.4, fontFamily: "var(--font-display)" }}>
            {q.text}
          </h2>

          {/* MCQ */}
          {q.type === "MCQ" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map((opt, i) => {
                let bg = "#fff", border = "var(--gray-200)", color = "var(--gray-800)";
                if (submitted) {
                  if (i === q.correct) { bg = "var(--success-500)"; border = "var(--success-500)"; color = "#fff"; }
                  else if (i === selected && i !== q.correct) { bg = "var(--error-500)"; border = "var(--error-500)"; color = "#fff"; }
                } else if (selected === i) {
                  bg = "var(--brand-600)"; border = "var(--brand-600)"; color = "#fff";
                }
                return (
                  <button key={i} onClick={() => !submitted && setSelected(i)} role="radio" aria-checked={selected === i}
                    style={{
                      width: "100%", minHeight: 56, padding: "14px 20px",
                      background: bg, border: `1px solid ${border}`, borderRadius: "var(--radius-lg)",
                      display: "flex", alignItems: "center", gap: 12,
                      cursor: submitted ? "default" : "pointer", textAlign: "left",
                      fontSize: 16, color, fontFamily: "var(--font-sans)", fontWeight: 500,
                      transition: "all 0.15s ease",
                    }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0, color: "inherit", border: "1px solid rgba(255,255,255,0.3)" }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {submitted && i === q.correct && <CheckCircle size={18} style={{ marginLeft: "auto", flexShrink: 0 }} />}
                    {submitted && i === selected && i !== q.correct && <XCircle size={18} style={{ marginLeft: "auto", flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Fill-in-Blank */}
          {q.type === "Fill-Blank" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontSize: 20, fontWeight: 600, color: "var(--gray-800)", marginBottom: 20 }}>
                <PenLine size={20} color="var(--brand-600)" />
                Fill in the blank
              </div>
              <input
                disabled={submitted}
                value={fillText}
                onChange={e => setFillText(e.target.value)}
                placeholder="Type your answer..."
                style={{
                  width: "100%", height: 56, padding: "0 20px",
                  border: `2px solid ${submitted ? (isCorrect() ? "var(--success-500)" : "var(--error-500)") : "var(--gray-200)"}`,
                  borderRadius: "var(--radius-lg)", fontSize: 18, textAlign: "center",
                  background: submitted ? (isCorrect() ? "var(--success-50)" : "var(--error-50)") : "#fff",
                  fontFamily: "var(--font-sans)", outline: "none",
                }}
              />
              {submitted && !isCorrect() && (
                <div style={{ marginTop: 12, textAlign: "center", fontSize: 15, color: "var(--success-600)" }}>
                  Correct answer: <strong>{q.answer}</strong>
                </div>
              )}
            </div>
          )}

          {/* True-False */}
          {q.type === "True-False" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[true, false].map(val => {
                let bg = "#fff", border = "var(--gray-200)", color = "var(--gray-800)";
                if (submitted) {
                  if (val === q.correct) { bg = "var(--success-500)"; border = "var(--success-500)"; color = "#fff"; }
                  else if (val === tfAnswer && val !== q.correct) { bg = "var(--error-500)"; border = "var(--error-500)"; color = "#fff"; }
                } else if (tfAnswer === val) {
                  bg = "var(--brand-600)"; border = "var(--brand-600)"; color = "#fff";
                }
                return (
                  <button key={String(val)} onClick={() => !submitted && setTfAnswer(val)}
                    style={{
                      height: 80, background: bg, border: `1px solid ${border}`, borderRadius: "var(--radius-lg)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                      cursor: submitted ? "default" : "pointer", fontSize: 16, color, fontFamily: "var(--font-sans)", fontWeight: 600,
                      transition: "all 0.15s ease",
                    }}>
                    {val ? <Check size={24} /> : <X size={24} />}
                    {val ? "True" : "False"}
                  </button>
                );
              })}
            </div>
          )}

          {/* Hint */}
          {!submitted && q.hint && (
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <button onClick={() => setShowHint(!showHint)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--info-500)", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-sans)" }}>
                <Lightbulb size={14} /> {showHint ? "Hide Hint" : "Show Hint"}
              </button>
              {showHint && (
                <div style={{ marginTop: 10, background: "var(--info-50)", borderRadius: "var(--radius-md)", padding: 12, fontSize: 14, color: "var(--info-600)", textAlign: "left", animation: "slideDown 0.2s ease" }}>
                  💡 {q.hint}
                </div>
              )}
            </div>
          )}

          {/* Feedback */}
          {submitted && (
            <div style={{ marginTop: 20, animation: "slideDown 0.3s ease" }}>
              <div style={{
                padding: "12px 20px", borderRadius: "var(--radius-lg)", marginBottom: 12,
                background: correct ? "var(--success-50)" : "var(--error-50)",
                border: `1px solid ${correct ? "var(--success-200)" : "var(--error-200)"}`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                {correct ? <CheckCircle size={20} color="var(--success-500)" /> : <XCircle size={20} color="var(--error-500)" />}
                <span style={{ fontWeight: 600, color: correct ? "var(--success-600)" : "var(--error-600)" }}>
                  {correct ? "Correct! Well done!" : "Not quite. Keep going!"}
                </span>
              </div>
              <div style={{ background: "var(--info-50)", borderRadius: "var(--radius-lg)", padding: "16px", border: "1px solid var(--info-200)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <Info size={16} color="var(--info-500)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--info-600)", marginBottom: 4 }}>Explanation</p>
                    <p style={{ fontSize: 14, color: "var(--gray-700)", lineHeight: 1.6 }}>{q.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid var(--gray-200)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <Btn variant="primary" size="xl" fullWidth onClick={handleSubmit} disabled={!canSubmit}>
            {submitted ? (qIdx + 1 >= total ? "See Results" : "Next Question") : "Submit Answer"}
            {submitted && <ArrowRight size={20} />}
          </Btn>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   PAGE: QUIZ COMPLETION
──────────────────────────────────────────── */
const QuizCompletionPage = ({ navigate, data }) => {
  const { quiz = QUIZZES[0], scores = [true, false, true], elapsed = 420 } = data || {};
  const correct = scores.filter(Boolean).length;
  const total = scores.length;
  const pct = Math.round((correct / total) * 100);
  const passed = pct >= 70;
  const scoreColor = pct >= 70 ? "var(--success-500)" : pct >= 40 ? "var(--warning-500)" : "var(--error-500)";
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)", padding: "32px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Score card */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-2xl)", padding: 40, textAlign: "center", boxShadow: "var(--shadow-lg)", marginBottom: 20, animation: "scaleIn 0.4s ease" }}>
          {passed && <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>}
          <div style={{ fontSize: 64, fontWeight: 700, color: scoreColor, fontFamily: "var(--font-display)", lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 20, color: "var(--gray-500)", marginBottom: 8 }}>{correct} / {total} correct</div>
          <p style={{ fontSize: 18, color: scoreColor, fontWeight: 600, marginBottom: 4 }}>
            {pct >= 70 ? "Excellent work!" : pct >= 40 ? "Good effort — keep practicing!" : "Keep going — you'll improve!"}
          </p>
          <p style={{ fontSize: 14, color: "var(--gray-400)", display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 8 }}>
            <Clock size={14} /> {mins}m {secs}s
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 24, marginBottom: 28 }}>
            {[
              { label: "Correct", value: correct, color: "var(--success-500)" },
              { label: "Wrong", value: total - correct, color: "var(--error-500)" },
              { label: "Score", value: `${pct}%`, color: scoreColor },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn variant="secondary" size="lg" onClick={() => navigate("quiz-session", { quiz })}>
              <RefreshCw size={16} /> Retake
            </Btn>
            <Btn variant="ghost" size="lg" onClick={() => navigate("quiz-library")}>
              <ArrowLeft size={16} /> Back to Library
            </Btn>
          </div>
        </div>

        {/* Review */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--gray-200)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>Question Review</h3>
          </div>
          {QUIZ_QUESTIONS.map((q, i) => (
            <div key={i} style={{ borderBottom: "1px solid var(--gray-100)" }}>
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                aria-expanded={expanded === i}
                aria-controls={`review-${i}`}
                style={{
                  width: "100%", padding: "14px 20px", background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                }}>
                {i < scores.length && scores[i] ? <CheckCircle size={18} color="var(--success-500)" /> : <XCircle size={18} color="var(--error-500)" />}
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--gray-800)" }}>Q{i + 1}: {q.text.slice(0, 60)}...</span>
                {expanded === i ? <ChevronUp size={16} color="var(--gray-400)" /> : <ChevronDown size={16} color="var(--gray-400)" />}
              </button>
              {expanded === i && (
                <div id={`review-${i}`} style={{ padding: "0 20px 16px 50px", animation: "slideDown 0.2s ease" }}>
                  <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 8, lineHeight: 1.6 }}>{q.text}</p>
                  <div style={{ background: "var(--info-50)", borderRadius: "var(--radius-md)", padding: 12 }}>
                    <p style={{ fontSize: 13, color: "var(--info-600)" }}>💡 {q.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   PAGE: PRICING
──────────────────────────────────────────── */
const PricingPage = ({ navigate }) => {
  const plans = [
    {
      name: "Free", price: "€0", period: "/forever", badge: null,
      features: ["20+ free quizzes", "A1–A2 levels", "Basic progress tracking", "Community access"],
      cta: "Get Started Free", variant: "secondary",
    },
    {
      name: "Premium", price: "€9.99", period: "/month", badge: "Most Popular",
      features: ["200+ premium quizzes", "A1–C2 all levels", "Detailed explanations", "Offline access", "Priority support", "Certificates"],
      cta: "Start Premium", variant: "primary",
    },
    {
      name: "Course Bundle", price: "€49", period: "/one-time", badge: null,
      features: ["Everything in Premium", "Video course access", "Live Q&A sessions", "1-on-1 tutor session", "Lifetime access"],
      cta: "Buy Course Bundle", variant: "secondary",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)", padding: "64px 24px" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <button onClick={() => navigate("landing")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 6, fontSize: 14, marginBottom: 32 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, color: "var(--gray-900)", fontFamily: "var(--font-display)", marginBottom: 12 }}>Simple, Transparent Pricing</h1>
          <p style={{ fontSize: 18, color: "var(--gray-500)" }}>Start for free. Upgrade whenever you're ready.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {plans.map((plan, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: "var(--radius-xl)", padding: 32,
              border: plan.badge ? "2px solid var(--brand-600)" : "1px solid var(--gray-200)",
              boxShadow: plan.badge ? "var(--shadow-lg)" : "var(--shadow-sm)",
              position: "relative",
            }}>
              {plan.badge && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--brand-600)", color: "#fff", padding: "4px 16px", borderRadius: "var(--radius-full)", fontSize: 12, fontWeight: 700 }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-900)", marginBottom: 8 }}>{plan.name}</div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 48, fontWeight: 700, color: "var(--gray-900)", fontFamily: "var(--font-display)" }}>{plan.price}</span>
                <span style={{ fontSize: 16, color: "var(--gray-400)" }}>{plan.period}</span>
              </div>
              <div style={{ marginBottom: 28 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 15, color: "var(--gray-700)" }}>
                    <CheckCircle size={16} color="var(--success-500)" />
                    {f}
                  </div>
                ))}
              </div>
              <Btn variant={plan.variant} size="lg" fullWidth onClick={() => navigate("register")}>{plan.cta}</Btn>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 32, fontSize: 14, color: "var(--gray-400)" }}>
          All plans include GDPR-compliant data handling · Cancel anytime · Secure payment via Stripe
        </p>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   PAGE: AUTH — REGISTER
──────────────────────────────────────────── */
const RegisterPage = ({ navigate, onLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.includes("@")) errs.email = "Enter a valid email";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    if (!agreed) errs.agreed = "You must agree to the terms";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      onLogin({ name, email, plan: "free" });
      navigate("dashboard");
    }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--brand-50) 0%, #fff 100%)", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: "var(--radius-xl)", padding: 40, boxShadow: "var(--shadow-lg)", animation: "scaleIn 0.3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--brand-600)", marginBottom: 6 }}>🇩🇪 Langrushi</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--gray-900)" }}>Create your account</h1>
          <p style={{ fontSize: 14, color: "var(--gray-400)", marginTop: 4 }}>Start learning German for free</p>
        </div>

        <button style={{ width: "100%", height: 48, background: "#fff", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", fontSize: 15, fontFamily: "var(--font-sans)", fontWeight: 500, marginBottom: 16 }}>
          <Globe size={18} /> Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "var(--gray-200)" }} />
          <span style={{ fontSize: 13, color: "var(--gray-400)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--gray-200)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Full Name" placeholder="Anna Müller" value={name} onChange={e => setName(e.target.value)} error={errors.name} icon={<User size={16} />} />
          <Input label="Email" type="email" placeholder="anna@example.com" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} icon={<Mail size={16} />} />
          <Input label="Password" type={showPass ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} icon={<Eye size={16} />} rightIcon={showPass ? <EyeOff size={16} /> : <Eye size={16} />} onRightIconClick={() => setShowPass(!showPass)} />

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
            <span style={{ fontSize: 13, color: "var(--gray-500)" }}>
              I agree to the <a href="#" style={{ color: "var(--brand-600)" }}>Terms of Service</a> and <a href="#" style={{ color: "var(--brand-600)" }}>Privacy Policy</a>
            </span>
          </label>
          {errors.agreed && <span style={{ fontSize: 12, color: "var(--error-500)", marginTop: -8 }}>{errors.agreed}</span>}

          <Btn variant="primary" size="lg" fullWidth onClick={handleSubmit} loading={loading}>
            Create Free Account
          </Btn>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--gray-500)" }}>
          Already have an account?{" "}
          <button onClick={() => navigate("login")} style={{ background: "none", border: "none", color: "var(--brand-600)", cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-sans)", fontSize: 14 }}>Log in</button>
        </p>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   PAGE: AUTH — LOGIN
──────────────────────────────────────────── */
const LoginPage = ({ navigate, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setTimeout(() => {
      onLogin({ name: "Anna", email, plan: "free" });
      navigate("dashboard");
    }, 1000);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--brand-50) 0%, #fff 100%)", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: "var(--radius-xl)", padding: 40, boxShadow: "var(--shadow-lg)", animation: "scaleIn 0.3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--brand-600)", marginBottom: 6 }}>🇩🇪 Langrushi</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--gray-900)" }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "var(--gray-400)", marginTop: 4 }}>Log in to continue learning</p>
        </div>

        <button style={{ width: "100%", height: 48, background: "#fff", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", fontSize: 15, fontFamily: "var(--font-sans)", fontWeight: 500, marginBottom: 16 }}>
          <Globe size={18} /> Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "var(--gray-200)" }} />
          <span style={{ fontSize: 13, color: "var(--gray-400)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--gray-200)" }} />
        </div>

        {error && (
          <div style={{ background: "var(--error-50)", border: "1px solid var(--error-200)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} color="var(--error-500)" />
            <span style={{ fontSize: 14, color: "var(--error-600)" }}>{error}</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Email" type="email" placeholder="anna@example.com" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={16} />} />
          <div>
            <Input label="Password" type={showPass ? "text" : "password"} placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} icon={<Eye size={16} />} rightIcon={showPass ? <EyeOff size={16} /> : <Eye size={16} />} onRightIconClick={() => setShowPass(!showPass)} />
            <button onClick={() => navigate("forgot-password")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-600)", fontSize: 13, fontFamily: "var(--font-sans)", marginTop: 6, display: "block" }}>Forgot password?</button>
          </div>
          <Btn variant="primary" size="lg" fullWidth onClick={handleSubmit} loading={loading}>Log In</Btn>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--gray-500)" }}>
          Don't have an account?{" "}
          <button onClick={() => navigate("register")} style={{ background: "none", border: "none", color: "var(--brand-600)", cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-sans)", fontSize: 14 }}>Sign up free</button>
        </p>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   PAGE: FORGOT PASSWORD
──────────────────────────────────────────── */
const ForgotPasswordPage = ({ navigate }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!email.includes("@")) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--brand-50) 0%, #fff 100%)", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: "var(--radius-xl)", padding: 40, boxShadow: "var(--shadow-lg)", animation: "scaleIn 0.3s ease" }}>
        {!sent ? (
          <>
            <button onClick={() => navigate("login")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", display: "flex", alignItems: "center", gap: 6, fontSize: 14, marginBottom: 24, fontFamily: "var(--font-sans)" }}>
              <ArrowLeft size={16} /> Back to login
            </button>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ width: 64, height: 64, background: "var(--brand-50)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Mail size={28} color="var(--brand-600)" />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--gray-900)", marginBottom: 8 }}>Reset Password</h1>
              <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Enter your email and we'll send you a reset link.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Input label="Email Address" type="email" placeholder="anna@example.com" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={16} />} />
              <Btn variant="primary" size="lg" fullWidth onClick={handleSubmit} loading={loading}>Send Reset Link</Btn>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 72, height: 72, background: "var(--success-50)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle size={36} color="var(--success-500)" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--gray-900)", marginBottom: 10 }}>Check your email</h2>
            <p style={{ fontSize: 15, color: "var(--gray-500)", marginBottom: 28 }}>We've sent a password reset link to <strong>{email}</strong>.</p>
            <Btn variant="primary" size="lg" fullWidth onClick={() => navigate("login")}>Back to Login</Btn>
          </div>
        )}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   PAGE: USER DASHBOARD
──────────────────────────────────────────── */
const DashboardPage = ({ navigate, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  const stats = [
    { icon: <BookOpen size={20} />, label: "Quizzes Done", value: "24", color: "var(--brand-50)", iconColor: "var(--brand-600)" },
    { icon: <CheckCircle size={20} />, label: "Avg. Score", value: "78%", color: "var(--success-50)", iconColor: "var(--success-600)" },
    { icon: <Target size={20} />, label: "Day Streak", value: "7", color: "var(--warning-50)", iconColor: "var(--warning-600)" },
    { icon: <Award size={20} />, label: "Badges", value: "5", color: "var(--info-50)", iconColor: "var(--info-600)" },
  ];

  const navItems = [
    { id: "overview", icon: <LayoutDashboard size={18} />, label: "Overview" },
    { id: "quizzes", icon: <BookOpen size={18} />, label: "My Quizzes" },
    { id: "progress", icon: <BarChart3 size={18} />, label: "Progress" },
    { id: "settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--gray-50)" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 0, background: "var(--gray-50)",
        borderRight: "1px solid var(--gray-200)", flexShrink: 0,
        overflow: "hidden", transition: "width 0.3s ease",
        position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--gray-200)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--brand-600)" }}>🇩🇪 Langrushi</div>
        </div>
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: "var(--radius-md)",
              background: activeSection === item.id ? "var(--brand-50)" : "transparent",
              border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
              color: activeSection === item.id ? "var(--brand-700)" : "var(--gray-600)",
              borderLeft: activeSection === item.id ? "3px solid var(--brand-600)" : "3px solid transparent",
              fontFamily: "var(--font-sans)", marginBottom: 2,
              transition: "all 0.15s ease",
            }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 8px", borderTop: "1px solid var(--gray-200)" }}>
          <button onClick={onLogout} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: "var(--radius-md)", background: "transparent",
            border: "none", cursor: "pointer", fontSize: 14, color: "var(--gray-500)",
            fontFamily: "var(--font-sans)",
          }}>
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Top nav */}
        <div style={{ height: 64, background: "#fff", borderBottom: "1px solid var(--gray-200)", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, position: "sticky", top: 0, zIndex: 20 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-500)", display: "flex", alignItems: "center" }}>
            <Menu size={20} />
          </button>
          <div style={{ flex: 1 }} />
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-500)" }}><Bell size={20} /></button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, background: "var(--brand-100)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={18} color="var(--brand-700)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)" }}>{user?.name || "User"}</div>
              <div style={{ fontSize: 12, color: "var(--gray-400)" }}>Free Plan</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 32 }}>
          {activeSection === "overview" && (
            <>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--gray-900)", marginBottom: 8, fontFamily: "var(--font-display)" }}>
                Guten Tag, {user?.name?.split(" ")[0] || "Learner"}! 👋
              </h2>
              <p style={{ fontSize: 15, color: "var(--gray-500)", marginBottom: 28 }}>Keep up your streak — you're doing great!</p>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
                {stats.map((s, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 20, border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ width: 40, height: 40, background: s.color, borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: s.iconColor }}>
                      {s.icon}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gray-900)", fontFamily: "var(--font-display)" }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: "var(--gray-400)" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Continue card */}
              <div style={{ background: "var(--brand-50)", borderRadius: "var(--radius-xl)", padding: 24, marginBottom: 24, display: "flex", alignItems: "center", gap: 20, border: "1px solid var(--brand-100)", flexWrap: "wrap" }}>
                <div style={{ width: 64, height: 64, background: "var(--brand-100)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <PlayCircle size={32} color="var(--brand-600)" />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--brand-600)", marginBottom: 4 }}>CONTINUE WHERE YOU LEFT OFF</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "var(--gray-900)", marginBottom: 8 }}>Modal Verbs (können/müssen)</div>
                  <ProgressBar value={60} max={100} />
                  <div style={{ fontSize: 12, color: "var(--brand-700)", marginTop: 4 }}>12 / 18 questions done</div>
                </div>
                <Btn variant="primary" size="md" onClick={() => navigate("quiz-session", { quiz: QUIZZES[3] })}>
                  Resume <ArrowRight size={16} />
                </Btn>
              </div>

              {/* Upgrade banner */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", padding: 20, border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <Star size={24} color="#F59E0B" />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>Unlock Premium Quizzes</div>
                  <div style={{ fontSize: 13, color: "var(--gray-500)" }}>Access 200+ quizzes from A1 to C2 — starting at €9.99/month.</div>
                </div>
                <Btn variant="premium" size="md" onClick={() => navigate("pricing")}>Upgrade Now</Btn>
              </div>

              {/* Recommended */}
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-900)", marginBottom: 16 }}>Recommended for You</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {QUIZZES.slice(0, 3).map(q => (
                    <QuizCard key={q.id} quiz={q} onClick={() => navigate("quiz-start", { quiz: q })} />
                  ))}
                </div>
              </div>
            </>
          )}

          {activeSection === "quizzes" && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--gray-900)", marginBottom: 24, fontFamily: "var(--font-display)" }}>My Quizzes</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {QUIZZES.filter(q => q.completed).map(q => (
                  <QuizCard key={q.id} quiz={q} onClick={() => navigate("quiz-start", { quiz: q })} />
                ))}
              </div>
            </div>
          )}

          {activeSection === "progress" && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--gray-900)", marginBottom: 24, fontFamily: "var(--font-display)" }}>Your Progress</h2>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  { topic: "Articles (der/die/das)", score: 85, level: "A1" },
                  { topic: "Modal Verbs", score: 72, level: "A2" },
                  { topic: "Separable Verbs", score: 93, level: "B1" },
                ].map((p, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 16, border: "1px solid var(--gray-200)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-900)" }}>{p.topic}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Badge type="level">{p.level}</Badge>
                        <span style={{ fontSize: 14, fontWeight: 700, color: p.score >= 70 ? "var(--success-600)" : "var(--warning-600)" }}>{p.score}%</span>
                      </div>
                    </div>
                    <ProgressBar value={p.score} max={100} color={p.score >= 70 ? "var(--success-500)" : "var(--warning-500)"} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "settings" && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--gray-900)", marginBottom: 24, fontFamily: "var(--font-display)" }}>Settings</h2>
              <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--gray-200)", overflow: "hidden", maxWidth: 560 }}>
                {[
                  { label: "Email notifications", desc: "Receive quiz reminders and updates" },
                  { label: "Streak reminders", desc: "Daily reminder to keep your streak alive" },
                  { label: "Marketing emails", desc: "News and special offers from Langrushi" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: i < 2 ? "1px solid var(--gray-200)" : "none" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-900)" }}>{s.label}</div>
                      <div style={{ fontSize: 13, color: "var(--gray-400)" }}>{s.desc}</div>
                    </div>
                    <div style={{ width: 44, height: 24, background: i === 0 ? "var(--brand-600)" : "var(--gray-200)", borderRadius: "var(--radius-full)", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                      <div style={{ position: "absolute", top: 2, left: i === 0 ? "calc(100% - 22px)" : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s ease", boxShadow: "var(--shadow-sm)" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <Btn variant="destructive" size="md" onClick={onLogout}>Log Out</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   PAGE: ADMIN LOGIN
──────────────────────────────────────────── */
const AdminLoginPage = ({ navigate, onAdminLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setTimeout(() => {
      onAdminLogin();
      navigate("admin-dashboard");
    }, 1000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-900)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400, background: "var(--gray-800)", borderRadius: "var(--radius-xl)", padding: 40, boxShadow: "var(--shadow-xl)", animation: "scaleIn 0.3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", background: "var(--brand-600)", borderRadius: "var(--radius-full)", marginBottom: 16 }}>
            <Shield size={14} color="#fff" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>ADMIN</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", fontFamily: "var(--font-display)" }}>Admin Access</h1>
          <p style={{ fontSize: 14, color: "var(--gray-400)", marginTop: 4 }}>Langrushi Management Panel</p>
        </div>

        {error && (
          <div style={{ background: "var(--error-50)", border: "1px solid var(--error-200)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} color="var(--error-500)" />
            <span style={{ fontSize: 14, color: "var(--error-600)" }}>{error}</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-300)", marginBottom: 6, display: "block" }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@langrushi.com"
              style={{ width: "100%", height: 48, padding: "0 16px", background: "var(--gray-700)", border: "1px solid var(--gray-600)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: 15, fontFamily: "var(--font-sans)", outline: "none" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-300)", marginBottom: 6, display: "block" }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              style={{ width: "100%", height: 48, padding: "0 16px", background: "var(--gray-700)", border: "1px solid var(--gray-600)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: 15, fontFamily: "var(--font-sans)", outline: "none" }} />
          </div>
          <Btn variant="primary" size="lg" fullWidth onClick={handleLogin} loading={loading}>Access Admin Panel</Btn>
        </div>
        <button onClick={() => navigate("landing")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-500)", fontSize: 13, fontFamily: "var(--font-sans)", marginTop: 20, display: "block", textAlign: "center", width: "100%" }}>
          ← Back to main site
        </button>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   SHARED: ADMIN SHELL
──────────────────────────────────────────── */
const AdminShell = ({ navigate, children, activeSection, setActiveSection }) => {
  const navItems = [
    { id: "admin-dashboard", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
    { id: "admin-quizzes", icon: <BookOpen size={16} />, label: "Quizzes" },
    { id: "admin-questions", icon: <FileText size={16} />, label: "Questions" },
    { id: "admin-users", icon: <Users size={16} />, label: "Users" },
    { id: "admin-import", icon: <Upload size={16} />, label: "CSV Import" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--gray-900)" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: "var(--gray-800)", flexShrink: 0, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--gray-700)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#fff" }}>🇩🇪 Langrushi</span>
          <span style={{ fontSize: 10, fontWeight: 700, background: "var(--brand-600)", color: "#fff", padding: "2px 6px", borderRadius: "var(--radius-sm)" }}>ADMIN</span>
        </div>
        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveSection(item.id); navigate(item.id); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: "var(--radius-md)",
              background: activeSection === item.id ? "var(--gray-700)" : "transparent",
              border: "none", cursor: "pointer", fontSize: 14,
              color: activeSection === item.id ? "#fff" : "var(--gray-400)",
              borderLeft: activeSection === item.id ? "3px solid var(--brand-600)" : "3px solid transparent",
              fontFamily: "var(--font-sans)", marginBottom: 2, transition: "all 0.15s ease",
            }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 8px", borderTop: "1px solid var(--gray-700)" }}>
          <button onClick={() => navigate("landing")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: "var(--radius-md)", background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: "var(--gray-500)", fontFamily: "var(--font-sans)" }}>
            <LogOut size={16} /> Exit Admin
          </button>
        </div>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ height: 56, background: "var(--gray-800)", borderBottom: "1px solid var(--gray-700)", display: "flex", alignItems: "center", padding: "0 24px" }}>
          <span style={{ fontSize: 14, color: "var(--gray-300)", fontWeight: 500 }}>dashboard.langrushi.com/admin</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, background: "var(--gray-700)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={16} color="var(--gray-300)" />
            </div>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   PAGE: ADMIN DASHBOARD
──────────────────────────────────────────── */
const AdminDashboardPage = ({ navigate }) => {
  const [activeSection, setActiveSection] = useState("admin-dashboard");
  const stats = [
    { label: "Total Users", value: "1,248", trend: "+12%", icon: <Users size={18} />, color: "var(--brand-600)" },
    { label: "Active Quizzes", value: "47", trend: "+3", icon: <BookOpen size={18} />, color: "var(--success-600)" },
    { label: "Completions Today", value: "183", trend: "+22%", icon: <CheckCircle size={18} />, color: "var(--info-600)" },
    { label: "Premium Users", value: "312", trend: "+8%", icon: <Star size={18} />, color: "#B45309" },
  ];

  const recentUsers = [
    { name: "Maria Schmidt", email: "maria@example.de", plan: "premium", joined: "2026-04-26" },
    { name: "Hans Weber", email: "hans@example.de", plan: "free", joined: "2026-04-25" },
    { name: "Anna Müller", email: "anna@example.de", plan: "free", joined: "2026-04-25" },
  ];

  return (
    <AdminShell navigate={navigate} activeSection={activeSection} setActiveSection={setActiveSection}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 24, fontFamily: "var(--font-display)" }}>Overview</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: "var(--gray-800)", borderRadius: "var(--radius-lg)", padding: 20, border: "1px solid var(--gray-700)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ color: s.color }}>{s.icon}</div>
              <span style={{ fontSize: 12, color: "var(--success-500)", fontWeight: 600 }}>{s.trend}</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#fff", fontFamily: "var(--font-display)" }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "var(--gray-400)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, flexWrap: "wrap" }}>
        <div style={{ background: "var(--gray-800)", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-700)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--gray-700)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Recent Users</h3>
            <button onClick={() => navigate("admin-users")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-500)", fontSize: 13, fontFamily: "var(--font-sans)" }}>View all</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--gray-800)" }}>
                {["Name", "Plan", "Joined"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--gray-700)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{u.email}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge type={u.plan === "premium" ? "premium" : "free"}>{u.plan === "premium" ? "Premium" : "Free"}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--gray-400)" }}>{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: "var(--gray-800)", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-700)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--gray-700)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Quiz Performance</h3>
          </div>
          <div style={{ padding: 16 }}>
            {QUIZZES.slice(0, 4).map((q, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--gray-300)" }}>{q.title}</span>
                  <span style={{ fontSize: 13, color: "var(--gray-400)" }}>{70 + i * 5}%</span>
                </div>
                <ProgressBar value={70 + i * 5} max={100} color="var(--brand-500)" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

/* ────────────────────────────────────────────
   PAGE: ADMIN QUIZ LIST
──────────────────────────────────────────── */
const AdminQuizListPage = ({ navigate }) => {
  const [activeSection, setActiveSection] = useState("admin-quizzes");
  const [quizzes, setQuizzes] = useState(QUIZZES);
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = (id) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
    setDeleteId(null);
  };

  return (
    <AdminShell navigate={navigate} activeSection={activeSection} setActiveSection={setActiveSection}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", fontFamily: "var(--font-display)" }}>Quizzes</h1>
        <Btn variant="primary" size="md" onClick={() => navigate("admin-quiz-edit", { isNew: true })}>
          <Plus size={16} /> New Quiz
        </Btn>
      </div>

      <div style={{ background: "var(--gray-800)", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-700)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Title", "Level", "Type", "Access", "Questions", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", background: "var(--gray-800)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q, i) => (
              <tr key={q.id} style={{ borderTop: "1px solid var(--gray-700)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--gray-700)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 16px", fontSize: 14, color: "#fff", fontWeight: 500 }}>{q.title}</td>
                <td style={{ padding: "12px 16px" }}><Badge type="level">{q.level}</Badge></td>
                <td style={{ padding: "12px 16px" }}><Badge type="type">{q.type}</Badge></td>
                <td style={{ padding: "12px 16px" }}><Badge type={q.access}>{q.access}</Badge></td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: "var(--gray-300)" }}>{q.questions}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => navigate("admin-quiz-edit", { quiz: q })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", display: "flex", alignItems: "center", transition: "color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--gray-400)"}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setDeleteId(q.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", display: "flex", alignItems: "center", transition: "color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--error-400)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--gray-400)"}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "var(--backdrop)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "var(--gray-800)", borderRadius: "var(--radius-xl)", padding: 32, maxWidth: 380, width: "100%", margin: 24, animation: "scaleIn 0.25s ease" }} role="dialog" aria-modal="true">
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Trash2 size={36} color="var(--error-500)" style={{ margin: "0 auto 12px", display: "block" }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Delete Quiz?</h3>
              <p style={{ fontSize: 14, color: "var(--gray-400)", marginTop: 6 }}>This action cannot be undone.</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" size="md" fullWidth onClick={() => setDeleteId(null)} style={{ color: "var(--gray-300)" }}>Cancel</Btn>
              <Btn variant="destructive" size="md" fullWidth onClick={() => handleDelete(deleteId)}>Delete</Btn>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
};

/* ────────────────────────────────────────────
   PAGE: ADMIN QUIZ EDIT
──────────────────────────────────────────── */
const AdminQuizEditPage = ({ navigate, data }) => {
  const [activeSection, setActiveSection] = useState("admin-quizzes");
  const existing = data?.quiz;
  const isNew = data?.isNew;

  const [form, setForm] = useState({
    title: existing?.title || "",
    category: existing?.category || "Grammar",
    level: existing?.level || "A1",
    type: existing?.type || "MCQ",
    access: existing?.access || "free",
  });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaved(true);
    setTimeout(() => navigate("admin-quizzes"), 1500);
  };

  const fieldStyle = { width: "100%", height: 48, padding: "0 14px", background: "var(--gray-700)", border: "1px solid var(--gray-600)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: 15, fontFamily: "var(--font-sans)", outline: "none" };

  return (
    <AdminShell navigate={navigate} activeSection={activeSection} setActiveSection={setActiveSection}>
      <div style={{ maxWidth: 640 }}>
        <button onClick={() => navigate("admin-quizzes")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", display: "flex", alignItems: "center", gap: 6, fontSize: 14, marginBottom: 20, fontFamily: "var(--font-sans)" }}>
          <ArrowLeft size={16} /> Back to Quizzes
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 28, fontFamily: "var(--font-display)" }}>
          {isNew ? "New Quiz" : "Edit Quiz"}
        </h1>

        {saved && (
          <div style={{ background: "var(--success-50)", border: "1px solid var(--success-200)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={16} color="var(--success-500)" />
            <span style={{ fontSize: 14, color: "var(--success-700)" }}>Quiz saved successfully!</span>
          </div>
        )}

        <div style={{ background: "var(--gray-800)", borderRadius: "var(--radius-lg)", padding: 28, border: "1px solid var(--gray-700)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-300)", marginBottom: 6, display: "block" }}>Quiz Title *</label>
              <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="e.g. German Articles Quiz" style={{ ...fieldStyle, borderColor: errors.title ? "var(--error-500)" : "var(--gray-600)" }} />
              {errors.title && <span style={{ fontSize: 12, color: "var(--error-400)", marginTop: 4, display: "block" }}>{errors.title}</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-300)", marginBottom: 6, display: "block" }}>Category</label>
                <select value={form.category} onChange={e => update("category", e.target.value)} style={{ ...fieldStyle }}>
                  {["Grammar", "Verbs", "Syntax", "Vocabulary", "Pronunciation"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-300)", marginBottom: 6, display: "block" }}>Level</label>
                <select value={form.level} onChange={e => update("level", e.target.value)} style={{ ...fieldStyle }}>
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-300)", marginBottom: 6, display: "block" }}>Question Type</label>
                <select value={form.type} onChange={e => update("type", e.target.value)} style={{ ...fieldStyle }}>
                  {["MCQ", "Fill-Blank", "True-False", "Audio", "Image"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-300)", marginBottom: 6, display: "block" }}>Access Tier</label>
                <select value={form.access} onChange={e => update("access", e.target.value)} style={{ ...fieldStyle }}>
                  <option value="free">Free for All</option>
                  <option value="registered">Registered Members</option>
                  <option value="premium">Premium Only</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
              <Btn variant="primary" size="md" onClick={handleSave}>Save Quiz</Btn>
              <Btn variant="ghost" size="md" onClick={() => navigate("admin-quizzes")} style={{ color: "var(--gray-400)" }}>Cancel</Btn>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

/* ────────────────────────────────────────────
   PAGE: ADMIN USER MANAGEMENT
──────────────────────────────────────────── */
const AdminUsersPage = ({ navigate }) => {
  const [activeSection, setActiveSection] = useState("admin-users");
  const [search, setSearch] = useState("");

  const users = [
    { id: 1, name: "Maria Schmidt", email: "maria@example.de", plan: "premium", quizzes: 34, joined: "2026-03-12", status: "active" },
    { id: 2, name: "Hans Weber", email: "hans@example.de", plan: "free", quizzes: 8, joined: "2026-04-01", status: "active" },
    { id: 3, name: "Anna Müller", email: "anna@example.de", plan: "free", quizzes: 2, joined: "2026-04-25", status: "active" },
    { id: 4, name: "Klaus Becker", email: "klaus@example.de", plan: "premium", quizzes: 67, joined: "2026-01-20", status: "inactive" },
  ].filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminShell navigate={navigate} activeSection={activeSection} setActiveSection={setActiveSection}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", fontFamily: "var(--font-display)" }}>Users</h1>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            style={{ paddingLeft: 32, paddingRight: 12, height: 36, background: "var(--gray-700)", border: "1px solid var(--gray-600)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none", width: 220 }} />
        </div>
      </div>

      <div style={{ background: "var(--gray-800)", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-700)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["User", "Plan", "Quizzes Done", "Joined", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderTop: "1px solid var(--gray-700)" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{u.email}</div>
                </td>
                <td style={{ padding: "14px 16px" }}><Badge type={u.plan === "premium" ? "premium" : "free"}>{u.plan}</Badge></td>
                <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--gray-300)" }}>{u.quizzes}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--gray-400)" }}>{u.joined}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 8px", borderRadius: "var(--radius-full)", background: u.status === "active" ? "var(--success-50)" : "var(--gray-100)", color: u.status === "active" ? "var(--success-600)" : "var(--gray-400)" }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)" }}><Pencil size={15} /></button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)" }}><MoreVertical size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--gray-700)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "var(--gray-400)" }}>Showing {users.length} of 1,248 users</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ padding: "6px 12px", background: "var(--gray-700)", border: "none", borderRadius: "var(--radius-md)", color: "var(--gray-300)", cursor: "pointer", fontSize: 13 }}>Previous</button>
            <button style={{ padding: "6px 12px", background: "var(--brand-600)", border: "none", borderRadius: "var(--radius-md)", color: "#fff", cursor: "pointer", fontSize: 13 }}>Next</button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

/* ────────────────────────────────────────────
   PAGE: ADMIN CSV IMPORT
──────────────────────────────────────────── */
const AdminImportPage = ({ navigate }) => {
  const [activeSection, setActiveSection] = useState("admin-import");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith(".csv")) setFile(f);
  };

  const handleImport = () => {
    if (!file) return;
    setImporting(true);
    setTimeout(() => { setImporting(false); setDone(true); }, 2000);
  };

  return (
    <AdminShell navigate={navigate} activeSection={activeSection} setActiveSection={setActiveSection}>
      <div style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8, fontFamily: "var(--font-display)" }}>CSV Import</h1>
        <p style={{ fontSize: 14, color: "var(--gray-400)", marginBottom: 28 }}>Import quiz questions in bulk using a CSV file.</p>

        {done ? (
          <div style={{ background: "var(--gray-800)", borderRadius: "var(--radius-xl)", padding: 40, textAlign: "center", border: "1px solid var(--gray-700)" }}>
            <CheckCircle size={48} color="var(--success-500)" style={{ margin: "0 auto 16px", display: "block" }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Import Successful!</h3>
            <p style={{ fontSize: 14, color: "var(--gray-400)", marginBottom: 24 }}>42 questions imported successfully.</p>
            <Btn variant="primary" size="md" onClick={() => { setFile(null); setDone(false); }}>Import Another</Btn>
          </div>
        ) : (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragOver ? "var(--brand-500)" : file ? "var(--success-500)" : "var(--gray-600)"}`,
                borderRadius: "var(--radius-xl)", padding: "48px 24px",
                textAlign: "center", background: dragOver ? "rgba(99,102,241,0.05)" : "var(--gray-800)",
                transition: "all 0.2s ease", marginBottom: 20, cursor: "pointer",
              }}
              onClick={() => document.getElementById("csv-upload")?.click()}
            >
              <Upload size={40} color={file ? "var(--success-500)" : "var(--gray-500)"} style={{ margin: "0 auto 12px", display: "block" }} />
              {file ? (
                <>
                  <p style={{ fontSize: 16, fontWeight: 600, color: "var(--success-400)" }}>✓ {file.name}</p>
                  <p style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 4 }}>Ready to import</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Drop your CSV file here</p>
                  <p style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 4 }}>or click to browse · .csv files only</p>
                </>
              )}
              <input id="csv-upload" type="file" accept=".csv" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
            </div>

            <div style={{ background: "var(--gray-800)", borderRadius: "var(--radius-lg)", padding: 16, marginBottom: 20, border: "1px solid var(--gray-700)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-300)", marginBottom: 8 }}>Expected CSV format:</p>
              <code style={{ fontSize: 12, color: "var(--brand-400)", fontFamily: "monospace", display: "block", lineHeight: 1.8 }}>
                question,type,option_a,option_b,option_c,option_d,correct,explanation,level,hint
              </code>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="primary" size="md" onClick={handleImport} disabled={!file} loading={importing}>
                <Upload size={16} /> Import Questions
              </Btn>
              <Btn variant="ghost" size="md" style={{ color: "var(--gray-400)" }}>
                <Download size={16} /> Download Template
              </Btn>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
};

/* ────────────────────────────────────────────
   PAGE: ADMIN QUESTION EDIT
──────────────────────────────────────────── */
const AdminQuestionsPage = ({ navigate }) => {
  const [activeSection, setActiveSection] = useState("admin-questions");
  const [editIdx, setEditIdx] = useState(null);
  const [questions, setQuestions] = useState([...QUIZ_QUESTIONS]);

  const handleAddQuestion = () => {
    const newQ = {
      id: Date.now(),
      text: "New Question",
      type: "MCQ",
      options: ["Option 1", "Option 2"],
      correct: 0,
      explanation: "Add an explanation here.",
      hint: "Add a helpful hint here.",
    };
    QUIZ_QUESTIONS.push(newQ);
    setQuestions([...QUIZ_QUESTIONS]);
    setEditIdx(QUIZ_QUESTIONS.length - 1);
  };

  const handleDelete = (index, e) => {
    e.stopPropagation();
    QUIZ_QUESTIONS.splice(index, 1);
    setQuestions([...QUIZ_QUESTIONS]);
    if (editIdx === index) setEditIdx(null);
  };

  const updateQuestion = (index, field, value) => {
    QUIZ_QUESTIONS[index][field] = value;
    setQuestions([...QUIZ_QUESTIONS]);
  };

  const updateOption = (qIndex, optIndex, value) => {
    QUIZ_QUESTIONS[qIndex].options[optIndex] = value;
    setQuestions([...QUIZ_QUESTIONS]);
  };

  const handleTypeChange = (index, newType) => {
    const q = QUIZ_QUESTIONS[index];
    q.type = newType;
    if (["MCQ", "Image", "Audio"].includes(newType)) {
      q.options = q.options || ["Option 1", "Option 2"];
      q.correct = typeof q.correct === "number" ? q.correct : 0;
    } else if (newType === "True-False") {
      q.correct = typeof q.correct === "boolean" ? q.correct : true;
    } else if (newType === "Fill-Blank") {
      q.answer = q.answer || "";
    }
    setQuestions([...QUIZ_QUESTIONS]);
  };

  return (
    <AdminShell navigate={navigate} activeSection={activeSection} setActiveSection={setActiveSection}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", fontFamily: "var(--font-display)" }}>Questions</h1>
        <Btn variant="primary" size="md" onClick={handleAddQuestion}><Plus size={16} /> New Question</Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {questions.map((q, i) => (
          <div key={i} style={{ background: "var(--gray-800)", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-700)", overflow: "hidden" }}>
            <button onClick={() => setEditIdx(editIdx === i ? null : i)} style={{
              width: "100%", padding: "16px 20px", background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12, textAlign: "left",
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", width: 20 }}>#{i + 1}</span>
              <span style={{ flex: 1, fontSize: 14, color: "#fff", fontWeight: 500 }}>{q.text}</span>
              <Badge type="type">{q.type}</Badge>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={e => { e.stopPropagation(); setEditIdx(i); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)" }}><Pencil size={15} /></button>
                <button onClick={e => handleDelete(i, e)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)" }}><Trash2 size={15} /></button>
              </div>
              {editIdx === i ? <ChevronUp size={16} color="var(--gray-400)" /> : <ChevronDown size={16} color="var(--gray-400)" />}
            </button>
            {editIdx === i && (
              <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--gray-700)", marginTop: 0 }}>
                <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)", marginBottom: 4, display: "block" }}>QUESTION TEXT</label>
                    <textarea value={q.text} onChange={e => updateQuestion(i, "text", e.target.value)} style={{ width: "100%", padding: 12, background: "var(--gray-700)", border: "1px solid var(--gray-600)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: 14, fontFamily: "var(--font-sans)", resize: "vertical", minHeight: 80, outline: "none" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)", marginBottom: 4, display: "block" }}>QUESTION TYPE</label>
                    <select value={q.type} onChange={e => handleTypeChange(i, e.target.value)} style={{ width: "100%", padding: "0 12px", height: 40, background: "var(--gray-700)", border: "1px solid var(--gray-600)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none" }}>
                      <option value="MCQ">Multiple Choice</option>
                      <option value="True-False">True / False</option>
                      <option value="Fill-Blank">Fill in the Blank</option>
                      <option value="Image">Image</option>
                      <option value="Audio">Audio</option>
                    </select>
                  </div>
                  {(q.type === "Image" || q.type === "Audio") && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)", marginBottom: 4, display: "block" }}>MEDIA URL</label>
                      <input value={q.mediaUrl || ""} onChange={e => updateQuestion(i, "mediaUrl", e.target.value)} placeholder={`https://example.com/file.${q.type === "Image" ? "jpg" : "mp3"}`} style={{ width: "100%", padding: "8px 12px", background: "var(--gray-700)", border: "1px solid var(--gray-600)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: 14, outline: "none" }} />
                    </div>
                  )}
                  {["MCQ", "Image", "Audio"].includes(q.type) && q.options && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)", marginBottom: 8, display: "block" }}>OPTIONS</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.options.map((opt, oi) => (
                          <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: oi === q.correct ? "var(--success-400)" : "var(--gray-500)", width: 20 }}>{String.fromCharCode(65 + oi)}</span>
                            <input value={opt} onChange={e => updateOption(i, oi, e.target.value)} style={{ flex: 1, padding: "8px 12px", background: oi === q.correct ? "rgba(34,197,94,0.1)" : "var(--gray-700)", border: `1px solid ${oi === q.correct ? "var(--success-500)" : "var(--gray-600)"}`, borderRadius: "var(--radius-md)", color: "#fff", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none" }} />
                            {oi === q.correct ? <span style={{ fontSize: 11, color: "var(--success-400)", fontWeight: 600, cursor: "pointer" }}>CORRECT</span> : <span onClick={() => updateQuestion(i, "correct", oi)} style={{ fontSize: 11, color: "var(--gray-500)", fontWeight: 600, cursor: "pointer" }}>SET CORRECT</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {q.type === "True-False" && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)", marginBottom: 8, display: "block" }}>CORRECT ANSWER</label>
                      <div style={{ display: "flex", gap: 12 }}>
                        {[{ label: "True", val: true }, { label: "False", val: false }].map(opt => (
                          <button key={String(opt.val)} onClick={() => updateQuestion(i, "correct", opt.val)} style={{ flex: 1, padding: "8px 12px", background: q.correct === opt.val ? "rgba(34,197,94,0.1)" : "var(--gray-700)", border: `1px solid ${q.correct === opt.val ? "var(--success-500)" : "var(--gray-600)"}`, borderRadius: "var(--radius-md)", color: q.correct === opt.val ? "var(--success-400)" : "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {q.type === "Fill-Blank" && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)", marginBottom: 4, display: "block" }}>CORRECT ANSWER TEXT</label>
                      <input value={q.answer || ""} onChange={e => updateQuestion(i, "answer", e.target.value)} placeholder="Enter the exact correct text..." style={{ width: "100%", padding: "8px 12px", background: "var(--gray-700)", border: "1px solid var(--gray-600)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: 14, outline: "none" }} />
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)", marginBottom: 4, display: "block" }}>HINT</label>
                    <textarea value={q.hint || ""} onChange={e => updateQuestion(i, "hint", e.target.value)} style={{ width: "100%", padding: 12, background: "var(--gray-700)", border: "1px solid var(--gray-600)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: 14, fontFamily: "var(--font-sans)", resize: "vertical", minHeight: 60, outline: "none", marginBottom: 12 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)", marginBottom: 4, display: "block" }}>EXPLANATION</label>
                    <textarea value={q.explanation} onChange={e => updateQuestion(i, "explanation", e.target.value)} style={{ width: "100%", padding: 12, background: "var(--gray-700)", border: "1px solid var(--gray-600)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: 14, fontFamily: "var(--font-sans)", resize: "vertical", minHeight: 60, outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="primary" size="sm" onClick={() => setEditIdx(null)}>Save</Btn>
                    <Btn variant="ghost" size="sm" onClick={() => setEditIdx(null)} style={{ color: "var(--gray-400)" }}>Cancel</Btn>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminShell>
  );
};

/* ────────────────────────────────────────────
   PAGE: ERROR STATE
──────────────────────────────────────────── */
const ErrorPage = ({ navigate }) => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
    <AlertCircle size={64} color="var(--error-300)" style={{ marginBottom: 16 }} />
    <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--gray-900)", marginBottom: 8, fontFamily: "var(--font-display)" }}>Page Not Found</h1>
    <p style={{ fontSize: 16, color: "var(--gray-500)", marginBottom: 28 }}>We couldn't find what you were looking for.</p>
    <Btn variant="primary" size="lg" onClick={() => navigate("landing")}>Go Home</Btn>
  </div>
);

/* ────────────────────────────────────────────
   NAV BAR — Page Switcher (Demo only)
──────────────────────────────────────────── */
const PageSwitcher = ({ current, navigate }) => {
  const [open, setOpen] = useState(false);
  const pages = [
    { id: "landing", label: "Landing" },
    { id: "quiz-library", label: "Quiz Library" },
    { id: "quiz-start", label: "Quiz Start" },
    { id: "quiz-session", label: "Quiz Session" },
    { id: "quiz-completion", label: "Quiz Completion" },
    { id: "pricing", label: "Pricing" },
    { id: "register", label: "Register" },
    { id: "login", label: "Login" },
    { id: "forgot-password", label: "Forgot Password" },
    { id: "dashboard", label: "User Dashboard" },
    { id: "admin-login", label: "Admin Login" },
    { id: "admin-dashboard", label: "Admin Dashboard" },
    { id: "admin-quizzes", label: "Admin Quizzes" },
    { id: "admin-questions", label: "Admin Questions" },
    { id: "admin-users", label: "Admin Users" },
    { id: "admin-import", label: "Admin CSV Import" },
    { id: "admin-quiz-edit", label: "Admin Quiz Edit" },
  ];

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}>
      {open && (
        <div style={{
          position: "absolute", bottom: 52, right: 0,
          background: "var(--gray-900)", borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-xl)", padding: 8, width: 220,
          maxHeight: 400, overflowY: "auto", border: "1px solid var(--gray-700)",
          animation: "slideUp 0.2s ease",
        }}>
          {pages.map(p => (
            <button key={p.id} onClick={() => { navigate(p.id); setOpen(false); }} style={{
              width: "100%", padding: "8px 12px", background: current === p.id ? "var(--brand-600)" : "transparent",
              border: "none", borderRadius: "var(--radius-md)", cursor: "pointer",
              fontSize: 13, color: current === p.id ? "#fff" : "var(--gray-300)",
              fontFamily: "var(--font-sans)", textAlign: "left", transition: "all 0.1s",
            }}>{p.label}</button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(!open)} style={{
        width: 48, height: 48, borderRadius: "50%",
        background: "var(--brand-600)", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "var(--shadow-xl)", color: "#fff",
      }}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
};

/* ────────────────────────────────────────────
   ROOT APP
──────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("landing");
  const [pageData, setPageData] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCookie, setShowCookie] = useState(true);

  const navigate = (p, data = null) => {
    setPage(p);
    setPageData(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  };

  const handleLogin = (userData) => {
    setUser(userData);
    showToast(`Welcome back, ${userData.name}!`, "success");
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    navigate("landing");
    showToast("Logged out successfully.", "info");
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    showToast("Admin access granted.", "success");
  };

  const renderPage = () => {
    const props = { navigate, user, data: pageData };
    switch (page) {
      case "landing": return <LandingPage {...props} />;
      case "quiz-library": return <QuizLibraryPage {...props} />;
      case "quiz-start": return <QuizStartPage {...props} />;
      case "quiz-session": return <QuizSessionPage {...props} />;
      case "quiz-completion": return <QuizCompletionPage {...props} />;
      case "pricing": return <PricingPage {...props} />;
      case "register": return <RegisterPage {...props} onLogin={handleLogin} />;
      case "login": return <LoginPage {...props} onLogin={handleLogin} />;
      case "forgot-password": return <ForgotPasswordPage {...props} />;
      case "dashboard": return <DashboardPage {...props} onLogout={handleLogout} />;
      case "admin-login": return <AdminLoginPage {...props} onAdminLogin={handleAdminLogin} />;
      case "admin-dashboard": return <AdminDashboardPage {...props} />;
      case "admin-quizzes": return <AdminQuizListPage {...props} />;
      case "admin-quiz-edit": return <AdminQuizEditPage {...props} />;
      case "admin-questions": return <AdminQuestionsPage {...props} />;
      case "admin-users": return <AdminUsersPage {...props} />;
      case "admin-import": return <AdminImportPage {...props} />;
      default: return <ErrorPage {...props} />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      {renderPage()}

      {/* Toast */}
      {toast && <Toast key={toast.id} toast={toast} onClose={() => setToast(null)} />}

      {/* Cookie banner */}
      {showCookie && page === "landing" && (
        <CookieBanner onAccept={() => setShowCookie(false)} onDecline={() => setShowCookie(false)} />
      )}

      {/* Page switcher */}
      <PageSwitcher current={page} navigate={navigate} />
    </>
  );
}

import { createRoot } from "react-dom/client";
const root = document.getElementById("app");
if (root) {
  createRoot(root).render(<App />);
}
