<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { Plot, Line, Cell, AxisX } from 'svelteplot';
    import Card from './ui/card/card.svelte';

    let rawData: any[] = $state([]); 
    let yosemiteData: any[] = $state([]); 
    let loading = $state(true);
    let error: string | null = $state(null);

    onMount(async () => {
        try {
            const response = await fetch('/data/visit_data.csv');
            const csvText = await response.text();
            rawData = d3.csvParse(csvText, d3.autoType);
            
            // Filter for Yosemite (park code YOSE)
            // yosemiteData = rawData.filter((d) => d.UnitCode === 'YOSE');
            yosemiteData = rawData
                .filter((d) => d.UnitCode === 'GRCA')
                .map((d) => ({
                    ...d,
                    date: `${d.Year}-${String(d.Month).padStart(2, '0')}`  // "1979-01"
                }));
            if (yosemiteData.length === 0) {
                error = 'No data found for Yosemite';
            }
        } catch (err) {
            error = `Failed to load data: ${err}`;
        } finally {
            loading = false;
        }
    });

    $inspect(yosemiteData); 
</script>

<Card>
    <div class="max-w-lg">
        <h2 class="text-xl font-bold mb-4">Yosemite National Park - Visitor Data</h2>
        
        {#if loading}
            <p>Loading data...</p>
        {:else if error}
            <p class="text-red-500">{error}</p>
        {:else if yosemiteData.length > 0}
            <Plot y={{grid: true, axis: 'both' }} x={{tickRotate: -45, tickSpacing: 100}}>
                <!-- <AxisX interval="1 month" text={false} tickSize={3} /> -->
                <Line data={yosemiteData} x="date" y="RecreationVisits" />
            </Plot>
            <Plot grid padding={0} aspectRatio={1} color={{ scheme: 'Blues' }} x={{tickRotate: -45}}>
                <Cell data={yosemiteData} inset={0.5} x="Year" y = "Month" fill="RecreationVisits"/>
            </Plot>
    {/if}
    </div>
</Card>
