import { auth } from "./auth";

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.email) return false;

  const adminEmails = process.env.ADMIN_EMAIL?.split(",").map(e => e.trim()) || [];
  return adminEmails.includes(session.user.email);
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
