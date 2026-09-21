
import { Response } from 'express';
import Product from '../models/ProductModel';
import ProductSize from '../models/ProductSizeModel';
import Promotion from '../models/PromotionModel';
import AuditLog from '../models/AuditLogModel';
import { AuthRequest } from '../types';
import { isPromotionActive } from '../utils/promotions';

interface SizePayload {
    size: string;
    stock: number;
}

interface PromotionPayload {
    discountPercentage: number;
    validFrom?: string;
    validUntil?: string;
    isActive?: boolean;
}

interface StorePromotionPayload {
    discountPercentage: number;
    validFrom?: string;
    validUntil?: string;
    isActive?: boolean;
}

interface ProductPayload {
    name?: string;
    price?: number;
    description?: string;
    stock?: number;
    image_url?: string;
    sizes?: SizePayload[];
    promotions?: PromotionPayload[];
}

interface ProductSnapshot {
    name: string;
    price: number;
    stock: number;
    image_url?: string;
}

interface ValidProductPayload extends ProductPayload {
    name: string;
    price: number;
    stock: number;
}

function hasRequiredProductFields(payload: ProductPayload): payload is ValidProductPayload {
    return Boolean(payload.name) && payload.price !== undefined && (payload.stock !== undefined || Boolean(payload.sizes?.length));
}

function calculateTotalStock(sizes?: SizePayload[], fallbackStock = 0): number {
    if (!sizes?.length) return Math.max(0, Number(fallbackStock) || 0);

    return sizes
        .filter((size) => ['P', 'M', 'G', 'GG'].includes(size.size.trim().toUpperCase()))
        .reduce((total, size) => total + Math.max(0, Number(size.stock) || 0), 0);
}

function buildCreateProductAuditDetails(name: string, price: number, stock: number, sizesCount = 0): string {
    let details = `Criou produto "${name}" com preço R$ ${price} e estoque total ${stock}`;
    if (sizesCount > 0) details += ` (${sizesCount} tamanhos cadastrados)`;
    return details;
}

function getProductSnapshot(product: Product): ProductSnapshot {
    return {
        name: product.name,
        price: product.price,
        stock: product.stock,
        image_url: product.image_url ?? undefined
    };
}

function getNextProductData(product: Product, payload: ProductPayload): ProductPayload {
    return {
        name: payload.name !== undefined ? payload.name : product.name,
        price: payload.price !== undefined ? payload.price : product.price,
        stock: payload.stock !== undefined ? payload.stock : product.stock,
        image_url: payload.image_url !== undefined ? payload.image_url : product.image_url
    };
}

function buildUpdateProductAuditDetails(previousData: ProductSnapshot, nextData: ProductPayload): string {
    let details = `Atualizou produto "${previousData.name}"`;

    if (nextData.name !== undefined && previousData.name !== nextData.name) details += ` - Nome: ${previousData.name} → ${nextData.name}`;
    if (nextData.price !== undefined && previousData.price !== nextData.price) details += ` - Preço: R$ ${previousData.price} → R$ ${nextData.price}`;
    if (nextData.stock !== undefined && previousData.stock !== nextData.stock) details += ` - Estoque: ${previousData.stock} → ${nextData.stock}`;
    if (nextData.image_url !== undefined && previousData.image_url !== nextData.image_url) details += ' - Imagem alterada';

    return details;
}

async function createProductAuditLog(req: AuthRequest, action: string, details: string): Promise<void> {
    await AuditLog.create({
        adminId: req.user!.id,
        adminName: req.user!.name,
        action,
        details
    });
}

function isProductDeleteBlockedError(error: Error): boolean {
    return error.name === 'SequelizeForeignKeyConstraintError'
        || error.message.includes('foreign key constraint fails')
        || error.message.includes('Cannot delete or update a parent row');
}

// LISTAGEM DE PRODUTOS
export const listProducts = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Product.findAndCountAll({
            where: { isVisible: true },
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                { model: ProductSize, as: 'sizes' },
                { model: Promotion, as: 'promotions' }
            ],
            distinct: true
        });

        const storePromotion = await Promotion.findOne({ where: { productId: null, code: null } });
        if (storePromotion && isPromotionActive(storePromotion)) {
            rows.forEach((product) => {
                product.setDataValue('promotions', [
                    ...(product.get('promotions') as Promotion[] || []),
                    storePromotion
                ]);
            });
        }

        return res.status(200).json({ products: rows, totalPages: Math.ceil(count / limit), total: count });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao listar produtos" });
    }
};

// CRIAR PRODUTO
export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        const payload = req.body as ProductPayload;

        if (!hasRequiredProductFields(payload)) {
            return res.status(400).json({ message: "Nome, preço e estoque são obrigatórios" });
        }

        const { name, price, stock, image_url, sizes, promotions } = payload;
        const totalStock = calculateTotalStock(sizes, stock);

        const product = await Product.create({
            name,
            price,
            stock: totalStock,
            image_url: image_url ?? undefined
        });

        // Cadastrar Tamanhos se enviados no payload
        if (sizes && sizes.length > 0) {
            const sizeRecords = sizes.map(s => ({
                productId: product.id,
                size: s.size,
                stock: s.stock
            }));
            await ProductSize.bulkCreate(sizeRecords);
        }

        // Cadastrar Promoções se enviadas no payload (com data convertida)
        if (promotions && promotions.length > 0) {
            const promoRecords = promotions.map(p => ({
                productId: product.id,
                code: null,
                discountPercentage: p.discountPercentage,
                validFrom: p.validFrom ? new Date(p.validFrom) : undefined,
                validUntil: p.validUntil ? new Date(p.validUntil) : undefined,
                isActive: p.isActive ?? true
            }));
            await Promotion.bulkCreate(promoRecords);
        }

        await createProductAuditLog(req, 'CREATE_PRODUCT', buildCreateProductAuditDetails(name, price, totalStock, sizes?.length));

        const createdProduct = await Product.findByPk(product.id, {
            include: [
                { model: ProductSize, as: 'sizes' },
                { model: Promotion, as: 'promotions', where: { code: null }, required: false }
            ]
        });

        return res.status(201).json({ message: "Produto criado com sucesso", product: createdProduct });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao criar produto";
        return res.status(500).json({ message });
    }
};

// ATUALIZAR PRODUTO
export const updateProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, price, stock, description, image_url, sizes, promotions } = req.body as ProductPayload;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        const oldData = getProductSnapshot(product);
        const totalStock = calculateTotalStock(sizes, stock ?? product.stock);
        const nextData = getNextProductData(product, { name, price, stock: totalStock, image_url });

        await product.update({
            name: nextData.name,
            price: nextData.price,
            description: description !== undefined ? description : product.description,
            stock: nextData.stock,
            image_url: nextData.image_url
        });

        if (sizes) {
            for (const sizeData of sizes) {
                const [size] = await ProductSize.findOrCreate({
                    where: { productId: product.id, size: sizeData.size },
                    defaults: { productId: product.id, size: sizeData.size, stock: sizeData.stock }
                });
                await size.update({ stock: sizeData.stock });
            }
        }

        if (promotions) {
            await Promotion.destroy({ where: { productId: product.id } });
            if (promotions.length > 0) {
                await Promotion.bulkCreate(promotions.map((promotion) => ({
                    productId: product.id,
                    code: null,
                    discountPercentage: Math.max(0, Math.min(100, Number(promotion.discountPercentage) || 0)),
                    validFrom: promotion.validFrom ? new Date(promotion.validFrom) : undefined,
                    validUntil: promotion.validUntil ? new Date(promotion.validUntil) : undefined,
                    isActive: promotion.isActive ?? true
                })));
            }
        }

        await createProductAuditLog(req, 'UPDATE_PRODUCT', buildUpdateProductAuditDetails(oldData, nextData));

        const updatedProduct = await Product.findByPk(product.id, {
            include: [
                { model: ProductSize, as: 'sizes' },
                { model: Promotion, as: 'promotions' }
            ]
        });

        return res.status(200).json({ message: "Produto atualizado com sucesso", product: updatedProduct });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao atualizar produto";
        return res.status(500).json({ message });
    }
};

// DELETAR PRODUTO
export const deleteProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        await product.update({ isVisible: false });
        await createProductAuditLog(req, 'DELETE_PRODUCT', `Produto: "${product.name}"`);

        return res.status(200).json({ message: "Produto removido do estoque e da vitrine com sucesso" });
    } catch (error) {
        const isForeignKeyConstraint = error instanceof Error && isProductDeleteBlockedError(error);

        if (isForeignKeyConstraint) {
            return res.status(400).json({
                message: 'Não é possível excluir este produto porque ele está vinculado a registros existentes, como itens no carrinho ou pedidos.'
            });
        }

        const message = error instanceof Error ? error.message : "Erro ao deletar produto";
        return res.status(500).json({ message });
    }
};

export const updateStorePromotion = async (req: AuthRequest, res: Response) => {
    try {
        const payload = req.body as StorePromotionPayload;
        const discountPercentage = Math.max(0, Math.min(100, Number(payload.discountPercentage) || 0));
        const promotion = await Promotion.findOne({ where: { productId: null, code: null } });

        if (discountPercentage === 0) {
            if (promotion) await promotion.destroy();
            return res.status(200).json({ message: 'Promoção geral removida' });
        }

        const values = {
            code: null,
            productId: null,
            discountPercentage,
            validFrom: payload.validFrom ? new Date(payload.validFrom) : undefined,
            validUntil: payload.validUntil ? new Date(payload.validUntil) : undefined,
            isActive: payload.isActive ?? true
        };
        const savedPromotion = promotion ? await promotion.update(values) : await Promotion.create(values);
        return res.status(200).json({ promotion: savedPromotion });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao salvar promoção geral';
        return res.status(500).json({ message });
    }
};

export const getStorePromotion = async (_req: AuthRequest, res: Response) => {
    try {
        const promotion = await Promotion.findOne({ where: { productId: null, code: null } });
        return res.status(200).json({ promotion });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao carregar promoção geral' });
    }
};