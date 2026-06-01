import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../core/config/database.js';

export interface MapMarkerAttributes {
  id: string;
  label: string;
  hombres: number;
  mujeres: number;
  lat: number;
  lng: number;
  project_id?: number | null;
}

export interface MapMarkerCreationAttributes extends Optional<MapMarkerAttributes, 'project_id'> {}

class MapMarker extends Model<MapMarkerAttributes, MapMarkerCreationAttributes> implements MapMarkerAttributes {
  declare id: string;
  declare label: string;
  declare hombres: number;
  declare mujeres: number;
  declare lat: number;
  declare lng: number;
  declare project_id: number | null;

  public static associate(models: any): void {
    MapMarker.belongsTo(models.Project, {
      foreignKey: 'project_id',
      as: 'project',
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
}

MapMarker.init(
  {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      allowNull: false,
    },
    label: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hombres: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    mujeres: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lat: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
    },
    lng: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    modelName: 'MapMarker',
    tableName: 'map_markers',
    timestamps: false,
  }
);

export default MapMarker;
