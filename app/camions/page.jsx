"use client";
import ListeDesCamions from "@/components/ListeDesCamions";
import AddCamionSheet from "@/components/sheet/AddCamionSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

const Camions = () => {
  const [open, setOpen] = useState(false);
  return (
    <main className="w-full">
      {/* <AddEmployeeSheet open={open} setOpen={setOpen} /> */}
      <AddCamionSheet open={open} setOpen={setOpen} />
      <h1 className="text-xl font-bold capitalize">Gestion des Camions</h1>
      <div className="my-5 w-full flex items-center justify-between ">
        
        <Button className="cursor-pointer" onClick={() => setOpen(true)}>
          Ajouter un camion
        </Button>
      </div>
      <h3 className="mb-4 font-semibold"> Liste des camions</h3>
      <ListeDesCamions />
    </main>
  );
};

export default Camions;
