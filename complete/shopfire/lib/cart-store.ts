import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      addToCart: (productId, quantity) => {
        const existingItem = get().items.find((item) => item.productId === productId);

        if (existingItem) {
          return set((state) => ({
            items: state.items.map((item) =>
              item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
            ),
          }));
        }

        set((state) => ({
          items: [
            ...state.items,
            {
              productId,
              quantity,
            },
          ],
        }));
      },
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      updateQuantity: (productId, newQuantity) => {
        if (newQuantity < 1) return;
        set((state) => ({
          items: state.items.map((item) => (item.productId === productId ? { ...item, quantity: newQuantity } : item)),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage", // localStorage key
      partialize: (state) => ({ items: state.items }) as CartStore, // Only persist items
    }
  )
);
