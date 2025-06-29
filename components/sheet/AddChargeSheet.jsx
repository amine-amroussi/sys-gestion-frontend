"use client";
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
import { useState, useEffect } from "react";
import { useCharges } from "@/store/chargeStore";
import { ShowToast } from "@/utils/toast";

const AddChargeSheet = ({ open, setOpen, onChargeAdded }) => {
  const {
    createCharge,
    fetchAllCharges,
    chargeState: { error, loadingCharge },
  } = useCharges();

  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    date: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (error) {
      ShowToast.error(error || "Erreur lors de la gestion des charges.");
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.type) {
      errors.type = "Type requis";
      ShowToast.errorValidation("Type", "Veuillez entrer un type de charge.");
    }
    if (!formData.amount || formData.amount <= 0 || isNaN(formData.amount)) {
      errors.amount = "Montant positif requis";
      ShowToast.errorValidation("Montant", "Veuillez entrer un montant positif.");
    }
    if (!formData.date) {
      errors.date = "Date requise";
      ShowToast.errorValidation("Date", "Veuillez sélectionner une date.");
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const toastId = ShowToast.loading("Ajout de la charge...");
    try {
      const chargeInfo = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date,
      };
      await createCharge(chargeInfo);
      setFormData({ type: "", amount: "", date: "" });
      setOpen(false);
      if (onChargeAdded) onChargeAdded();
      fetchAllCharges();
      ShowToast.dismiss(toastId);
      ShowToast.success("Charge ajoutée avec succès");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors de l'ajout de la charge.";
      ShowToast.dismiss(toastId);
      ShowToast.error(errorMessage);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>Ajouter une Charge</SheetTitle>
          <SheetDescription>
            Remplissez le formulaire pour ajouter une nouvelle charge.
          </SheetDescription>
        </SheetHeader>
        {error && <p className="text-red-500 px-4">{error}</p>}
        <form className="text-sm flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              type="text"
              placeholder="Entrez le type (ex: Fuel)"
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={loadingCharge}
            />
            {formErrors.type && (
              <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="amount">Montant (MAD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Entrez le montant"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              disabled={loadingCharge}
              min="0"
              step="0.01"
            />
            {formErrors.amount && (
              <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={loadingCharge}
            />
            {formErrors.date && (
              <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
            )}
          </div>
          <SheetFooter className="px-4">
            <Button type="submit" disabled={loadingCharge}>
              {loadingCharge ? "Ajout..." : "Ajouter"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddChargeSheet;