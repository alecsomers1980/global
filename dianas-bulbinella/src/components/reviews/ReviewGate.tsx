"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReviewForm from "./ReviewForm";

type Gate =
  | { state: "loading" }
  | { state: "can-review" }
  | { state: "blocked"; reason: "not-signed-in" | "not-a-buyer" | "already-reviewed" };

/** Decides whether to show the review form, client-side.
 *
 *  Eligibility depends on the signed-in user, but product pages are statically
 *  generated — so it's fetched here instead of on the server. Renders nothing
 *  while loading so the page doesn't flash a "you can't review" message at
 *  someone who actually can. */
export default function ReviewGate({ slug }: { slug: string }) {
  const [gate, setGate] = useState<Gate>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/reviews/eligibility?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setGate(d.canReview ? { state: "can-review" } : { state: "blocked", reason: d.reason });
      })
      .catch(() => {
        if (!cancelled) setGate({ state: "blocked", reason: "not-a-buyer" });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (gate.state === "loading") return null;

  if (gate.state === "can-review") {
    return (
      <>
        <h3 className="font-serif text-xl mb-4">Write a review</h3>
        <ReviewForm slug={slug} />
      </>
    );
  }

  return (
    <p className="text-sm text-muted">
      {gate.reason === "not-signed-in" && (
        <>
          Please{" "}
          <Link href="/account/login" className="text-forest underline">
            sign in
          </Link>{" "}
          to leave a review.
        </>
      )}
      {gate.reason === "not-a-buyer" &&
        "Only customers who purchased this product can review it."}
      {gate.reason === "already-reviewed" &&
        "Thanks — you've already reviewed this product."}
    </p>
  );
}
