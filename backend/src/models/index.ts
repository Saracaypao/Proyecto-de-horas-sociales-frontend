import sequelize from '../core/config/database.js';
import Institution from './institution.model.js';
import Project from './project.model.js';
import Student from './student.model.js';
import ProjectEnrollment from './enrollment.model.js';
import MapMarker from './marker.model.js';

const models = {
  Institution,
  Project,
  Student,
  ProjectEnrollment,
  MapMarker,
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models as any);
  }
});

export { sequelize };
export default models;
