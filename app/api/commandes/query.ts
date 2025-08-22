import { createClient } from "@/lib/supabaseClient";
import { getSupabaseSession } from "@/lib/authMnager";
import {
  processValidationPayment,
  extractCurrencyFromCommande,
  extractAmountFromCommande,
} from "@/app/api/payment/query";
import { getOrCreateUserWallet } from "@/app/api/wallets/query";
const supabase = createClient();

export const getallcommandes = async () => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { data, error } = await supabase
      .from("commande")
      .select(
        `
        *,
        annonce(
          *,
          client(*) 
        ),
        client(*) 
      `
      )
      .order("validation_status", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data as any) || [];
  } catch (err) {
    throw err;
  }
};

export const getCommandesWithShop = async () => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { data, error } = await supabase
      .from("commande")
      .select(
        `
        *,
        annonce(
          *,
          client(*)
        ),
        client(*)
      `
      )
      .order("validation_status", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    const shopIds = data.map((commande) => commande.id_shop).filter((id) => id);

    const uniqueShopIds = shopIds.filter(
      (id, index, self) => self.indexOf(id) === index
    );

    if (uniqueShopIds.length > 0) {
      const { data: shopsData, error: shopsError } = await supabase
        .from("shopping")
        .select("*")
        .in("id", uniqueShopIds);

      if (shopsError) throw shopsError;

      return data.map((commande) => ({
        ...commande,
        shop: shopsData.find((shop) => shop.id.toString() === commande.id_shop),
      }));
    }

    return data || [];
  } catch (err) {
    throw err;
  }
};

export const getCommandesStats = async () => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { count: totalCommandes, error: totalError } = await supabase
      .from("commande")
      .select("*", { count: "exact", head: true });

    if (totalError) throw totalError;

    const { count: commandesValidees, error: validatedError } = await supabase
      .from("commande")
      .select("*", { count: "exact", head: true })
      .eq("validation_status", true);

    if (validatedError) throw validatedError;
    return {
      totalCommandes: totalCommandes || 0,
      commandesNonValidees: (totalCommandes || 0) - (commandesValidees || 0),
      commandesValidees: commandesValidees || 0,
    };
  } catch (err) {
    throw err;
  }
};
export const getcommandesById = async (id: number) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { data, error } = await supabase
      .from("commande")
      .select(
        `
        *,
        annonce(
          *,
          client(*) 
        ),
        client(*) 
      `
      )
      .eq("id", id);

    if (error) throw error;

    return data[0] as any;
  } catch (err) {
    throw err;
  }
};

export const modifierCommande = async (
  id_commande: any,
  commandeData: Record<string, any>
) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { data, error } = await supabase
      .from("commande")
      .update(commandeData)
      .eq("id", id_commande);

    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
};

export const validerCommande = async (
  id_commande: number,
  mail_valideur?: string,
  userId?: string
) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    // Récupérer les détails complets de la commande
    const { data: commandeExistante, error: erreurRecherche } = await supabase
      .from("commande")
      .select(
        `
        *,
        detail_commande
      `
      )
      .eq("id", id_commande)
      .single();

    if (erreurRecherche) throw erreurRecherche;

    if (!commandeExistante) {
      throw new Error("Commande non trouvée");
    }

    if (commandeExistante.validation_status === true) {
      return {
        message: "La commande est déjà validée",
        commande: commandeExistante,
      };
    }

    // Récupérer ou créer le portefeuille du validateur
    let validatorWallet = null;
    let paymentResult = null;

    if (userId) {
      try {
        console.log(
          `💼 Récupération du portefeuille pour l'utilisateur ${userId}`
        );
        validatorWallet = await getOrCreateUserWallet(userId);

        // Extraire le montant et la devise de la commande avec les fonctions utilitaires
        const commandeAmount = extractAmountFromCommande(commandeExistante);
        const commandeCurrency = extractCurrencyFromCommande(commandeExistante);

        console.log(
          `💰 Montant à débiter: ${commandeAmount} ${commandeCurrency}`
        );

        // Traiter le paiement de validation si le montant est valide
        if (commandeAmount > 0) {
          paymentResult = await processValidationPayment(
            id_commande,
            userId,
            validatorWallet.id,
            commandeAmount,
            commandeCurrency
          );
          console.log(`✅ Paiement de validation traité avec succès`);
        } else {
          console.warn(
            `⚠️ Montant de commande invalide (${commandeAmount}), paiement ignoré`
          );
        }
      } catch (paymentError) {
        console.error("Erreur lors du traitement du paiement:", paymentError);
        // Ne pas faire échouer la validation pour des erreurs de paiement
        // mais logger l'erreur pour investigation
        console.warn("La validation continue malgré l'erreur de paiement");
      }
    }

    // Mettre à jour le statut de validation
    const { data, error: erreurUpdate } = await supabase
      .from("commande")
      .update({
        validation_status: true,
        mail_valideur: mail_valideur || null,
        validationPending: false, // Débloquer automatiquement lors de la validation
      })
      .eq("id", id_commande);

    if (erreurUpdate) throw erreurUpdate;

    return {
      message: "Commande validée avec succès",
      data,
      paymentProcessed: paymentResult !== null,
      walletBalance: validatorWallet?.balance || null,
    };
  } catch (err) {
    console.error("Erreur lors de la validation de la commande:", err);
    throw err;
  }
};

// Nouvelle fonction pour gérer le statut de validation en cours
export const updateValidationStatus = async (
  id_commande: number,
  validationPending: boolean,
  mail_valideur: string | null
) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    // D'abord, récupérer l'état actuel de la commande
    const { data: commande, error: fetchError } = await supabase
      .from("commande")
      .select("validationPending, mail_valideur")
      .eq("id", id_commande)
      .single();

    if (fetchError) throw fetchError;

    // Vérifier si la commande est déjà en cours de validation par quelqu'un d'autre
    if (
      commande.validationPending &&
      validationPending &&
      commande.mail_valideur !== mail_valideur
    ) {
      return {
        error: `Cette commande est déjà en cours de traitement par ${commande.mail_valideur}`,
        isBlocked: true,
        blockedBy: commande.mail_valideur,
      };
    }

    // Pour le déblocage, vérifier que c'est la même personne qui a bloqué
    if (
      !validationPending &&
      commande.validationPending &&
      commande.mail_valideur &&
      commande.mail_valideur.toLowerCase() !== mail_valideur?.toLowerCase()
    ) {
      return {
        error: `Seul ${commande.mail_valideur} peut débloquer cette commande`,
        isBlocked: true,
        blockedBy: commande.mail_valideur,
      };
    }

    // Mettre à jour le statut de validation
    const { data, error } = await supabase
      .from("commande")
      .update({
        validationPending: validationPending,
        mail_valideur: validationPending ? mail_valideur : null, // Ne pas conserver le mail si on débloque
        updated_at: new Date().toISOString(),
      })
      .eq("id", id_commande);
    console.log(data);

    if (error) throw error;

    return {
      message: validationPending
        ? "Commande verrouillée pour validation"
        : "Commande déverrouillée",
      data,
      isBlocked: validationPending,
    };
  } catch (err) {
    console.error(
      "Erreur lors de la mise à jour du statut de validation:",
      err
    );
    throw err;
  }
};

// Nouvelle fonction spécifique pour le déblocage
export const unblockValidationStatus = async (
  id_commande: number,
  userEmail: string
) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    // D'abord, récupérer l'état actuel de la commande
    const { data: commande, error: fetchError } = await supabase
      .from("commande")
      .select("validationPending, mail_valideur, validation_status")
      .eq("id", id_commande)
      .single();

    if (fetchError) throw fetchError;

    // Vérifier que la commande est bien bloquée
    if (!commande.validationPending) {
      return {
        error: "Cette commande n'est pas bloquée",
        success: false,
      };
    }

    // Vérifier que c'est bien la personne qui a bloqué qui essaie de débloquer
    if (
      !commande.mail_valideur ||
      commande.mail_valideur.toLowerCase() !== userEmail.toLowerCase()
    ) {
      return {
        error: `Seul ${commande.mail_valideur} peut débloquer cette commande`,
        success: false,
        blockedBy: commande.mail_valideur,
      };
    }

    // Vérifier que la commande n'est pas déjà validée
    if (commande.validation_status) {
      return {
        error: "Cette commande est déjà validée et ne peut pas être débloquée",
        success: false,
      };
    }

    // Débloquer la commande
    const { data, error } = await supabase
      .from("commande")
      .update({
        validationPending: false,
        mail_valideur: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id_commande);

    if (error) throw error;

    return {
      message: "Commande débloquée avec succès",
      success: true,
      data,
    };
  } catch (err) {
    console.error("Erreur lors du déblocage de la commande:", err);
    throw err;
  }
};

export const supprimerCommande = async (id_commande: any) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { data, error } = await supabase
      .from("commande")
      .delete()
      .eq("id", id_commande);

    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
};

export const getCommandesClient = async (id: any) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { data, error } = await supabase
      .from("commande")
      .select(
        `
        *,
        annonce(
          *,
          client(*) 
        ),
        client(*) 
      `
      )
      .eq("id_client", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data as any;
  } catch (err) {
    throw err;
  }
};
export const getCommandesGp = async (id: any) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { data, error } = await supabase
      .from("commande")
      .select(
        `
        *,
        annonce(
          *,
          client(*) 
        ),
        client(*) 
      `
      )
      .eq("id_gp", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data as any;
  } catch (err) {
    throw err;
  }
};

export const getCommandesByIdAnnonce = async (id: any) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { data, error } = await supabase
      .from("commande")
      .select(
        `
        *,
        annonce(
          *,
          client(*) 
        ),
        client(*) 
      `
      )
      .eq("id_annonce", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data as any;
  } catch (err) {
    throw err;
  }
};

export const getCommandesForCurrentMonthCount = async () => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { count, error } = await supabase
      .from("commande")
      .select("id", { count: "exact", head: true })
      .gte(
        "created_at",
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString()
      ) // Début du mois en cours
      .lte("created_at", new Date().toISOString());

    if (error) throw error;

    return count; // Retourne le nombre de commandes
  } catch (err) {
    throw err;
  }
};

export const getcommandesCountByMonth = async () => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { data, error } = await supabase.rpc("get_commandes_count_by_month");

    if (error) throw error;

    return data as any;
  } catch (err) {
    throw err;
  }
};

export const getcommandeAnnonceCount = async () => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { data, error } = await supabase.rpc(
      "get_commandes_and_annonces_by_date"
    );

    if (error) throw error;

    return data as any;
  } catch (err) {
    throw err;
  }
};
