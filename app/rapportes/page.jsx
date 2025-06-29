'use client';
import { useEffect } from 'react';
import { useRevenue } from '@/store/revenueStore';
import DateSelector from '@/components/DateSelector';
import RevenueDisplay from '@/components/RevenueDisplay';
import RevenueChart from '@/components/RevenueChart';
import PurchaseChart from '@/components/PurchaseChart';
import PaymentChart from '@/components/PaymentChart';

const RevenuePage = () => {
  const { fetchFinancialSummary, revenueState } = useRevenue();

  useEffect(() => {
    fetchFinancialSummary(revenueState.period);
  }, [revenueState.period]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de bord financier</h1>
      <DateSelector />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <RevenueDisplay />
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Total des achats ({revenueState.period})
          </h2>
          <p className="text-3xl font-semibold text-red-600">
            {revenueState.totalPurchases} MAD
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Total des paiements aux employés ({revenueState.period})
          </h2>
          <p className="text-3xl font-semibold text-teal-600">
            {revenueState.totalPayments} MAD
          </p>
        </div>
      </div>
      <RevenueChart />
      <PurchaseChart />
      <PaymentChart />
    </div>
  );
};

export default RevenuePage;