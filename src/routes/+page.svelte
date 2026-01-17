<script lang="ts">
  import { onMount } from 'svelte';
  import Geomap from '$lib/components/Geomap.svelte';
  import VisitorChart from '$lib/components/VisitorChart.svelte';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
  import * as d3 from 'd3';

  let parks: any[] = $state.raw([]);
  let visitData: any[] = $state.raw([]);
  let selectedPark: any = $state(null);
  let loading = $state(true);

  // Filtered data for selected park
  let selectedParkData = $derived(
    selectedPark 
      ? visitData.filter(d => d.UnitCode === selectedPark.Code)
      : []
  );

  onMount(async () => {
    try {
      const [parksResponse, visitsResponse] = await Promise.all([
        fetch('/data/clean_park.csv'),
        fetch('/data/clean_visit.csv')
      ]);

      const parksCsvText = await parksResponse.text();
      parks = d3.csvParse(parksCsvText, d3.autoType);
      
      const csvText = await visitsResponse.text();
      visitData = d3.csvParse(csvText, d3.autoType);
      
      // Debug: Check column names and first row
      console.log('Visit data columns:', Object.keys(visitData[0] || {}));
      console.log('Visit data first row:', visitData[0]);

      // Default to first park (or Yosemite if available)
      const yosemite = parks.find(p => p.Code === 'YOSE');
      selectedPark = yosemite || parks[0];

      loading = false;
    } catch (error) {
      console.error('Error loading data:', error);
      loading = false;
    }
  });

  // $inspect(parks); 
  // $inspect(visitData); 

  function handleParkClick(park: any) {
    selectedPark = park;
  }
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="container mx-auto max-w-7xl">
    <h1 class="text-4xl font-bold mb-8">National Parks Visit Data Dashboard</h1>

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
          <CardContent class="p-0 h-[500px]">
            <Geomap {parks} {selectedPark} onParkClick={handleParkClick} />
          </CardContent>
        </Card>

        <!-- Visitor Data Card -->
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPark ? selectedPark.Name : 'Select a Park'}
            </CardTitle>
            <CardDescription>
              {#if selectedParkData.length > 0}
                Visitor patterns • {selectedParkData.length} data points
              {:else}
                Click a park marker to view visitor data
              {/if}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {#if selectedParkData.length > 0}
              <VisitorChart data={selectedParkData} />
            {:else}
              <div class="h-[400px] flex items-center justify-center text-gray-500">
                <p>No visitor data available for this park</p>
              </div>
            {/if}
          </CardContent>
        </Card>
      </div>
    {/if}
  </div>
</div>