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
import { useSupplier } from "@/store/supplierStore";
import { ShowToast } from "@/utils/toast";

const AddSupplierSheet = ({ open, setOpen, onSupplierAdded }) => {
  const { createSupplier, supplierState: { loadingSupplier, error } } = useSupplier();

  const [supplierInfo, setSupplierInfo] = useState({
    name: "",
    tel: "",
    address: "",
  });

  const handleClick = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!supplierInfo.name || supplierInfo.name.trim().length < 3) {
      ShowToast.errorValidation("Nom", "Le nom doit contenir au moins 3 caractères.");
      return;
    }
    if (!supplierInfo.tel || !/^\+?[\d\s-]{9,}$/.test(supplierInfo.tel.trim())) {
      ShowToast.errorValidation("Téléphone", "Le numéro de téléphone doit contenir au moins 9 chiffres.");
      return;
    }
    if (!supplierInfo.address || supplierInfo.address.trim().length < 5) {
      ShowToast.errorValidation("Adresse", "L'adresse doit contenir au moins 5 caractères.");
      return;
    }

    await createSupplier(supplierInfo);
    setOpen(false);
    setSupplierInfo({
      name: "",
      tel: "",
      address: "",
    });
    if (onSupplierAdded) onSupplierAdded();
  };

  const handleChange = (e) => {
    setSupplierInfo({
      ...supplierInfo,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>Ajouter un Fournisseur</SheetTitle>
          <SheetDescription>
            Remplissez le formulaire pour ajouter un nouveau fournisseur.
          </SheetDescription>
        </SheetHeader>
        {error && <p className="text-red-500 px-4">{error}</p>}
        <form className="text-sm flex flex-col gap-4" onSubmit={handleClick}>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="name">
              Nom <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Nom du fournisseur (min 3 caractères)"
              name="name"
              value={supplierInfo.name}
              onChange={handleChange}
              disabled={loadingSupplier}
              required
              minLength={3}
            />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="tel">
              Téléphone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tel"
              type="tel"
              placeholder="Numéro de téléphone (min 9 chiffres)"
              name="tel"
              value={supplierInfo.tel}
              onChange={handleChange}
              disabled={loadingSupplier}
              required
              pattern="\+?[\d\s-]{9,}"
            />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="address">
              Adresse <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="Adresse (min 5 caractères)"
              name="address"
              value={supplierInfo.address}
              onChange={handleChange}
              disabled={loadingSupplier}
              required
              minLength={5}
            />
          </div>
          <SheetFooter className="px-4">
            <Button type="submit" disabled={loadingSupplier}>
              {loadingSupplier ? "Ajout..." : "Ajouter"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddSupplierSheet;