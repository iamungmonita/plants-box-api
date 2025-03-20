import express from 'express';

export type ExpressHandler<T> = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => Promise<T>;
