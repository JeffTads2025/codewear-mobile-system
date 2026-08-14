import path from 'path';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'codewear',
    process.env.DB_USER || 'codewear',
    process.env.DB_PASS || '123456',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        logging: true 
    }
);

export default sequelize;