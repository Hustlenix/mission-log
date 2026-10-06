"use server";
import { revalidatePath } from "next/cache";
import { Post } from "@/models/Post";
import { getSession, getRole } from "../session";
import { withinLimit } from "../rate-limit";
import { topics } from "../catalog";
import { safeUrl } from "../nasa/normalize";
const types = [
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
];
function value(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}
function parse(form: FormData) {
  const title = value(form, "title"),
    excerpt = value(form, "excerpt"),
    content = value(form, "content"),
    status = value(form, "status");
  const slug =
    value(form, "slug") ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const contentType = value(form, "contentType") || "mission-log";
  const schedule = value(form, "scheduledAt");
  const scheduledAt = schedule
    ? new Date(schedule.endsWith("Z") ? schedule : schedule + "Z")
    : undefined;
  const coverImage = value(form, "coverImage");
  const sources = value(form, "sources")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf("|");
      return {
        title: line.slice(0, i).trim().slice(0, 150),
        url: safeUrl(line.slice(i + 1).trim()),
      };
    });
  if (
    !title ||
    title.length > 200 ||
    !excerpt ||
    excerpt.length > 500 ||
    !content ||
    content.length > 100000 ||
    !slug ||
    slug.length > 200 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !["draft", "review", "scheduled", "published"].includes(status) ||
    !types.includes(contentType)
  )
    return { error: "Check required fields, slug and length limits." } as const;
  if (
    status === "scheduled" &&
    (!scheduledAt ||
      !Number.isFinite(+scheduledAt) ||
      +scheduledAt <= Date.now())
  )
    return { error: "Choose a future publication time in UTC." } as const;
  if (
    coverImage &&
    (!safeUrl(coverImage) ||
      ![
        "images-assets.nasa.gov",
        "assets.science.nasa.gov",
        "www.nasa.gov",
        "science.nasa.gov",
        "epic.gsfc.nasa.gov",
      ].includes(new URL(coverImage).hostname))
  )
    return {
      error: "Use an HTTPS image from a supported NASA source.",
    } as const;
  if (coverImage && (!value(form, "coverAlt") || !value(form, "imageCredit")))
    return { error: "Images need alt text and credit." } as const;
  if (sources.length > 20 || sources.some((s) => !s.title || !s.url))
    return { error: "Sources use Title | https://URL, one per line." } as const;
  return {
    data: {
      title,
      slug,
      excerpt,
      content,
      project: value(form, "project") || "Space publication",
      status: status as "draft" | "review" | "scheduled" | "published",
      contentType,
      tags: value(form, "tags")
        .split(",")
        .map((t) => t.trim().slice(0, 50))
        .filter(Boolean)
        .slice(0, 20),
      topicIds: value(form, "topicIds")
        .split(",")
        .map((t) => t.trim())
        .filter((t) => topics.some((x) => x.slug === t)),
      subtitle: value(form, "subtitle").slice(0, 500),
      coverImage,
      coverAlt: value(form, "coverAlt").slice(0, 500),
      imageCredit: value(form, "imageCredit").slice(0, 500),
      editorialNote: value(form, "editorialNote").slice(0, 1000),
      seoTitle: value(form, "seoTitle").slice(0, 200),
      seoDescription: value(form, "seoDescription").slice(0, 500),
      featured: form.get("featured") === "true",
      scheduledAt,
      sources,
    },
  };
}
async function editor() {
  const session = await getSession();
  if (!session) return null;
  const role = await getRole(session.user);
  return role !== "user" ? { session, role } : null;
}
function refresh(slug: string) {
  for (const path of [
    "/",
    "/latest",
    "/articles",
    "/blogs",
    "/archive",
    "/topics",
    "/learn",
    "/missions",
    "/studio",
    "/dashboard",
    `/articles/${slug}`,
    `/blogs/${slug}`,
  ])
    revalidatePath(path);
}
export async function createPost(form: FormData) {
  const a = await editor();
  if (!a) return { error: "You do not have author access." };
  if (!(await withinLimit(a.session.user.id, "editor", 20)))
    return { error: "Please wait before saving again." };
  const result = parse(form);
  if (result.error) return { error: result.error };
  const data = result.data!;
  if (a.role === "author" && ["published", "scheduled"].includes(data.status))
    return { error: "An editor must publish or schedule." };
  if (await Post.exists({ slug: data.slug }))
    return { error: "That slug is already used." };
  const p = await Post.create({
    ...data,
    authorId: a.session.user.id,
    publishedAt: data.status === "published" ? new Date() : data.scheduledAt,
  });
  refresh(p.slug);
  return { success: true, slug: p.slug };
}
export async function updatePost(id: string, form: FormData) {
  const a = await editor();
  if (!a || !/^[a-f0-9]{24}$/i.test(id)) return { error: "Access denied." };
  const p = await Post.findById(id);
  if (
    !p ||
    (a.role === "author" &&
      (p.authorId !== a.session.user.id ||
        ["published", "scheduled"].includes(p.status)))
  )
    return { error: "Access denied." };
  if (!(await withinLimit(a.session.user.id, "editor", 20)))
    return { error: "Please wait before saving again." };
  const result = parse(form);
  if (result.error) return { error: result.error };
  const data = result.data!;
  if (a.role === "author" && ["published", "scheduled"].includes(data.status))
    return { error: "An editor must publish or schedule." };
  if (await Post.exists({ slug: data.slug, _id: { $ne: id } }))
    return { error: "That slug is already used." };
  const old = p.slug;
  Object.assign(p, data);
  if (
    data.status === "published" &&
    (!p.publishedAt || +p.publishedAt > Date.now())
  )
    p.publishedAt = new Date();
  if (data.status === "scheduled") p.publishedAt = data.scheduledAt;
  await p.save();
  refresh(p.slug);
  refresh(old);
  return { success: true, slug: p.slug };
}
export async function deletePost(id: string) {
  const a = await editor();
  if (!a || !/^[a-f0-9]{24}$/i.test(id)) return { error: "Access denied." };
  const p = await Post.findById(id);
  if (
    !p ||
    (a.role === "author" &&
      (p.authorId !== a.session.user.id ||
        ["published", "scheduled"].includes(p.status)))
  )
    return { error: "Only an editor can delete published work." };
  await p.deleteOne();
  refresh(p.slug);
  return { success: true };
}
