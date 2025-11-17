import { useProductsStore } from '@store/products.store';
import { useBusiness } from './useBusiness';

export const useProducts = () => {
  const productsStore = useProductsStore();
  const { business } = useBusiness();

  const loadProducts = async (filters?: any) => {
    if (!business) return;
    await productsStore.fetchProducts(business.id, filters);
  };

  const addNewProduct = async (data: any) => {
    if (!business) return;
    await productsStore.addProduct(business.id, data);
  };

  const scanBarcode = async (barcode: string) => {
    if (!business) return null;
    return await productsStore.searchByBarcode(business.id, barcode);
  };

  return {
    ...productsStore,
    loadProducts,
    addNewProduct,
    scanBarcode,
  };
};
