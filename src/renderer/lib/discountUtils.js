/** Renderer discount/VAT helpers — re-exports shared math (used by cart). */
export {
  DISCOUNT_TYPES,
  roundMoney,
  toNumber,
  normalizeDiscountType,
  computeDiscountAmount,
  discountAsPercent,
  maxDiscountPercentForRole,
  assertDiscountWithinLimit,
  inclusiveVat,
} from '../../shared/discountUtils.js';
