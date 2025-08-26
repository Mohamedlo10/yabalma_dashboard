import { getSupabaseSession } from "@/lib/authMnager";
import { supabase } from "@/lib/supabaseAdmin";

/* export const getAllUsersAdmin = async () => {
    try {
      const { data: { users }, error } = await supabase.auth.admin.listUsers()

      
      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error.message);
      } else {
        console.log('Utilisateurs :', users);
      }
      return users as any;
    } catch (err) {
      throw err;
    }
  } */

export const getAllUsersAdmin = async () => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error(
        "Erreur lors de la récupération des utilisateurs :",
        error.message
      );
      return [];
    }

    const emailUsers = users.filter(
      (user) => user.app_metadata?.provider === "email"
    );

    console.log("Utilisateurs avec provider email :", emailUsers);

    return emailUsers as any;
  } catch (err) {
    console.error("Erreur lors de l'exécution de la fonction :", err);
    throw err;
  }
};

export const creerCompte = async (
  compte: Record<string, any>,
  myposte: any
) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: compte.email,
      password: compte.password,
      user_metadata: { poste: myposte },
    });

    if (error) {
      console.error("Erreur lors de l'inscription :", error);
    } else {
      console.log("Utilisateur créé :", data);
    }
    return data;
  } catch (err) {
    throw err;
  }
};

export const signUpCompte = async (
  compte: Record<string, any>,
  myposte: any
) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: compte.email,
      password: compte.password,
      options: {
        data: { poste: myposte, prenom: compte.prenom, nom: compte.nom },
      },
    });

    if (error) {
      console.error("Erreur lors de l'inscription :", error);
    } else {
      console.log("Utilisateur créé :", data);
    }
    return data;
  } catch (err) {
    throw err;
  }
};

export const getCompteById = async (idCompte: any) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }
  try {
    const { data, error } = await supabase.auth.admin.getUserById(idCompte);

    if (error) {
      console.error(
        "Erreur lors de la récupération de l'utilisateur :",
        error.message
      );
    }
    return data.user as any;
  } catch (err) {
    throw err;
  }
};

export const DeleteCompteById = async (idCompte: any) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }
  try {
    const { data, error } = await supabase.auth.admin.deleteUser(idCompte);

    if (error) {
      console.error(
        "Erreur lors de la suppression de l'utilisateur :",
        error.message
      );
    } else {
      console.log("Utilisateur :", data);
    }
    return data as any;
  } catch (err) {
    throw err;
  }
};

/*
 */

export const modifierCompte = async (
  idCompte: any,
  emailUP?: any,
  posteUP?: any,
  nom?: any,
  prenom?: any
) => {
  const role = getSupabaseSession();

  if (!role) {
    return { error: "Non autorisé - Session invalide", redirect: "/" };
  }

  try {
    const { data: user, error } = await supabase.auth.admin.updateUserById(
      idCompte,
      {
        email: emailUP,
        user_metadata: { poste: posteUP, nom: nom, prenom: prenom },
      }
    );

    if (error) {
      console.error(
        "Erreur lors de la mise à jour de l'utilisateur :",
        error.message
      );
      return null;
    }

    console.log("Utilisateur mis à jour :", user);
    return user.user;
  } catch (err) {
    console.error("Erreur inattendue :", err);
    throw err;
  }
};
