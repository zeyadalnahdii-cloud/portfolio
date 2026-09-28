'use client'

import { useEffect } from 'react'

/**
 * Arms the scroll reveals (see the [data-reveal] rules in app/globals.css).
 *
 * Renders nothing. It exists so that the hidden-then-revealed state is a
 * runtime decision rather than a property of the markup: the page ships
 * complete and visible, and only becomes animatable once this has confirmed
 * that the browser supports IntersectionObserver and that the visitor has not
 * asked for less motion (SRS A-10). Anyone the checks exclude — no JS, an old
 * browser, reduced motion, a crawler — reads the finished page.
 *
 * ui-ux-pro-max's Subtle tier is the whole budget here. One reveal per section
 * header and one staggered pass over its cards, nothing in the hero: its
 * guideline is 1–2 animated elements per view, and the hero holds the LCP text
 * (T-302), which cannot start at opacity 0.
 */
export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement

    if (typeof IntersectionObserver === 'undefined') return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) return

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-stagger]'),
    )
    if (targets.length === 0) return

    // Anything already on screen is marked before the hidden state is armed,
    // never after. Arming first would blank the visible part of the page for a
    // frame and then fade it back in — a flash on load, which is worse than no
    // animation at all.
    const fold = window.innerHeight * 0.9
    const pending = targets.filter((target) => {
      if (target.getBoundingClientRect().top >= fold) return true
      target.classList.add('is-revealed')
      return false
    })

    root.dataset.revealArmed = ''

    // -10% is the CSS equivalent of the dataset's `start: 'top 90%'`: the
    // element begins its reveal once it is a tenth of a viewport inside.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-revealed')
          // One-way. Re-hiding on scroll-up is the thing that makes a page
          // feel like a template.
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )

    for (const target of pending) observer.observe(target)

    // The last section cannot always reach that trigger line. On a short
    // viewport the page runs out of scroll while the closing card is still
    // less than a tenth of the way in, and it was left invisible for good —
    // measured at 390x400, 390x300 and 360x640. Reaching the bottom is
    // therefore its own trigger: whatever is still pending has nowhere left to
    // come from, so it is revealed outright.
    function onScroll() {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (!atBottom) return
      for (const target of pending) target.classList.add('is-revealed')
      stop()
    }

    function stop() {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()

    return () => {
      stop()
      delete root.dataset.revealArmed
    }
  }, [])

  return null
}
