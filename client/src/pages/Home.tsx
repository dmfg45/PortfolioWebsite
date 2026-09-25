import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Reveal } from "../components/Reveal";
import { api, ApiError } from "../api/client";
import { DEFAULT_SITE_CONTENT } from "../lib/defaultSiteContent";
import type { Project, SiteContent } from "../types";

const skills = [
  {
    title: "Product Engineering",
    copy: "Building full-stack applications end to end, from database schema to polished UI.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.5 8-4 4 4 4m7-8 4 4-4 4M13.5 6l-3 12"
      />
    ),
  },
  {
    title: "App Development",
    copy: "Mobile and web apps focused on speed, accessibility and real-world usability.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 4h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm3.5 13h1"
      />
    ),
  },
  {
    title: "Photography",
    copy: "A creative eye behind the camera, always looking for the next composition.",
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
        <circle cx="12" cy="13" r="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: "Ideas & Prototypes",
    copy: "Turning early concepts into working prototypes fast.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.9 1 1 1.7l.1.4h4.8l.1-.4c.1-.7.5-1.3 1-1.7A6 6 0 0 0 12 3Z"
      />
    ),
  },
];

export function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    api
      .get<Project[]>("/projects")
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));

    api
      .get<SiteContent>("/content")
      .then(setContent)
      .catch(() => setContent(DEFAULT_SITE_CONTENT));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero content={content} />
      <About content={content} />
      <Gallery projects={projects} loading={loading} />
      <Contact />
      <Footer />
    </div>
  );
}

function Hero({ content }: { content: SiteContent }) {
  return (
    <section id="hero" className="relative overflow-hidden pt-40 pb-32 px-6">
      {/* Decorative background: gradient glow + grid, purely visual */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-grid" />
        <div className="animate-float absolute -top-24 left-1/2 h-[32rem] w-[32rem] -translate-x-[70%] rounded-full bg-accent/25 blur-[110px]" />
        <div className="animate-float-slow absolute top-10 left-1/2 h-[26rem] w-[26rem] translate-x-[10%] rounded-full bg-accent-2/20 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-white/70 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-2 shadow-[0_0_8px_2px_rgba(34,211,238,0.6)]" />
            {content.heroEyebrow}
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl font-bold leading-[1.05] tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-accent-light bg-clip-text text-transparent">
              {content.heroHeading}
            </span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">{content.heroSubheading}</p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#work"
              className="group relative inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(109,94,252,0.7)] transition-all hover:-translate-y-0.5 hover:bg-accent-light hover:shadow-[0_12px_36px_-8px_rgba(156,139,255,0.8)]"
            >
              View my work
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0-6-6m6 6-6 6" />
              </svg>
            </a>
            <a
              href="#contact"
              className="rounded-full border border-white/15 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10"
            >
              Get in touch
            </a>
          </div>
        </Reveal>
      </div>

      <a
        href="#about"
        aria-label="Scroll to about section"
        className="animate-bounce-y absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 transition-colors hover:text-white/70"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v13m0 0-5-5m5 5 5-5" />
        </svg>
      </a>
    </section>
  );
}

function About({ content }: { content: SiteContent }) {
  return (
    <section id="about" className="relative px-6 py-28 bg-ink-light">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-2">Capabilities</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white">{content.aboutHeading}</h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto leading-relaxed">{content.aboutSubheading}</p>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill, index) => (
            <Reveal key={skill.title} delay={index * 80}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-light/40 hover:bg-white/[0.06] hover:shadow-[0_16px_40px_-16px_rgba(109,94,252,0.5)]">
                <div className="absolute right-4 top-4 font-display text-3xl font-bold text-white/[0.06] transition-colors group-hover:text-white/10">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-2/20 text-accent-light ring-1 ring-white/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
                    {skill.icon}
                  </svg>
                </div>
                <h3 className="relative mt-4 font-display font-semibold text-white text-lg">{skill.title}</h3>
                <p className="relative mt-2 text-sm text-white/60 leading-relaxed">{skill.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery({ projects, loading }: { projects: Project[]; loading: boolean }) {
  return (
    <section id="work" className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-2">Portfolio</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white">Selected work</h2>
          <p className="mt-4 text-white/60">Projects managed live from the admin panel.</p>
        </Reveal>

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <Reveal className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
            <p className="text-white/50">No projects yet — add some from the admin panel.</p>
          </Reveal>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={index * 80}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-accent-light/40 hover:shadow-[0_20px_50px_-20px_rgba(109,94,252,0.55)]">
                <div className="relative aspect-video overflow-hidden bg-ink">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    loading="lazy"
                    className="h-full w-full object-cover saturate-[0.85] transition-all duration-500 group-hover:scale-105 group-hover:saturate-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-ink/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100"
                      aria-label={`View ${project.title} project`}
                    >
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink">
                        View project
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M7 7h10v10" />
                        </svg>
                      </span>
                    </a>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display font-semibold text-white text-lg">{project.title}</h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">{project.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    try {
      await api.post("/contact", form);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  const inputClasses =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder-white/30 transition-colors focus:outline-none focus:border-accent-light/60 focus:ring-2 focus:ring-accent/40";
  const labelClasses = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40";

  return (
    <section id="contact" className="relative px-6 py-28 bg-ink-light">
      <div className="mx-auto max-w-5xl grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-2">Contact</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white">Let&apos;s talk</h2>
          <p className="mt-4 text-white/60 max-w-md leading-relaxed">
            Have a project in mind, a role to fill, or just want to say hi? My inbox is always open.
          </p>

          <a
            href="mailto:andre.graca.45@gmail.com"
            className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-white/80 transition-all hover:border-accent-light/40 hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent-2/20 text-accent-light ring-1 ring-white/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16v12H4V6Zm0 0 8 7 8-7"
                />
              </svg>
            </span>
            <span>
              <span className="block text-xs uppercase tracking-wide text-white/40">Email</span>
              andre.graca.45@gmail.com
            </span>
          </a>
        </Reveal>

        <Reveal delay={100}>
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-sm"
          >
            <div>
              <label htmlFor="contact-name" className={labelClasses}>
                Name
              </label>
              <input
                id="contact-name"
                required
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className={labelClasses}>
                Email
              </label>
              <input
                id="contact-email"
                required
                type="email"
                placeholder="Your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="contact-message" className={labelClasses}>
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                placeholder="Your message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`${inputClasses} resize-none`}
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(109,94,252,0.7)] transition-all hover:-translate-y-0.5 hover:bg-accent-light disabled:pointer-events-none disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
            {status === "sent" && <p className="text-sm text-emerald-400">Thanks! I&apos;ll get back to you soon.</p>}
            {status === "error" && <p className="text-sm text-red-400">{errorMessage}</p>}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
