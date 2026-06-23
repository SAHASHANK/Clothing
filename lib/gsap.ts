import { gsap } from 'gsap';

// Register ScrollTrigger only on the client-side to prevent Next.js SSR build errors
if (typeof window !== 'undefined') {
  // We dynamically import ScrollTrigger to ensure window is available
  const { ScrollTrigger } = require('gsap/ScrollTrigger');
  gsap.registerPlugin(ScrollTrigger);
}

export * from 'gsap';
export { gsap };
export default gsap;
