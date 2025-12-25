import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserStatus } from "@prisma/client";

function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAIL?.split(",").map((e) => e.trim().toLowerCase()) || [];
  return adminEmails.includes(email.toLowerCase());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "メールアドレスとパスワードは必須です" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "パスワードは6文字以上にしてください" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // 管理者メールアドレスは即時承認、その他は承認待ち
    const status: UserStatus = isAdminEmail(email) ? "APPROVED" : "PENDING";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        status,
      },
    });

    return Response.json({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      { error: "アカウント作成に失敗しました" },
      { status: 500 }
    );
  }
}
