import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            conversations: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // PENDINGを上に
        { createdAt: "desc" },
      ],
    });

    return Response.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
