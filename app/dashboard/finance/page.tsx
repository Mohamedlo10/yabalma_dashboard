"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Upload,
  RefreshCw,
  Eye,
  CalendarIcon,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
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
import {
  getPayments,
  updatePaymentStatus,
  getFinancialStats,
  uploadProofFile,
  getPendingTransactions,
  confirmTransactionWithProof,
} from "@/app/api/finance/query";
import { getAllWallets } from "@/app/api/wallets/query";

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
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Record<number, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const pageSize = 10;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data, count } = await getPayments({
        startDate: date?.from?.toISOString().split("T")[0],
        endDate: date?.to?.toISOString().split("T")[0],
        status: statusFilter !== "all" ? statusFilter : undefined,
        operation: operationFilter !== "all" ? operationFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        page,
        pageSize,
      });

      const statsData = await getFinancialStats({
        startDate: date?.from?.toISOString().split("T")[0],
        endDate: date?.to?.toISOString().split("T")[0],
      });

      console.log(data);

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

  const fetchPendingTransactions = async () => {
    try {
      setIsLoadingPending(true);
      const pendingData = await getPendingTransactions();
      setPendingTransactions(pendingData || []);
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
      toast.error("Erreur lors du chargement des transactions en attente");
    } finally {
      setIsLoadingPending(false);
    }
  };

  const fetchWallets = async () => {
    try {
      setIsLoadingWallets(true);
      const walletsData = await getAllWallets();
      setWallets(walletsData || []);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast.error("Erreur lors du chargement des portefeuilles");
    } finally {
      setIsLoadingWallets(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPendingTransactions();
    fetchWallets();
  }, [date, statusFilter, operationFilter, typeFilter, page]);

  const handleStatusChange = async (paymentId: number, newStatus: string) => {
    try {
      setIsUpdating((prev) => ({ ...prev, [paymentId]: true }));

      if (newStatus === "completed") {
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
      setIsUpdating((prev) => ({ ...prev, [paymentId]: false }));
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || selectedPayment === null) return;

    try {
      const proofUrl = await uploadProofFile(selectedFile);
      await updatePaymentStatus(selectedPayment, "completed", proofUrl);
      toast.success("Preuve téléversée et statut mis à jour");
      setSelectedPayment(null);
      setSelectedFile(null);
      fetchData();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erreur lors du téléversement du fichier");
    }
  };

  const handleConfirmTransaction = async (transactionId: string) => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner une preuve de paiement");
      return;
    }

    try {
      await confirmTransactionWithProof(transactionId, selectedFile);
      toast.success("Transaction confirmée avec succès");
      setSelectedTransaction(null);
      setSelectedFile(null);
      fetchPendingTransactions(); // Recharger les transactions en attente
      fetchData(); // Recharger toutes les transactions
    } catch (error) {
      console.error("Error confirming transaction:", error);
      toast.error("Erreur lors de la confirmation de la transaction");
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Fonction utilitaire pour formater les dates des transactions
  const formatTransactionDate = (transaction: any) => {
    try {
      // Priorité 1: utiliser created_at si disponible
      if (transaction.created_at) {
        return format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm", {
          locale: fr,
        });
      }

      // Priorité 2: Si payment_date contient une date complète
      if (transaction.payment_date && transaction.payment_date.includes("T")) {
        return format(new Date(transaction.payment_date), "dd/MM/yyyy HH:mm", {
          locale: fr,
        });
      }

      // Priorité 3: Si payment_date contient juste l'heure, l'afficher telle quelle
      if (transaction.payment_date) {
        return `Aujourd'hui ${transaction.payment_date.split("+")[0]}`;
      }

      return "Date non disponible";
    } catch (error) {
      console.warn("Erreur lors du formatage de la date:", error);
      return "Date non disponible";
    }
  };

  // Filtrer les transactions en fonction des critères de recherche et des filtres
  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchTerm.toLowerCase();
    const orderIdStr = payment.order_id?.toString() || "";
    const matchesSearch =
      !searchTerm ||
      payment.transaction_id?.toLowerCase().includes(searchLower) ||
      orderIdStr.toLowerCase().includes(searchLower) ||
      payment.amount?.toString().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    const matchesType = typeFilter === "all" || payment.type === typeFilter;
    const matchesOperation =
      operationFilter === "all" || payment.operation === operationFilter;

    return matchesSearch && matchesStatus && matchesType && matchesOperation;
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Tableau de bord financier</h1>
      </div>

      {/* Section des statistiques et filtres */}
      <Card>
        <CardContent className="pt-6">
          {/* Ligne du haut : Sélecteur de période et bouton actualiser */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Label className="text-sm font-medium whitespace-nowrap">
                Période :
              </Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal min-w-[250px]"
                    onClick={() => setIsCalendarOpen(true)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "dd MMM yyyy", { locale: fr })} -{" "}
                          {format(date.to, "dd MMM yyyy", { locale: fr })}
                        </>
                      ) : (
                        format(date.from, "dd MMM yyyy", { locale: fr })
                      )
                    ) : (
                      <span>Sélectionner une période</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 border-b">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          setDate({ from: today, to: today });
                          setIsCalendarOpen(false);
                        }}
                      >
                        Aujourd'hui
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          const lastWeek = new Date(
                            today.getTime() - 7 * 24 * 60 * 60 * 1000
                          );
                          setDate({ from: lastWeek, to: today });
                          setIsCalendarOpen(false);
                        }}
                      >
                        7 derniers jours
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          const lastMonth = new Date(
                            today.getTime() - 30 * 24 * 60 * 60 * 1000
                          );
                          setDate({ from: lastMonth, to: today });
                          setIsCalendarOpen(false);
                        }}
                      >
                        30 derniers jours
                      </Button>
                    </div>
                  </div>
                  {isMounted && (
                    <Calendar
                      mode="range"
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate);
                        if (newDate?.from && newDate?.to) {
                          setIsCalendarOpen(false);
                        }
                      }}
                      locale={fr}
                      numberOfMonths={2}
                      defaultMonth={date?.from}
                    />
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <Button
              onClick={() => {
                fetchData();
                fetchPendingTransactions();
                fetchWallets();
              }}
              disabled={isLoading || isLoadingPending}
              className="shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  isLoading || isLoadingPending ? "animate-spin" : ""
                }`}
              />
              Actualiser
            </Button>
          </div>

          {/* Cartes de statistiques - disposition compacte */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Total crédits */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-xs font-medium text-green-800">
                  Crédits
                </span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {stats ? formatAmount(stats.totalCredit) : "..."}
              </div>
            </div>

            {/* Total débits */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-xs font-medium text-red-800">Débits</span>
              </div>
              <div className="text-lg font-bold text-red-600">
                {stats ? formatAmount(stats.totalDebit) : "..."}
              </div>
            </div>

            {/* Total Wallets */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-xs font-medium text-blue-800">
                  Wallets
                </span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {stats ? formatAmount(stats.totalWalletsBalance) : "..."}
              </div>
              <div className="text-xs text-blue-600 opacity-75">
                {stats?.walletsCount || 0} wallet(s)
              </div>
            </div>

            {/* Solde net */}
            <div
              className={`border rounded-lg p-3 ${
                stats?.netAmount >= 0
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    stats?.netAmount >= 0 ? "bg-green-600" : "bg-red-600"
                  }`}
                ></div>
                <span
                  className={`text-xs font-medium ${
                    stats?.netAmount >= 0 ? "text-green-800" : "text-red-800"
                  }`}
                >
                  Solde net
                </span>
              </div>
              <div
                className={`text-lg font-bold ${
                  stats?.netAmount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats ? formatAmount(stats.netAmount) : "..."}
              </div>
            </div>

            {/* Statut des Transactions - version compacte */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3 w-3 text-gray-600" />
                <span className="text-xs font-medium text-gray-800">
                  Transactions
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-700">Conf.</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {stats?.totalCompleted || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-orange-600" />
                    <span className="text-xs text-orange-700">Att.</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600">
                    {stats?.totalPending || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-600" />
                    <span className="text-xs text-red-700">Éch.</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {stats?.totalFailed || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section des transactions en attente */}
      {pendingTransactions.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              ⏳ Transactions en attente de confirmation (
              {pendingTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTransactions.map((transaction) => (
                <div
                  key={transaction.transaction_id}
                  className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="text-sm text-gray-500">Transaction</p>
                      <p className="font-medium">
                        {transaction.transaction_id}
                      </p>
                      <p className="text-xs text-gray-400">
                        Commande #{transaction.commande?.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Montant</p>
                      <p className="font-medium text-red-600">
                        -{formatAmount(parseFloat(transaction.amount))}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTransactionDate(transaction)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">
                        {transaction.commande?.client?.prenom}{" "}
                        {transaction.commande?.client?.nom}
                      </p>
                      <p className="text-xs text-gray-400">
                        {transaction.commande?.annonce?.source} →{" "}
                        {transaction.commande?.annonce?.destination}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {selectedTransaction === transaction.transaction_id ? (
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) =>
                              setSelectedFile(e.target.files?.[0] || null)
                            }
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleConfirmTransaction(
                                  transaction.transaction_id
                                )
                              }
                              disabled={!selectedFile}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirmer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTransaction(null);
                                setSelectedFile(null);
                              }}
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            setSelectedTransaction(transaction.transaction_id)
                          }
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Ajouter preuve
                        </Button>
                      )}

                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-300"
                      >
                        En attente
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section des portefeuilles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💳 Portefeuilles des utilisateurs ({wallets.length})
            <Button
              size="sm"
              variant="outline"
              onClick={fetchWallets}
              disabled={isLoadingWallets}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoadingWallets ? "animate-spin" : ""}`}
              />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingWallets ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Chargement des portefeuilles...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {wallets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun portefeuille trouvé
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">
                              {wallet.user_mail?.[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {wallet.user_mail}
                            </p>
                            <p className="text-xs text-gray-500">
                              {wallet.user_id.length > 17
                                ? `${wallet.user_id.substring(0, 17)}...`
                                : wallet.user_id}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Solde</p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatAmount(Number(wallet.balance))}
                        </p>
                      </div>

                      <div className="mt-2 text-xs text-gray-400">
                        Créé:{" "}
                        {format(new Date(wallet.created_at), "dd/MM/yyyy", {
                          locale: fr,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
                <Select
                  value={operationFilter}
                  onValueChange={setOperationFilter}
                >
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
                        {payment.created_at
                          ? new Date(payment.created_at).toLocaleDateString(
                              "fr-FR"
                            )
                          : "Date non disponible"}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        #{payment.transaction_id}
                      </TableCell>
                      <TableCell className="text-xs">
                        {payment.order_id ? `#${payment.order_id}` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.type === "credit" ? "default" : "secondary"
                          }
                        >
                          {payment.type === "credit" ? "Crédit" : "Débit"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {operationLabels[
                          payment.operation as keyof typeof operationLabels
                        ] || payment.operation}
                      </TableCell>
                      <TableCell
                        className={
                          payment.type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {payment.type === "credit" ? "+" : "-"}{" "}
                        {formatAmount(payment.amount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusVariant[
                              payment.status as keyof typeof statusVariant
                            ]
                          }
                        >
                          {payment.status === "pending"
                            ? "En attente"
                            : payment.status === "completed"
                            ? "Confirmé"
                            : "Échoué"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={payment.status}
                            onValueChange={(value) =>
                              handleStatusChange(payment.id, value)
                            }
                            disabled={isUpdating[payment.id]}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">
                                En attente
                              </SelectItem>
                              <SelectItem value="completed">
                                Confirmer
                              </SelectItem>
                              <SelectItem value="failed">Échec</SelectItem>
                            </SelectContent>
                          </Select>
                          {payment.preuve_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                window.open(payment.preuve_url, "_blank")
                              }
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
              {filteredPayments.length} résultats • Page {page} sur{" "}
              {Math.ceil(filteredPayments.length / pageSize)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
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
                <Button onClick={handleFileUpload} disabled={!selectedFile}>
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
