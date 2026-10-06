"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createPost, updatePost, deletePost } from "@/lib/actions/posts";
export type EditablePost = {
  id?: string;
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  content: string;
  project: string;
  tags: string;
  topicIds: string;
  contentType: string;
  coverImage: string;
  coverAlt: string;
  imageCredit: string;
  sources: string;
  editorialNote: string;
  seoTitle: string;
  seoDescription: string;
  status: "draft" | "review" | "scheduled" | "published";
  scheduledAt: string;
  featured: boolean;
};
const blank: EditablePost = {
  title: "",
  slug: "",
  subtitle: "",
  excerpt: "",
  content: "",
  project: "Space publication",
  tags: "",
  topicIds: "",
  contentType: "explainer",
  coverImage: "",
  coverAlt: "",
  imageCredit: "",
  sources: "",
  editorialNote: "",
  seoTitle: "",
  seoDescription: "",
  status: "draft",
  scheduledAt: "",
  featured: false,
};
export function PostEditor({ post }: { post?: EditablePost }) {
  const router = useRouter();
  const [f, set] = useState({ ...blank, ...post });
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const data = new FormData();
    for (const [k, v] of Object.entries(f)) data.set(k, String(v));
    start(async () => {
      try {
        const r = f.id ? await updatePost(f.id, data) : await createPost(data);
        if (r.error) setError(r.error);
        else {
          router.push("/studio");
          router.refresh();
        }
      } catch {
        setError("Couldn’t save. Your text is still here; try again.");
      }
    });
  }
  const input = (key: keyof EditablePost, label: string, required = false) => (
    <label key={key} className="editor-field">
      <span>{label}</span>
      <input
        name={key}
        value={String(f[key] || "")}
        required={required}
        maxLength={
          key === "excerpt"
            ? 500
            : key === "title" || key === "slug" || key === "seoTitle"
              ? 200
              : 1000
        }
        onChange={(e) => set({ ...f, [key]: e.target.value })}
      />
    </label>
  );
  return (
    <div className="shell">
      <div className="page-title">
        <p className="eyebrow signal">Mission Log / Editorial studio</p>
        <h1>{post ? "Edit article." : "New article."}</h1>
        <Link href="/studio" className="text-action">
          Back to studio ↗
        </Link>
      </div>
      <form onSubmit={save} className="editor-layout">
        <div>
          {input("title", "Title", true)}
          {input("slug", "Slug (generated from title when blank)")}
          {input("subtitle", "Subtitle / dek")}
          {input("excerpt", "Summary", true)}
          <div className="actions">
            <label className="eyebrow" htmlFor="content">
              Body / Markdown
            </label>
            <button
              type="button"
              className="text-action"
              onClick={() => setPreview(!preview)}
            >
              {preview ? "Edit text" : "Preview"}
            </button>
          </div>
          {preview ? (
            <div className="prose-mission editor-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {f.content}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              id="content"
              name="content"
              className="w-full font-mono text-sm"
              rows={24}
              required
              maxLength={100000}
              value={f.content}
              onChange={(e) => set({ ...f, content: e.target.value })}
            />
          )}
          <label className="editor-field mt-6">
            <span>Sources — one Title | https://URL per line</span>
            <textarea
              name="sources"
              rows={5}
              value={f.sources}
              onChange={(e) => set({ ...f, sources: e.target.value })}
            />
          </label>
          {input(
            "editorialNote",
            "Editorial context / AI assistance disclosure",
          )}
        </div>
        <aside>
          {input("project", "Journal project / section", true)}
          <label className="editor-field">
            <span>Content type</span>
            <select
              name="contentType"
              value={f.contentType}
              onChange={(e) => set({ ...f, contentType: e.target.value })}
            >
              {[
                "story",
                "news",
                "explainer",
                "deep-dive",
                "daily-brief",
                "guide",
                "timeline",
                "profile",
                "list",
                "mission-log",
                "data-story",
                "opinion",
                "interactive",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          {input("topicIds", "Topics (comma-separated slugs)")}
          <p className="metadata">
            iss, asteroids, space-weather, earth, moon, mars, james-webb
          </p>
          {input("tags", "Tags (comma-separated)")}
          {input("coverImage", "NASA image URL")}
          {input("coverAlt", "Image alt text")}
          {input("imageCredit", "Image credit & context")}
          {input("seoTitle", "SEO title")}
          {input("seoDescription", "SEO description")}
          <label className="editor-field">
            <span>Status</span>
            <select
              name="status"
              value={f.status}
              onChange={(e) =>
                set({ ...f, status: e.target.value as EditablePost["status"] })
              }
            >
              <option value="draft">Draft — private</option>
              <option value="review">Review — editorial only</option>
              <option value="scheduled">Scheduled — editor required</option>
              <option value="published">Published — editor required</option>
            </select>
          </label>
          <label className="editor-field">
            <span>Scheduled publication time (UTC)</span>
            <input
              name="scheduledAt"
              type="datetime-local"
              value={f.scheduledAt}
              onChange={(e) => set({ ...f, scheduledAt: e.target.value })}
            />
          </label>
          <label className="flex gap-3 my-5">
            <input
              type="checkbox"
              checked={f.featured}
              onChange={(e) => set({ ...f, featured: e.target.checked })}
            />
            Featured story
          </label>
          <p className="metadata">
            Scheduling controls visibility at request time. This release does
            not send scheduled notifications.
          </p>
          {error && (
            <p role="alert" className="text-danger my-5">
              {error}
            </p>
          )}
          <button disabled={pending} className="button w-full">
            {pending ? "Saving…" : "Save article"}
          </button>
          {f.id && (
            <div className="actions">
              <button
                type="button"
                disabled={pending}
                className="text-action text-danger"
                onClick={() => {
                  if (!confirm) {
                    setConfirm(true);
                    return;
                  }
                  start(async () => {
                    const r = await deletePost(f.id!);
                    if (r.error) setError(r.error);
                    else {
                      router.push("/studio");
                      router.refresh();
                    }
                  });
                }}
              >
                {confirm ? "Confirm permanent delete" : "Delete article"}
              </button>
              {confirm && (
                <button
                  type="button"
                  onClick={() => setConfirm(false)}
                  className="text-action"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </aside>
      </form>
    </div>
  );
}
