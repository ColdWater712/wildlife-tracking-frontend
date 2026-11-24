import DashboardPage from "./index";
import { getSessionUser } from "@/lib/session";

export default async function DashboardRoute() {
  const user = await getSessionUser();

  return <DashboardPage role={user?.role ?? "konservasionis_lapangan"} />;
}
