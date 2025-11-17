import { create } from 'zustand';
import { productsService } from '@services/supabase/products.service';
import type { Producto } from '@types/database';

interface ProductsState {
  // Estado
  products: Producto[];
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchProducts: (businessId: string, filters?: any) => Promise<void>;
  addProduct: (businessId: string, data: any) => Promise<void>;
  updateProduct: (productId: string, data: any) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  searchByBarcode: (businessId: string, barcode: string) => Promise<Producto | null>;
  setProducts: (products: Producto[]) => void;
  clearError: () => void;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async (businessId, filters) => {
    set({ isLoading: true, error: null });
    try {
      const products = await productsService.getProducts(businessId, filters);
      set({ products, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addProduct: async (businessId, data) => {
    set({ isLoading: true, error: null });
    try {
      const newProduct = await productsService.createProduct(businessId, data);
      set((state) => ({
        products: [...state.products, newProduct],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateProduct: async (productId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await productsService.updateProduct(productId, data);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === productId ? updated : p
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  removeProduct: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      await productsService.deleteProduct(productId);
      set((state) => ({
        products: state.products.filter((p) => p.id !== productId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  searchByBarcode: async (businessId, barcode) => {
    try {
      return await productsService.searchByBarcode(businessId, barcode);
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },

  setProducts: (products) => set({ products }),
  clearError: () => set({ error: null }),
}));
