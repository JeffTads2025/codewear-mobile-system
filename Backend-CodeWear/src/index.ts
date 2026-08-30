import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './config/database';

// Importação dos Modelos (Necessário para o Sequelize criar/sincronizar as tabelas)
import './models/UserModel';
import './models/ProductModel';
import './models/AuditLogModel';
import './models/OrderModel';
import './models/OrderItemModel';
import './models/CartModel';
import './models/ColorModel';
import './models/associations';
import router from './routes/Routes';

// Configurações Iniciais
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// --- Rotas ---
app.use(router);

// --- Inicialização do Banco de Dados e Servidor ---
sequelize.sync()
    .then(() => {
        console.log('✅ Banco CodeWear sincronizado automaticamente!');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`🔗 Rota de Login pronta em: /login`);
        });
    })
    .catch((err) => {
        console.error('❌ Erro crítico ao sincronizar o banco de dados:', err);
    });

export default app;