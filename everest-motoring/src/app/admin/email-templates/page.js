import { render } from "@react-email/components";
import TemplateViewer from "./TemplateViewer";

import WelcomeEmail from "@/emails/WelcomeEmail";
import { SystemNotificationEmail } from "@/emails/SystemNotification";
import { OneMonthFollowupEmail } from "@/emails/1MonthFollowup";
import { ThreeYearTradeInEmail } from "@/emails/3YearTradeIn";
import { AffiliateMediaKit } from "@/emails/AffiliateMediaKit";
import { OneYearEmail } from "@/emails/OneYearEmail";
import { NewsletterEmail } from "@/emails/Newsletter";
import { PostSaleReviewEmail } from "@/emails/PostSaleReview";

export const metadata = {
    title: "Email Templates | Everest Admin",
};

// Each template renders with its built-in default props, which already contain
// representative sample data — so the gallery shows exactly what gets sent.
const TEMPLATES = [
    {
        key: "welcome",
        name: "Welcome",
        description: "Sent to a new client when they register an account.",
        element: <WelcomeEmail />,
    },
    {
        key: "system-notification",
        name: "System Notification",
        description: "Internal staff alert for new leads, trade-in requests, and other admin events.",
        element: <SystemNotificationEmail />,
    },
    {
        key: "affiliate-media-kit",
        name: "Affiliate Media Kit",
        description: "Sent to affiliates when a new vehicle is published, with their tracked link.",
        element: <AffiliateMediaKit />,
    },
    {
        key: "newsletter",
        name: "Monthly Newsletter",
        description: "Monthly digest featuring a hero vehicle and new arrivals.",
        element: <NewsletterEmail />,
    },
    {
        key: "post-sale-review",
        name: "Post-Sale Review Request",
        description: "Sent after a sale to ask the buyer for a Google review.",
        element: <PostSaleReviewEmail />,
    },
    {
        key: "one-month-followup",
        name: "1-Month Follow-Up",
        description: "Check-in sent roughly one month after a purchase.",
        element: <OneMonthFollowupEmail />,
    },
    {
        key: "three-year-tradein",
        name: "3-Year Trade-In Nudge",
        description: "Upgrade prompt sent ~3 years after purchase with an estimated trade-in value.",
        element: <ThreeYearTradeInEmail />,
    },
    {
        key: "one-year",
        name: "1-Year Anniversary",
        description: "Sent one year after purchase — congratulates the client and offers a free car wash.",
        element: <OneYearEmail />,
    },
];

export default async function EmailTemplatesPage() {
    const templates = await Promise.all(
        TEMPLATES.map(async ({ element, ...meta }) => ({
            ...meta,
            html: await render(element),
        }))
    );

    return (
        <div className="flex-1 w-full px-6 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        Email Templates
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Preview of every transactional and marketing email the platform sends. Shown
                        with sample data.
                    </p>
                </div>
                <TemplateViewer templates={templates} />
            </div>
        </div>
    );
}
