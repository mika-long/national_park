import * as d3 from 'd3';
import type { ParkGeoJSON, VisitData, ParkFeature } from './types';

export async function loadParkData(): Promise<ParkGeoJSON> {
	const response = await fetch('/data/national-parks.geojson');
	return response.json();
}

export async function loadVisitData(): Promise<VisitData[]> {
	const data = await d3.csv('/data/visit_data.csv');
	return data.map((d) => ({
		year: +d.Year!,
		month: +d.Month!,
		visitors: +d.RecreationVisits!,
		parkname: d.ParkName!,
		unitcode: d.UnitCode!
	}));
}

export function filterNationalParks(parkData: ParkGeoJSON): ParkFeature[] {
	return parkData.features.filter((feature) =>
		feature.properties.Name.toLowerCase().includes('national park')
	);
}

export function filterParksByRegion(parks: ParkFeature[], regionId: string): ParkFeature[] {
	return parks.filter((feature) => {
		const [lng, lat] = feature.geometry.coordinates;

		if (regionId === 'usa') {
			return lng > -130 && lng < -65 && lat > 24 && lat < 49;
		} else if (regionId === 'hawaii') {
			return lng < -154 && lat < 25;
		} else if (regionId === 'alaska') {
			return lat > 50;
		}
		return false;
	});
}

export function getVisitDataForPark(
	visitData: VisitData[],
	parkCode: string
): VisitData[] {
	return visitData.filter((d) => d.unitcode === parkCode);
}
