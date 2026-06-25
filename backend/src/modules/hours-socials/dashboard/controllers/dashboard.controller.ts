import type { NextFunction, Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';

class DashboardController {

  public listMapMarkers = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(await dashboardService.listMapMarkers());
    } catch (error) {
      next(error);
    }
  };

  public getDashboardSummary = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(await dashboardService.getDashboardSummary());
    } catch (error) {
      next(error);
    }
  };

  public getStudentsByCarreraAndYear = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(
        await dashboardService.getStudentsByCarreraAndYear()
      );
    } catch (error) {
      next(error);
    }
  };

  public getGenderSummary = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(
        await dashboardService.getGenderSummary()
      );
    } catch (error) {
      next(error);
    }
  };

  public getTrendByYear = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(
        await dashboardService.getTrendByYear()
      );
    } catch (error) {
      next(error);
    }
  };

  public getStudentsByMunicipio = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(
        await dashboardService.getStudentsByMunicipio()
      );
    } catch (error) {
      next(error);
    }
  };

  public getProjectsByMunicipio = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(
        await dashboardService.getProjectsByMunicipio()
      );
    } catch (error) {
      next(error);
    }
  };

  public getProjectMetricsByInstitution = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(
        await dashboardService.getProjectMetricsByInstitution()
      );
    } catch (error) {
      next(error);
    }
  };

  public getInstitutionDetailTable = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(
        await dashboardService.getInstitutionDetailTable()
      );
    } catch (error) {
      next(error);
    }
  };
}

const dashboardController = new DashboardController();

export const listMapMarkersController =
  dashboardController.listMapMarkers;

export const getDashboardSummaryController =
  dashboardController.getDashboardSummary;

export const getStudentsByCarreraAndYearController =
  dashboardController.getStudentsByCarreraAndYear;

export const getGenderSummaryController =
  dashboardController.getGenderSummary;

export const getTrendByYearController =
  dashboardController.getTrendByYear;

export const getStudentsByMunicipioController =
  dashboardController.getStudentsByMunicipio;

export const getProjectsByMunicipioController =
  dashboardController.getProjectsByMunicipio;

export const getProjectMetricsByInstitutionController =
  dashboardController.getProjectMetricsByInstitution;

export const getInstitutionDetailTableController =
  dashboardController.getInstitutionDetailTable;

export default DashboardController;