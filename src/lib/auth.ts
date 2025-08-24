import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface AdminUser {
  id: number;
  username: string;
  role: string;
}

interface JWTPayload {
  id: number;
  username: string;
  role: string;
}

export async function verifyAdminToken(request: NextRequest): Promise<AdminUser | null> {
  try {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'default-secret'
    ) as JWTPayload;

    return {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };

  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

type AdminHandler = (request: NextRequest, context: { params: Promise<Record<string, string>> }) => Promise<Response>;

export function requireAdmin(handler: AdminHandler) {
  return async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const admin = await verifyAdminToken(request);

    if (!admin) {
      return Response.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 });
    }

    // Add admin info to request
    (request as unknown as { admin: AdminUser }).admin = admin;

    return handler(request, context);
  };
}