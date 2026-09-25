import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import { api, ApiError, uploadFile } from "../../api/client";
import { DEFAULT_SITE_CONTENT } from "../../lib/defaultSiteContent";
import type { ContactMessage, Project, SiteContent } from "../../types";

type Tab = "projects" | "messages" | "content";

const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
  {
    id: "projects",
    label: "Projects",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className="h-4 w-4">
        <path
          d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z"
          stroke="currentColor"
        />
        <path d="M8 9h8M8 13h8M8 17h4" stroke="currentColor" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "messages",
    label: "Messages",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className="h-4 w-4">
        <path
          d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v9a1.5 1.5 0 0 1-1.5 1.5H8l-4 3v-13.5Z"
          stroke="currentColor"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "content",
    label: "Content",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className="h-4 w-4">
        <path
          d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>("projects");

  return (
    <div className="relative min-h-screen px-6 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-accent-2">Admin</p>
            <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            Log out
          </button>
        </header>

        <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-accent text-white shadow-[0_4px_20px_-6px_rgba(109,94,252,0.7)]"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "projects" && <ProjectsPanel />}
        {tab === "messages" && <MessagesPanel />}
        {tab === "content" && <ContentPanel />}
      </div>
    </div>
  );
}

const emptyForm = { title: "", description: "", imageUrl: "", link: "", order: 0 };

function ProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await uploadFile(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function load() {
    setLoading(true);
    api
      .get<Project[]>("/projects")
      .then(setProjects)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, order: Number(form.order) };
      if (editingId) {
        await api.put(`/projects/${editingId}`, payload);
      } else {
        await api.post("/projects", payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save project.");
    }
  }

  function startEdit(project: Project) {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl,
      link: project.link ?? "",
      order: project.order,
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    load();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="h-fit space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
      >
        <h2 className="font-display font-semibold text-white">{editingId ? "Edit project" : "New project"}</h2>
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={fieldClass}
        />
        <textarea
          required
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={fieldClass}
        />
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Preview" className="h-12 w-12 rounded-lg object-cover border border-white/10" />
            )}
            <label className="flex-1 cursor-pointer rounded-xl border border-dashed border-white/15 px-3 py-2.5 text-center text-sm text-white/60 transition-colors hover:border-accent-light/60 hover:text-white">
              {uploading ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" />
            </label>
          </div>
          <input
            required
            placeholder="Image URL (e.g. /images/studio.png)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className={fieldClass}
          />
        </div>
        <input
          placeholder="Link (optional)"
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          className={fieldClass}
        />
        <input
          type="number"
          placeholder="Order"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          className={fieldClass}
        />
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(109,94,252,0.7)] transition-all hover:-translate-y-0.5 hover:bg-accent-light"
          >
            {editingId ? "Save changes" : "Add project"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/80 transition-colors hover:border-white/20 hover:bg-white/5"
            >
              Cancel
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      <div className="space-y-3">
        {loading && <p className="text-white/50">Loading…</p>}
        {!loading && projects.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">
            No projects yet — add your first one.
          </div>
        )}
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-white/20"
          >
            <img src={project.imageUrl} alt={project.title} className="h-14 w-14 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{project.title}</p>
              <p className="truncate text-xs text-white/50">{project.description}</p>
            </div>
            <button onClick={() => startEdit(project)} className="text-sm text-accent-light transition-colors hover:text-white">
              Edit
            </button>
            <button onClick={() => handleDelete(project.id)} className="text-sm text-red-400 transition-colors hover:text-red-300">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-white placeholder-white/35 transition-colors focus:outline-none focus:border-accent-light/60 focus:ring-2 focus:ring-accent/30";

function MessagesPanel() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get<ContactMessage[]>("/contact")
      .then(setMessages)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function markRead(id: string) {
    await api.patch(`/contact/${id}/read`);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    await api.delete(`/contact/${id}`);
    load();
  }

  if (loading) return <p className="text-white/50">Loading…</p>;
  if (messages.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">
        No messages yet.
      </div>
    );

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`rounded-xl border p-4 transition-colors ${
            message.read ? "border-white/10 bg-white/[0.04]" : "border-accent-light/30 bg-accent/[0.06]"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-white">
                {message.name} <span className="font-normal text-white/50">&lt;{message.email}&gt;</span>
                {!message.read && (
                  <span className="ml-2 rounded-full bg-accent-light/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-light">
                    New
                  </span>
                )}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-white/70">{message.message}</p>
              <p className="mt-2 text-xs text-white/40">{new Date(message.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex shrink-0 gap-3">
              {!message.read && (
                <button onClick={() => markRead(message.id)} className="text-sm text-accent-light transition-colors hover:text-white">
                  Mark read
                </button>
              )}
              <button onClick={() => remove(message.id)} className="text-sm text-red-400 transition-colors hover:text-red-300">
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const contentFields: { key: keyof SiteContent; label: string; multiline?: boolean }[] = [
  { key: "heroEyebrow", label: "Hero eyebrow" },
  { key: "heroHeading", label: "Hero heading" },
  { key: "heroSubheading", label: "Hero subheading", multiline: true },
  { key: "aboutHeading", label: "About heading" },
  { key: "aboutSubheading", label: "About subheading", multiline: true },
];

function ContentPanel() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<SiteContent>("/content")
      .then(setContent)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const updated = await api.put<SiteContent>("/content", content);
      setContent(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save content.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-white/50">Loading…</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
    >
      <h2 className="font-display font-semibold text-white">Homepage content</h2>
      <p className="text-sm text-white/50">
        Edit the hero and about text shown on the public homepage. Changes appear immediately.
      </p>

      {contentFields.map((field) => (
        <label key={field.key} className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-white/40">{field.label}</span>
          {field.multiline ? (
            <textarea
              rows={3}
              value={content[field.key]}
              onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
              className={fieldClass}
            />
          ) : (
            <input
              value={content[field.key]}
              onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
              className={fieldClass}
            />
          )}
        </label>
      ))}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(109,94,252,0.7)] transition-all hover:-translate-y-0.5 hover:bg-accent-light disabled:pointer-events-none disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm text-emerald-400">Saved.</span>}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
