import { NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './auth';

/**
 * Wrapper function for protected API routes
 * Validates JWT token and attaches user to the request
 *
 * @param {Function} handler - The route handler function
 * @returns {Function} Wrapped handler with authentication
 */
export function withAuth(handler) {
  return async (request, context) => {
    try {
      // Get authorization header
      const authHeader = request.headers.get('authorization');
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Access denied. No token provided.' },
          { status: 401 }
        );
      }

      // Verify token
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired token.' },
          { status: 401 }
        );
      }

      // Attach user info to request for use in handlers
      request.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      };

      // Call the actual handler
      return handler(request, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
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
      console.error('Handler error:', error);
      return NextResponse.json(
        { success: false, message: 'Request error' },
        { status: 500 }
      );
    }
  };
}
