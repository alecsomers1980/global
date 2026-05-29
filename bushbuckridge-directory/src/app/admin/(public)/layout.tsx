export default function PublicAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // No auth check — this route group exists so /admin/login is reachable
    // without triggering requireAdmin() in the protected layout
    return <>{children}</>
}
