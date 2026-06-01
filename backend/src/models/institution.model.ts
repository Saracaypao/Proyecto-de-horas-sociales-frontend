import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../core/config/database.js';

export interface InstitutionAttributes {
  id: number;
  nombre: string;
  sigla: string;
  ubicacion: string;
  tipo?: string | null;
  image_url?: string | null;
  descripcion: string;
  estadisticas: [string, string][];
  created_at?: Date;
  updated_at?: Date;
}

export interface InstitutionCreationAttributes
  extends Optional<InstitutionAttributes, 'id' | 'tipo' | 'image_url' | 'estadisticas' | 'created_at' | 'updated_at'> {}

class Institution extends Model<InstitutionAttributes, InstitutionCreationAttributes> implements InstitutionAttributes {
  declare id: number;
  declare nombre: string;
  declare sigla: string;
  declare ubicacion: string;
  declare tipo: string | null;
  declare image_url: string | null;
  declare descripcion: string;
  declare estadisticas: [string, string][];
  declare created_at: Date;
  declare updated_at: Date;

  public static associate(models: any): void {
    Institution.hasMany(models.Project, {
      foreignKey: 'institution_id',
      as: 'projects',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }
}

Institution.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sigla: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ubicacion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    estadisticas: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
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
    modelName: 'Institution',
    tableName: 'institutions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Institution;
