<script lang="ts">
  import { onMount } from 'svelte';
  import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls } from '$lib/components/ui/map';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
  import Heatmap from '$lib/components/Heatmap.svelte';
  import { loadVisitData, loadParkData, filterNationalParks, getVisitDataForPark } from '$lib/data-loader';
  import type { VisitData, ParkFeature } from '$lib/types';

  let visitData: VisitData[] = $state([]);
  let parks: ParkFeature[] = $state([]);
  let selectedPark: ParkFeature | null = $state(null);
  let selectedParkData: VisitData[] = $state([]);
  let loading = $state(true);

  // Yosemite coordinates: [lng, lat]
  const yosemiteCoords: [number, number] = [-119.5383, 37.8651];

  onMount(async () => {
    try {
      const [visitDataResult, parkDataResult] = await Promise.all([
        loadVisitData(),
        loadParkData()
      ]);

      visitData = visitDataResult;
      parks = filterNationalParks(parkDataResult);

      // Default to Yosemite
      const yosemite = parks.find(p => p.properties.Code === 'YOSE');
      if (yosemite) {
        selectedPark = yosemite;
        selectedParkData = getVisitDataForPark(visitData, 'YOSE');
      }

      loading = false;
    } catch (error) {
      console.error('Error loading data:', error);
      loading = false;
    }
  });

  function handleParkClick(park: ParkFeature) {
    selectedPark = park;
    selectedParkData = getVisitDataForPark(visitData, park.properties.Code);
  }
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="container mx-auto max-w-7xl">
    <h1 class="text-4xl font-bold mb-8">National Parks Dashboard</h1>

    {#if loading}
      <Card>
        <CardContent class="p-12">
          <p class="text-center text-lg">Loading data...</p>
        </CardContent>
      </Card>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Map Card -->
        <Card>
          <CardHeader>
            <CardTitle>National Parks Map</CardTitle>
            <CardDescription>
              {parks.length} parks loaded • Click a marker to view visitor data
            </CardDescription>
          </CardHeader>
          <CardContent class="p-0">
            <div class="h-[500px]">
              <Map center={yosemiteCoords} zoom={4}>
                <MapControls />
                {#each parks as park}
                  <MapMarker
                    longitude={park.geometry.coordinates[0]}
                    latitude={park.geometry.coordinates[1]}
                    onclick={() => handleParkClick(park)}
                  >
                    <MarkerContent>
                      <div class="relative h-3 w-3 rounded-full border-2 border-white bg-green-600 shadow-lg hover:bg-green-700 transition-colors"></div>
                    </MarkerContent>
                    <MarkerTooltip>
                      {park.properties.Name}
                    </MarkerTooltip>
                  </MapMarker>
                {/each}
              </Map>
            </div>
          </CardContent>
        </Card>

        <!-- Heatmap Card -->
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPark ? selectedPark.properties.Name : 'Select a Park'}
            </CardTitle>
            <CardDescription>
              {#if selectedPark}
                Visitor patterns from 1980-2021 • {selectedParkData.length} data points
              {:else}
                Click a park marker to view visitor data
              {/if}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {#if selectedParkData.length > 0}
              <Heatmap data={selectedParkData} parkName={selectedPark?.properties.Name || ''} />
            {:else}
              <div class="h-[400px] flex items-center justify-center text-gray-500">
                <p>No visitor data available</p>
              </div>
            {/if}
          </CardContent>
        </Card>
      </div>
    {/if}
  </div>
</div>
