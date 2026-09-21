import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PromotionAttributes {
  id: number;
  code?: string | null;
  discountPercentage: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  productId?: number | null; // 👈 Adicionado suporte ao produto
}

interface PromotionCreationAttributes extends Optional<PromotionAttributes, 'id' | 'validUntil' | 'isActive' | 'productId'> { }

class Promotion extends Model<PromotionAttributes, PromotionCreationAttributes> implements PromotionAttributes {
  public id!: number;
  public code?: string | null;
  public discountPercentage!: number;
  public validFrom?: Date;
  public validUntil?: Date;
  public isActive!: boolean;
  public productId?: number | null; // 👈 Atributo da classe

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Promotion.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(50), allowNull: true, unique: true },
  discountPercentage: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  validFrom: { type: DataTypes.DATE, allowNull: true },
  validUntil: { type: DataTypes.DATE, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  productId: { type: DataTypes.INTEGER, allowNull: true } // 👈 Mapeamento da coluna no MySQL
}, {
  sequelize,
  tableName: 'promotions',
  timestamps: true
});

export default Promotion;