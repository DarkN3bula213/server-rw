import { Request, Response, NextFunction } from 'express';

type Method = 'get' | 'post' | 'put' | 'delete' | 'patch';
type Middleware = (req: Request, res: Response, next: NextFunction) => void;

type StaticRoute = {
  path: string; // No dynamic segments
  method: Method;
  handler: (req: Request, res: Response, next: NextFunction) => void;
  validations?: Middleware[];
};

type DynamicRoute = {
  path: `/${string}/:${string}`; // At least one dynamic segment
  method: Method;
  handler: (req: Request, res: Response, next: NextFunction) => void;
  validations?: Middleware[];
};

export type Routes = StaticRoute | DynamicRoute;
