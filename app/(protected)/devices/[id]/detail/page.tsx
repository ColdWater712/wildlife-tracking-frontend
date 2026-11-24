import { getSessionUser } from "@/lib/session";
import { roleHasPermission } from "@/types/auth.type";

import DeviceDetailContent from "./index";

export default async function DeviceDetailPage() {
  const user = await getSessionUser();

  return (
    <DeviceDetailContent
      canManage={user ? roleHasPermission(user.role, "manage_master_data") : false}
      canWrite={user ? roleHasPermission(user.role, "create_data") : false}
    />
  );
}
