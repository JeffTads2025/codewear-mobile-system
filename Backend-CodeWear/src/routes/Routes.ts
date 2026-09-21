


import { Router } from 'express';
import { listProducts, createProduct, updateProduct, deleteProduct, updateStorePromotion, getStorePromotion } from '../controllers/ProductController';
import { cancelMyAccount, changePassword, createUser, deleteTestUser, loginUser, getMe, updateUser, listUsersAdmin } from '../controllers/UserController';
import { addToCart, listCart, updateCartItem, removeItem } from '../controllers/CartController';
import { checkout, listMyOrders, updateOrder, deleteOrder, getAdminDashboard, listAllOrdersAdmin } from '../controllers/OrderController';
import { listLogs } from '../controllers/AuditController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { checkPermission } from '../middlewares/rbac';
import { avatarUpload, validateAvatarContent } from '../middlewares/upload';
import { handleAvatarUploadError, uploadAvatar } from '../controllers/AvatarController';

const router = Router();

// PÚBLICAS
router.get('/products', listProducts);
router.post('/users', createUser);
router.post('/login', loginUser);

// DE CLIENTE 
router.get('/me', authMiddleware, getMe);
router.put('/users/profile', authMiddleware, updateUser);
router.patch('/users/change-password', authMiddleware, changePassword);
router.post('/users/avatar', authMiddleware, avatarUpload, validateAvatarContent, handleAvatarUploadError, uploadAvatar);
router.delete('/users/me', authMiddleware, cancelMyAccount);
router.delete('/test/users', deleteTestUser);
router.post('/cart', authMiddleware, addToCart);
router.get('/cart', authMiddleware, listCart);
router.put('/cart/:id', authMiddleware, updateCartItem);
router.delete('/cart/:id', authMiddleware, removeItem);
router.post('/checkout', authMiddleware, checkout);
router.get('/orders', authMiddleware, listMyOrders);
router.put('/orders/:id', authMiddleware, updateOrder);
router.delete('/orders/:id', authMiddleware, deleteOrder);

// DE ADMIN

// Dashboard
router.get('/admin/dashboard', authMiddleware, checkPermission('VIEW_ADMIN_DASHBOARD'), getAdminDashboard);

// Produto-Estoque
router.post('/products', authMiddleware, checkPermission('MANAGE_PRODUCTS'), createProduct);
router.put('/products/:id', authMiddleware, checkPermission('MANAGE_PRODUCTS'), updateProduct);
router.delete('/products/:id', authMiddleware, checkPermission('MANAGE_PRODUCTS'), deleteProduct);
router.put('/promotions/store', authMiddleware, checkPermission('MANAGE_PRODUCTS'), updateStorePromotion);
router.get('/promotions/store', authMiddleware, checkPermission('MANAGE_PRODUCTS'), getStorePromotion);

// Vendas/Pedidos
router.get('/admin/all-orders', authMiddleware, checkPermission('MANAGE_ORDERS'), listAllOrdersAdmin);

router.get('/admin/users', authMiddleware, checkPermission('MANAGE_USERS'), listUsersAdmin);

// Auditoria 
router.get('/admin/logs', authMiddleware, checkPermission('VIEW_AUDIT_LOGS'), listLogs);

export default router;