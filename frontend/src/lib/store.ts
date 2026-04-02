// src/lib/store.ts
import { create } from 'zustand';
import { CartItem, FoodItem, Location, RestaurantTable } from '@/types';

interface CartStore {
  // Cart
  items: CartItem[];
  location: Location | null;
  table: RestaurantTable | null;

  // Actions
  setLocation: (location: Location) => void;
  setTable: (table: RestaurantTable) => void;
  addItem: (foodItem: FoodItem) => void;
  removeItem: (foodItemId: number) => void;
  updateQuantity: (foodItemId: number, quantity: number) => void;
  updateInstructions: (foodItemId: number, instructions: string) => void;
  clearCart: () => void;

  // Computed
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  location: null,
  table: null,

  setLocation: (location) => set({ location }),
  setTable: (table) => set({ table }),

  addItem: (foodItem) => {
    const items = get().items;
    const existing = items.find(i => i.foodItem.id === foodItem.id);
    if (existing) {
      set({ items: items.map(i => i.foodItem.id === foodItem.id ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      set({ items: [...items, { foodItem, quantity: 1 }] });
    }
  },

  removeItem: (foodItemId) =>
    set({ items: get().items.filter(i => i.foodItem.id !== foodItemId) }),

  updateQuantity: (foodItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(foodItemId);
      return;
    }
    set({ items: get().items.map(i => i.foodItem.id === foodItemId ? { ...i, quantity } : i) });
  },

  updateInstructions: (foodItemId, specialInstructions) =>
    set({ items: get().items.map(i => i.foodItem.id === foodItemId ? { ...i, specialInstructions } : i) }),

  clearCart: () => set({ items: [], table: null }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalAmount: () => get().items.reduce((sum, i) => sum + (i.foodItem.price * i.quantity), 0),
}));

// Admin auth store
interface AuthStore {
  token: string | null;
  user: { id: number; name: string; email: string; role: string; locationIds?: number[] } | null;
  selectedLocationId: number | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  setSelectedLocation: (id: number) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('admin_user') || 'null') : null,
  selectedLocationId: typeof window !== 'undefined' ? Number(localStorage.getItem('selected_location')) || null : null,

  login: (token, user) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    set({ token: null, user: null });
  },

  setSelectedLocation: (id) => {
    localStorage.setItem('selected_location', String(id));
    set({ selectedLocationId: id });
  },
}));
