import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../../../../utils/httpError.js';
import { projectsService } from '../services/projects.service.js';

class ProjectsController {
  public listProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const institutionId = typeof req.query.institutionId === 'string' ? req.query.institutionId : undefined;
      const location = typeof req.query.location === 'string' ? req.query.location : undefined;
      const faculty = typeof req.query.faculty === 'string' ? req.query.faculty : undefined;
      const projects = await projectsService.listProjects({ search, status, institutionId, location, faculty });
      res.json(projects);
    } catch (error) {
      next(error);
    }
  };

  public listProjectsForMap = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await projectsService.listProjectsForMap();
      res.json(projects);
    } catch (error) {
      next(error);
    }
  };

  public getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = String(req.params.id);
      const project = await projectsService.getProjectById(projectId);
      if (!project) {
        throw new HttpError(404, 'Project not found');
      }
      res.json(project);
    } catch (error) {
      next(error);
    }
  };

  public createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await projectsService.createProject(req.body ?? {});
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  };

  public updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = String(req.params.id);
      const project = await projectsService.updateProject(projectId, req.body ?? {});
      if (!project) throw new HttpError(404, 'Project not found');
      res.json(project);
    } catch (error) {
      next(error);
    }
  };

  public enrollStudentInProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = String(req.params.id);
      const payload = await projectsService.enrollStudent(projectId, req.body ?? {});
      if (!payload) {
        throw new HttpError(404, 'Project not found');
      }
      res.status(201).json(payload);
    } catch (error) {
      next(error);
    }
  };

  public listProjectEnrollments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = String(req.params.id);
      const project = await projectsService.getProjectById(projectId);
      if (!project) {
        throw new HttpError(404, 'Project not found');
      }

      const enrollments = await projectsService.listEnrollmentsByProjectId(projectId);
      res.json({ project, enrollments });
    } catch (error) {
      next(error);
    }
  };
}

const projectsController = new ProjectsController();

export const listProjectsController = projectsController.listProjects;
export const listProjectsForMapController = projectsController.listProjectsForMap;
export const getProjectByIdController = projectsController.getProjectById;
export const createProjectController = projectsController.createProject;
export const enrollStudentInProjectController = projectsController.enrollStudentInProject;
export const listProjectEnrollmentsController = projectsController.listProjectEnrollments;
export const updateProjectController = projectsController.updateProject;
export default ProjectsController;