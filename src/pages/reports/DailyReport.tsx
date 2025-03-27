
import React from 'react';
import { DailyReportHeader } from './components/DailyReportHeader';
import { DailySalesTotals } from './components/DailySalesTotals';
import { DailyProductSalesTable } from './components/DailyProductSales';
import { DailyClientSalesTable } from './components/DailyClientSales';
import { useDailyReportQueries } from './hooks/useDailyReportQueries';
import { TransfersLoading } from '@/components/transfers/components/TransfersLoading';

export default function DailyReport() {
  const { 
    salesByProduct, 
    dailyTotals, 
    clientSales, 
    isLoading 
  } = useDailyReportQueries();

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Synthèse Quotidienne</h1>
        <div className="mt-4">
          <TransfersLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <DailyReportHeader />

      <div id="daily-report" className="space-y-8">
        {/* Résumé des totaux */}
        <DailySalesTotals dailyTotals={dailyTotals} />

        {/* Tableau des ventes par produit */}
        <DailyProductSalesTable salesByProduct={salesByProduct} />

        {/* Tableau des ventes par client */}
        <DailyClientSalesTable clientSales={clientSales} />
      </div>
    </div>
  );
}
