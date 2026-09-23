/**
 * Every page route the site serves, without its locale prefix.
 *
 * This is the list the sitemap enumerates, so it has to stay truthful: a
 * sitemap advertising a URL that 404s is worse than one that is merely short.
 * It is therefore the pages that *exist*, not the pages that are planned.
 *
 * `/about`, `/projects` and `/contact` are added by T-211, T-212 and T-213.
 * Adding a route here without building it is the one way to break the sitemap
 * quietly.
 */
export const ROUTES = [''] as const

export type Route = (typeof ROUTES)[number]
