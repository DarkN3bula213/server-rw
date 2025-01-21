import { Routes } from '@/types/routes';
import { Router } from 'express';

export function setRouter(router: Router, routes: Routes[]): void {
  // validateRouteOrder(routes);
  for (const route of routes) {
    const { path, method, handler, validations } = route;

    if (validations?.length) {
      router[method](path, ...validations, handler);
    } else {
      router[method](path, handler);
    }
  }
}
