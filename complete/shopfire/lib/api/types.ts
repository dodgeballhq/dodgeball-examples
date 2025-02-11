export interface IAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  postalCode: string;
}

export interface ILineItem {
  productId: string;
  name: string;
  quantity: number;
  description: string;
  brand: string;
  unitPrice: number;
}

export interface ITransaction {
  externalId: string;
  amount: number;
  isDigitalDelivery: boolean;
  lineItems: ILineItem[];
  promoCode: string;
  shippingAddress: IAddress | null;
  billingAddress: IAddress;
  cardHolderName: string;
  cardBin: string;
  cardLast4: string;
}
