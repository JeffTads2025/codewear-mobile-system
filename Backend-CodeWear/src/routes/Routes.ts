// import { Router } from 'express';
// import { listProducts, createProduct, updateProduct, deleteProduct } from '../controllers/ProductController';
// import { cancelMyAccount, createUser, deleteTestUser, loginUser, getMe, updateUser, listUsersAdmin } from '../controllers/UserController';
// import { addToCart, listCart, updateCartItem, removeItem } from '../controllers/CartController';
// import { checkout, listMyOrders, updateOrder, deleteOrder, getAdminDashboard, listAllOrdersAdmin } from '../controllers/OrderController';
// import { listLogs } from '../controllers/AuditController';
// import { authMiddleware } from '../middlewares/authMiddleware';

// const router = Router();

// //PÚBLICAS
// router.get('/products', listProducts);
// router.post('/users', createUser);
// router.post('/login', loginUser);

// // DE CLIENTE 
// router.get('/me', authMiddleware, getMe);
// router.put('/users/profile', authMiddleware, updateUser);
// router.delete('/users/me', authMiddleware, cancelMyAccount);
// router.delete('/test/users', deleteTestUser);
// router.post('/cart', authMiddleware, addToCart);
// router.get('/cart', authMiddleware, listCart);
// router.put('/cart/:id', authMiddleware, updateCartItem);
// router.delete('/cart/:id', authMiddleware, removeItem);
// router.post('/checkout', authMiddleware, checkout);
// router.get('/orders', authMiddleware, listMyOrders);
// router.put('/orders/:id', authMiddleware, updateOrder);
// router.delete('/orders/:id', authMiddleware, deleteOrder);

// // DE ADMIN

// // Dashboard
// router.get('/admin/dashboard', authMiddleware, getAdminDashboard);

// // Produto-Estoque)
// router.post('/products', authMiddleware, createProduct);
// router.put('/products/:id', authMiddleware, updateProduct);
// router.delete('/products/:id', authMiddleware, deleteProduct);

// // Vendas/Pedidos
// router.get('/admin/all-orders', authMiddleware, listAllOrdersAdmin);


// router.get('/admin/users', authMiddleware, listUsersAdmin);

// // Auditoria 
// router.get('/admin/logs', authMiddleware, listLogs);

// export default router;


import { Router } from 'express';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../controllers/ProductController';
import { cancelMyAccount, createUser, deleteTestUser, loginUser, getMe, updateUser, listUsersAdmin } from '../controllers/UserController';
import { addToCart, listCart, updateCartItem, removeItem } from '../controllers/CartController';
import { checkout, listMyOrders, updateOrder, deleteOrder, getAdminDashboard, listAllOrdersAdmin } from '../controllers/OrderController';
import { listLogs } from '../controllers/AuditController';
import { validateCoupon } from '../controllers/PromotionController'; // 👈 Importação da controller de cupons
import { authMiddleware } from '../middlewares/authMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDirectory = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });
const upload = multer({
	dest: uploadDirectory
});

const router = Router();

// PÚBLICAS
router.get('/products', listProducts);
router.post('/users', createUser);
router.post('/login', loginUser);

// DE CLIENTE 
router.get('/me', authMiddleware, getMe);
router.put('/users/profile', authMiddleware, updateUser);
router.post('/users/avatar', authMiddleware, upload.single('avatar'), async (req: any, res) => {
	if (!req.file) return res.status(400).json({ message: 'Imagem não enviada.' });
	const user = await (await import('../models/UserModel')).default.findByPk(req.user.id);
	if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
	user.avatarUrl = `/uploads/${req.file.filename}`;
	await user.save();
	return res.status(200).json({ avatarUrl: user.avatarUrl });
});
router.delete('/users/me', authMiddleware, cancelMyAccount);
router.delete('/test/users', deleteTestUser);
router.post('/cart', authMiddleware, addToCart);
router.get('/cart', authMiddleware, listCart);
router.put('/cart/:id', authMiddleware, updateCartItem);
router.delete('/cart/:id', authMiddleware, removeItem);
router.post('/promotions/validate', authMiddleware, validateCoupon); // 👈 Nova rota de validação de cupons
router.post('/checkout', authMiddleware, checkout);
router.get('/orders', authMiddleware, listMyOrders);
router.put('/orders/:id', authMiddleware, updateOrder);
router.delete('/orders/:id', authMiddleware, deleteOrder);

// DE ADMIN

// Dashboard
router.get('/admin/dashboard', authMiddleware, getAdminDashboard);

// Produto-Estoque
router.post('/products', authMiddleware, createProduct);
router.put('/products/:id', authMiddleware, updateProduct);
router.delete('/products/:id', authMiddleware, deleteProduct);

// Vendas/Pedidos
router.get('/admin/all-orders', authMiddleware, listAllOrdersAdmin);

router.get('/admin/users', authMiddleware, listUsersAdmin);

// Auditoria 
router.get('/admin/logs', authMiddleware, listLogs);

export default router;