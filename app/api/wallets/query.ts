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
    const { data, error } = await supabase
      .from("wallets")
      .insert([
        {
          user_id: userId,
          user_email: userEmail,
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
      console.log(
        `📝 Création d'un nouveau portefeuille pour l'utilisateur ${userId}`
      );

      // Récupérer l'email de l'utilisateur connecté depuis la session
      const userEmail =
        session?.user?.email || `user-${userId.substring(0, 8)}@system`;

      wallet = await createWallet(userId, userEmail, 0);
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
