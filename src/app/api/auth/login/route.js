import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[LOGIN] Attempting login for email:', email);

    // Validation
    if (!email || !password) {
      console.log('[LOGIN] Missing email or password');
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Login with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      console.log('[LOGIN] Authentication failed:', error.message);
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('[LOGIN] User authenticated:', email);

    // Get user profile, create if doesn't exist
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('[LOGIN] Creating profile for:', email);
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: email.toLowerCase(),
            name: email.split('@')[0],
          },
        ])
        .select()
        .single();

      if (createError) {
        console.log('[LOGIN] Profile creation error:', createError.message);
        profile = { id: data.user.id, email, name: email.split('@')[0] };
      } else {
        profile = newProfile;
      }
    } else if (profileError) {
      console.log('[LOGIN] Profile fetch error:', profileError.message);
      return NextResponse.json(
        { success: false, message: 'Failed to load user profile' },
        { status: 500 }
      );
    }

    console.log('[LOGIN] Login successful for:', email);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token: data.session.access_token,
      user: {
        id: data.user.id,
        name: profile?.name || '',
        email: data.user.email,
      },
    });
  } catch (error) {
    console.error('[LOGIN] Login error:', error.message, error);
    return NextResponse.json(
      { success: false, message: 'Server error during login' },
      { status: 500 }
    );
  }
}
