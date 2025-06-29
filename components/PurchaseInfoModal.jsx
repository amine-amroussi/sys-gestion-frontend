"use client";
import { X, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { usePurchase } from "@/store/purchaseStore";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/utils/axiosInstance";
import { ShowToast } from "@/utils/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const PurchaseInfoModal = ({ open, setOpen, purchase }) => {
  const [selectedPurchase, setSelectedPurchase] = useState(purchase);
  const { purchaseState: { purchases }, fetchAllPurchases } = usePurchase();  

  console.log("PurchaseInfoModal props:", { open, setOpen, purchase, selectedPurchase });

  useEffect(() => {
    if (open && !purchase) {
      fetchAllPurchases(1, 100);
    }
    setSelectedPurchase(purchase);
  }, [open, purchase, fetchAllPurchases]);

  useEffect(() => {
    if (selectedPurchase) {
      console.log("PurchaseInfoModal Data:", JSON.stringify({
        ProductAssociation: selectedPurchase.ProductAssociation,
        PurchaseWastes: selectedPurchase.PurchaseWastes?.map(w => ({
          purchase_id: w.purchase_id,
          product: w.product,
          type: w.type,
          qtt: w.qtt,
          supplier: w.supplier,
          ProductAssociation: w.ProductAssociation,
        })),
        WastesArray: selectedPurchase.WastesArray,
      }, null, 2));
    }
  }, [selectedPurchase]);

  const handleClose = () => {
    if (typeof setOpen === "function") {
      setOpen(false);
      setSelectedPurchase(null);
    } else {
      console.error("setOpen is not a function or is undefined");
    }
  };

  // fetch the product by Id 
  const fetchProductById = async (id) => {
    try {
      const response = await axiosInstance.get(`/product/${id}`);
      if (response.status === 200) {
         console.log(response.data.product);  
         return response.data.product;
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  }

  const handleSendToSupplier = async () => {
    if (!selectedPurchase) {
      ShowToast.error("Veuillez sélectionner un achat.");
      return;
    }

    try {
      const hasBoxes = selectedPurchase.BoxAssociation?.length > 0;
      const hasWastes = selectedPurchase.PurchaseWastes?.length > 0;
      if (!hasBoxes && !hasWastes) {
        ShowToast.error("Aucune caisse ou déchet à envoyer au fournisseur.");
        return;
      }

      const payload = {};
      if (hasBoxes) {
        payload.boxes = selectedPurchase.BoxAssociation.map((box) => ({
          box_id: box.box,
          designation: box.BoxAssociation?.designation || "N/A",
          qttIn: box.qttIn || 0,
          qttOut: box.qttOut || 0,
        }));
      }
      if (hasWastes) {
        payload.wastes = selectedPurchase.PurchaseWastes.map((waste) => ({
          product_id: waste.product,
          designation: waste.ProductAssociation?.designation || `Produit ${waste.product}`,
          qtt: waste.qtt || 0,
          type: waste.type || "N/A",
        }));
      }

      console.log("Sending to supplier:", { purchase_id: selectedPurchase.id, payload });

      await axiosInstance.post(`/purchase/${selectedPurchase.id}/send-supplier`, payload);

      ShowToast.success("Données envoyées au fournisseur avec succès !");
      handleClose();
    } catch (err) {
      console.error("Failed to send to supplier:", err);
      const errorMessage =
        err.response?.data?.message || "Erreur lors de l'envoi au fournisseur";
      ShowToast.error(errorMessage);
    }
  };

  if (!open) return null;

  const totalBoxesIn = selectedPurchase?.BoxAssociation?.reduce((sum, pb) => sum + (pb.qttIn || 0), 0) || 0;
  const totalBoxesOut = selectedPurchase?.BoxAssociation?.reduce((sum, pb) => sum + (pb.qttOut || 0), 0) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {selectedPurchase ? `Détails de l'Achat #${selectedPurchase.id}` : "Sélectionner un Achat"}
          </h2>
          <Button variant="ghost" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!selectedPurchase && (
          <div className="mb-4">
            <Select
              onValueChange={(value) => {
                const selected = purchases.find((p) => p.id === parseInt(value));
                setSelectedPurchase(selected);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un achat" />
              </SelectTrigger>
              <SelectContent>
                {purchases.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    Achat #{p.id} - {format(new Date(p.date), "dd/MM/yyyy")} ({p.SupplierAssociation?.name || "N/A"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedPurchase && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Fournisseur:</strong></p>
              <p>{selectedPurchase.SupplierAssociation?.name || "N/A"}</p>
              <p><strong>Date:</strong></p>
              <p>{format(new Date(selectedPurchase.date), "dd/MM/yyyy")}</p>
              <p><strong>Total:</strong></p>
              <p>{selectedPurchase.total} MAD</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Produits:</h3>
              {selectedPurchase.ProductAssociation?.length > 0 ? (
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qté (Caisses)</th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qté (Unités)</th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix (MAD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.ProductAssociation.map((prod, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2">{prod.ProductAssociation?.designation || "N/A"}</td>
                        <td className="border border-gray-200 px-4 py-2">{prod.qtt || 0}</td>
                        <td className="border border-gray-200 px-4 py-2">{prod.qttUnite || 0}</td>
                        <td className="border border-gray-200 px-4 py-2">{prod.price || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucun produit associé à cet achat.</p>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">Caisses:</h3>
              {selectedPurchase.BoxAssociation?.length > 0 ? (
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                      <th className="border border-gray-200 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qté Entrée</th>
                      <th className="border border-gray-200 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qté Sortie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.BoxAssociation.map((box, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2">{box.BoxAssociation?.designation || "N/A"}</td>
                        <td className="border border-gray-200 px-4 py-2 text-right">{box.qttIn || 0}</td>
                        <td className="border border-gray-200 px-4 py-2 text-right">{box.qttOut || 0}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="border border-gray-200 px-4 py-2">Total</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{totalBoxesIn}</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{totalBoxesOut}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p>Aucune caisse</p>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">Déchets:</h3>
              {selectedPurchase.PurchaseWastes && selectedPurchase.PurchaseWastes.length > 0 ? (
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                      <th className="border border-gray-200 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantité</th>
                      <th className="border border-gray-200 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.PurchaseWastes.map((waste, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2">{waste.ProductAssociation?.designation || `Produit ${waste.product}`}</td>
                        <td className="border border-gray-200 px-4 py-2 text-right">{waste.qtt || 0}</td>
                        <td className="border border-gray-200 px-4 py-2 text-center">{waste.type || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucun déchet</p>
              )}
            </div>

            
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseInfoModal;