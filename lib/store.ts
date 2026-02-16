import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

/** Single placed order saved in cache for "Your Orders". */
export interface PlacedOrder {
  orderId: string;
  date: string;
  pathaoConsignmentId: string | null;
  orderPhone: string | null;
  total?: number;
  itemsSummary?: string;
}

interface CartStore {
  items: CartItem[];
  /** Set when an item is added; Header uses this to play "added to cart" animation. */
  lastAddedAt: number | null;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  clearJustAdded: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CART_STORAGE_KEY = "chilirig-cart";
const ORDERS_STORAGE_KEY = "chilirig-orders";

interface OrdersStore {
  orders: PlacedOrder[];
  addOrder: (order: PlacedOrder) => void;
  getOrderCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
  items: [],
  lastAddedAt: null,
  addItem: (item) => {
    const items = get().items;
    const existingItem = items.find((i) => i.id === item.id);

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
        lastAddedAt: Date.now(),
      });
    } else {
      set({ items: [...items, { ...item, quantity: 1 }], lastAddedAt: Date.now() });
    }
  },
  removeItem: (id) => {
    set({ items: get().items.filter((item) => item.id !== id) });
  },
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    });
  },
  clearCart: () => set({ items: [], lastAddedAt: null }),
  clearJustAdded: () => set({ lastAddedAt: null }),
  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}),
    {
      name: CART_STORAGE_KEY,
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export const useOrders = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => {
        set({ orders: [order, ...get().orders] });
      },
      getOrderCount: () => get().orders.length,
    }),
    {
      name: ORDERS_STORAGE_KEY,
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);
