export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero band */}
      <section className="bg-mv-navy text-mv-cream py-24 px-6 text-center">
        <h1 className="text-5xl font-heading font-bold tracking-tight">
          Maynardville Festival
        </h1>
        <p className="mt-4 text-lg text-mv-cream/90 max-w-xl mx-auto">
          Internal operations platform — manage performances, complimentary tickets, and more.
        </p>
      </section>
      {/* Placeholder for future features */}
      <section className="max-w-5xl mx-auto py-16 px-6 text-center text-mv-navy-muted">
        <p>Welcome to the Maynardville Ops Hub.</p>
      </section>
    </main>
  );
}