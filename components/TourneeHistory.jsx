"use client";
import { useTrip } from "@/store/tripStore";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { toast } from "sonner";

const TourneeHistory = () => {
  const {
    tripState: { trips, loadingTrip, error, pagination },
    fetchAllTrips,
  } = useTrip();

  useEffect(() => {
    fetchAllTrips();
  }, []);

  if (loadingTrip) return <p className="text-center text-gray-400">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!trips || trips.length === 0)
    return <p className="text-center text-gray-400">Aucune tournée terminée.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Historique des Tournées</h2>
      <div className="flex flex-wrap gap-3 mx-auto">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="flex flex-col w-75 text-black p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
              <h4 className="text-lg font-medium text-black">Tournée #{trip.id}</h4>
              <span className="text-sm text-black-400">
                {new Date(trip.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span>Camion:</span>
                <span className="text-black">{trip.TruckAssociation?.matricule || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Conducteur:</span>
                <span>{trip.DriverAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Vendeur:</span>
                <span>{trip.SellerAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Assistant:</span>
                <span>{trip.AssistantAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Zone:</span>
                <span>{trip.zone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Montant Attendu:</span>
                <span>{trip.waitedAmount || 0} MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Montant Reçu:</span>
                <span>{trip.receivedAmount || 0} MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Bénéfice:</span>
                <span>{trip.benefit || 0} MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Différence:</span>
                <span>{trip.deff || 0} MAD</span>
              </div>
            </div>
            {trip.TripProducts && trip.TripProducts.length > 0 ? (
              <div className="mt-2">
                <h6 className="text-md font-medium text-black">Produits:</h6>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">Désignation</th>
                      <th className="text-left p-1">Qté Sortie</th>
                      <th className="text-left p-1">Qté Retour</th>
                      <th className="text-left p-1">Qté Vendue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trip.TripProducts.map((product, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-1">{product.ProductAssociation?.designation || "N/A"}</td>
                        <td className="p-1">{product.qttOut} caisses, {product.qttOutUnite} unités</td>
                        <td className="p-1">{product.qttReutour || 0} caisses, {product.qttReutourUnite || 0} unités</td>
                        <td className="p-1">{product.qttVendu || 0} unités</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-500">Aucun produit enregistré.</div>
            )}
            {trip.TripBoxes && trip.TripBoxes.length > 0 ? (
              <div className="mt-2">
                <h6 className="text-md font-medium text-black">Boîtes:</h6>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">Désignation</th>
                      <th className="text-left p-1">Qté Sortie</th>
                      <th className="text-left p-1">Qté Entrée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trip.TripBoxes.map((box, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-1">{box.BoxAssociation?.designation || "N/A"}</td>
                        <td className="p-1">{box.qttOut}</td>
                        <td className="p-1">{box.qttIn || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-500">Aucune boîte enregistrée.</div>
            )}
            <div className="mt-2 text-sm text-gray-500">Déchets non disponibles.</div>
            <div className="mt-2 text-sm text-gray-500">Charges non disponibles.</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <Button
          onClick={() => fetchAllTrips(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          Précédent
        </Button>
        <Button
          onClick={() => fetchAllTrips(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};

export default TourneeHistory;