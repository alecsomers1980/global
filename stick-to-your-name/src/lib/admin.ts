import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getAdminByEmail, type AdminRow } from './db';

const COOKIE_NAME = 'stick_admin';
const JWT_ALG = 'HS256';

function secret() {
  const token = process.env.ADMIN_SESSION_SECRET || 'dev-secret-change-me';
  return new TextEncoder().encode(token);
}

export async function createSessionCookie(adminId: string, remember: boolean) {
  const jwt = await new SignJWT({ role: 'admin', sub: adminId })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(remember ? '30d' : '7d')
    .sign(secret());

  const c = await cookies();
  c.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  });
}

export async function verifyAdminLogin(email: string, password: string): Promise<AdminRow | null> {
  const admin = await getAdminByEmail(email);
  if (!admin) return null;
  const match = await bcrypt.compare(password, admin.password_hash);
  return match ? admin : null;
}

export async function getSessionAdminId(): Promise<string | null> {
  const c = await cookies();
  const cookie = c.get(COOKIE_NAME);
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie.value, secret());
    return payload.sub as string;
  } catch {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  return (await getSessionAdminId()) !== null;
}

export async function requireAdmin(): Promise<string | null> {
  return getSessionAdminId();
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}