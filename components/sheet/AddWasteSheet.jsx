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
import { useWastes } from "@/store/wastesStore";
import { useProduct } from "@/store/productStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShowToast } from "@/utils/toast"; // Use ShowToast instead of sonner toast

const AddWasteSheet = ({ open, setOpen, onWasteAdded }) => {
  const {
    createWaste,
    fetchWastes,
    wasteState: { error },
  } = useWastes();
  const {
    productState: { products, loadingProduct },
    fetchAllProducts,
  } = useProduct();

  const [formData, setFormData] = useState({
    product: "",
    qtt: "",
    type: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchAllProducts(); // Fetch products when the sheet opens
  }, [fetchAllProducts]);

  useEffect(() => {
    if (error) {
      ShowToast.error(error || "Erreur lors de la gestion des déchets.");
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "qtt" ? parseFloat(value) || "" : value, // Convert qtt to number
    });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleProductChange = (value) => {
    setFormData({ ...formData, product: value });
    setFormErrors({ ...formErrors, product: "" });
  };

 const validateForm = () => {
  const errors = {};
  if (!formData.product) {
    errors.product = "Produit requis";
    ShowToast.errorValidation("Produit", "Veuillez sélectionner un produit.");
  }
  if (!formData.qtt || formData.qtt <= 0 || isNaN(formData.qtt)) {
    errors.qtt = "Quantité positive requise";
    ShowToast.errorValidation("Quantité", "Veuillez entrer une quantité positive.");
  }
  if (!formData.type) {
    errors.type = "Type requis";
    ShowToast.errorValidation("Type", "Veuillez entrer un type de déchet.");
  }
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const toastId = ShowToast.loading("Ajout du déchet...");
  try {
    // Ensure qtt is a number before sending
    const wasteInfo = {
      ...formData,
      qtt: parseFloat(formData.qtt), // Ensure qtt is a number
    };
    await createWaste(wasteInfo);
    setFormData({ product: "", qtt: "", type: "" });
    setOpen(false);
    if (onWasteAdded) onWasteAdded();
    fetchWastes();
    ShowToast.dismiss(toastId);
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Erreur lors de l'ajout du déchet.";
    ShowToast.dismiss(toastId);
    ShowToast.error(errorMessage);
  }
};

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>Ajouter un Déchet</SheetTitle>
          <SheetDescription>
            Remplissez le formulaire pour ajouter un nouveau déchet.
          </SheetDescription>
        </SheetHeader>
        {error && <p className="text-red-500 px-4">{error}</p>}
        <form className="text-sm flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="product">Produit</Label>
            <Select
              value={formData.product}
              onValueChange={handleProductChange}
              name="product"
              disabled={loadingProduct}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un produit" />
              </SelectTrigger>
              <SelectContent>
                {loadingProduct ? (
                  <SelectItem value="loading" disabled>
                    Chargement...
                  </SelectItem>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.designation}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Aucun produit disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {formErrors.product && (
              <p className="text-red-500 text-xs mt-1">{formErrors.product}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="qtt">Quantité</Label>
            <Input
              id="qtt"
              type="number"
              placeholder="Entrez la quantité"
              name="qtt"
              value={formData.qtt}
              onChange={handleChange}
              disabled={loadingProduct}
              min="0"
            />
            {formErrors.qtt && (
              <p className="text-red-500 text-xs mt-1">{formErrors.qtt}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              type="text"
              placeholder="Entrez le type (ex: Damaged)"
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={loadingProduct}
            />
            {formErrors.type && (
              <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>
            )}
          </div>
          <SheetFooter className="px-4">
            <Button type="submit" disabled={loadingProduct}>
              {loadingProduct ? "Ajout..." : "Ajouter"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddWasteSheet;
