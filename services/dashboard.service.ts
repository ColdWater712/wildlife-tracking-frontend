import { ANIMAL_SERVICE } from "@/services/animal.service";
import { SPECIES_SERVICE } from "@/services/species.service";
import {
  getDeviceAlerts,
  getTrackingDevices,
} from "@/services/device.service";
import { getGpsReadings } from "@/services/tracking.service";
import { getUnreadNotifications } from "@/services/notification.service";
import { getIncidentReports } from "@/services/incident.service";
import type { DashboardSummary } from "@/types/dashboard.type";
import type { TYPE_ANIMAL } from "@/types/animal.type";
import type { TYPE_SPECIES } from "@/types/species.type";
import type { ApiResponse } from "@/types/api.type";
import { unwrapData } from "@/services/api";
import type { TrackingDevice } from "@/types/device.type";

const MAX_RECENT_ITEMS = 5;
const LOW_BATTERY_PERCENT = 25;

const isActiveFlag = (
  value: boolean | number | null | undefined,
): boolean => value === true || value === 1;

const fetchAnimals = async (): Promise<TYPE_ANIMAL[]> => {
  const response = await ANIMAL_SERVICE.GET_ALL({
    page: 1,
    per_page: 100,
  });

  return response.data.items;
};

const fetchSpecies = async (): Promise<TYPE_SPECIES[]> => {
  const response = await SPECIES_SERVICE.GET_ALL({
    page: 1,
    per_page: 100,
  });

  return response.data.items;
};

export const getDashboardSummary = async (): Promise<
  ApiResponse<DashboardSummary>
> => {
  const [
    animals,
    species,
    devicesResponse,
    readingsResponse,
    notificationsResponse,
    incidentReportsResponse,
  ] = await Promise.all([
    fetchAnimals(),
    fetchSpecies(),
    getTrackingDevices(),
    getGpsReadings(),
    getUnreadNotifications(),
    getIncidentReports(),
  ]);

  const devices = unwrapData(devicesResponse);
  const readings = unwrapData(readingsResponse);
  const notifications = unwrapData(notificationsResponse);
  const incidentReports = unwrapData(incidentReportsResponse);
  const alerts = unwrapData(await getDeviceAlerts());

  return {
    success: true,
    message: "OK",
    data: {
      totalAnimals: animals.length,
      activeAnimals: animals.filter((animal) =>
        isActiveFlag(animal.is_active),
      ).length,
      totalSpecies: species.length,
      totalDevices: devices.filter((device: TrackingDevice) =>
        isActiveFlag(device.is_active),
      ).length,
      lowBatteryDevices: devices.filter(
        (device: TrackingDevice) =>
          device.battery_level !== null &&
          device.battery_level < LOW_BATTERY_PERCENT,
      ).length,
      deviceAlerts: alerts,
      totalReadings: readings.length,
      latestReadings: readings
        .slice(0, MAX_RECENT_ITEMS)
        .map((reading) => {
          const device = devices.find(
            (item) => item.device_id === reading.device_id,
          );

          return {
            ...reading,
            trackingDevice: device
              ? {
                  device_id: device.device_id,
                  model: device.model,
                  animal: device.animal
                    ? {
                        animal_id: device.animal.animal_id,
                        name: device.animal.animal_code,
                      }
                    : null,
                }
              : null,
          };
        }),
      latestNotifications: notifications.slice(0, MAX_RECENT_ITEMS),
      latestIncidentReports: incidentReports
        .slice()
        .sort(
          (left, right) =>
            new Date(right.timestamp).getTime() -
            new Date(left.timestamp).getTime(),
        )
        .slice(0, MAX_RECENT_ITEMS),
      degradedSources: [],
    },
  };
};