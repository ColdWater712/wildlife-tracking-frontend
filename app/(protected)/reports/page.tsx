import { getSessionUser } from "@/lib/session";
import { roleHasPermission } from "@/types/auth.type";

import AggregateReportsContent from "./index";

export default async function AggregateReportsPage() {
  const user = await getSessionUser();

  return (
    <AggregateReportsContent
      canDelete={user ? roleHasPermission(user.role, "delete_data") : false}
    />
  );
}
