import { createClient } from "@/lib/supabaseClient";
import { getSupabaseSession } from "@/lib/authMnager";

const supabase = createClient();

// Interface pour les données de carte bancaire
export interface BankCardData {
  card_number: string;
  expiry_date: string;
  cvv: string;
  cardholder_name: string;
  card_type: string;
  issuing_bank?: string;
  status?: string;
  credit_limit?: number;
  pin_code?: string;
  country_code?: string;
}

// Interface pour la mise à jour du solde avec devise
export interface BalanceUpdateData {
  amount: number;
  currency: string;
}

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

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
    return data || null;
  } catch (err) {
    console.error("Error fetching user wallet:", err);
    throw err;
  }
};

export const createWallet = async (
  userId: string,
  userEmail: string,
  initialBalance: number = 0
) => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    // Vérifier si l'utilisateur a déjà un wallet
    const hasWallet = await checkUserWalletExists(userId);
    if (hasWallet) {
      throw new Error(
        "L'utilisateur possède déjà un portefeuille. Un utilisateur ne peut avoir qu'un seul wallet."
      );
    }

    const { data, error } = await supabase
      .from("wallets")
      .insert([
        {
          user_id: userId,
          user_mail: userEmail,
          balance: initialBalance,
        },
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

export const getOrCreateUserWallet = async (userId: string): Promise<any> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    // Essayer de récupérer le portefeuille existant
    let { data: wallet, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Si le portefeuille n'existe pas, le créer
    if (error && error.code === "PGRST116") {
      console.log(`📝 pas de portefeuille pour l'utilisateur ${userId}`);
      /* 
      // Récupérer l'email de l'utilisateur connecté depuis la session
      const userEmail =
        session?.user?.email || `user-${userId.substring(0, 8)}@system`;

      wallet = await createWallet(userId, userEmail, 0); */
    } else if (error) {
      throw error;
    }

    return wallet;
  } catch (err) {
    console.error("Error getting or creating user wallet:", err);
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
      .from("wallets")
      .select("balance")
      .eq("id", walletId)
      .single();

    if (fetchError) throw fetchError;
    if (!wallet) throw new Error("Portefeuille non trouvé");

    // Calculate new balance
    const currentBalance = BigInt(wallet.balance);
    const newBalance = currentBalance + amount;

    // Update with new balance
    const { data, error } = await supabase
      .from("wallets")
      .update({
        balance: newBalance.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", walletId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error(
      "Erreur lors de la mise à jour du solde du portefeuille:",
      err
    );
    throw err;
  }
};

export const getAllWallets = async () => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    // Récupérer tous les wallets avec le nouveau champ user_email
    const { data: wallets, error } = await supabase
      .from("wallets")
      .select("*")
      .order("balance", { ascending: false });

    if (error) throw error;

    console.log(`📊 Récupération de ${wallets.length} portefeuilles`);

    // Maintenant on peut utiliser directement le champ user_email de la table
    const walletsWithInfo = wallets.map((wallet) => {
      const userEmail =
        wallet.user_email || `user-${wallet.user_id.substring(0, 8)}@system`;
      const userIdShort = wallet.user_id.substring(0, 8);

      // Extraire le prénom et nom de l'email si possible
      const emailParts = userEmail.split("@")[0];
      const displayName = emailParts.includes(".")
        ? emailParts
            .split(".")
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ")
        : `Utilisateur #${userIdShort.toUpperCase()}`;

      return {
        ...wallet,
        user_info: {
          id: wallet.user_id,
          email: userEmail,
          user_metadata: {
            prenom: displayName.split(" ")[0] || "Utilisateur",
            nom: displayName.split(" ")[1] || `#${userIdShort.toUpperCase()}`,
          },
        },
      };
    });

    return walletsWithInfo;
  } catch (err) {
    console.error("Error fetching all wallets:", err);
    throw err;
  }
};

export const getTotalWalletsBalance = async () => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase.from("wallets").select("balance");

    if (error) throw error;

    // Calculer le solde total de tous les wallets
    const totalBalance = data.reduce((sum, wallet) => {
      return sum + Number(wallet.balance);
    }, 0);

    return {
      totalBalance,
      walletsCount: data.length,
    };
  } catch (err) {
    console.error("Error calculating total wallets balance:", err);
    throw err;
  }
};

// Fonction utilitaire pour vérifier si un utilisateur a déjà un wallet
export const checkUserWalletExists = async (
  userId: string
): Promise<boolean> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", userId)
      .single();

    // Si PGRST116 (no rows), l'utilisateur n'a pas de wallet
    if (error && error.code === "PGRST116") {
      return false;
    }

    // Si autre erreur, la relancer
    if (error) throw error;

    // Si data existe, l'utilisateur a déjà un wallet
    return !!data;
  } catch (err) {
    console.error("Error checking user wallet existence:", err);
    throw err;
  }
};

// Fonction pour compter le nombre de wallets d'un utilisateur
export const getUserWalletCount = async (userId: string): Promise<number> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { count, error } = await supabase
      .from("wallets")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) throw error;

    console.log(`📊 Nombre de wallets pour l'utilisateur ${userId}: ${count}`);
    return count || 0;
  } catch (err) {
    console.error("Error counting user wallets:", err);
    throw err;
  }
};

// Fonction pour convertir une devise en XOF
export const convertCurrencyToXOF = async (
  amount: number,
  fromCurrency: string
): Promise<number> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  // Si c'est déjà en XOF, pas de conversion nécessaire
  if (fromCurrency === "XOF" || fromCurrency === "FCFA") {
    console.log(`💱 Pas de conversion nécessaire: ${amount} ${fromCurrency}`);
    return amount;
  }

  try {
    // Récupérer le taux de change depuis la table settings
    console.log(`🔍 Recherche du taux de change pour: ${fromCurrency}`);

    const { data: currencyData, error } = await supabase
      .from("settings")
      .select("value")
      .eq("currency", fromCurrency)
      .single();

    if (error) {
      console.warn(
        `⚠️ Taux non trouvé pour ${fromCurrency}, utilisation du montant original`
      );
      return amount;
    }

    if (!currencyData || !currencyData.value) {
      console.warn(`⚠️ Valeur de taux invalide pour ${fromCurrency}`);
      return amount;
    }

    const exchangeRate = parseFloat(currencyData.value);
    console.log(`📊 Taux trouvé pour ${fromCurrency}: ${exchangeRate}`);

    // Vérification de la cohérence du taux
    if (exchangeRate <= 0) {
      console.warn(`⚠️ Taux invalide pour ${fromCurrency}: ${exchangeRate}`);
      return amount;
    }

    // Conversion : montant en devise étrangère × taux = montant en XOF
    const convertedAmount = amount * exchangeRate;

    console.log(
      `💱 Conversion: ${amount} ${fromCurrency} × ${exchangeRate} = ${convertedAmount} XOF`
    );

    return Math.round(convertedAmount);
  } catch (err) {
    console.error("Erreur lors de la conversion de devise:", err);
    return amount;
  }
};

// Interface pour les données de carte bancaire
export interface BankCardData {
  card_number: string;
  expiry_date: string;
  cvv: string;
  cardholder_name: string;
  card_type: string;
  issuing_bank?: string;
  status?: string;
  credit_limit?: number;
  pin_code?: string;
  country_code?: string;
}

// Interface pour la mise à jour du solde avec devise
export interface BalanceUpdateData {
  amount: number;
  currency: string;
}

// CREATE - Créer une nouvelle carte bancaire avec solde initial
export const createBankCard = async (
  userId: string,
  userEmail: string,
  cardData: BankCardData,
  initialBalance: number = 0,
  currency: string = "XOF"
): Promise<any> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    // Vérifier si l'utilisateur a déjà un wallet/carte
    const hasWallet = await checkUserWalletExists(userId);
    if (hasWallet) {
      throw new Error(
        "L'utilisateur possède déjà un portefeuille/carte. Un utilisateur ne peut avoir qu'un seul wallet."
      );
    }

    // Convertir le solde initial en XOF
    const balanceInXOF = await convertCurrencyToXOF(initialBalance, currency);

    const { data, error } = await supabase
      .from("wallets")
      .insert([
        {
          user_id: userId,
          user_mail: userEmail,
          balance: balanceInXOF,
          available_balance: balanceInXOF,
          ...cardData,
          status: cardData.status || "active",
          country_code: cardData.country_code || "SN",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log(
      `💳 Nouvelle carte créée avec solde: ${balanceInXOF} XOF (converti depuis ${initialBalance} ${currency})`
    );
    return data;
  } catch (err) {
    console.error("Error creating bank card:", err);
    throw err;
  }
};

// READ - Récupérer toutes les cartes d'un utilisateur
export const getUserBankCards = async (userId: string): Promise<any[]> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching user bank cards:", err);
    throw err;
  }
};

// READ - Récupérer une carte spécifique
export const getBankCardById = async (cardId: string): Promise<any> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("id", cardId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching bank card:", err);
    throw err;
  }
};

// UPDATE - Mettre à jour les informations de carte
export const updateBankCard = async (
  cardId: string,
  cardData: Partial<BankCardData>
): Promise<any> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase
      .from("wallets")
      .update({
        ...cardData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardId)
      .select()
      .single();

    if (error) throw error;

    console.log(`💳 Carte mise à jour: ${cardId}`);
    return data;
  } catch (err) {
    console.error("Error updating bank card:", err);
    throw err;
  }
};

// UPDATE - Mettre à jour le solde avec conversion de devise
export const updateCardBalance = async (
  cardId: string,
  balanceData: BalanceUpdateData
): Promise<any> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    // Convertir le montant en XOF
    const balanceInXOF = await convertCurrencyToXOF(
      balanceData.amount,
      balanceData.currency
    );

    const { data, error } = await supabase
      .from("wallets")
      .update({
        balance: balanceInXOF,
        available_balance: balanceInXOF,
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardId)
      .select()
      .single();

    if (error) throw error;

    console.log(
      `💰 Solde mis à jour: ${balanceData.amount} ${balanceData.currency} → ${balanceInXOF} XOF`
    );
    return data;
  } catch (err) {
    console.error("Error updating card balance:", err);
    throw err;
  }
};

// UPDATE - Ajouter des fonds (top-up) avec conversion de devise
export const topUpCardBalance = async (
  cardId: string,
  topUpData: BalanceUpdateData
): Promise<any> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    // Convertir le montant à ajouter en XOF
    const amountToAddInXOF = await convertCurrencyToXOF(
      topUpData.amount,
      topUpData.currency
    );

    // Récupérer le solde actuel
    const { data: currentCard, error: fetchError } = await supabase
      .from("wallets")
      .select("balance, available_balance")
      .eq("id", cardId)
      .single();

    if (fetchError) throw fetchError;

    const currentBalance = Number(currentCard.balance);
    const newBalance = currentBalance + amountToAddInXOF;

    const { data, error } = await supabase
      .from("wallets")
      .update({
        balance: newBalance,
        available_balance: newBalance,
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardId)
      .select()
      .single();

    if (error) throw error;

    console.log(
      `💰 Rechargement: +${topUpData.amount} ${topUpData.currency} (${amountToAddInXOF} XOF) → Nouveau solde: ${newBalance} XOF`
    );
    return data;
  } catch (err) {
    console.error("Error topping up card balance:", err);
    throw err;
  }
};

// UPDATE - Bloquer/Débloquer une carte
export const updateCardStatus = async (
  cardId: string,
  status: "active" | "blocked" | "expired" | "pending"
): Promise<any> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase
      .from("wallets")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardId)
      .select()
      .single();

    if (error) throw error;

    console.log(`🔒 Statut de carte mis à jour: ${cardId} → ${status}`);
    return data;
  } catch (err) {
    console.error("Error updating card status:", err);
    throw err;
  }
};

// DELETE - Supprimer une carte définitivement
export const deleteBankCard = async (cardId: string): Promise<void> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { error } = await supabase.from("wallets").delete().eq("id", cardId);

    if (error) throw error;

    console.log(`🗑️ Carte supprimée définitivement: ${cardId}`);
  } catch (err) {
    console.error("Error deleting bank card:", err);
    throw err;
  }
};
