'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

/**
 * The robot that watches the pointer.
 *
 * Motion is a port of the owner's V3 prototype, kept at its measured values:
 * the body never moves, the eyes track the pointer clearly, and the head
 * follows the same target through a slacker spring so it arrives later and
 * travels less. Both settle back to centre when the pointer leaves.
 *
 * The prototype expressed eye travel in pixels (±29 / ±14) against a stage of
 * min(72vmin, 620px). Those numbers are reproduced here as percentages of the
 * stage instead — a percentage translate resolves against the element's own
 * box, and every layer is inset-0 on the stage, so the motion is identical at
 * the prototype's size and stays in proportion at any other. That is what lets
 * the caller resize this component without recalibrating the face.
 *
 * No animation library: this is one rAF loop over two springs, and the loop
 * parks itself once the springs have settled.
 */

// Spring response, straight from the prototype. The eyes are stiff and lightly
// damped; the head is roughly a third as stiff and damped harder, which is the
// whole of "lighter and slower".
const EYE_STIFFNESS = 0.095
const EYE_DAMPING = 0.72
const HEAD_STIFFNESS = 0.028
const HEAD_DAMPING = 0.8

// Travel limits. The pixel values above over the 620px stage they were tuned on.
const EYE_X = (29 / 620) * 100
const EYE_Y = (14 / 620) * 100
const HEAD_TILT_Y = (0.8 / 620) * 100
const HEAD_ROTATE = 2.6

// How far from the robot the pointer has to be for the target to saturate.
// tanh() rather than a clamp, so the last part of the travel eases in.
const REACH = 0.48
const GAIN_X = 1.65
const GAIN_Y = 1.45

// Below this the spring is visually at rest, so the loop stops rather than
// burning frames on sub-pixel corrections.
const SETTLED = 0.0005

function spring(
  position: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
): [number, number] {
  let v = velocity
  v += (target - position) * stiffness
  v *= damping
  return [position + v, v]
}

interface RobotProps {
  /** Utility classes for the stage. It is square; give it a width. */
  className?: string
}

export function Robot({ className }: RobotProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLImageElement>(null)
  const eyesRef = useRef<HTMLImageElement>(null)

  // SRS A-10. The preference gates the whole behaviour rather than being
  // checked inside it, and it is state so that changing it while the page is
  // open tears the loop down or builds it back up.
  const [reducedMotion, setReducedMotion] = useState(true)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      setReducedMotion(query.matches)
    }
    sync()
    query.addEventListener('change', sync)
    return () => {
      query.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    const stage = stageRef.current
    const head = headRef.current
    const eyes = eyesRef.current
    if (!stage || !head || !eyes) return

    const state = { tx: 0, ty: 0, ex: 0, ey: 0, evx: 0, evy: 0, hx: 0, hy: 0, hvx: 0, hvy: 0 }
    let frame = 0

    function draw() {
      if (!head || !eyes) return
      ;[state.ex, state.evx] = spring(state.ex, state.evx, state.tx, EYE_STIFFNESS, EYE_DAMPING)
      ;[state.ey, state.evy] = spring(state.ey, state.evy, state.ty, EYE_STIFFNESS, EYE_DAMPING)
      ;[state.hx, state.hvx] = spring(state.hx, state.hvx, state.tx, HEAD_STIFFNESS, HEAD_DAMPING)
      ;[state.hy, state.hvy] = spring(state.hy, state.hvy, state.ty, HEAD_STIFFNESS, HEAD_DAMPING)

      eyes.style.transform = `translate3d(${state.ex * EYE_X}%, ${state.ey * EYE_Y}%, 0)`
      head.style.transform = `translate3d(0, ${state.hy * HEAD_TILT_Y}%, 0) rotate(${state.hx * HEAD_ROTATE}deg)`

      const moving =
        Math.abs(state.evx) + Math.abs(state.evy) + Math.abs(state.hvx) + Math.abs(state.hvy) >
          SETTLED ||
        Math.abs(state.tx - state.ex) + Math.abs(state.ty - state.ey) > SETTLED ||
        Math.abs(state.tx - state.hx) + Math.abs(state.ty - state.hy) > SETTLED

      frame = moving ? requestAnimationFrame(draw) : 0
    }

    function run() {
      if (!frame) frame = requestAnimationFrame(draw)
    }

    function aim(event: PointerEvent) {
      if (!stage) return
      const box = stage.getBoundingClientRect()
      // Measured from the face rather than the box centre: the head sits in
      // the upper part of the square, so 42% down is where it looks from.
      const x = (event.clientX - (box.left + box.width / 2)) / (window.innerWidth * REACH)
      const y = (event.clientY - (box.top + box.height * 0.42)) / (window.innerHeight * REACH)
      state.tx = Math.tanh(x * GAIN_X)
      state.ty = Math.tanh(y * GAIN_Y)
      run()
    }

    // Pointer gone: the target returns to centre and the springs carry the
    // head and eyes back rather than snapping them.
    function recentre() {
      state.tx = 0
      state.ty = 0
      run()
    }

    window.addEventListener('pointermove', aim, { passive: true })
    document.documentElement.addEventListener('pointerleave', recentre)
    window.addEventListener('blur', recentre)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', aim)
      document.documentElement.removeEventListener('pointerleave', recentre)
      window.removeEventListener('blur', recentre)
      // Left wherever the springs stopped otherwise, which would freeze a
      // half-turned head the moment the preference is switched on.
      head.style.transform = ''
      eyes.style.transform = ''
    }
  }, [reducedMotion])

  return (
    <div
      ref={stageRef}
      // Decorative. It carries no information the page does not already state
      // in text, so it is hidden from assistive technology entirely rather
      // than described (SRS A-01) — and the three layers are one picture, not
      // three, which is the other reason a per-image alt would be wrong.
      aria-hidden="true"
      // Two elements on purpose. Positioning belongs to the caller, and a
      // caller passing `absolute` must not have to win a specificity fight
      // with a `relative` baked in here — Tailwind resolves that by
      // stylesheet order, not by the order of the class attribute, so the
      // component would silently override the instance. The outer box takes
      // whatever the caller says; the inner one is the stage the layers are
      // measured against, and is always relative.
      className={`pointer-events-none aspect-square select-none ${className ?? ''}`}
    >
      <div className="relative h-full w-full">
        {/*
          `fill` against the square stage: the box is reserved by the aspect
          ratio before a byte of SVG arrives, so the layers cannot shift
          anything as they load (SRS P-06). Lazy because the robot is
          decoration — eager would put it on the critical path and risk taking
          LCP off the h1 (T-302).

          `unoptimized` states a fact rather than opting out of something:
          these are vector files and the image optimiser does not process SVG.

          Order is the z-order: body behind, then head, then eyes. The body
          never moves — only the head and eyes carry a transform.
        */}
        <Image
          src="/robot/robot-body.svg"
          alt=""
          fill
          unoptimized
          loading="lazy"
          className="z-[1]"
        />
        <Image
          ref={headRef}
          src="/robot/robot-head.svg"
          alt=""
          fill
          unoptimized
          loading="lazy"
          className="motion-reduce:!transform-none origin-[50%_74%] will-change-transform z-[2]"
        />
        <Image
          ref={eyesRef}
          src="/robot/robot-eyes.svg"
          alt=""
          fill
          unoptimized
          loading="lazy"
          className="motion-reduce:!transform-none will-change-transform z-[3]"
        />
      </div>
    </div>
  )
}
