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

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
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
