import { useSalesStore } from '@store/sales.store';
import { useBusiness } from './useBusiness';

export const useSales = () => {
  const salesStore = useSalesStore();
  const { business } = useBusiness();

  const completeSale = async (data: any) => {
    if (!business) return;
    return await salesStore.createSale(business.id, {
      ...data,
      estado: 'PAGADO',
    });
  };

  const loadSalesHistory = async (filters?: any) => {
    if (!business) return;
    await salesStore.fetchSales(business.id, filters);
  };

  const getSummary = async (days?: number) => {
    if (!business) return null;
    return await salesStore.getSalesSummary(business.id, days);
  };

  return {
    ...salesStore,
    completeSale,
    loadSalesHistory,
    getSummary,
  };
};
