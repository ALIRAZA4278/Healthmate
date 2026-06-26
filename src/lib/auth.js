import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

/**
 * Generate a JWT token for a user
 * @param {Object} payload - User data to encode in token
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  console.log('[AUTH] Generating token with JWT_SECRET length:', JWT_SECRET?.length);
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined!');
  }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  console.log('[AUTH] Token generated, first 50 chars:', token.substring(0, 50));
  return token;
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    console.log('[AUTH] Verifying token with JWT_SECRET length:', JWT_SECRET?.length);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[AUTH] Token verified successfully');
    return decoded;
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error.message);
    return null;
  }
}

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match
 */
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null if not found
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}
