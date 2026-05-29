export default function PublicAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // No auth check — this route group is for the login page
    return <>{children}</>
}
