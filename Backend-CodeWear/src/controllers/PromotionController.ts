import { Request, Response } from 'express';
import Promotion from '../models/PromotionModel';

export const validateCoupon = async (req: Request, res: Response) => {
    try {
        const { code } = req.body;

        if (!code || typeof code !== 'string') {
            return res.status(400).json({ message: 'Código de cupom inválido' });
        }

        const promotion = await Promotion.findOne({
            where: { 
                code: code.trim().toUpperCase(),
                isActive: true 
            }
        });

        if (!promotion) {
            return res.status(404).json({ message: 'Cupom não encontrado ou inativo' });
        }

        // Validação da data de expiração (se configurada)
        if (promotion.validUntil && new Date(promotion.validUntil) < new Date()) {
            return res.status(400).json({ message: 'Este cupom já expirou' });
        }

        return res.status(200).json({
            message: 'Cupom aplicado com sucesso',
            coupon: {
                id: promotion.id,
                code: promotion.code,
                discountPercentage: promotion.discountPercentage,
                productId: promotion.productId ?? null
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao validar cupom';
        return res.status(500).json({ message });
    }
};