import { createClient } from "@/lib/supabaseClient";
import { getSupabaseSession } from "@/lib/authMnager";
import { DEFAULT_SENDER_ID } from "@/lib/constants";

const supabase = createClient();

// Types pour les messages et discussions
export interface Discussion {
  id: number;
  created_at: string;
  id_discussion: string;
  id_client: string;
  id_gp: string;
  nom_gp: string;
  nom_client: string;
  msg_count_client: number;
  msg_count_gp: number;
  lastMessageDate: string;
}

export interface Message {
  id: string;
  created_at: string;
  content: string;
  id_discussion: string;
  sender_id: string;
  file_type?: string;
  file_url?: string;
}

// Fonction utilitaire pour déterminer si un message vient du dashboard (DEFAULT_SENDER_ID)
export const isMessageFromDashboard = (message: Message): boolean => {
  return message.sender_id === DEFAULT_SENDER_ID;
};

// Fonction utilitaire pour déterminer si un message vient d'un client (sender_id différent de DEFAULT_SENDER_ID)
export const isMessageFromClient = (message: Message): boolean => {
  return message.sender_id !== DEFAULT_SENDER_ID;
};

// Fonction utilitaire pour obtenir le nom de l'expéditeur
export const getSenderName = (
  message: Message,
  discussion: Discussion
): string => {
  if (message.sender_id === DEFAULT_SENDER_ID) {
    // Si c'est DEFAULT_SENDER_ID, déterminer si c'est le client ou le GP selon la discussion
    return DEFAULT_SENDER_ID === discussion.id_client
      ? discussion.nom_client
      : discussion.nom_gp;
  } else {
    // Si ce n'est pas DEFAULT_SENDER_ID, c'est forcément un autre utilisateur (client)
    return message.sender_id === discussion.id_client
      ? discussion.nom_client
      : discussion.nom_gp;
  }
};

// Récupérer toutes les discussions pour un utilisateur
export const getDiscussions = async (): Promise<Discussion[]> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase
      .from("discussion")
      .select("*")
      .order("lastMessageDate", { ascending: false });

    if (error) throw error;

    console.log(`📬 ${data?.length || 0} discussions trouvées`);
    return data || [];
  } catch (err) {
    console.error("Erreur lors de la récupération des discussions:", err);
    throw err;
  }
};

export const uploadFileMessage = async (fileName: string, uploadFile: File) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }
  try {
    const { error } = await supabase.storage
      .from("yabalma/messages") // Assurez-vous que ce chemin est correct
      .upload(fileName, uploadFile);
    const { data } = supabase.storage
      .from("yabalma/messages")
      .getPublicUrl(fileName);
    if (error) throw error;
    console.log(data);
    return data;
  } catch (err) {
    throw err;
  }
};

// Récupérer les messages d'une discussion
export const getMessages = async (discussionId: string): Promise<Message[]> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase
      .from("message")
      .select("*")
      .eq("id_discussion", discussionId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    console.log(
      `💬 ${
        data?.length || 0
      } messages trouvés pour la discussion ${discussionId}`
    );
    return data || [];
  } catch (err) {
    console.error("Erreur lors de la récupération des messages:", err);
    throw err;
  }
};

// Créer une nouvelle discussion
export const createDiscussion = async (
  clientId: string,
  gpId: string,
  nomClient: string,
  nomGp: string
): Promise<Discussion> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase
      .from("discussion")
      .insert([
        {
          id_client: clientId,
          id_gp: gpId,
          nom_client: nomClient,
          nom_gp: nomGp,
          msg_count_client: 0,
          msg_count_gp: 0,
          lastMessageDate: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Discussion créée:`, data);
    return data;
  } catch (err) {
    console.error("Erreur lors de la création de la discussion:", err);
    throw err;
  }
};

// Envoyer un message
export const sendMessage = async (
  discussionId: string,
  content: string,
  fileType?: string,
  fileUrl?: string
): Promise<Message> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    // 1. Récupérer les infos de la discussion pour mettre à jour les compteurs
    const { data: discussion, error: discussionFetchError } = await supabase
      .from("discussion")
      .select("*")
      .eq("id_discussion", discussionId)
      .single();

    if (discussionFetchError) throw discussionFetchError;

    // 2. Insérer le message avec DEFAULT_SENDER_ID (toujours depuis le dashboard)
    const { data: message, error: messageError } = await supabase
      .from("message")
      .insert([
        {
          id_discussion: discussionId,
          sender_id: DEFAULT_SENDER_ID,
          content,
          file_type: fileType,
          file_url: fileUrl,
        },
      ])
      .select()
      .single();

    if (messageError) throw messageError;

    // 3. Déterminer quel compteur incrementer
    // Si DEFAULT_SENDER_ID = id_client alors c'est msg_count_client, sinon msg_count_gp
    const isClientMessage = DEFAULT_SENDER_ID === discussion.id_client;
    const updateField = isClientMessage ? "msg_count_client" : "msg_count_gp";
    const currentCount = isClientMessage
      ? discussion.msg_count_client
      : discussion.msg_count_gp;

    const { error: updateError } = await supabase
      .from("discussion")
      .update({
        [updateField]: currentCount + 1,
        lastMessageDate: new Date().toISOString(),
      })
      .eq("id_discussion", discussionId);

    if (updateError) throw updateError;

    console.log(
      `✅ Message envoyé dans la discussion ${discussionId} par ${DEFAULT_SENDER_ID}`
    );
    return message;
  } catch (err) {
    console.error("Erreur lors de l'envoi du message:", err);
    throw err;
  }
};

// Marquer les messages comme lus (optionnel pour plus tard)
export const markMessagesAsRead = async (
  discussionId: string,
  userId: string
): Promise<void> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    // Cette fonction peut être étendue plus tard pour gérer le statut "lu"
    console.log(
      `📖 Messages marqués comme lus pour ${userId} dans ${discussionId}`
    );
  } catch (err) {
    console.error("Erreur lors du marquage des messages comme lus:", err);
    throw err;
  }
};

// Rechercher des discussions par nom
export const searchDiscussions = async (
  userId: string,
  searchTerm: string
): Promise<Discussion[]> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase
      .from("discussion")
      .select("*")
      .or(`id_client.eq.${userId},id_gp.eq.${userId}`)
      .or(`nom_client.ilike.%${searchTerm}%,nom_gp.ilike.%${searchTerm}%`)
      .order("lastMessageDate", { ascending: false });

    if (error) throw error;

    console.log(
      `🔍 ${data?.length || 0} discussions trouvées pour "${searchTerm}"`
    );
    return data || [];
  } catch (err) {
    console.error("Erreur lors de la recherche de discussions:", err);
    throw err;
  }
};

// Obtenir une discussion par ID
export const getDiscussionById = async (
  discussionId: string
): Promise<Discussion | null> => {
  const session = await getSupabaseSession();

  if (!session) {
    throw new Error("Non autorisé - Session invalide");
  }

  try {
    const { data, error } = await supabase
      .from("discussion")
      .select("*")
      .eq("id_discussion", discussionId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned

    return data || null;
  } catch (err) {
    console.error("Erreur lors de la récupération de la discussion:", err);
    throw err;
  }
};
