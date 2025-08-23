import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { createDiscussion } from "@/app/api/messages/query";

interface NewDiscussionDialogProps {
  currentUserId: string;
  currentUserName: string;
  onDiscussionCreated: () => void;
}

export default function NewDiscussionDialog({
  currentUserId,
  currentUserName,
  onDiscussionCreated,
}: NewDiscussionDialogProps) {
  const [open, setOpen] = useState(false);
  const [otherPersonId, setOtherPersonId] = useState("");
  const [otherPersonName, setOtherPersonName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateDiscussion = async () => {
    if (!otherPersonId.trim() || !otherPersonName.trim()) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);

      await createDiscussion(
        currentUserId, // Pour simplifier, on suppose que l'utilisateur actuel est le client
        otherPersonId,
        currentUserName,
        otherPersonName
      );

      onDiscussionCreated();
      setOpen(false);
      setOtherPersonId("");
      setOtherPersonName("");
    } catch (error) {
      console.error("Erreur lors de la création de la discussion:", error);
      alert("Erreur lors de la création de la discussion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/*  <Button variant="outline" size="sm" className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle discussion
        </Button> */}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle discussion</DialogTitle>
          <DialogDescription>
            Démarrez une conversation avec un autre utilisateur.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="otherId" className="text-right">
              ID utilisateur
            </Label>
            <Input
              id="otherId"
              value={otherPersonId}
              onChange={(e) => setOtherPersonId(e.target.value)}
              className="col-span-3"
              placeholder="ID de l'utilisateur"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="otherName" className="text-right">
              Nom
            </Label>
            <Input
              id="otherName"
              value={otherPersonName}
              onChange={(e) => setOtherPersonName(e.target.value)}
              className="col-span-3"
              placeholder="Nom de l'utilisateur"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleCreateDiscussion}
            disabled={loading}
          >
            {loading ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
