import Image from "next/image";

interface PageBannerProps {
  eyebrow: string;
  title: string;
  image: string;
}

export default function PageBanner({ eyebrow, title, image }: PageBannerProps) {
  return (
    <section className="relative h-[360px] md:h-[440px] flex items-center justify-center text-center">
      <Image
        src={image}
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-ink/70" />
      <div className="relative z-10 el-container pt-16">
        <h1 className="font-heading text-white font-bold text-4xl md:text-6xl">
          {title}
        </h1>
        <span className="el-eyebrow block mt-3">{eyebrow}</span>
      </div>
    </section>
  );
}
