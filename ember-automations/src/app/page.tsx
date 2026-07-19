export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="glass ember-glow p-10 max-w-md text-center">
        <h1
          className="text-3xl font-extrabold"
          style={{ backgroundImage: "var(--ember-gradient)", WebkitBackgroundClip: "text", color: "transparent" }}
        >
          Ember Automations
        </h1>
        <p className="mt-3 text-[#6b6b8a]">Client intake. Use the link we sent you, or sign in to admin.</p>
      </div>
    </main>
  );
}
