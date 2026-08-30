import Cart from './CartModel';
import OrderItem from './OrderItemModel';
import Order from './OrderModel';
import Product from './ProductModel';
import User from './UserModel';
import ProductSize from './ProductSizeModel'; // 👈 Adicionado
import Promotion from './PromotionModel';     // 👈 Adicionado
import Color from './ColorModel';

// Relacionamentos existentes
Cart.belongsTo(Product, { foreignKey: 'productId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Novas associações (Ajuste conforme as chaves estrangeiras dos seus models)
Product.hasMany(ProductSize, { foreignKey: 'productId', as: 'sizes' });
ProductSize.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Promotion, { foreignKey: 'productId', as: 'promotions' });
Promotion.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(Color, { foreignKey: 'productId', as: 'colors' });
Color.belongsTo(Product, { foreignKey: 'productId', as: 'product' });