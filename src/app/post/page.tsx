"use client";

import { useState, useTransition } from "react";
import { createPost } from "@/lib/actions/posts";

const projects = ["Nightwave", "Level Up", "Iron Mario", "Clock Out Alive", "Infinite Colour Craft"];

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [project, setProject] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.set("title", title);
    formData.set("excerpt", excerpt);
    formData.set("content", content);
    formData.set("project", project);
    formData.set("tags", tags.join(","));
    formData.set("status", status);

    startTransition(async () => {
      const result = await createPost(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono text-xs text-muted tracking-widest">NEW TRANSMISSION</h1>
        <span className="font-mono text-xs text-muted">{isPending ? "SAVING..." : "READY"}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block font-mono text-xs text-muted mb-2">TITLE</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-surface border border-border px-4 py-3 text-foreground focus:outline-none focus:border-accent transition-colors"
            placeholder="Mission log title..."
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block font-mono text-xs text-muted mb-2">EXCERPT</label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            required
            className="w-full bg-surface border border-border px-4 py-3 text-foreground focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="Short description..."
          />
        </div>

        <div>
          <label htmlFor="project" className="block font-mono text-xs text-muted mb-2">PROJECT</label>
          <select
            id="project"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            required
            className="w-full bg-surface border border-border px-4 py-3 text-foreground focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">Select project...</option>
            {projects.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-mono text-xs text-muted mb-2">TAGS</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 bg-surface-raised border border-border px-2 py-1 font-mono text-xs">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-muted hover:text-danger" aria-label={`Remove tag ${tag}`}>
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1 bg-surface border border-border px-4 py-2 text-foreground font-mono text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="Add tag..."
            />
            <button type="button" onClick={addTag} className="border border-border px-4 py-2 font-mono text-sm hover:border-accent transition-colors">
              +
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block font-mono text-xs text-muted mb-2">BODY (MARKDOWN)</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            required
            className="w-full bg-surface border border-border px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-accent transition-colors resize-y"
            placeholder="Write your mission log in Markdown..."
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-muted mb-2">STATUS</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" value="draft" checked={status === "draft"} onChange={() => setStatus("draft")} className="accent-accent" />
              <span className="font-mono text-sm">SAVE DRAFT</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" value="published" checked={status === "published"} onChange={() => setStatus("published")} className="accent-accent" />
              <span className="font-mono text-sm">PUBLISH</span>
            </label>
          </div>
        </div>

        {error && <p className="font-mono text-xs text-danger">{error}</p>}

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="bg-accent text-background font-mono text-sm font-semibold px-6 py-3 hover:bg-accent-dim transition-colors disabled:opacity-50"
          >
            {isPending ? "SAVING..." : status === "published" ? "PUBLISH" : "SAVE DRAFT"}
          </button>
        </div>
      </form>
    </div>
  );
}
