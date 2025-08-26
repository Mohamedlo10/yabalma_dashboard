import { createClient } from "@/lib/supabaseClient";
import { getSupabaseSession } from "@/lib/authMnager";
import {
  processValidationPayment,
  extractCurrencyFromCommande,
  extractAmountFromCommande,
} from "@/app/api/payment/query";
import { getOrCreateUserWallet } from "@/app/api/wallets/query";
import { error } from "console";
const supabase = createClient();

// Nouvelle fonction pour enregistrer les infos d'entrepôt et uploader plusieurs photos
export const registerWarehouseInfo = async (
  orderId: number | string,
  photos: File[],
  info: Record<string, any>
) => {
  const role = getSupabaseSession();
  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }
  try {
    // 1. Upload des photos vers le stockage
    const photoUrls = await uploadMultipleFiles(photos, orderId);

    // 2. Générer les champs QR code et delivery_tracking_id
    const transportType = info.transport_type || "express";
    const qrCode = `QR${orderId}${Date.now()}`;
    const deliveryTrackingId = `${transportType.toUpperCase()}_${orderId}_${Math.floor(
      Math.random() * 10000
    )}`;

    // 3. Construire l'objet warehouse_info
    const warehouseInfo = {
      ...info,
      photos: photoUrls,
      received_at: new Date().toISOString(),
      transport_type: transportType,
      qr_code: qrCode,
      order_id: orderId,
      is_paid: false,
      delivery_tracking_id: deliveryTrackingId,
      volume: info.weight || 0,
      payment_date: null,
    };

    // 4. Mettre à jour la commande
    const { data, error } = await supabase
      .from("commande")
      .update({
        warehouse_info: warehouseInfo,
        statut: "Entrepot",
        updated_at: new Date().toISOString(),
        modification_locked: false,
        grouping_available: true,
        is_given_to_gp: true,
      })
      .eq("id", orderId);
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("Erreur registerWarehouseInfo:", err);
    return { error: err instanceof Error ? err.message : "Erreur inconnue" };
  }
};

// Helper pour uploader plusieurs fichiers
export const uploadMultipleFiles = async (
  files: File[],
  orderId: number | string
) => {
  const role = getSupabaseSession();
  if (!role) {
    return [];
  }
  const uploadedUrls = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // Supabase Storage: le key doit être relatif au bucket, donc pas de 'images/'
    const fileName = `commande_${orderId}_${Date.now()}_${i}`;
    try {
      const { error } = await supabase.storage
        .from("yabalma/images")
        .upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage
        .from("yabalma/images")
        .getPublicUrl(fileName);
      uploadedUrls.push(data.publicUrl);
    } catch (err) {
      console.error("Erreur upload fichier:", err);
    }
  }
  return uploadedUrls;
};
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
        return paymentError;
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
        statut: "Validé",
        is_received_by_gp: true,
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

// Fonction pour dévalider une commande (mettre validation_status à false)
export const invalidateCommande = async (id_commande: number) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    // Vérifier d'abord que la commande existe et est validée
    const { data: commande, error: fetchError } = await supabase
      .from("commande")
      .select("validation_status, id")
      .eq("id", id_commande)
      .single();

    if (fetchError) throw fetchError;

    if (!commande.validation_status) {
      return {
        error: "Cette commande n'est pas validée",
        success: false,
      };
    }

    // Mettre à jour le statut de validation à false
    const { data, error } = await supabase
      .from("commande")
      .update({
        validation_status: false,
        validationPending: false,
        statut: "En attente",
        is_received_by_gp: true,
        mail_valideur: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id_commande)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data,
      message: "Commande dévalidée avec succès",
    };
  } catch (err) {
    console.error("Erreur lors de la dévalidation:", err);
    return {
      error: "Erreur lors de la dévalidation de la commande",
      success: false,
    };
  }
};
