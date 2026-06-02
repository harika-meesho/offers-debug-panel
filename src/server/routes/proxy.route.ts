import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { config } from '../config';

const router = Router();

const supplierOptinProxy = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const url = `${config.supplierOptinAdminBaseUrl}${req.path}`;
    const response = await axios({
      method: req.method as any,
      url,
      params: req.query,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...(config.internalAuthToken
          ? { Authorization: `Bearer ${config.internalAuthToken}` }
          : {}),
      },
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

const offerPlatformProxy = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const url = `${config.offerPlatformBaseUrl}${req.path}`;
    const response = await axios({
      method: req.method as any,
      url,
      params: req.query,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...(config.internalAuthToken
          ? { Authorization: `Bearer ${config.internalAuthToken}` }
          : {}),
      },
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

// supplier-optin admin routes
router.use('/api/v1/optin', supplierOptinProxy);
router.use('/admin/supplier', supplierOptinProxy);
router.use('/admin/v2/supplier', supplierOptinProxy);

// offer-platform-go routes
router.use('/admin/productsupplier', offerPlatformProxy);
router.use('/admin/offerdetails', offerPlatformProxy);

export default router;
