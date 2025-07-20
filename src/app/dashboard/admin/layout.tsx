import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  const isAdmin = await api.users.isAdmin();
  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      {children}
    </div>
  );
} 