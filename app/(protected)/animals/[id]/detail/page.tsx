import { getSessionUser } from "@/lib/session";
import { roleHasPermission } from "@/types/auth.type";

import AnimalDetailContent from "./index";

export default async function AnimalDetailPage() {
  const user = await getSessionUser();

  return (
    <AnimalDetailContent
      canManage={user ? roleHasPermission(user.role, "manage_master_data") : false}
    />
  );
}
