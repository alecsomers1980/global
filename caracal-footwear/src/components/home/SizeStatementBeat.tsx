import Reveal from '@/components/motion/Reveal';

export default function SizeStatementBeat() {
  return (
    <section className="bg-canvas py-24 text-center">
      <Reveal>
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">No order too small</p>
          <h2 className="display mt-2 text-5xl md:text-7xl text-text">Sizes 4 to 15.</h2>
          <p className="mt-5 text-muted">Ladies to mens, we make every size in every colour we stock.</p>
        </div>
      </Reveal>
    </section>
  );
}