import { Users, Compass, Sprout } from 'lucide-react';
import { Watermark } from '@/components/ui/Watermark';

export function IconBadges() {
  return (
    <section className="relative overflow-hidden py-20">
      <Watermark />
      <div className="container-kpe relative">
        <div className="grid gap-10 text-center md:grid-cols-3">
          {/* Local Guides */}
          <div>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber">
              <Users size={32} color="white" />
            </div>
            <h3 className="mt-6 text-base tracking-wide2">Local Guides</h3>
            <p className="mt-3 text-sm leading-relaxed text-text/70 normal-case">
              Our guides were born and raised in Mpumalanga’s communities and guide the Lowveld as
              home rather than as a destination.
            </p>
          </div>

          {/* Kruger & Panorama Specialists */}
          <div>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber">
              <Compass size={32} color="white" />
            </div>
            <h3 className="mt-6 text-base tracking-wide2">Kruger &amp; Panorama Specialists</h3>
            <p className="mt-3 text-sm leading-relaxed text-text/70 normal-case">
              We work two areas properly, the Kruger National Park and the Panorama Route, instead of
              covering the whole country thinly.
            </p>
          </div>

          {/* Travel That Gives Back */}
          <div>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber">
              <Sprout size={32} color="white" />
            </div>
            <h3 className="mt-6 text-base tracking-wide2">Travel That Gives Back</h3>
            <p className="mt-3 text-sm leading-relaxed text-text/70 normal-case">
              Every trip helps fund Grow Through Learning’s conservation, youth and community work in
              Mpumalanga.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
