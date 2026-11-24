import { getSessionUser } from "@/lib/session";
import { roleHasPermission } from "@/types/auth.type";

import WeatherContent from "./index";

export default async function WeatherPage() {
  const user = await getSessionUser();

  return <WeatherContent canSync={user ? roleHasPermission(user.role, "create_data") : false} />;
}
