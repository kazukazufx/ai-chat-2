import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";

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
