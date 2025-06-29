"use client";
import { Trash, Edit, ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useSupplier } from "@/store/supplierStore";
import AddSupplierSheet from "./sheet/AddSupplierSheet";
import EditSupplierSheet from "./sheet/EditSupplierSheet";
import { Button } from "./ui/button";

const ListeDesSuppliers = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const {
    supplierState: { suppliers, loadingSupplier, error, pagination },
    fetchAllSuppliers,
    deleteSupplier,
    nextPage,
  } = useSupplier();

  useEffect(() => {
    fetchAllSuppliers(pagination.currentPage, pagination.pageSize);
  }, [fetchAllSuppliers, pagination.currentPage, pagination.pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAllSuppliers(newPage, pagination.pageSize);
    }
  };

  const handleSupplierAdded = () => {
    fetchAllSuppliers(pagination.currentPage, pagination.pageSize);
    setAddOpen(false);
  };

  const handleSupplierEdited = () => {
    fetchAllSuppliers(pagination.currentPage, pagination.pageSize);
    setEditOpen(false);
    setSelectedId(null);
  };

  const handleDelete = async (id) => {
    await deleteSupplier(id);
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

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-semibold">Liste des Fournisseur</h1>
        <Button onClick={() => setAddOpen(true)}>Ajouter Fournisseur</Button>
      </div>

      <AddSupplierSheet open={addOpen} setOpen={setAddOpen} onSupplierAdded={handleSupplierAdded} />
      <EditSupplierSheet
        open={editOpen}
        setOpen={setEditOpen}
        id={selectedId}
        onSupplierEdited={handleSupplierEdited}
      />

      {loadingSupplier && <p className="text-center">Chargement des fournisseurs...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loadingSupplier && !error && suppliers.length === 0 && (
        <p className="text-center">Aucun fournisseur trouvé.</p>
      )}

      {!loadingSupplier && !error && suppliers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="text-sm text-gray-500 border-b hover:text-black ease-in delay-75 transition-all"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{supplier.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{supplier.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{supplier.tel}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{supplier.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button onClick={() => handleDelete(supplier.id)}>
                      <Trash className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700" />
                    </button>
                    <button onClick={() => { setEditOpen(true); setSelectedId(supplier.id); }}>
                      <Edit className="w-4 h-4 cursor-pointer text-blue-500 hover:text-blue-700" />
                    </button>
                  </td>
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
          Affichage de {suppliers.length} sur {pagination.totalItems} fournisseurs (Page{" "}
          {pagination.currentPage} sur {pagination.totalPages})
        </p>
      )}
    </div>
  );
};

export default ListeDesSuppliers;