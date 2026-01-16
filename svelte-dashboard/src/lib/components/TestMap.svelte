<script lang="ts">
    import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls } from '$lib/components/ui/map';
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
	import Card from './ui/card/card.svelte';

    let rawData: any[] = $state([]);
    let error = $state(""); 

    onMount(async () => {
        try {
            const response = await fetch('/data/clean_park.csv');
            const csvText = await response.text();
            rawData = d3.csvParse(csvText, d3.autoType);
        } catch (err) {
            error = `Failed to load data: ${err}`;
        }
    });
    
    $inspect(rawData); 
</script>

<Card class="h-[400px]">
    {#if error}
        <p class="text-red-500">{error}</p>
    {:else}
        <Map zoom={4} center={[-119.5383, 37.8651]}>
            <MapControls />
            
            {#each rawData as park}
                <MapMarker longitude={park.long} latitude={park.lat}>
                    <MarkerContent>
                        <div class="bg-blue-500 rounded-full w-3 h-3"></div>
                    </MarkerContent>
                    <MarkerTooltip>
                        <div class="font-semibold">{park.Name}</div>
                        <div class="text-sm text-gray-600">{park.Code}</div>
                    </MarkerTooltip>
                </MapMarker>
            {/each}
        </Map>
    {/if}
</Card>