export default function StaffLoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sent = searchParams.sent;
  const error = searchParams.error;
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="min-h-screen flex items-center justify-center bg-mv-navy font-body">
      <div className="w-full max-w-md px-6 py-12 rounded-[3px] bg-mv-navy border border-mv-blue/30 shadow-2xl">
        <h1 className="text-3xl font-heading text-mv-cream mb-8 text-center">
          Staff Sign-in
        </h1>

        {sent && (
          <div className="mb-6 rounded-[3px] bg-mv-mint/20 p-4 text-mv-cream">
            Check your email for a sign-in link (valid 15 minutes).
          </div>
        )}

        {error === "expired" && (
          <div className="mb-6 rounded-[3px] bg-red-100/20 p-4 text-mv-cream">
            That link has expired, please request a new one.
          </div>
        )}

        {error === "denied" && (
          <div className="mb-6 rounded-[3px] bg-red-100/20 p-4 text-mv-cream">
            That email isn’t authorised. Contact the festival office.
          </div>
        )}

        <form action="/api/auth/request-link" method="post" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-mv-cream mb-1">
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full rounded-[3px] border border-mv-blue/50 bg-white/10 px-3 py-2 text-mv-cream placeholder-mv-cream/50 focus:border-mv-mint focus:outline-none focus:ring-1 focus:ring-mv-mint"
              placeholder="you@maynardville.org"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-[3px] bg-mv-blue px-4 py-2 font-semibold text-white hover:bg-mv-blue/90 transition-colors"
          >
            Email me a sign-in link
          </button>
        </form>

        <hr className="my-8 border-t border-mv-blue/40" />

        {isDev && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-mv-cream/60 mb-3">
              Dev quick-login
            </p>
            <div className="space-y-2">
              <a
                href="/api/auth/dev-login?role=Admin&name=Jaco"
                className="block rounded-[3px] border border-mv-mint/40 px-3 py-2 text-sm text-mv-cream hover:bg-mv-mint/10"
              >
                Continue as Jaco — Admin
              </a>
              <a
                href="/api/auth/dev-login?role=Box%20Office&name=Jeff"
                className="block rounded-[3px] border border-mv-mint/40 px-3 py-2 text-sm text-mv-cream hover:bg-mv-mint/10"
              >
                Continue as Jeff — Box Office
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}