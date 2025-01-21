import { Request, Response } from 'express';

export class HealthController {
  public check = (req: Request, res: Response): void => {
    const key = req.apiKey;
    res.status(200).json({
      status: 'success',
      message: `Server is healthy, key: ${key}`,
    });
  };
}
