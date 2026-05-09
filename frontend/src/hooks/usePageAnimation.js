import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * usePageAnimation - Drop this into any page component.
 * It will automatically animate:
 *   .anim-header   → slides down from top
 *   .anim-card     → staggers up from bottom
 *   .anim-item     → staggers in from left (scroll-triggered)
 *   .anim-fade     → simple fade in (scroll-triggered)
 */
export function usePageAnimation(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // ── Initial hidden states ──────────────────────────────
      gsap.set('.anim-header', { opacity: 0, y: -30 });
      gsap.set('.anim-card', { opacity: 0, y: 50, scale: 0.97 });
      gsap.set('.anim-item', { opacity: 0, x: -25 });
      gsap.set('.anim-fade', { opacity: 0, y: 20 });

      // ── Timeline: header → cards ───────────────────────────
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to('.anim-header', { opacity: 1, y: 0, duration: 0.65 })
        .to('.anim-card', {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6,
          stagger: { amount: 0.55, from: 'start' }
        }, '-=0.35');

      // ── Scroll-triggered: items ────────────────────────────
      const itemEls = el.querySelectorAll('.anim-item');
      if (itemEls.length) {
        gsap.to('.anim-item', {
          opacity: 1, x: 0, duration: 0.55,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: itemEls[0].closest('section, div') || itemEls[0],
            start: 'top 85%',
            once: true
          }
        });
      }

      // ── Scroll-triggered: fade ─────────────────────────────
      const fadeEls = el.querySelectorAll('.anim-fade');
      fadeEls.forEach((fadeEl) => {
        gsap.to(fadeEl, {
          opacity: 1, y: 0, duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: fadeEl, start: 'top 88%', once: true }
        });
      });
    }, el);

    return () => ctx.revert();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}
