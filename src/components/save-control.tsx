"use client";
import { useState, useTransition } from "react";
import { toggleItem } from "@/lib/actions/reader";
export function SaveControl({
  kind,
  type,
  id,
  active: initial,
}: {
  kind: "save" | "follow";
  type: string;
  id: string;
  active: boolean;
}) {
  const [active, setActive] = useState(initial);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <div>
      <button
        className="button secondary"
        aria-pressed={active}
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError("");
            try {
              const r = await toggleItem(kind, type, id);
              if (r.error) setError(r.error);
              else setActive(!!r.active);
            } catch {
              setError("Couldn’t update your log. Try again.");
            }
          })
        }
      >
        {pending
          ? "Updating…"
          : kind === "save"
            ? active
              ? "Saved ✓"
              : "Save"
            : active
              ? "Following ✓"
              : "Follow"}
      </button>
      {error && (
        <p role="alert" className="text-danger text-sm mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
