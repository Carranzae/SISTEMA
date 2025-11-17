import { create } from 'zustand';
import { salesService } from '@services/supabase/sales.service';
import type { Venta, VentaItem } from '@types/database';

interface SalesState {
  // Carrito actual
  cartItems: VentaItem[];
  subtotal: number;
  impuesto: number;
  descuento: number;
  total: number;

  // Historial
  ventas: Venta[];
  isLoading: boolean;
  error: string | null;

  // Acciones del carrito
  addToCart: (item: VentaItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (discount: number) => void;

  // Acciones de ventas
  createSale: (businessId: string, data: any) => Promise<Venta>;
  fetchSales: (businessId: string, filters?: any) => Promise<void>;
  cancelSale: (saleId: string) => Promise<void>;
  getSalesSummary: (businessId: string, days?: number) => Promise<any>;

  // Utilidades
  clearError: () => void;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  cartItems: [],
  subtotal: 0,
  impuesto: 0,
  descuento: 0,
  total: 0,
  ventas: [],
  isLoading: false,
  error: null,

  addToCart: (item) => {
    set((state) => {
      const existing = state.cartItems.find(
        (i) => i.producto_id === item.producto_id
      );

      let newItems: VentaItem[];
      if (existing) {
        newItems = state.cartItems.map((i) =>
          i.producto_id === item.producto_id
            ? { ...i, cantidad: i.cantidad + item.cantidad }
            : i
        );
      } else {
        newItems = [...state.cartItems, item];
      }

      const subtotal = newItems.reduce((sum, i) => sum + i.subtotal, 0);
      const impuesto = subtotal * 0.18; // IGV 18%
      const total = subtotal + impuesto - state.descuento;

      return {
        cartItems: newItems,
        subtotal,
        impuesto,
        total,
      };
    });
  },

  removeFromCart: (productId) => {
    set((state) => {
      const newItems = state.cartItems.filter(
        (i) => i.producto_id !== productId
      );
      const subtotal = newItems.reduce((sum, i) => sum + i.subtotal, 0);
      const impuesto = subtotal * 0.18;
      const total = subtotal + impuesto - state.descuento;

      return {
        cartItems: newItems,
        subtotal,
        impuesto,
        total,
      };
    });
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      const newItems = state.cartItems
        .map((i) =>
          i.producto_id === productId
            ? {
                ...i,
                cantidad: quantity,
                subtotal: i.precio_unitario * quantity,
              }
            : i
        )
        .filter((i) => i.cantidad > 0);

      const subtotal = newItems.reduce((sum, i) => sum + i.subtotal, 0);
      const impuesto = subtotal * 0.18;
      const total = subtotal + impuesto - state.descuento;

      return {
        cartItems: newItems,
        subtotal,
        impuesto,
        total,
      };
    });
  },

  clearCart: () =>
    set({
      cartItems: [],
      subtotal: 0,
      impuesto: 0,
      descuento: 0,
      total: 0,
    }),

  setDiscount: (discount) => {
    set((state) => {
      const total = state.subtotal + state.impuesto - discount;
      return { descuento: discount, total };
    });
  },

  createSale: async (businessId, data) => {
    set({ isLoading: true, error: null });
    try {
      const venta = await salesService.createSale(businessId, data);
      set((state) => ({
        ventas: [venta, ...state.ventas],
        isLoading: false,
      }));
      get().clearCart();
      return venta;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchSales: async (businessId, filters) => {
    set({ isLoading: true, error: null });
    try {
      const ventas = await salesService.getSales(businessId, filters);
      set({ ventas, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  cancelSale: async (saleId) => {
    set({ isLoading: true, error: null });
    try {
      await salesService.cancelSale(saleId);
      set((state) => ({
        ventas: state.ventas.map((v) =>
          v.id === saleId ? { ...v, estado: 'ANULADO' } : v
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getSalesSummary: async (businessId, days = 30) => {
    try {
      return await salesService.getSalesSummary(businessId, days);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
