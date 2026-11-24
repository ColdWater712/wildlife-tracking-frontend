import "leaflet/dist/leaflet.css";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/navigation/main";
import { getVerifiedSession } from "@/services/session.service";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getVerifiedSession();

  if (!session.ok) {
    redirect(`/login?reason=${session.reason}`);
  }

  return <AppShell user={session.user}>{children}</AppShell>;
}
