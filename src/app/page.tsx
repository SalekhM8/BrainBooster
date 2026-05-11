"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ============================================================================
   BRAND PALETTE (used via arbitrary Tailwind values)
   navy:        #0f2557
   navy-mid:    #1a3a7c
   accent:      #4a8fe8
   accent-2:    #3a7bd5
   sky:         #e8f0fd
   mint:        #e0f5ee
   lavender:    #eeebff
   blush:       #fce8f0
   off-white:   #f5f7fc
   text-mid:    #3d4f72
   text-soft:   #7a8aaa
   border:      #dce5f5
============================================================================ */

/* ============================================================================
   CUSTOM SVG ICON SET — geometric, on-brand, replaces emoji
============================================================================ */

function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="url(#lg-grad)" />
      <path
        d="M13 12.5h7.5a4.5 4.5 0 0 1 2.7 8.1A4.5 4.5 0 0 1 21 28.5h-8V12.5Z"
        stroke="white"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="15" r="2" fill="white" />
      <defs>
        <linearGradient id="lg-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4a8fe8" />
          <stop offset="1" stopColor="#1a3a7c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function IconTeacher({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 2.5 7.5 12 12l9.5-4.5L12 3Z" />
      <path d="M6 9.5v4.5c0 2 3 3.5 6 3.5s6-1.5 6-3.5V9.5" />
      <path d="M21.5 8v6" />
    </svg>
  );
}

function IconGroup({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <circle cx="17.5" cy="9.5" r="2.4" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
      <path d="M15 18.5c0-2 1.5-3.5 3.5-3.5S22 16.5 22 18.5" />
    </svg>
  );
}

function IconRecord({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5.5" width="14" height="13" rx="2.5" />
      <path d="m16.5 10 5-3v10l-5-3" />
      <circle cx="8" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

function IconQuiz({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <path d="M8 8h8M8 12h8M8 16h5" />
      <circle cx="18" cy="17" r="3" fill="#4a8fe8" stroke="none" />
      <path d="m16.7 17 .9.9 1.8-1.8" stroke="white" strokeWidth="1.6" />
    </svg>
  );
}

function IconReport({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.5 8.5 0 1 1-3.7-7L21 3v5h-5" />
      <path d="M8 14l2.5-2.5L13 14l3-3" />
    </svg>
  );
}

function IconExam({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
    </svg>
  );
}

function IconArrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function IconCheck({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}

function IconShield({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5 4 5.5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10v-6L12 2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconCalendar({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M8 3v4M16 3v4" />
    </svg>
  );
}

function IconBookOpen({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4.5h6a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H3v-12Z" />
      <path d="M21 4.5h-6a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h6v-12Z" />
    </svg>
  );
}

function IconPlus({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/* Official WhatsApp brand glyph — single filled path, exact shape */
function IconWhatsApp({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
  );
}

const WHATSAPP_NUMBER_E164 = "447756980100";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(
  "Hi BrainBooster, I'd like to know more about your tuition."
)}`;

/* ============================================================================
   DECORATIVE BACKGROUND — gradient mesh used in hero & CTA
============================================================================ */

function HeroMesh() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-90"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="m1" cx="20%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#4a8fe8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#4a8fe8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="m2" cx="85%" cy="20%" r="40%">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="m3" cx="70%" cy="90%" r="55%">
          <stop offset="0%" stopColor="#7c5fff" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#7c5fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="m4" cx="10%" cy="100%" r="40%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" fill="none" stroke="white" strokeOpacity="0.04" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="#0f2557" />
      <rect width="1200" height="800" fill="url(#grid)" />
      <rect width="1200" height="800" fill="url(#m1)" />
      <rect width="1200" height="800" fill="url(#m2)" />
      <rect width="1200" height="800" fill="url(#m3)" />
      <rect width="1200" height="800" fill="url(#m4)" />
    </svg>
  );
}

function FaintGrid() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id="grid-light" width="56" height="56" patternUnits="userSpaceOnUse">
          <path d="M56 0H0V56" fill="none" stroke="#0f2557" strokeOpacity="0.05" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-light)" />
    </svg>
  );
}

/* ============================================================================
   TRIAL BOOKING MODAL
============================================================================ */

function TrialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    childFirstName: "",
    childYearGroup: "GCSE",
    subject: "MATHS",
    preferredTime: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "LANDING" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#0a1c44]/60 p-0 backdrop-blur-md sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-t-3xl border border-[#dce5f5] bg-white shadow-[0_30px_80px_-20px_rgba(15,37,87,0.45)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-[#3d4f72] transition-colors hover:bg-[#f5f7fc]"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M6 18 18 6" strokeLinecap="round" />
          </svg>
        </button>

        {success ? (
          <div className="px-7 py-10 text-center sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d6f5ec]">
              <IconCheck className="h-7 w-7 text-[#1a7a50]" />
            </div>
            <h3 className="mt-5 text-[22px] font-bold tracking-tight text-[#0f2557]">
              We've got it — thank you!
            </h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[#3d4f72]">
              A member of the BrainBooster team will be in touch within one working day to confirm a
              session time. Keep an eye on your inbox (and check spam, just in case).
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#1faa55]"
              >
                <IconWhatsApp className="h-4 w-4" />
                WhatsApp us now
              </a>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg border border-[#dce5f5] bg-white px-5 py-2.5 text-[13.5px] font-medium text-[#0f2557] hover:bg-[#f5f7fc]"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-[#e8f0fd] via-white to-[#eeebff] px-7 pb-5 pt-7 sm:px-10 sm:pt-9">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3a7bd5]">
                Free trial session
              </div>
              <h3 className="mt-2 text-[22px] font-bold leading-tight tracking-tight text-[#0f2557] sm:text-[26px]">
                Book your child's free trial
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#3d4f72]">
                Tell us a little about your child. We'll come back to you within one working day with a
                suggested session time — no payment needed.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-7 py-6 sm:px-10 sm:py-7">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-600">
                  {error}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-medium text-[#0f2557]">Your name *</label>
                  <input
                    required
                    value={form.parentName}
                    onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-[#dce5f5] bg-white px-3 py-2.5 text-sm text-[#0d1b3e] focus:border-[#4a8fe8] focus:outline-none focus:ring-2 focus:ring-[#4a8fe8]/20"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#0f2557]">Phone (optional)</label>
                  <input
                    type="tel"
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-[#dce5f5] bg-white px-3 py-2.5 text-sm text-[#0d1b3e] focus:border-[#4a8fe8] focus:outline-none focus:ring-2 focus:ring-[#4a8fe8]/20"
                    placeholder="07XXX XXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#0f2557]">Email *</label>
                <input
                  required
                  type="email"
                  value={form.parentEmail}
                  onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-[#dce5f5] bg-white px-3 py-2.5 text-sm text-[#0d1b3e] focus:border-[#4a8fe8] focus:outline-none focus:ring-2 focus:ring-[#4a8fe8]/20"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label className="block text-[12px] font-medium text-[#0f2557]">Child's first name *</label>
                  <input
                    required
                    value={form.childFirstName}
                    onChange={(e) => setForm({ ...form, childFirstName: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-[#dce5f5] bg-white px-3 py-2.5 text-sm text-[#0d1b3e] focus:border-[#4a8fe8] focus:outline-none focus:ring-2 focus:ring-[#4a8fe8]/20"
                    placeholder="Ahmed"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#0f2557]">Year group *</label>
                  <select
                    required
                    value={form.childYearGroup}
                    onChange={(e) => setForm({ ...form, childYearGroup: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-[#dce5f5] bg-white px-3 py-2.5 text-sm text-[#0d1b3e] focus:border-[#4a8fe8] focus:outline-none focus:ring-2 focus:ring-[#4a8fe8]/20"
                  >
                    <option value="KS3">KS3</option>
                    <option value="KS4">KS4</option>
                    <option value="GCSE">GCSE</option>
                    <option value="A_LEVEL">A-Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#0f2557]">Subject *</label>
                  <select
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-[#dce5f5] bg-white px-3 py-2.5 text-sm text-[#0d1b3e] focus:border-[#4a8fe8] focus:outline-none focus:ring-2 focus:ring-[#4a8fe8]/20"
                  >
                    <option value="MATHS">Maths</option>
                    <option value="ENGLISH">English</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#0f2557]">
                  Preferred time (optional)
                </label>
                <input
                  value={form.preferredTime}
                  onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-[#dce5f5] bg-white px-3 py-2.5 text-sm text-[#0d1b3e] focus:border-[#4a8fe8] focus:outline-none focus:ring-2 focus:ring-[#4a8fe8]/20"
                  placeholder="e.g. weekday evenings, Saturday mornings"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#0f2557]">Anything else (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-[#dce5f5] bg-white px-3 py-2.5 text-sm text-[#0d1b3e] focus:border-[#4a8fe8] focus:outline-none focus:ring-2 focus:ring-[#4a8fe8]/20"
                  placeholder="Exam board, target grade, areas to focus on…"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f2557] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_30px_-12px_rgba(15,37,87,0.6)] transition-all hover:bg-[#1a3a7c] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Submitting…" : "Request my child's trial"}
                {!submitting && <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              </button>

              <p className="text-center text-[11.5px] leading-relaxed text-[#7a8aaa]">
                No payment. No auto-enrolment. We just call or message to confirm.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   FEATURE DATA
============================================================================ */

const worries = [
  {
    title: "“They understand it in class but forget it the next day.”",
    body:
      "Our weekly quiz and recorded lessons mean nothing slips through the cracks. What was taught on Monday can be rewatched on Sunday night.",
  },
  {
    title: "“We've tried tutors before and it hasn't worked.”",
    body:
      "Our teachers are different — they're trained to teach, not just to know the subject. They know exam technique, mark schemes and how to fix the gaps that tutors miss.",
  },
  {
    title: "“My child won't ask for help in class.”",
    body:
      "Our small group setting changes that. Students who won't raise their hand in school feel comfortable asking questions when the group is focused and the teacher knows their name.",
  },
  {
    title: "“I don't know how well they're actually doing.”",
    body:
      "Every Monday morning you get a clear WhatsApp update — what was covered, quiz score, and anything to watch. No chasing, no guessing.",
  },
];

const features = [
  {
    icon: IconTeacher,
    tint: "bg-[#e8f0fd] text-[#1a3a7c]",
    title: "Qualified teachers",
    body:
      "Every session is led by a trained secondary school teacher — not a graduate or an app. They know exam boards inside out.",
  },
  {
    icon: IconGroup,
    tint: "bg-[#e0f5ee] text-[#0a5c3a]",
    title: "Small, focused groups",
    body:
      "Your child is never lost in a crowd. Every student gets attention and their questions answered, every session.",
  },
  {
    icon: IconRecord,
    tint: "bg-[#eeebff] text-[#3c3489]",
    title: "Sessions recorded",
    body:
      "Every lesson goes on the student dashboard to rewatch. Missed a session? No stress.",
  },
  {
    icon: IconQuiz,
    tint: "bg-[#fce8f0] text-[#8a1f4a]",
    title: "Weekly diagnostic quiz",
    body:
      "10 auto-marked questions every week. We catch gaps early — before they cost marks in the exam.",
  },
  {
    icon: IconReport,
    tint: "bg-[#e8f0fd] text-[#1a3a7c]",
    title: "Monday parent report",
    body:
      "A WhatsApp message every Monday morning. Progress, quiz scores, and what's coming up. Simple and clear.",
  },
  {
    icon: IconExam,
    tint: "bg-[#e0f5ee] text-[#0a5c3a]",
    title: "Exam board aligned",
    body:
      "Edexcel, AQA and OCR. We know the mark schemes and what earns marks — because we've marked them ourselves.",
  },
];

const trustItems = [
  "Live sessions twice a week",
  "All sessions recorded",
  "Weekly WhatsApp progress report",
  "Edexcel, AQA & OCR",
  "Cancel anytime",
];

const steps = [
  {
    n: "01",
    title: "Book a free trial",
    body: "Choose a session that fits your child's year group and subject. No card, no commitment.",
  },
  {
    n: "02",
    title: "Meet your teacher",
    body: "A qualified secondary school teacher leads a live group on Zoom. Cameras on, questions encouraged.",
  },
  {
    n: "03",
    title: "Twice-weekly live lessons",
    body: "Two live sessions per week. Miss one? Every lesson is recorded and on the dashboard within 24 hours.",
  },
  {
    n: "04",
    title: "Weekly diagnostic quiz",
    body: "10 auto-marked questions covering the week's content. Gaps are flagged before they become a problem.",
  },
  {
    n: "05",
    title: "Monday parent report",
    body: "Every Monday 8am you get a WhatsApp with attendance, quiz score and a teacher note. That's it.",
  },
];

const yearGroups = ["KS3 · Years 7-9", "KS4 / GCSE · Years 10-11", "A-Level · Years 12-13"];

const subjects = [
  {
    name: "Mathematics",
    boards: "Edexcel · AQA · OCR",
    tint: "from-[#e8f0fd] to-white",
    accent: "#1a3a7c",
    topics: ["Algebra", "Number", "Geometry", "Statistics", "Probability", "Trigonometry"],
    body: "Foundation and Higher tier. We teach the method, the mark scheme, and the exam technique that turns understanding into marks.",
  },
  {
    name: "English",
    boards: "AQA · Edexcel",
    tint: "from-[#eeebff] to-white",
    accent: "#3c3489",
    topics: ["Language Paper 1", "Language Paper 2", "Literature", "Comparison", "Unseen poetry", "Essay technique"],
    body: "English Language and Literature. Strong focus on essay structure, comparative analysis and the AO marks examiners actually reward.",
  },
];

const tutors = [
  {
    name: "Yusuf Ahmed",
    role: "GCSE & A-Level Mathematics",
    bio: "8+ years teaching in UK secondary schools. Edexcel and AQA specialist with a knack for breaking down algebra and geometry.",
    quote: "Every student can do maths — they just need it broken down the right way.",
    initials: "YA",
    gradient: "from-[#4a8fe8] to-[#1a3a7c]",
  },
  {
    name: "Qasim Khan",
    role: "GCSE & A-Level Mathematics",
    bio: "Former Head of Maths at a UK secondary school. Has marked GCSE papers and knows exactly what earns the top grades.",
    quote: "Exam technique is the difference between a 6 and a 9. We teach both.",
    initials: "QK",
    gradient: "from-[#7c5fff] to-[#3c3489]",
  },
  {
    name: "English Faculty",
    role: "Coming soon — Autumn term",
    bio: "We're hand-picking experienced English teachers right now. Join the waitlist and we'll let you know the moment lessons go live.",
    quote: "",
    initials: "EN",
    gradient: "from-[#94a3b8] to-[#475569]",
    coming: true,
  },
];

const schedule = [
  { day: "Monday", time: "6:00 pm", lesson: "GCSE Maths · Foundation", subject: "MATHS" },
  { day: "Tuesday", time: "6:00 pm", lesson: "GCSE Maths · Higher", subject: "MATHS" },
  { day: "Wednesday", time: "5:00 pm", lesson: "KS3 Maths", subject: "MATHS" },
  { day: "Thursday", time: "6:00 pm", lesson: "A-Level Maths", subject: "MATHS" },
  { day: "Saturday", time: "11:00 am", lesson: "GCSE English · coming soon", subject: "ENGLISH" },
];

const faqs = [
  {
    q: "How big are the live groups?",
    a: "Small and focused. Every child gets the chance to be heard, ask questions, and answer them. Far smaller than a school class, but big enough to keep lessons engaging.",
  },
  {
    q: "What happens if my child misses a session?",
    a: "Every live lesson is recorded and uploaded to their student dashboard within 24 hours — so a missed Monday can be caught up on Tuesday, or before the weekly quiz.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No long contracts, no notice period. You can pause or cancel from your parent dashboard whenever you need to.",
  },
  {
    q: "Are the teachers actually qualified?",
    a: "Yes. Every BrainBooster teacher has experience teaching in a UK secondary school and knows their exam board inside out. No graduates reading from a textbook.",
  },
  {
    q: "Which exam boards do you cover?",
    a: "Edexcel, AQA and OCR for Mathematics. AQA and Edexcel for English. If you're with a different board, send us a message — we'll tell you honestly whether we're the right fit.",
  },
  {
    q: "How does the weekly quiz work?",
    a: "10 auto-marked questions sent on Friday based on what was taught that week. Your child gets instant feedback, and the score appears in your Monday report.",
  },
  {
    q: "What's in the Monday parent report?",
    a: "Attendance for the week, the quiz score, what was covered, and a short note from the teacher highlighting anything to watch. Delivered by WhatsApp — no app to download.",
  },
  {
    q: "Is the free trial really free?",
    a: "Yes. No card details, no auto-enrolment. Your child joins one live session, and you decide afterwards if it's the right fit.",
  },
];

/* ============================================================================
   PAGE
============================================================================ */

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [trialOpen, setTrialOpen] = useState(false);

  const openTrial = () => {
    setMobileOpen(false);
    setTrialOpen(true);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f7fc] text-[#0d1b3e] antialiased">
      {/* ---------- NAV (glassmorphism) ---------- */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-[#0f2557]/80 backdrop-blur-xl"
            : "bg-[#0f2557]"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="text-[15px] font-semibold tracking-tight text-white">
              The BrainBooster Academy
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {[
              ["How it works", "#how"],
              ["Subjects", "#subjects"],
              ["Tutors", "#tutors"],
              ["Pricing", "/pricing"],
              ["Free quiz", "#quiz"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="rounded-md px-3 py-1.5 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="hidden rounded-md px-3 py-1.5 text-[13px] font-medium text-white/80 transition-colors hover:text-white sm:inline-block"
            >
              Log in
            </Link>
            <button
              onClick={openTrial}
              className="hidden rounded-md bg-[#4a8fe8] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(74,143,232,0.7)] transition-all hover:bg-[#3a7bd5] sm:inline-block"
            >
              Free trial
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 md:hidden"
              aria-label="Toggle menu"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 bg-[#0f2557]/95 backdrop-blur-xl md:hidden">
            <div className="space-y-1 px-5 py-3">
              {[
                ["How it works", "#how"],
                ["Subjects", "#subjects"],
                ["Tutors", "#tutors"],
                ["Pricing", "/pricing"],
                ["Free quiz", "#quiz"],
                ["FAQ", "#faq"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={openTrial}
                className="mt-2 block w-full rounded-md bg-[#4a8fe8] px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Book a free trial
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden pt-16">
        <div className="relative">
          <div className="absolute inset-0">
            <HeroMesh />
          </div>

          {/* floating glass card visual on the right */}
          <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28 lg:pb-40 lg:pt-36">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#93c5fd] backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#93c5fd]" />
                  For parents who want more than a tutor
                </div>

                <h1 className="mt-6 text-balance text-[40px] font-bold leading-[1.05] tracking-tight text-white sm:text-[56px] lg:text-[64px]">
                  Your child deserves to walk into their exam{" "}
                  <span className="bg-gradient-to-r from-[#93c5fd] via-[#a5b4fc] to-[#c4b5fd] bg-clip-text text-transparent">
                    knowing they're ready.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/75">
                  BrainBooster pairs your child with qualified secondary school teachers in small live
                  groups — so they stop guessing and start understanding.
                </p>

                <p className="mt-3 max-w-xl text-[14px] italic text-white/55">
                  Worried your child is falling behind but not sure where to start? You're in the right
                  place.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={openTrial}
                    className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#4a8fe8] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(74,143,232,0.8)] transition-all hover:-translate-y-0.5 hover:bg-[#3a7bd5] hover:shadow-[0_18px_40px_-12px_rgba(74,143,232,0.9)]"
                  >
                    Book a free trial session
                    <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <Link
                    href="#how"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/[0.04] px-6 py-3.5 text-[15px] font-medium text-white backdrop-blur transition-colors hover:bg-white/10"
                  >
                    See how it works
                  </Link>
                </div>

                {/* tiny social proof under buttons */}
                <div className="mt-8 flex items-center gap-3 text-[13px] text-white/55">
                  <div className="flex -space-x-2">
                    {["#a5b4fc", "#93c5fd", "#22d3ee", "#fbcfe8"].map((c) => (
                      <span
                        key={c}
                        className="h-7 w-7 rounded-full border-2 border-[#0f2557]"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <span>Trusted by GCSE families across the UK</span>
                </div>
              </div>

              {/* HERO RIGHT — floating glass dashboard preview */}
              <div className="relative hidden lg:block">
                <div className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-[#4a8fe8]/30 blur-3xl" />
                <div className="absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-[#7c5fff]/25 blur-3xl" />

                <div className="relative rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]/70" />
                    </div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                      Monday report · 8:00am
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl bg-white/[0.08] p-4">
                      <div className="text-[12px] font-medium text-white/60">Quiz this week</div>
                      <div className="mt-1.5 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">16</span>
                        <span className="text-sm text-white/55">/ 20 · Expanding brackets</span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-[#4a8fe8] to-[#a5b4fc]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white/[0.06] p-3">
                        <div className="text-[11px] font-medium text-white/55">Attendance</div>
                        <div className="mt-1 text-lg font-semibold text-white">2 / 2 sessions</div>
                      </div>
                      <div className="rounded-xl bg-white/[0.06] p-3">
                        <div className="text-[11px] font-medium text-white/55">Recordings</div>
                        <div className="mt-1 text-lg font-semibold text-white">4 watched</div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#4a8fe8]/30 bg-[#4a8fe8]/10 p-3">
                      <div className="text-[11px] font-medium uppercase tracking-wider text-[#93c5fd]">
                        Teacher note
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/80">
                        Strong work on simplifying. Worth a quick revisit of factorising before next
                        week's session.
                      </p>
                    </div>
                  </div>
                </div>

                {/* small floating chip */}
                <div className="absolute -bottom-4 -left-4 rounded-xl border border-white/15 bg-white/[0.1] px-3 py-2 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366]">
                      <IconWhatsApp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                        Delivered via
                      </div>
                      <div className="text-[12px] font-semibold text-white">WhatsApp</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* trust strip */}
          <div className="relative border-y border-white/10 bg-[#0a1c44]/60 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-4 sm:px-8">
              {trustItems.map((item) => (
                <div key={item} className="flex items-center gap-2 text-[13px] text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4a8fe8]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- WORRY SECTION ---------- */}
      <section className="relative overflow-hidden bg-white py-24 sm:py-28">
        <FaintGrid />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#3a7bd5]">
              We hear it every day
            </div>
            <h2 className="mt-3 text-balance text-[34px] font-bold leading-tight tracking-tight text-[#0f2557] sm:text-[44px]">
              Does any of this sound familiar?
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#3d4f72]">
              These are the worries parents share with us before joining BrainBooster.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {worries.map((w, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-[#dce5f5] bg-gradient-to-br from-white to-[#f5f7fc] p-6 transition-all hover:-translate-y-1 hover:border-[#4a8fe8]/40 hover:shadow-[0_20px_50px_-20px_rgba(15,37,87,0.18)]"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#4a8fe8] to-[#7c5fff]" />
                <h4 className="text-[16px] font-semibold leading-snug text-[#0f2557]">
                  {w.title}
                </h4>
                <p className="mt-3 text-[14px] leading-relaxed text-[#3d4f72]">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="relative bg-[#f5f7fc] py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#3a7bd5]">
              What's included
            </div>
            <h2 className="mt-3 text-[34px] font-bold leading-tight tracking-tight text-[#0f2557] sm:text-[44px]">
              Everything your child needs, in one place
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-[#dce5f5] bg-white p-7 transition-all hover:-translate-y-1 hover:border-[#4a8fe8]/40 hover:shadow-[0_24px_60px_-24px_rgba(15,37,87,0.2)]"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.tint}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-[#0f2557]">
                  {f.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#3d4f72]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how" className="relative overflow-hidden bg-white py-24 sm:py-28">
        <FaintGrid />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#3a7bd5]">
              How it works
            </div>
            <h2 className="mt-3 text-balance text-[34px] font-bold leading-tight tracking-tight text-[#0f2557] sm:text-[44px]">
              A simple rhythm that compounds week after week
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#3d4f72]">
              No homework piles, no guesswork. Just live teaching, instant feedback, and a clear weekly
              summary for parents.
            </p>
          </div>

          <div className="relative mt-14">
            {/* connecting line */}
            <div className="pointer-events-none absolute left-0 right-0 top-[34px] hidden h-px bg-gradient-to-r from-transparent via-[#dce5f5] to-transparent lg:block" />

            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((s, i) => (
                <li key={i} className="relative">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2557] to-[#1a3a7c] text-[15px] font-bold text-white shadow-[0_12px_30px_-12px_rgba(15,37,87,0.6)]">
                    {s.n}
                  </div>
                  <h4 className="mt-5 text-[16px] font-semibold tracking-tight text-[#0f2557]">
                    {s.title}
                  </h4>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[#3d4f72]">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- SUBJECTS ---------- */}
      <section id="subjects" className="relative bg-[#f5f7fc] py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#3a7bd5]">
                Subjects
              </div>
              <h2 className="mt-3 text-balance text-[34px] font-bold leading-tight tracking-tight text-[#0f2557] sm:text-[44px]">
                Two subjects we know inside out
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {yearGroups.map((y) => (
                <span
                  key={y}
                  className="rounded-full border border-[#dce5f5] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#3d4f72]"
                >
                  {y}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {subjects.map((sub) => (
              <div
                key={sub.name}
                className={`group relative overflow-hidden rounded-3xl border border-[#dce5f5] bg-gradient-to-br ${sub.tint} p-8 transition-all hover:-translate-y-1 hover:shadow-[0_30px_70px_-30px_rgba(15,37,87,0.25)]`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_10px_30px_-12px_rgba(15,37,87,0.25)]"
                    style={{ color: sub.accent }}
                  >
                    <IconBookOpen className="h-7 w-7" />
                  </div>
                  <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#3d4f72] backdrop-blur">
                    {sub.boards}
                  </span>
                </div>

                <h3 className="mt-7 text-[28px] font-bold tracking-tight text-[#0f2557]">
                  {sub.name}
                </h3>
                <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-[#3d4f72]">
                  {sub.body}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {sub.topics.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-white bg-white/80 px-2.5 py-1 text-[12px] font-medium text-[#0f2557] backdrop-blur"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TUTORS ---------- */}
      <section id="tutors" className="relative overflow-hidden bg-white py-24 sm:py-28">
        <FaintGrid />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#3a7bd5]">
              Meet the teachers
            </div>
            <h2 className="mt-3 text-balance text-[34px] font-bold leading-tight tracking-tight text-[#0f2557] sm:text-[44px]">
              Real teachers. Not graduates with a PDF.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#3d4f72]">
              Every BrainBooster session is taught by an experienced UK secondary teacher — the kind who
              has spent years in a classroom and marked the papers you're prepping for.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {tutors.map((t) => (
              <div
                key={t.name}
                className={`relative overflow-hidden rounded-3xl border border-[#dce5f5] bg-white p-7 transition-all hover:-translate-y-1 hover:border-[#4a8fe8]/40 hover:shadow-[0_24px_60px_-24px_rgba(15,37,87,0.2)] ${
                  t.coming ? "opacity-95" : ""
                }`}
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${t.gradient} text-[18px] font-bold text-white shadow-[0_12px_30px_-12px_rgba(15,37,87,0.5)]`}
                >
                  {t.initials}
                </div>

                <div className="mt-5 flex items-start justify-between gap-2">
                  <h3 className="text-[19px] font-semibold tracking-tight text-[#0f2557]">
                    {t.name}
                  </h3>
                  {t.coming && (
                    <span className="rounded-full bg-[#fce8f0] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8a1f4a]">
                      Soon
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[12.5px] font-medium text-[#3a7bd5]">{t.role}</div>

                <p className="mt-4 text-[13.5px] leading-relaxed text-[#3d4f72]">{t.bio}</p>

                {t.quote && (
                  <blockquote className="mt-5 rounded-xl border-l-2 border-[#4a8fe8] bg-[#f5f7fc] px-4 py-3 text-[13px] italic leading-relaxed text-[#0f2557]">
                    “{t.quote}”
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TIMETABLE ---------- */}
      <section id="timetable" className="relative overflow-hidden bg-[#0f2557] py-24 sm:py-28">
        <div className="absolute inset-0">
          <HeroMesh />
        </div>
        <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#93c5fd] backdrop-blur">
              <IconCalendar className="h-3.5 w-3.5" />
              Weekly timetable
            </div>
            <h2 className="mt-5 text-balance text-[34px] font-bold leading-tight tracking-tight text-white sm:text-[44px]">
              A predictable rhythm, every single week
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-white/70">
              Live lessons run after the school day. Pick the ones that match your child's level — all
              sessions are recorded if life gets in the way.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <ul className="divide-y divide-white/10">
              {schedule.map((row) => (
                <li
                  key={row.day + row.lesson}
                  className="grid grid-cols-[110px_1fr_auto] items-center gap-4 px-5 py-4 sm:grid-cols-[140px_120px_1fr_auto] sm:px-7"
                >
                  <span className="text-[14px] font-semibold uppercase tracking-wider text-white">
                    {row.day}
                  </span>
                  <span className="hidden text-[13px] font-medium text-[#93c5fd] sm:block">
                    {row.time}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-white">{row.lesson}</span>
                    <span className="text-[12px] text-white/55 sm:hidden">{row.time}</span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                      row.subject === "MATHS"
                        ? "bg-[#4a8fe8]/20 text-[#93c5fd]"
                        : "bg-[#fce8f0]/15 text-[#fbcfe8]"
                    }`}
                  >
                    {row.subject === "MATHS" ? "Maths" : "English"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 text-[13px] text-white/55">
            All times shown in UK time. Sessions run during UK school term — dashboard always shows what's
            next.
          </p>
        </div>
      </section>

      {/* ---------- QUIZ CTA ---------- */}
      <section id="quiz" className="relative overflow-hidden bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-[#dce5f5] bg-gradient-to-br from-[#e8f0fd] via-white to-[#eeebff] p-10 sm:p-14">
            {/* decorative blurs */}
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#4a8fe8]/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#7c5fff]/15 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#3a7bd5]">
                  Free to try right now
                </div>
                <h2 className="mt-3 text-[32px] font-bold leading-tight tracking-tight text-[#0f2557] sm:text-[40px]">
                  Not sure if your child needs support?
                </h2>
                <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-[#3d4f72]">
                  Take our free 10-question GCSE Maths quiz. It takes five minutes, shows you exactly
                  where they are, and gives you a result you can actually act on.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/quiz"
                    className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f2557] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_-12px_rgba(15,37,87,0.6)] transition-all hover:-translate-y-0.5 hover:bg-[#1a3a7c]"
                  >
                    Try the free quiz
                    <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <span className="inline-flex items-center gap-2 text-[13px] text-[#3d4f72]">
                    <IconCheck className="h-4 w-4 text-[#1a7a50]" />
                    No sign-up. Instant results.
                  </span>
                </div>
              </div>

              {/* mock quiz card */}
              <div className="relative">
                <div className="rotate-1 rounded-2xl border border-[#dce5f5] bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,37,87,0.25)]">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#7a8aaa]">Question 3 of 10</span>
                    <span className="font-semibold text-[#0f2557]">Score: 2</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8f0fd]">
                    <div className="h-full w-[30%] rounded-full bg-[#4a8fe8]" />
                  </div>
                  <div className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-[#7a8aaa]">
                    GCSE Maths · Edexcel style
                  </div>
                  <div className="mt-1.5 text-[18px] font-bold leading-snug text-[#0f2557]">
                    Expand: 3(2x − 4)
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      ["A", "6x − 4", false],
                      ["B", "6x − 12", true],
                      ["C", "5x − 12", false],
                      ["D", "6x − 7", false],
                    ].map(([letter, text, correct]) => (
                      <div
                        key={letter as string}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-[14px] transition-colors ${
                          correct
                            ? "border-[#1a7a50] bg-[#d6f5ec] text-[#0a5c3a]"
                            : "border-[#dce5f5] bg-white text-[#0d1b3e]"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                            correct
                              ? "bg-[#1a7a50] text-white"
                              : "bg-[#f5f7fc] text-[#7a8aaa]"
                          }`}
                        >
                          {letter}
                        </span>
                        {text}
                        {correct ? <IconCheck className="ml-auto h-4 w-4 text-[#1a7a50]" /> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="relative bg-[#f5f7fc] py-24 sm:py-28">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#3a7bd5]">
              Frequently asked
            </div>
            <h2 className="mt-3 text-balance text-[34px] font-bold leading-tight tracking-tight text-[#0f2557] sm:text-[44px]">
              The questions parents ask before joining
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[#3d4f72]">
              If we haven't answered yours, send us a WhatsApp — we usually reply within an hour.
            </p>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`overflow-hidden rounded-2xl border bg-white transition-all ${
                    isOpen ? "border-[#4a8fe8]/40 shadow-[0_14px_40px_-20px_rgba(74,143,232,0.4)]" : "border-[#dce5f5]"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-[#f5f7fc]/60"
                  >
                    <span className="text-[15.5px] font-semibold tracking-tight text-[#0f2557]">
                      {f.q}
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isOpen
                          ? "rotate-45 border-[#4a8fe8] bg-[#4a8fe8] text-white"
                          : "border-[#dce5f5] bg-white text-[#3d4f72]"
                      }`}
                    >
                      <IconPlus className="h-4 w-4" />
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-[14.5px] leading-relaxed text-[#3d4f72]">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section id="trial" className="relative overflow-hidden bg-[#0f2557] py-24 sm:py-28">
        <div className="absolute inset-0">
          <HeroMesh />
        </div>
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#93c5fd] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#93c5fd]" />
            Free taster session
          </div>
          <h2 className="mt-6 text-balance text-[36px] font-bold leading-tight tracking-tight text-white sm:text-[52px]">
            Ready to see what BrainBooster can do?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-white/70">
            Book a free taster session — no payment, no pressure. Your child joins a live lesson and
            you decide from there.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={openTrial}
              className="group inline-flex items-center gap-2 rounded-lg bg-[#4a8fe8] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(74,143,232,0.8)] transition-all hover:-translate-y-0.5 hover:bg-[#3a7bd5]"
            >
              Book my child's free trial
              <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.04] px-7 py-3.5 text-[15px] font-medium text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              See pricing
            </Link>
          </div>

          <div className="mx-auto mt-10 max-w-md rounded-xl border border-[#1a7a50]/30 bg-[#1a7a50]/15 p-4 text-left backdrop-blur">
            <div className="flex items-start gap-3">
              <IconShield className="mt-0.5 h-5 w-5 shrink-0 text-[#a7f3d0]" />
              <p className="text-[13px] leading-relaxed text-[#d6f5ec]">
                <span className="font-semibold text-white">30-day guarantee.</span> If you don't feel a
                measurable improvement in your child's confidence within the first month, we'll give
                you a full refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-[#0a1c44] py-14 text-white/60">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <LogoMark className="h-8 w-8" />
                <span className="text-[15px] font-semibold text-white">
                  The BrainBooster Academy
                </span>
              </div>
              <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/55">
                Real teachers. Confident students. Real results.
              </p>
            </div>

            {[
              {
                heading: "Platform",
                links: [
                  ["How it works", "#how"],
                  ["Pricing", "/pricing"],
                  ["Free quiz", "/quiz"],
                  ["FAQ", "#faq"],
                ],
              },
              {
                heading: "Subjects",
                links: [
                  ["Mathematics", "#subjects"],
                  ["English", "#subjects"],
                  ["Tutors", "#tutors"],
                  ["Timetable", "#timetable"],
                ],
              },
              {
                heading: "Account",
                links: [
                  ["Log in", "/auth/login"],
                  ["Free trial", "#trial"],
                  ["Contact us", "#"],
                  ["Privacy policy", "#"],
                ],
              },
            ].map((col) => (
              <div key={col.heading}>
                <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">
                  {col.heading}
                </div>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-[13px] text-white/65 transition-colors hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[12px] text-white/40 sm:flex-row sm:items-center">
            <span>© 2025 The BrainBooster Academy. All rights reserved.</span>
            <span className="italic">Real teachers. Confident students. Real results.</span>
          </div>
        </div>
      </footer>

      {/* WhatsApp floating button — opens chat with +44 7756 980100 */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on WhatsApp"
        className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_34px_-8px_rgba(37,211,102,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[#1faa55] hover:shadow-[0_18px_40px_-8px_rgba(37,211,102,0.8)]"
      >
        <IconWhatsApp className="h-7 w-7" />
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-[#0f2557] px-3 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:block">
          Chat on WhatsApp
        </span>
      </a>

      <TrialModal open={trialOpen} onClose={() => setTrialOpen(false)} />
    </div>
  );
}
