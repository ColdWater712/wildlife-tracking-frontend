import { getSessionUser } from "@/lib/session";
import { roleHasPermission } from "@/types/auth.type";

import SpeciesDetailContent from "./index";

export default async function WildlifeSpeciesPage() {
  const user = await getSessionUser();

  return <SpeciesDetailContent canManage={user ? roleHasPermission(user.role, "manage_master_data") : false} />;
}
