import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="mx-auto max-w-[1440px] px-6 py-14 md:px-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Image
              src="/brand/wordmark-dark.png"
              alt="Rehoboth Herbal Co."
              width={620}
              height={118}
              className="h-6 w-auto opacity-60"
            />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
              Grown, dried and packed at Rehoboth Farm — Portion 21 of Farm 277JU
              Lovedale, Honeybird, Low&rsquo;s Creek, Mpumalanga.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <h2 className="font-display text-base text-ink">Shop</h2>
            <Link href="/shop" className="text-ink-soft hover:text-brand">All products</Link>
            <Link href="/stockists" className="text-ink-soft hover:text-brand">Become a stockist</Link>
            <Link href="/about" className="text-ink-soft hover:text-brand">Our story</Link>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <h2 className="font-display text-base text-ink">Contact</h2>
            <p className="text-ink-soft">Frieda Grobler</p>
            <a href="tel:+27828249023" className="text-ink-soft hover:text-brand">082 824 9023</a>
            <a href="mailto:friedsgrobler@gmail.com" className="break-all text-ink-soft hover:text-brand">
              friedsgrobler@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-hairline pt-7 text-[13px] text-ink-mute md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Rehoboth Herbal Co. &middot; [REG NUMBER]</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-brand">Privacy</Link>
            <Link href="/terms" className="hover:text-brand">Terms</Link>
            <Link href="/returns" className="hover:text-brand">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
