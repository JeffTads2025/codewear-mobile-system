import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import type Promotion from './PromotionModel';

interface ProductAttributes {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  stock: number;
  image_url?: string;
  isVisible: boolean;
  promotions?: Promotion[];
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'image_url' | 'isVisible'> { }

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public name!: string;
  public price!: number;
  public description?: string;
  public category?: string;
  public stock!: number;
  public image_url?: string;
  public isVisible!: boolean;
  public promotions?: Promotion[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Unissex'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  sequelize,
  tableName: 'products',
  timestamps: true
});

export default Product;