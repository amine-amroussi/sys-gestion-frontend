"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { X } from "lucide-react";
import { axiosInstance } from "@/utils/axiosInstance";
import { toast } from "sonner";
import PrintInvoice from "./PrintInvoice.jsx";
import { set } from "date-fns";

const steps = [
  "Vehicle and Personnel",
  "Date and Zone",
  "Products",
  "Boxes",
  "Révision",
];

const StartTripForm = ({ open, onOpenChange, onTripStarted }) => {
  const [formData, setFormData] = useState({
    truck_matricule: "",
    driver_id: "",
    seller_id: "",
    assistant_id: "",
    date: new Date().toISOString().split("T")[0],
    zone: "",
    tripProducts: [], // Combined: remaining + new
    tripBoxes: [], // Combined: remaining + new
    remainingProducts: [], // Tracks remaining products from truck
    remainingBoxes: [], // Tracks remaining boxes from truck
  });
  const [trucks, setTrucks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [newProduct, setNewProduct] = useState({
    product_id: "",
    qttOut: 0,
    qttOutUnite: 0,
  });
  const [newBox, setNewBox] = useState({ box_id: "", qttOut: 0 });
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const printInvoiceRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trucksRes, employeesRes, productsRes, boxesRes] =
          await Promise.all([
            axiosInstance.get("/truck"),
            axiosInstance.get("/trip/employees/all"),
            axiosInstance.get("/trip/products/all"),
            axiosInstance.get("/box"),
          ]);
        setTrucks(trucksRes.data.trucks || []);
        setEmployees(employeesRes.data.employees || []);
        setProducts(productsRes.data.products || []);
        setBoxes(boxesRes.data.data.boxes || []);
      } catch (error) {
        setFormErrors({
          fetch:
            "Erreur lors de la récupération des données pour le formulaire.",
        });
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchRemainingItems = async () => {
      if (formData.truck_matricule) {
        try {
          const response = await axiosInstance.get(
            `/trip/last/${formData.truck_matricule}`
          );
          const tripProducts = response.data.tripProducts || [];
          const tripBoxes = response.data.tripBoxes || [];

          // This is the main remaining Product Array
          const remainingProducts = tripProducts
            .filter((tp) => tp.qttReutour > 0 || tp.qttReutourUnite > 0)
            .map((tp) => ({
              product_id: tp.product.toString(),
              qttOut: tp.qttReutour || 0,
              qttOutUnite: tp.qttReutourUnite || 0,
              newQttOut: 0,
              newQttOutUnite: 0,
              isRemaining: true,
            }));

          const remainingBoxes = tripBoxes
            .filter((tb) => tb.qttIn > 0)
            .map((tb) => ({
              box_id: tb.box.toString(),
              qttOut: tb.qttOut - tb.qttIn || 0,
              newQttOut: 0,
              isRemaining: true,
            }));

          setFormData((prev) => ({
            ...prev,
            remainingProducts,
            remainingBoxes,
            tripProducts: [...remainingProducts],
            tripBoxes: [...remainingBoxes],
          }));
        } catch (error) {
          console.error("fetchRemainingItems error:", error);
          if (error.response?.status === 404) {
            setFormData((prev) => ({
              ...prev,
              remainingProducts: [],
              remainingBoxes: [],
              tripProducts: [],
              tripBoxes: [],
            }));
          } else {
            toast.error(
              "Erreur lors de la récupération des produits et boîtes restants dans le camion."
            );
          }
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          remainingProducts: [],
          remainingBoxes: [],
          tripProducts: [],
          tripBoxes: [],
        }));
      }
    };
    fetchRemainingItems();
    console.log("Refreshed");
  }, [formData.truck_matricule]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value === "none" ? "" : value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleNewProductChange = (field, value) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: field === "product_id" ? value : parseInt(value) || 0,
    }));
  };

  const addProduct = () => {
    if (!newProduct.product_id) {
      setFormErrors({ ...formErrors, new_product_id: "Produit requis" });
      return;
    }
    if (newProduct.qttOut <= 0 && newProduct.qttOutUnite <= 0) {
      setFormErrors({
        ...formErrors,
        new_product_qty: "Au moins une quantité positive requise",
      });
      return;
    }

    const existingProduct = formData.tripProducts.find(
      (p) => p.product_id === newProduct.product_id
    );
    if (existingProduct) {
      const updatedProducts = formData.tripProducts.map((p) =>
        p.product_id === newProduct.product_id
          ? {
              ...p,
              qttOut: p.qttOut,
              qttOutUnite: p.qttOutUnite,
              newQttOutUnite: newProduct.qttOutUnite,
              newQttOut: newProduct.qttOut,
              isRemaining: p.isRemaining || false,
            }
          : p
      );
      setFormData((prev) => ({ ...prev, tripProducts: updatedProducts }));
    } else {
      setFormData((prev) => ({
        ...prev,
        tripProducts: [
          ...prev.tripProducts,
          {
            product_id: newProduct.product_id,
            qttOut: 0,
            qttOutUnite: 0,
            newQttOut: newProduct.qttOut,
            newQttOutUnite: newProduct.qttOutUnite,
            isRemaining: false,
          },
        ],
      }));
    }
    setNewProduct({ product_id: "", qttOut: 0, qttOutUnite: 0 });
    setFormErrors({ ...formErrors, new_product_id: "", new_product_qty: "" });
  };

  const removeProduct = (productId) => {
    setFormData((prev) => ({
      ...prev,
      tripProducts: prev.tripProducts.filter((p) => p.product_id !== productId),
    }));
  };

  const handleNewBoxChange = (field, value) => {
    setNewBox((prev) => ({
      ...prev,
      [field]: field === "box_id" ? value : parseInt(value) || 0,
    }));
  };

  const addBox = () => {
    if (!newBox.box_id) {
      setFormErrors({ ...formErrors, new_box_id: "Boîte requise" });
      return;
    }
    if (newBox.qttOut <= 0) {
      setFormErrors({
        ...formErrors,
        new_box_qty: "Quantité positive requise",
      });
      return;
    }

    const existingBox = formData.tripBoxes.find(
      (b) => b.box_id === newBox.box_id
    );
    if (existingBox) {
      const updatedBoxes = formData.tripBoxes.map((b) =>
        b.box_id === newBox.box_id
          ? {
              ...b,
              // qttOut: b.qttOut + newBox.qttOut,
              qttOut: b.qttOut || 0,
              newQttOut: newBox.qttOut || 0,
              isRemaining: b.isRemaining || false,
            }
          : b
      );

      setFormData((prev) => ({ ...prev, tripBoxes: updatedBoxes }));
    } else {
      setFormData((prev) => ({
        ...prev,
        tripBoxes: [
          ...prev.tripBoxes,
          {
            box_id: newBox.box_id,
            qttOut: 0,
            newQttOut: newBox.qttOut,
            isRemaining: false,
          },
        ],
      }));
    }
    setNewBox({ box_id: "", qttOut: 0 });
    setFormErrors({ ...formErrors, new_box_id: "", new_box_qty: "" });
  };

  const removeBox = (boxId) => {
    const findBox = formData.tripBoxes.find((b) => b.box_id === boxId);
    const updatedFindBox = { ...findBox, isRemaining: true, newQttOut: 0 };
    if (updatedFindBox.isRemaining === true) {
      setFormData((prev) => ({
        ...prev,
        tripBoxes: prev.tripBoxes.map((b) =>
          b.box_id === boxId ? updatedFindBox : b
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        tripBoxes: prev.tripBoxes.filter((b) => b.box_id !== boxId),
      }));
    }
  };

  const cancel = () => {
    onOpenChange(false);
    setActiveStep(1);
    setFormData({
      truck_matricule: "",
      driver_id: "",
      seller_id: "",
      assistant_id: "",
      date: new Date().toISOString().split("T")[0],
      zone: "",
      tripProducts: [],
      tripBoxes: [],
      remainingProducts: [],
      remainingBoxes: [],
    });
    setNewProduct({ product_id: "", qttOut: 0, qttOutUnite: 0 });
    setNewBox({ box_id: "", qttOut: 0 });
    setFormErrors({});
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Calculate new quantities (subtract remaining quantities from total)
      const newTripProducts = formData.tripProducts
        .map((p) => {
          const remaining = formData.remainingProducts.find(
            (rp) => rp.product_id === p.product_id
          ) || { qttOut: 0, qttOutUnite: 0 };
          return {
            product_id: parseInt(p.product_id),
            qttOut: p.qttOut - remaining.qttOut,
            qttOutUnite: p.qttOutUnite - remaining.qttOutUnite,
          };
        })
        .filter((p) => p.qttOut >= 0 || p.qttOutUnite >= 0);

      const newTripBoxes = formData.tripBoxes
        .map((b) => {
          const remaining = formData.remainingBoxes.find(
            (rb) => rb.box_id === b.box_id
          ) || { qttOut: 0 };
          return {
            box_id: parseInt(b.box_id),
            qttOut: b.qttOut - remaining.qttOut,
          };
        })
        .filter((b) => b.qttOut > 0);

      const submitData = {
        ...formData,
        assistant_id: formData.assistant_id || null,
        tripProducts: formData.tripProducts,
        tripBoxes: formData.tripBoxes,
      };

      console.log(submitData);

      await onTripStarted(submitData);
      toast.success("Tournée démarrée avec succès !");
      cancel();
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors du démarrage de la tournée.";
      setFormErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    const errors = {};
    if (activeStep === 1) {
      if (!formData.truck_matricule) errors.truck_matricule = "Camion requis";
      if (!formData.driver_id) errors.driver_id = "Conducteur requis";
      if (!formData.seller_id) errors.seller_id = "Vendeur requis";
    } else if (activeStep === 2) {
      if (!formData.date) errors.date = "Date requise";
      if (!formData.zone) errors.zone = "Zone requise";
    } else if (activeStep === 3) {
      if (
        !formData.tripProducts.some((p) => p.qttOut >= 0 || p.qttOutUnite >= 0)
      ) {
        errors.products = "Au moins un produit avec quantité requise";
      }
    } else if (activeStep === 4) {
      if (!formData.tripBoxes.some((b) => b.qttOut > 0 || b.newQttOut > 0)) {
        errors.boxes = "Au moins une boîte avec quantité requise";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setActiveStep(activeStep + 1);
  };

  const prevStep = () => setActiveStep(activeStep - 1);

  const drivers = employees.filter((emp) => emp.role === "Driver");
  const sellers = employees.filter((emp) => emp.role === "Seller");
  const assistants = employees.filter((emp) => emp.role === "Assistent");

  const calculateTotalAmount = () => {
    let total = 0;
    formData.tripProducts.forEach((product) => {
      const productData = products.find(
        (p) => p.id === parseInt(product.product_id)
      );
      if (productData && productData.priceUnite) {
        const capacityByBox = productData.capacityByBox || 0;
        const totalUnits =
          product.qttOut * capacityByBox +
          (product.qttOutUnite || 0) +
          (product.newQttOut || 0) * capacityByBox +
          (product.newQttOutUnite || 0);
        total += totalUnits * productData.priceUnite;
      }
    });
    return total.toFixed(2);
  };

  const preTripData = {
    id: "PRE-" + Date.now(),
    truck_matricule: formData.truck_matricule,
    driver_id: formData.driver_id,
    seller_id: formData.seller_id,
    assistant_id: formData.assistant_id,
    date: formData.date,
    zone: formData.zone,
    TripProducts: formData.tripProducts.map((p) => ({
      product_id: p.product_id,
      qttOut: p.qttOut || 0,
      qttOutUnite: p.qttOutUnite || 0,
      newQttOut: p.newQttOut || 0,
      newQttOutUnite: p.newQttOutUnite || 0,
      ProductAssociation: products.find(
        (prod) => prod.id === parseInt(p.product_id)
      ),
    })),
    TripBoxes: formData.tripBoxes.map((b) => ({
      box_id: b.box_id,
      qttOut: b.qttOut || 0,
      newQttOut: b.newQttOut || 0,
      BoxAssociation: boxes.find((box) => box.id === parseInt(b.box_id)),
    })),
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-lg p-4 w-full max-w-[850px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Démarrer une Nouvelle Tournée</h2>
          <Button variant="ghost" onClick={cancel} disabled={loading}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            {steps.map((label, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    activeStep > index + 1
                      ? "bg-blue-600 text-white"
                      : activeStep === index + 1
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
              style={{ width: `${(activeStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {formErrors.fetch && (
          <p className="text-red-500 text-sm mb-2">{formErrors.fetch}</p>
        )}
        {formErrors.submit && (
          <p className="text-red-500 text-sm mb-2">{formErrors.submit}</p>
        )}

        {activeStep === 1 && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="truck_matricule" className="text-sm font-medium">
                Camion
              </Label>
              <select
                id="truck_matricule"
                name="truck_matricule"
                value={formData.truck_matricule}
                onChange={handleChange}
                className={`w-full border rounded p-2 text-sm ${
                  formErrors.truck_matricule
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">Sélectionnez un camion</option>
                {trucks.map((truck) => (
                  <option key={truck.matricule} value={truck.matricule}>
                    {truck.matricule}
                  </option>
                ))}
              </select>
              {formErrors.truck_matricule && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.truck_matricule}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="driver_id" className="text-sm font-medium">
                Conducteur
              </Label>
              <select
                id="driver_id"
                name="driver_id"
                value={formData.driver_id}
                onChange={(e) =>
                  handleSelectChange("driver_id", e.target.value)
                }
                className={`w-full border rounded p-2 text-sm ${
                  formErrors.driver_id ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">Sélectionnez un conducteur</option>
                {drivers.map((employee) => (
                  <option key={employee.cin} value={employee.cin}>
                    {employee.name}
                  </option>
                ))}
              </select>
              {formErrors.driver_id && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.driver_id}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="seller_id" className="text-sm font-medium">
                Vendeur
              </Label>
              <select
                id="seller_id"
                name="seller_id"
                value={formData.seller_id}
                onChange={(e) =>
                  handleSelectChange("seller_id", e.target.value)
                }
                className={`w-full border rounded p-2 text-sm ${
                  formErrors.seller_id ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">Sélectionnez un vendeur</option>
                {sellers.map((employee) => (
                  <option key={employee.cin} value={employee.cin}>
                    {employee.name}
                  </option>
                ))}
              </select>
              {formErrors.seller_id && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.seller_id}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="assistant_id" className="text-sm font-medium">
                Assistant
              </Label>
              <select
                id="assistant_id"
                name="assistant_id"
                value={formData.assistant_id || "none"}
                onChange={(e) =>
                  handleSelectChange("assistant_id", e.target.value)
                }
                className="w-full border rounded p-2 text-sm border-gray-300"
                disabled={loading}
              >
                <option value="none">Aucun</option>
                {assistants.map((employee) => (
                  <option key={employee.cin} value={employee.cin}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full text-sm ${
                  formErrors.date ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {formErrors.date && (
                <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
              )}
            </div>
            <div>
              <Label htmlFor="zone" className="text-sm font-medium">
                Zone
              </Label>
              <Input
                id="zone"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                className={`w-full text-sm ${
                  formErrors.zone ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {formErrors.zone && (
                <p className="text-red-500 text-xs mt-1">{formErrors.zone}</p>
              )}
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Produits</h3>
            {formErrors.products && (
              <p className="text-red-500 text-sm">{formErrors.products}</p>
            )}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">Désignation</th>
                  <th className="text-left p-1">Qté Caisses|RST</th>
                  <th className="text-left p-1">Qté Unités|RST</th>
                  <th className="text-left p-1">Qté Caisses|NV</th>
                  <th className="text-left p-1">Qté Unités|NV</th>
                  {/* <th className="text-left p-1">Source</th> */}
                  <th className="text-left p-1"></th>
                </tr>
              </thead>
              <tbody>
                {formData.tripProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-1 text-center text-gray-500">
                      Aucun produit ajouté
                    </td>
                  </tr>
                ) : (
                  formData.tripProducts.map((product, index) => (
                    <tr key={index} className="border-b">
                      {console.log(product)}
                      <td className="p-1">
                        {products.find(
                          (p) => p.id === parseInt(product.product_id)
                        )?.designation || "N/A"}
                      </td>
                      <td className="p-1">{product.qttOut}</td>
                      <td className="p-1">{product.qttOutUnite}</td>
                      <td className="p-1">{product.newQttOut}</td>
                      <td className="p-1">{product.newQttOutUnite}</td>
                      {/* <td className="p-1">
                        {product.isRemaining ? "Restant" : "Nouveau"}
                      </td> */}
                      <td className="p-1 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(product.product_id)}
                          disabled={loading || product.isRemaining}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex items-end gap-2 mt-2">
              <div className="flex-1">
                <Label className="text-sm font-medium">Produit</Label>
                <select
                  value={newProduct.product_id}
                  onChange={(e) =>
                    handleNewProductChange("product_id", e.target.value)
                  }
                  className={`w-full border rounded p-2 text-sm ${
                    formErrors.new_product_id
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  disabled={loading}
                >
                  <option value="">Sélectionnez un produit</option>
                  {console.log(products)}
                  {products.map((p) => {
                    if (p.stock > 0 || p.uniteInStock > 0) {
                      return (
                        <option key={p.id} value={p.id}>
                          {p.designation} || (Stock: {p.stock}) | (Unite : {p.uniteInStock})
                        </option>
                      );
                    }
                  })}
                </select>
                {formErrors.new_product_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.new_product_id}
                  </p>
                )}
              </div>
              <div className="w-20">
                <Label className="text-sm font-medium">Caisses</Label>
                <Input
                  type="number"
                  value={newProduct.qttOut}
                  onChange={(e) =>
                    handleNewProductChange("qttOut", e.target.value)
                  }
                  min="0"
                  className="text-sm"
                  disabled={loading}
                />
              </div>
              <div className="w-20">
                <Label className="text-sm font-medium">Unités</Label>
                <Input
                  type="number"
                  value={newProduct.qttOutUnite}
                  onChange={(e) =>
                    handleNewProductChange("qttOutUnite", e.target.value)
                  }
                  min="0"
                  className="text-sm"
                  disabled={loading}
                />
              </div>
              <Button onClick={addProduct} disabled={loading} className="h-10">
                Ajouter
              </Button>
            </div>
            {formErrors.new_product_qty && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.new_product_qty}
              </p>
            )}
          </div>
        )}

        {activeStep === 4 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Boîtes</h3>
            {formErrors.boxes && (
              <p className="text-red-500 text-sm">{formErrors.boxes}</p>
            )}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">Désignation</th>
                  <th className="text-left p-1">Qté Restant</th>
                  <th className="text-left p-1">Nouveux Qté</th>
                  <th className="text-left p-1"></th>
                </tr>
              </thead>
              <tbody>
                {formData.tripBoxes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-1 text-center text-gray-500">
                      Aucune boîte ajoutée
                    </td>
                  </tr>
                ) : (
                  formData.tripBoxes.map((box, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-1">
                        {boxes.find((b) => b.id === parseInt(box.box_id))
                          ?.designation || "N/A"}
                      </td>
                      <td className="p-1">{box.qttOut} </td>
                      <td className="p-1">{box.newQttOut} </td>
                      {/* <td className="p-1">
                        {box.isRemaining ? "Restant" : "Nouveau"}
                      </td> */}
                      <td className="p-1 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBox(box.box_id)}
                          // disabled={loading || box.isRemaining}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex items-end gap-2 mt-2">
              <div className="flex-1">
                <Label className="text-sm font-medium">Boîte</Label>
                <select
                  value={newBox.box_id}
                  onChange={(e) => handleNewBoxChange("box_id", e.target.value)}
                  className={`w-full border rounded p-2 text-sm ${
                    formErrors.new_box_id ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={loading}
                >
                  <option value="">Sélectionnez une boîte</option>
                  {console.log(boxes)
                  }
                  {boxes.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.designation} || (Stock : {b.inStock})
                    </option>
                  ))}
                </select>
                {formErrors.new_box_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.new_box_id}
                  </p>
                )}
              </div>
              <div className="w-20">
                <Label className="text-sm font-medium">Qté</Label>
                <Input
                  type="number"
                  value={newBox.qttOut}
                  onChange={(e) => handleNewBoxChange("qttOut", e.target.value)}
                  min="0"
                  className="text-sm"
                  disabled={loading}
                />
              </div>
              <Button onClick={addBox} disabled={loading} className="h-10">
                Ajouter
              </Button>
            </div>
            {formErrors.new_box_qty && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.new_box_qty}
              </p>
            )}
          </div>
        )}

        {activeStep === 5 && (
          <div className="space-y-3 text-sm">
            <h3 className="text-base font-semibold">Révision de la Tournée</h3>
            <div className="grid grid-cols-2 gap-2">
              <p>
                <strong>Camion:</strong>
              </p>
              <p>{formData.truck_matricule || "N/A"}</p>
              <p>
                <strong>Conducteur:</strong>
              </p>
              <p>
                {employees.find((emp) => emp.cin === formData.driver_id)
                  ?.name || "N/A"}
              </p>
              <p>
                <strong>Vendeur:</strong>
              </p>
              <p>
                {employees.find((emp) => emp.cin === formData.seller_id)
                  ?.name || "N/A"}
              </p>
              <p>
                <strong>Assistant:</strong>
              </p>
              <p>
                {employees.find((emp) => emp.cin === formData.assistant_id)
                  ?.name || "N/A"}
              </p>
              <p>
                <strong>Date:</strong>
              </p>
              <p>{new Date(formData.date).toLocaleDateString()}</p>
              <p>
                <strong>Zone:</strong>
              </p>
              <p>{formData.zone}</p>
            </div>

            {formData.tripProducts.length > 0 && (
              <div className="mt-2">
                <h4 className="text-md font-medium">Produits:</h4>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">Désignation</th>
                      <th className="text-left p-1">Qté Caisses|RST</th>
                      <th className="text-left p-1">Qté Unités|RST</th>
                      <th className="text-left p-1">Qté Caisses|NV</th>
                      <th className="text-left p-1">Qté Unités|NV</th>
                      {/* <th className="text-left p-1">Source</th> */}
                      <th className="text-left p-1">Prix Unitaire</th>
                      <th className="text-left p-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.tripProducts.map((product, index) => {
                      const productData = products.find(
                        (p) => p.id === parseInt(product.product_id)
                      );
                      if (productData && productData.priceUnite) {
                        const capacityByBox = productData.capacityByBox || 0;
                        const totalUnits =
                          product.qttOut * capacityByBox +
                          (product.qttOutUnite || 0) +
                          (product.newQttOut || 0) * capacityByBox +
                          (product.newQttOutUnite || 0);
                        const itemTotal = totalUnits * productData.priceUnite;
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-1">
                              {productData.designation || "N/A"}
                            </td>
                            <td className="p-1">{product.qttOut}</td>
                            <td className="p-1">{product.qttOutUnite || 0}</td>
                            <td className="p-1">{product.newQttOut || 0}</td>
                            <td className="p-1">
                              {product.newQttOutUnite || 0}
                            </td>
                            {/* <td className="p-1">
                              {product.isRemaining ? "Restant" : "Nouveau"}
                            </td> */}
                            <td className="p-1">
                              {productData.priceUnite} MAD
                            </td>
                            <td className="p-1">{itemTotal.toFixed(2)} MAD</td>
                          </tr>
                        );
                      }
                      return null;
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {formData.tripBoxes.length > 0 && (
              <div className="mt-2">
                <h4 className="text-md font-medium">Boîtes:</h4>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">Désignation</th>
                      <th className="text-left p-1">Qté Sortie</th>
                      <th className="text-left p-1">Nouveau Qté</th>
                      <th className="text-left p-1">Quantite Total</th>
                      <th className="text-left p-1">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.tripBoxes.map((box, index) => {
                      const boxData = boxes.find(
                        (b) => b.id === parseInt(box.box_id)
                      );
                      return (
                        <tr key={index} className="border-b">
                          <td className="p-1">
                            {boxData?.designation || "N/A"}
                          </td>
                          <td className="p-1">{box.qttOut}</td>
                          <td className="p-1">{box.newQttOut}</td>
                          <td className="p-1">{box.newQttOut + box.qttOut}</td>
                          <td className="p-1">
                            {box.isRemaining ? "Restant" : "Nouveau"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-2">
              <p className="text-md font-medium">
                Montant Total:{" "}
                <span className="font-bold">{calculateTotalAmount()} MAD</span>
              </p>
            </div>
            <div className="mt-4">
              <Button
                onClick={() => printInvoiceRef.current?.handlePrint()}
                disabled={loading}
                className="w-full mb-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Imprimer Facture
              </Button>
              <PrintInvoice
                ref={printInvoiceRef}
                formData={formData}
                tripDetails={preTripData}
                products={products}
                boxes={boxes}
                employees={employees}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-4 gap-2">
          <Button
            variant="outline"
            onClick={cancel}
            disabled={loading}
            className="flex-1"
          >
            Annuler
          </Button>
          {activeStep > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={loading}
              className="flex-1"
            >
              Précédent
            </Button>
          )}
          {activeStep < steps.length ? (
            <Button onClick={nextStep} disabled={loading} className="flex-1">
              Suivant
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-700 hover:bg-green-800 text-white"
            >
              {loading ? "Démarrage..." : "Confirmer"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartTripForm;
