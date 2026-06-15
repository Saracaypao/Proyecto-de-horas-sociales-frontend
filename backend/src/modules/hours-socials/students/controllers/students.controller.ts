import type { NextFunction, Request, Response } from 'express';
import { studentsService } from '../services/students.service.js';

class StudentsController {
  public listStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const faculty = typeof req.query.faculty === 'string' ? req.query.faculty : undefined;
      const location = typeof req.query.location === 'string' ? req.query.location : undefined;

      const directory = await studentsService.listDirectory({ search, faculty, location });
      res.json(directory);
    } catch (error) {
      next(error);
    }
  };

  public createStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const student = await studentsService.create(req.body ?? {});
      res.status(201).json(student);
    } catch (error) {
      next(error);
    }
  };

  public getGenderByMunicipio = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await studentsService.getGenderByMunicipio());
    } catch (error) {
      next(error);
    }
  };
  
}

const studentsController = new StudentsController();

export const listStudentsController = studentsController.listStudents;
export const createStudentController = studentsController.createStudent;
export default StudentsController;