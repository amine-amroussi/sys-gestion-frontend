"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { usePaymentStore } from "@/store/PaymentStore";

const PaymentSummary = () => {
  const { fetchSummary, state } = usePaymentStore();
  const { summary, loading } = state;
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    fetchSummary(undefined, undefined);
  }, [fetchSummary]);

  const handleFetchSummary = () => {
    fetchSummary(month || undefined, year || undefined);
  };

  const safeSummary = summary || { totalPayments: 0, totalNetPay: 0, totalCredit: 0 };

  return (
    <div className="bg-white rounded-lg p-5 shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4">Résumé des Paiements</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor="month" className="text-sm font-medium">Mois</Label>
          <Input
            id="month"
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="1-12"
            className="w-full text-sm"
          />
        </div>
        <div>
          <Label htmlFor="year" className="text-sm font-medium">Année</Label>
          <Input
            id="year"
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="ex., 2025"
            className="w-full text-sm"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleFetchSummary} disabled={loading} className="w-full">
            {loading ? "Chargement..." : "Afficher le Résumé"}
          </Button>
        </div>
      </div>
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Paiements</p>
            <p className="text-lg font-bold">{safeSummary.totalPayments}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Net Pay (MAD)</p>
            <p className="text-lg font-bold">{safeSummary.totalNetPay.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Crédit (MAD)</p>
            <p className="text-lg font-bold">{safeSummary.totalCredit.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSummary;