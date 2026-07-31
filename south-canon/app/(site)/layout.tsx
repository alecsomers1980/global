import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

/**
 * Chrome for the public site. Routes that must render without it — /coming-soon and /admin —
 * live outside this group, so nothing has to detect its own path at runtime. That matters
 * because middleware rewrites the gated site to /coming-soon, and a rewrite leaves
 * usePathname() reporting the original URL, which silently defeats any pathname check.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
