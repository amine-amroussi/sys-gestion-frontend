// ListeDesProduits.jsx
"use client";
import {
  Trash,
  Edit,
  ChevronRight,
  ChevronLeft,
  Printer,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useProduct } from "@/store/productStore";
import EditProductSheet from "./sheet/EditProductSheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ShowToast } from "@/utils/toast";
import { axiosInstance } from "@/utils/axiosInstance";
import PrintProductList from "./ProductPrintList";

const ListeDesProduits = () => {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
  });
  const [tempFilters, setTempFilters] = useState(filters);

  const {
    productState: { products, loadingProduct, pagination },
    fetchAllProducts,
    nextPage,
  } = useProduct();

  useEffect(() => {
    console.log("useEffect triggered with filters:", filters);
    fetchAllProducts(pagination.currentPage, pagination.pageSize, filters);
  }, [fetchAllProducts, pagination.currentPage, pagination.pageSize, filters]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAllProducts(newPage, pagination.pageSize, filters);
    }
  };

  const handleDelete = async (id) => {
    const toastId = ShowToast.loading("Suppression du produit...");
    const existingProduct = products.find((product) => product.id === id);

    try {
      const response = await axiosInstance.delete(`/product/${id}`);
      if (response.status === 200) {
        await fetchAllProducts(
          pagination.currentPage,
          pagination.pageSize,
          filters
        );
        ShowToast.dismiss(toastId);
        ShowToast.successDelete();
      }
    } catch (error) {
      ShowToast.dismiss(toastId);
      ShowToast.error(
        error.response?.data?.msg || "Erreur lors de la suppression du produit."
      );
    }
  };

  const handleTempFilterChange = (name, value) => {
    console.log(`Updating tempFilters: ${name} = ${value}`);
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    console.log("Applying filters:", tempFilters);
    setFilters(tempFilters);
    // Reset to page 1 when filters change
    fetchAllProducts(1, pagination.pageSize, tempFilters);
  };

  const handleResetFilters = () => {
    console.log("Resetting filters");
    const defaultFilters = { search: "", minPrice: "", maxPrice: "" };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    fetchAllProducts(1, pagination.pageSize, defaultFilters);
  };

  const handlePrint = () => {
    PrintProductList(products);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxPagesToShow / 2)
    );
    const endPage = Math.min(
      pagination.totalPages,
      startPage + maxPagesToShow - 1
    );

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
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-8"
              placeholder="Rechercher par désignation..."
              value={tempFilters.search}
              onChange={(e) => handleTempFilterChange("search", e.target.value)}
            />
          </div>
          <Input
            type="number"
            placeholder="Prix min"
            value={tempFilters.minPrice}
            onChange={(e) => handleTempFilterChange("minPrice", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Prix max"
            value={tempFilters.maxPrice}
            onChange={(e) => handleTempFilterChange("maxPrice", e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} variant="primary">
              Appliquer les filtres
            </Button>
            <Button onClick={handleResetFilters} variant="outline">
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-end">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          Imprimer la liste
        </Button>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <EditProductSheet open={open} setOpen={setOpen} productId={productId} />
        {loadingProduct && <p className="text-gray-600 mb-4">Chargement...</p>}
        {!loadingProduct && (!products || products.length === 0) && (
          <p className="text-gray-600 mb-4">Aucun produit trouvé.</p>
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Designation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Genre
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                En stock
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unité en stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacité de crate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Crate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products?.map((product) => (
              <tr
                key={product.id}
                className="text-sm text-gray-500 border-b hover:text-black ease-in delay-75 transition-all"
              >
                <td className="px-6 py-4 whitespace-nowrap">#{product?.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.designation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.genre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {product.stock || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {product.uniteInStock || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.priceUnite || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {product.capacityByBox || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.BoxAssociation
                    ? product.BoxAssociation.designation
                    : "Aucun crate"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {/* {
                  (product.stock ===0 && product.uniteInStock ===0) ? <button
                    className="mr-2"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash className="w-4 h-4 cursor-pointer" />
                  </button> : ""
                } */}
                  <button
                    onClick={() => {
                      setOpen(true);
                      setProductId(product.id);
                    }}
                  >
                    <Edit className="w-4 h-4 cursor-pointer" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
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

      {/* Pagination Info */}
      {pagination.totalItems > 0 && (
        <p className="text-center mt-2 text-sm text-gray-500">
          Affichage de {products.length} sur {pagination.totalItems} produits
          (Page {pagination.currentPage} sur {pagination.totalPages})
        </p>
      )}
    </div>
  );
};

export default ListeDesProduits;
