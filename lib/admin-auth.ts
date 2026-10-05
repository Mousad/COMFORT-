import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "admin_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 أيام

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET غير موجود في ملف .env");
  }

  return secret;
}

function createSignature(value: string) {
  return createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");
}

export function createAdminSession(adminId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION;

  const payload = `${adminId}.${expiresAt}`;
  const signature = createSignature(payload);

  return `${payload}.${signature}`;
}

export function verifyAdminSession(session: string | undefined) {
  if (!session) return null;

  const parts = session.split(".");

  if (parts.length !== 3) return null;

  const [adminId, expiresAtString, signature] = parts;

  const expiresAt = Number(expiresAtString);

  if (!adminId || !expiresAt || !signature) {
    return null;
  }

  if (Date.now() / 1000 > expiresAt) {
    return null;
  }

  const payload = `${adminId}.${expiresAt}`;
  const expectedSignature = createSignature(payload);

  try {
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return {
    adminId,
    expiresAt,
  };
}

export async function getAdminSession() {
  const cookieStore = await cookies();

  const session = cookieStore.get(COOKIE_NAME)?.value;

  return verifyAdminSession(session);
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const admin = await prisma.admin.findUnique({
    where: {
      id: session.adminId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
    },
  });

  if (!admin || !admin.isActive) {
    const cookieStore = await cookies();

    cookieStore.set({
      name: COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    redirect("/admin/login");
  }

  return {
    ...session,
    admin,
  };
}

export { COOKIE_NAME };