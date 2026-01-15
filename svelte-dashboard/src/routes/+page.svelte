<script lang="ts">
	import { onMount } from 'svelte';
	import MapView from '$lib/components/MapView.svelte';
	import Heatmap from '$lib/components/Heatmap.svelte';
	import {
		loadParkData,
		loadVisitData,
		filterNationalParks,
		filterParksByRegion,
		getVisitDataForPark
	} from '$lib/data-loader';
	import type { ParkFeature, VisitData, MapRegion } from '$lib/types';

	const regions: MapRegion[] = [
		{ id: 'usa', name: 'Mainland USA', center: [37.0902, -95.7129], zoom: 4 },
		{ id: 'hawaii', name: 'Hawaii', center: [20.7984, -156.3319], zoom: 7 },
		{ id: 'alaska', name: 'Alaska', center: [64.2008, -149.4937], zoom: 4 }
	];

	let allParks: ParkFeature[] = $state([]);
	let allVisitData: VisitData[] = $state([]);
	let selectedPark: ParkFeature | null = $state(null);
	let selectedParkVisitData: VisitData[] = $state([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			console.log('Loading data...');
			const [parkData, visitData] = await Promise.all([loadParkData(), loadVisitData()]);
			console.log('Park data loaded:', parkData.features?.length, 'parks');
			console.log('Visit data loaded:', visitData.length, 'records');
			allParks = filterNationalParks(parkData);
			console.log('Filtered national parks:', allParks.length);
			allVisitData = visitData;
			loading = false;
			console.log('Data loading complete!');
		} catch (error) {
			console.error('Error loading data:', error);
			loading = false;
		}
	});

	function handleParkClick(park: ParkFeature) {
		selectedPark = park;
		selectedParkVisitData = getVisitDataForPark(allVisitData, park.properties.Code);
	}
</script>

<div class="min-h-screen bg-gray-100">
	<div class="container mx-auto p-4 max-w-7xl">
		<h1 class="text-4xl font-bold text-center mb-8">National Parks Visitor Dashboard</h1>

		<div class="bg-white p-6 rounded-lg shadow mb-8">
			<p class="text-lg mb-4">
				This interactive visualization shows visitor patterns across U.S. National Parks. Click on
				any park marker to see its historical visitation data from 1980-2021.
			</p>
			<p class="text-lg mb-4">
				The heatmaps reveal seasonal patterns and long-term trends in park visitation. Darker blues
				indicate higher visitor numbers. The maps are separated by region to better display parks
				in Alaska and Hawaii.
			</p>
			<p class="text-lg">
				Notable features include seasonal peaks during summer months and the significant impact of
				the COVID-19 pandemic (highlighted in red) in early 2020.
			</p>
		</div>

		{#if loading}
			<div class="text-center py-12">
				<p class="text-xl">Loading data...</p>
			</div>
		{:else}
			{#each regions as region}
				<div class="mb-8">
					<div class="bg-white p-6 rounded-lg shadow">
						<h2 class="text-2xl font-semibold mb-4">{region.name}</h2>
						<p class="text-sm text-gray-600 mb-2">
							Parks in region: {filterParksByRegion(allParks, region.id).length}
						</p>

						<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<div>
								<MapView
									center={region.center}
									zoom={region.zoom}
									parks={filterParksByRegion(allParks, region.id)}
									onParkClick={handleParkClick}
								/>
							</div>

							<div>
								{#if selectedPark && selectedParkVisitData.length > 0}
									<div class="bg-gray-50 p-4 rounded-lg">
										<h3 class="text-xl font-bold mb-4">{selectedPark.properties.Name}</h3>
										<Heatmap data={selectedParkVisitData} parkName={selectedPark.properties.Name} />
									</div>
								{:else}
									<div class="bg-gray-50 p-4 rounded-lg h-full flex items-center justify-center">
										<p class="text-gray-500">Click on a park marker to view visitation data</p>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
