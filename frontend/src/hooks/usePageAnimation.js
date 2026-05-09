import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * usePageAnimation — Responsive-safe GSAP page animation hook.
 *
 * Animates:
 *   .anim-header  → slides down from top
 *   .anim-card    → staggers up (respects reduced-motion)
 *   .anim-item    → slides in from left (scroll-triggered)
 *   .anim-fade    → fades + lifts in (scroll-triggered)
 */
export function usePageAnimation(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // ── Respect "prefers-reduced-motion" ───────────────────
    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      // Just make everything visible, no animation
      el.querySelectorAll('.anim-header,.anim-card,.anim-item,.anim-fade')
        .forEach((node) => (node.style.opacity = '1'));
      return;
    }

    const ctx = gsap.context(() => {
      // ── Clamp animation distances for mobile ───────────────
      const isMobile = window.innerWidth < 768;
      const yOffset  = isMobile ? 30 : 50;
      const xOffset  = isMobile ? 15 : 25;

      // ── Initial hidden states ──────────────────────────────
      const headers = el.querySelectorAll('.anim-header');
      const cards   = el.querySelectorAll('.anim-card');
      const items   = el.querySelectorAll('.anim-item');
      const fades   = el.querySelectorAll('.anim-fade');

      if (headers.length) gsap.set(headers, { opacity: 0, y: -30 });
      if (cards.length)   gsap.set(cards,   { opacity: 0, y: yOffset, scale: 0.98 });
      if (items.length)   gsap.set(items,   { opacity: 0, x: -xOffset });
      if (fades.length)   gsap.set(fades,   { opacity: 0, y: 20 });

      // ── Entry timeline ─────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (headers.length) {
        tl.to(headers, { opacity: 1, y: 0, duration: 0.6 });
      }

      if (cards.length) {
        tl.to(cards, {
          opacity: 1, y: 0, scale: 1,
          duration: isMobile ? 0.5 : 0.6,
          stagger: { amount: isMobile ? 0.35 : 0.55, from: 'start' },
        }, headers.length ? '-=0.3' : '0');
      }

      // ── Scroll-triggered: items ────────────────────────────
      items.forEach((item) => {
        gsap.to(item, {
          opacity: 1, x: 0, duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            once: true,
          },
        });
      });

      // ── Scroll-triggered: fades ────────────────────────────
      fades.forEach((fade) => {
        gsap.to(fade, {
          opacity: 1, y: 0, duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: fade,
            start: 'top 90%',
            once: true,
          },
        });
      });
    }, el);

    // ── Refresh ScrollTrigger on resize (debounced) ─────────
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    };
    window.addEventListener('resize', onResize);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}
