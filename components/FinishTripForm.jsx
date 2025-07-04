"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

const FinishTripForm = ({
  tripDetails,
  onSubmit,
  onCancel,
  onPrevious,
  products,
  boxes,
  excludeReceivedAmount,
}) => {
  const [formData, setFormData] = useState({
    tripProducts: [],
    tripBoxes: [],
    tripWastes: [],
    tripCharges: [],
    receivedAmount: "",
  });

  useEffect(() => {
    console.log("FinishTripForm useEffect triggered", {
      tripDetails: tripDetails
        ? {
            id: tripDetails.id,
            TripProducts: tripDetails.TripProducts?.map((p) => ({
              product: p.product,
              designation: p.ProductAssociation?.designation,
              qttOut: p.qttOut,
              qttOutUnite: p.qttOutUnite,
            })),
            TripBoxes: tripDetails.TripBoxes?.map((b) => ({
              box: b.box,
              designation: b.BoxAssociation?.designation,
              qttOut: b.qttOut,
            })),
          }
        : null,
      products: products?.map((p) => ({
        id: p.id,
        designation: p.designation,
      })),
      boxes: boxes?.map((b) => ({
        id: b.id,
        designation: b.designation,
      })),
    });

    if (tripDetails && tripDetails.TripProducts && tripDetails.TripBoxes) {
      const tripProducts = tripDetails.TripProducts.map((p) => {
        const productId = Number(p.product);
        const productFromProps = products.find(
          (prod) => Number(prod.id) === productId
        );
        const designation =
          p.ProductAssociation?.designation ||
          productFromProps?.designation ||
          `Produit ID ${productId}`;
        return {
          product_id: productId,
          designation,
          qttReutour: p.qttReutour || 0,
          qttReutourUnite: p.qttReutourUnite || 0,
          qttOut: p.qttOut || 0, // Include for validation
          qttOutUnite: p.qttOutUnite || 0, // Include for validation
        };
      });

      const tripBoxes = tripDetails.TripBoxes.map((b) => {
        const boxId = Number(b.box);
        const boxFromProps = boxes.find(
          (box) => Number(box.id) === boxId
        );
        const designation =
          b.BoxAssociation?.designation ||
          boxFromProps?.designation ||
          `Boîte ID ${boxId}`;
        return {
          box_id: boxId,
          designation,
          qttIn: b.qttIn ,
          qttOut: b.qttOut || 0 , // Include for validation
        };
      });

      setFormData((prev) => ({
        ...prev,
        tripProducts,
        tripBoxes,
        tripWastes: prev.tripWastes.length ? prev.tripWastes : [],
        tripCharges: prev.tripCharges.length ? prev.tripCharges : [],
        receivedAmount: prev.receivedAmount || "",
      }));

      if (!tripProducts.length) {
        console.warn("No trip products found in tripDetails");
        toast.warning("Aucun produit associé à cette tournée.");
      }
      if (!tripBoxes.length) {
        console.warn("No trip boxes found in tripDetails");
        toast.warning("Aucune boîte associée à cette tournée.");
      }
    } else {
      console.warn("tripDetails is incomplete or undefined", { tripDetails });
      setFormData({
        tripProducts: [],
        tripBoxes: [],
        tripWastes: [],
        tripCharges: [],
        receivedAmount: "",
      });
      toast.error("Données de tournée non disponibles.");
    }
  }, [tripDetails, products, boxes]);

  const handleChange = (type, index, field, value) => {
    const updatedForm = { ...formData };
    updatedForm[type][index] = { ...updatedForm[type][index], [field]: value };
    setFormData(updatedForm);
    console.log(`Updated ${type}[${index}].${field}:`, value);
  };

  const addWaste = () => {
    console.log("Adding waste entry");
    
    setFormData({
      ...formData,
      tripWastes: [
        ...formData.tripWastes,
        { product_id: "", type: "", qtt: "" },
      ],
    });
    console.log("Added waste entry");
  };

  const removeWaste = (index) => {
    setFormData({
      ...formData,
      tripWastes: formData.tripWastes.filter((_, i) => i !== index),
    });
    console.log("Removed waste entry:", index);
  };

  const addCharge = () => {
    setFormData({
      ...formData,
      tripCharges: [...formData.tripCharges, { type: "", amount: "" }],
    });
    console.log("Added charge entry");
  };

  const removeCharge = (index) => {
    setFormData({
      ...formData,
      tripCharges: formData.tripCharges.filter((_, i) => i !== index),
    });
    console.log("Removed charge entry:", index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.tripProducts.length || !formData.tripBoxes.length) {
        throw new Error("Les produits et boîtes de tournée sont requis.");
      }

      for (const product of formData.tripProducts) {
        if (product.qttReutour < 0 || product.qttReutourUnite < 0) {
          throw new Error(
            `Quantités retournées négatives pour ${product.designation}.`
          );
        }
        if (product.qttReutour > product.qttOut) {
          throw new Error(
            `Quantité retournée (caisses) pour ${product.designation} dépasse la quantité sortie.`
          );
        }
        // if (product.qttReutourUnite > product.qttOutUnite) {
        //   throw new Error(
        //     `Quantité retournée (unités) pour ${product.designation} dépasse la quantité sortie.`
        //   );
        // }
      }

      for (const box of formData.tripBoxes) {
        if (box.qttIn < 0) {
          throw new Error(`Quantité entrée négative pour ${box.designation}.`);
        }
        if (box.qttIn > box.qttOut) {
          throw new Error(
            `Quantité entrée pour ${box.designation} dépasse la quantité sortie.`
          );
        }
      }

      if (formData.tripWastes.some((w) => !w.product_id || !w.type || w.qtt <= 0)) {
        throw new Error("Tous les champs des déchets doivent être remplis et valides.");
      }

      if (formData.tripCharges.some((c) => !c.type || c.amount <= 0)) {
        throw new Error("Tous les champs des charges doivent être remplis et valides.");
      }

      const submitData = {
        tripProducts: formData.tripProducts.map((p) => ({
          product_id: p.product_id,
          qttReutour: parseInt(p.qttReutour) || 0,
          qttReutourUnite: parseInt(p.qttReutourUnite) || 0,
        })),
        tripBoxes: formData.tripBoxes.map((b) => ({
          box_id: b.box_id,
          qttIn: parseInt(b.qttIn) || 0,
        })),
        tripWastes: formData.tripWastes.map((w) => ({
          product: w.product_id,
          type: w.type,
          qtt: parseInt(w.qtt) || 0,
        })),
        tripCharges: formData.tripCharges.map((c) => ({
          type: c.type,
          amount: parseFloat(c.amount) || 0,
        })),
      };

      if (!excludeReceivedAmount) {
        submitData.receivedAmount = parseFloat(formData.receivedAmount) || 0;
        if (submitData.receivedAmount < 0) {
          throw new Error("Le montant reçu ne peut pas être négatif.");
        }
      }

      console.log("Submitting form data:", submitData);
      onSubmit(submitData);
    } catch (error) {
      console.error("Form validation error:", error.message);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h6 className="text-xl font-medium text-black">Produits Retournés:</h6>
        {formData.tripProducts.length === 0 ? (
          <p className="text-red-500 text-sm">
            Aucun produit disponible pour cette tournée.
          </p>
        ) : (
          formData.tripProducts.map((product, index) => (
            <div key={`${product.product_id}-${index}`} className="border p-2 rounded space-y-2 mt-2  transition-all ease-in-out delay-75 hover:border-black hover:bg-gray-100">
              <p className="text-[16px] font-bold text-black">
                {product.designation} (ID: {product.product_id})
                {product.qttOut !== undefined && (
                  <>
                    {" "}
                    (Sortie: {product.qttOut} caisses,{" "}
                    {product.qttOutUnite} unités)
                  </>
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label>Qté Retour (Caisses)</Label>
                  <Input
                    type="text"
                    value={product.qttReutour}
                    onChange={(e) =>
                      handleChange(
                        "tripProducts",
                        index,
                        "qttReutour",
                        e.target.value
                      )
                    }
                    min="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Qté Retour (Unités)</Label>
                  <Input
                    type="text"
                    value={product.qttReutourUnite}
                    onChange={(e) =>
                      handleChange(
                        "tripProducts",
                        index,
                        "qttReutourUnite",
                        e.target.value
                      )
                    }
                    min="0"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <h6 className="text-xl font-medium text-black">Boîtes Entrées:</h6>
        {formData.tripBoxes.length === 0 ? (
          <p className="text-red-500 text-sm">
            Aucune boîte disponible pour cette tournée.
          </p>
        ) : (
          formData.tripBoxes.map((box, index) => (
            <div key={`${box.box_id}-${index}`} className="border p-2 rounded space-y-2 mt-2 transition-all ease-in-out delay-75 hover:border-black hover:bg-gray-100">
              <p className="text-[16px] font-bold text-black">
                {box.designation} (ID: {box.box_id})
                {box.qttOut !== undefined && <> (Sortie: {box.qttOut})</>}
              </p>
              <div>
                <Label>Qté Entrée</Label>
                <Input
                  type="text"
                  value={box.qttIn}
                  onChange={(e) =>
                    handleChange("tripBoxes", index, "qttIn", e.target.value)
                  }
                  min="0"
                  className="mt-1"
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <h6 className="text-xl font-medium text-black">Déchets:</h6>
        {formData.tripWastes.map((waste, index) => (
          <div key={`waste-${index}`} className="border p-2 rounded space-y-2 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <Label>Produit</Label>
                <select
                  value={waste.product_id}
                  onChange={(e) =>
                    handleChange("tripWastes", index, "product_id", e.target.value)
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionnez</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.designation || `ID: ${p.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Type</Label>
                {/* <Input
                  value={waste.type}
                  onChange={(e) =>
                    handleChange("tripWastes", index, "type", e.target.value)
                  }
                  className="mt-1"
                /> */}
                <select className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" value={waste.type} onChange={(e) => handleChange("tripWastes", index, "type", e.target.value)}> 
                  <option value="none">Selection le type</option>
                  <option value="Change">Change</option>
                  <option value="Défaut">Défaut</option>
                </select>
              </div>
              <div>
                <Label>Quantité</Label>
                <Input
                  type="text"
                  value={waste.qtt}
                  onChange={(e) =>
                    handleChange("tripWastes", index, "qtt", e.target.value)
                  }
                  min="1"
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeWaste(index)}
              className="mt-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={addWaste}
          className="mt-2 bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Ajouter Déchet
        </Button>
      </div>

      <div>
        <h6 className="text-xl font-medium text-black">Charges:</h6>
        {formData.tripCharges.map((charge, index) => (
          <div key={`charge-${index}`} className="border p-2 rounded space-y-2 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label>Type</Label>
                <Input
                  value={charge.type}
                  onChange={(e) =>
                    handleChange("tripCharges", index, "type", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Montant (MAD)</Label>
                <Input
                  type="text"
                  value={charge.amount}
                  onChange={(e) =>
                    handleChange("tripCharges", index, "amount", e.target.value)
                  }
                  min="0"
                  step="0.01"
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeCharge(index)}
              className="mt-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={addCharge}
          className="mt-2 bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Ajouter Charge
        </Button>
      </div>

      {!excludeReceivedAmount && (
        <div>
          <Label>Montant Reçu (MAD)</Label>
          <Input
            type="text"
            value={formData.receivedAmount}
            onChange={(e) =>
              setFormData({ ...formData, receivedAmount: parseFloat(e.target.value) })
            }
            min="0"
            step="0.01"
            className="mt-1"
            placeholder="Entrez le montant reçu"
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        {!excludeReceivedAmount && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Précédent
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {excludeReceivedAmount ? "Suivant" : "Confirmer"}
        </Button>
      </div>
    </form>
  );
};

export default FinishTripForm;