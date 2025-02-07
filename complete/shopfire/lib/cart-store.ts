import { Product } from "@/components/custom/product-card";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  productId: string;
  quantity: number;
  product: Pick<Product, "name" | "price" | "id">;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      addToCart: (product, quantity) => {
        const existingItem = get().items.find(item => item.productId === product.id);
        
        if (existingItem) {
          return set(state => ({
            items: state.items.map(item =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          }));
        }

        set(state => ({
          items: [...state.items, {
            productId: product.id,
            quantity,
            product: {
              id: product.id,
              name: product.name,
              price: product.price
            }
          }]
        }));
      },
      removeFromCart: (productId) => {
        set(state => ({
          items: state.items.filter(item => item.productId !== productId)
        }));
      },
      updateQuantity: (productId, newQuantity) => {
        if (newQuantity < 1) return;
        set(state => ({
          items: state.items.map(item =>
            item.productId === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage", // localStorage key
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
); 