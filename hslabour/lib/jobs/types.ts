export type Job = {
  ref: string;
  slug: string;
  title: string;
  description: string;
  city: string;
  province?: string;
  category: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "TEMPORARY";
  salary?: { min?: number; max?: number; period?: "HOUR" | "MONTH" | "YEAR" };
  postedAt: string;
  closesAt?: string;
  applyUrl: string;
};