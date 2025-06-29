"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { toast } from "sonner";
import { useTrip } from "@/store/tripStore";
import { axiosInstance } from "@/utils/axiosInstance";

const TransferProducts = ({ onClose, products, boxes, activeTrips }) => {
  const [sourceTripProducts, setSourceTripProducts] = useState([]);
  const [sourceTripBoxes, setSourceTripBoxes] = useState([]);
  const [sourceTripId, setSourceTripId] = useState("");
  const [destinationTripId, setDestinationTripId] = useState("");
  const [completedTrips, setCompletedTrips] = useState([]);
  const [formData, setFormData] = useState({
    tripProducts: [],
    tripBoxes: [],
  });

  const { fetchAllTrips } = useTrip();

  // Fetch completed trips with remaining products/boxes
  useEffect(() => {
    const fetchCompletedTrips = async () => {
      try {
        const response = await axiosInstance.get("/trip", {
          params: { status: "completed" },
        });
        const trips = response.data.trips || [];
        console.log("Fetched completed trips:", trips);
        setCompletedTrips(trips);
      } catch (error) {
        console.error("Error fetching completed trips:", error);
        toast.error("Erreur lors de la récupération des tournées terminées.");
      }
    };
    fetchCompletedTrips();
  }, []);

  // Fetch source trip details when sourceTripId changes
  useEffect(() => {
    if (sourceTripId) {
      const fetchTripDetails = async () => {
        try {
          const response = await axiosInstance.get(`/trip/${sourceTripId}`);
          const trip = response.data.trips;
          console.log("Fetched source trip details:", trip);

          // Filter products with remaining quantities
          const remainingProducts = trip.TripProducts?.filter(
            (p) =>
              (p.qttOut || 0) > (p.qttReutour || 0) ||
              (p.qttOutUnite || 0) > (p.qttReutourUnite || 0)
          ).map((p) => ({
            product_id: p.product,
            designation: p.ProductAssociation?.designation || "Produit inconnu",
            remainingQtt: (p.qttOut || 0) - (p.qttReutour || 0),
            remainingQttUnite: (p.qttOutUnite || 0) - (p.qttReutourUnite || 0),
            additionalQttOut: 0,
            additionalQttOutUnite: 0,
          }));

          // Filter boxes with remaining quantities
          const remainingBoxes = trip.TripBoxes?.filter(
            (b) => (b.qttOut || 0) > (b.qttIn || 0)
          ).map((b) => ({
            box_id: b.box,
            designation: b.BoxAssociation?.designation || "Boîte inconnue",
            qttOut: b.qttOut,
            qttIn: b.qttIn,
            remainingQtt: (b.qttOut || 0) - (b.qttIn || 0),
            additionalQttOut: 0,
          }));

          setSourceTripProducts(remainingProducts || []);
          setSourceTripBoxes(remainingBoxes || []);
          setFormData({
            tripProducts: remainingProducts?.map((p) => ({
              product_id: p.product_id,
              additionalQttOut: 0,
              additionalQttOutUnite: 0,
            })) || [],
            tripBoxes: remainingBoxes?.map((b) => ({
              box_id: b.box_id,
              additionalQttOut: 0,
            })) || [],
          });
        } catch (error) {
          console.error("Error fetching source trip details:", error);
          toast.error("Erreur lors de la récupération des détails de la tournée source.");
        }
      };
      fetchTripDetails();
    }
  }, [sourceTripId]);

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.tripProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: parseInt(value, 10) || 0,
    };
    setFormData({ ...formData, tripProducts: updatedProducts });
  };

  const handleBoxChange = (index, field, value) => {
    const updatedBoxes = [...formData.tripBoxes];
    updatedBoxes[index] = {
      ...updatedBoxes[index],
      [field]: parseInt(value, 10) || 0,
    };
    setFormData({ ...formData, tripBoxes: updatedBoxes });
  };

  const handleSubmit = async (eEvent) => {
    eEvent.preventDefault();
    try {
      const submitData = {
        sourceTripId,
        destinationTripId,
        tripProducts: formData.tripProducts.filter(
          (p) => p.additionalQttOut > 0 || p.additionalQttOutUnite > 0
        ),
        tripBoxes: formData.tripBoxes.filter((b) => b.additionalQttOut > 0),
      };

      console.log("Submitting transfer data:", submitData);

      const response = await axiosInstance.post("/trip/transfer", submitData);
      console.log("Transfer response:", response.data);

      toast.success("Produits et boîtes transférés avec succès !");
      onClose();
      await fetchAllTrips(); // Refresh trips
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage ||
        "Erreur lors du transfert des produits/boîtes.";
      console.error("Transfer error:", error);
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Tournée Source (terminée)</Label>
        <select
          value={sourceTripId}
          onChange={(e) => setSourceTripId(e.target.value)}
          className="w-full border rounded p-1"
        >
          <option value="">Sélectionnez une tournée</option>
          {completedTrips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              Tournée #{trip.id} - {trip.zone} ({new Date(trip.date).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Tournée destination (active)</Label>
        <select
          value={destinationTripId}
          onChange={(e) => setDestinationTripId(e.target.value)}
          className="w-full border rounded p-1"
        >
          <option value="">Sélectionnez une tournée</option>
          {activeTrips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              Tournée #{trip.id} - {trip.zone} ({new Date(trip.date).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {sourceTripProducts.length > 0 && (
        <div>
          <h6 className="text-md font-medium text-black">Produits à transférer:</h6>
          {sourceTripProducts.map((product, index) => (
            <div key={index} className="border p-2 rounded space-y-2 mt-2">
              <p>
                {product.designation} (ID: {product.product_id}) - Restant: {product.remainingQtt} caisses,{" "}
                {product.remainingQttUnite} unités
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Qté Supplémentaire (Caisses)</Label>
                  <Input
                    type="number"
                    value={formData.tripProducts[index]?.additionalQttOut || 0}
                    onChange={(e) =>
                      handleProductChange(index, "additionalQttOut", e.target.value)
                    }
                    min="0"
                  />
                </div>
                <div>
                  <Label>Qté Supplémentaire (Unités)</Label>
                  <Input
                    type="number"
                    value={formData.tripProducts[index]?.additionalQttOutUnite || 0}
                    onChange={(e) =>
                      handleProductChange(index, "additionalQttOutUnite", e.target.value)
                    }
                    min="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sourceTripBoxes.length > 0 && (
        <div>
          <h6 className="text-md font-medium text-black">Boîtes à transférer:</h6>
          {sourceTripBoxes.map((box, index) => (
            <div key={index} className="border p-2 rounded space-y-2 mt-2">
              <p>
                {box.designation} (ID: {box.box_id}) - Restant: {box.remainingQtt}
              </p>
              <div>
                <Label>Qté Supplémentaire</Label>
                <Input
                  type="number"
                  value={formData.tripBoxes[index]?.additionalQttOut || 0}
                  onChange={(e) =>
                    handleBoxChange(index, "additionalQttOut", e.target.value)
                  }
                  min="0"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={!sourceTripId || !destinationTripId}>
          Transférer
        </Button>
      </div>
    </form>
  );
};

export default TransferProducts;