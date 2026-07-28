import Link from 'next/link'
import { Container } from '@/components/ui/Container'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-rule bg-ink text-paper">
        <Container className="flex gap-6 py-3 text-sm">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/plays">Plays</Link>
          <Link href="/admin/playwrights">Playwrights</Link>
          <Link href="/" className="ml-auto">View site</Link>
        </Container>
      </div>
      {children}
    </div>
  )
}