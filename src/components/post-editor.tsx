"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { updatePost, deletePost } from "@/lib/actions/posts";

export interface EditablePost { id: string; title: string; excerpt: string; content: string; project: string; tags: string[]; status: "draft" | "published" }

export function PostEditor({ post }: { post: EditablePost }) {
  const router = useRouter();
  const [fields, setFields] = useState({ ...post, tags: post.tags.join(", ") });
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  function save(event: React.FormEvent) {
    event.preventDefault(); setError("");
    const data = new FormData();
    for (const [key,value] of Object.entries(fields)) data.set(key,value);
    startTransition(async () => {
      const result = await updatePost(post.id, data);
      if (result.error) setError(result.error);
      else { router.push("/dashboard"); router.refresh(); }
    });
  }
  return <div className="mx-auto max-w-3xl px-6 py-12">
    <p className="eyebrow text-accent mb-3">Mission control</p><h1 className="font-display text-4xl font-bold mb-8">Edit your transmission.</h1>
    <form onSubmit={save} className="mission-card space-y-5">
      {(["title", "excerpt", "project", "tags"] as const).map(key => <div key={key}><label htmlFor={key} className="eyebrow block mb-2">{key}</label><input id={key} value={fields[key]} required={key !== "tags"} maxLength={key === "title" ? 200 : key === "excerpt" ? 500 : undefined} onChange={e => setFields({...fields,[key]:e.target.value})} className="w-full border bg-background px-4 py-3" /></div>)}
      <div className="flex justify-between items-center"><label htmlFor="content" className="eyebrow">Body · Markdown</label><button type="button" onClick={() => setPreview(!preview)} className="text-accent font-bold">{preview ? "Edit text" : "Preview"}</button></div>
      {preview ? <div className="prose-mission border rounded-xl p-4"><ReactMarkdown remarkPlugins={[remarkGfm]}>{fields.content}</ReactMarkdown></div> : <textarea id="content" value={fields.content} required rows={14} onChange={e => setFields({...fields,content:e.target.value})} className="w-full border bg-background px-4 py-3 font-mono text-sm" />}
      <label className="block"><span className="eyebrow block mb-2">Status</span><select value={fields.status} onChange={e => setFields({...fields,status:e.target.value as EditablePost["status"]})} className="border p-3"><option value="draft">Draft · private</option><option value="published">Published · public</option></select></label>
      {error && <p role="alert" className="text-danger">{error}</p>}
      <div className="flex flex-wrap gap-5"><button disabled={pending} className="launch-button">{pending ? "Saving…" : "Save changes"}</button><button type="button" disabled={pending} className="text-danger underline" onClick={() => { if(!confirmDelete) {setConfirmDelete(true); return;} startTransition(async () => {const result=await deletePost(post.id); if(result?.error) setError(result.error);}); }}>{confirmDelete ? "Confirm permanent delete" : "Delete log"}</button>{confirmDelete && <button type="button" onClick={()=>setConfirmDelete(false)}>Cancel delete</button>}</div>
    </form>
  </div>;
}
