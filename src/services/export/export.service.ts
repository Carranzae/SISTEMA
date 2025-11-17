import * as FileSystem from 'expo-file-system';
import { Share } from 'react-native';
import { formatCurrency, formatDate } from '@utils/formatters';

export const exportService = {
  // Exportar a CSV
  async exportToCSV(
    filename: string,
    headers: string[],
    rows: string[][]
  ) {
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const fileUri = `${FileSystem.cacheDirectory}${filename}.csv`;

    try {
      await FileSystem.writeAsStringAsync(fileUri, csv);
      return fileUri;
    } catch (error) {
      throw new Error('Error exportando CSV');
    }
  },

  // Generar reporte de ventas
  async generateSalesReport(
    sales: any[],
    businessName: string,
    currency: string
  ) {
    const headers = ['Fecha', 'Monto', 'Método de Pago', 'Estado'];
    const rows = sales.map((sale) => [
      formatDate(sale.created_at),
      formatCurrency(sale.total, currency),
      sale.metodo_pago,
      sale.estado,
    ]);

    return this.exportToCSV(
      `ventas_${Date.now()}`,
      headers,
      rows
    );
  },

  // Generar reporte de inventario
  async generateInventoryReport(
    products: any[],
    businessName: string,
    currency: string
  ) {
    const headers = [
      'Producto',
      'Código',
      'Stock',
      'Precio Venta',
      'Stock Mínimo',
    ];
    const rows = products.map((product) => [
      product.nombre,
      product.codigo || 'N/A',
      product.stock_actual.toString(),
      formatCurrency(product.precio_venta, currency),
      product.stock_minimo.toString(),
    ]);

    return this.exportToCSV(
      `inventario_${Date.now()}`,
      headers,
      rows
    );
  },

  // Compartir archivo
  async shareFile(fileUri: string, filename: string) {
    try {
      await Share.share({
        url: fileUri,
        title: filename,
        message: `Reporte: ${filename}`,
      });
    } catch (error) {
      throw new Error('Error compartiendo archivo');
    }
  },

  // Generar PDF simple (texto)
  async generatePDFText(
    content: string,
    filename: string
  ) {
    const fileUri = `${FileSystem.cacheDirectory}${filename}.txt`;

    try {
      await FileSystem.writeAsStringAsync(fileUri, content);
      return fileUri;
    } catch (error) {
      throw new Error('Error generando reporte');
    }
  },
};
