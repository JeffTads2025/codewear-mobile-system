import { Response } from 'express';
import Cart from '../models/CartModel';
import Product from '../models/ProductModel';
import ProductSize from '../models/ProductSizeModel';
import Promotion from '../models/PromotionModel';
import { AuthRequest } from '../types';

export const addToCart = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { productId, quantity = 1, size } = req.body;
        const userId = req.user!.id;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        let item = await Cart.findOne({ where: { userId, productId, size: size || null } });
        const productSize = size
            ? await ProductSize.findOne({ where: { productId, size } })
            : null;
        const availableStock = size ? (productSize?.stock ?? 0) : product.stock;

        if (item) {
            if (availableStock < (item.quantity + quantity)) {
                return res.status(400).json({
                    message: `Estoque indisponível para o tamanho ${size || 'selecionado'}.`
                });
            }

            item.quantity += quantity;
            await item.save();
            return res.status(200).json(item);
        }

        if (availableStock < quantity) {
            return res.status(400).json({ message: `Estoque indisponível para o tamanho ${size || 'selecionado'}.` });
        }

        const newItem = await Cart.create({ userId, productId, quantity, size: size || null });
        return res.status(201).json(newItem);

    } catch (error) {
        console.error("Erro no Backend:", error);
        console.error("Erro ao salvar carrinho:", error);
        return res.status(500).json({ message: "Erro interno ao salvar no banco", detail: error instanceof Error ? error.message : undefined });
    }
};

export const listCart = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.user!.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 0;

        const storePromotion = await Promotion.findOne({ where: { productId: null, code: null } });
        const productInclude = {
            model: Product,
            attributes: ['id', 'name', 'price', 'image_url', 'stock'],
            include: [{ model: Promotion, as: 'promotions', where: { code: null }, required: false }]
        };

        if (limit > 0) {
            const offset = (page - 1) * limit;
            const { count, rows } = await Cart.findAndCountAll({
                where: { userId },
                limit,
                offset,
                include: [productInclude],
                order: [['createdAt', 'ASC']]
            });

            rows.forEach((item) => {
                const product = item.get('Product') as Product | undefined;
                if (product && storePromotion) {
                    product.setDataValue('promotions', [
                        ...(product.get('promotions') as Promotion[] || []),
                        storePromotion
                    ]);
                }
            });

            return res.status(200).json({
                items: rows,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                totalItems: count
            });
        }

        const items = await Cart.findAll({
            where: { userId },
            include: [productInclude],
            order: [['createdAt', 'ASC']]
        });
        items.forEach((item) => {
            const product = item.get('Product') as Product | undefined;
            if (product && storePromotion) {
                product.setDataValue('promotions', [
                    ...(product.get('promotions') as Promotion[] || []),
                    storePromotion
                ]);
            }
        });
        return res.status(200).json(items);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao listar carrinho" });
    }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const userId = req.user!.id;

        if (typeof quantity !== 'number' || quantity < 1) {
            return res.status(400).json({ message: "Quantidade deve ser maior que zero" });
        }

        const item = await Cart.findOne({ where: { id, userId } });

        if (!item) {
            return res.status(404).json({ message: "Item não encontrado no carrinho" });
        }

        const product = await Product.findByPk(item.productId);

        if (!product) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        const productSize = item.size
            ? await ProductSize.findOne({ where: { productId: item.productId, size: item.size } })
            : null;
        const availableStock = item.size ? (productSize?.stock ?? 0) : product.stock;

        if (availableStock < quantity) {
            return res.status(400).json({ message: "Quantidade solicitada superior ao estoque disponível." });
        }

        item.quantity = quantity;
        await item.save();

        return res.status(200).json(item);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao atualizar item do carrinho" });
    }
};

export const removeItem = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        const deleted = await Cart.destroy({ where: { id, userId } });

        if (!deleted) {
            return res.status(404).json({ message: "Item não encontrado no carrinho" });
        }

        return res.status(200).json({ message: "Item removido" });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao remover" });
    }
};