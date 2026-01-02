import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SWRProvider } from "@/lib/swr-config";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return <SWRProvider>{children}</SWRProvider>;
}
