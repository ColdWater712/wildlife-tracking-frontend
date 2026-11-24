import { getSessionUser } from "@/lib/session";

import AiVisionUploadPage from "./index";

export default async function AiVisionPage() {
  const user = await getSessionUser();

  return <AiVisionUploadPage canVerify={user?.role === "peneliti_ekologi"} />;
}
