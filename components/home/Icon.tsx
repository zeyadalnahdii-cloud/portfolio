/**
 * The icon set the Home layout calls for.
 *
 * Inline SVG rather than the design's Material Symbols webfont: that font is a
 * separate request measured in hundreds of kilobytes, and P-05 is already over
 * budget (T-305). These are stroke paths on a 24px grid, drawn once, shipped
 * with the markup, costing no request at all.
 *
 * Always decorative. Every icon here sits beside a real heading, so it is
 * `aria-hidden` and adds nothing to the accessibility tree.
 */
const PATHS: Record<string, string> = {
  devices: 'M4 6h12v9H4zM2 18h16M18 10h4v8h-4z',
  hub: 'M12 8a2 2 0 100-4 2 2 0 000 4zM6 20a2 2 0 100-4 2 2 0 000 4zM18 20a2 2 0 100-4 2 2 0 000 4zM12 8v5M12 13l-5 3M12 13l5 3',
  database:
    'M4 6c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2zM4 6v12c0 1.1 3.6 2 8 2s8-.9 8-2V6M4 12c0 1.1 3.6 2 8 2s8-.9 8-2',
  memory: 'M8 8h8v8H8zM5 5h14v14H5zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3',
  language:
    'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 3.5 5.6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.6-3.5-9S9.5 5.5 12 3z',
  api: 'M4 7h5M4 12h8M4 17h5M16 5l4 7-4 7',
  desktop_windows: 'M3 4h18v12H3zM8 20h8M12 16v4',
  auto_awesome:
    'M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9zM18 15l.9 2.1 2.1.9-2.1.9L18 21l-.9-2.1-2.1-.9 2.1-.9z',
  web: 'M3 5h18v14H3zM3 9h18M6 7h.01M9 7h.01',
  dns: 'M4 5h16v6H4zM4 13h16v6H4zM7 8h.01M7 16h.01',
  terminal: 'M4 5h16v14H4zM8 10l2.5 2L8 14M13 15h4',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  verified:
    'M12 3l2.3 2.1 3.1-.4 1 3 2.8 1.4-1.4 2.8.4 3.1-3 1-2.1 2.3L12 21l-2.6-1.7-3-1 .4-3.1L5.4 12l1.4-2.8-.4-3.1 3 .4zM9 12l2 2 4-4',
  fork_right: 'M12 21V10M12 10L7 5M12 10l5-5M7 5H4M17 5h3',
  speed: 'M12 20a8 8 0 100-16 8 8 0 000 16zM12 12l4-4M8.5 15.5h.01M15.5 15.5h.01',
  arrow_downward: 'M12 4v16M6 14l6 6 6-6',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  code: 'M9 18l-6-6 6-6M15 6l6 6-6 6',
  // The theme toggle's two glyphs.
  light_mode:
    'M12 4V2M12 22v-2M4 12H2M22 12h-2M6 6L4.5 4.5M19.5 19.5L18 18M18 6l1.5-1.5M4.5 19.5L6 18M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  dark_mode: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5',
  // The small-screen navigation disclosure.
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
}

interface IconProps {
  name: string
  className?: string
}

export function Icon({ name, className }: IconProps) {
  const d = PATHS[name]

  // An unknown name renders nothing rather than an empty box. It is
  // decoration; a missing glyph must never leave a hole in the layout.
  if (!d) return null

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={d} />
    </svg>
  )
}
