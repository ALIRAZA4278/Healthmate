import { supabaseAdmin } from './supabase';

export async function registerUser(email, password, name) {
  try {
    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      throw error;
    }

    // Store additional user info in profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          email,
          name,
        },
      ]);

    if (profileError) {
      throw profileError;
    }

    return { success: true, userId: data.user.id };
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
}

export async function loginUser(email, password) {
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || '',
      },
      session: data.session,
    };
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
}
