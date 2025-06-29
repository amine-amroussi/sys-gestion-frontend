"use client";
import { useState, useEffect } from "react";
import { usePaymentStore } from "@/store/PaymentStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Printer, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { axiosInstance } from "@/utils/axiosInstance";
import PaymentForm from "@/components/PaymentForm";
import PaymentSummary from "@/components/PaymentSummary";

const PaymentPage = () => {
  const {
    state: { payments, pagination, filters, sort, employees, loading, tripTotals },
    fetchPayments,
    fetchEmployees,
    fetchPaymentsForEmployeeBetweenDates,
    setFilters,
    setSort,
    goToNextPage,
  } = usePaymentStore();

  console.log(tripTotals);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({
    employeeId: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
  });

  useEffect(() => {
    fetchEmployees();
    fetchPayments(pagination.currentPage, pagination.pageSize, filters, sort);
  }, [pagination.currentPage, pagination.pageSize, filters, sort]);

  const handleFilterChange = (key, value) => {
    const filterValue = value === "all" ? "" : value;
    setFilters({ [key]: filterValue });
    fetchPayments(1, pagination.pageSize, { ...filters, [key]: filterValue }, sort);
  };

  const handleSortChange = (sortBy) => {
    const newSortOrder = sort.sortBy === sortBy && sort.sortOrder === "ASC" ? "DESC" : "ASC";
    setSort({ sortBy, sortOrder: newSortOrder });
    fetchPayments(1, pagination.pageSize, filters, { sortBy, sortOrder: newSortOrder });
  };

  const handlePageChange = (page) => {
    fetchPayments(page, pagination.pageSize, filters, sort);
  };

  const openModal = (payment = null) => {
    if (employees.length === 0 && !loading) {
      toast.error("Aucun employé disponible. Veuillez vérifier la connexion au serveur.");
      return;
    }
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
  };

  const getEmployeeName = (cin) => {
    const employee = employees.find((emp) => emp.cin === cin?.toString());
    return employee ? employee.name : "N/A";
  };

  const calculateNetPay = (payment) => {
    const total = parseFloat(payment.total || 0);
    const credit = parseFloat(payment.credit || 0);
    const commission = parseFloat(tripTotals[payment.payment_id]?.commission || 0);
    return (total).toFixed(2);
    // return (total + credit + commission ).toFixed(2);
  };

  const handleInvoiceFormChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrintInvoiceBetweenDates = async () => {
    const { employeeId, startMonth, startYear, endMonth, endYear } = invoiceForm;

    if (!employeeId || !startMonth || !startYear || !endMonth || !endYear) {
      toast.error("Veuillez remplir tous les champs pour générer la facture.");
      return;
    }

    const startM = parseInt(startMonth);
    const startY = parseInt(startYear);
    const endM = parseInt(endMonth);
    const endY = parseInt(endYear);

    if (isNaN(startM) || startM < 1 || startM > 12) {
      toast.error("Le mois de début doit être un nombre entre 1 et 12.");
      return;
    }
    if (isNaN(startY) || startY < 2000 || startY > 2100) {
      toast.error("L'année de début doit être un nombre entre 2000 et 2100.");
      return;
    }
    if (isNaN(endM) || endM < 1 || endM > 12) {
      toast.error("Le mois de fin doit être un nombre entre 1 et 12.");
      return;
    }
    if (isNaN(endY) || endY < 2000 || endY > 2100) {
      toast.error("L'année de fin doit être un nombre entre 2000 et 2100.");
      return;
    }

    const startDate = new Date(startY, startM - 1);
    const endDate = new Date(endY, endM - 1);
    if (startDate > endDate) {
      toast.error("La date de début doit être antérieure à la date de fin.");
      return;
    }

    const paymentsInRange = await fetchPaymentsForEmployeeBetweenDates(
      employeeId,
      startM,
      startY,
      endM,
      endY
    );

    if (!paymentsInRange || paymentsInRange.length === 0) {
      toast.error("Aucun paiement trouvé pour cet employé dans cette période.");
      return;
    }

    const totalBase = paymentsInRange
      .reduce((sum, p) => sum + parseFloat(p.total || 0), 0)
      .toFixed(2);
    const totalCredit = paymentsInRange
      .reduce((sum, p) => sum + parseFloat(p.credit || 0), 0)
      .toFixed(2);
    const totalCommission = paymentsInRange
      .reduce((sum, p) => sum + parseFloat(tripTotals[p.payment_id]?.commission || 0), 0)
      .toFixed(2);
    const totalNet = paymentsInRange
      .reduce((sum, p) => sum + parseFloat(calculateNetPay(p)), 0)
      .toFixed(2);

    const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

    const invoiceContent = `
      <html>
      <head>
        <title>Facture de Paiement</title>
        <style>
          @media print {
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { margin: 0; padding: 20mm; font-family: Arial, sans-serif; }
            .invoice { width: 100%; max-width: 800px; margin: 0 auto; }
            .details, .items { margin-top: 20px; }
            .details p { margin: 5px 0; }
            .items table { width: 100%; border-collapse: collapse; }
            .items th, .items td { border: 1px solid #000; padding: 8px; text-align: left; }
            .items th { background-color: #f5f5f5; }
            .total { margin-top: 20px; font-weight: bold; text-align: right; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; }
          }
          @page { margin: 20mm; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="details">
            <p><strong>Facture de Paiement</strong></p>
            <p><strong>Employé:</strong> ${getEmployeeName(employeeId)}</p>
            <p><strong>Rôle:</strong> ${
              employees.find((emp) => emp.cin === employeeId)?.role || "N/A"
            }</p>
            <p><strong>Période:</strong> ${startMonth}/${startYear} - ${endMonth}/${endYear}</p>
            <p><strong>Imprimé le:</strong> ${currentDate}</p>
          </div>
          <div class="items">
            <h3>Détails de Paiement</h3>
            <table>
              <thead>
                <tr>
                  <th>Période</th>
                  <th>Salaire de Base (MAD)</th>
                  <th>Commission (MAD)</th>
                  <th>Crédit (MAD)</th>
                  <th>Total Net (MAD)</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                ${paymentsInRange
                  .map(
                    (payment) => `
                    <tr>
                      <td>${payment.month}/${payment.year}</td>
                      <td>${parseFloat(payment.total || 0).toFixed(2)}</td>
                      <td>${parseFloat(tripTotals[payment.payment_id]?.commission || 0).toFixed(2)}</td>
                      <td>${parseFloat(payment.credit || 0).toFixed(2)}</td>
                      <td>${calculateNetPay(payment)}</td>
                      <td>${payment.status === "Paid" ? "Payé" : payment.status === "Cancelled" ? "Annulé" : "En attente"}</td>
                    </tr>
                  `
                  )
                  .join("")}
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>${totalBase}</strong></td>
                  <td><strong>${totalCommission}</strong></td>
                  <td><strong>${totalCredit}</strong></td>
                  <td><strong>${totalNet}</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total">
            <p><strong>Montant Total Net:</strong> ${totalNet} MAD</p>
          </div>
          <div class="footer">
            <p>Merci pour votre confiance !</p>
            <p>© ${new Date().getFullYear()} Votre Entreprise</p>
          </div>
        </div>
        <script>
          window.print();
          window.onafterprint = () => window.close();
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
    } else {
      toast.error("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les popups pour ce site.");
    }
  };

  const handlePrintInvoice = (payment) => {
    const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

    const invoiceContent = `
      <html>
      <head>
        <title>Facture de Paiement</title>
        <style>
          @media print {
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { margin: 0; padding: 20mm; font-family: Arial, sans-serif; }
            .invoice { width: 100%; max-width: 800px; margin: 0 auto; }
            .details, .items { margin-top: 20px; }
            .details p { margin: 5px 0; }
            .items table { width: 100%; border-collapse: collapse; }
            .items th, .items td { border: 1px solid #000; padding: 8px; text-align: left; }
            .items th { background-color: #f5f5f5; }
            .total { margin-top: 20px; font-weight: bold; text-align: right; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; }
          }
          @page { margin: 20mm; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="details">
            <p><strong>Facture de Paiement N°:</strong> ${payment.payment_id || "N/A"}</p>
            <p><strong>Employé:</strong> ${getEmployeeName(payment.employee_cin)}</p>
            <p><strong>Rôle:</strong> ${payment.EmployeeAssociation?.role || "N/A"}</p>
            <p><strong>Période:</strong> ${format(
              new Date(payment.year, payment.month - 1, 1),
              "dd/MM/yyyy"
            )}</p>
            <p><strong>Imprimé le:</strong> ${currentDate}</p>
          </div>
          <div class="items">
            <h3>Détails de Paiement</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Montant (MAD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Salaire de Base</td>
                  <td>${parseFloat(payment.total || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Commission</td>
                  <td>${parseFloat(tripTotals[payment.payment_id]?.commission || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Crédit</td>
                  <td>${parseFloat(payment.credit || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td><strong>Total Net</strong></td>
                  <td><strong>${calculateNetPay(payment)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total">
            <p><strong>Montant Total:</strong> ${calculateNetPay(payment)} MAD</p>
          </div>
          <div class="footer">
            <p>Merci pour votre confiance !</p>
            <p>© ${new Date().getFullYear()} Votre Entreprise</p>
          </div>
        </div>
        <script>
          window.print();
          window.onafterprint = () => window.close();
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
    } else {
      toast.error("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les popups pour ce site.");
    }
  };

  const handleGenerateInvoice = async (paymentId) => {
    try {
      const response = await axiosInstance.get(`/payment/${paymentId}`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch payment details");
      }
      const payment = response.data.payment;

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Facture de Paiement", 20, 20);
      doc.setFontSize(12);
      doc.text(`ID Paiement: ${payment.payment_id}`, 20, 40);
      doc.text(`Employé: ${payment.EmployeeAssociation?.name || "N/A"} (${payment.EmployeeAssociation?.cin || "N/A"})`, 20, 50);
      doc.text(`Mois: ${payment.month}`, 20, 60);
      doc.text(`Année: ${payment.year}`, 20, 70);
      doc.text(`Salaire de Base: ${parseFloat(payment.total || 0).toFixed(2)} MAD`, 20, 80);
      doc.text(`Commission: ${parseFloat(tripTotals[payment.payment_id]?.commission || 0).toFixed(2)} MAD`, 20, 90);
      doc.text(`Crédit: -${parseFloat(payment.credit || 0).toFixed(2)} MAD`, 20, 100);
      doc.text(`Net à payer: ${calculateNetPay(payment)} MAD`, 20, 110);
      doc.text(`Statut: ${payment.status}`, 20, 120);
      doc.text(`Date de génération: ${new Date().toLocaleDateString("fr-FR")}`, 20, 130);

      doc.save(`invoice_payment_${paymentId}.pdf`);
      toast.success("Facture générée avec succès !");
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error(error.message || "Erreur lors de la génération de la facture.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Paiements</h1>
        <Button onClick={() => openModal()} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Ajouter Paiement
        </Button>
      </div>

      <PaymentSummary />

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Imprimer une Facture pour une Période</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            name="employeeId"
            value={invoiceForm.employeeId}
            onChange={handleInvoiceFormChange}
            className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner un Employé</option>
            {employees.map((emp) => (
              <option key={emp.cin} value={emp.cin}>
                {emp.name} ({emp.role})
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Input
              type="number"
              name="startMonth"
              value={invoiceForm.startMonth}
              onChange={handleInvoiceFormChange}
              placeholder="Mois de Début (1-12)"
              className="p-2 text-sm"
              min="1"
              max="12"
            />
            <Input
              type="number"
              name="startYear"
              value={invoiceForm.startYear}
              onChange={handleInvoiceFormChange}
              placeholder="Année de Début"
              className="p-2 text-sm"
              min="2000"
              max="2100"
            />
          </div>
          <div>|</div>
          <div className="flex gap-2">
            <Input
              type="number"
              name="endMonth"
              value={invoiceForm.endMonth}
              onChange={handleInvoiceFormChange}
              placeholder="Mois de Fin (1-12)"
              className="p-2 text-sm"
              min="1"
              max="12"
            />
            <Input
              type="number"
              name="endYear"
              value={invoiceForm.endYear}
              onChange={handleInvoiceFormChange}
              placeholder="Année de Fin"
              className="p-2 text-sm"
              min="2000"
              max="2100"
            />
          </div>
          <Button
            onClick={handlePrintInvoiceBetweenDates}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Imprimer Facture
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Rechercher</label>
          <Input
            placeholder="Rechercher par nom ou CIN"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Statut</label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="Pending">En attente</SelectItem>
              <SelectItem value="Paid">Payé</SelectItem>
              <SelectItem value="Cancelled">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { label: "Employé", key: "employee" },
                { label: "Mois", key: "month" },
                { label: "Année", key: "year" },
                { label: "Salaire de Base (MAD)", key: "total" },
                { label: "Crédit (MAD)", key: "credit" },
                { label: "Commission (MAD)", key: "commission" },
                { label: "Net à payer (MAD)", key: "net_pay" },
                { label: "Total Tournées (MAD)", key: "total_trips" },
                { label: "Statut", key: "status" },
                { label: "Actions", key: "actions" },
              ].map((header) => (
                <th
                  key={header.key}
                  onClick={() => header.key !== "actions" && header.key !== "total_trips" && header.key !== "commission" && handleSortChange(header.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  {header.label}
                  {sort.sortBy === header.key && (
                    <span>{sort.sortOrder === "ASC" ? " ▲" : " ▼"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                  Aucun paiement trouvé
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.payment_id}>
                  {console.log(payment)}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.EmployeeAssociation?.name || "N/A"} (
                    {payment.EmployeeAssociation?.cin || "N/A"})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{payment.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{payment.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{parseFloat(payment.total || 0).toFixed(2)} MAD</td>
                  <td className="px-6 py-4 whitespace-nowrap">{parseFloat(payment.credit || 0).toFixed(2)} MAD</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {parseFloat(tripTotals[payment.payment_id]?.commission || 0).toFixed(2)} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{payment.net_pay || 0} MAD</td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">{calculateNetPay(payment)} MAD</td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {parseFloat(tripTotals[payment.payment_id]?.totalWaitedAmount || 0).toFixed(2)} MAD
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        payment.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {payment.status === "Paid"
                        ? "Payé" : payment.status === "Pending"
                        ? "En attente"
                        : "Non payé"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    {payment.status !== "Paid" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal(payment)}
                      >
                        Modifier
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintInvoice(payment)}
                    >
                      <Printer className="w-4 h-4 mr-1" /> Imprimer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateInvoice(payment.payment_id)}
                    >
                      <Download className="w-4 h-4 mr-1" /> PDF
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div>
          <p className="text-sm text-gray-600">
            Affichage de {payments.length} sur {pagination.totalItems} paiements
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={goToNextPage}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isModalOpen && <PaymentForm onClose={closeModal} initialData={selectedPayment} />}
    </div>
  );
};

export default PaymentPage;