import { getSessionUser } from "@/lib/session";
import { roleHasPermission } from "@/types/auth.type";

import AiVisionUploadPage from "./index";

export default async function AiVisionPage() {
  const user = await getSessionUser();

  return (
    <AiVisionUploadPage
      canVerify={user ? roleHasPermission(user.role, "verify_ai") : false}
      canDelete={user ? roleHasPermission(user.role, "delete_data") : false}
    />
  );
}
