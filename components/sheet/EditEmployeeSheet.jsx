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
import { useEmployee } from "@/store/employeeStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShowToast } from "@/utils/toast";

const EditEmployeeSheet = ({ open, setOpen, cin, onEmployeeEdited }) => {
  const { fetchEmployee, editEmployee, employeeState: { selectedEmployee, loadingEmployee, error } } = useEmployee();

  const [employeeInfo, setEmployeeInfo] = useState({
    cin: "",
    role: "",
    name: "",
    address: "",
    tel: "",
    salary_fix: "",
  });

  useEffect(() => {
    if (cin) {
      fetchEmployee(cin);
    }
  }, [cin, fetchEmployee]);

  useEffect(() => {
    if (selectedEmployee) {
      setEmployeeInfo({
        cin: selectedEmployee.cin || "",
        role: selectedEmployee.role || "",
        name: selectedEmployee.name || "",
        address: selectedEmployee.address || "",
        tel: selectedEmployee.tel || "",
        salary_fix: selectedEmployee.salary_fix || "",
      });
    }
  }, [selectedEmployee]);

  const handleClick = async (e) => {
    e.preventDefault();

    // Client-side validation (similar to AddEmployeeSheet)
    if (!employeeInfo.name || employeeInfo.name.trim().length < 3) {
      ShowToast.errorValidation("Nom", "Le nom doit contenir au moins 3 caractères.");
      return;
    }
    if (!employeeInfo.tel || !/^\+?[\d\s-]{9,}$/.test(employeeInfo.tel.trim())) {
      ShowToast.errorValidation("Téléphone", "Le numéro de téléphone doit contenir au moins 9 chiffres.");
      return;
    }
    if (!employeeInfo.address || employeeInfo.address.trim().length < 5) {
      ShowToast.errorValidation("Adresse", "L'adresse doit contenir au moins 5 caractères.");
      return;
    }
    const salaryFixValue = Number(employeeInfo.salary_fix);
    if (
      employeeInfo.salary_fix === "" ||
      isNaN(salaryFixValue) ||
      salaryFixValue < 0 ||
      salaryFixValue > 999999.99
    ) {
      ShowToast.errorValidation("Salaire Fixe", "Le salaire doit être un nombre positif inférieur à 1 000 000.");
      return;
    }
    if (!employeeInfo.role) {
      ShowToast.errorValidation("Rôle", "Veuillez sélectionner un rôle.");
      return;
    }

    await editEmployee(employeeInfo, cin);
    setOpen(false);
    setEmployeeInfo({
      cin: "",
      role: "",
      name: "",
      address: "",
      tel: "",
      salary_fix: "",
    });
    if (onEmployeeEdited) onEmployeeEdited();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeInfo((prev) => ({
      ...prev,
      [name]: name === "salary_fix" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const changeRole = (value) => {
    setEmployeeInfo({ ...employeeInfo, role: value });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>Modifier un Employé</SheetTitle>
          <SheetDescription>
            Vous pouvez modifier un employé en changeant les informations du formulaire.
          </SheetDescription>
        </SheetHeader>
        {error && <p className="text-red-500 px-4">{error}</p>}
        <form className="text-sm flex flex-col gap-4" onSubmit={handleClick}>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="cin">
              CIN <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cin"
              type="text"
              placeholder="Numéro CIN"
              name="cin"
              value={employeeInfo.cin}
              onChange={handleChange}
              disabled={true} // CIN is immutable
            />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="name">
              Nom <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Nom de l'employé (min 3 caractères)"
              name="name"
              value={employeeInfo.name}
              onChange={handleChange}
              disabled={loadingEmployee}
              required
              minLength={3}
            />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="role">
              Rôle <span className="text-red-500">*</span>
            </Label>
            <Select
              value={employeeInfo.role}
              onValueChange={changeRole}
              name="role"
              disabled={loadingEmployee}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Assistent">Assistent</SelectItem>
                <SelectItem value="Driver">Driver</SelectItem>
                <SelectItem value="Seller">Seller</SelectItem>
              </SelectContent>
            </Select>
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
              value={employeeInfo.address}
              onChange={handleChange}
              disabled={loadingEmployee}
              required
              minLength={5}
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
              value={employeeInfo.tel}
              onChange={handleChange}
              disabled={loadingEmployee}
              required
              pattern="\+?[\d\s-]{9,}"
            />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="salary_fix">
              Salaire Fixe <span className="text-red-500">*</span>
            </Label>
            <Input
              id="salary_fix"
              type="number"
              placeholder="Salaire fixe (max 999999.99)"
              name="salary_fix"
              value={employeeInfo.salary_fix}
              onChange={handleChange}
              disabled={loadingEmployee}
              required
              step="0.01"
              min="0"
              max="999999.99"
            />
          </div>
          <SheetFooter className="px-4">
            <Button type="submit" disabled={loadingEmployee}>
              {loadingEmployee ? "Modification..." : "Modifier"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EditEmployeeSheet;