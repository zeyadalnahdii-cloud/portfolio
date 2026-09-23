/**
 * Every page route the site serves, without its locale prefix.
 *
 * This is the list the sitemap enumerates and the navigation renders, so it
 * has to stay truthful. A sitemap advertising a URL that 404s is worse than a
 * short one, and a header linking to a page that does not exist wastes crawl
 * budget and dead-ends visitors. It is therefore the pages that *exist*, not
 * the pages that are planned.
 *
 * `/about`, `/projects` and `/contact` are added by T-211, T-212 and T-213.
 * Adding a route here without building it is the one way to break both
 * quietly.
 */
export const ROUTES = [''] as const

export type Route = (typeof ROUTES)[number]

/**
 * The message key under `nav` that labels each route.
 *
 * Typed against `Route`, so adding a route without giving it a label fails to
 * compile — the navigation cannot end up with an unlabelled entry.
 */
export const ROUTE_LABEL: Record<Route, 'home' | 'about' | 'projects' | 'contact'> = {
  '': 'home',
}

/**
 * Whether a page exists yet.
 *
 * Lets a component link to a route only once it is real. The alternative is a
 * call to action that 404s until the page it points at is built, which is
 * worse than no call to action: it costs the visitor a click and the crawler a
 * dead end. The links appear on their own as T-212 and T-213 land.
 */
export function hasRoute(route: string): boolean {
  return (ROUTES as readonly string[]).includes(route)
}
