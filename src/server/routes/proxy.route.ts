import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { config } from '../config';

const router = Router();

const offerPlatformProxy = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // req.path strips the matched prefix; combine with req.baseUrl for the full path.
    const url = `${config.offerPlatformBaseUrl}${req.baseUrl}${req.path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'client-id': config.clientId,
    };
    if (config.offerPlatformToken) headers['client-token'] = config.offerPlatformToken;
    const response = await axios({
      method: req.method as any,
      url,
      params: req.query,
      data: req.body,
      timeout: 10_000,
      headers,
    });
    res.status(response.status).json(response.data);
  } catch (err: any) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      next(err);
    }
  }
};

// offer-platform-go routes
router.use('/admin/productsupplier', offerPlatformProxy);
router.use('/admin/offerdetails', offerPlatformProxy);
router.use('/admin/debug/panel', offerPlatformProxy);
router.use('/v2/debug/panel', offerPlatformProxy);

export default router;
