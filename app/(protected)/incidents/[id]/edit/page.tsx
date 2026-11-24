import { getSessionUser } from "@/lib/session";
import { roleHasPermission } from "@/types/auth.type";

import IncidentEditContent from "./index";

export default async function IncidentEditPage() {
  const user = await getSessionUser();

  return (
    <IncidentEditContent
      canUpload={user ? roleHasPermission(user.role, "create_data") : false}
      canSync={user ? roleHasPermission(user.role, "delete_data") : false}
    />
  );
}
