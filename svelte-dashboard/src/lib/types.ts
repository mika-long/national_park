export interface VisitData {
	year: number;
	month: number;
	visitors: number;
	parkname: string;
	unitcode: string;
}

export interface ParkProperties {
	Name: string;
	Code: string;
	State: string;
}

export interface ParkFeature {
	type: 'Feature';
	geometry: {
		type: 'Point';
		coordinates: [number, number]; // [longitude, latitude]
	};
	properties: ParkProperties;
}

export interface ParkGeoJSON {
	type: 'FeatureCollection';
	features: ParkFeature[];
}

export interface MapRegion {
	id: string;
	name: string;
	center: [number, number]; // [latitude, longitude]
	zoom: number;
}
