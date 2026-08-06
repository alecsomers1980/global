import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/**
 * Registers the ScrollTrigger plugin exactly once, however many components
 * call this. Safe to call from every client component that needs GSAP --
 * do not import 'gsap/ScrollTrigger' anywhere else.
 */
export function getGSAP() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/**
 * True when the user has requested reduced motion. Checked at animation
 * setup time (not via a CSS media query) because GSAP timelines aren't
 * covered by the @media (prefers-reduced-motion) block in globals.css --
 * that block only cancels CSS animations/transitions.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
