import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

export const userConnection = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (err) {
    throw err;
  }
};



export const userInfo = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (!data.user || !data.user.identities || data.user.identities.length === 0) {
        throw new Error('User or identities not found');
    }

    return data.user.identities[0] as any;
    } catch (err) {
        throw err;
    }

};