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
import { useEffect, useState } from "react";
import { useProduct } from "@/store/productStore";
import { useBox } from "@/store/boxStore";
import { axiosInstance } from "@/utils/axiosInstance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShowToast } from "@/utils/toast";

const EditProductSheet = ({ open, setOpen, productId }) => {
  const editProduct = useProduct((state) => state.editProduct);
  const fetchAllBoxes = useBox((state) => state.fetchAllBoxes);
  const boxes = useBox((state) => state.boxState.boxes);

  useEffect(() => {
    fetchAllBoxes();
    const getProduct = async () => {
      try {
        const response = await axiosInstance.get(`/product/${productId}`);
        if (response.status === 200) {
          const data = await response.data;
          setProductInfo({
            designation: data.data.product.designation,
            genre: data.data.product.genre,
            priceUnite: data.data.product.priceUnite || 0,
            capacityByBox: data.data.product.capacityByBox || 0,
            box: data.data.product.box ? data.data.product.box.toString() : "",
          });
        }
      } catch (error) {
        ShowToast.error(error.response?.data?.msg || "Erreur lors de la récupération du produit.");
      }
    };
    if (open && productId) {
      getProduct();
    }
  }, [open, productId, fetchAllBoxes]);

  const [productInfo, setProductInfo] = useState({
    designation: "",
    genre: "",
    priceUnite: 0,
    capacityByBox: 0,
    box: "",
  });

  const handleClick = (e) => {
    e.preventDefault();

    // Client-side validation
    if (!productInfo.designation) {
      ShowToast.errorValidation("Designation");
      return;
    }
    if (!productInfo.genre) {
      ShowToast.errorValidation("Genre");
      return;
    }
    if (productInfo.priceUnite < 0 || isNaN(Number(productInfo.priceUnite))) {
      ShowToast.errorValidation("Prix unitaire");
      return;
    }
    if (productInfo.capacityByBox < 0 || isNaN(Number(productInfo.capacityByBox))) {
      ShowToast.errorValidation("Capacité par crate");
      return;
    }
    if (!productInfo.box) {
      ShowToast.errorValidation("Crate");
      return;
    }

    editProduct(productInfo, productId);
    setOpen(false);
    setProductInfo({
      designation: "",
      genre: "",
      priceUnite: 0,
      capacityByBox: 0,
      box: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductInfo((prev) => ({
      ...prev,
      [name]: name === "priceUnite" || name === "capacityByBox" ? Number(value) : value,
    }));
  };

  const changeBox = (value) => {
    setProductInfo({ ...productInfo, box: value });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Modifier Un Produit</SheetTitle>
          <SheetDescription>
            La Vous pouvez modifier un produit en changeant les informations du formulaire.
          </SheetDescription>
        </SheetHeader>
        <form className="text-sm" onSubmit={handleClick}>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="Designation">Designation</Label>
            <Input
              id="Designation"
              type="text"
              placeholder="Designation de produit"
              name="designation"
              value={productInfo.designation}
              onChange={handleChange}
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="Genre">Genre</Label>
            <Input
              id="Genre"
              type="text"
              placeholder="Genre de produit"
              name="genre"
              value={productInfo.genre}
              onChange={handleChange}
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="priceUnite">Prix Unitaire</Label>
            <Input
              id="priceUnite"
              type="number"
              name="priceUnite"
              value={productInfo.priceUnite}
              onChange={handleChange}
              step="0.01" // Allow decimals
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="capacityByBox">Capacité par Crate</Label>
            <Input
              id="capacityByBox"
              type="number"
              name="capacityByBox"
              value={productInfo.capacityByBox}
              onChange={handleChange}
              step="1" // Integer only
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="box">Choisir le crate</Label>
            <Select
              value={productInfo.box}
              onValueChange={changeBox}
              name="box"
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
            <Button type="submit">Modifier</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EditProductSheet;