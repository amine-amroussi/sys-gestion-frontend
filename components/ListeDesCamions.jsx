"use client";
import { useCamion } from "@/store/camionStore";
import { Edit, Trash, Truck } from "lucide-react";
import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { ShowToast } from "@/utils/toast";

const ListeDesCamions = () => {
  const { fetchAllCamions, deleteCamion, camionState: { camions, loadingCamion, error } } = useCamion();

  useEffect(() => {
    fetchAllCamions();
  }, [fetchAllCamions]);

  const handleDelete = async (matricule) => {
    await deleteCamion(matricule);
  };

  return (
    <div className="container mx-auto p-4">
      {loadingCamion && <p className="text-center">Chargement des camions...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loadingCamion && !error && camions.length === 0 && (
        <p className="text-center">Aucun camion trouvé.</p>
      )}
      {!loadingCamion && !error && camions.length > 0 && (
        <div className="flex flex-wrap gap-10 items-center">
          {camions.map((camion) => (
            <div
              key={camion.matricule}
              className="w-52 p-5 flex items-center gap-2 bg-gray-100 rounded transition-all ease-in delay-75 border border-gray-300 hover:bg-gray-200 hover:border-black"
            >
              <div className="w-15 h-15 flex items-center justify-center bg-gray-300 rounded-full">
                <Truck className="text-gray-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{camion.matricule}</h3>
                <p className="text-sm text-gray-600">Capacité: {camion.capacity}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => ShowToast.error("Modification non implémentée.")}
                  >
                    <Edit className="w-5 h-5 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(camion.matricule)}
                  >
                    <Trash className="w-5 h-5 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListeDesCamions;