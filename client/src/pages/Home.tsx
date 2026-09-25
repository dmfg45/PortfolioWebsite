import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { api, ApiError } from "../api/client";
import { DEFAULT_SITE_CONTENT } from "../lib/defaultSiteContent";
import type { Project, SiteContent } from "../types";

const skills = [
  { title: "Product Engineering", copy: "Building full-stack applications end to end, from database schema to polished UI." },
  { title: "App Development", copy: "Mobile and web apps focused on speed, accessibility and real-world usability." },
  { title: "Photography", copy: "A creative eye behind the camera, always looking for the next composition." },
  { title: "Ideas & Prototypes", copy: "Turning early concepts into working prototypes fast." },
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
    <section id="hero" className="relative pt-40 pb-28 px-6">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-accent-light font-medium tracking-wide uppercase text-sm mb-4">{content.heroEyebrow}</p>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-white leading-tight">{content.heroHeading}</h1>
        <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto">{content.heroSubheading}</p>
        <div className="mt-10 flex justify-center gap-4">
          <a
            href="#work"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-light transition-colors"
          >
            View my work
          </a>
          <a
            href="#contact"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
          >
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}

function About({ content }: { content: SiteContent }) {
  return (
    <section id="about" className="px-6 py-24 bg-ink-light">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-white">{content.aboutHeading}</h2>
          <p className="mt-3 text-white/60 max-w-xl mx-auto">{content.aboutSubheading}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill) => (
            <div key={skill.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-display font-semibold text-white text-lg">{skill.title}</h3>
              <p className="mt-2 text-sm text-white/60">{skill.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery({ projects, loading }: { projects: Project[]; loading: boolean }) {
  return (
    <section id="work" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-white">Selected work</h2>
          <p className="mt-3 text-white/60">Projects managed live from the admin panel.</p>
        </div>

        {loading && <p className="text-center text-white/50">Loading projects…</p>}
        {!loading && projects.length === 0 && (
          <p className="text-center text-white/50">No projects yet — add some from the admin panel.</p>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article key={project.id} className="group rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <div className="aspect-video overflow-hidden bg-ink">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-white">{project.title}</h3>
                <p className="mt-2 text-sm text-white/60">{project.description}</p>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm text-accent-light hover:text-white"
                  >
                    View project →
                  </a>
                )}
              </div>
            </article>
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

  return (
    <section id="contact" className="px-6 py-24 bg-ink-light">
      <div className="mx-auto max-w-xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-white">Let&apos;s talk</h2>
          <p className="mt-3 text-white/60">Have a project in mind? Send me a message.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            required
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <textarea
            required
            rows={5}
            placeholder="Your message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-light transition-colors disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
          {status === "sent" && <p className="text-sm text-emerald-400">Thanks! I&apos;ll get back to you soon.</p>}
          {status === "error" && <p className="text-sm text-red-400">{errorMessage}</p>}
        </form>
      </div>
    </section>
  );
}
