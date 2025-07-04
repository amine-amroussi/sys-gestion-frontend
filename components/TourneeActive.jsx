"use client";
import { useTrip } from "@/store/tripStore";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { axiosInstance } from "@/utils/axiosInstance";
import PrintInvoice from "./PrintInvoice.jsx";
import FinishTripForm from "./FinishTripForm";

const TourneeActive = () => {
  const {
    tripState: { activeTrips, loadingTrip, error },
    fetchTripById,
    finishTrip,
    fetchActiveTrips,
  } = useTrip();
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFinishStep1Open, setIsFinishStep1Open] = useState(false);
  const [isFinishStep2Open, setIsFinishStep2Open] = useState(false);
  const [products, setProducts] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formDataStep1, setFormDataStep1] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState("");
  const printInvoiceRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, boxesRes, employeesRes] = await Promise.all([
          axiosInstance.get("/trip/products/all"),
          axiosInstance.get("/box"),
          axiosInstance.get("/employee"),
        ]);
        setProducts(
          productsRes.data.products || productsRes.data.data?.products || []
        );
        setBoxes(boxesRes.data.boxes || boxesRes.data.data?.boxes || []);
        setEmployees(employeesRes.data.data?.employees || []);
        await fetchActiveTrips();
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Erreur lors de la récupération des données.");
      }
    };
    fetchData();
  }, [fetchActiveTrips]);

  const calculateEstimatedRevenue = (
    tripProducts,
    tripWastes = [],
    tripCharges = []
  ) => {
    const productRevenue = tripProducts.reduce((total, product) => {
      const productData =
        products.find((p) => Number(p.id) === Number(product.product)) || {};
      const capacityByBox = productData.capacityByBox || 0;
      const priceUnite = productData.priceUnite || 0;
      const totalUnitsSold =
        ((product.qttOut || 0) - (product.qttReutour || 0)) * capacityByBox +
        ((product.qttOutUnite || 0) - (product.qttReutourUnite || 0));
      return total + totalUnitsSold * priceUnite;
    }, 0);

    const wasteCost = tripWastes.reduce((total, waste) => {
      const productData =
        products.find((p) => Number(p.id) === Number(waste.product)) || {};
      const priceUnite = productData.priceUnite || 0;
      return total + (waste.qtt || 0) * priceUnite;
    }, 0);

    const totalCharges = tripCharges.reduce(
      (total, charge) => total + (charge.amount || 0),
      0
    );

    return productRevenue - wasteCost - totalCharges;
  };

  const calc = (tripWastes = [], tripCharges = []) => {
    const productRevenue = formDataStep1.tripProducts.reduce(
      (total, product) => {
        const tripProduct = tripDetails.TripProducts.find(
          (tp) => Number(tp.product) === Number(product.product_id)
        );
        const productData =
          products.find((p) => Number(p.id) === Number(product.product_id)) ||
          {};
        const capacityByBox = productData.capacityByBox || 0;
        const priceUnite = productData.priceUnite || 0;
        const qttVendu =
          ((tripProduct?.qttOut || 0) - (product.qttReutour || 0)) *
            capacityByBox +
          ((tripProduct?.qttOutUnite || 0) - (product.qttReutourUnite || 0));
        return total + qttVendu * priceUnite;
      },
      0
    );

    const wasteCost = tripWastes.reduce((total, waste) => {
      const productData =
        products.find((p) => Number(p.id) === Number(waste.product)) || {};
      const priceUnite = productData.priceUnite || 0;
      return total + (waste.qtt || 0) * priceUnite;
    }, 0);

    const totalCharges = tripCharges.reduce(
      (total, charge) => total + (charge.amount || 0),
      0
    );

    return (productRevenue - wasteCost - totalCharges).toFixed(2);
  };

  const calculateTotalProductAmount = () => {
    return formDataStep1.tripProducts
      .reduce((total, product) => {
        const tripProduct = tripDetails.TripProducts.find(
          (tp) => Number(tp.product) === Number(product.product_id)
        );
        const productData =
          products.find((p) => Number(p.id) === Number(product.product_id)) ||
          {};
        const capacityByBox = productData.capacityByBox || 0;
        const priceUnite = productData.priceUnite || 0;
        const qttVendu =
          ((tripProduct?.qttOut || 0) - (product.qttReutour || 0)) *
            capacityByBox +
          ((tripProduct?.qttOutUnite || 0) - (product.qttReutourUnite || 0));
        return total + qttVendu * priceUnite;
      }, 0)
      .toFixed(2);
  };

  const handleShowDetails = async (tripId) => {
    try {
      const trip = await fetchTripById(tripId);
      setSelectedTripId(tripId);
      setTripDetails(trip);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching trip details:", error);
      toast.error("Erreur lors de la récupération des détails de la tournée.");
      if (error.message.includes("non trouvée")) {
        await fetchActiveTrips();
        toast.info("La liste des tournées actives a été mise à jour.");
      }
    }
  };

  const openFinishModal = async (tripId) => {
    try {
      const trip = await fetchTripById(tripId);
      setSelectedTripId(tripId);
      setTripDetails(trip);
      setIsFinishStep1Open(true);
    } catch (error) {
      console.error("Error fetching trip details:", error);
      toast.error("Erreur lors de la récupération des détails de la tournée.");
    }
  };

  const handleStep1Submit = (formData) => {
    setFormDataStep1(formData);
    setIsFinishStep1Open(false);
    setIsFinishStep2Open(true);
  };

  const handlePrevious = () => {
    setIsFinishStep2Open(false);
    setIsFinishStep1Open(true);
  };

  const handleStep2Submit = async () => {
    try {
      const submitData = {
        ...formDataStep1,
        receivedAmount: parseFloat(receivedAmount) || 0,
      };
      await finishTrip(selectedTripId, submitData);
      setTripDetails(null);
      setFormDataStep1(null);
      setReceivedAmount("");
      setIsFinishStep2Open(false);
      setIsDetailsModalOpen(false);
      await fetchActiveTrips();
      toast.success("Tournée terminée avec succès !");
    } catch (error) {
      console.error("Error finishing trip:", error);
      toast.error("Erreur lors de la finalisation de la tournée.");
    }
  };

  const closeModal = () => {
    setIsDetailsModalOpen(false);
    setIsFinishStep1Open(false);
    setIsFinishStep2Open(false);
    setTripDetails(null);
    setSelectedTripId(null);
    setFormDataStep1(null);
    setReceivedAmount("");
  };

  const mapTripDetailsToFormData = (trip) => {
    if (!trip) return null;
    return {
      truck_matricule: trip.TruckAssociation?.matricule || "N/A",
      driver_id: trip.DriverAssociation?.cin || "",
      seller_id: trip.SellerAssociation?.cin || "",
      assistant_id: trip.AssistantAssociation?.cin || "",
      date: trip.date,
      zone: trip.zone || "N/A",
      tripProducts:
        trip.TripProducts?.map((product) => ({
          product_id: product.ProductAssociation?.id,
          qttOut: product.qttOut,
          qttOutUnite: product.qttOutUnite,
        })) || [],
      tripBoxes:
        trip.TripBoxes?.map((box) => ({
          box_id: box.BoxAssociation?.id,
          qttOut: box.qttOut,
        })) || [],
    };
  };

  if (loadingTrip)
    return <p className="text-center text-gray-400">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!activeTrips || activeTrips.length === 0) {
    return (
      <p className="text-center text-gray-400">
        Il n'y a pas de tournées actives.
      </p>
    );
  }

  return (
    <div className="container mx-auto ">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTrips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
              <h4 className="text-lg font-semibold text-gray-800">
                Tournée #{trip.id}
              </h4>
              <span className="text-sm text-gray-500">
                {new Date(trip.date).toLocaleDateString()}
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">Camion:</span>
                <span>{trip.TruckAssociation?.matricule || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Conducteur:</span>
                <span>{trip.DriverAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Vendeur:</span>
                <span>{trip.SellerAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Assistant:</span>
                <span>{trip.AssistantAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Zone:</span>
                <span>{trip.zone}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => handleShowDetails(trip.id)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm"
              >
                Afficher Détails
              </Button>
              <Button
                onClick={() => openFinishModal(trip.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Terminer
              </Button>
            </div>
          </div>
        ))}
      </div>

      {isDetailsModalOpen &&
        tripDetails &&
        !isFinishStep1Open &&
        !isFinishStep2Open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                <h5 className="text-xl font-semibold text-gray-800">
                  Détails de la Tournée #{selectedTripId}
                </h5>
                <button
                  onClick={closeModal}
                  className="text-gray-600 hover:text-red-500 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Camion:</span>{" "}
                    {tripDetails.TruckAssociation?.matricule || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Conducteur:</span>{" "}
                    {tripDetails.DriverAssociation?.name || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Vendeur:</span>{" "}
                    {tripDetails.SellerAssociation?.name || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Assistant:</span>{" "}
                    {tripDetails.AssistantAssociation?.name || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Zone:</span>{" "}
                    {tripDetails.zone}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(tripDetails.date).toLocaleDateString()}
                  </div>
                </div>
                {tripDetails.TripProducts &&
                  tripDetails.TripProducts.length > 0 && (
                    <div>
                      <h6 className="text-md font-semibold text-gray-800">
                        Produits Sortis
                      </h6>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-100">
                            <th className="text-left p-2">Désignation</th>
                            <th className="text-left p-2">Qté Caisses</th>
                            <th className="text-left p-2">Qté Unités</th>
                            <th className="text-left p-2">Unités Totales</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tripDetails.TripProducts.map((product, index) => {
                            const productData =
                              products.find(
                                (p) => Number(p.id) === Number(product.product)
                              ) || {};
                            const capacityByBox =
                              productData.capacityByBox || 0;
                            const totalUnits =
                              (product.qttOut || 0) * capacityByBox +
                              (product.qttOutUnite || 0);
                            return (
                              <tr
                                key={index}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="p-2">
                                  {productData.designation || "N/A"}
                                </td>
                                <td className="p-2">{product.qttOut}</td>
                                <td className="p-2">{product.qttOutUnite}</td>
                                <td className="p-2">{totalUnits}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t font-semibold">
                            <td className="p-2">Total</td>
                            <td className="p-2">
                              {tripDetails.TripProducts.length} produits
                            </td>
                            <td className="p-2"></td>
                            <td className="p-2">
                              {tripDetails.TripProducts.reduce(
                                (sum, product) => {
                                  const productData =
                                    products.find(
                                      (p) =>
                                        Number(p.id) === Number(product.product)
                                    ) || {};
                                  const capacityByBox =
                                    productData.capacityByBox || 0;
                                  return (
                                    sum +
                                    ((product.qttOut || 0) * capacityByBox +
                                      (product.qttOutUnite || 0))
                                  );
                                },
                                0
                              )}
                            </td>
                          </tr>
                          <tr className="border-t font-semibold">
                            <td className="p-2">Revenu Estimé</td>
                            <td className="p-2" colSpan="3">
                              {calculateEstimatedRevenue(
                                tripDetails.TripProducts,
                                tripDetails.TripWastes,
                                tripDetails.TripCharges
                              ).toFixed(2)}{" "}
                              MAD
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                {tripDetails.TripBoxes && tripDetails.TripBoxes.length > 0 && (
                  <div>
                    <h6 className="text-md font-semibold text-gray-800">
                      Boîtes Sorties
                    </h6>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-100">
                          <th className="text-left p-2">Désignation</th>
                          <th className="text-left p-2">Qté Sortie</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tripDetails.TripBoxes.map((box, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              {box.BoxAssociation?.designation || "N/A"}
                            </td>
                            <td className="p-2">{box.qttOut}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t font-semibold">
                          <td className="p-2">Total</td>
                          <td className="p-2">
                            {tripDetails.TripBoxes.length} boîtes
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    onClick={closeModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                  >
                    Fermer
                  </Button>
                  {tripDetails.isActive && (
                    <Button
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        setIsFinishStep1Open(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Terminer
                    </Button>
                  )}
                  <Button
                    onClick={() => printInvoiceRef.current?.handlePrint()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Imprimer Facture
                  </Button>
                  <PrintInvoice
                    ref={printInvoiceRef}
                    formData={mapTripDetailsToFormData(tripDetails)}
                    tripDetails={tripDetails}
                    products={products}
                    boxes={boxes}
                    employees={employees}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      {isFinishStep1Open && tripDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
              <h5 className="text-xl font-semibold text-gray-800">
                Terminer la Tournée #{selectedTripId} - Étape 1
              </h5>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <FinishTripForm
              tripDetails={tripDetails}
              onSubmit={handleStep1Submit}
              onCancel={closeModal}
              onPrevious={handlePrevious}
              products={products}
              boxes={boxes}
              excludeReceivedAmount={true}
            />
          </div>
        </div>
      )}

      {isFinishStep2Open && tripDetails && formDataStep1 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
              <h5 className="text-xl font-semibold text-gray-800">
                Résumé de la Tournée #{selectedTripId} - Étape 2
              </h5>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Camion:</span>{" "}
                  {tripDetails.TruckAssociation?.matricule || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Conducteur:</span>{" "}
                  {tripDetails.DriverAssociation?.name || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Vendeur:</span>{" "}
                  {tripDetails.SellerAssociation?.name || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Assistant:</span>{" "}
                  {tripDetails.AssistantAssociation?.name || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Zone:</span> {tripDetails.zone}
                </div>
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(tripDetails.date).toLocaleDateString()}
                </div>
              </div>

              {formDataStep1.tripProducts &&
                formDataStep1.tripProducts.length > 0 && (
                  <div>
                    <h6 className="text-md font-semibold text-gray-800">
                      Produits Retournés
                    </h6>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-100">
                          <th className="text-left p-2">Désignation</th>
                          <th className="text-left p-2">
                            Qté Sortie (Caisses)
                          </th>
                          <th className="text-left p-2">Qté Sortie (Unités)</th>
                          <th className="text-left p-2">
                            Qté Retour (Caisses)
                          </th>
                          <th className="text-left p-2">Qté Retour (Unités)</th>
                          <th className="text-left p-2">Qté Vendue (Unités)</th>
                          <th className="text-left p-2">Revenu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formDataStep1.tripProducts.map((product, index) => {
                          const tripProduct = tripDetails.TripProducts.find(
                            (p) =>
                              Number(p.product) === Number(product.product_id)
                          );
                          const productData =
                            products.find(
                              (p) => Number(p.id) === Number(product.product_id)
                            ) || {};
                          const capacityByBox = productData.capacityByBox || 0;
                          const priceUnite = productData.priceUnite || 0;
                          const qttVendu =
                            ((tripProduct?.qttOut || 0) -
                              (product.qttReutour || 0)) *
                              capacityByBox +
                            ((tripProduct?.qttOutUnite || 0) -
                              (product.qttReutourUnite || 0));
                          return (
                            <tr
                              key={index}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="p-2">
                                {productData.designation || "N/A"}
                              </td>
                              <td className="p-2">
                                {tripProduct?.qttOut || 0}
                              </td>
                              <td className="p-2">
                                {tripProduct?.qttOutUnite || 0}
                              </td>
                              <td className="p-2">{product.qttReutour || 0}</td>
                              <td className="p-2">
                                {product.qttReutourUnite || 0}
                              </td>
                              <td className="p-2">{qttVendu}</td>
                              <td className="p-2">
                                {(qttVendu * priceUnite).toFixed(2)} MAD
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t font-semibold">
                          <td className="p-2">Total</td>
                          <td className="p-2">
                            {tripDetails.TripProducts.reduce(
                              (sum, p) => sum + (p.qttOut || 0),
                              0
                            )}
                          </td>
                          <td className="p-2">
                            {tripDetails.TripProducts.reduce(
                              (sum, p) => sum + (p.qttOutUnite || 0),
                              0
                            )}
                          </td>
                          <td className="p-2">
                            {formDataStep1.tripProducts.reduce(
                              (sum, p) => sum + (p.qttReutour || 0),
                              0
                            )}
                          </td>
                          <td className="p-2">
                            {formDataStep1.tripProducts.reduce(
                              (sum, p) => sum + (p.qttReutourUnite || 0),
                              0
                            )}
                          </td>
                          <td className="p-2">
                            {formDataStep1.tripProducts.reduce(
                              (sum, product) => {
                                const tripProduct =
                                  tripDetails.TripProducts.find(
                                    (p) =>
                                      Number(p.product) ===
                                      Number(product.product_id)
                                  );
                                const productData =
                                  products.find(
                                    (p) =>
                                      Number(p.id) ===
                                      Number(product.product_id)
                                  ) || {};
                                const capacityByBox =
                                  productData.capacityByBox || 0;
                                return (
                                  sum +
                                  (((tripProduct?.qttOut || 0) -
                                    (product.qttReutour || 0)) *
                                    capacityByBox +
                                    ((tripProduct?.qttOutUnite || 0) -
                                      (product.qttReutourUnite || 0)))
                                );
                              },
                              0
                            )}
                          </td>
                          <td className="p-2">
                            {formDataStep1.tripProducts
                              .reduce((sum, product) => {
                                const tripProduct =
                                  tripDetails.TripProducts.find(
                                    (p) =>
                                      Number(p.product) ===
                                      Number(product.product_id)
                                  );
                                const productData =
                                  products.find(
                                    (p) =>
                                      Number(p.id) ===
                                      Number(product.product_id)
                                  ) || {};
                                const capacityByBox =
                                  productData.capacityByBox || 0;
                                const priceUnite = productData.priceUnite || 0;
                                const qttVendu =
                                  ((tripProduct?.qttOut || 0) -
                                    (product.qttReutour || 0)) *
                                    capacityByBox +
                                  ((tripProduct?.qttOutUnite || 0) -
                                    (product.qttReutourUnite || 0));
                                return sum + qttVendu * priceUnite;
                              }, 0)
                              .toFixed(2)}{" "}
                            MAD
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

              {formDataStep1.tripBoxes &&
                formDataStep1.tripBoxes.length > 0 && (
                  <div>
                    <h6 className="text-md font-semibold text-gray-800">
                      Boîtes Retournées
                    </h6>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-100">
                          <th className="text-left p-2">Désignation</th>
                          <th className="text-left p-2">Qté Sortie</th>
                          <th className="text-left p-2">Qté Retour</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formDataStep1.tripBoxes.map((box, index) => {
                          const tripBox = tripDetails.TripBoxes.find(
                            (b) => Number(b.box) === Number(box.box_id)
                          );
                          return (
                            <tr
                              key={index}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="p-2">
                                {tripBox?.BoxAssociation?.designation || "N/A"}
                              </td>
                              <td className="p-2">{tripBox?.qttOut || 0}</td>
                              <td className="p-2">{box.qttIn || 0}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t font-semibold">
                          <td className="p-2">Total</td>
                          <td className="p-2">
                            {tripDetails.TripBoxes.reduce(
                              (sum, b) => sum + (b.qttOut || 0),
                              0
                            )}
                          </td>
                          <td className="p-2">
                            {formDataStep1.tripBoxes.reduce(
                              (sum, b) => sum + (b.qttIn || 0),
                              0
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

              {formDataStep1.tripWastes &&
                formDataStep1.tripWastes.length > 0 && (
                  <>
                    <div>
                      <h6 className="text-md font-semibold text-gray-800">
                        Déchets Défauts
                      </h6>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-100">
                            <th className="text-left p-2">Produit</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Quantité</th>
                            <th className="text-left p-2">Coût</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formDataStep1.tripWastes
                            .filter((waste) => waste.type === "Défaut")
                            .map((waste, index) => {
                              const productData =
                                products.find(
                                  (p) => Number(p.id) === Number(waste.product)
                                ) || {};
                              const priceUnite = productData.priceUnite || 0;
                              return (
                                <tr
                                  key={index}
                                  className="border-b hover:bg-gray-50"
                                >
                                  <td className="p-2">
                                    {productData.designation || "N/A"}
                                  </td>
                                  <td className="p-2">{waste.type}</td>
                                  <td className="p-2">{waste.qtt}</td>
                                  <td className="p-2">
                                    {(waste.qtt * priceUnite).toFixed(2)} MAD
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t font-semibold">
                            <td className="p-2">Total Défauts</td>
                            <td className="p-2"></td>
                            <td className="p-2">
                              {formDataStep1.tripWastes
                                .filter((waste) => waste.type === "Défaut")
                                .reduce((sum, waste) => sum + (waste.qtt || 0), 0)}
                            </td>
                            <td className="p-2">
                              {formDataStep1.tripWastes
                                .filter((waste) => waste.type === "Défaut")
                                .reduce((sum, waste) => {
                                  const productData =
                                    products.find(
                                      (p) =>
                                        Number(p.id) === Number(waste.product)
                                    ) || {};
                                  return (
                                    sum + waste.qtt * (productData.priceUnite || 0)
                                  );
                                }, 0)
                                .toFixed(2)}{" "}
                              MAD
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div>
                      <h6 className="text-md font-semibold text-gray-800">
                        Déchets Changes
                      </h6>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-100">
                            <th className="text-left p-2">Produit</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Quantité</th>
                            <th className="text-left p-2">Coût</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formDataStep1.tripWastes
                            .filter((waste) => waste.type === "Change")
                            .map((waste, index) => {
                              const productData =
                                products.find(
                                  (p) => Number(p.id) === Number(waste.product)
                                ) || {};
                              const priceUnite = productData.priceUnite || 0;
                              return (
                                <tr
                                  key={index}
                                  className="border-b hover:bg-gray-50"
                                >
                                  <td className="p-2">
                                    {productData.designation || "N/A"}
                                  </td>
                                  <td className="p-2">{waste.type}</td>
                                  <td className="p-2">{waste.qtt}</td>
                                  <td className="p-2">
                                    {(waste.qtt * priceUnite).toFixed(2)} MAD
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t font-semibold">
                            <td className="p-2">Total Changes</td>
                            <td className="p-2"></td>
                            <td className="p-2">
                              {formDataStep1.tripWastes
                                .filter((waste) => waste.type === "Change")
                                .reduce((sum, waste) => sum + (waste.qtt || 0), 0)}
                            </td>
                            <td className="p-2">
                              {formDataStep1.tripWastes
                                .filter((waste) => waste.type === "Change")
                                .reduce((sum, waste) => {
                                  const productData =
                                    products.find(
                                      (p) =>
                                        Number(p.id) === Number(waste.product)
                                    ) || {};
                                  return (
                                    sum + waste.qtt * (productData.priceUnite || 0)
                                  );
                                }, 0)
                                .toFixed(2)}{" "}
                              MAD
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div>
                      <h6 className="text-md font-semibold text-gray-800">
                        Total Déchets
                      </h6>
                      <table className="w-full text-sm border-collapse">
                        <tbody>
                          <tr className="border-b font-semibold">
                            <td className="p-2">Total Déchets (Défauts + Changes)</td>
                            <td className="p-2">
                              {formDataStep1.tripWastes.reduce(
                                (sum, waste) => sum + (waste.qtt || 0),
                                0
                              )}
                            </td>
                            <td className="p-2">
                              {formDataStep1.tripWastes
                                .reduce((sum, waste) => {
                                  const productData =
                                    products.find(
                                      (p) =>
                                        Number(p.id) === Number(waste.product)
                                    ) || {};
                                  return (
                                    sum + waste.qtt * (productData.priceUnite || 0)
                                  );
                                }, 0)
                                .toFixed(2)}{" "}
                              MAD
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

              {formDataStep1.tripCharges &&
                formDataStep1.tripCharges.length > 0 && (
                  <div>
                    <h6 className="text-md font-semibold text-gray-800">
                      Charges
                    </h6>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-100">
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Montant (MAD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formDataStep1.tripCharges.map((charge, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">{charge.type}</td>
                            <td className="p-2">
                              {(charge.amount || 0).toFixed(2)} MAD
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t font-semibold">
                          <td className="p-2">Total</td>
                          <td className="p-2">
                            {formDataStep1.tripCharges
                              .reduce(
                                (sum, charge) => sum + (charge.amount || 0),
                                0
                              )
                              .toFixed(2)}{" "}
                            MAD
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

              <div>
                <h6 className="text-md font-semibold text-gray-800">
                  Résumé Financier
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-md bg-gray-50">
                  <div>
                    <span className="font-medium">Revenu Brut Estimé:</span>{" "}
                    {calculateTotalProductAmount()} MAD
                  </div>
                  <div>
                    <span className="font-medium">La commission de vente:</span>{" "}
                    {(calculateTotalProductAmount() * 0.008).toFixed(2)} MAD
                  </div>
                  <div>
                    <span className="font-medium">Coût Total des Déchets:</span>{" "}
                    {formDataStep1.tripWastes
                      .reduce((sum, waste) => {
                        const productData =
                          products.find(
                            (p) => Number(p.id) === Number(waste.product)
                          ) || {};
                        return sum + waste.qtt * (productData.priceUnite || 0);
                      }, 0)
                      .toFixed(2)}{" "}
                    MAD
                    {formDataStep1.tripWastes.length > 0 && (
                      <span className="block text-xs text-gray-500">
                        (Quantité Totale:{" "}
                        {formDataStep1.tripWastes.reduce(
                          (sum, waste) => sum + (waste.qtt || 0),
                          0
                        )}{" "}
                        unités)
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Total Charges:</span>{" "}
                    {formDataStep1.tripCharges
                      .reduce(
                        (total, charge) => total + (charge.amount || 0),
                        0
                      )
                      .toFixed(2)}{" "}
                    MAD
                  </div>
                  <div>
                    <span className="font-medium">
                      Revenu Net Estimé (Attendu):
                    </span>{" "}
                    {calc(formDataStep1.tripWastes, formDataStep1.tripCharges)}{" "}
                    MAD
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Montant Reçu (MAD)
                </label>
                <input
                  type="text"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Entrez le montant reçu"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  onClick={handlePrevious}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                  Précédent
                </Button>
                <Button
                  onClick={closeModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => printInvoiceRef.current?.handlePrint()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Imprimer Facture
                </Button>
                <Button
                  onClick={handleStep2Submit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!receivedAmount || parseFloat(receivedAmount) < 0}
                >
                  Finaliser la Tournée
                </Button>
                <PrintInvoice
                  ref={printInvoiceRef}
                  formData={mapTripDetailsToFormData(tripDetails)}
                  tripDetails={tripDetails}
                  products={products}
                  boxes={boxes}
                  employees={employees}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourneeActive;