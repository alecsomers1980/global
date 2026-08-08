import { Button } from '@/components/ui/Button';
import { Watermark } from '@/components/ui/Watermark';

interface CtaBandProps {
  title?: string;
  body?: string;
  buttonLabel?: string;
  href?: string;
}

export function CtaBand({
  title = 'Plan Your Lowveld Journey',
  body = 'Tell us who is travelling and when, and our team will put together a tailored itinerary.',
  buttonLabel = 'Request a Quote',
  href = '/request-a-quote',
}: CtaBandProps) {
  return (
    <section className="relative overflow-hidden bg-[#FAFAFA] py-24">
      <Watermark />
      <div className="container-kpe relative text-center">
        <h2 className="text-2xl md:text-4xl tracking-wide2">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-text/70 normal-case">{body}</p>
        <Button href={href} size="lg" className="mt-8">
          {buttonLabel}
        </Button>
      </div>
    </section>
  );
}
