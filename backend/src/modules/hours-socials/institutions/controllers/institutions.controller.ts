import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../../../../utils/httpError.js';
import { institutionsService } from '../services/institutions.service.js';

class InstitutionsController {
  public listInstitutions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const type = typeof req.query.type === 'string' ? req.query.type : undefined;
      const sortBy = req.query.sortBy === 'nombre-desc' ? 'nombre-desc' : 'nombre-asc';
      const institutions = await institutionsService.listForDirectory({ search, type, sortBy });
      res.json(institutions);
    } catch (error) {
      next(error);
    }
  };

  public getInstitutionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const institutionId = String(req.params.id);
      const institution = await institutionsService.getById(institutionId);
      if (!institution) {
        throw new HttpError(404, 'Institution not found');
      }
      res.json(institution);
    } catch (error) {
      next(error);
    }
  };
}

const institutionsController = new InstitutionsController();

export const listInstitutionsController = institutionsController.listInstitutions;
export const getInstitutionByIdController = institutionsController.getInstitutionById;
export default InstitutionsController;