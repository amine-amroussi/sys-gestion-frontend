'use client'
import ListeDesSuppliers from "@/components/ListeDesSuppliers";
import AddSupplierSheet from "@/components/sheet/AddSupplierSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

const Fournisseur = () => {
    const [open, setOpen] = useState(false);
  return (
    <main className="w-full">
        {/* <AddSupplierSheet open={open} setOpen={setOpen} /> */}
      <h1 className="text-xl font-bold capitalize">Gestion des feurnisseurs</h1>
      <div className="my-5 w-full flex items-center justify-between ">
        <Input
          className={"w-64 bg-gray-100"}
          name="search"
          type="search"
          placeholder="Rechercher un fournisseur"
        />
        {/* <Button className="cursor-pointer" onClick={() => setOpen(true)}>
          Ajouter un fournisseur
        </Button> */}
      </div>
      {/* <h3 className="mb-4 font-semibold"> Liste des fournisseurs</h3> */}
      <ListeDesSuppliers />
    </main>
  );
};

export default Fournisseur;
