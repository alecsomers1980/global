import Reveal from "@/components/motion/Reveal";

export default function NewsletterCta() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <div className="glass-deep rounded-[32px] p-10 md:p-14 text-center">
            <h2 className="text-3xl md:text-4xl">
              First to know,{" "}
              <em className="italic text-glow-gradient">never spammed</em>.
            </h2>
            <p className="mt-4 text-muted">
              Monthly specials, new products and the occasional story from
              the workshop. Only with your consent — unsubscribe in one
              click.
            </p>

            <form action="#" className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full sm:max-w-sm rounded-full border border-line bg-white px-6 py-3.5 text-sm outline-none focus:border-forest"
              />
              <button className="btn-glow rounded-full px-8 py-3.5 text-sm font-semibold">
                Keep me posted
              </button>
            </form>

            <small className="mt-4 block text-xs text-muted">
              By signing up you agree to receive our newsletter. We never share
              your details.
            </small>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
