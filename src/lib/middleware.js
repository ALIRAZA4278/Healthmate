import { NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase';

/**
 * Wrapper function for protected API routes
 * Validates Supabase token and attaches user to the request
 *
 * @param {Function} handler - The route handler function
 * @returns {Function} Wrapped handler with authentication
 */
export function withAuth(handler) {
  return async (request, context) => {
    try {
      // Get authorization header
      const authHeader = request.headers.get('authorization');
      console.log('[MIDDLEWARE] Auth header present:', !!authHeader);

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[MIDDLEWARE] No valid Bearer token');
        return NextResponse.json(
          { success: false, message: 'Access denied. No token provided.' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);

      // Verify token with Supabase
      const { data, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !data.user) {
        console.log('[MIDDLEWARE] Token verification failed:', error?.message);
        return NextResponse.json(
          { success: false, message: 'Invalid or expired token.' },
          { status: 401 }
        );
      }

      console.log('[MIDDLEWARE] Token verified for user:', data.user.email);

      // Attach user info to request for use in handlers
      request.user = {
        userId: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || '',
      };

      // Call the actual handler
      return handler(request, context);
    } catch (error) {
      console.error('[MIDDLEWARE] Auth error:', error.message);
      return NextResponse.json(
        { success: false, message: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Simple wrapper for public routes (no auth required)
 * @param {Function} handler - The route handler function
 * @returns {Function} Wrapped handler
 */
export function withPublic(handler) {
  return async (request, context) => {
    try {
      return handler(request, context);
    } catch (error) {
      console.error('[HANDLER] Error:', error.message);
      return NextResponse.json(
        { success: false, message: 'Request error' },
        { status: 500 }
      );
    }
  };
}
