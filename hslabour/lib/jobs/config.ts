export type JobsSource = "iframe" | "feed";

export const JOBS_SOURCE: JobsSource =
  process.env.JOBS_SOURCE === "feed" ? "feed" : "iframe";