// import { DataTypes, Model } from 'sequelize';
// import sequelize from '../config/database';

// class Cart extends Model {
//     public id!: number;
//     public quantity!: number;
//     public userId!: number;
//     public productId!: number;
// }

// Cart.init({
//     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
//     userId: { type: DataTypes.INTEGER, allowNull: false },
//     productId: { type: DataTypes.INTEGER, allowNull: false }
// }, {
//     sequelize,
//     tableName: 'carts',
//     timestamps: true
// });

// export default Cart;


import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Cart extends Model {
    public id!: number;
    public quantity!: number;
    public userId!: number;
    public productId!: number;
    public size?: string;
}

Cart.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    size: { type: DataTypes.STRING(10), allowNull: true }
}, {
    sequelize,
    tableName: 'carts',
    timestamps: true
});

export default Cart;