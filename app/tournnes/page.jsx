"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import StartTripForm from "@/components/StartTripForm";
import TourneeActive from "@/components/TourneeActive";
import TourneeHistory from "@/components/TourneeHistory";
import ListeDesTournees from "@/components/ListeDesTournees";
import { useTrip } from "@/store/tripStore";

export default function Home() {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const { startTrip } = useTrip();

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Gestion des Tournées</h1>
      <Button onClick={() => setIsStartOpen(true)} className="mb-4">
        Démarrer une Nouvelle Tournée
      </Button>
      <StartTripForm
        open={isStartOpen}
        onOpenChange={setIsStartOpen}
        onTripStarted={startTrip}
      />
      <div className="mb-6">
        <TourneeActive />
      </div>
      {/* <div className="mb-6">
        <TourneeHistory />
      </div> */}
      <div className="mb-6">
        <ListeDesTournees />
      </div>
    </div>
  );
}