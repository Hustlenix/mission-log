"use client";

import { useState, useTransition, use } from "react";
import { updatePost, deletePost } from "@/lib/actions/posts";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [title, setTitle] = useState("Nightwave finally plays audio");
  const [content, setContent] = useState("After three weeks of debugging...");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSave() {
    setError("");
    const formData = new FormData();
    formData.set("title", title);
    formData.set("content", content);
    formData.set("status", status);

    startTransition(async () => {
      const result = await updatePost(id, formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  async function handleDelete() {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    startTransition(async () => {
      await deletePost(id);
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono text-xs text-muted tracking-widest">EDIT TRANSMISSION</h1>
        <span className="font-mono text-xs text-muted">{isPending ? "SAVING..." : "READY"}</span>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block font-mono text-xs text-muted mb-2">TITLE</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface border border-border px-4 py-3 text-foreground focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="content" className="block font-mono text-xs text-muted mb-2">BODY (MARKDOWN)</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full bg-surface border border-border px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-accent transition-colors resize-y"
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-muted mb-2">STATUS</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" value="draft" checked={status === "draft"} onChange={() => setStatus("draft")} className="accent-accent" />
              <span className="font-mono text-sm">DRAFT</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" value="published" checked={status === "published"} onChange={() => setStatus("published")} className="accent-accent" />
              <span className="font-mono text-sm">PUBLISHED</span>
            </label>
          </div>
        </div>

        {error && <p className="font-mono text-xs text-danger">{error}</p>}

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="bg-accent text-background font-mono text-sm font-semibold px-6 py-3 hover:bg-accent-dim transition-colors disabled:opacity-50"
          >
            {isPending ? "SAVING..." : "SAVE CHANGES"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={`border font-mono text-sm px-6 py-3 transition-colors ${
              showDeleteConfirm
                ? "border-danger text-danger hover:bg-danger hover:text-background"
                : "border-border text-muted hover:border-danger hover:text-danger"
            }`}
          >
            {showDeleteConfirm ? "CONFIRM DELETE" : "DELETE"}
          </button>
        </div>
      </div>
    </div>
  );
}
