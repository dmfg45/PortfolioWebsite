import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api, ApiError } from "../../api/client";
import type { ContactMessage, Project } from "../../types";

type Tab = "projects" | "messages";

export function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>("projects");

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Log out
          </button>
        </header>

        <div className="mb-8 flex gap-2 border-b border-white/10">
          {(["projects", "messages"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t ? "border-accent text-white" : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "projects" ? <ProjectsPanel /> : <MessagesPanel />}
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
      <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 h-fit">
        <h2 className="font-display font-semibold text-white">{editingId ? "Edit project" : "New project"}</h2>
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40"
        />
        <textarea
          required
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40"
        />
        <input
          required
          placeholder="Image URL (e.g. /images/studio.png)"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40"
        />
        <input
          placeholder="Link (optional)"
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40"
        />
        <input
          type="number"
          placeholder="Order"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40"
        />
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light">
            {editingId ? "Save changes" : "Add project"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80"
            >
              Cancel
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      <div className="space-y-3">
        {loading && <p className="text-white/50">Loading…</p>}
        {!loading && projects.length === 0 && <p className="text-white/50">No projects yet.</p>}
        {projects.map((project) => (
          <div key={project.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <img src={project.imageUrl} alt={project.title} className="h-14 w-14 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{project.title}</p>
              <p className="text-xs text-white/50 truncate">{project.description}</p>
            </div>
            <button onClick={() => startEdit(project)} className="text-sm text-accent-light hover:text-white">
              Edit
            </button>
            <button onClick={() => handleDelete(project.id)} className="text-sm text-red-400 hover:text-red-300">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  if (messages.length === 0) return <p className="text-white/50">No messages yet.</p>;

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div key={message.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-white">
                {message.name} <span className="text-white/50 font-normal">&lt;{message.email}&gt;</span>
              </p>
              <p className="mt-1 text-sm text-white/70 whitespace-pre-wrap">{message.message}</p>
              <p className="mt-2 text-xs text-white/40">{new Date(message.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex shrink-0 gap-3">
              {!message.read && (
                <button onClick={() => markRead(message.id)} className="text-sm text-accent-light hover:text-white">
                  Mark read
                </button>
              )}
              <button onClick={() => remove(message.id)} className="text-sm text-red-400 hover:text-red-300">
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
