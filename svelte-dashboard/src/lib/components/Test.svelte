<script lang="ts">
    import { Map, MapControls } from "$lib/components/ui/map";
    import { Card } from "$lib/components/ui/card"; 
</script>

<Card class="h-[300px] overflow-hidden p-0">
    <Map center={[-74.006, 40.7128]} zoom={11}>
        <MapControls />
    </Map>
</Card>