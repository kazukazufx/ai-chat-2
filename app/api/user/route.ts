import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return Response.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return Response.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    const updateData: { name?: string; hashedPassword?: string } = {};

    // Update name if provided
    if (name !== undefined) {
      updateData.name = name;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return Response.json(
          { error: "現在のパスワードを入力してください" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return Response.json(
          { error: "新しいパスワードは6文字以上にしてください" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.hashedPassword);

      if (!isValid) {
        return Response.json(
          { error: "現在のパスワードが正しくありません" },
          { status: 400 }
        );
      }

      updateData.hashedPassword = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: "更新するデータがありません" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return Response.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}
