import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger only on the client-side to prevent Next.js SSR build errors
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export * from 'gsap';
export { gsap };
export default gsap;
