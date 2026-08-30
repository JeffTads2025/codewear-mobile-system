import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProductSizeAttributes {
  id: number;
  productId: number;
  size: string;
  stock: number;
}

interface ProductSizeCreationAttributes extends Optional<ProductSizeAttributes, 'id'> {}

class ProductSize extends Model<ProductSizeAttributes, ProductSizeCreationAttributes> implements ProductSizeAttributes {
  public id!: number;
  public productId!: number;
  public size!: string;
  public stock!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductSize.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  size: { type: DataTypes.STRING(10), allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
  sequelize,
  tableName: 'product_sizes',
  timestamps: true
});

export default ProductSize;