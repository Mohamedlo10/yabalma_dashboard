import { createClient } from "@/lib/supabaseClient";
import { getSupabaseSession } from "@/lib/authMnager";

const supabase = createClient();

export const getWalletById = async (id: string) => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching wallet:", err);
    throw err;
  }
};

export const getWalletByUserId = async (userId: string) => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data || null;
  } catch (err) {
    console.error("Error fetching user wallet:", err);
    throw err;
  }
};

export const createWallet = async (userId: string, initialBalance: number = 0) => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase
      .from("wallets")
      .insert([
        { 
          user_id: userId, 
          balance: initialBalance 
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error creating wallet:", err);
    throw err;
  }
};

export const updateWalletBalance = async (walletId: string, amount: bigint) => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    // First get current balance
    const { data: wallet, error: fetchError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('id', walletId)
      .single();

    if (fetchError) throw fetchError;
    if (!wallet) throw new Error('Portefeuille non trouvé');

    // Calculate new balance
    const currentBalance = BigInt(wallet.balance);
    const newBalance = currentBalance + amount;

    // Update with new balance
    const { data, error } = await supabase
      .from('wallets')
      .update({ 
        balance: newBalance.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', walletId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Erreur lors de la mise à jour du solde du portefeuille:", err);
    throw err;
  }
};
