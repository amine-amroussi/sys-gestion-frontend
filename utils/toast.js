"use client";
import { toast } from "react-hot-toast";

export const ShowToast = {
  // Success toast for adding an entity
  success : (message) => toast.success(message),
  successAdd: (type = "Crate") => {
    toast.success(`${type} ajouté avec succès !`);
  },
  // Success toast for updating an entity
  successUpdate: (type = "Crate") => {
    toast.success(`${type} modifié avec succès !`);
  },
  // Success toast for deleting an entity
  successDelete: (type = "Crate") => {
    toast.success(`${type} supprimé avec succès !`);
  },
  // Error toast for generic errors
  error: (message = "Une erreur est survenue.") => {
    toast.error(message);
  },
  // Error toast for specific validation errors
  errorValidation: (field, customMessage) => {
    toast.error(customMessage || `Veuillez vérifier le champ ${field}.`);
  },
  // Loading toast
  loading: (message = "Chargement en cours...") => {
    return toast.loading(message);
  },
  // Dismiss a toast (for loading)
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
};