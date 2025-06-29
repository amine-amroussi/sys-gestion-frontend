"use client";

import MetricCard from "@/components/MetricCard";
import { useDefaultStore } from "@/store/defaultStore";
import { Archive, ArchiveX, ArrowUpDown, Box, DollarSign, ScanBarcode, ShoppingCart, Truck, User, Users } from "lucide-react";
import { useEffect } from "react";

const Dashboard = () => {

  const { defaultState , fetchDefaultData } = useDefaultStore();
  console.log(defaultState);

  useEffect(() => {
    fetchDefaultData();
  }, [fetchDefaultData]);
  

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center underline mb-6 border-2 rounded bg-gray-50 p-3 border-black">Vision General</h1>

      {/* <FilterSection
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
      /> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 ">
        <MetricCard
          title="Produit Totaux"
          value={ defaultState.productCount || 0 }
          icon={<ScanBarcode className="size-9 text-blue-500" />}
          loading={defaultState.loading}
        />
        <MetricCard
          title="Montant Total Stock Produits"
          value={ defaultState.totalPrice.toFixed(2) + " MAD" || 0 } 
          icon={<DollarSign className="size-11 text-yellow-500" />}
          loading={defaultState.loading}
        />
        <MetricCard
          title="Nombre des Employés"
          value={ defaultState.employeeCount || 0 } 
          icon={<User className="size-11 text-sky-500" />}
          loading={defaultState.loading}
        />
        <MetricCard
          title="Nombres des Fournisseurs"
          value={ defaultState.supplierCount || 0 } 
          icon={<Users className="size-11 text-pink-500" />}
          loading={defaultState.loading}
        />
        <MetricCard
          title="Nombres des Boites"
          value={ defaultState.boxCount || 0 } 
          icon={<Box className="size-11 text-teal-500" />}
          loading={defaultState.loading}
        />
        <MetricCard
          title="Nombres des Camions"
          value={ defaultState.truckCount || 0 } 
          icon={<Truck className="size-11 text-blue-400" />}
          loading={defaultState.loading}
        />
        <MetricCard
          title="Active Tournées"
          value={ defaultState.activeTrips || 0 } 
          icon={<div className="flex items-center gap-2"><Truck className="size-10 text-red-400" /> <ArrowUpDown className="size-9 text-red-400" /></div>}
          loading={defaultState.loading}
        />
        <MetricCard
          title="Les Boites Vides"
          value={ defaultState.emptyBoxes || 0 } 
          icon={<ArchiveX className="size-9 text-green-500" />}
          loading={defaultState.loading}
        />
        <MetricCard
          title="Les Boites En Stock"
          value={ defaultState.inStockBoxes || 0 } 
          icon={<Archive className="size-9 text-green-500" />}
          loading={defaultState.loading}
        />
        <MetricCard
          title="Les Boites Sorties"
          value={ defaultState.sentBoxes || 0 } 
          icon={<Archive className="size-9 text-green-500" />}
          loading={defaultState.loading}
        />
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Achats au Fil du Temps" loading={purchaseLoading}>
          <Bar data={chartDataPurchases} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
        </ChartCard>
        <ChartCard title="Revenus des Tournées au Fil du Temps" loading={tripLoading}>
          <Line data={chartDataTrips} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
        </ChartCard>
        <ChartCard title="Statut des Paiements" loading={paymentLoading}>
          <Pie data={chartDataPayments} options={{ responsive: true }} />
        </ChartCard>
        <ChartCard title="Quantité Totale de Déchets" loading={wasteLoading}>
          <div className="text-2xl font-bold text-center">
            {wasteData?.totalWasteQuantity.toFixed(2) || 0} kg
          </div>
        </ChartCard>
      </div> */}

    </div>
  );
};

export default Dashboard;