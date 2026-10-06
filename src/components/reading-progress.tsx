"use client";
import { useEffect } from "react";
import { recordReading } from "@/lib/actions/reader";
export function ReadingProgress({ slug }: { slug: string }) {
  useEffect(() => {
    let highest = 0;
    let lastSent = -1;
    const measure = () => {
      const article = document.querySelector(".article-body");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(100, (100 * (window.innerHeight - rect.top)) / rect.height),
      );
      highest = Math.max(highest, progress);
    };
    const send = () => {
      measure();
      if (highest > lastSent + 5) {
        lastSent = highest;
        void recordReading(slug, highest).catch(() => {});
      }
    };
    const timer = window.setInterval(send, 10000);
    window.addEventListener("scroll", measure, { passive: true });
    send();
    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", measure);
    };
  }, [slug]);
  return null;
}
