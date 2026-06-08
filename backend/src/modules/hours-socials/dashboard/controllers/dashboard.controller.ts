import type { NextFunction, Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';

class DashboardController {
  public listMapMarkers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await dashboardService.listMapMarkers());
    } catch (error) {
      next(error);
    }
  };

  public getDashboardSummary = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await dashboardService.getDashboardSummary());
    } catch (error) {
      next(error);
    }
  };

  public getStudentsByCarreraAndYear = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Método pendiente de implementar en el servicio
      res.json([]);
    } catch (error) {
      next(error);
    }
  };

  public getGenderSummary = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Método pendiente de implementar en el servicio
      res.json({ hombres: 0, mujeres: 0 });
    } catch (error) {
      next(error);
    }
  };

  public getTrendByYear = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Método pendiente de implementar en el servicio
      res.json([]);
    } catch (error) {
      next(error);
    }
  };

  public getStudentsByMunicipio = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Método pendiente de implementar en el servicio
      res.json([]);
    } catch (error) {
      next(error);
    }
  };

  public getProjectsByMunicipio = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Método pendiente de implementar en el servicio
      res.json([]);
    } catch (error) {
      next(error);
    }
  };

  public getProjectMetricsByInstitution = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Método pendiente de implementar en el servicio
      res.json([]);
    } catch (error) {
      next(error);
    }
  };

  public getInstitutionDetailTable = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Método pendiente de implementar en el servicio
      res.json([]);
    } catch (error) {
      next(error);
    }
  };
}

const dashboardController = new DashboardController();

export const listMapMarkersController                 = dashboardController.listMapMarkers;
export const getDashboardSummaryController            = dashboardController.getDashboardSummary;
export const getStudentsByCarreraAndYearController    = dashboardController.getStudentsByCarreraAndYear;
export const getGenderSummaryController               = dashboardController.getGenderSummary;
export const getTrendByYearController                 = dashboardController.getTrendByYear;
export const getStudentsByMunicipioController         = dashboardController.getStudentsByMunicipio;
export const getProjectsByMunicipioController         = dashboardController.getProjectsByMunicipio;
export const getProjectMetricsByInstitutionController = dashboardController.getProjectMetricsByInstitution;
export const getInstitutionDetailTableController      = dashboardController.getInstitutionDetailTable;

export default DashboardController;