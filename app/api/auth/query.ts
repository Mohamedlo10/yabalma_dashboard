import { createClient } from "@/lib/supabaseClient";
import Cookies from "js-cookie";

const supabase = createClient();

export const userConnection = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    const current_access = data.session?.user.user_metadata.poste;
    if (data) {
      console.log(data);
      Cookies.set("user_session", JSON.stringify(data.user), { expires: 1 });
      Cookies.set(
        "supabase_session",
        JSON.stringify(data.user?.user_metadata.poste),
        {
          expires: 1,
        }
      );
    } else {
      console.error("Invalid identifiants");
    }

    return { data, error };
  } catch (err) {
    throw err;
  }
};

export const userDeConnection = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      document.cookie =
        "sb-pgrubovujiulezselost-auth-token=; Max-Age=0; path=/;";
      window.location.href = "/";
      Cookies.remove("supabase_session");
      Cookies.remove("user_session");
    } else {
      console.error("Erreur lors de la déconnexion", error);
    }
    return { error };
  } catch (err) {
    throw err;
  }
};

export const userInfo = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (
      !data.user ||
      !data.user.identities ||
      data.user.identities.length === 0
    ) {
      throw new Error("User or identities not found");
    }

    return data.user as any;
  } catch (err) {
    throw err;
  }
};

export const getRole = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (
      !data.user ||
      !data.user.identities ||
      data.user.identities.length === 0
    ) {
      throw new Error("User or identities not found");
    }

    return data.user.user_metadata.poste as any;
  } catch (err) {
    throw err;
  }
};

export const getAllUserInfo = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (
      !data.user ||
      !data.user.identities ||
      data.user.identities.length === 0
    ) {
      throw new Error("User or identities not found");
    }

    return data.user as any;
  } catch (err) {
    throw err;
  }
};
