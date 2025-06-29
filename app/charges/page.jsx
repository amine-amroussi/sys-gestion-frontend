"use client";
import ListeDesCharges from "@/components/ListeDesCharges";
import AddChargeSheet from "@/components/sheet/AddChargeSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const ChargePage = () => {
  const [open, setOpen] = useState(false);

  return (
    <main className="w-full">
      <AddChargeSheet open={open} setOpen={setOpen} />
      <h1 className="text-xl font-bold capitalize">Gestion des charges</h1>
      <div className="my-5 w-full flex items-center justify-between">
        {/* <Input
          className={"w-64 bg-gray-100"}
          name="search"
          type="search"
          placeholder="Rechercher une charge"
        /> */}
        <Button className="cursor-pointer" onClick={() => setOpen(true)}>
          Ajouter une charge
        </Button>
      </div>
      <h3 className="mb-4 font-semibold">Liste des charges</h3>
      <ListeDesCharges />
    </main>
  );
};

export default ChargePage;