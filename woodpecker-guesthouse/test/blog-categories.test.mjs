import { test } from "node:test";
import assert from "node:assert/strict";
import { BLOG_CATEGORIES, pickNextCategory } from "../src/lib/blog/categories.ts";

test("with no recent posts, returns one of the known categories", () => {
  const picked = pickNextCategory([]);
  assert.ok(BLOG_CATEGORIES.includes(picked));
});

test("picks a category that hasn't been used yet over ones that have", () => {
  const allButOne = BLOG_CATEGORIES.slice(1);
  const recent = allButOne.flatMap((c) => [c, c, c]); // heavily used
  const picked = pickNextCategory(recent);
  assert.equal(picked, BLOG_CATEGORIES[0]);
});

test("unknown categories in history are ignored, not counted", () => {
  const picked = pickNextCategory(["Some Old Deleted Category"]);
  assert.ok(BLOG_CATEGORIES.includes(picked));
});