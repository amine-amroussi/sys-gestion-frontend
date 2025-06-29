import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { useCamion } from "@/store/camionStore";
import { ShowToast } from "@/utils/toast";

const AddCamionSheet = ({ open, setOpen, onCamionAdded }) => {
  const { createCamion, camionState: { loadingCamion } } = useCamion();

  const [camionInfo, setCamionInfo] = useState({
    matricule: "",
    capacity: "",
  });

  const handleClick = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!camionInfo.matricule || camionInfo.matricule.trim().length === 0) {
      ShowToast.errorValidation("Matricule", "Le matricule est requis.");
      return;
    }
    const capacityValue = Number(camionInfo.capacity);
    if (
      camionInfo.capacity === "" ||
      isNaN(capacityValue) ||
      capacityValue < 1 ||
      capacityValue > 100000 ||
      !Number.isInteger(capacityValue)
    ) {
      ShowToast.errorValidation("Capacité", "La capacité doit être un entier positif entre 1 et 100 000.");
      return;
    }

    await createCamion(camionInfo);
    setOpen(false);
    setCamionInfo({
      matricule: "",
      capacity: "",
    });
    if (onCamionAdded) onCamionAdded();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCamionInfo((prev) => ({
      ...prev,
      [name]: name === "capacity" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>Ajouter un Camion</SheetTitle>
          <SheetDescription>
            Remplissez le formulaire pour ajouter un nouveau camion.
          </SheetDescription>
        </SheetHeader>
        <form className="text-sm flex flex-col gap-4" onSubmit={handleClick}>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="matricule">
              Matricule <span className="text-red-500">*</span>
            </Label>
            <Input
              id="matricule"
              type="text"
              placeholder="Matricule du camion (ex. ABC-123-A)"
              name="matricule"
              value={camionInfo.matricule}
              onChange={handleChange}
              disabled={loadingCamion}
              required
            />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="capacity">
              Capacité <span className="text-red-500">*</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              placeholder="Capacité (1 à 100000)"
              name="capacity"
              value={camionInfo.capacity}
              onChange={handleChange}
              disabled={loadingCamion}
              required
              step="1"
              min="1"
              max="100000"
            />
          </div>
          <SheetFooter className="px-4">
            <Button type="submit" disabled={loadingCamion}>
              {loadingCamion ? "Ajout..." : "Ajouter"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddCamionSheet;