import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // variantId
  productId: string;
  name: string;
  slug: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  stock: number;
  image: string;
}

export interface AppliedDiscount {
  code: string;
  type: 'PERCENT' | 'FLAT';
  value: number;
  minCart: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  giftWrap: boolean;
  appliedDiscount: AppliedDiscount | null;
  
  // Actions
  toggleCart: (open?: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setGiftWrap: (wrap: boolean) => void;
  applyDiscount: (discount: AppliedDiscount | null) => void;
  
  // Helpers
  getCartSubtotal: () => number;
  getCartDiscountAmount: () => number;
  getCartTotal: () => number;
  getFreeShippingProgress: () => number; // Threshold: e.g., ₹4000
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      giftWrap: false,
      appliedDiscount: null,

      toggleCart: (open) => set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),

      addItem: (newItem, quantity = 1) => set((state) => {
        const existing = state.items.find((i) => i.id === newItem.id);
        if (existing) {
          const updatedQty = Math.min(existing.quantity + quantity, existing.stock);
          return {
            items: state.items.map((i) => i.id === newItem.id ? { ...i, quantity: updatedQty } : i),
            isOpen: true
          };
        }
        return {
          items: [...state.items, { ...newItem, quantity: Math.min(quantity, newItem.stock) }],
          isOpen: true
        };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i
        )
      })),

      clearCart: () => set({ items: [], appliedDiscount: null, giftWrap: false }),

      setGiftWrap: (wrap) => set({ giftWrap: wrap }),

      applyDiscount: (discount) => set({ appliedDiscount: discount }),

      getCartSubtotal: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },

      getCartDiscountAmount: () => {
        const subtotal = get().getCartSubtotal();
        const discount = get().appliedDiscount;
        if (!discount) return 0;
        if (subtotal < discount.minCart) return 0;
        
        if (discount.type === 'PERCENT') {
          return Math.round((subtotal * discount.value) / 100);
        }
        return Math.min(discount.value, subtotal);
      },

      getCartTotal: () => {
        const subtotal = get().getCartSubtotal();
        const discountAmount = get().getCartDiscountAmount();
        const shipping = subtotal >= 4000 || subtotal === 0 ? 0 : 250; // Flat ₹250 shipping
        const wrap = get().giftWrap ? 99 : 0;
        return Math.max(0, subtotal - discountAmount + shipping + wrap);
      },

      getFreeShippingProgress: () => {
        const subtotal = get().getCartSubtotal();
        const target = 4000;
        return Math.min(100, Math.round((subtotal / target) * 100));
      }
    }),
    {
      name: 'unhrd-cart-storage',
      partialize: (state) => ({
        items: state.items,
        giftWrap: state.giftWrap,
        appliedDiscount: state.appliedDiscount,
      }),
    }
  )
);
