import { getSessionUser } from "@/lib/session";
import { roleHasPermission } from "@/types/auth.type";

import ZoneVisitsContent from "./index";

export default async function ZoneVisitsPage() {
  const user = await getSessionUser();

  return <ZoneVisitsContent canWrite={user ? roleHasPermission(user.role, "create_data") : false} />;
}
