
"use client";
import ListeDesWastes from "@/components/ListeDesWastes";
import AddWasteSheet from "@/components/sheet/AddWasteSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { List } from "lucide-react";
import { useState } from "react";

const WastePage = () => {
  const [open, setOpen] = useState(false);

  return (
    <main className="w-full">
      <AddWasteSheet open={open} setOpen={setOpen} />
      <h1 className="text-xl font-bold capitalize">Gestion des déchets</h1>
      <div className="my-5 w-full flex items-center justify-between">
        {/* <Input
          className={"w-64 bg-gray-100"}
          name="search"
          type="search"
          placeholder="Rechercher un déchet"
        /> */}
        <Button className="cursor-pointer" onClick={() => setOpen(true)}>
          Ajouter un déchet
        </Button>
      </div>
      <h3 className="mb-4 font-semibold">Liste des déchets</h3>
      <ListeDesWastes />
    </main>
  );
};

export default WastePage;
