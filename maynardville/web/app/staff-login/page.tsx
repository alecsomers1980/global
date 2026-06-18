import Logo from "@/components/brand/Logo";
import { ChevronRight } from "lucide-react";

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string };
}) {
  const isDev =
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_DEV_LOGIN === "1";
  const sent = searchParams.sent === "1";
  const error = searchParams.error;

  return (
    <div className="min-h-screen bg-mv-navy flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md bg-mv-navy border border-mv-cream/15 shadow-2xl rounded p-8">
        <Logo className="h-10 w-auto mx-auto mb-6" href="/" />
        <h1 className="text-2xl font-heading text-mv-cream text-center mb-6">
          Staff sign-in
        </h1>

        {sent && (
          <div className="mb-6 bg-mv-mint/20 text-mv-cream p-4 rounded">
            Magic link sent! Check your email.
          </div>
        )}
        {error === "expired" && (
          <div className="mb-6 bg-red-400/20 text-mv-cream p-4 rounded">
            Your magic link has expired. Please request a new one.
          </div>
        )}
        {error === "denied" && (
          <div className="mb-6 bg-red-400/20 text-mv-cream p-4 rounded">
            Access denied. You are not authorised.
          </div>
        )}
        {error && error !== "expired" && error !== "denied" && (
          <div className="mb-6 bg-red-400/20 text-mv-cream p-4 rounded">
            An error occurred. Please try again.
          </div>
        )}

        <form action="/api/auth/request-link" method="post" className="space-y-4">
          <label className="block text-mv-cream text-sm font-medium">
            Email address
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@maynardville.co.za"
            className="w-full px-4 py-3 bg-white/5 border border-mv-cream/20 rounded text-mv-cream placeholder:text-mv-cream/40 focus:outline-none focus:ring-2 focus:ring-mv-mint focus:border-transparent"
          />
          <button
            type="submit"
            className="w-full py-3 px-4 bg-mv-mint text-mv-navy font-semibold rounded hover:brightness-110 transition"
          >
            Send magic link
          </button>
        </form>

        {isDev && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-mv-cream/15" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-mv-navy text-mv-cream/50 text-xs uppercase tracking-wider">
                  Dev quick-login
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <a
                href="/api/auth/dev-login?role=Admin&name=Jaco"
                className="flex items-center justify-between px-4 py-3 border border-mv-cream/20 rounded text-mv-cream hover:bg-mv-cream/10 transition"
              >
                <span>Sign in as Jaco (Admin)</span>
                <ChevronRight className="w-4 h-4 text-mv-cream/50" />
              </a>
              <a
                href="/api/auth/dev-login?role=Box%20Office&name=Jeff"
                className="flex items-center justify-between px-4 py-3 border border-mv-cream/20 rounded text-mv-cream hover:bg-mv-cream/10 transition"
              >
                <span>Sign in as Jeff (Box Office)</span>
                <ChevronRight className="w-4 h-4 text-mv-cream/50" />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}