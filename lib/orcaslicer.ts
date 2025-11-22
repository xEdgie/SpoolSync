import { FilamentProfile } from "@/types/profile";

export function generateFilamentJson(profile: FilamentProfile): string {
  const json = {
    "filament_type": [
      profile.type
    ],
    "filament_vendor": [
      profile.brand
    ],
    "filament_color": [
      profile.color
    ],
    "filament_cost": [
      profile.costPerKg.toString()
    ],
    "filament_flow_ratio": [
      profile.flowRatio.toString()
    ],
    "filament_settings_id": [
      `${profile.brand} ${profile.type}`
    ],
    "from": "User",
    "inherits": "Generic PLA", // Could be dynamic
    "is_custom": true,
    "name": `${profile.brand} ${profile.type}`,
    "version": "1.0.0"
  };

  return JSON.stringify(json, null, 2);
}
