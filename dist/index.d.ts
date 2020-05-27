import { Response, Request, NextFunction } from 'express';
export default function expressAsyncPatch(errorhandler?: (err: any, req: Request, res: Response, next?: NextFunction) => void): void;
