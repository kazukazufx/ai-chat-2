import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { UserStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // ステータスの検証
    if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return Response.json(
        { error: "無効なステータスです" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return Response.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: status as UserStatus },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    return Response.json(updatedUser);
  } catch (error) {
    console.error("Update user status error:", error);
    return Response.json({ error: "ステータスの更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const session = await auth();

    // Prevent self-deletion
    if (session?.user?.id === id) {
      return Response.json(
        { error: "自分自身は削除できません" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user (conversations will be cascade deleted)
    await prisma.user.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
