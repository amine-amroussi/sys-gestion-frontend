"use client";
import { useEffect, useState } from "react";
import { useTrip } from "@/store/tripStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { axiosInstance } from "@/utils/axiosInstance";
import PrintAfternoonInvoice from "@/components/PrintAfternoonInvoice";

const ListeDesTournees = () => {
  const {
    tripState: { trips, loadingTrip, error, pagination },
    fetchAllTrips,
    fetchTripById,
    finishTrip,
    emptyTruck,
  } = useTrip();

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [lastTripDetails, setLastTripDetails] = useState(null);
  const [previousTripDetails, setPreviousTripDetails] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [selectedMatricule, setSelectedMatricule] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    employee: "",
    truck: "",
    status: "",
    search: "",
    sortBy: "date",
    sortOrder: "DESC",
    pageSize: 10,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const trucksRes = await axiosInstance.get("/truck");
        setTrucks(trucksRes.data.trucks || []);
        await fetchAllTrips(1, {
          page: 1,
          limit: filters.pageSize,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        });
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Erreur lors de la récupération des données initiales.");
      }
    };
    fetchInitialData();
  }, [fetchAllTrips, filters.pageSize, filters.sortBy, filters.sortOrder]);

  const fetchTripsWithFilters = async (page = 1) => {
    try {
      const queryParams = {
        page,
        limit: filters.pageSize,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        employee: filters.employee || undefined,
        truck: filters.truck || undefined,
        status: filters.status === "all" ? undefined : filters.status,
        search: filters.search || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      await fetchAllTrips(page, queryParams);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Erreur lors de l'application des filtres.");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchTripsWithFilters(1);
  };

  const resetFilters = () => {
    const defaultFilters = {
      startDate: "",
      endDate: "",
      employee: "",
      truck: "",
      status: "",
      search: "",
      sortBy: "date",
      sortOrder: "DESC",
      pageSize: 10,
    };
    setFilters(defaultFilters);
    fetchAllTrips(1, { page: 1, limit: 10, sortBy: "date", sortOrder: "DESC" });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchTripsWithFilters(page);
    }
  };

  const handleTripClick = async (tripId) => {
    try {
      const parsedTripId = parseInt(tripId, 10);
      if (isNaN(parsedTripId)) {
        throw new Error("ID de tournée invalide.");
      }
      setPreviousTripDetails(null);
      setLastTripDetails(null);
      setInvoiceData(null);

      const trip = await fetchTripById(parsedTripId);
      setSelectedTrip(trip);
      setIsModalOpen(true);

      if (trip.TruckAssociation?.matricule) {
        try {
          const lastTripResponse = await axiosInstance.get(
            `/trip/last/${trip.TruckAssociation.matricule}`
          );
          console.log("Last trip response:", lastTripResponse.data);
          setLastTripDetails(lastTripResponse.data || null);

          const previousTripResponse = await axiosInstance.get(
            `/trip/previous/${parsedTripId}`
          );
          console.log("Previous trip response:", previousTripResponse.data);
          setPreviousTripDetails(
            previousTripResponse.data.previousTrip || null
          );
        } catch (fetchError) {
          console.error("Error fetching trip details:", fetchError);
          setLastTripDetails(null);
          setPreviousTripDetails(null);
          toast.error(
            "Erreur lors de la récupération des détails des tournées précédentes."
          );
        }
      } else {
        setLastTripDetails(null);
        setPreviousTripDetails(null);
        console.log("No truck matricule, skipping last/previous trip fetch.");
      }

      if (!trip.isActive) {
        setInvoiceData({
          tripId: trip.id,
          truck: trip.TruckAssociation?.matricule || "N/A",
          driver: trip.DriverAssociation?.name || "N/A",
          seller: trip.SellerAssociation?.name || "N/A",
          date: trip.date,
          zone: trip.zone,
          products: combineProducts(trip.TripProducts, previousTripDetails?.TripProducts) || [],
          boxes: combineBoxes(trip.TripBoxes, previousTripDetails?.TripBoxes) || [],
          wastes: trip.TripWastes?.map((w) => ({
            product:
              w.WasteAssociation?.ProductAssociation?.designation ||
              w.product ||
              "Inconnu",
            type: w.type || "N/A",
            qtt: w.qtt || 0,
            priceUnite:
              w.WasteAssociation?.ProductAssociation?.priceUnite || 0,
            cost:
              (w.qtt || 0) *
              (w.WasteAssociation?.ProductAssociation?.priceUnite || 0),
          })) || [],
          charges: trip.TripCharges?.map((c) => ({
            type: c.ChargeAssociation?.type || "N/A",
            amount: c.amount || 0,
          })) || [],
          totals: {
            waitedAmount: trip.waitedAmount || 0,
            receivedAmount: trip.receivedAmount || 0,
            benefit: trip.benefit || 0,
            deff: trip.deff || 0,
            tripCharges:
              trip.TripCharges?.reduce((sum, c) => sum + (c.amount || 0), 0) ||
              0,
            totalWasteCost:
              trip.TripWastes?.reduce(
                (sum, w) =>
                  sum +
                  (w.qtt || 0) *
                    (w.WasteAssociation?.ProductAssociation?.priceUnite || 0),
                0
              ) || 0,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching trip:", error);
      toast.error("Erreur lors de la récupération des détails de la tournée.");
      setSelectedTrip(null);
      setIsModalOpen(false);
    }
  };

  const handleEmptyTruck = async () => {
    try {
      if (!selectedTrip || !lastTripDetails) {
        throw new Error(
          "Aucune tournée ou données du dernier trajet disponibles."
        );
      }
      const formData = {
        tripProducts:
          lastTripDetails.tripProducts?.map((product) => ({
            product_id: product.product,
            qttReutour: product.qttOut || 0,
            qttReutourUnite: product.qttOutUnite || 0,
          })) || [],
        tripBoxes:
          lastTripDetails.tripBoxes?.map((box) => ({
            box_id: box.box,
            qttIn: box.qttOut || 0,
          })) || [],
        tripWastes: [],
        tripCharges: [],
        receivedAmount: 0,
      };
      await finishTrip(selectedTrip.id, formData);
      setSelectedTrip(null);
      setLastTripDetails(null);
      setPreviousTripDetails(null);
      setIsModalOpen(false);
      setInvoiceData(null);
      await fetchTripsWithFilters(pagination.currentPage);
      toast.success("Camion vidé avec succès !");
    } catch (error) {
      console.error("Error emptying truck:", error);
      toast.error("Erreur lors du vidage du camion.");
    }
  };

  const handleEmptyTruckByMatricule = async () => {
    try {
      if (!selectedMatricule) {
        toast.error("Veuillez sélectionner un camion.");
        return;
      }
      await emptyTruck(selectedMatricule);
      setSelectedMatricule("");
      setPreviousTripDetails(null);
      await fetchTripsWithFilters(pagination.currentPage);
      toast.success("Camion vidé avec succès !");
    } catch (error) {
      console.error("Error emptying truck by matricule:", error);
      toast.error("Erreur lors du vidage du camion.");
    }
  };

  const combineProducts = (selectedProducts = [], previousProducts = []) => {
    const productMap = new Map();

    // Process previous trip products for remaining quantities
    previousProducts.forEach((p) => {
      const designation = p.ProductAssociation?.designation || `Produit ${p.product}`;
      productMap.set(p.product, {
        product_id: p.product,
        designation,
        qttRestanteCaisses: p.qttReutour || 0,
        qttRestanteUnites: p.qttReutourUnite || 0,
        newQttOut: 0,
        newQttOutUnite: 0,
        qttReutour: 0,
        qttReutourUnite: 0,
        qttVendu: p.qttVendu || 0,
        priceUnite: p.ProductAssociation?.priceUnite || 0,
        totalUnitsOut: p.totalUnitsOut || 0,
        totalUnitsReturned: p.totalUnitsReturned || 0,
      });
    });

    // Process selected trip products
    selectedProducts.forEach((p) => {
      const designation = p.ProductAssociation?.designation || `Produit ${p.product}`;
      const existing = productMap.get(p.product) || {
        product_id: p.product,
        designation,
        qttRestanteCaisses: 0,
        qttRestanteUnites: 0,
        newQttOut: 0,
        newQttOutUnite: 0,
        qttReutour: 0,
        qttReutourUnite: 0,
        qttVendu: 0,
        priceUnite: 0,
        totalUnitsOut: 0,
        totalUnitsReturned: 0,
      };

      const totalUnitsOut =
        (p.qttOut || 0) * (p.ProductAssociation?.capacityByBox || 0) +
        (p.qttOutUnite || 0);
      const totalUnitsReturned =
        (p.qttReutour || 0) * (p.ProductAssociation?.capacityByBox || 0) +
        (p.qttReutourUnite || 0);

      productMap.set(p.product, {
        ...existing,
        product_id: p.product,
        designation,
        newQttOut: p.qttOut || 0,
        newQttOutUnite: p.qttOutUnite || 0,
        qttReutour: p.qttReutour || 0,
        qttReutourUnite: p.qttReutourUnite || 0,
        qttVendu: p.qttVendu || totalUnitsOut - totalUnitsReturned,
        priceUnite: p.ProductAssociation?.priceUnite || existing.priceUnite || 0,
        totalUnitsOut,
        totalUnitsReturned,
      });
    });

    return Array.from(productMap.values()).map((item) => ({
      ...item,
      sortieTotalCaisses: (item.qttRestanteCaisses || 0) + (item.newQttOut || 0),
      sortieTotalUnites: (item.qttRestanteUnites || 0) + (item.newQttOutUnite || 0),
      totalRevenue: (item.qttVendu || 0) * (item.priceUnite || 0),
    }));
  };

  const combineBoxes = (selectedBoxes = [], previousBoxes = []) => {
    const boxMap = new Map();

    // Process previous trip boxes
    previousBoxes.forEach((b) => {
      const designation = b.BoxAssociation?.designation || `Boîte ${b.box}`;
      boxMap.set(b.box, {
        box_id: b.box,
        designation,
        previousRemaining: (b.qttOut || 0) - (b.qttIn || 0),
        qttOut: 0,
        qttIn: 0,
      });
    });

    // Process selected trip boxes
    selectedBoxes.forEach((b) => {
      const designation = b.BoxAssociation?.designation || `Boîte ${b.box}`;
      const existing = boxMap.get(b.box) || {
        box_id: b.box,
        designation,
        previousRemaining: 0,
        qttOut: 0,
        qttIn: 0,
      };
      boxMap.set(b.box, {
        ...existing,
        box_id: b.box,
        designation,
        qttOut: b.qttOut || 0,
        qttIn: b.qttIn || 0,
      });
    });

    return Array.from(boxMap.values());
  };

  if (loadingTrip)
    return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Liste des Tournées
      </h2>

      <div className="mb-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Vider un Camion
        </h3>
        <div className="flex gap-4 items-end">
          <div className="w-64">
            <Label htmlFor="truck-select" className="text-sm font-medium">
              Camion
            </Label>
            <Select
              value={selectedMatricule}
              onValueChange={setSelectedMatricule}
            >
              <SelectTrigger id="truck-select">
                <SelectValue placeholder="Sélectionner un camion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sélectionner un camion</SelectItem>
                {trucks.map((truck) => (
                  <SelectItem key={truck.matricule} value={truck.matricule}>
                    {truck.matricule}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleEmptyTruckByMatricule}
            disabled={!selectedMatricule || selectedMatricule === "none"}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Vider
          </Button>
        </div>
      </div>

      <div className="mb-6 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-sm font-medium">
              Date Début
            </Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="text-sm font-medium">
              Date Fin
            </Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="employee" className="text-sm font-medium">
              CIN Vendeur
            </Label>
            <Input
              id="employee"
              type="text"
              value={filters.employee}
              placeholder="CIN du vendeur"
              onChange={(e) => handleFilterChange("employee", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="truck" className="text-sm font-medium">
              Camion
            </Label>
            <Input
              id="truck"
              type="text"
              value={filters.truck}
              placeholder="Matricule"
              onChange={(e) => handleFilterChange("truck", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="status" className="text-sm font-medium">
              Statut
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="search" className="text-sm font-medium">
              Recherche (Zone/ID)
            </Label>
            <Input
              id="search"
              type="text"
              value={filters.search}
              placeholder="Zone ou ID"
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="sortBy" className="text-sm font-medium">
              Trier Par
            </Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger id="sortBy">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="zone">Zone</SelectItem>
                <SelectItem value="waitedAmount">Montant Attendu</SelectItem>
                <SelectItem value="receivedAmount">Montant Reçu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sortOrder" className="text-sm font-medium">
              Ordre
            </Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => handleFilterChange("sortOrder", value)}
            >
              <SelectTrigger id="sortOrder">
                <SelectValue placeholder="Descendant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESC">Descendant</SelectItem>
                <SelectItem value="ASC">Ascendant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Appliquer
          </Button>
          <Button onClick={resetFilters} variant="outline">
            Réinitialiser
          </Button>
        </div>
      </div>

      {trips.length === 0 ? (
        <p className="text-center text-gray-500">Aucune tournée disponible.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {trips.map((trip) => (
              <li
                key={trip.id}
                className={`border p-4 rounded-lg shadow cursor-pointer hover:bg-gray-100 ${
                  trip.deff < 0 ? "bg-red-100" : "bg-white"
                }`}
                onClick={() => handleTripClick(trip.id)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      ID: {trip.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      Camion: {trip.TruckAssociation?.matricule || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Date: {format(new Date(trip.date), "dd/MM/yyyy")}
                    </p>
                    <p className="text-sm text-gray-600">
                      Zone: {trip.zone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Statut: {trip.isActive ? "Active" : "Terminée"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Différence: {trip.deff || 0} MAD
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              <Button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className="bg-blue-600 text-white disabled:bg-gray-300 hover:bg-blue-700"
              >
                Première
              </Button>
              <Button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="bg-blue-600 text-white disabled:bg-gray-300 hover:bg-blue-700"
              >
                Précédente
              </Button>
              <Select
                value={pagination.currentPage.toString()}
                onValueChange={(value) => handlePageChange(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder={pagination.currentPage} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <SelectItem key={page} value={page.toString()}>
                      {page}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="bg-blue-600 text-white disabled:bg-gray-300 hover:bg-blue-700"
              >
                Suivante
              </Button>
              <Button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="bg-blue-600 text-white disabled:bg-gray-300 hover:bg-blue-700"
              >
                Dernière
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Page {pagination.currentPage} sur {pagination.totalPages} (
              {pagination.totalItems} tournées)
            </p>
          </div>
        </>
      )}

      {isModalOpen && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Tournée #{selectedTrip.id}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-red-500 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Camion:</p>
                <p>{selectedTrip.TruckAssociation?.matricule || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Conducteur:</p>
                <p>{selectedTrip.DriverAssociation?.name || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Vendeur:</p>
                <p>{selectedTrip.SellerAssociation?.name || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Assistant:</p>
                <p>{selectedTrip.AssistantAssociation?.name || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Zone:</p>
                <p>{selectedTrip.zone || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Date:</p>
                <p>{format(new Date(selectedTrip.date), "dd/MM/yyyy")}</p>
              </div>
              <div>
                <p className="font-medium">Statut:</p>
                <p>{selectedTrip.isActive ? "Active" : "Terminée"}</p>
              </div>
              <div>
                <p className="font-medium">Différence:</p>
                <p>{selectedTrip.deff || 0} MAD</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">Produits</h4>
              {combineProducts(
                selectedTrip.TripProducts,
                previousTripDetails?.TripProducts
              ).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Désignation</th>
                        <th className="p-2 text-right">
                          Quantité Restante (Caisses)
                        </th>
                        <th className="p-2 text-right">
                          Quantité Restante (Unités)
                        </th>
                        <th className="p-2 text-right">Sortie (Caisses)</th>
                        <th className="p-2 text-right">Sortie (Unités)</th>
                        <th className="p-2 text-right">
                          Sortie Total (Caisses)
                        </th>
                        <th className="p-2 text-right">
                          Sortie Total (Unités)
                        </th>
                        <th className="p-2 text-right">Retour (Caisses)</th>
                        <th className="p-2 text-right">Retour (Unités)</th>
                        <th className="p-2 text-right">Vendu</th>
                        <th className="p-2 text-right">Prix (MAD)</th>
                        <th className="p-2 text-right">Total (MAD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combineProducts(
                        selectedTrip.TripProducts,
                        previousTripDetails?.TripProducts
                      ).map((item, index) => (
                        <tr key={`product-${index}`} className="border-b">
                          <td className="p-2">{item.designation}</td>
                          <td className="p-2 text-right">
                            {item.qttRestanteCaisses}
                          </td>
                          <td className="p-2 text-right">
                            {item.qttRestanteUnites}
                          </td>
                          <td className="p-2 text-right">
                            {item.newQttOut}
                          </td>
                          <td className="p-2 text-right">
                            {item.newQttOutUnite}
                          </td>
                          <td className="p-2 text-right">
                            {item.sortieTotalCaisses}
                          </td>
                          <td className="p-2 text-right">
                            {item.sortieTotalUnites}
                          </td>
                          <td className="p-2 text-right">
                            {item.qttReutour}
                          </td>
                          <td className="p-2 text-right">
                            {item.qttReutourUnite}
                          </td>
                          <td className="p-2 text-right">
                            {item.qttVendu}
                          </td>
                          <td className="p-2 text-right">
                            {item.priceUnite}
                          </td>
                          <td className="p-2 text-right">
                            {parseFloat(item.totalRevenue).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Aucun produit trouvé pour cette tournée ou la précédente.
                </p>
              )}
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">Caisses</h4>
              {combineBoxes(
                selectedTrip.TripBoxes,
                previousTripDetails?.TripBoxes
              ).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Désignation</th>
                        <th className="p-2 text-right">
                          Restant Précédent (Caisses)
                        </th>
                        <th className="p-2 text-right">Sortie (Caisses)</th>
                        <th className="p-2 text-right">Retour (Caisses)</th>
                        <th className="p-2 text-right">Diff (Caisses)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combineBoxes(
                        selectedTrip.TripBoxes,
                        previousTripDetails?.TripBoxes
                      ).map((item, index) => (
                        <tr key={`box-${index}`} className="border-b">
                          <td className="p-2">{item.designation}</td>
                          <td className="p-2 text-right">
                            {item.previousRemaining}
                          </td>
                          <td className="p-2 text-right">{item.qttOut}</td>
                          <td className="p-2 text-right">{item.qttIn}</td>
                          <td className="p-2 text-right">
                            {item.qttOut - item.qttIn}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Aucune caisse trouvée pour cette tournée.
                </p>
              )}
            </div>

            {!selectedTrip.isActive && invoiceData && (
              <>
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-2">Déchets</h4>
                  {invoiceData.wastes?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-2 text-left">Produit</th>
                            <th className="p-2 text-right">Type</th>
                            <th className="p-2 text-right">Quantité</th>
                            <th className="p-2 text-right">
                              Prix Unitaire (MAD)
                            </th>
                            <th className="p-2 text-right">Coût Total (MAD)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceData.wastes.map((waste, index) => (
                            <tr key={`waste-${index}`} className="border-b">
                              <td className="p-2">{waste.product}</td>
                              <td className="p-2 text-right">{waste.type}</td>
                              <td className="p-2 text-right">{waste.qtt}</td>
                              <td className="p-2 text-right">
                                {waste.priceUnite}
                              </td>
                              <td className="p-2 text-right">{waste.cost}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Aucun déchet trouvé pour cette tournée.
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-2">Charges</h4>
                  {invoiceData.charges?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-2 text-left">Type</th>
                            <th className="p-2 text-right">Montant (MAD)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceData.charges.map((charge, index) => (
                            <tr key={`charge-${index}`} className="border-b">
                              <td className="p-2">{charge.type}</td>
                              <td className="p-2 text-right">
                                {charge.amount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Aucune charge trouvée pour cette tournée.
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-2">Facture</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Montant Attendu:</p>
                      <p>{invoiceData.totals?.waitedAmount || 0} MAD</p>
                    </div>
                    <div>
                      <p className="font-medium">Montant Reçu:</p>
                      <p>{invoiceData.totals?.receivedAmount || 0} MAD</p>
                    </div>
                    <div>
                      <p className="font-medium">Différence:</p>
                      <p>{invoiceData.totals?.deff || 0} MAD</p>
                    </div>
                    <div>
                      <p className="font-medium">Total Charges:</p>
                      <p>
                        {parseFloat(invoiceData.totals?.tripCharges) || 0} MAD
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Coût Total Déchets:</p>
                      <p>{parseFloat(invoiceData.totals?.totalWasteCost) || 0} MAD</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="mt-6 flex justify-end gap-2">
              {!selectedTrip.isActive && invoiceData && (
                <Button
                  onClick={() => PrintAfternoonInvoice({ invoiceData })}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Imprimer Facture
                </Button>
              )}
              <Button onClick={() => setIsModalOpen(false)} variant="outline">
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeDesTournees;
