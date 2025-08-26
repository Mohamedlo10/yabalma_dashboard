import { createClient } from "@/lib/supabaseClient";
import { getSupabaseSession } from "@/lib/authMnager";
import {
  getPendingTransactions as getPaymentPendingTransactions,
  updateTransactionWithProof,
} from "@/app/api/payment/query";
import { getTotalWalletsBalance } from "@/app/api/wallets/query";

const supabase = createClient();

interface PaymentFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  operation?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

// Get all payments with filtering
export const getPayments = async (filters: PaymentFilters = {}) => {
  const session = await getSupabaseSession();
  if (!session) throw new Error("Non autorisé - Session invalide");

  try {
    let query = supabase
      .from("payment_info")
      .select(
        `
        *,
        commande(*)
        `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters.startDate && filters.endDate) {
      query = query
        .gte("created_at", `${filters.startDate}T00:00:00Z`)
        .lte("created_at", `${filters.endDate}T23:59:59Z`);
    }
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.operation) query = query.eq("operation", filters.operation);
    if (filters.type) query = query.eq("type", filters.type);

    // Apply pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data, count: count || 0, page, pageSize };
  } catch (err) {
    console.error("Error fetching payments:", err);
    throw err;
  }
};

// Update payment status
export const updatePaymentStatus = async (
  paymentId: number,
  status: string,
  proofUrl?: string
) => {
  const session = await getSupabaseSession();
  if (!session) throw new Error("Non autorisé - Session invalide");

  try {
    const updates: any = { status };
    if (proofUrl) updates.preuve_url = proofUrl;

    const { data, error } = await supabase
      .from("payment_info")
      .update(updates)
      .eq("id", paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error updating payment status:", err);
    throw err;
  }
};

// Get financial statistics
export const getFinancialStats = async (
  filters: {
    startDate?: string;
    endDate?: string;
  } = {}
) => {
  const session = await getSupabaseSession();
  if (!session) throw new Error("Non autorisé - Session invalide");

  try {
    let query = supabase.from("payment_info").select("*");

    if (filters.startDate && filters.endDate) {
      query = query
        .gte("created_at", `${filters.startDate}T00:00:00Z`)
        .lte("created_at", `${filters.endDate}T23:59:59Z`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Récupérer le total des soldes des wallets
    const walletsData = await getTotalWalletsBalance();

    const stats = {
      totalCredit: 0,
      totalDebit: 0,
      totalPending: 0,
      totalCompleted: 0,
      totalFailed: 0,
    };

    data?.forEach((payment) => {
      const amount = Number(payment.amount) || 0;

      if (payment.type === "credit") {
        stats.totalCredit += amount;
      } else if (payment.type === "debit") {
        stats.totalDebit += amount;
      }

      if (payment.status === "pending") {
        stats.totalPending += 1;
      } else if (payment.status === "completed") {
        stats.totalCompleted += 1;
      } else if (payment.status === "failed") {
        stats.totalFailed += 1;
      }
    });

    // Calculer le solde net : crédits - débits + total des soldes des wallets
    const netAmount =
      stats.totalCredit - stats.totalDebit + walletsData.totalBalance;

    return {
      ...stats,
      netAmount,
      totalWalletsBalance: walletsData.totalBalance,
      walletsCount: walletsData.walletsCount,
    };
  } catch (err) {
    console.error("Error fetching financial stats:", err);
    throw err;
  }
};

// Upload proof file
export const uploadProofFile = async (file: File) => {
  const session = await getSupabaseSession();
  if (!session) throw new Error("Non autorisé - Session invalide");

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `yabalma/payment_proofs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("yabalma/payment_proofs")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("yabalma/payment_proofs").getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error("Error uploading proof file:", err);
    throw err;
  }
};

// Récupérer les transactions en attente (utilise la fonction de payment/query.ts)
export const getPendingTransactions = async (userId?: string) => {
  try {
    return await getPaymentPendingTransactions(userId);
  } catch (err) {
    console.error("Error getting pending transactions:", err);
    throw err;
  }
};

// Confirmer une transaction avec preuve
export const confirmTransactionWithProof = async (
  transactionId: string,
  file: File
): Promise<any> => {
  const session = await getSupabaseSession();
  if (!session) throw new Error("Non autorisé - Session invalide");

  try {
    // 1. Upload de la preuve
    const preuveUrl = await uploadProofFile(file);

    // 2. Mise à jour de la transaction
    const updatedTransaction = await updateTransactionWithProof(
      transactionId,
      preuveUrl
    );

    return updatedTransaction;
  } catch (err) {
    console.error("Error confirming transaction with proof:", err);
    throw err;
  }
};
