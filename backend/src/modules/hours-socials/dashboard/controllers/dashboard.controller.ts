import type { NextFunction, Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';

class DashboardController {
  public listMapMarkers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const markers = await dashboardService.listMapMarkers();
      res.json(markers);
    } catch (error) {
      next(error);
    }
  };

  public getDashboardSummary = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await dashboardService.getSummary();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  };
}

const dashboardController = new DashboardController();

export const listMapMarkersController = dashboardController.listMapMarkers;
export const getDashboardSummaryController = dashboardController.getDashboardSummary;
export default DashboardController;