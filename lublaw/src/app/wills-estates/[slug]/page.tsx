import { notFound } from "next/navigation";
import { getPracticeArea } from "@/lib/practice-areas";
import PracticeAreaTemplate from "@/components/PracticeAreaTemplate";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = getPracticeArea("wills-estates", slug);
  if (!area) notFound();
  return <PracticeAreaTemplate area={area} />;
}
