import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ColorAttributes { id: number; productId: number; name: string; }
interface ColorCreationAttributes extends Optional<ColorAttributes, 'id'> {}

class Color extends Model<ColorAttributes, ColorCreationAttributes> implements ColorAttributes {
  public id!: number;
  public productId!: number;
  public name!: string;
}

Color.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(40), allowNull: false },
}, { sequelize, tableName: 'colors', timestamps: true });

export default Color;
