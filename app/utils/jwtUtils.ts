import jwt from 'jsonwebtoken';

// Secret key for JWT signing - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';

// User interface matching your application's user model
interface User {
  id: string;
  email: string;
  isSubscribed?: boolean;
  subscriptionExpiryDate?: Date;
}

// Generate a JWT token for a user
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    isSubscribed: user.isSubscribed || false,
    subscriptionExpiryDate: user.subscriptionExpiryDate,
  };

  // Token expires in 7 days
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify and decode a JWT token
export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}