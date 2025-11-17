import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as PDFLib from "https://esm.sh/pdfkit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ReportRequest {
  type: "sales" | "inventory" | "financial" | "daily";
  businessId: string;
  startDate: string;
  endDate: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as ReportRequest;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let reportData: any;

    switch (body.type) {
      case "sales":
        reportData = await generateSalesReport(supabase, body);
        break;
      case "inventory":
        reportData = await generateInventoryReport(supabase, body);
        break;
      case "financial":
        reportData = await generateFinancialReport(supabase, body);
        break;
      case "daily":
        reportData = await generateDailyReport(supabase, body);
        break;
    }

    // Generar PDF (simulado - en producción usar librería PDF)
    const pdfContent = `
Reporte ${body.type.toUpperCase()}
Período: ${body.startDate} a ${body.endDate}
Negocio: ${reportData.businessName}

${JSON.stringify(reportData.data, null, 2)}
    `;

    return new Response(pdfContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte_${body.type}.pdf"`,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function generateSalesReport(supabase: any, req: ReportRequest) {
  const { data, error } = await supabase
    .from("ventas")
    .select("*")
    .eq("negocio_id", req.businessId)
    .gte("created_at", req.startDate)
    .lte("created_at", req.endDate);

  if (error) throw error;

  const totalSales = data.reduce((sum: number, v: any) => sum + v.total, 0);
  const byPaymentMethod: any = {};

  data.forEach((sale: any) => {
    byPaymentMethod[sale.metodo_pago] =
      (byPaymentMethod[sale.metodo_pago] || 0) + sale.total;
  });

  return {
    businessName: req.businessId,
    data: {
      totalSales,
      quantity: data.length,
      byPaymentMethod,
      averageSale: data.length > 0 ? totalSales / data.length : 0,
    },
  };
}

async function generateInventoryReport(supabase: any, req: ReportRequest) {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("negocio_id", req.businessId);

  if (error) throw error;

  const lowStock = data.filter((p: any) => p.stock_actual < p.stock_minimo);
  const totalValue = data.reduce(
    (sum: number, p: any) => sum + p.precio_compra * p.stock_actual,
    0
  );

  return {
    businessName: req.businessId,
    data: {
      totalProducts: data.length,
      lowStock: lowStock.length,
      totalInventoryValue: totalValue,
      products: data,
    },
  };
}

async function generateFinancialReport(supabase: any, req: ReportRequest) {
  const [salesData, expensesData] = await Promise.all([
    supabase
      .from("ventas")
      .select("total")
      .eq("negocio_id", req.businessId)
      .gte("created_at", req.startDate)
      .lte("created_at", req.endDate),
    supabase
      .from("cash_movements")
      .select("monto, tipo")
      .eq("negocio_id", req.businessId)
      .eq("tipo", "EGRESO")
      .gte("created_at", req.startDate)
      .lte("created_at", req.endDate),
  ]);

  const totalIncome = salesData.data.reduce(
    (sum: number, v: any) => sum + v.total,
    0
  );
  const totalExpenses = expensesData.data.reduce(
    (sum: number, v: any) => sum + v.monto,
    0
  );
  const netIncome = totalIncome - totalExpenses;

  return {
    businessName: req.businessId,
    data: {
      totalIncome,
      totalExpenses,
      netIncome,
      profitMargin: totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0,
    },
  };
}

async function generateDailyReport(supabase: any, req: ReportRequest) {
  const { data: sales } = await supabase
    .from("ventas")
    .select("*")
    .eq("negocio_id", req.businessId)
    .gte("created_at", req.startDate)
    .lte("created_at", req.endDate);

  const { data: movements } = await supabase
    .from("cash_movements")
    .select("*")
    .eq("negocio_id", req.businessId)
    .gte("created_at", req.startDate)
    .lte("created_at", req.endDate);

  return {
    businessName: req.businessId,
    data: {
      sales: sales.length,
      totalSales: sales.reduce((sum: number, s: any) => sum + s.total, 0),
      ingresos: movements
        .filter((m: any) => m.tipo === "INGRESO")
        .reduce((sum: number, m: any) => sum + m.monto, 0),
      egresos: movements
        .filter((m: any) => m.tipo === "EGRESO")
        .reduce((sum: number, m: any) => sum + m.monto, 0),
    },
  };
}
