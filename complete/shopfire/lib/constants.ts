import { PromoCodeDiscount } from "@/app/api/promo-code/apply/route";

export const validPromos: { [key: string]: PromoCodeDiscount } = {
  "PERCENT10": {
    code: "PERCENT10",
    type: "percentage",
    percentage: 10,
    category: "GENERAL"
  },
  "FIXED10": {
    code: "FIXED10",
    type: "fixed",
    amount: 10,
    category: "GENERAL"
  },
  "FIRSTORDER": {
    code: "FIRSTORDER",
    type: "percentage",
    percentage: 30,
    category: "FIRST_PURCHASE"
  }
};