"use client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useBox } from "@/store/boxStore";
import { axiosInstance } from "@/utils/axiosInstance";
import { ShowToast } from "@/utils/toast";

const EditBoxSheet = ({ open, setOpen, id }) => {
  const editBox = useBox((state) => state.editBox);
  const [boxInfo, setBoxInfo] = useState({
    designation: "",
    type: "",
  });

  useEffect(() => {
    const getBox = async () => {
      try {
        const response = await axiosInstance.get(`/box/${id}`);
        if (response.status === 200) {
          const data = await response.data;
          setBoxInfo(data.box);
        }
      } catch (error) {
        ShowToast.error(error.response?.data?.msg || "Erreur lors de la récupération du crate.");
      }
    };
    if (open && id) {
      getBox();
    }
  }, [open, id]);

  const handleClick = (e) => {
    e.preventDefault();

    // Validation côté client
    if (!boxInfo.designation) {
      ShowToast.errorValidation("Designation");
      return;
    }
    if (!boxInfo.type) {
      ShowToast.errorValidation("Type");
      return;
    }

    editBox(boxInfo, id);
    setOpen(false);
    // Réinitialiser le formulaire
    setBoxInfo({
      designation: "",
      type: "",
    });
  };

  const handleChange = (e) => {
    setBoxInfo({
      ...boxInfo,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Modifier Un Crate</SheetTitle>
          <SheetDescription>
            La Vous peuvez modifier un crate en changment des valeurs de le formulaire.
          </SheetDescription>
        </SheetHeader>
        <form className="text-sm" onSubmit={handleClick}>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="Designation">Designation</Label>
            <Input
              id="Designation"
              type="text"
              placeholder="Designation de crate"
              name="designation"
              value={boxInfo?.designation}
              onChange={handleChange}
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="Type">Type</Label>
            <Input
              id="Type"
              type="text"
              placeholder="Type de crate"
              name="type"
              value={boxInfo?.type}
              onChange={handleChange}
            />
          </div>
          <SheetFooter>
            <Button type="submit">Modifier</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EditBoxSheet;