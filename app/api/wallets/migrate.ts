import { createClient } from "@/lib/supabaseClient";
import { getSupabaseSession } from "@/lib/authMnager";

const supabase = createClient();

/**
 * Fonction pour migrer les wallets existants et ajouter le champ user_email
 * À exécuter une seule fois après l'ajout du champ user_email à la table wallets
 */
export const migrateWalletsWithEmail = async () => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    console.log("🔄 Début de la migration des wallets...");

    // Récupérer tous les wallets sans user_email
    const { data: wallets, error: fetchError } = await supabase
      .from("wallets")
      .select("*")
      .is("user_email", null);

    if (fetchError) throw fetchError;

    console.log(`📊 ${wallets.length} wallets à migrer`);

    if (wallets.length === 0) {
      console.log("✅ Tous les wallets ont déjà un user_email");
      return { success: true, migrated: 0 };
    }

    // Mettre à jour chaque wallet
    const updates = await Promise.allSettled(
      wallets.map(async (wallet) => {
        try {
          // Générer un email basé sur l'user_id
          const userIdShort = wallet.user_id.substring(0, 8);
          const generatedEmail = `user-${userIdShort}@yabalma.com`;

          const { error: updateError } = await supabase
            .from("wallets")
            .update({ user_email: generatedEmail })
            .eq("id", wallet.id);

          if (updateError) throw updateError;

          console.log(
            `✅ Wallet ${wallet.id} mis à jour avec email: ${generatedEmail}`
          );
          return { walletId: wallet.id, email: generatedEmail };
        } catch (error) {
          console.error(`❌ Erreur pour wallet ${wallet.id}:`, error);
          throw error;
        }
      })
    );

    const successful = updates.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failed = updates.filter(
      (result) => result.status === "rejected"
    ).length;

    console.log(
      `✅ Migration terminée: ${successful} réussis, ${failed} échecs`
    );

    return {
      success: true,
      migrated: successful,
      failed: failed,
      details: updates,
    };
  } catch (err) {
    console.error("❌ Erreur lors de la migration:", err);
    throw err;
  }
};

/**
 * Fonction pour vérifier si la migration est nécessaire
 */
export const checkMigrationStatus = async () => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { count, error } = await supabase
      .from("wallets")
      .select("*", { count: "exact", head: true })
      .is("user_email", null);

    if (error) throw error;

    return {
      needsMigration: (count || 0) > 0,
      walletsWithoutEmail: count || 0,
    };
  } catch (err) {
    console.error(
      "Erreur lors de la vérification du statut de migration:",
      err
    );
    throw err;
  }
};
