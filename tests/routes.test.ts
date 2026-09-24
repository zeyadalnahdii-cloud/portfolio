import { describe, expect, it } from 'vitest'

import { ROUTES, ROUTE_LABEL, hasRoute, projectAnchor } from '@/lib/seo/routes'

describe('ROUTES', () => {
  it('always includes the locale root', () => {
    expect(ROUTES).toContain('')
  })

  /**
   * ROUTE_LABEL is typed against ROUTES, so a missing label is a compile error
   * rather than a test failure. This checks the other direction: a label left
   * behind after its route was removed would leave the navigation reading from
   * a key nothing points at.
   */
  it('has a label for every route and no labels for anything else', () => {
    expect(Object.keys(ROUTE_LABEL).sort()).toEqual([...ROUTES].sort())
  })
})

describe('hasRoute', () => {
  it('reports the routes that exist', () => {
    for (const route of ROUTES) {
      expect(hasRoute(route)).toBe(true)
    }
  })

  /**
   * The point of the helper. A call to action pointing at an unbuilt page
   * costs the visitor a click and the crawler a dead end, so components ask
   * before linking.
   */
  it('reports routes that do not exist yet as absent', () => {
    expect(hasRoute('/nowhere')).toBe(false)
  })
})

describe('projectAnchor', () => {
  it('slugifies a project name into a fragment id', () => {
    expect(projectAnchor('AI Autonomous Workspace')).toBe('ai-autonomous-workspace-heading')
    expect(projectAnchor('Restaurant Management')).toBe('restaurant-management-heading')
  })

  /**
   * Home links to these fragments and /projects renders them. If the two ever
   * computed the id separately, the links would point at nothing and every
   * page would still render (docs/05-ia-url-map.md §4.2).
   */
  it('collapses runs of whitespace so the id is a single slug', () => {
    expect(projectAnchor('  Two   Words ')).toBe('-two-words--heading')
    expect(projectAnchor('One')).toBe('one-heading')
  })
})
