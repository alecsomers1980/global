export default function VideoSection() {
  return (
    <section className="bg-brand-navy py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="section-label mb-4">See Us in Action</p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Watch our team at work
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/60">
            Get a behind-the-scenes look at how we deliver professional HVAC solutions
            across South Africa.
          </p>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl shadow-2xl">
          <video
            src="/images/videos/HVAC-VIDEO.mp4"
            controls
            poster="/images/hero/Exec_air_air_conditioning_fleet-scaled.jpeg"
            className="w-full"
            preload="metadata"
          >
            Your browser does not support video playback.
          </video>
        </div>
      </div>
    </section>
  );
}
