<script lang="ts">
    import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls } from '$lib/components/ui/map';

    interface GeomapProps {
        parks: any[];
        selectedPark?: any;
        center?: [number, number]; 
        zoom?: number; 
        onParkClick?: (park: any) => void; 
    }
    
    let { 
        parks,
        selectedPark = null,
        center = [-119.5383, 37.8651], 
        zoom = 4, 
        onParkClick
    } : GeomapProps = $props(); 
</script>

<div class="h-full">
    <Map {center} {zoom}>
        <MapControls />
        
        {#each parks as park}
            <MapMarker longitude={park.long} latitude={park.lat}>
                <MarkerContent>
                    <button 
                        onclick={() => onParkClick?.(park)}
                        class="rounded-full w-3 h-3 {selectedPark?.Code === park.Code ? 'bg-red-500' : 'bg-blue-500'} hover:scale-125 transition-transform"
                    ></button>
                </MarkerContent>
                <MarkerTooltip>
                    <div class="font-semibold">{park.Name}</div>
                    <div class="text-sm text-gray-600">{park.Code}</div>
                </MarkerTooltip>
            </MapMarker>
        {/each}
    </Map>
</div>