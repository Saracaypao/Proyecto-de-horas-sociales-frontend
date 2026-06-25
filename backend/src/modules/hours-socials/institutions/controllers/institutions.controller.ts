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
  public updateInstitution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const institutionId = String(req.params.id);
      const { nombre, ubicacion, descripcion, tipo, image_url } = req.body as Record<string, unknown>;
      const updated = await institutionsService.update(institutionId, {
        nombre:      typeof nombre      === 'string' ? nombre      : undefined,
        ubicacion:   typeof ubicacion   === 'string' ? ubicacion   : undefined,
        descripcion: typeof descripcion === 'string' ? descripcion : undefined,
        tipo:        tipo      !== undefined ? (typeof tipo      === 'string' ? tipo      : null) : undefined,
        image_url:   image_url !== undefined ? (typeof image_url === 'string' ? image_url : null) : undefined,
      });
      if (!updated) throw new HttpError(404, 'Institution not found');
      res.json(updated);
    } catch (error) {
      next(error);
    }
  };
}

const institutionsController = new InstitutionsController();

export const listInstitutionsController = institutionsController.listInstitutions;
export const getInstitutionByIdController = institutionsController.getInstitutionById;
export const updateInstitutionController = institutionsController.updateInstitution;
export default InstitutionsController;