import { AiVisionUploadView } from "@/components/shared/ai/ai-vision-upload-view";
import { getSessionUser } from "@/lib/session";

export default async function AiVisionPage() {
  const user = await getSessionUser();

  return <AiVisionUploadView canVerify={user?.role === "peneliti_ekologi"} />;
}
