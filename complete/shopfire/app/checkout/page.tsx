"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { ILineItem, ITransaction } from "@/lib/api/types";
import { useCartStore } from "@/lib/cart-store";
import { useProducts } from "@/lib/hooks/useProducts";
import { NavigationRoutes } from "@/lib/navigation";
import { useDodgeballProvider } from "@/lib/providers/dodgeball-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PromoCodeDiscount } from "../api/promo-code/apply/route";

// Add validation schemas
const promoCodeSchema = z.object({
  promoCode: z.string().min(1, "Please enter a promo code")
});

const checkoutSchema = z.object({
  shippingAddressFirstName: z.string().min(1, "First name is required"),
  shippingAddressLastName: z.string().min(1, "Last name is required"),
  shippingAddress: z.string().min(1, "Address is required"),
  shippingAddress2: z.string().optional(),
  shippingPostalCode: z.string().min(1, "Postal code is required"),
  cardNumber: z.string().min(13, "Invalid card number"),
  expiration: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Invalid expiration date"),
  cvc: z.string().min(3, "CVC must be at least 3 digits").max(4, "CVC cannot be more than 4 digits"),
  name: z.string().min(1, "Cardholder name is required"),
  sameAsShipping: z.boolean(),
  billingAddressFirstName: z.string().optional(),
  billingAddressLastName: z.string().optional(),
  billingAddress: z.string().optional(),
  billingAddress2: z.string().optional(),
  billingPostalCode: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.sameAsShipping) {
    if (!data.billingAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing address is required",
        path: ["billingAddress"]
      });
    }
    if (!data.billingPostalCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing Postal code is required",
        path: ["billingPostalCode"]
      });
    }
  }
});

export default function CheckoutPage() {
  const [discount, setDiscount] = useState<PromoCodeDiscount | null>(null);
  const router = useRouter();
  const { sourceToken } = useDodgeballProvider();
  const { items } = useCartStore();
  const { data: products } = useProducts();
  const [isProcessing, setIsProcessing] = useState(false);

  // Merge cart items with product data
  const cartItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      product: products?.find(p => p.id === item.productId)
    }));
  }, [items, products]);

  const getDiscountAmount = (discount: PromoCodeDiscount, totalPrice: number) => {
    if (discount.type === "percentage") {
      return (discount.percentage / 100) * totalPrice;
    }
    return discount.amount;
  }

  const initialTotalPrice = cartItems.reduce(
    (sum, item) => sum + (parseFloat(item.product?.price || '0') * item.quantity),
    0
  );

  const discountAmount = discount ? getDiscountAmount(discount, initialTotalPrice) : 0;

  const totalPrice = initialTotalPrice - discountAmount;

  // Promo code form
  const promoCodeForm = useForm<z.infer<typeof promoCodeSchema>>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: { promoCode: "" }
  });

  // Checkout form
  const checkoutForm = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddressFirstName: "",
      shippingAddressLastName: "",
      shippingAddress: "",
      shippingAddress2: "",
      shippingPostalCode: "",
      cardNumber: "",
      expiration: "",
      cvc: "",
      name: "",
      sameAsShipping: true,
      billingAddressFirstName: "",
      billingAddressLastName: "",
      billingAddress: "",
      billingAddress2: "",
      billingPostalCode: ""
    }
  });

  async function onPromoCodeSubmit(values: z.infer<typeof promoCodeSchema>) {
    try {
      setDiscount(null);
      const response = await fetch('/api/promo-code/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promoCode: values.promoCode,
          sourceToken,
        })
      });

      if (!response.ok) {
        throw new Error("Failed to apply promo code");
      }

      const responseData = await response.json();
      if (responseData.success) {
        setDiscount(responseData.discount);
        toast({
          title: `${responseData.discount.code} discount applied!`,
          description: "Promo code applied successfully",
          variant: "default"
        });
        promoCodeForm.reset();
      } else {
        toast({
          title: "Failed to apply promo code",
          description: responseData.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Promo code error:', error);
      toast({
        title: "Failed to apply promo code",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }

  async function onCheckoutSubmit(values: z.infer<typeof checkoutSchema>) {
    console.log("onCheckoutSubmit", values);
    try {
      setIsProcessing(true);
      
      let lineItems: ILineItem[] = [];
      for (const item of cartItems) {
        if (item.product) {
          lineItems.push({
            productId: item.productId,
            name: item.product?.name || "Unknown Product",
            quantity: item.quantity,
            description: item.product?.description || "",
            brand: item.product?.brand || "",
            unitPrice: parseFloat(item.product?.price || "0")
          });
        } else {
          throw new Error("Product not found");
        }
      }
      const shippingAddress = {
        firstName: values.shippingAddressFirstName,
        lastName: values.shippingAddressLastName,
        line1: values.shippingAddress,
        line2: values.shippingAddress2 || null,
        postalCode: values.shippingPostalCode
      };
      const billingAddress = values.sameAsShipping ? shippingAddress : {
        firstName: values.billingAddressFirstName || "",
        lastName: values.billingAddressLastName || "",
        line1: values.billingAddress || "",
        line2: values.billingAddress2 || null,
        postalCode: values.billingPostalCode || ""
      };

      const transaction: ITransaction = {
        externalId: `txn_${nanoid(16)}`, // Generate unique transaction ID
        amount: totalPrice,
        isDigitalDelivery: false, // Update based on your product type if needed
        lineItems: lineItems,
        promoCode: discount?.code || "",
        shippingAddress,
        billingAddress,
        cardHolderName: values.name,
        cardBin: values.cardNumber.slice(0, 6), // First 6 digits
        cardLast4: values.cardNumber.slice(-4) // Last 4 digits
      };

      const response = await fetch('/api/purchase/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction,
          sourceToken
        })
      });

      if (!response.ok) {
        throw new Error("Failed to checkout");
      }

      const responseData = await response.json();
      if (responseData.success) {
        toast({
          title: "Order Successful!",
          description: "Your order has been processed",
          variant: "default"
        });
        
        // Immediately clear cart and navigate
        await useCartStore.getState().clearCart();
        router.push(NavigationRoutes.HOME);
      } else {
        toast({
          title: "Order Failed",
          description: responseData.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      let errorMessage = "Please try again";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Order Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your purchase securely
          </p>
        </div>

        {items.length === 0 && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Your cart is empty
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-8">
            {/* Order Summary */}
            <section className="bg-card rounded-lg border p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <span>Order Summary</span>
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <h3 className="font-medium">{item.product?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium">
                      ${(parseFloat(item.product?.price || '0') * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 space-y-4">
                {/* Promo Code Form */}
                <Form {...promoCodeForm}>
                  <form onSubmit={promoCodeForm.handleSubmit(onPromoCodeSubmit)} className="space-y-2">
                    <FormField
                      control={promoCodeForm.control}
                      name="promoCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Discount Code</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                placeholder="Enter promo code"
                                className="flex-1"
                                {...field}
                              />
                            </FormControl>
                            <div className="flex gap-2">
                              <Button type="submit" variant="outline">
                                Apply
                              </Button>
                              {promoCodeForm.formState.errors.promoCode && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => promoCodeForm.reset()}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  Reset
                                </Button>
                              )}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>

                {/* Add discount row */}
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{discount?.code}</span>
                      {discount?.type === "percentage" && (
                        <span className="text-muted-foreground">({discount.percentage}% off)</span>
                      )}
                      {discount?.type === "fixed" && (
                        <span className="text-muted-foreground">Fixed discount</span>
                      )}
                    </div>
                    <span className="text-muted-foreground">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Update total display */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold">
                    ${(totalPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <Form {...checkoutForm}>
              <form onSubmit={checkoutForm.handleSubmit(onCheckoutSubmit)} className="space-y-8">
                <section className="bg-card rounded-lg border p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={checkoutForm.control}
                        name="shippingAddressFirstName"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-base">First Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="py-3 text-base" 
                                required 
                                aria-invalid={!!checkoutForm.formState.errors.shippingAddressFirstName}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={checkoutForm.control}
                        name="shippingAddressLastName"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-base">Last Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="py-3 text-base" 
                                required 
                                aria-invalid={!!checkoutForm.formState.errors.shippingAddressLastName}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={checkoutForm.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-base">Shipping Address <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="py-3 text-base" 
                              required 
                              aria-invalid={!!checkoutForm.formState.errors.shippingAddress}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={checkoutForm.control}
                        name="shippingAddress2"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-base">Apartment, Suite, etc.</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="py-3 text-base" 
                                aria-invalid={!!checkoutForm.formState.errors.shippingAddress2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />


                      <FormField
                        control={checkoutForm.control}
                        name="shippingPostalCode"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-base">Postal Code <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="py-3 text-base" 
                                required 
                                aria-invalid={!!checkoutForm.formState.errors.shippingPostalCode}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </section>

                {/* Billing Information */}
                <section className="bg-card rounded-lg border p-6 shadow-sm mt-8">
                  <h2 className="text-2xl font-semibold mb-6">Billing Information</h2>
                  <div className="space-y-4">
                    <FormField
                      control={checkoutForm.control}
                      name="sameAsShipping"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-4 h-4"
                              />
                            </FormControl>
                            <FormLabel className="text-base">
                              Same as shipping address
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!checkoutForm.watch('sameAsShipping') && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={checkoutForm.control}
                            name="billingAddressFirstName"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-base">First Name <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    className="py-3 text-base" 
                                    required 
                                    aria-invalid={!!checkoutForm.formState.errors.billingAddressFirstName}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={checkoutForm.control}
                            name="billingAddressLastName"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-base">Last Name <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    className="py-3 text-base" 
                                    required 
                                    aria-invalid={!!checkoutForm.formState.errors.billingAddressLastName}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={checkoutForm.control}
                          name="billingAddress"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-base">Billing Address <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="py-3 text-base" 
                                  required 
                                  aria-invalid={!!checkoutForm.formState.errors.billingAddress}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={checkoutForm.control}
                            name="billingAddress2"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-base">Apartment, Suite, etc.</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    className="py-3 text-base" 
                                    aria-invalid={!!checkoutForm.formState.errors.billingAddress2}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />


                          <FormField
                            control={checkoutForm.control}
                            name="billingPostalCode"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-base">Postal Code <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    className="py-3 text-base" 
                                    required 
                                    aria-invalid={!!checkoutForm.formState.errors.billingPostalCode}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Payment Details */}
                <section className="bg-card rounded-lg border p-6 shadow-sm mt-8">
                  <h2 className="text-2xl font-semibold mb-6">Payment Information</h2>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={checkoutForm.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-base">Card Number <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="4242 4242 4242 4242"
                                className="py-5 text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={checkoutForm.control}
                          name="expiration"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-base">Expiration <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="MM/YY"
                                  className="py-5 text-base"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={checkoutForm.control}
                          name="cvc"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-base">CVC <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="123"
                                  className="py-5 text-base"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={checkoutForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-base">Cardholder Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="John Doe"
                                className="py-5 text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-6">
                      <Button 
                        type="submit" 
                        className="w-full py-6 text-base" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : `Pay $${totalPrice.toFixed(2)}`}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Demo payment processing powered by Dodgeball. Do not enter real payment information.
                  </div>
                </section>
                {Object.keys(checkoutForm.formState.errors).length > 0 && (
                  <div className="text-red-500 text-sm mt-4">
                    Form errors: {Object.keys(checkoutForm.formState.errors).join(", ")}
                  </div>
                )}
              </form>
            </Form>
          </div>
        )}
        {/* Continue Shopping */}
        <div className="text-center">
          <Link
            href={NavigationRoutes.HOME}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
          >
            <span>←</span>
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
      <div aria-live="polite" className="sr-only">
        {checkoutForm.formState.isSubmitting && "Processing payment..."}
        {checkoutForm.formState.isSubmitSuccessful && "Payment processed successfully"}
      </div>
    </div>
  );
} 