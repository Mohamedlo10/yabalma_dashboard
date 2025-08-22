import { createClient } from "@/lib/supabaseClient";
import { getSupabaseSession } from "@/lib/authMnager";

const supabase = createClient();

// Fonction utilitaire pour extraire la devise d'une commande
export const extractCurrencyFromCommande = (commande: any): string => {
  let currency = "XOF"; // Devise par défaut

  try {
    // Priorité 1: Chercher dans les articles
    if (
      commande.detail_commande?.articles &&
      Array.isArray(commande.detail_commande.articles)
    ) {
      for (const article of commande.detail_commande.articles) {
        if (article.currency && typeof article.currency === "string") {
          currency = article.currency;
          break; // Prendre la première devise trouvée
        }
      }
    }

    // Priorité 2: Si pas trouvé dans les articles, chercher d'autres endroits
    // (à étendre selon la structure de vos données)

    // Normaliser les devises communes selon ce qui est stocké dans la base de données
    if (currency === "€" || currency === "EUR" || currency === "EURO") {
      currency = "Euro"; // Correspond à votre table settings
    } else if (
      currency === "$" ||
      currency === "USD" ||
      currency === "DOLLAR"
    ) {
      currency = "Dollar"; // Si vous en avez un dans votre base
    }

    console.log(
      `💱 Devise extraite de la commande ${commande.id}: ${currency}`
    );
    return currency;
  } catch (error) {
    console.warn(
      `⚠️ Erreur lors de l'extraction de la devise, utilisation de XOF par défaut:`,
      error
    );
    return "XOF";
  }
};

// Fonction utilitaire pour extraire le montant d'une commande
export const extractAmountFromCommande = (commande: any): number => {
  try {
    // Priorité 1: total_price
    if (commande.total_price) {
      const amount = parseFloat(commande.total_price);
      if (!isNaN(amount) && amount > 0) {
        console.log(`💰 Montant extrait du total_price: ${amount}`);
        return amount;
      }
    }

    // Priorité 2: Calculer depuis les articles
    if (
      commande.detail_commande?.articles &&
      Array.isArray(commande.detail_commande.articles)
    ) {
      let totalFromArticles = 0;
      for (const article of commande.detail_commande.articles) {
        if (article.totalPrice && typeof article.totalPrice === "number") {
          totalFromArticles += article.totalPrice;
        } else if (article.price && article.quantity) {
          totalFromArticles += article.price * article.quantity;
        }
      }

      if (totalFromArticles > 0) {
        console.log(
          `💰 Montant calculé depuis les articles: ${totalFromArticles}`
        );
        return totalFromArticles;
      }
    }

    console.warn(
      `⚠️ Aucun montant valide trouvé pour la commande ${commande.id}`
    );
    return 0;
  } catch (error) {
    console.warn(`⚠️ Erreur lors de l'extraction du montant:`, error);
    return 0;
  }
};

// Fonction pour convertir un montant selon le taux de change
export const convertCurrency = async (
  amount: number,
  fromCurrency: string
): Promise<number> => {
  const role = getSupabaseSession();

  if (!role) {
    throw new Error("Non autorisé - Session invalide");
  }

  // Si c'est déjà en XOF, pas de conversion nécessaire
  if (fromCurrency === "XOF" || fromCurrency === "FCFA") {
    console.log(`💱 Pas de conversion nécessaire: ${amount} ${fromCurrency}`);
    return amount;
  }

  try {
    // Récupérer le taux de change depuis la table settings
    const { data: currencyData, error } = await supabase
      .from("settings")
      .select("value")
      .eq("currency", fromCurrency)
      .single();

    if (error) {
      console.warn(
        `Taux de change non trouvé pour ${fromCurrency}, utilisation du montant original`
      );
      return amount; // Si pas de taux trouvé, retourner le montant original
    }

    if (!currencyData || !currencyData.value) {
      console.warn(
        `Valeur de taux invalide pour ${fromCurrency}, utilisation du montant original`
      );
      return amount;
    }

    const exchangeRate = parseFloat(currencyData.value);

    // La logique de conversion dépend de comment les taux sont stockés
    // Si le taux représente : 1 unité de fromCurrency = X XOF
    // Alors : montant_xof = montant_devise * taux
    let convertedAmount;

    // Vérification de la cohérence du taux (éviter les taux aberrants)
    if (exchangeRate <= 0) {
      console.warn(
        `⚠️ Taux de change invalide (${exchangeRate}) pour ${fromCurrency}`
      );
      return amount;
    }

    // Pour Euro, selon votre configuration actuelle (value: 100)
    // Note: 100 semble bas pour EUR->XOF, mais on utilise votre configuration
    if (fromCurrency === "Euro" && exchangeRate < 50) {
      console.warn(
        `⚠️ Taux Euro très bas: ${exchangeRate}. Vérifiez la configuration.`
      );
    }

    // Conversion : montant en devise étrangère × taux = montant en XOF
    convertedAmount = amount * exchangeRate;

    console.log(
      `💱 Conversion: ${amount} ${fromCurrency} × ${exchangeRate} = ${convertedAmount} XOF`
    );

    return Math.round(convertedAmount); // Arrondir au centime le plus proche
  } catch (err) {
    console.error("Erreur lors de la conversion de devise:", err);
    return amount; // En cas d'erreur, retourner le montant original
  }
};

// Fonction alternative si les taux sont stockés dans l'autre sens (1 XOF = X devise étrangère)
export const convertCurrencyReverse = async (
  amount: number,
  fromCurrency: string
): Promise<number> => {
  const role = getSupabaseSession();

  if (!role) {
    throw new Error("Non autorisé - Session invalide");
  }

  // Si c'est déjà en XOF, pas de conversion nécessaire
  if (fromCurrency === "XOF" || fromCurrency === "FCFA") {
    return amount;
  }

  try {
    const { data: currencyData, error } = await supabase
      .from("settings")
      .select("value")
      .eq("currency", fromCurrency)
      .single();

    if (error || !currencyData || !currencyData.value) {
      console.warn(`Impossible de récupérer le taux pour ${fromCurrency}`);
      return amount;
    }

    const exchangeRate = parseFloat(currencyData.value);

    if (exchangeRate <= 0) {
      console.warn(`Taux invalide: ${exchangeRate}`);
      return amount;
    }

    // Conversion inverse : montant en devise étrangère ÷ taux = montant en XOF
    // (Si le taux représente : 1 XOF = X devise étrangère)
    const convertedAmount = amount / exchangeRate;

    console.log(
      `💱 Conversion inverse: ${amount} ${fromCurrency} ÷ ${exchangeRate} = ${convertedAmount} XOF`
    );

    return Math.round(convertedAmount);
  } catch (err) {
    console.error("Erreur lors de la conversion inverse:", err);
    return amount;
  }
};

// Fonction pour générer un ID de transaction unique
export const generateTransactionId = (): string => {
  const timestamp = Date.now();
  return `TRX-${timestamp}`;
};

// Fonction pour créer une transaction de validation
export const createValidationTransaction = async (
  orderId: number,
  userId: string,
  walletId: string,
  amount: bigint,
  originalCurrency?: string
): Promise<any> => {
  const role = getSupabaseSession();

  if (!role) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const transactionId = generateTransactionId();
    const currentTime = new Date();

    // Extraire seulement l'heure pour le champ payment_date (type time with time zone)
    const timeOnly = currentTime.toTimeString().split(" ")[0]; // Format HH:MM:SS
    const timezoneOffset = currentTime.getTimezoneOffset();
    const timezoneSign = timezoneOffset <= 0 ? "+" : "-";
    const timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60)
      .toString()
      .padStart(2, "0");
    const timezoneMinutes = (Math.abs(timezoneOffset) % 60)
      .toString()
      .padStart(2, "0");
    const timeWithTz = `${timeOnly}${timezoneSign}${timezoneHours}:${timezoneMinutes}`;

    console.log(`💰 Création transaction de validation:`, {
      orderId,
      userId,
      walletId,
      amount: amount.toString(),
      transactionId,
      paymentTime: timeWithTz,
      originalCurrency,
    });

    // Créer la transaction dans payment_info
    const { data: transaction, error: transactionError } = await supabase
      .from("payment_info")
      .insert([
        {
          order_id: orderId,
          method: "wallet",
          amount: amount.toString(), // Stocker comme string pour les gros nombres
          transaction_id: transactionId,
          status: "pending",
          payment_date: timeWithTz, // Maintenant au bon format pour time with time zone
          bulk_payment: false,
          wallet_id: walletId,
          user_id_perform: userId,
          details: null,
          preuve_url: null,
          operation: "validation",
          type: "debit", // Débit du compte du validateur
        },
      ])
      .select()
      .single();

    if (transactionError) throw transactionError;

    console.log(`✅ Transaction créée avec succès:`, transaction);
    return transaction;
  } catch (err) {
    console.error(
      "Erreur lors de la création de la transaction de validation:",
      err
    );
    throw err;
  }
};

// Fonction pour débiter le portefeuille du validateur
export const debitValidatorWallet = async (
  walletId: string,
  amount: bigint
): Promise<any> => {
  const role = getSupabaseSession();

  if (!role) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    console.log(`💳 Débit du portefeuille ${walletId} de ${amount.toString()}`);

    // Récupérer le solde actuel
    const { data: wallet, error: fetchError } = await supabase
      .from("wallets")
      .select("balance, user_id")
      .eq("id", walletId)
      .single();

    if (fetchError) throw fetchError;
    if (!wallet) throw new Error("Portefeuille non trouvé");

    const currentBalance = BigInt(wallet.balance);

    // Vérifier que le solde est suffisant
    if (currentBalance < amount) {
      throw new Error(
        `Solde insuffisant. Solde actuel: ${currentBalance.toString()}, Montant requis: ${amount.toString()}`
      );
    }

    // Calculer le nouveau solde
    const newBalance = currentBalance - amount;

    // Mettre à jour le solde
    const { data: updatedWallet, error: updateError } = await supabase
      .from("wallets")
      .update({
        balance: newBalance.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", walletId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log(
      `✅ Portefeuille débité. Nouveau solde: ${newBalance.toString()}`
    );
    return updatedWallet;
  } catch (err) {
    console.error("Erreur lors du débit du portefeuille:", err);
    throw err;
  }
};

// Fonction principale pour traiter le paiement de validation
export const processValidationPayment = async (
  orderId: number,
  userId: string,
  walletId: string,
  commandeAmount: number,
  commandeCurrency: string = "XOF"
): Promise<{ transaction: any; wallet: any }> => {
  const role = getSupabaseSession();

  if (!role) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    console.log(`🏦 Début du traitement de paiement de validation:`, {
      orderId,
      userId,
      walletId,
      commandeAmount,
      commandeCurrency,
    });

    // 1. Convertir le montant si nécessaire
    let convertedAmount = commandeAmount;
    if (commandeCurrency && commandeCurrency !== "XOF") {
      convertedAmount = await convertCurrency(commandeAmount, commandeCurrency);
    }

    // Convertir en bigint pour les calculs précis
    const amountBigInt = BigInt(Math.round(convertedAmount));

    // 2. Créer la transaction
    const transaction = await createValidationTransaction(
      orderId,
      userId,
      walletId,
      amountBigInt,
      commandeCurrency
    );

    // 3. Débiter le portefeuille
    const updatedWallet = await debitValidatorWallet(walletId, amountBigInt);

    // 4. Mettre à jour le statut de la transaction à 'confirmed'
    const { error: updateTransactionError } = await supabase
      .from("payment_info")
      .update({ status: "completed" })
      .eq("id", transaction.id);

    if (updateTransactionError) {
      console.error(
        "Erreur lors de la mise à jour du statut de transaction:",
        updateTransactionError
      );
      // Ne pas faire échouer l'opération pour cette erreur non critique
    }

    console.log(`🎉 Paiement de validation traité avec succès!`);

    return {
      transaction,
      wallet: updatedWallet,
    };
  } catch (err) {
    console.error("Erreur lors du traitement du paiement de validation:", err);
    throw err;
  }
};
