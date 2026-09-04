import { useState, useEffect, useRef, useContext, createContext, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Heart, Star, MapPin, Clock, Eye, X, Menu, ChevronRight,
  ChevronDown, MessageSquare, Send, Building2, Award, Users, ArrowRight,
  Check, Share2, Phone, Mail, Instagram, Linkedin, Zap, Sparkles,
  Bot, Trash2, ExternalLink, Filter, Twitter, Globe, Plus, Minus,
  Bookmark, Home, Compass, GitCompare, TrendingUp, Quote, SlidersHorizontal,
  LogIn, LogOut, Loader2, AlertCircle
} from "lucide-react";
import { href } from "react-router";
import { api, ApiError, getToken, setToken } from "../api/client";
import { useApiData, useDebouncedValue } from "../api/useApi";
import type { Architect, Design, Style, Testimonial, User } from "../api/types";

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

// Designs, architects, styles and testimonials now come from the API (see src/api/client.ts).

const FAQS = [
  { q: "How does ArchVision AI match me with architects?", a: "Our AI analyses your style preferences, budget, location, and project scope to surface architects whose portfolio and expertise align precisely with your vision — not just proximity." },
  { q: "Is it free to browse designs and architect profiles?", a: "Absolutely. All design exploration, AI recommendations, and architect browsing are free forever. We only charge architects for enhanced listing features." },
  { q: "Can I contact architects directly through the platform?", a: "Yes. Every architect profile includes direct contact options. We encourage site visits and consultations before committing." },
  { q: "How current are the design portfolios?", a: "Architects update their portfolios in real time. Every project displays its completion date so you always know how recent the work is." },
  { q: "What if I don't know my architectural style?", a: "Browse designs by mood, filter by budget, and let the AI recommendation chat guide you to your vision through a simple conversation." },
];

const AI_PROMPTS = [
  "I want a minimalist 3BHK villa with large windows under ₹70 lakh",
  "Show me biophilic homes in Goa under ₹1 crore",
  "Contemporary house with pool in Bangalore, budget ₹80 lakh",
  "Industrial loft conversion in metro city under ₹60 lakh",
];

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────

const AppCtx = createContext<any>(null);
const useApp = () => useContext(AppCtx);

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─────────────────────────────────────────────
// LOADING / ERROR / EMPTY STATES
// ─────────────────────────────────────────────

function LoadingBlock({ label = "Loading…", className = "py-20" }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-slate-500", className)}>
      <Loader2 size={28} className="animate-spin text-sky-400 mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function ErrorBlock({ message, onRetry, className = "py-20" }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center px-6", className)}>
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center mb-4">
        <AlertCircle size={22} className="text-red-400" />
      </div>
      <p className="text-white font-semibold mb-2">Something went wrong</p>
      <p className="text-slate-500 text-sm max-w-md">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-5 px-6 py-2.5 border border-sky-400/30 text-sky-400 hover:bg-sky-400/10 text-sm rounded-xl transition-all">
          Try again
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────

function ToastNotification() {
  const { toast, setToast } = useApp();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast, setToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl"
          style={{ background: "rgba(30,41,59,0.95)" }}
        >
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
            toast.type === "success" ? "bg-emerald-500/20" : toast.type === "error" ? "bg-red-500/20" : "bg-sky-500/20"
          )}>
            <Check size={12} className={cn(
              toast.type === "success" ? "text-emerald-400" : toast.type === "error" ? "text-red-400" : "text-sky-400"
            )} />
          </div>
          <span className="text-sm text-slate-200">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-300 ml-1">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// AUTH MODAL
// ─────────────────────────────────────────────

function AuthModal() {
  const { authOpen, closeAuth, signIn, signUp } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authOpen) {
      setMode("login");
      setForm({ name: "", email: "", password: "" });
      setError(null);
    }
  }, [authOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "login") await signIn(form.email, form.password);
      else await signUp(form.name, form.email, form.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 outline-none focus:border-sky-400/50 transition-colors";

  return (
    <AnimatePresence>
      {authOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={closeAuth}
          className="fixed inset-0 z-[90] flex items-center justify-center px-6"
          style={{ background: "rgba(8,15,30,0.75)", backdropFilter: "blur(6px)" }}>
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md p-8 rounded-3xl bg-[#1E293B] border border-white/8 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="text-slate-500 text-sm mt-1">Save designs across all your devices.</p>
              </div>
              <button onClick={closeAuth} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-2">Your Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required placeholder="Rohan Malhotra" className={inputClass} />
                </div>
              )}
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-2">Email</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required type="email" placeholder="rohan@example.com" className={inputClass} />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-2">Password</label>
                <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required type="password" minLength={8} placeholder="At least 8 characters" className={inputClass} />
              </div>

              {error && (
                <p className="flex items-center gap-2 text-red-400 text-xs"><AlertCircle size={13} />{error}</p>
              )}

              <button type="submit" disabled={submitting}
                className="w-full py-3.5 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 text-[#0F172A] font-semibold text-sm rounded-2xl transition-all flex items-center justify-center gap-2">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                {mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="text-slate-500 text-sm text-center mt-5">
              {mode === "login" ? "New to ArchVision?" : "Already have an account?"}{" "}
              <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
                className="text-sky-400 hover:text-sky-300 transition-colors">
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────

function Navbar({ currentPage }: { currentPage: string }) {
  const { navigate, favorites, user, openAuth, signOut } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Explore", page: "explore", icon: Compass },
    { label: "AI Match", page: "ai", icon: Bot },
    { label: "Compare", page: "compare", icon: GitCompare },
    { label: "About", page: "about", icon: null },
    { label: "Contact", page: "contact", icon: null },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      scrolled ? "backdrop-blur-xl border-b border-white/8" : ""
    )} style={{ background: scrolled ? "rgba(15,23,42,0.92)" : "transparent" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate("home")} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-sky-400 rounded-lg flex items-center justify-center shadow-lg shadow-sky-400/30">
            <Building2 size={15} className="text-[#0F172A]" />
          </div>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-white font-semibold text-lg tracking-tight">
            ArchVision<span className="text-sky-400"> AI</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-7">
          {links.map(l => (
            <button key={l.page} onClick={() => navigate(l.page)}
              className={cn("text-sm transition-colors duration-200",
                currentPage === l.page ? "text-sky-400" : "text-slate-400 hover:text-white")}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("favorites")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white text-sm transition-colors rounded-lg hover:bg-white/5">
            <Heart size={15} className={favorites.length ? "fill-red-400 text-red-400" : ""} />
            <span className="hidden md:block">Saved</span>
            {favorites.length > 0 && (
              <span className="w-4 h-4 bg-sky-400 rounded-full text-[10px] text-[#0F172A] font-bold flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>
          {user ? (
            <button onClick={signOut}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white text-sm transition-colors rounded-lg hover:bg-white/5">
              <LogOut size={15} />
              <span className="hidden md:block">{user.name.split(" ")[0]}</span>
            </button>
          ) : (
            <button onClick={openAuth}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white text-sm transition-colors rounded-lg hover:bg-white/5">
              <LogIn size={15} />
              <span className="hidden md:block">Sign In</span>
            </button>
          )}
          <button onClick={() => navigate("contact")}
            className="hidden sm:block px-4 py-2 bg-sky-400 hover:bg-sky-300 text-[#0F172A] text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-sky-400/25">
            Get Started
          </button>
          <button className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setOpen(v => !v)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-b border-white/8"
            style={{ background: "rgba(15,23,42,0.98)", backdropFilter: "blur(20px)" }}>
            <div className="px-6 py-5 space-y-1">
              {links.map(l => (
                <button key={l.page} onClick={() => { navigate(l.page); setOpen(false); }}
                  className={cn("w-full text-left py-3 px-3 rounded-xl text-sm transition-colors",
                    currentPage === l.page ? "text-sky-400 bg-sky-400/10" : "text-slate-300 hover:text-white hover:bg-white/5")}>
                  {l.label}
                </button>
              ))}
              <button onClick={() => { navigate("favorites"); setOpen(false); }}
                className="w-full text-left py-3 px-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                Saved Designs {favorites.length > 0 && `(${favorites.length})`}
              </button>
              <button onClick={() => { user ? signOut() : openAuth(); setOpen(false); }}
                className="w-full text-left py-3 px-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                {user ? `Sign out (${user.name.split(" ")[0]})` : "Sign In"}
              </button>
              <div className="pt-2">
                <button onClick={() => { navigate("contact"); setOpen(false); }}
                  className="w-full py-2.5 bg-sky-400 text-[#0F172A] font-semibold text-sm rounded-xl">
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────

function Footer() {
  const { navigate, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim() || subscribing) return;
    setSubscribing(true);
    try {
      await api.subscribeNewsletter(email.trim());
      showToast("Subscribed! Design inspiration lands every Friday.", "success");
      setEmail("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Subscription failed", "error");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="border-t border-white/8 bg-[#0A1628]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <button onClick={() => navigate("home")} className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-sky-400 rounded-lg flex items-center justify-center">
                <Building2 size={15} className="text-[#0F172A]" />
              </div>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-white font-semibold text-lg">
                ArchVision AI
              </span>
            </button>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              Discover architecture. Find architects. Build your vision.
            </p>
            <div className="flex gap-3">
              {[
                {
                Icon: Twitter,
                href: "#",
                }, {
                Icon: Instagram,
                href: "https://www.instagram.com/_brain._.less_/?hl=en",  
                }, { 
                Icon: Linkedin,
                href: "https://www.linkedin.com/in/priyanshu-ranjan-mistry-9983842a1/",
                },
               ].map(({ Icon, href }, i) => (
                  <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-sky-400/20 border border-white/8 hover:border-sky-400/30 flex items-center justify-center text-slate-500 hover:text-sky-400 transition-all duration-200"
                  >
                    <Icon size={15} />
                  </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white font-medium text-sm mb-4">Explore</p>
            <div className="space-y-2.5">
              {[["Designs", "explore"], ["Architects", "explore"], ["AI Match", "ai"], ["Compare", "compare"]].map(([label, page]) => (
                <button key={label} onClick={() => navigate(page as string)}
                  className="block text-slate-500 hover:text-sky-400 text-sm transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white font-medium text-sm mb-4">Company</p>
            <div className="space-y-2.5">
              {[["About Us", "about"], ["Contact", "contact"], ["Careers", "contact"], ["Press", "contact"]].map(([label, page]) => (
                <button key={label} onClick={() => navigate(page as string)}
                  className="block text-slate-500 hover:text-sky-400 text-sm transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white font-medium text-sm mb-4">Newsletter</p>
            <p className="text-slate-500 text-sm mb-4">Get weekly design inspiration delivered to your inbox.</p>
            <div className="flex gap-2">
              <input value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubscribe()}
                placeholder="your@email.com" type="email"
                className="flex-1 px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-400/50 transition-colors" />
              <button onClick={handleSubscribe} disabled={subscribing}
                className="px-3 py-2.5 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 text-[#0F172A] rounded-xl transition-colors flex-shrink-0">
                {subscribing ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">© 2025 ArchVision AI. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(item => (
              <a key={item} href="#" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// FLOATING ACTION BUTTON
// ─────────────────────────────────────────────

function FAB() {
  const { navigate } = useApp();
  const [expanded, setExpanded] = useState(false);

  const actions = [
    { icon: Bot, label: "AI Match", page: "ai", color: "bg-violet-500" },
    { icon: Compass, label: "Explore", page: "explore", color: "bg-emerald-500" },
    { icon: GitCompare, label: "Compare", page: "compare", color: "bg-amber-500" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3">
      <AnimatePresence>
        {expanded && actions.map((a, i) => (
          <motion.button key={a.page}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => { navigate(a.page); setExpanded(false); }}
            className={cn("flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-white text-sm font-medium shadow-xl", a.color)}>
            <a.icon size={15} />
            {a.label}
          </motion.button>
        ))}
      </AnimatePresence>
      <motion.button whileTap={{ scale: 0.92 }}
        onClick={() => setExpanded(v => !v)}
        className="w-14 h-14 bg-sky-400 hover:bg-sky-300 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-400/30 transition-colors">
        <motion.div animate={{ rotate: expanded ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus size={22} className="text-[#0F172A]" />
        </motion.div>
      </motion.button>
    </div>
  );
}

// ─────────────────────────────────────────────
// DESIGN CARD
// ─────────────────────────────────────────────

function DesignCard({ design }: { design: any }) {
  const { navigate, favorites, toggleFavorite, showToast } = useApp();
  const isFav = favorites.includes(design.id);

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative rounded-2xl overflow-hidden border border-white/8 bg-[#1E293B] cursor-pointer">
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <img src={design.image} alt={design.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-transparent to-transparent" />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={() => navigate("design", design.id)}
            className="px-5 py-2.5 backdrop-blur-md bg-white/15 border border-white/25 text-white text-sm rounded-full hover:bg-white/25 transition-all shadow-xl">
            <span className="flex items-center gap-2"><Eye size={14} /> View Details</span>
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(design.id); showToast(isFav ? "Removed from saved" : "Saved!", isFav ? "info" : "success"); }}
          className={cn(
            "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm border",
            isFav
              ? "bg-red-500/20 border-red-500/40 opacity-100"
              : "bg-black/40 border-white/20 opacity-0 group-hover:opacity-100"
          )}>
          <Heart size={14} className={isFav ? "fill-red-400 text-red-400" : "text-white"} />
        </button>

        {/* Style badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-xs rounded-full backdrop-blur-md bg-sky-400/15 border border-sky-400/30 text-sky-300">
            {design.style}
          </span>
        </div>
      </div>

      <div className="p-4" onClick={() => navigate("design", design.id)}>
        <h3 className="text-white font-semibold text-sm mb-1.5 group-hover:text-sky-400 transition-colors">
          {design.title}
        </h3>
        <div className="flex items-center gap-1 mb-3">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span className="text-amber-400 text-xs font-medium">{design.rating}</span>
          <span className="text-slate-600 text-xs">({design.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <MapPin size={11} /><span>{design.location}</span>
          </div>
          <span className="text-sky-400 text-xs font-semibold">{design.budget}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// ARCHITECT CARD
// ─────────────────────────────────────────────

function ArchitectCard({ architect }: { architect: any }) {
  const { navigate } = useApp();

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.25 }}
      onClick={() => navigate("architect", architect.id)}
      className="group bg-[#1E293B] border border-white/8 rounded-2xl overflow-hidden cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img src={architect.image} alt={architect.name}
          className="w-full h-full object-cover object-centre transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-[#1E293B]/20 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <div className="flex gap-1.5">
            {architect.specialties.slice(0, 2).map((s: string) => (
              <span key={s} className="px-2 py-0.5 text-[10px] bg-white/10 backdrop-blur-sm border border-white/15 text-slate-300 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold mb-0.5 group-hover:text-sky-400 transition-colors">{architect.name}</h3>
        <p className="text-slate-500 text-xs mb-3">{architect.firm} · {architect.location}</p>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-amber-400">
            <Star size={11} className="fill-amber-400" />
            <span className="font-medium">{architect.rating}</span>
            <span className="text-slate-600">({architect.reviews})</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>{architect.experience}y exp</span>
            <span>{architect.projects} projects</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─────────────────────────────────────────────
// PAGE TRANSITION WRAPPER
// ─────────────────────────────────────────────

function PageWrap({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────

function Landing() {
  const { navigate, setExploreQuery } = useApp();
  const [query, setQuery] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const featured = useApiData(() => api.listDesigns({ featured: true }), []);
  const architects = useApiData(() => api.listArchitects(), []);
  const testimonials = useApiData(() => api.listTestimonials(), []);

  const suggestions = ["Minimalist villa in Mumbai", "Biophilic home in Goa", "Contemporary apartment Bangalore", "Industrial loft Delhi"];

  const filteredSuggestions = query.length > 0
    ? suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  const searchFor = (term: string) => {
    setExploreQuery(term.trim());
    navigate("explore");
  };

  const handleSearch = () => searchFor(query);

  return (
    <PageWrap>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&h=1080&fit=crop&auto=format"
            alt="Modern architecture"
            className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.93) 0%, rgba(15,23,42,0.75) 50%, rgba(15,23,42,0.88) 100%)" }} />
          {/* Animated glow */}
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #38BDF8, transparent)" }} />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl"
            style={{ background: "radial-gradient(circle, #8B5CF6, transparent)" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-sky-400/25 bg-sky-400/8 text-sky-400 text-sm">
              <Sparkles size={14} />
              <span>AI-powered architectural discovery</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Discover Architecture,<br />
            <span className="text-sky-400">Find Your Architect</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Browse extraordinary architectural designs first. Let the work speak, then meet the mind behind it.
          </motion.p>

          {/* Search bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="relative max-w-2xl mx-auto mb-4">
            <div className={cn(
              "flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all duration-300",
              searchFocus ? "border-sky-400/50 shadow-xl shadow-sky-400/15" : "border-white/12",
              "backdrop-blur-xl"
            )} style={{ background: "rgba(30,41,59,0.85)" }}>
              <Search size={18} className="text-slate-500 flex-shrink-0" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search styles, locations, budgets..."
                className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm" />
              <button onClick={handleSearch}
                className="px-5 py-2.5 bg-sky-400 hover:bg-sky-300 text-[#0F172A] text-sm font-semibold rounded-xl transition-all duration-200 flex-shrink-0">
                Search
              </button>
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {searchFocus && filteredSuggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/10 overflow-hidden z-20"
                  style={{ background: "rgba(15,23,42,0.97)", backdropFilter: "blur(20px)" }}>
                  {filteredSuggestions.map((s, i) => (
                    <button key={i} onMouseDown={() => { setQuery(s); searchFor(s); }}
                      className="w-full text-left px-5 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors">
                      <Search size={13} className="text-slate-600" />
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600">
            <span>Trending:</span>
            {["Minimalist", "Biophilic", "Industrial", "Art Deco"].map(tag => (
              <button key={tag} onClick={() => searchFor(tag)}
                className="text-slate-400 hover:text-sky-400 transition-colors underline underline-offset-2">{tag}</button>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
          <span className="text-xs">Scroll to explore</span>
          <ChevronDown size={16} />
        </motion.div>
      </section>

      {/* STATS */}
      <section className="py-16 border-y border-white/6" style={{ background: "rgba(30,41,59,0.4)" }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Designs", target: 2400, suffix: "+", Icon: Building2 },
            { label: "Architects", target: 340, suffix: "+", Icon: Users },
            { label: "Happy Clients", target: 8900, suffix: "+", Icon: Heart },
            { label: "Cities", target: 47, suffix: "", Icon: MapPin },
          ].map(({ label, target, suffix, Icon }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-2 text-sky-400 mb-2">
                <Icon size={18} />
              </div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-3xl font-bold text-white mb-1">
                <AnimatedCounter target={target} suffix={suffix} />
              </div>
              <div className="text-slate-500 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING STYLES */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={18} className="text-sky-400" />
            <span className="text-sky-400 text-sm font-medium uppercase tracking-widest">Trending Now</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl font-bold text-white mb-8">Popular Styles This Season</h2>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          {[
            { style: "Minimalist", count: 487, color: "from-slate-500/20 to-slate-600/10" },
            { style: "Contemporary", count: 342, color: "from-sky-500/20 to-sky-600/10" },
            { style: "Biophilic", count: 298, color: "from-emerald-500/20 to-emerald-600/10" },
            { style: "Industrial", count: 215, color: "from-amber-500/20 to-amber-600/10" },
            { style: "Brutalist", count: 167, color: "from-red-500/20 to-red-600/10" },
            { style: "Art Deco", count: 134, color: "from-violet-500/20 to-violet-600/10" },
            { style: "Futuristic", count: 98, color: "from-cyan-500/20 to-cyan-600/10" },
            { style: "Colonial", count: 87, color: "from-rose-500/20 to-rose-600/10" },
          ].map(({ style, count, color }, i) => (
            <motion.button key={style} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => searchFor(style)}
              className={cn("flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-white/10 bg-gradient-to-br", color, "text-white hover:border-sky-400/40 transition-all duration-200")}>
              <span className="font-medium text-sm">{style}</span>
              <span className="text-xs text-slate-500 font-mono">{count}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* FEATURED DESIGNS */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={18} className="text-sky-400" />
              <span className="text-sky-400 text-sm font-medium uppercase tracking-widest">Curated Picks</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-3xl font-bold text-white">Featured Designs</h2>
          </motion.div>
          <button onClick={() => navigate("explore")}
            className="hidden sm:flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm transition-colors">
            View all <ArrowRight size={14} />
          </button>
        </div>
        {featured.loading ? (
          <LoadingBlock label="Loading featured designs…" />
        ) : featured.error ? (
          <ErrorBlock message={featured.error} onRetry={featured.reload} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featured.data?.designs ?? []).map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <DesignCard design={d} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* POPULAR ARCHITECTS */}
      <section className="py-20" style={{ background: "rgba(30,41,59,0.3)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-2">
                <Award size={18} className="text-sky-400" />
                <span className="text-sky-400 text-sm font-medium uppercase tracking-widest">Top Rated</span>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-3xl font-bold text-white">Popular Architects</h2>
            </motion.div>
            <button onClick={() => navigate("explore")}
              className="hidden sm:flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm transition-colors">
              All architects <ArrowRight size={14} />
            </button>
          </div>
          {architects.loading ? (
            <LoadingBlock label="Loading architects…" />
          ) : architects.error ? (
            <ErrorBlock message={architects.error} onRetry={architects.reload} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(architects.data?.architects ?? []).slice(0, 4).map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <ArchitectCard architect={a} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Quote size={18} className="text-sky-400" />
            <span className="text-sky-400 text-sm font-medium uppercase tracking-widest">Client Stories</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl font-bold text-white">What Our Users Say</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(testimonials.data?.testimonials ?? []).map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-white/8 bg-[#1E293B]/60 backdrop-blur-sm">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={13} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.location} · {t.project}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI CTA */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center border border-sky-400/20">
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(139,92,246,0.08) 100%)" }} />
          <div className="absolute inset-0 border border-sky-400/15 rounded-3xl" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-sky-400/15 border border-sky-400/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot size={24} className="text-sky-400" />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tell Us Your Dream Home
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-8 text-lg">
              Our AI understands style, space, and budget — and finds the perfect architect for your vision in seconds.
            </p>
            <button onClick={() => navigate("ai")}
              className="px-8 py-4 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold rounded-2xl transition-all duration-200 inline-flex items-center gap-3 shadow-xl shadow-sky-400/25 text-sm">
              <Sparkles size={16} />
              Try AI Recommendation
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="py-20 max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl font-bold text-white mb-3">Frequently Asked</h2>
          <p className="text-slate-500">Everything you need to know about ArchVision AI</p>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/8 overflow-hidden bg-[#1E293B]/40">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/3 transition-colors">
                <span className="text-white text-sm font-medium pr-4">{faq.q}</span>
                <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                    <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/6 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// EXPLORE PAGE
// ─────────────────────────────────────────────

function Explore() {
  const { exploreQuery, setExploreQuery, styles } = useApp();
  const [activeStyle, setActiveStyle] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [budgetMax, setBudgetMax] = useState(15000000);
  const [searchQ, setSearchQ] = useState(exploreQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [viewTab, setViewTab] = useState<"designs" | "architects">("designs");
  const debouncedQ = useDebouncedValue(searchQ);

  // The landing-page search box seeds this page, then hands control back to it.
  useEffect(() => { if (exploreQuery) setExploreQuery(""); }, [exploreQuery, setExploreQuery]);

  const styleTags = ["All", ...styles.map((s: Style) => s.name)];

  const designs = useApiData(
    () => api.listDesigns({
      q: debouncedQ,
      style: activeStyle === "All" ? "" : activeStyle,
      maxBudget: budgetMax,
      sort: sortBy,
    }),
    [debouncedQ, activeStyle, budgetMax, sortBy]
  );

  const architects = useApiData(
    () => api.listArchitects({ q: debouncedQ, style: activeStyle === "All" ? "" : activeStyle }),
    [debouncedQ, activeStyle]
  );

  const filtered = designs.data?.designs ?? [];
  const filteredArchitects = architects.data?.architects ?? [];
  const active = viewTab === "designs" ? designs : architects;

  const budgetLabel = budgetMax >= 10000000 ? `₹${(budgetMax / 10000000).toFixed(1)} Cr` :
    `₹${(budgetMax / 100000).toFixed(0)} Lakh`;

  return (
    <PageWrap>
      <div className="pt-16 min-h-screen">
        {/* Header */}
        <div className="border-b border-white/8 px-6 py-6" style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(20px)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white">
                  {viewTab === "designs" ? "Explore Designs" : "Browse Architects"}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {active.loading
                    ? "Searching…"
                    : viewTab === "designs" ? `${filtered.length} designs found` : `${filteredArchitects.length} architects found`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* View toggle */}
                <div className="flex rounded-xl overflow-hidden border border-white/10">
                  <button onClick={() => setViewTab("designs")}
                    className={cn("px-4 py-2 text-sm transition-colors", viewTab === "designs" ? "bg-sky-400 text-[#0F172A] font-medium" : "text-slate-400 hover:text-white")}>
                    Designs
                  </button>
                  <button onClick={() => setViewTab("architects")}
                    className={cn("px-4 py-2 text-sm transition-colors", viewTab === "architects" ? "bg-sky-400 text-[#0F172A] font-medium" : "text-slate-400 hover:text-white")}>
                    Architects
                  </button>
                </div>
                <button onClick={() => setShowFilters(v => !v)}
                  className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all", showFilters ? "border-sky-400/50 text-sky-400 bg-sky-400/10" : "border-white/10 text-slate-400 hover:text-white")}>
                  <SlidersHorizontal size={14} />
                  Filters
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 mb-4">
              <Search size={16} className="text-slate-500" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder={viewTab === "designs" ? "Search by style, location..." : "Search architects..."}
                className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none" />
              {searchQ && <button onClick={() => setSearchQ("")}><X size={14} className="text-slate-500" /></button>}
            </div>

            {/* Style filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {styleTags.map((s: string) => (
                <button key={s} onClick={() => setActiveStyle(s)}
                  className={cn("px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border flex-shrink-0",
                    activeStyle === s ? "bg-sky-400 text-[#0F172A] border-sky-400" : "border-white/10 text-slate-400 hover:text-white hover:border-white/25")}>
                  {s}
                </button>
              ))}
            </div>

            {/* Filter panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-xs font-medium block mb-2">Max Budget: {budgetLabel}</label>
                      <input type="range" min={3500000} max={15000000} step={500000}
                        value={budgetMax} onChange={e => setBudgetMax(Number(e.target.value))}
                        className="w-full accent-sky-400" />
                      <div className="flex justify-between text-xs text-slate-600 mt-1">
                        <span>₹35 Lakh</span><span>₹1.5 Crore</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs font-medium block mb-2">Sort by</label>
                      <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white outline-none">
                        <option value="rating">Highest Rated</option>
                        <option value="budget-low">Budget: Low to High</option>
                        <option value="budget-high">Budget: High to Low</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {active.loading ? (
            <LoadingBlock label={viewTab === "designs" ? "Loading designs…" : "Loading architects…"} />
          ) : active.error ? (
            <ErrorBlock message={active.error} onRetry={active.reload} />
          ) : viewTab === "designs" ? (
            filtered.length > 0 ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                {filtered.map(d => (
                  <div key={d.id} className="break-inside-avoid mb-6">
                    <DesignCard design={d} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">
                <Building2 size={40} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">No designs match your filters</p>
                <button onClick={() => { setActiveStyle("All"); setBudgetMax(15000000); setSearchQ(""); }}
                  className="mt-4 text-sky-400 text-sm hover:underline">Clear filters</button>
              </div>
            )
          ) : filteredArchitects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArchitects.map(a => <ArchitectCard key={a.id} architect={a} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <Users size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No architects match your filters</p>
              <button onClick={() => { setActiveStyle("All"); setSearchQ(""); }}
                className="mt-4 text-sky-400 text-sm hover:underline">Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// DESIGN DETAILS PAGE
// ─────────────────────────────────────────────

function DesignDetails({ designId }: { designId: number | null }) {
  const { navigate, favorites, toggleFavorite, showToast } = useApp();
  const [activeImg, setActiveImg] = useState(0);

  const { data, loading, error, reload } = useApiData(() => api.getDesign(designId as number), [designId]);

  useEffect(() => { setActiveImg(0); }, [designId]);

  if (loading) {
    return <PageWrap><div className="pt-24 min-h-screen"><LoadingBlock label="Loading design…" className="py-40" /></div></PageWrap>;
  }
  if (error || !data) {
    return (
      <PageWrap>
        <div className="pt-24 min-h-screen">
          <ErrorBlock message={error || "Design not found"} onRetry={reload} className="py-40" />
        </div>
      </PageWrap>
    );
  }

  const { design, architect, similar } = data;
  const isFav = favorites.includes(design.id);

  return (
    <PageWrap>
      <div className="pt-16 min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-sm text-slate-500">
          <button onClick={() => navigate("home")} className="hover:text-sky-400 transition-colors">Home</button>
          <ChevronRight size={14} />
          <button onClick={() => navigate("explore")} className="hover:text-sky-400 transition-colors">Explore</button>
          <ChevronRight size={14} />
          <span className="text-white">{design.title}</span>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Gallery */}
            <div className="lg:col-span-2">
              <div className="relative rounded-3xl overflow-hidden mb-4 bg-slate-800" style={{ aspectRatio: "16/10" }}>
                <motion.img key={activeImg} src={design.gallery[activeImg]} alt={design.title}
                  initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover" />
                <button
                  onClick={() => { toggleFavorite(design.id); showToast(isFav ? "Removed from saved" : "Saved to favorites!", isFav ? "info" : "success"); }}
                  className={cn("absolute top-4 right-4 w-11 h-11 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all",
                    isFav ? "bg-red-500/20 border-red-500/40" : "bg-black/30 border-white/20")}>
                  <Heart size={18} className={isFav ? "fill-red-400 text-red-400" : "text-white"} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1.5 text-xs rounded-full backdrop-blur-md bg-sky-400/15 border border-sky-400/30 text-sky-300">
                    {design.style}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3">
                {design.gallery.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={cn("w-20 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0",
                      activeImg === i ? "border-sky-400" : "border-white/10 opacity-50 hover:opacity-80")}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white mb-4">About This Project</h2>
                <p className="text-slate-400 leading-relaxed">{design.description}</p>
              </div>

              {/* Specs */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Bedrooms", value: design.bedrooms },
                  { label: "Bathrooms", value: design.bathrooms },
                  { label: "Built Area", value: design.area },
                  { label: "Timeline", value: design.timeline },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 rounded-2xl bg-[#1E293B] border border-white/8 text-center">
                    <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl font-bold text-white mb-1">{value}</div>
                    <div className="text-slate-500 text-xs">{label}</div>
                  </div>
                ))}
              </div>

              {/* Materials */}
              <div className="mt-8">
                <h3 className="text-white font-semibold mb-4">Materials Used</h3>
                <div className="flex flex-wrap gap-2">
                  {design.materials.map(m => (
                    <span key={m} className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-slate-300">{m}</span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-4">Style Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {design.tags.map(t => (
                    <span key={t} className="px-3 py-1.5 text-xs rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-300">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Info panel */}
            <div className="space-y-5">
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white mb-2">{design.title}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Star size={14} className="fill-amber-400" />
                    <span className="font-semibold">{design.rating}</span>
                    <span className="text-slate-500 text-sm">({design.reviews} reviews)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                  <MapPin size={14} /><span>{design.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                  <Clock size={14} /><span>Timeline: {design.timeline}</span>
                </div>
              </div>

              {/* Budget */}
              <div className="p-5 rounded-2xl bg-sky-400/8 border border-sky-400/20">
                <p className="text-slate-400 text-xs mb-1">Estimated Budget</p>
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-sky-400">{design.budget}</p>
              </div>

              {/* Actions */}
              {architect && (
                <button onClick={() => navigate("architect", architect.id)}
                  className="w-full py-3.5 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold rounded-2xl transition-all text-sm flex items-center justify-center gap-2">
                  <Users size={16} />
                  View Architect Profile
                </button>
              )}
              <button
                onClick={() => { toggleFavorite(design.id); showToast(isFav ? "Removed" : "Saved!", isFav ? "info" : "success"); }}
                className={cn("w-full py-3.5 rounded-2xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                  isFav ? "border-red-500/40 text-red-400 bg-red-500/8" : "border-white/12 text-white hover:border-sky-400/40 hover:text-sky-400")}>
                <Heart size={16} className={isFav ? "fill-red-400" : ""} />
                {isFav ? "Remove from Saved" : "Save Design"}
              </button>
              <button className="w-full py-3.5 rounded-2xl border border-white/10 text-slate-400 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:border-white/25">
                <Share2 size={16} />
                Share
              </button>

              {/* Architect preview */}
              {architect && (
              <div className="p-5 rounded-2xl bg-[#1E293B] border border-white/8">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-4">Designed by</p>
                <div className="flex items-center gap-4 mb-4">
                  <img src={architect.image} alt={architect.name} className="w-14 h-14 rounded-2xl object-cover object-top" />
                  <div>
                    <p className="text-white font-semibold">{architect.name}</p>
                    <p className="text-slate-500 text-xs">{architect.firm}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-amber-400 text-xs font-medium">{architect.rating}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => navigate("architect", architect.id)}
                  className="w-full py-2.5 border border-sky-400/30 text-sky-400 hover:bg-sky-400/10 text-sm rounded-xl transition-all">
                  View Full Profile
                </button>
              </div>
              )}
            </div>
          </div>

          {/* Similar designs */}
          {similar.length > 0 && (
            <div className="mt-16">
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white mb-6">Similar Designs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similar.map(d => <DesignCard key={d.id} design={d} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// ARCHITECT PROFILE PAGE
// ─────────────────────────────────────────────

function ArchitectProfile({ architectId }: { architectId: number | null }) {
  const { navigate, showToast } = useApp();
  const { data, loading, error, reload } = useApiData(() => api.getArchitect(architectId as number), [architectId]);

  if (loading) {
    return <PageWrap><div className="pt-24 min-h-screen"><LoadingBlock label="Loading profile…" className="py-40" /></div></PageWrap>;
  }
  if (error || !data) {
    return (
      <PageWrap>
        <div className="pt-24 min-h-screen">
          <ErrorBlock message={error || "Architect not found"} onRetry={reload} className="py-40" />
        </div>
      </PageWrap>
    );
  }

  const { architect, portfolio } = data;

  return (
    <PageWrap>
      <div className="pt-16 min-h-screen">
        {/* Hero */}
        <div className="relative h-64 overflow-hidden">
          <img src={portfolio[0]?.image || "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=400&fit=crop&auto=format"}
            alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/50 to-[#0F172A]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-20 relative">
          {/* Profile header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-10">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#0F172A] shadow-2xl flex-shrink-0">
              <img src={architect.image} alt={architect.name} className="w-full h-full object-cover object-top" />
            </div>
            <div className="flex-1">
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white">{architect.name}</h1>
              <p className="text-slate-400 mt-1">{architect.title} · {architect.firm}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1.5 text-slate-400"><MapPin size={13} />{architect.location}</span>
                <span className="flex items-center gap-1.5 text-amber-400"><Star size={13} className="fill-amber-400" />{architect.rating} ({architect.reviews} reviews)</span>
                <span className="text-slate-400">{architect.experience} years experience</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {architect.specialties.map(s => (
                  <span key={s} className="px-3 py-1 text-xs rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-300">{s}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <a href={`mailto:${architect.email}`}
                className="px-5 py-3 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold text-sm rounded-2xl transition-all flex items-center gap-2">
                <Mail size={15} /> Contact
              </a>
              <button onClick={() => showToast("Profile shared!", "success")}
                className="p-3 border border-white/12 text-slate-400 hover:text-white rounded-2xl transition-all hover:bg-white/5">
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: "Projects", value: architect.projects },
              { label: "Reviews", value: architect.reviews },
              { label: "Years Active", value: architect.experience },
            ].map(({ label, value }) => (
              <div key={label} className="p-5 rounded-2xl bg-[#1E293B] border border-white/8 text-center">
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white mb-1">{value}</div>
                <div className="text-slate-500 text-xs">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2">
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white mb-4">About</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{architect.bio}</p>

              {/* Awards */}
              <h3 className="text-white font-semibold mb-4">Awards & Recognition</h3>
              <div className="space-y-3 mb-8">
                {architect.awards.map((award, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-[#1E293B]/60 border border-white/6">
                    <div className="w-8 h-8 bg-amber-400/15 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award size={14} className="text-amber-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{award}</span>
                  </div>
                ))}
              </div>

              {/* Portfolio */}
              <h3 className="text-white font-semibold mb-4">Portfolio</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {portfolio.map(d => <DesignCard key={d.id} design={d} />)}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="p-6 rounded-2xl bg-[#1E293B] border border-white/8">
                <h3 className="text-white font-semibold mb-5">Contact</h3>
                <div className="space-y-4">
                  <a href={`tel:${architect.phone}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                    <div className="w-9 h-9 bg-sky-400/10 rounded-xl flex items-center justify-center"><Phone size={14} className="text-sky-400" /></div>
                    {architect.phone}
                  </a>
                  <a href={`mailto:${architect.email}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                    <div className="w-9 h-9 bg-sky-400/10 rounded-xl flex items-center justify-center"><Mail size={14} className="text-sky-400" /></div>
                    {architect.email}
                  </a>
                  <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                    <div className="w-9 h-9 bg-sky-400/10 rounded-xl flex items-center justify-center"><Globe size={14} className="text-sky-400" /></div>
                    {architect.website}
                  </a>
                  <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                    <div className="w-9 h-9 bg-pink-500/10 rounded-xl flex items-center justify-center"><Instagram size={14} className="text-pink-400" /></div>
                    {architect.instagram}
                  </a>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-sky-400/8 border border-sky-400/20">
                <p className="text-slate-400 text-xs mb-1">Starting From</p>
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-sky-400 mb-4">{architect.startingBudget}</p>
                <a href={`mailto:${architect.email}`}
                  className="w-full block py-3 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold text-sm rounded-xl transition-all text-center">
                  Request a Consultation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// AI RECOMMENDATIONS PAGE
// ─────────────────────────────────────────────

function AIPage() {
  const { navigate } = useApp();
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm ArchVision AI. Describe your dream home — style, budget, location, bedrooms — and I'll find your perfect match.", results: null as any }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scroll = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scroll, [messages, loading]);

  const handleSend = useCallback(async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: t, results: null }]);
    setLoading(true);
    try {
      const { reply, results } = await api.aiMatch(t);
      setMessages(prev => [...prev, { role: "ai", text: reply, results: results.length ? results : null }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "ai",
        text: err instanceof Error ? err.message : "The matcher is unavailable right now. Please try again.",
        results: null,
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return (
    <PageWrap>
      <div className="pt-16 min-h-screen flex flex-col max-w-4xl mx-auto px-4 pb-6">
        {/* Header */}
        <div className="py-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-sky-400/20 to-violet-500/20 border border-sky-400/30 rounded-2xl flex items-center justify-center">
            <Bot size={24} className="text-sky-400" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white mb-2">AI Design Matcher</h1>
          <p className="text-slate-500">Describe your dream home in plain English</p>
        </div>

        {/* Chat */}
        <div className="flex-1 space-y-5 overflow-y-auto pb-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%]", msg.role === "user" ? "" : "w-full")}>
                {msg.role === "ai" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-sky-400/15 border border-sky-400/30 rounded-xl flex items-center justify-center">
                      <Bot size={13} className="text-sky-400" />
                    </div>
                    <span className="text-sky-400 text-xs font-medium">ArchVision AI</span>
                  </div>
                )}
                <div className={cn("px-5 py-3.5 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-sky-400 text-[#0F172A] font-medium rounded-br-sm"
                    : "bg-[#1E293B] border border-white/8 text-slate-300 rounded-bl-sm")}>
                  {msg.text}
                </div>
                {msg.results && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {msg.results.map((d: any) => <DesignCard key={d.id} design={d} />)}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-center gap-2 px-5 py-3.5 bg-[#1E293B] border border-white/8 rounded-2xl rounded-bl-sm">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1, delay }}
                    className="w-2 h-2 bg-sky-400 rounded-full" />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="py-3">
          <p className="text-slate-600 text-xs mb-2">Try these:</p>
          <div className="flex flex-wrap gap-2">
            {AI_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => handleSend(p)}
                className="px-3 py-1.5 text-xs rounded-full border border-white/10 text-slate-400 hover:text-sky-400 hover:border-sky-400/40 transition-all">
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-3 pt-3 border-t border-white/8">
          <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#1E293B] border border-white/10 focus-within:border-sky-400/40 transition-colors">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend(input)}
              placeholder="I want a 3BHK minimalist villa under ₹70 lakh..."
              className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none" />
          </div>
          <button onClick={() => handleSend(input)} disabled={!input.trim() || loading}
            className="w-12 h-12 bg-sky-400 hover:bg-sky-300 disabled:opacity-40 text-[#0F172A] rounded-2xl flex items-center justify-center transition-all flex-shrink-0">
            <Send size={17} />
          </button>
        </div>
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// FAVORITES PAGE
// ─────────────────────────────────────────────

function FavoritesPage() {
  const { navigate, favorites, toggleFavorite, showToast, user, openAuth } = useApp();
  const { data, loading, error, reload } = useApiData(() => api.listDesigns(), []);
  const savedDesigns = (data?.designs ?? []).filter((d: Design) => favorites.includes(d.id));

  return (
    <PageWrap>
      <div className="pt-24 min-h-screen max-w-7xl mx-auto px-6 pb-16">
        <div className="mb-10">
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white mb-2">Saved Designs</h1>
          <p className="text-slate-500">
            {savedDesigns.length} {savedDesigns.length === 1 ? "design" : "designs"} saved
            {!user && savedDesigns.length > 0 && (
              <>
                {" · "}
                <button onClick={openAuth} className="text-sky-400 hover:text-sky-300 transition-colors">
                  Sign in to keep them
                </button>
              </>
            )}
          </p>
        </div>

        {loading ? (
          <LoadingBlock label="Loading saved designs…" />
        ) : error ? (
          <ErrorBlock message={error} onRetry={reload} />
        ) : savedDesigns.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-20 h-20 bg-[#1E293B] border border-white/8 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Heart size={32} className="text-slate-600" />
            </div>
            <h2 className="text-white text-xl font-semibold mb-3">No saved designs yet</h2>
            <p className="text-slate-500 mb-8">Browse designs and tap the heart icon to save your favourites.</p>
            <button onClick={() => navigate("explore")}
              className="px-8 py-3.5 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold text-sm rounded-2xl transition-all">
              Explore Designs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedDesigns.map(d => (
              <motion.div key={d.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="relative">
                  <DesignCard design={d} />
                  <button
                    onClick={() => { toggleFavorite(d.id); showToast("Removed from saved", "info"); }}
                    className="absolute top-12 right-3 w-8 h-8 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center hover:bg-red-500/40 transition-all z-10">
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// COMPARE PAGE
// ─────────────────────────────────────────────

function ComparePage() {
  const { navigate } = useApp();
  const [archA, setArchA] = useState<number | "">("");
  const [archB, setArchB] = useState<number | "">("");
  const { data, loading, error, reload } = useApiData(() => api.listArchitects(), []);

  const architects = data?.architects ?? [];
  const a = architects.find(arch => arch.id === Number(archA));
  const b = architects.find(arch => arch.id === Number(archB));

  const metrics = [
    { label: "Experience", aVal: a?.experience + " years", bVal: b?.experience + " years", aNum: a?.experience ?? null, bNum: b?.experience ?? null },
    { label: "Rating", aVal: a?.rating, bVal: b?.rating, aNum: a?.rating ?? null, bNum: b?.rating ?? null },
    { label: "Projects Completed", aVal: a?.projects, bVal: b?.projects, aNum: a?.projects ?? null, bNum: b?.projects ?? null },
    { label: "Client Reviews", aVal: a?.reviews, bVal: b?.reviews, aNum: a?.reviews ?? null, bNum: b?.reviews ?? null },
    { label: "Starting Budget", aVal: a?.startingBudget, bVal: b?.startingBudget, aNum: null, bNum: null },
    { label: "Location", aVal: a?.location, bVal: b?.location, aNum: null, bNum: null },
  ];

  return (
    <PageWrap>
      <div className="pt-24 min-h-screen max-w-6xl mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white mb-3">Compare Architects</h1>
          <p className="text-slate-500">Select two architects to compare side by side</p>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {([["Architect A", archA, setArchA], ["Architect B", archB, setArchB]] as any[]).map(([label, val, setter]) => (
            <div key={label} className="p-6 rounded-2xl bg-[#1E293B] border border-white/8">
              <label className="text-slate-400 text-sm font-medium block mb-3">{label}</label>
              <select value={val} onChange={e => setter(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-sky-400/40 transition-colors">
                <option value="">{loading ? "Loading architects…" : "Select an architect…"}</option>
                {architects.map(arch => (
                  <option key={arch.id} value={arch.id}>{arch.name} — {arch.firm}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {error ? (
          <ErrorBlock message={error} onRetry={reload} />
        ) : a && b ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Profile headers */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {[a, b].map(arch => (
                <div key={arch.id} className="p-6 rounded-2xl bg-[#1E293B] border border-white/8 text-center">
                  <img src={arch.image} alt={arch.name}
                    className="w-20 h-20 rounded-2xl object-cover object-top mx-auto mb-4 border-2 border-sky-400/30" />
                  <h3 className="text-white font-semibold mb-1">{arch.name}</h3>
                  <p className="text-slate-500 text-sm mb-3">{arch.firm}</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {arch.specialties.map(s => (
                      <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-300">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div className="rounded-2xl bg-[#1E293B] border border-white/8 overflow-hidden">
              {metrics.map((m, i) => (
                <div key={m.label} className={cn("grid grid-cols-3 gap-4 p-5", i > 0 && "border-t border-white/6")}>
                  <div className="text-center text-slate-200 text-sm font-medium">
                    {m.aNum !== null && m.bNum !== null && m.aNum > m.bNum ? (
                      <span className="text-sky-400 font-semibold">{m.aVal}</span>
                    ) : <span>{m.aVal}</span>}
                  </div>
                  <div className="text-center text-slate-500 text-xs font-medium uppercase tracking-wider flex items-center justify-center">
                    {m.label}
                  </div>
                  <div className="text-center text-slate-200 text-sm font-medium">
                    {m.aNum !== null && m.bNum !== null && m.bNum > m.aNum ? (
                      <span className="text-sky-400 font-semibold">{m.bVal}</span>
                    ) : <span>{m.bVal}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              {[a, b].map(arch => (
                <button key={arch.id} onClick={() => navigate("architect", arch.id)}
                  className="py-3.5 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold text-sm rounded-2xl transition-all">
                  View {arch.name.split(" ")[0]}'s Profile
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-16 text-slate-600">
            <GitCompare size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">Select two architects above to begin comparing</p>
          </div>
        )}
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// ABOUT PAGE
// ─────────────────────────────────────────────

function AboutPage() {
  const { navigate } = useApp();
  const { data } = useApiData(() => api.listArchitects(), []);
  const values = [
    { title: "Design-Led Discovery", desc: "We believe you should fall in love with a building before you meet its creator. Design leads; architects follow.", icon: Eye },
    { title: "Radical Transparency", desc: "Budgets, timelines, reviews — all real, all verified. No surprises, no commission-driven recommendations.", icon: Check },
    { title: "Architect Dignity", desc: "Our platform celebrates craft. Architects on ArchVision are presented as the artists they are, not as service listings.", icon: Award },
  ];

  return (
    <PageWrap>
      <div className="pt-16 min-h-screen">
        {/* Hero */}
        <div className="relative h-80 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=600&fit=crop&auto=format"
            alt="Architecture" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(15,23,42,0.5), rgba(15,23,42,1))" }} />
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-4xl md:text-5xl font-bold text-white mb-4">
                Architecture Deserves<br />Better Discovery
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                We built ArchVision AI because finding your architect should feel as remarkable as the buildings they create.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-20">
          {/* Mission */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-sky-400 text-sm font-medium uppercase tracking-widest">Our Mission</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white mt-3 mb-6 leading-tight">
                Connecting Vision to Craft,<br />One Project at a Time
              </h2>
              <p className="text-slate-400 leading-relaxed mb-5">
                ArchVision AI was founded by architects, clients, and technologists who were tired of the same frustrating experience: searching for architects by reputation rather than by resonance.
              </p>
              <p className="text-slate-400 leading-relaxed">
                We believe the built environment shapes how we live, work, and feel. Finding the right architect for a project shouldn't require industry connections or lucky referrals — it should start with a building that moves you.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="grid grid-cols-2 gap-4">
              {[
                { label: "Founded", value: "2022" },
                { label: "Team Size", value: "47" },
                { label: "Cities Active", value: "47" },
                { label: "Projects Completed", value: "3,200+" },
              ].map(({ label, value }) => (
                <div key={label} className="p-6 rounded-2xl bg-[#1E293B] border border-white/8">
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-sky-400 mb-2">{value}</div>
                  <div className="text-slate-500 text-sm">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white">What We Stand For</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map(({ title, desc, icon: Icon }, i) => (
                <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-[#1E293B] border border-white/8">
                  <div className="w-12 h-12 bg-sky-400/10 border border-sky-400/20 rounded-2xl flex items-center justify-center mb-5">
                    <Icon size={20} className="text-sky-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-3">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <div className="text-center mb-12">
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white">Meet the Team</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(data?.architects ?? []).slice(0, 4).map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="text-center">
                  <img src={a.image} alt={a.name} className="w-20 h-20 rounded-2xl object-cover object-top mx-auto mb-3" />
                  <p className="text-white font-medium text-sm">{a.name}</p>
                  <p className="text-slate-500 text-xs">{a.title}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <button onClick={() => navigate("contact")}
              className="px-10 py-4 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold rounded-2xl transition-all text-sm shadow-xl shadow-sky-400/25">
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// CONTACT PAGE
// ─────────────────────────────────────────────

function ContactPage() {
  const { showToast } = useApp();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await api.createInquiry(form);
      showToast("Message sent! We'll be in touch within 24 hours.", "success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not send your message", "error");
    } finally {
      setSending(false);
    }
  };

  const info = [
    { icon: Mail, label: "Email", value: "primistry2004@gmail.com" },
    { icon: Phone, label: "Phone", value: "+91 87705 62234" },
    { icon: MapPin, label: "Office", value: "Bhilai, Chattisgarh, 490006" },
    { icon: Clock, label: "Hours", value: "Mon–Fri, 9am–7pm IST" },
  ];

  return (
    <PageWrap>
      <div className="pt-24 min-h-screen max-w-6xl mx-auto px-6 pb-16">
        <div className="text-center mb-14">
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-4xl font-bold text-white mb-3">Get in Touch</h1>
          <p className="text-slate-500 max-w-lg mx-auto">Whether you're a client, architect, or press — we'd love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-[#1E293B] border border-white/8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-2">Your Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required placeholder="Rohan Malhotra"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 outline-none focus:border-sky-400/50 transition-colors" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-2">Email</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required type="email" placeholder="rohan@example.com"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 outline-none focus:border-sky-400/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-2">Subject</label>
                <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  required className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-sky-400/50 transition-colors">
                  <option value="">Select a topic…</option>
                  <option>I'm looking for an architect</option>
                  <option>I'm an architect and want to list</option>
                  <option>Press enquiry</option>
                  <option>Partnership opportunity</option>
                  <option>Technical support</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-2">Message</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  required rows={5} placeholder="Tell us how we can help..."
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 outline-none focus:border-sky-400/50 transition-colors resize-none" />
              </div>
              <button type="submit" disabled={sending}
                className="w-full py-4 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 text-[#0F172A] font-semibold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-400/20">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sending ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-5">
            {info.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 p-5 rounded-2xl bg-[#1E293B] border border-white/8">
                <div className="w-10 h-10 bg-sky-400/10 border border-sky-400/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={16} className="text-sky-400" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
                  <p className="text-white text-sm">{value}</p>
                </div>
              </div>
            ))}

            <div className="p-5 rounded-2xl bg-sky-400/8 border border-sky-400/20">
              <h3 className="text-white font-semibold mb-2">Are you an architect?</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Join 340+ architects on ArchVision AI and connect with clients who are already inspired by your style of work.
              </p>
              <button className="px-5 py-2.5 bg-sky-400 hover:bg-sky-300 text-[#0F172A] text-sm font-semibold rounded-xl transition-all">
                Apply to List Your Practice
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              {[
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Instagram, href: "https://www.instagram.com/_brain._.less_/?hl=en", label: "Instagram" },
                { Icon: Linkedin, href: "https://www.linkedin.com/in/priyanshu-ranjan-mistry-9983842a1/", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 text-slate-400 hover:text-white hover:border-white/25 rounded-xl text-sm transition-all">
                  <Icon size={15} />
                  <span className="hidden sm:block">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────

const LOCAL_FAVORITES_KEY = "archivis.favorites";

function readLocalFavorites(): number[] {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_FAVORITES_KEY) || "[]");
    return Array.isArray(stored) ? stored.filter((id: unknown) => typeof id === "number") : [];
  } catch {
    return [];
  }
}

function writeLocalFavorites(ids: number[]) {
  try {
    localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable — favourites stay in memory for this session */
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedDesignId, setSelectedDesignId] = useState<number | null>(null);
  const [selectedArchitectId, setSelectedArchitectId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>(readLocalFavorites);
  const [toast, setToast] = useState<{ msg: string; type?: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [exploreQuery, setExploreQuery] = useState("");
  const [styles, setStyles] = useState<Style[]>([]);

  const showToast = useCallback((msg: string, type = "success") => {
    setToast({ msg, type });
  }, []);

  useEffect(() => {
    api.listStyles().then(({ styles }) => setStyles(styles)).catch(() => setStyles([]));
  }, []);

  // Restore a previous session; favourites then come from the account instead of localStorage.
  useEffect(() => {
    if (!getToken()) return;
    api.me()
      .then(({ user }) => {
        setUser(user);
        return api.listFavorites();
      })
      .then(result => result && setFavorites(result.designIds))
      .catch(error => {
        if (error instanceof ApiError && error.status === 401) setToken(null);
      });
  }, []);

  const navigate = useCallback((page: string, id?: number | null) => {
    setCurrentPage(page);
    if (page === "design" && id) setSelectedDesignId(id);
    if (page === "architect" && id) setSelectedArchitectId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    const next = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(next);

    if (!user) {
      writeLocalFavorites(next);
      return;
    }
    const persist = favorites.includes(id) ? api.removeFavorite(id) : api.addFavorite(id);
    persist
      .then(({ designIds }) => setFavorites(designIds))
      .catch(error => {
        setFavorites(favorites);
        showToast(error instanceof Error ? error.message : "Could not update saved designs", "error");
      });
  }, [favorites, user, showToast]);

  // Anonymous favourites are merged into the account on the first sign-in.
  const completeAuth = useCallback(async (token: string, authUser: User) => {
    setToken(token);
    setUser(authUser);
    const local = readLocalFavorites();
    const { designIds } = local.length ? await api.syncFavorites(local) : await api.listFavorites();
    writeLocalFavorites([]);
    setFavorites(designIds);
    setAuthOpen(false);
    showToast(`Signed in as ${authUser.name}`, "success");
  }, [showToast]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user: authUser } = await api.login({ email, password });
    await completeAuth(token, authUser);
  }, [completeAuth]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { token, user: authUser } = await api.register({ name, email, password });
    await completeAuth(token, authUser);
  }, [completeAuth]);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
    setFavorites(readLocalFavorites());
    showToast("Signed out", "info");
  }, [showToast]);

  const ctx = {
    currentPage, navigate, favorites, toggleFavorite, toast, setToast, showToast,
    user, signIn, signUp, signOut,
    authOpen, openAuth: () => setAuthOpen(true), closeAuth: () => setAuthOpen(false),
    exploreQuery, setExploreQuery, styles,
  };

  return (
    <AppCtx.Provider value={ctx}>
      <div className="min-h-screen bg-background text-foreground"
        style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
        <Navbar currentPage={currentPage} />

        <AnimatePresence mode="wait">
          {currentPage === "home" && <Landing key="home" />}
          {currentPage === "explore" && <Explore key="explore" />}
          {currentPage === "design" && <DesignDetails key={`design-${selectedDesignId}`} designId={selectedDesignId} />}
          {currentPage === "architect" && <ArchitectProfile key={`arch-${selectedArchitectId}`} architectId={selectedArchitectId} />}
          {currentPage === "ai" && <AIPage key="ai" />}
          {currentPage === "favorites" && <FavoritesPage key="favorites" />}
          {currentPage === "compare" && <ComparePage key="compare" />}
          {currentPage === "about" && <AboutPage key="about" />}
          {currentPage === "contact" && <ContactPage key="contact" />}
        </AnimatePresence>

        {!["ai"].includes(currentPage) && <Footer />}
        <FAB />
        <AuthModal />
        <ToastNotification />
      </div>
    </AppCtx.Provider>
  );
}
