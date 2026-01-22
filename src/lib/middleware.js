import { NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './auth';
import connectDB from './db';

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
      // Connect to database
      await connectDB();

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
 * Simple database connection wrapper for public routes
 * @param {Function} handler - The route handler function
 * @returns {Function} Wrapped handler with database connection
 */
export function withDB(handler) {
  return async (request, context) => {
    try {
      await connectDB();
      return handler(request, context);
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { success: false, message: 'Database connection error' },
        { status: 500 }
      );
    }
  };
}
