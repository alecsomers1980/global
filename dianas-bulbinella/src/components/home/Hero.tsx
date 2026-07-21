"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ease: "easeOut",
      duration: 0.6,
    },
  },
};

export default function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative w-full min-h-[82vh] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/flowers-banner.mp4"
        muted
        loop
        playsInline
        autoPlay={!reduced}
        preload="metadata"
        aria-hidden="true"
      />

      {/* Scrim for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest/75 via-forest/40 to-forest/75" />

      {/* Content */}
      {reduced ? (
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto py-28">
          <p className="tracking-[0.35em] text-[11px] font-medium text-aurora-gold mb-6">
            SOUTH AFRICAN BOTANICAL WELLNESS
          </p>
          <h1 className="mt-6 text-[clamp(44px,7vw,84px)] leading-[1.02] text-white">
            Glow from a{" "}
            <em className="italic text-aurora-gold">good place</em>.
          </h1>
          <p className="mt-6 text-lg text-white/85 max-w-xl mx-auto">
            250+ handmade botanical products for skin, body and everyday wellness — small batches from White River, honestly described since 2012.
          </p>
          <div className="mt-9 flex gap-4 justify-center flex-wrap">
            <Link
              href="/shop"
              className="btn-glow rounded-full px-8 py-4 text-sm font-semibold"
            >
              Discover the range
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-white/50 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Our story
            </Link>
          </div>
          <div className="mt-12 flex gap-8 justify-center flex-wrap text-xs tracking-[0.15em] text-white/70">
            <span>250+ NATURAL PRODUCTS</span>
            <span className="text-aurora-gold">·</span>
            <span>CRUELTY-FREE ALWAYS</span>
            <span className="text-aurora-gold">·</span>
            <span>DEALERS NATIONWIDE</span>
          </div>
        </div>
      ) : (
        <motion.div
          className="relative z-10 text-center px-6 max-w-4xl mx-auto py-28"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={itemVariants}
            className="tracking-[0.35em] text-[11px] font-medium text-aurora-gold mb-6"
          >
            SOUTH AFRICAN BOTANICAL WELLNESS
          </motion.p>
          <motion.h1
            variants={itemVariants}
            className="mt-6 text-[clamp(44px,7vw,84px)] leading-[1.02] text-white"
          >
            Glow from a{" "}
            <em className="italic text-aurora-gold">good place</em>.
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg text-white/85 max-w-xl mx-auto"
          >
            250+ handmade botanical products for skin, body and everyday wellness — small batches from White River, honestly described since 2012.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-9 flex gap-4 justify-center flex-wrap">
            <Link
              href="/shop"
              className="btn-glow rounded-full px-8 py-4 text-sm font-semibold"
            >
              Discover the range
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-white/50 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Our story
            </Link>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="mt-12 flex gap-8 justify-center flex-wrap text-xs tracking-[0.15em] text-white/70"
          >
            <span>250+ NATURAL PRODUCTS</span>
            <span className="text-aurora-gold">·</span>
            <span>CRUELTY-FREE ALWAYS</span>
            <span className="text-aurora-gold">·</span>
            <span>DEALERS NATIONWIDE</span>
          </motion.div>
        </motion.div>
      )}

    </section>
  );
}
