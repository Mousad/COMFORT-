
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { scryptSync, timingSafeEqual } from "crypto";

import { prisma } from "@/lib/prisma";
import {
  createAdminSession,
  COOKIE_NAME,
} from "@/lib/admin-auth";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 أيام

function verifyPassword(password: string, storedHash: string) {
  try {
    const [salt, key] = storedHash.split(":");

    if (!salt || !key) {
      return false;
    }

    const derivedKey = scryptSync(password, salt, 64);
    const storedKey = Buffer.from(key, "hex");

    if (storedKey.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(storedKey, derivedKey);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        },
        { status: 401 }
      );
    }

    const passwordValid = verifyPassword(
      password,
      admin.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        },
        { status: 401 }
      );
    }

    // إنشاء جلسة الأدمن
    const session = createAdminSession(admin.id);

    // حفظ الجلسة في Cookie
    const cookieStore = await cookies();

    cookieStore.set({
      name: COOKIE_NAME,
      value: session,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION,
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تسجيل الدخول",
      },
      { status: 500 }
    );
  }
}