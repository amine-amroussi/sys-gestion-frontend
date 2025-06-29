"use client";
import ListeDesPurchases from "@/components/ListeDesPurchases";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const PurchasePage = () => {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <main className="w-full p-6">
      <h1 className="text-2xl font-bold my-2 capitalize">Gestion des Achats</h1>
      
      <ListeDesPurchases addOpen={addOpen} setAddOpen={setAddOpen} />
    </main>
  );
};

export default PurchasePage;