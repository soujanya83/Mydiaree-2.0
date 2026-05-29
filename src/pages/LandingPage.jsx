import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/landing-hero-classroom.jpg";
import blocksImg from "@/assets/landing-play-blocks.jpg";
import paintImg from "@/assets/landing-painting.jpg";
import parentImg from "@/assets/landing-parent-portrait.jpg";
import logo from "@/assets/mydiaree_long_logo.png";

const NAV = [
  ["Features", "#platform"],
  ["Benefits", "#pillars"],
  ["Pricing", "#cta"],
  ["FAQ", "#faq"],
  ["Contact", "#cta"],
  ["Privacy Policy", "/privacy-policy"],
];

const HERO_SLIDES = [
  {
    src: heroImg,
    alt: "Educator working with children in a classroom",
  },
  {
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80",
    alt: "Children exploring wooden blocks together",
  },
  {
    src: paintImg,
    alt: "Child painting with bright colours",
  },
  {
    src: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1400&q=80",
    alt: "Educator reading a story to a small group",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background bg-grain text-foreground">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Bento />
        <Pillars />
        <Workflow />
        <Testimonial />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <img src={logo} alt="MyDiaree" className="h-8 w-auto md:h-9" />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map(([label, href]) => (
            <a key={label} href={href} className="text-sm text-foreground/70 transition hover:text-foreground">
              {label}
            </a>
          ))}
          <a href="#platform" className="text-sm font-semibold text-teal-deep hover:text-coral">
            Platforms
          </a>
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Log in
          </Link>
          <a
            href="#cta"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Book a demo
            <Arrow />
          </a>
        </div>
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:bg-secondary lg:hidden"
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <span className="relative h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition ${
                menuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition ${
                menuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      <div
        className={`border-t border-border/70 bg-background/95 shadow-soft backdrop-blur-md transition lg:hidden ${
          menuOpen ? "block" : "hidden"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
          {[...NAV, ["Platforms", "#platform"]].map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={closeMenu}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground/75 transition hover:bg-secondary hover:text-foreground"
            >
              {label}
            </a>
          ))}
          <div className="mt-3 grid gap-2 border-t border-border pt-4 sm:grid-cols-2">
            <Link
              to="/login"
              onClick={closeMenu}
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              Log in
            </Link>
            <a
              href="#cta"
              onClick={closeMenu}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Book a demo
              <Arrow />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function Hero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden">
      <Blob className="absolute -left-32 top-24 h-80 w-80 text-teal/15" />
      <Blob className="absolute -right-24 bottom-0 h-96 w-96 text-coral/15" />

      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-14 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pt-20">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/70">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal" />
            Proudly Montessori-aligned · EYLF v2.0 · Made for Australia
          </span>

          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl lg:text-[80px]">
            Where <span className="squiggle-underline text-teal-deep">families</span>, care,
            <br className="hidden sm:block" /> and{" "}
            <span className="relative inline-block">
              <span className="relative z-10">communication</span>
              <span className="absolute -bottom-1 left-0 right-0 -z-0 h-3 rounded-md bg-butter/80" />
            </span>{" "}
            come together.
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-foreground/70">
            MyDiaree is the Montessori-aligned, AI-enabled daily diary and family communications platform built for Australian early childhood, designed to give educators their time back.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#cta"
              className="inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3.5 text-sm font-semibold text-white shadow-pop transition hover:translate-y-[-1px]"
            >
              Start a free trial <Arrow />
            </a>
            <a
              href="#platform"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              Explore our platforms
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-foreground/60">
            {[
              ["🌿", "Montessori-aligned"],
              ["🇦🇺", "AUS data hosting"],
              ["🔐", "ISO-grade security"],
              ["⭐", "4.9 · educator-rated"],
            ].map(([emoji, text]) => (
              <li key={text} className="flex items-center gap-2">
                <span aria-hidden>{emoji}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
            <div className="absolute inset-0 -rotate-2 rounded-3xl bg-teal/15" />
            <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-soft">
              {HERO_SLIDES.map((s, idx) => (
                <img
                  key={s.src}
                  src={s.src}
                  alt={s.alt}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    idx === i ? "opacity-100" : "opacity-0"
                  }`}
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              ))}
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    aria-label={`Show image ${idx + 1}`}
                    onClick={() => setI(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === i ? "w-6 bg-white" : "w-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div
              className="absolute -left-6 top-10 w-56 rotate-[-6deg] rounded-2xl bg-card p-3 shadow-soft animate-float"
              style={{ "--r": "-6deg" }}
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-coral/20 text-center text-base leading-8">🍎</div>
                <div className="text-[11px] uppercase tracking-wider text-foreground/50">Meal · 12:04</div>
              </div>
              <p className="mt-2 text-sm font-medium">Eva tried pumpkin pasta — second helping!</p>
            </div>

            <div
              className="absolute -right-6 top-1/3 w-52 rotate-[5deg] rounded-2xl bg-card p-3 shadow-soft animate-float"
              style={{ "--r": "5deg", animationDelay: "1.4s" }}
            >
              <span className="rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-semibold text-teal-deep">
                🎙️ Voice · Head Check
              </span>
              <p className="mt-2 text-sm leading-snug">"Mia — head check clear, 2:15pm." Logged hands-free.</p>
            </div>

            <div
              className="absolute -bottom-6 left-6 flex w-64 items-center gap-3 rounded-2xl bg-ink p-3 text-primary-foreground shadow-soft animate-float"
              style={{ "--r": "-3deg", animationDelay: "0.7s" }}
            >
              <div className="flex -space-x-2">
                {["bg-coral", "bg-teal", "bg-butter"].map((c, idx) => (
                  <span key={idx} className={`h-7 w-7 rounded-full border-2 border-ink ${c}`} />
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold">12 families notified</p>
                <p className="text-[11px] text-primary-foreground/60">Photo · Sleep · Story</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Blob({ className = "" }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M44.4,-66.6C56.7,-58.8,64.9,-44.7,69.7,-29.9C74.5,-15.1,75.9,0.4,71.7,14.1C67.4,27.8,57.5,39.7,45.4,49.6C33.3,59.5,19,67.3,3.2,63.7C-12.6,60,-30.9,44.9,-44.3,30C-57.7,15.1,-66.1,0.3,-65.2,-14.4C-64.3,-29.1,-54.2,-43.8,-41,-51.9C-27.8,-60,-13.9,-61.6,1.6,-64C17.1,-66.5,32.1,-74.4,44.4,-66.6Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

function Marquee() {
  const items = [
    "Montessori-aligned",
    "EYLF v2.0",
    "ACECQA aligned",
    "MTOP",
    "NQS",
    "AUS-hosted",
    "Xero ready",
    "ISO 27001 practices",
  ];

  return (
    <section className="border-y border-border bg-card">
      <div className="overflow-hidden py-5">
        <div className="flex w-max animate-marquee gap-12 px-8 text-sm font-medium uppercase tracking-[0.18em] text-foreground/55">
          {[...items, ...items, ...items].map((item, idx) => (
            <span key={idx} className="flex items-center gap-3">
              {item}
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-coral" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Bento() {
  const dailyTabs = ["Meals", "Sleep Check", "Head Checks", "Toileting"];

  return (
    <section id="platform" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <div className="grid items-end gap-6 md:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">The platform</span>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Where families, care,
            <br /> and communication come together.
          </h2>
        </div>
        <p className="text-foreground/70 md:text-lg">
          Diary, observations, messaging — built for the realities of an Australian Montessori-aligned centre. Designed with educators, refined with families, accelerated by AI.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-[260px_260px_260px]">
        <article className="group relative overflow-hidden rounded-3xl bg-ink p-7 text-primary-foreground md:col-span-3 md:row-span-2">
          <Sparkle className="absolute right-6 top-6 h-8 w-8 text-coral" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">AI Assist</span>
          <h3 className="mt-3 font-display text-3xl font-semibold leading-tight">
            Turn a 30-second note into a polished learning story.
          </h3>
          <p className="mt-3 max-w-md text-primary-foreground/70">
            Educators jot the moment; MyDiaree refines language, suggests EYLF outcomes, and translates for families in any language.
          </p>

          <div className="mt-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <p className="text-xs uppercase tracking-wider text-primary-foreground/50">You wrote</p>
            <p className="mt-1 text-sm">"jack stacked blocks, knocked tower, laughed, tried again"</p>
            <div className="my-3 h-px bg-white/10" />
            <p className="text-xs uppercase tracking-wider text-teal">MyDiaree suggests · EYLF 4.2</p>
            <p className="mt-1 text-sm leading-relaxed">
              Today Jack demonstrated persistence and a developing understanding of cause and effect by re-building his block tower with deliberate balance after each attempt.
            </p>
          </div>
        </article>

        <article className="group relative overflow-hidden rounded-3xl bg-teal/15 p-7 md:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">Daily diary</span>
              <h3 className="mt-2 font-display text-2xl font-semibold">The whole day — captured in seconds.</h3>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-card shadow-soft">📔</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {dailyTabs.map((t) => (
              <span key={t} className="rounded-full bg-card px-3 py-1.5 font-medium">
                {t}
              </span>
            ))}
          </div>
          <img
            src={paintImg}
            alt="Child finger painting"
            loading="lazy"
            width={1024}
            height={1024}
            className="mt-5 aspect-[16/7] w-full rounded-2xl object-cover"
          />
        </article>

        <article className="relative overflow-hidden rounded-3xl border border-coral/40 bg-card p-6 md:col-span-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-coral/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-coral">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />
            Introducing — a first
          </span>
          <h3 className="mt-3 font-display text-xl font-semibold leading-tight">Voice-enabled Head Check entries.</h3>
          <p className="mt-2 text-sm text-foreground/70">
            Educators can update Head Checks just by speaking to the MyDiaree app — hands stay free, eyes stay on the children.
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-ink/95 p-3 text-primary-foreground">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-coral">🎙️</span>
            <div className="flex-1 text-xs">
              <p className="font-semibold">"Mia — head check clear."</p>
              <div className="mt-1 flex items-end gap-0.5">
                {[5, 9, 14, 8, 18, 12, 22, 10, 16, 7].map((h, idx) => (
                  <span key={idx} style={{ height: h }} className="w-0.5 rounded bg-teal" />
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-3xl bg-coral/20 p-6 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">Family chat</span>
          <h3 className="mt-2 font-display text-xl font-semibold">Secure messages, read receipts, no group-chat chaos.</h3>
          <div className="mt-4 space-y-2 text-sm">
            <Bubble side="left">Eva slept beautifully today 😴 1h 12m</Bubble>
            <Bubble side="right" tone="dark">Thank you! She was up early ✨</Bubble>
            <Bubble side="left">She's at painting now — pics coming!</Bubble>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-3xl bg-butter/60 p-6 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/60">Insights</span>
          <h3 className="mt-2 font-display text-xl font-semibold">See what each child is loving — across weeks.</h3>
          <div className="mt-4 flex h-20 items-end gap-1.5">
            {[40, 60, 45, 75, 55, 80, 65, 90, 70].map((h, idx) => (
              <span key={idx} style={{ height: `${h}%` }} className="w-3 flex-1 rounded-md bg-ink/80" />
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function Sparkle({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
    </svg>
  );
}

function Bubble({ children, side, tone }) {
  const isRight = side === "right";
  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <span
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 ${
          tone === "dark" ? "bg-ink text-primary-foreground" : "bg-card text-foreground"
        } ${isRight ? "rounded-br-sm" : "rounded-bl-sm"}`}
      >
        {children}
      </span>
    </div>
  );
}

function Pillars() {
  const items = [
    {
      tag: "Childcare",
      color: "bg-coral text-white",
      icon: "🧸",
      title: "Honours the everyday rituals",
      body: "Meals, sleeps, head checks, toileting, sign-in/out — modelled around how Australian centres actually run.",
    },
    {
      tag: "Montessori",
      color: "bg-teal-deep text-white",
      icon: "🌿",
      title: "Follow the child — by design",
      body: "Provocations, sensitive periods and observation language baked into every report. EYLF v2.0 outcomes too.",
    },
    {
      tag: "Technology",
      color: "bg-ink text-white",
      icon: "🤖",
      title: "AI that respects the educator",
      body: "Drafts, never decides. Voice-enabled entries, translations and suggestions — always reviewable.",
    },
  ];

  return (
    <section id="pillars" className="bg-ink py-24 text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Three worlds, one tool</span>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
            A truly <span className="text-teal">Montessori-aligned</span> platform — built where
            <span className="text-coral"> care, learning</span> and software meet.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((p) => (
            <div key={p.tag} className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${p.color}`}>
                  {p.tag}
                </span>
                <span className="text-2xl" aria-hidden>{p.icon}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold leading-tight">{p.title}</h3>
              <p className="mt-3 text-primary-foreground/65">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  const steps = [
    { k: "01", t: "Capture", d: "A photo, a tap, a spoken word. From the floor, not the office." },
    { k: "02", t: "Refine", d: "MyDiaree drafts the learning story and maps EYLF outcomes." },
    { k: "03", t: "Share", d: "Families see the day's moments — translated to their language." },
    { k: "04", t: "Reflect", d: "Educator insights highlight each child's emerging interests over weeks." },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <div className="grid items-start gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-deep">A day with MyDiaree</span>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
            From a moment on the mat to a milestone on the wall.
          </h2>
          <p className="mt-5 max-w-md text-foreground/70">
            Educators spend up to 11 hours a week on documentation. MyDiaree gives most of it back.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <Stat n="6h" l="saved per educator / week" />
            <Stat n="93%" l="families more engaged" />
            <Stat n="🎙️" l="hands-free Head Checks" />
          </div>
        </div>

        <ol className="relative lg:col-span-7">
          <span className="absolute bottom-3 left-[22px] top-3 w-px bg-border" aria-hidden />
          {steps.map((s) => (
            <li key={s.k} className="relative flex gap-6 pb-8 last:pb-0">
              <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card text-sm font-semibold ring-ink">
                {s.k}
              </span>
              <div className="pt-1.5">
                <h3 className="font-display text-2xl font-semibold">{s.t}</h3>
                <p className="mt-1 max-w-md text-foreground/65">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Stat({ n, l }) {
  return (
    <div>
      <p className="font-display text-3xl font-semibold text-teal-deep">{n}</p>
      <p className="mt-1 text-xs leading-snug text-foreground/60">{l}</p>
    </div>
  );
}

function Testimonial() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
      <div className="relative overflow-hidden rounded-[40px] bg-card p-8 shadow-soft md:p-14">
        <Sparkle className="absolute -right-6 -top-6 h-24 w-24 text-butter" />
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-3xl md:w-full">
              <div className="absolute inset-0 -rotate-3 rounded-3xl bg-coral/30" />
              <img src={parentImg} alt="Parent" width={768} height={768} loading="lazy" className="relative h-full w-full rounded-3xl object-cover" />
            </div>
          </div>
          <div className="lg:col-span-9">
            <p className="font-display text-2xl leading-snug md:text-3xl">
              <span className="text-coral">"</span>
              Voice-enabled Head Checks alone gave our educators back hours every week. And the Montessori-aligned observation language? Our families finally understand what their child is working on.
              <span className="text-coral">"</span>
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm">
              <p className="font-semibold">Priya M.</p>
              <span className="h-1 w-1 rounded-full bg-foreground/30" />
              <p className="text-foreground/60">Centre Director · Little Acorns Montessori, NSW</p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-coral">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Sparkle key={idx} className="h-4 w-4" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="cta" className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      <div className="relative overflow-hidden rounded-[40px] bg-ink p-10 text-primary-foreground md:p-16">
        <img
          src={blocksImg}
          alt=""
          aria-hidden
          loading="lazy"
          width={1024}
          height={1024}
          className="absolute -right-12 -top-12 h-[420px] w-[420px] rounded-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="relative max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Start today</span>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-6xl">
            Give your educators their afternoons back.
          </h2>
          <p className="mt-5 max-w-lg text-primary-foreground/70">
            14-day free trial. No card. We'll import your existing data so you're live by morning tea.
          </p>

          <form className="mt-8 flex max-w-md flex-col gap-2 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="centre@yourservice.com.au"
              className="h-12 flex-1 rounded-full bg-white/10 px-5 text-sm text-primary-foreground outline-none ring-1 ring-white/15 placeholder:text-primary-foreground/50 focus:ring-teal"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-coral px-6 text-sm font-semibold text-white shadow-pop transition hover:translate-y-[-1px]"
            >
              Get started <Arrow />
            </button>
          </form>
          <p className="mt-3 text-xs text-primary-foreground/50">
            Montessori-aligned · Australian-hosted · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { h: "Platform", l: ["Daily diary", "Voice Head Checks", "Family messaging", "AI Assist", "Insights"] },
    { h: "Our Platforms", l: ["MyDiaree", "Chrispp", "Zinggerr"] },
    { h: "Company", l: ["Features", "Benefits", "Pricing", "FAQ", "Contact", "Privacy Policy"] },
  ];

  return (
    <footer id="privacy" className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <img src={logo} alt="MyDiaree" className="h-9 w-auto" />
          <p className="mt-4 max-w-xs text-sm text-foreground/60">
            The Montessori-aligned childcare OS for Australian educators. Built with love in Sydney, hosted at home.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.h} className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">{c.h}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.l.map((item) => (
                <li key={item}>
                  {item === "Privacy Policy" ? (
                    <Link to="/privacy-policy" className="text-foreground/75 hover:text-foreground">
                      {item}
                    </Link>
                  ) : (
                    <a href="#platform" className="text-foreground/75 hover:text-foreground">
                      {item}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">Stay close</p>
          <p className="mt-4 text-sm text-foreground/65">Monthly notes for educators. Never spammy.</p>
          <form className="mt-3 flex" onSubmit={(e) => e.preventDefault()}>
            <input
              placeholder="you@centre.com.au"
              className="h-10 w-full min-w-0 rounded-l-full border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-teal"
            />
            <button className="h-10 rounded-r-full bg-ink px-3 text-primary-foreground" aria-label="Subscribe">
              <Arrow />
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-foreground/55 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} MyDiaree Pty Ltd · Made in Australia for Australian childcare.</p>
          <p>Montessori-aligned · Educator preview</p>
        </div>
      </div>
    </footer>
  );
}
