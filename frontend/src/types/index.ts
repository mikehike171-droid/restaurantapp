// src/types/index.ts

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  phone?: string;
  qrCodeUrl?: string;
  qrCodeToken: string;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface FoodItem {
  id: number;
  locationId: number;
  categoryId: number;
  category?: Category;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isVeg: boolean;
  isAvailable: boolean;
  isActive: boolean;
  preparationTime: number;
  rating: number;
  discountText?: string;
}

export interface MenuGroup {
  category: Category;
  items: FoodItem[];
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  specialInstructions?: string;
}

export interface RestaurantTable {
  id: number;
  locationId: number;
  tableNumber: string;
  capacity: number;
  isAvailable: boolean;
}

export interface OrderItem {
  id: number;
  foodItemId: number;
  foodItem?: FoodItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  status: string;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  currentPincode?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  locationId: number;
  tableId: number;
  table?: RestaurantTable;
  publicUserId?: number;
  publicUser?: PublicUser;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  status: 'pending' | 'waiting' | 'preparing' | 'on_the_way' | 'delivered' | 'eating' | 'payment_due' | 'completed' | 'cancelled';
  totalAmount: number;
  discountAmount?: number;
  appliedOfferId?: number;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  locationIds: number[];
  isActive: boolean;
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Permission {
  id: string; // Permissions often keep string keys
  name: string;
  label: string;
  module: string;
}

export interface Offer {
  id: number;
  title: string;
  description?: string;
  promoCode: string;
  minAmount: number;
  discountAmount: number;
  type: 'fixed' | 'percentage';
  isActive: boolean;
  expiryDate?: string;
}
