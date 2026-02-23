import { redirect } from "next/navigation";

// Redirect /case-update to the portal login page
// This gives a client-friendly URL while using existing auth infrastructure
export default function CaseUpdateRedirect() {
    redirect("/portal");
}
