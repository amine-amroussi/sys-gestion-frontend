"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { X } from "lucide-react";
import { usePaymentStore } from "@/store/PaymentStore";

const PaymentForm = ({ onClose, initialData = null }) => {
  const { state, fetchEmployees, createPayment, updatePayment, fetchPaymentById } = usePaymentStore();
  const { employees, loading, error } = state;
  const [formData, setFormData] = useState({
    employeeId: "",
    month: "",
    year: "",
    status: "Pending",
  });

  useEffect(() => {
    fetchEmployees();
    if (initialData) {
      setFormData({
        employeeId: initialData.employee_cin || "",
        month: initialData.month || "",
        year: initialData.year || "",
        status: initialData.status || "Pending",
      });
      fetchPaymentById(initialData.payment_id);
    }
  }, [initialData, fetchEmployees, fetchPaymentById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const paymentData = {
      employeeId: formData.employeeId,
      month: parseInt(formData.month),
      year: parseInt(formData.year),
      status: formData.status,
    };

    if (initialData) {
      await updatePayment(initialData.payment_id, paymentData.status);
    } else {
      await createPayment(paymentData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {initialData ? "Modifier Statut du Paiement" : "Créer un Paiement"}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {loading ? (
            <p className="text-gray-600">Chargement des employés...</p>
          ) : !Array.isArray(employees) || employees.length === 0 ? (
            <p className="text-gray-600">Aucun employé disponible.</p>
          ) : !initialData ? (
            <>
              <div>
                <Label htmlFor="employeeId" className="text-sm font-medium">Employé</Label>
                <select
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 text-sm"
                  disabled={loading}
                >
                  <option value="">Sélectionnez un employé</option>
                  {employees.map((emp) => (
                    <option key={emp.cin} value={emp.cin}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="month" className="text-sm font-medium">Mois</Label>
                <Input
                  id="month"
                  name="month"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.month}
                  onChange={handleChange}
                  placeholder="1-12"
                  className="w-full"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="year" className="text-sm font-medium">Année</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min="2000"
                  max="2100"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="ex., 2025"
                  className="w-full"
                  disabled={loading}
                />
              </div>
            </>
          ) : null}
          <div>
            <Label htmlFor="status" className="text-sm font-medium">Statut</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-md p-2 text-sm"
              disabled={loading}
            >
              {initialData ? (
                <>
                  <option value="Pending">En attente</option>
                  <option value="Paid">Payé</option>
                </>
              ) : (
                <option value="Pending">En attente</option>
              )}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading || (!initialData && !formData.employeeId)}>
            {initialData ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;