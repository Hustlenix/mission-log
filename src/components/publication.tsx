import Image from "next/image";
import Link from "next/link";
import { shortDate, readingTime, topicName } from "@/lib/catalog";

export function PageTitle({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="page-title">
      <p className="eyebrow signal">{label}</p>
      <h1>{title}</h1>
      {description && <p className="dek">{description}</p>}
    </header>
  );
}
export function SectionHeading({
  title,
  href,
  action = "View all",
}: {
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {href && (
        <Link className="text-action" href={href}>
          {action} ↗
        </Link>
      )}
    </div>
  );
}
export function Figure({
  src,
  alt,
  credit,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  credit?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={`figure ${className}`}>
      <div className="image-frame">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 70vw"
          priority={priority}
          style={{ objectFit: "cover" }}
        />
      </div>
      {credit && <figcaption>{credit}</figcaption>}
    </figure>
  );
}
type Story = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  topicIds?: string[];
  contentType?: string;
  publishedAt?: Date;
  coverImage?: string;
  coverAlt?: string;
  imageCredit?: string;
};
export function StoryRow({ post, number }: { post: Story; number?: number }) {
  return (
    <article className="story-row">
      {number !== undefined && (
        <span className="row-number">
          {String(number + 1).padStart(2, "0")}
        </span>
      )}
      <div>
        <p className="eyebrow signal">
          {topicName(post.topicIds?.[0] || "mission-log")} /{" "}
          {post.contentType || "journal"}
        </p>
        <h3>
          <Link href={`/articles/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="muted">{post.excerpt}</p>
        <p className="metadata">
          {shortDate(post.publishedAt)} · {readingTime(post.content)} min read
        </p>
      </div>
      {post.coverImage && (
        <Link
          href={`/articles/${post.slug}`}
          className="story-thumb"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={post.coverImage}
            alt=""
            fill
            sizes="160px"
            style={{ objectFit: "cover" }}
          />
        </Link>
      )}
    </article>
  );
}
export function Unavailable({
  name,
  children,
}: {
  name: string;
  children?: React.ReactNode;
}) {
  return (
    <div role="status" className="empty-state">
      <h2>{name} is temporarily unavailable.</h2>
      <p className="muted">
        The source couldn’t be reached. Other stories and tools are still
        available.
      </p>
      {children || (
        <Link href="/latest" className="text-action">
          Read the publication ↗
        </Link>
      )}
    </div>
  );
}
