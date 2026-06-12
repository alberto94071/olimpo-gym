import ClientLayout from "./ClientLayout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return <ClientLayout user={session.user}>{children}</ClientLayout>;
}
