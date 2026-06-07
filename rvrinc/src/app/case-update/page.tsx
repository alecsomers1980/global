import { redirect } from "next/navigation";

// Redirect /case-update to home (case lookup available via "View Case Status" button)
export default function CaseUpdateRedirect() {
    redirect("/");
}
