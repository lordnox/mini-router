import { describe, expect, it } from 'bun:test'
import { methods, router, Routes } from './mini-router'
const test = '/users/:id'

// type F_O_A =

describe('::router', () => {
  const routes: Routes<'/' | '/users' | '/users/:id' | '/shipment/:tracking' | '/shipment/:tracking/:state'> = {
    '/': () => 'index',
    '/shipment/:tracking/:state': (req: Request, params) => `Tracking: ${params.tracking} - ${params.state}`,
    '/shipment/:tracking': (req: Request, params: { tracking: string }) => `Tracking: ${params.tracking}`,
    '/users': () => 'users',
    '/users/:id': methods({
      get: (a, { id }) => `get-users #${id}`,
      post: (a, { id }) => `post-users #${id}`,
    }),
  }

  const routeHandler = router(routes)

  const table: [method: string, url: string, result: string][] = [
    ['get', '/', 'index'],
    ['get', '/users', 'users'],
    ['get', '/shipment/888', 'Tracking: 888'],
    ['get', '/shipment/888/active', 'Tracking: 888 - active'],
    ['get', '/users/123456', 'get-users #123456'],
    ['post', '/users/123456', 'post-users #123456'],
    ['POST', '/users/123456', 'post-users #123456'],
  ]

  table.forEach(([method, url, result]) => {
    it(`should route the request to ${method} ${url} to result in ${result}`, () => {
      expect(routeHandler(new Request(url, { method }))).toBe(result)
    })
  })
})

describe('auto-route-sorting', () => {
  it('should sort the routes to prevent collisions', () => {
    const routes = {
      '/a/:id': () => 'a-id',
      '/a/:id/:test': () => 'a-id-test',
    }
    const handler = router(routes)
    expect(handler(new Request('/a/123/456'))).toBe('a-id-test')
  })

  it('should be able to turn of auto-route-sorting', () => {
    const routes = {
      '/a/:id': () => 'a-id',
      '/a/:id/:test': () => 'a-id-test',
    }
    const handler = router(routes, { sortRoutes: false })
    expect(handler(new Request('/a/123/456'))).toBe('a-id')
  })
})
