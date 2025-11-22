/** @format */

import { FilamentProfile } from "@/types/profile";

export function generateFilamentJson(profile: FilamentProfile): string {
	const json = {
		compatible_printers: [profile.printerName],
		filament_type: [profile.type],
		filament_vendor: [profile.brand],
		default_filament_colour: [profile.color],
		filament_cost: [profile.costPerKg.toString()],
		filament_flow_ratio: [profile.flowRatio.toString()],
		nozzle_temperature_initial_layer: [
			profile.initialNozzleTemp.toString(),
		],
		nozzle_temperature: [profile.nozzleTemp.toString()],
		bed_temperature_initial_layer: [profile.initialBedTemp.toString()],
		bed_temperature: [profile.bedTemp.toString()],
		filament_settings_id: [`${profile.brand} ${profile.type}`],
		from: "User",
		inherits: "Generic PLA", // Could be dynamic
		is_custom_defined: "1",
		name: `${profile.brand} ${profile.type}`,
		version: "1.0.0.0",
		filament_retraction_length: [profile.retractionLength.toString()],
		filament_z_hop: [profile.zhopHeight.toString()],
		filament_z_hop_types: [profile.zhopType],
	};

	return JSON.stringify(json, null, 2);
}
