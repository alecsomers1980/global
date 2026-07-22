import { getPracticeArea } from "@/lib/practice-areas";
import PracticeAreaTemplate from "@/components/PracticeAreaTemplate";
import { notFound } from "next/navigation";

export default function Page() {
  const area = getPracticeArea("notary", "notary");
  if (!area) notFound();
  return <PracticeAreaTemplate area={area} />;
}
