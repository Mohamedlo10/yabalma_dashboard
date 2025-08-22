"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Upload, RefreshCw, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getPayments, updatePaymentStatus, getFinancialStats, uploadProofFile } from "@/app/api/finance/query";

const statusVariant: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const operationLabels: Record<string, string> = {
  payment: "Paiement",
  remboursement: "Remboursement",
  validation: "Validation",
};

export default function FinancePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(0, 2)),
    to: new Date(),
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Record<number, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 10;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data, count } = await getPayments({
        startDate: date?.from?.toISOString().split('T')[0],
        endDate: date?.to?.toISOString().split('T')[0],
        status: statusFilter !== 'all' ? statusFilter : undefined,
        operation: operationFilter !== 'all' ? operationFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        page,
        pageSize,
      });

      const statsData = await getFinancialStats({
        startDate: date?.from?.toISOString().split('T')[0],
        endDate: date?.to?.toISOString().split('T')[0],
      });

      setPayments(data || []);
      setStats(statsData);
      setTotalPages(Math.ceil((count || 1) / pageSize));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date, statusFilter, operationFilter, typeFilter, page]);

  const handleStatusChange = async (paymentId: number, newStatus: string) => {
    try {
      setIsUpdating(prev => ({ ...prev, [paymentId]: true }));
      
      if (newStatus === 'completed') {
        setSelectedPayment(paymentId);
        return;
      }

      await updatePaymentStatus(paymentId, newStatus);
      toast.success("Statut mis à jour avec succès");
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsUpdating(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || selectedPayment === null) return;

    try {
      const proofUrl = await uploadProofFile(selectedFile);
      await updatePaymentStatus(selectedPayment, 'completed', proofUrl);
      toast.success("Preuve téléversée et statut mis à jour");
      setSelectedPayment(null);
      setSelectedFile(null);
      fetchData();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erreur lors du téléversement du fichier");
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filtrer les transactions en fonction des critères de recherche et des filtres
  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    const orderIdStr = payment.order_id?.toString() || '';
    const matchesSearch = !searchTerm || 
      payment.transaction_id?.toLowerCase().includes(searchLower) ||
      orderIdStr.toLowerCase().includes(searchLower) ||
      payment.amount?.toString().includes(searchTerm);
      
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    const matchesOperation = operationFilter === 'all' || payment.operation === operationFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesOperation;
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Tableau de bord financier</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

    

      {/* Filtres */}
      <Card>
        <CardContent className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total crédits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats ? formatAmount(stats.totalCredit) : '...'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total débits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats ? formatAmount(stats.totalDebit) : '...'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Solde net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              stats?.netAmount >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats ? formatAmount(stats.netAmount) : '...'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Confirmées</div>
                <div className="font-medium">{stats?.totalCompleted || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">En attente</div>
                <div className="font-medium">{stats?.totalPending || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Échouées</div>
                <div className="font-medium">{stats?.totalFailed || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
            <div className="space-y-2 ">
              <Label>Période</Label>
              <div className="flex items-center gap-2">
                {isMounted && (
                  <Calendar
                    mode="range"
                    selected={date}
                    onSelect={setDate}
                    className="w-full"
                    locale={fr}
                    numberOfMonths={2}
                    defaultMonth={date?.from}
                  />
                )}
              </div>
            </div>



          </div>

  
          
        </CardContent>
      </Card>

      {/* Tableau des transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md flex flex-col border">
             <div className="p-2 grid grid-cols-9 gap-4">
              <div className="space-y-2 col-span-3">
                <Label>Rechercher</Label>
                <Input
                  placeholder="ID de transaction ou montant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9"
                />
              </div>
          <div className="space-y-2 col-span-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Crédit/Débit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="credit">Crédit</SelectItem>
                  <SelectItem value="debit">Débit</SelectItem>
                </SelectContent>
              </Select>
            </div>
             
            <div className="space-y-2 col-span-2">
              <Label>Opération</Label>
              <Select value={operationFilter} onValueChange={setOperationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="payment">Paiement</SelectItem>
                  <SelectItem value="remboursement">Remboursement</SelectItem>
                  <SelectItem value="validation">Validation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            

             <div className="space-y-2 col-span-2">
              <Label>Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="completed">Confirmé</SelectItem>
                  <SelectItem value="failed">Échoué</SelectItem>
                </SelectContent>
              </Select>
            </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>ID Transaction</TableHead>
                  <TableHead>Commande</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Opération</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Aucune transaction trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="font-medium text-xs">#{payment.transaction_id}</TableCell>
                      <TableCell className="text-xs">
                        {payment.order_id ? `#${payment.order_id}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.type === 'credit' ? 'default' : 'secondary'}>
                          {payment.type === 'credit' ? 'Crédit' : 'Débit'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {operationLabels[payment.operation as keyof typeof operationLabels] || payment.operation}
                      </TableCell>
                      <TableCell className={payment.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                        {payment.type === 'credit' ? '+' : '-'} {formatAmount(payment.amount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusVariant[payment.status as keyof typeof statusVariant]}>
                          {payment.status === 'pending' ? 'En attente' : 
                           payment.status === 'completed' ? 'Confirmé' : 'Échoué'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={payment.status}
                            onValueChange={(value) => handleStatusChange(payment.id, value)}
                            disabled={isUpdating[payment.id]}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="completed">Confirmer</SelectItem>
                              <SelectItem value="failed">Échec</SelectItem>
                            </SelectContent>
                          </Select>
                          {payment.proof_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(payment.proof_url, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              {filteredPayments.length} résultats • Page {page} sur {Math.ceil(filteredPayments.length / pageSize)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal d'upload de preuve */}
      {selectedPayment !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Ajouter une preuve</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proof">Téléverser une preuve</Label>
                <Input
                  id="proof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Fichier sélectionné: {selectedFile.name}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPayment(null);
                    setSelectedFile(null);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
