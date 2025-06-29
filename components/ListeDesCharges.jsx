"use client";
import { ChevronRight, ChevronLeft, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useCharges } from "@/store/chargeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PrintChargeList from "@/components/PrintChargeList";

const ListeDesCharges = () => {
  const {
    chargeState: { charges, loadingCharge, error, pagination },
    fetchAllCharges,
    nextPage,
  } = useCharges();

  const [filters, setFilters] = useState({
    type: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchAllCharges(pagination.currentPage, pagination.pageSize, filters);
  }, [fetchAllCharges, pagination.currentPage, pagination.pageSize, filters]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAllCharges(newPage, pagination.pageSize, filters);
    }
  };

  const handlePrint = () => {
    PrintChargeList(charges);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      startDate: "",
      endDate: "",
    });
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="type">Type de charge</Label>
            <Input
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              placeholder="Filtrer par type"
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="startDate">Date de début</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="endDate">Date de fin</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mt-1"
            />
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={clearFilters}>
            Réinitialiser les filtres
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer la liste
          </Button>
        </div>
      </div>

      {loadingCharge && <p className="text-center">Chargement des charges...</p>}
      {!loadingCharge && !error && charges.length === 0 && (
        <p className="text-center">Aucune charge trouvée.</p>
      )}
      {error && (
        <p className="text-center text-red-500">{error}</p>
      )}

      {!loadingCharge && !error && charges.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant (MAD)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {charges.map((charge) => (
                <tr
                  key={charge.id}
                  className="text-sm text-gray-500 border-b hover:text-black ease-in delay-75 transition-all"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{charge.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{charge.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(charge.date)}</td>
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
          Affichage de {charges.length} sur {pagination.totalItems} charges (Page{" "}
          {pagination.currentPage} sur {pagination.totalPages})
        </p>
      )}
    </div>
  );
};

export default ListeDesCharges;