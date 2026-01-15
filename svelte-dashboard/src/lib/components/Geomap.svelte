<script lang="ts">
    import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls } from '$lib/components/ui/map';
    import type { ParkFeature } from '$lib/types';

    interface GeomapProps {
        parks: ParkFeature[];
        center?: [number, number]; 
        zoom?: number; 
        onParkClick?: (park: ParkFeature) => void; 
    }
    let { 
        parks,
        center = [-119.5383, 37.8651], // default to Yosemite
        zoom = 4, 
        onParkClick
     } : GeomapProps = $props(); 

</script>


<div class="h-[500px]">
    <Map {center} {zoom}>
    <MapControls />
    {#each parks as park}
        <MapMarker
            longitude={park.geometry.coordinates[0]}
            latitude={park.geometry.coordinates[1]}
            onclick={() => onParkClick?.(park)}
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