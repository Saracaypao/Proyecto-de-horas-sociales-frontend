import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../core/config/database.js';
import type { ProjectStatus } from '../types/domain.js';

export interface ProjectAttributes {
  id: number;
  institution_id: number;
  titulo: string;
  ubicacion: string;
  estado: ProjectStatus;
  facultad: string;
  carreras: string[];
  descripcion: string;
  resumen?: string | null;
  fecha_inicio?: string | null;
  fecha_cierre?: string | null;
  cupos?: number | null;
  image_url?: string | null;
  team_members: string[];
  personas: number;
  created_at?: Date;
  updated_at?: Date;
  institution?: any;
  enrollments?: any[];
  markers?: any[];
}

export interface ProjectCreationAttributes
  extends Optional<ProjectAttributes, 'id' | 'resumen' | 'fecha_inicio' | 'fecha_cierre' | 'cupos' | 'image_url' | 'team_members' | 'personas' | 'created_at' | 'updated_at'> {}

class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  declare id: number;
  declare institution_id: number;
  declare titulo: string;
  declare ubicacion: string;
  declare estado: ProjectStatus;
  declare facultad: string;
  declare carreras: string[];
  declare descripcion: string;
  declare resumen: string | null;
  declare fecha_inicio: string | null;
  declare fecha_cierre: string | null;
  declare cupos: number | null;
  declare image_url: string | null;
  declare team_members: string[];
  declare personas: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare institution?: any;
  declare enrollments?: any[];
  declare markers?: any[];

  public static associate(models: any): void {
    Project.belongsTo(models.Institution, {
      foreignKey: 'institution_id',
      as: 'institution',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    Project.hasMany(models.ProjectEnrollment, {
      foreignKey: 'project_id',
      as: 'enrollments',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    Project.hasMany(models.MapMarker, {
      foreignKey: 'project_id',
      as: 'markers',
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    institution_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'institutions', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    titulo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ubicacion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('Activo', 'En planificación', 'En convocatoria', 'Cerrado'),
      allowNull: false,
      defaultValue: 'Activo',
    },
    facultad: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'General',
    },
    carreras: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    resumen: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    fecha_cierre: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    cupos: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    team_members: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    personas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Project;
