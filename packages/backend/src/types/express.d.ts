/**
 * Express type augmentation for Project Bold Platform
 */

import { JWTPayload } from './index.js';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export {};
