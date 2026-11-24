import { getSessionUser } from "@/lib/session";
import { roleHasPermission } from "@/types/auth.type";

import AiMediaUploadsPage from "./index";

export default async function AiMediaPage() {
  const user = await getSessionUser();

  return (
    <AiMediaUploadsPage
      canAnalyze={user ? roleHasPermission(user.role, "upload_media") : false}
      canDelete={user ? roleHasPermission(user.role, "delete_data") : false}
    />
  );
}
