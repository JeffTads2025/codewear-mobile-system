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


import { NextFunction, Request, Response, Router } from 'express';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../controllers/ProductController';
import { cancelMyAccount, createUser, deleteTestUser, loginUser, getMe, updateUser, listUsersAdmin } from '../controllers/UserController';
import { addToCart, listCart, updateCartItem, removeItem } from '../controllers/CartController';
import { checkout, listMyOrders, updateOrder, deleteOrder, getAdminDashboard, listAllOrdersAdmin } from '../controllers/OrderController';
import { listLogs } from '../controllers/AuditController';
import { validateCoupon } from '../controllers/PromotionController'; // 👈 Importação da controller de cupons
import { authMiddleware, authorizeRole } from '../middlewares/authMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../types';

const uploadDirectory = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });
const upload = multer({
	dest: uploadDirectory,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (_request, file, callback) => {
		const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
		if (!allowedImageTypes.includes(file.mimetype)) {
			callback(new Error('Envie uma imagem PNG, JPG ou JPEG.'));
			return;
		}
		callback(null, true);
	}
});

const handleAvatarUpload = (req: Request, res: Response, next: NextFunction): void => {
	upload.single('avatar')(req, res, (error: unknown) => {
		if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
			res.status(400).json({ message: 'A imagem do avatar deve ter no máximo 5 MB.' });
			return;
		}
		if (error instanceof Error) {
			res.status(400).json({ message: error.message });
			return;
		}
		next();
	});
};

const router = Router();

// PÚBLICAS
router.get('/products', listProducts);
router.post('/users', createUser);
router.post('/login', loginUser);

// DE CLIENTE 
router.get('/me', authMiddleware, getMe);
router.put('/users/profile', authMiddleware, updateUser);
router.post('/users/avatar', authMiddleware, handleAvatarUpload, async (req, res) => {
	const authenticatedRequest = req as AuthRequest;
	if (!req.file || !authenticatedRequest.user) return res.status(400).json({ message: 'Imagem não enviada.' });
	const user = await (await import('../models/UserModel')).default.findByPk(authenticatedRequest.user.id);
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
router.get('/admin/dashboard', authMiddleware, authorizeRole('admin'), getAdminDashboard);

// Produto-Estoque
router.post('/products', authMiddleware, authorizeRole('admin'), createProduct);
router.put('/products/:id', authMiddleware, authorizeRole('admin'), updateProduct);
router.delete('/products/:id', authMiddleware, authorizeRole('admin'), deleteProduct);

// Vendas/Pedidos
router.get('/admin/all-orders', authMiddleware, authorizeRole('admin'), listAllOrdersAdmin);

router.get('/admin/users', authMiddleware, authorizeRole('admin'), listUsersAdmin);

// Auditoria 
router.get('/admin/logs', authMiddleware, authorizeRole('admin'), listLogs);

export default router;