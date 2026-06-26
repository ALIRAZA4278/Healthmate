import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    console.log('[REGISTER] Attempting registration for:', email);

    // Validation
    if (!name || !email || !password) {
      console.log('[REGISTER] Missing required fields');
      return NextResponse.json(
        { success: false, message: 'Please provide name, email, and password' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
    });

    if (error) {
      console.log('[REGISTER] User creation error:', error.message);

      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { success: false, message: 'User with this email already exists' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    // Store additional user info in profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          email: email.toLowerCase().trim(),
          name: name.trim(),
          created_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      console.log('[REGISTER] Profile creation error:', profileError.message);
      return NextResponse.json(
        { success: false, message: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    console.log('[REGISTER] Registration successful for:', email);

    // Create a session for the newly registered user
    const { data: sessionData } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        token: sessionData?.session?.access_token || '',
        user: {
          id: data.user.id,
          name: name.trim(),
          email: data.user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER] Registration error:', error.message, error);
    return NextResponse.json(
      { success: false, message: 'Server error during registration' },
      { status: 500 }
    );
  }
}
