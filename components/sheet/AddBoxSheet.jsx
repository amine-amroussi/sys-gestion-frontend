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
import { useBox } from "@/store/boxStore";
import { ShowToast } from "@/utils/toast";

const AddBoxSheet = ({ open, setOpen }) => {
  const createBox = useBox((state) => state.createBox);

  const [boxInfo, setBoxInfo] = useState({
    designation: "",
    type: "",
  });

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

    createBox(boxInfo);
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
          <SheetTitle>Ajouter Un Crate</SheetTitle>
          <SheetDescription>
            La Vous peuvez ajouter un crate en remplissant le formulaire.
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
              value={boxInfo.designation}
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
              value={boxInfo.type}
              onChange={handleChange}
            />
          </div>
          <SheetFooter>
            <Button type="submit">Ajouter</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddBoxSheet;