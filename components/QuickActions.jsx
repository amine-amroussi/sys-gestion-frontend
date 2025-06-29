import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const QuickActions = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
      <div className="flex flex-wrap gap-4">
        <Link href="/purchases/new">
          <Button className="flex items-center gap-2">
            <Plus className="size-4" />
            Nouvel Achat
          </Button>
        </Link>
        <Link href="/trips/new">
          <Button className="flex items-center gap-2">
            <Plus className="size-4" />
            Démarrer Tournée
          </Button>
        </Link>
        <Link href="/employees/new">
          <Button className="flex items-center gap-2">
            <Plus className="size-4" />
            Ajouter Employé
          </Button>
        </Link>
        <Link href="/suppliers/new">
          <Button className="flex items-center gap-2">
            <Plus className="size-4" />
            Ajouter Fournisseur
          </Button>
        </Link>
        <Link href="/boxes/new">
          <Button className="flex items-center gap-2">
            <Plus className="size-4" />
            Ajouter Caisse
          </Button>
        </Link>
        <Link href="/trucks/new">
          <Button className="flex items-center gap-2">
            <Plus className="size-4" />
            Ajouter Camion
          </Button>
        </Link>
        <Link href="/products/new">
          <Button className="flex items-center gap-2">
            <Plus className="size-4" />
            Ajouter Produit
          </Button>
        </Link>
        <Link href="/wastes/new">
          <Button className="flex items-center gap-2">
            <Plus className="size-4" />
            Ajouter Déchet
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;