"use client";
import { useState, useEffect } from "react";
import { usePurchase } from "@/store/purchaseStore";
import { useSupplier } from "@/store/supplierStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import { X, Plus, Trash } from "lucide-react";
import { axiosInstance } from "@/utils/axiosInstance";
import { format } from "date-fns";
import { ShowToast } from "@/utils/toast";

const AddPurchase = ({ open, setOpen, onPurchaseAdded }) => {
  const {
    createPurchase,
    purchaseState: { loadingPurchase, error },
  } = usePurchase();
  const {
    supplierState: { suppliers },
    fetchAllSuppliers,
  } = useSupplier();
  const [step, setStep] = useState(1);
  const [purchaseInfo, setPurchaseInfo] = useState({
    supplier_id: "",
    date: new Date().toISOString().split("T")[0],
    purchaseProducts: [],
    purchaseBoxes: [],
    purchaseWaste: [],
  });
  const [products, setProducts] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [wasteProducts, setWasteProducts] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // Fetch suppliers and options
  useEffect(() => {
    fetchAllSuppliers(1, 100); // Fetch all suppliers
    const fetchOptions = async () => {
      try {
        const [productRes, boxRes, wasteRes] = await Promise.all([
          axiosInstance.get("/trip/products/all"),
          axiosInstance.get("/box"),
          axiosInstance.get("/waste/all"), // Changed to /waste/all
        ]);

        const fetchedProducts =
          productRes.data.data?.products || productRes.data.products || [];
        if (fetchedProducts.length === 0) {
          setFormErrors({
            fetchProducts:
              "Aucun produit trouvé. Veuillez ajouter des produits d'abord.",
          });
        } else {
          setProducts(fetchedProducts);
        }

        setBoxes(boxRes.data.data?.boxes || boxRes.data.boxes || []);

        const fetchedWastes =
          wasteRes.data.waistes || wasteRes.data.wastes || []; // Handle typo
        const inStockWastes = fetchedWastes.filter(
          (waste) => parseFloat(waste.qtt) > 0
        );
        if (inStockWastes.length === 0) {
          ShowToast.info("Aucun déchet en stock disponible.");
        }
        setWasteProducts(inStockWastes);
      } catch (err) {
        console.error("Failed to fetch options:", err);
        const errorMessage =
          err.response?.data?.message ||
          "Erreur lors du chargement des options";
        setFormErrors({
          fetch: errorMessage,
        });
        ShowToast.error(errorMessage);
      }
    };
    fetchOptions();
  }, [fetchAllSuppliers]);

  // Handle input changes
  const handleChange = (e) => {
    setPurchaseInfo({ ...purchaseInfo, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: "" });
  };

  // Handle dynamic lists
  const addProduct = () => {
    setPurchaseInfo({
      ...purchaseInfo,
      purchaseProducts: [
        ...purchaseInfo.purchaseProducts,
        { product_id: "", qtt: 0, qttUnite: 0, price: 0 },
      ],
    });
  };

  const updateProduct = (index, field, value) => {
    const updatedProducts = [...purchaseInfo.purchaseProducts];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setPurchaseInfo({ ...purchaseInfo, purchaseProducts: updatedProducts });
    setFormErrors({ ...formErrors, [`product_${index}_${field}`]: "" });
  };

  const removeProduct = (index) => {
    setPurchaseInfo({
      ...purchaseInfo,
      purchaseProducts: purchaseInfo.purchaseProducts.filter(
        (_, i) => i !== index
      ),
    });
  };

  const addBox = () => {
    setPurchaseInfo({
      ...purchaseInfo,
      purchaseBoxes: [
        ...purchaseInfo.purchaseBoxes,
        { box: "", qttIn: 0, qttOut: 0 },
      ],
    });
  };

  const updateBox = (index, field, value) => {
    const updatedBoxes = [...purchaseInfo.purchaseBoxes];
    updatedBoxes[index] = { ...updatedBoxes[index], [field]: value };
    setPurchaseInfo({ ...purchaseInfo, purchaseBoxes: updatedBoxes });
    setFormErrors({ ...formErrors, [`box_${index}_${field}`]: "" });
  };

  const removeBox = (index) => {
    setPurchaseInfo({
      ...purchaseInfo,
      purchaseBoxes: purchaseInfo.purchaseBoxes.filter((_, i) => i !== index),
    });
  };

  const addWaste = () => {
    setPurchaseInfo({
      ...purchaseInfo,
      purchaseWaste: [
        ...purchaseInfo.purchaseWaste,
        { product_id: "", qtt: 0, type: "" },
      ],
    });
  };

  const updateWaste = (index, field, value) => {
    const updatedWaste = [...purchaseInfo.purchaseWaste];
    updatedWaste[index] = { ...updatedWaste[index], [field]: value };
    if (field === "product_id" && value) {
      const selectedWaste = wasteProducts.find(
        (w) => `${w.product}-${w.type}` === value
      );
      if (selectedWaste) {
        updatedWaste[index].product_id = selectedWaste.product;
        updatedWaste[index].type = selectedWaste.type;
      }
    }
    setPurchaseInfo({ ...purchaseInfo, purchaseWaste: updatedWaste });
    setFormErrors({ ...formErrors, [`waste_${index}_${field}`]: "" });
  };

  const removeWaste = (index) => {
    setPurchaseInfo({
      ...purchaseInfo,
      purchaseWaste: purchaseInfo.purchaseWaste.filter((_, i) => i !== index),
    });
  };

  // Stepper navigation
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  const cancel = () => {
    setOpen(false);
    setStep(1);
    setPurchaseInfo({
      supplier_id: "",
      date: new Date().toISOString().split("T")[0],
      purchaseProducts: [],
      purchaseBoxes: [],
      purchaseWaste: [],
    });
    setFormErrors({});
  };

  // Submit purchase
  const handleSubmit = async () => {
    try {
      await createPurchase(purchaseInfo);
      cancel();
      if (onPurchaseAdded) onPurchaseAdded();
    } catch (err) {
      console.log(error);
      
      console.error("Failed to create purchase:", err);
      const errorMessage =
        err.response?.data?.message || "Erreur lors de l'ajout de l'achat";
      setFormErrors({ submit: errorMessage });
      ShowToast.error(errorMessage);
    }
  };

  // Validate steps
  const validateStep = () => {
    const errors = {};
    if (step === 1) {
      if (!purchaseInfo.supplier_id) errors.supplier_id = "Fournisseur requis";
      if (!purchaseInfo.date) errors.date = "Date requise";
    } else if (step === 2) {
      if (products.length === 0) {
        errors.products =
          "Aucun produit disponible. Veuillez ajouter des produits d'abord.";
      } else if (purchaseInfo.purchaseProducts.length === 0) {
        errors.products = "Au moins un produit requis";
      } else {
        purchaseInfo.purchaseProducts.forEach((p, i) => {
          if (!p.product_id)
            errors[`product_${i}_product_id`] = "Produit requis";
          if (p.qtt <= 0)
            errors[`product_${i}_qtt`] = "Quantité positive requise";
          if (p.price <= 0)
            errors[`product_${i}_price`] = "Prix positif requis";
        });
      }
    } else if (step === 3) {
      if (purchaseInfo.purchaseBoxes.length === 0) {
        errors.boxes = "Au moins une caisse requise";
      } else {
        purchaseInfo.purchaseBoxes.forEach((b, i) => {
          if (!b.box) errors[`box_${i}_box`] = "Caisse requise";
          if (b.qttIn < 0)
            errors[`box_${i}_qttIn`] = "Quantité non négative requise";
          if (b.qttOut < 0)
            errors[`box_${i}_qttOut`] = "Quantité non négative requise";
        });
      }
    } else if (step === 4 && purchaseInfo.purchaseWaste.length > 0) {
      purchaseInfo.purchaseWaste.forEach((w, i) => {
        if (!w.product_id) errors[`waste_${i}_product_id`] = "Déchet requis";
        if (w.qtt <= 0) errors[`waste_${i}_qtt`] = "Quantité positive requise";
        if (!w.type) errors[`waste_${i}_type`] = "Type requis";
        const selectedWaste = wasteProducts.find(
          (waste) => waste.product === parseInt(w.product_id) && waste.type === w.type
        );
        if (selectedWaste && w.qtt > parseFloat(selectedWaste.qtt)) {
          errors[`waste_${i}_qtt`] = `Quantité dépasse le stock disponible (${selectedWaste.qtt})`;
        }
      });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Stepper UI
  const steps = ["Fournisseur", "Produits", "Caisses", "Déchets", "Révision"];

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-lg p-4 w-[660px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Ajouter un Achat</h2>
          <Button variant="ghost" onClick={cancel} disabled={loadingPurchase}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Stepper Navigation */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            {steps.map((label, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    step > index + 1
                      ? "bg-blue-600 text-white"
                      : step === index + 1
                      ? "bg-blue-800 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-1 text-center">{label}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 mt-2">
            <div
              className="h-1 bg-blue-600 transition-all"
              style={{ width: `${(step / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {formErrors.fetch && (
          <p className="text-red-500 text-sm mb-2">{formErrors.fetch}</p>
        )}
        {formErrors.fetchProducts && (
          <p className="text-red-500 text-sm mb-2">
            {formErrors.fetchProducts}
          </p>
        )}

        {/* Step 1: Supplier and Date */}
        {step === 1 && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="supplier_id" className="text-sm font-medium">
                Fournisseur
              </Label>
              <select
                id="supplier_id"
                name="supplier_id"
                value={purchaseInfo.supplier_id}
                onChange={handleChange}
                className={`w-full border rounded p-2 text-sm ${
                  formErrors.supplier_id ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loadingPurchase}
              >
                <option value="">Sélectionnez un fournisseur</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {formErrors.supplier_id && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.supplier_id}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                name="date"
                value={purchaseInfo.date}
                onChange={handleChange}
                className={`w-full text-sm ${
                  formErrors.date ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loadingPurchase}
              />
              {formErrors.date && (
                <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Products */}
        {step === 2 && (
          <div className="space-y-3">
            {formErrors.products && (
              <p className="text-red-500 text-sm">{formErrors.products}</p>
            )}
            {purchaseInfo.purchaseProducts.map((product, index) => (
              <div key={index} className="border p-3 rounded space-y-2">
                <div>
                  <Label className="text-sm font-medium">Produit</Label>
                  <select
                    value={product.product_id}
                    onChange={(e) =>
                      updateProduct(index, "product_id", e.target.value)
                    }
                    className={`w-full border rounded p-2 text-sm ${
                      formErrors[`product_${index}_product_id`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={loadingPurchase}
                  >
                    <option value="">Sélectionnez un produit</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.designation}
                      </option>
                    ))}
                  </select>
                  {formErrors[`product_${index}_product_id`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors[`product_${index}_product_id`]}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm font-medium">Qté (caisses)</Label>
                    <Input
                      type="number"
                      value={product.qtt}
                      onChange={(e) =>
                        updateProduct(
                          index,
                          "qtt",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      className={`text-sm ${
                        formErrors[`product_${index}_qtt`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={loadingPurchase}
                    />
                    {formErrors[`product_${index}_qtt`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors[`product_${index}_qtt`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Qté (unités)</Label>
                    <Input
                      type="number"
                      value={product.qttUnite}
                      onChange={(e) =>
                        updateProduct(
                          index,
                          "qttUnite",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      className="text-sm"
                      disabled={loadingPurchase}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Prix (MAD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={product.price}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    min="0"
                    className={`text-sm ${
                      formErrors[`product_${index}_price`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={loadingPurchase}
                  />
                  {formErrors[`product_${index}_price`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors[`product_${index}_price`]}
                    </p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeProduct(index)}
                  disabled={loadingPurchase}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={addProduct}
              disabled={loadingPurchase || products.length === 0}
              className="w-full flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter Produit
            </Button>
          </div>
        )}

        {/* Step 3: Boxes */}
        {step === 3 && (
          <div className="space-y-3">
            {formErrors.boxes && (
              <p className="text-red-500 text-sm">{formErrors.boxes}</p>
            )}
            {purchaseInfo.purchaseBoxes.map((box, index) => (
              <div key={index} className="border p-3 rounded space-y-2">
                <div>
                  <Label className="text-sm font-medium">Caisse</Label>
                  <select
                    value={box.box}
                    onChange={(e) => updateBox(index, "box", e.target.value)}
                    className={`w-full border rounded p-2 text-sm ${
                      formErrors[`box_${index}_box`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={loadingPurchase}
                  >
                    <option value="">Sélectionnez une caisse</option>
                    {boxes.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.designation}
                      </option>
                    ))}
                  </select>
                  {formErrors[`box_${index}_box`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors[`box_${index}_box`]}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm font-medium">Qté Entrée</Label>
                    <Input
                      type="number"
                      value={box.qttIn}
                      onChange={(e) =>
                        updateBox(index, "qttIn", parseInt(e.target.value) || 0)
                      }
                      min="0"
                      className={`text-sm ${
                        formErrors[`box_${index}_qttIn`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={loadingPurchase}
                    />
                    {formErrors[`box_${index}_qttIn`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors[`box_${index}_qttIn`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Qté Sortie</Label>
                    <Input
                      type="number"
                      value={box.qttOut}
                      onChange={(e) =>
                        updateBox(
                          index,
                          "qttOut",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      className={`text-sm ${
                        formErrors[`box_${index}_qttOut`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={loadingPurchase}
                    />
                    {formErrors[`box_${index}_qttOut`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors[`box_${index}_qttOut`]}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeBox(index)}
                  disabled={loadingPurchase}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={addBox}
              disabled={loadingPurchase}
              className="w-full flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter Caisse
            </Button>
          </div>
        )}

        {/* Step 4: Waste */}
        {step === 4 && (
          <div className="space-y-3">
            {wasteProducts.length === 0 && (
              <p className="text-gray-500 text-sm">
                Aucun déchet en stock disponible.
              </p>
            )}
            {purchaseInfo.purchaseWaste.map((waste, index) => (
              <div key={index} className="border p-3 rounded space-y-2">
                <div>
                  <Label className="text-sm font-medium">Déchet</Label>
                  <select
                    value={`${waste.product_id}-${waste.type}`}
                    onChange={(e) =>
                      updateWaste(index, "product_id", e.target.value)
                    }
                    className={`w-full border rounded p-2 text-sm ${
                      formErrors[`waste_${index}_product_id`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={loadingPurchase}
                  >
                    <option value="">Sélectionnez un déchet</option>
                    {wasteProducts.map((w) => {
                      const product = products.find(
                        (p) => p.id === parseInt(w.product)
                      );
                      return (
                        <option key={`${w.product}-${w.type}`} value={`${w.product}-${w.type}`}>
                          {product?.designation || "N/A"} ({w.type}) - Stock: {w.qtt}
                        </option>
                      );
                    })}
                  </select>
                  {formErrors[`waste_${index}_product_id`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors[`waste_${index}_product_id`]}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium">Quantité</Label>
                  <Input
                    type="number"
                    value={waste.qtt}
                    onChange={(e) =>
                      updateWaste(index, "qtt", parseInt(e.target.value) || 0)
                    }
                    min="0"
                    className={`text-sm ${
                      formErrors[`waste_${index}_qtt`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={loadingPurchase}
                  />
                  {formErrors[`waste_${index}_qtt`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors[`waste_${index}_qtt`]}
                    </p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeWaste(index)}
                  disabled={loadingPurchase}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={addWaste}
              disabled={loadingPurchase || wasteProducts.length === 0}
              className="w-full flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter Déchet
            </Button>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-3 text-sm">
            <h3 className="text-base font-semibold">Résumé de l'Achat</h3>
            <div className="grid grid-cols-2 gap-2">
              <p>
                <strong>Fournisseur:</strong>
              </p>
              <p>
                {suppliers.find(
                  (s) => s.id === parseInt(purchaseInfo.supplier_id)
                )?.name || "N/A"}
              </p>
              <p>
                <strong>Date:</strong>
              </p>
              <p>{format(new Date(purchaseInfo.date), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <h4 className="font-medium">Produits:</h4>
              {purchaseInfo.purchaseProducts.length > 0 ? (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">Désignation</th>
                      <th className="text-left p-1">Qté Caisses</th>
                      <th className="text-left p-1">Qté Unités</th>
                      <th className="text-left p-1">Unités Totales</th>
                      <th className="text-left p-1">Prix Unitaire (MAD)</th>
                      <th className="text-left p-1">Montant (MAD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseInfo.purchaseProducts.map((p, i) => {
                      const product = products.find(
                        (pr) => pr.id === parseInt(p.product_id)
                      );
                      const capacityByBox = product?.capacityByBox || 0;
                      const totalUnits = p.qtt * capacityByBox + p.qttUnite;
                      const totalAmount = totalUnits * p.price;
                      return (
                        <tr key={i} className="border-b">
                          <td className="p-1">
                            {product?.designation || "N/A"}
                          </td>
                          <td className="p-1">{p.qtt}</td>
                          <td className="p-1">{p.qttUnite}</td>
                          <td className="p-1">{totalUnits}</td>
                          <td className="p-1">{p.price}</td>
                          <td className="p-1">{totalAmount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-medium">
                      <td className="p-1">Total</td>
                      <td className="p-1">
                        {purchaseInfo.purchaseProducts.length} produits
                      </td>
                      <td className="p-1"></td>
                      <td className="p-1">
                        {purchaseInfo.purchaseProducts.reduce((sum, p) => {
                          const product = products.find(
                            (pr) => pr.id === parseInt(p.product_id)
                          );
                          const capacityByBox = product?.capacityByBox || 0;
                          return sum + (p.qtt * capacityByBox + p.qttUnite);
                        }, 0)}
                      </td>
                      <td className="p-1"></td>
                      <td className="p-1">
                        {purchaseInfo.purchaseProducts.reduce((sum, p) => {
                          const product = products.find(
                            (pr) => pr.id === parseInt(p.product_id)
                          );
                          const capacityByBox = product?.capacityByBox || 0;
                          const totalUnits = p.qtt * capacityByBox + p.qttUnite;
                          return sum + totalUnits * p.price;
                        }, 0)}{" "}
                        MAD
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p>Aucun produit</p>
              )}
            </div>
            <div>
              <h4 className="font-medium">Caisses:</h4>
              {purchaseInfo.purchaseBoxes.length > 0 ? (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">Désignation</th>
                      <th className="text-left p-1">Entrée</th>
                      <th className="text-left p-1">Sortie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseInfo.purchaseBoxes.map((b, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-1">
                          {boxes.find((bx) => bx.id === parseInt(b.box))
                            ?.designation || "N/A"}
                        </td>
                        <td className="p-1">{b.qttIn}</td>
                        <td className="p-1">{b.qttOut}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucune caisse</p>
              )}
            </div>
            <div>
              <h4 className="font-medium">Déchets:</h4>
              {purchaseInfo.purchaseWaste.length > 0 ? (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">Désignation</th>
                      <th className="text-left p-1">Qté</th>
                      <th className="text-left p-1">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseInfo.purchaseWaste.map((w, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-1">
                          {products.find((p) => p.id === parseInt(w.product_id))
                            ?.designation || "N/A"}
                        </td>
                        <td className="p-1">{w.qtt}</td>
                        <td className="p-1">{w.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucun déchet</p>
              )}
            </div>
            {formErrors.submit && (
              <p className="text-red-500 text-sm">{formErrors.submit}</p>
            )}
          </div>
        )}

        {/* Stepper Controls */}
        <div className="flex justify-between mt-4 gap-2">
          <Button
            variant="outline"
            onClick={cancel}
            disabled={loadingPurchase}
            className="flex-1"
          >
            Annuler
          </Button>
          {step > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={loadingPurchase}
              className="flex-1"
            >
              Précédent
            </Button>
          )}
          {step < 5 ? (
            <Button
              onClick={() => {
                if (validateStep()) nextStep();
              }}
              disabled={loadingPurchase}
              className="flex-1"
            >
              Suivant
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (validateStep()) handleSubmit();
              }}
              disabled={loadingPurchase}
              className="flex-1"
            >
              {loadingPurchase ? "Ajout..." : "Ajouter Achat"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPurchase;