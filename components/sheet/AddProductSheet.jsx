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
import { useEffect, useState } from "react";
import { useProduct } from "@/store/productStore";
import { useBox } from "@/store/boxStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShowToast } from "@/utils/toast";

const AddProductSheet = ({ open, setOpen }) => {
  const createProduct = useProduct((state) => state.createProduct);
  const fetchAllBoxes = useBox((state) => state.fetchAllBoxes);
  const boxes = useBox((state) => state.boxState.boxes);

  useEffect(() => {
    fetchAllBoxes();
  }, [fetchAllBoxes]);

  const [productInfo, setProductInfo] = useState({
    designation: "",
    genre: "",
    priceUnite: "",
    capacityByBox: "",
    box: "",
  });

  const handleClick = (e) => {
    e.preventDefault();

    // Client-side validation
    if (!productInfo.designation || productInfo.designation.trim().length < 3) {
      ShowToast.errorValidation("Designation", "La désignation doit contenir au moins 3 caractères.");
      return;
    }
    if (!productInfo.genre || productInfo.genre.trim().length < 3) {
      ShowToast.errorValidation("Genre", "Le genre doit contenir au moins 3 caractères.");
      return;
    }
    const priceUniteValue = Number(productInfo.priceUnite);
    if (
      productInfo.priceUnite === "" ||
      isNaN(priceUniteValue) ||
      priceUniteValue < 0 ||
      priceUniteValue > 999999.99
    ) {
      ShowToast.errorValidation("Prix unitaire", "Le prix unitaire doit être un nombre positif inférieur à 1 000 000.");
      return;
    }
    const capacityByBoxValue = Number(productInfo.capacityByBox);
    if (
      productInfo.capacityByBox === "" ||
      isNaN(capacityByBoxValue) ||
      capacityByBoxValue < 0 ||
      capacityByBoxValue > 32767 ||
      !Number.isInteger(capacityByBoxValue)
    ) {
      ShowToast.errorValidation("Capacité par crate", "La capacité par crate doit être un entier positif inférieur à 32 768.");
      return;
    }
    if (!productInfo.box) {
      ShowToast.errorValidation("Crate", "Veuillez sélectionner un crate.");
      return;
    }

    createProduct(productInfo);
    setOpen(false);
    setProductInfo({
      designation: "",
      genre: "",
      priceUnite: "",
      capacityByBox: "",
      box: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductInfo((prev) => ({
      ...prev,
      [name]: name === "priceUnite" || name === "capacityByBox" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const changeBox = (value) => {
    setProductInfo({ ...productInfo, box: value });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Ajouter Un Produit</SheetTitle>
          <SheetDescription>
            La Vous pouvez ajouter un produit en remplissant le formulaire.
          </SheetDescription>
        </SheetHeader>
        <form className="text-sm" onSubmit={handleClick}>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="Designation">
              Designation <span className="text-red-500">*</span>
            </Label>
            <Input
              id="Designation"
              type="text"
              placeholder="Designation de produit (min 3 caractères)"
              name="designation"
              value={productInfo.designation}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="Genre">
              Genre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="Genre"
              type="text"
              placeholder="Genre de produit (min 3 caractères)"
              name="genre"
              value={productInfo.genre}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="priceUnite">
              Prix Unitaire <span className="text-red-500">*</span>
            </Label>
            <Input
              id="priceUnite"
              type="number"
              name="priceUnite"
              placeholder="Prix unitaire (max 999999.99)"
              value={productInfo.priceUnite}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="999999.99"
              required
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="capacityByBox">
              Capacité par Crate <span className="text-red-500">*</span>
            </Label>
            <Input
              id="capacityByBox"
              type="number"
              name="capacityByBox"
              placeholder="Capacité par crate (max 32767)"
              value={productInfo.capacityByBox}
              onChange={handleChange}
              step="1"
              min="0"
              max="32767"
              required
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="box">
              Choisir le crate <span className="text-red-500">*</span>
            </Label>
            <Select
              value={productInfo.box}
              onValueChange={changeBox}
              name="box"
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un crate" />
              </SelectTrigger>
              <SelectContent>
                {boxes.length > 0 ? (
                  boxes.map((box) => (
                    <SelectItem key={box.id} value={box.id.toString()}>
                      {box.designation}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Aucun crate disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <SheetFooter>
            <Button type="submit">Ajouter</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddProductSheet;