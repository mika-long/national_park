<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type { ParkFeature } from '$lib/types';

	interface Props {
		center: [number, number];
		zoom: number;
		parks: ParkFeature[];
		onParkClick?: (park: ParkFeature) => void;
	}

	let { center, zoom, parks, onParkClick }: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map | null = null;
	const markers: maplibregl.Marker[] = [];

	onMount(() => {
		console.log('MapView onMount - container:', mapContainer);
		console.log('MapView onMount - parks:', parks.length);
		console.log('MapView onMount - center:', center, 'zoom:', zoom);

		try {
			map = new maplibregl.Map({
				container: mapContainer,
				style: 'https://demotiles.maplibre.org/style.json', // Free tile style
				center: [center[1], center[0]], // MapLibre uses [lng, lat]
				zoom: zoom
			});

			console.log('Map created successfully:', map);

			map.on('load', () => {
				console.log('Map loaded successfully!');
			});

			map.on('error', (e) => {
				console.error('Map error:', e);
			});

			// Add markers for each park
			parks.forEach((park) => {
				const [lng, lat] = park.geometry.coordinates;

				const marker = new maplibregl.Marker()
					.setLngLat([lng, lat])
					.addTo(map!);

				// Add click handler
				marker.getElement().addEventListener('click', () => {
					if (onParkClick) {
						onParkClick(park);
					}
				});

				markers.push(marker);
			});

			console.log('Added', markers.length, 'markers');
		} catch (error) {
			console.error('Error creating map:', error);
		}
	});

	onDestroy(() => {
		// Clean up markers
		markers.forEach(marker => marker.remove());

		// Clean up map
		if (map) {
			map.remove();
			map = null;
		}
	});
</script>

<div bind:this={mapContainer} class="w-full h-96 rounded-lg shadow-lg"></div>
