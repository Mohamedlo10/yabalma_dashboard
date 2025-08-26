"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { 
  QrCode, 
  Search, 
  Package, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Camera,
  X,
  Plane,
  Clock
} from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

interface Commande {
  id: number;
  numero_commande: string;
  statut: string;
  created_at: string;
  detail_commande?: {
    type: string;
    description: string;
    poids: number;
  };
  client?: {
    nom: string;
    prenom: string;
    telephone: string;
  };
  id_annonce: string;
}

interface Annonce {
  id_annonce: string;
  source: string;
  destination: string;
  date_depart: string;
  date_arrive: string;
  statut: string;
  type_transport: string;
}

export default function ColisRemisPage() {
  const supabase = createClient();
  const [searchId, setSearchId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [commande, setCommande] = useState<Commande | null>(null);
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRemettingColis, setIsRemettingColis] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fonction pour rechercher une commande par ID
  const searchCommandeById = async (commandeId: string) => {
    if (!commandeId.trim()) {
      setError('Veuillez entrer un ID de commande');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setCommande(null);
    setAnnonce(null);

    try {
      console.log('🔍 Recherche commande ID:', commandeId);

      // Rechercher la commande
      const { data: commandeData, error: commandeError } = await supabase
        .from('commande')
        .select(`
          *,
          detail_commande:detail_commande(*),
          client:clients(nom, prenom, telephone)
        `)
        .eq('id', commandeId)
        .single();

      if (commandeError) {
        console.error('❌ Erreur recherche commande:', commandeError);
        setError('Commande introuvable');
        return;
      }

      console.log('✅ Commande trouvée:', commandeData);
      setCommande(commandeData);

      // Rechercher l'annonce associée
      const { data: annonceData, error: annonceError } = await supabase
        .from('annonce')
        .select('*')
        .eq('id_annonce', commandeData.id_annonce)
        .single();

      if (annonceError) {
        console.error('❌ Erreur recherche annonce:', annonceError);
        setError('Annonce associée introuvable');
        return;
      }

      console.log('✅ Annonce trouvée:', annonceData);
      setAnnonce(annonceData);

    } catch (error) {
      console.error('❌ Erreur générale:', error);
      setError('Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour remettre le colis
  const handleRemetteColis = async () => {
    if (!commande) return;

    setIsRemettingColis(true);
    setError('');

    try {
      console.log('📦 Remise colis ID:', commande.id);

      // Mettre à jour le statut de la commande à "Remis"
      const { error: updateError } = await supabase
        .from('commande')
        .update({
          statut: 'Remis',
          remis_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commande.id);

      if (updateError) {
        console.error('❌ Erreur mise à jour:', updateError);
        setError('Erreur lors de la remise du colis');
        return;
      }

      console.log('✅ Colis remis avec succès');
      setSuccess('Colis remis avec succès !');
      
      // Mettre à jour l'état local
      setCommande(prev => prev ? { ...prev, statut: 'Remis' } : null);

      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setCommande(null);
        setAnnonce(null);
        setSearchId('');
        setSuccess('');
      }, 3000);

    } catch (error) {
      console.error('❌ Erreur remise colis:', error);
      setError('Erreur lors de la remise du colis');
    } finally {
      setIsRemettingColis(false);
    }
  };

  // Fonction pour démarrer le scanner QR (simulation)
  const startQRScanner = async () => {
    setShowScanner(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('❌ Erreur caméra:', error);
      setError('Impossible d\'accéder à la caméra');
      setShowScanner(false);
    }
  };

  // Fonction pour arrêter le scanner
  const stopQRScanner = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowScanner(false);
  };

  // Fonction pour simuler la lecture QR
  const simulateQRScan = (commandeId: string) => {
    setSearchId(commandeId);
    stopQRScanner();
    searchCommandeById(commandeId);
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Entrepot':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Expédié':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Arrivé':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Remis':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const canRemetteColis = commande?.statut === 'Arrivé';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Colis Remis
          </h1>
          <p className="text-gray-600">
            Scannez le QR code ou recherchez par ID de commande
          </p>
        </div>

        {/* Actions principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Scanner QR */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Scanner QR Code</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Utilisez la caméra pour scanner le QR code du client
                </p>
                <Button onClick={startQRScanner} className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Ouvrir Scanner
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recherche par ID */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Recherche par ID</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Entrez directement l'ID de la commande
                </p>
                <div className="flex gap-2 w-full">
                  <Input
                    placeholder="ID Commande"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        searchCommandeById(searchId);
                      }
                    }}
                  />
                  <Button
                    onClick={() => searchCommandeById(searchId)}
                    disabled={isLoading}
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Scanner QR Code</h3>
                <Button variant="outline" size="sm" onClick={stopQRScanner}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-gray-200 rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Simulation de scan pour test */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">Test avec IDs de commande :</p>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map(id => (
                      <Button
                        key={id}
                        variant="outline"
                        size="sm"
                        onClick={() => simulateQRScan(id.toString())}
                      >
                        ID {id}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Résultats de la recherche */}
        {commande && annonce && (
          <div className="space-y-4">
            {/* Informations de la commande */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Commande #{commande.id}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Statut</label>
                    <div className="mt-1">
                      <Badge variant="outline" className={getStatusColor(commande.statut)}>
                        {commande.statut}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date création</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(commande.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                {commande.detail_commande && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Détails</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm"><strong>Type:</strong> {commande.detail_commande.type}</p>
                      <p className="text-sm"><strong>Description:</strong> {commande.detail_commande.description}</p>
                      <p className="text-sm"><strong>Poids:</strong> {commande.detail_commande.poids} kg</p>
                    </div>
                  </div>
                )}

                {commande.client && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Client</label>
                    <div className="mt-1 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {commande.client.prenom} {commande.client.nom}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{commande.client.telephone}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations du trajet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  Trajet Associé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Itinéraire</label>
                    <div className="mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {annonce.source} → {annonce.destination}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type transport</label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {annonce.type_transport}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date départ</label>
                    <div className="mt-1 text-sm">{annonce.date_depart}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date arrivée</label>
                    <div className="mt-1 text-sm">{annonce.date_arrive}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action de remise */}
            <Card>
              <CardContent className="p-6">
                {canRemetteColis ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Prêt pour remise</h3>
                    <p className="text-gray-600 mb-4">
                      Ce colis est arrivé à destination et peut être remis au client
                    </p>
                    <Button
                      size="lg"
                      onClick={handleRemetteColis}
                      disabled={isRemettingColis}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isRemettingColis ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Remise en cours...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Remettre le Colis
                        </>
                      )}
                    </Button>
                  </div>
                ) : commande.statut === 'Remis' ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Colis déjà remis</h3>
                    <p className="text-gray-600">
                      Ce colis a déjà été remis au client
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Colis non disponible</h3>
                    <p className="text-gray-600">
                      Ce colis n'est pas encore arrivé à destination. 
                      Statut actuel: <Badge variant="outline" className={getStatusColor(commande.statut)}>
                        {commande.statut}
                      </Badge>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* État de chargement */}
        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Recherche en cours...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
