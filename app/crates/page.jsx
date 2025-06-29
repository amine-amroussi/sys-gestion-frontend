"use client";
import ListeCrates from "@/components/ListeCrates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLayoutEffect, useState } from "react";
import { useBox } from "@/store/boxStore";
import AddBoxSheet from "@/components/sheet/AddBoxSheet";

const Crates = () => {

  

  const [open, setOpen] = useState(false);

  return (
    <main className="w-full">
      <h1 className="text-xl font-bold capitalize">Gestion des crates</h1>
      <AddBoxSheet open={open} setOpen={setOpen} />
      <div className="my-5 w-full flex items-center justify-between ">
       
        <Button className="cursor-pointer" onClick={() => setOpen(true)}>Ajouter un crate</Button>
      </div>
      <h3 className="mb-4 font-semibold"> Liste des crates</h3>
      <ListeCrates />
    </main>
  );
};

export default Crates;
