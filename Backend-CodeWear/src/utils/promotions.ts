export interface PromotionLike {
    discountPercentage: number;
    validFrom?: Date | string | null;
    validUntil?: Date | string | null;
    isActive?: boolean;
}

export function isPromotionActive(promotion: PromotionLike, now = new Date()): boolean {
    if (promotion.isActive === false) return false;
    if (promotion.validFrom && new Date(promotion.validFrom) > now) return false;
    if (promotion.validUntil && new Date(promotion.validUntil) < now) return false;
    return Number(promotion.discountPercentage) > 0;
}

export function getApplicableDiscount(
    productPromotions: PromotionLike[] = [],
    storePromotion?: PromotionLike | null
): number {
    const individual = productPromotions.find((promotion) => isPromotionActive(promotion));
    if (individual) return Number(individual.discountPercentage);
    return storePromotion && isPromotionActive(storePromotion)
        ? Number(storePromotion.discountPercentage)
        : 0;
}