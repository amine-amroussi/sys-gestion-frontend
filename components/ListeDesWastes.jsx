"use client";
"use client";
import { ChevronRight, ChevronLeft, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useWastes } from "@/store/wastesStore";
import { useProduct } from "@/store/productStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShowToast } from "@/utils/toast";
import PrintWasteList from "./PrintWasteList";
import { axiosInstance } from "@/utils/axiosInstance";

const ListeDesWastes = () => {
  const {
    wasteState: { wastes, loadingWaste, error, pagination },
    fetchAllWastes,
    nextPage,
  } = useWastes();
  const { productState: { products }, fetchAllProducts } = useProduct();
  const [filterInputs, setFilterInputs] = useState({
    type: "",
    startDate: "",
    endDate: "",
  });
  const [filters, setFilters] = useState({
    type: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchAllWastes(pagination.currentPage, pagination.pageSize, filters);
    fetchAllProducts();
  }, [fetchAllWastes, fetchAllProducts, pagination.currentPage, pagination.pageSize, filters.type, filters.startDate, filters.endDate]);

  useEffect(() => {
    if (error) {
      ShowToast.error(error);
    }
  }, [error]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAllWastes(newPage, pagination.pageSize, filters);
    }
  };

  const handlePrint = () => {
    if (wastes.length === 0) {
      ShowToast.error("Aucune liste de déchets à imprimer.");
      return;
    }
    PrintWasteList(wastes);
  };

  const handleFilterInputChange = (e) => {
    const { name, value } = e.target;
    setFilterInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    if (filterInputs.startDate && filterInputs.endDate && new Date(filterInputs.startDate) > new Date(filterInputs.endDate)) {
      ShowToast.error("La date de début ne peut pas être postérieure à la date de fin.");
      return;
    }
    setFilters({ ...filterInputs });
    ShowToast.success("Filtres appliqués.");
  };

  const clearFilters = () => {
    setFilterInputs({
      type: "",
      startDate: "",
      endDate: "",
    });
    setFilters({
      type: "",
      startDate: "",
      endDate: "",
    });
    ShowToast.success("Filtres réinitialisés.");
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={i === pagination.currentPage ? "default" : "outline"}
          onClick={() => handlePageChange(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }
    return pageNumbers;
  };

  const getProductDesignation = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.designation : `Produit #${productId}`;
  };

  const formatDate = (date) => {
    return date
      ? new Date(date).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : 'Non défini';
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="type">Type de déchet</Label>
            <Input
              id="type"
              name="type"
              value={filterInputs.type}
              onChange={handleFilterInputChange}
              placeholder="Filtrer par type"
              className="mt-1 w-56"
            />
          </div>
          {/* <div className="flex-1">
            <Label htmlFor="startDate">Date de début</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={filterInputs.startDate}
              onChange={handleFilterInputChange}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="endDate">Date de fin</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={filterInputs.endDate}
              onChange={handleFilterInputChange}
              className="mt-1"
            />
          </div> */}
        </div>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={applyFilters}>
              Filtrer
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Réinitialiser les filtres
            </Button>
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer la liste
          </Button>
        </div>
      </div>

      {loadingWaste && <p className="text-center">Chargement des déchets...</p>}
      {!loadingWaste && !error && wastes.length === 0 && (
        <p className="text-center">Aucun déchet trouvé.</p>
      )}
      {error && (
        <p className="text-center text-red-500">{error}</p>
      )}

      {!loadingWaste && !error && wastes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Désignation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wastes.map((waste) => (
                <tr
                  key={`${waste.product}-${waste.type}`}
                  className="text-sm text-gray-500 border-b hover:text-black ease-in delay-75 transition-all"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{getProductDesignation(waste.product)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{waste.qtt || 'Non défini'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{waste.type || 'Non défini'}</td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">{formatDate(waste.createdAt)}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          {renderPageNumbers()}

          <Button
            variant="outline"
            onClick={nextPage}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {pagination.totalItems > 0 && (
        <p className="text-center mt-2 text-sm text-gray-500">
          Affichage de {wastes.length} sur {pagination.totalItems} déchets (Page{" "}
          {pagination.currentPage} sur {pagination.totalPages})
        </p>
      )}
    </div>
  );
};

export default ListeDesWastes;