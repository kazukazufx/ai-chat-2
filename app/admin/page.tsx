import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { AdminPanel } from "./AdminPanel";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  return <AdminPanel />;
}
