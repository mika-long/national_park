<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { Plot, Line, Cell, AxisX } from 'svelteplot';
    import Card from './ui/card/card.svelte';

    let rawData: any[] = $state([]); 
    let yosemiteData: any[] = $state([]); 
    let loading = $state(true);
    let error: string | null = $state(null);
    
    // View controls
    let viewMode: 'line' | 'heatmap' = $state('line');
    let startYear = $state(1979);
    let endYear = $state(2024);
    let availableYears: number[] = $state([]);

    // Use $derived instead of $effect for better performance
    let filteredData = $derived(
        yosemiteData.filter(d => d.Year >= startYear && d.Year <= endYear)
    );

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
                error = 'No data found for Grand Canyon';
            } else {
                // Get available year range
                const years = [...new Set(yosemiteData.map(d => d.Year))].sort();
                availableYears = years;
                startYear = years[0];
                endYear = years[years.length - 1];
            }
        } catch (err) {
            error = `Failed to load data: ${err}`;
        } finally {
            loading = false;
        }
    });

    // $inspect(yosemiteData); 
</script>

<Card>
    <div class="max-w-4xl p-6 space-y-6">
        <h2 class="text-2xl font-bold">Grand Canyon National Park - Visitor Data</h2>
        
        {#if loading}
            <p>Loading data...</p>
        {:else if error}
            <p class="text-red-500">{error}</p>
        {:else if yosemiteData.length > 0}
            <!-- Controls -->
            <div class="space-y-4 bg-gray-50 p-4 rounded-lg">
                <!-- View Toggle -->
                <div class="flex items-center gap-4">
                    <label class="font-semibold">View:</label>
                    <div class="flex gap-2">
                        <button
                            onclick={() => viewMode = 'line'}
                            class="px-4 py-2 rounded {viewMode === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
                        >
                            Line Chart
                        </button>
                        <button
                            onclick={() => viewMode = 'heatmap'}
                            class="px-4 py-2 rounded {viewMode === 'heatmap' ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
                        >
                            Heatmap
                        </button>
                    </div>
                </div>

                <!-- Date Range Controls (only show for line chart) -->
                {#if viewMode === 'line'}
                    <div class="space-y-2">
                        <label class="font-semibold">Year Range:</label>
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-2">
                                <label for="startYear">From:</label>
                                <input
                                    id="startYear"
                                    type="number"
                                    bind:value={startYear}
                                    min={availableYears[0]}
                                    max={endYear}
                                    class="w-24 px-2 py-1 border rounded"
                                />
                            </div>
                            <div class="flex items-center gap-2">
                                <label for="endYear">To:</label>
                                <input
                                    id="endYear"
                                    type="number"
                                    bind:value={endYear}
                                    min={startYear}
                                    max={availableYears[availableYears.length - 1]}
                                    class="w-24 px-2 py-1 border rounded"
                                />
                            </div>
                            <span class="text-sm text-gray-600">
                                ({filteredData.length} data points)
                            </span>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Visualization -->
            <div class="mt-6">
                {#if viewMode === 'line'}
                    {#key 'line-chart'}
                        <Plot y={{grid: true, axis: 'both' }} x={{tickRotate: -45, tickSpacing: 100}}>
                            <Line canvas={true} data={filteredData} x="date" y="RecreationVisits" />
                        </Plot>
                    {/key}
                {:else}
                    {#key 'heatmap-chart'}
                        <Plot grid padding={0} aspectRatio={1} color={{ legend: true, scheme: 'Blues' }} x={{tickRotate: -45}} y={{axis: 'both'}}>
                            <Cell data={yosemiteData} inset={0.5} x="Year" y="Month" fill="RecreationVisits"/>
                        </Plot>
                    {/key}
                {/if}
            </div>
        {/if}
    </div>
</Card>
