<script lang="ts">
  import { Plot, Cell, Line, HTMLTooltip } from 'svelteplot';
  import { Slider } from "$lib/components/ui/slider";

  interface VisitorChartProps { 
    data: any[];
  }

  let { data } : VisitorChartProps = $props(); 
  
  let viewMode: 'line' | 'heatmap' = $state('heatmap');
  
  // Compute min/max year from data
  let years = $derived(data.map(d => d.Year));
  const minYear = $derived(years.length ? Math.min(...years): 1970);
  const maxYear = $derived(years.length? Math.max(...years) : 2024);

  // State for selected year range
  let yearRange = $state([1970, 2024]);

  $effect(() => {
    // If we have real data boundaries, update the range to match them
    if (years.length > 0) {
        // Only update if we are still at the default/fallback state
        // (This prevents resetting user selection on minor updates)
        yearRange = [minYear, maxYear];
    }
  });

  // Transform data for line chart and filter by year range
  let lineData = $derived(
    data
      .map(d => ({
        ...d,
        date: `${d.Year}-${String(d.Month).padStart(2, '0')}`
      }))
      .filter(d => d.Year >= yearRange[0] && d.Year <= yearRange[1])
  );
</script>

<div class="space-y-4">
  {#if data && data.length > 0}
    <!-- Toggle Buttons -->
    <div class="flex gap-2">
      <button
        onclick={() => viewMode = 'line'}
        class="px-4 py-2 rounded text-sm {viewMode === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
      >
        Line Chart
      </button>
      <button
        onclick={() => viewMode = 'heatmap'}
        class="px-4 py-2 rounded text-sm {viewMode === 'heatmap' ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
      >
        Heatmap
      </button>
    </div>

    <!-- Visualization -->
    {#if viewMode === 'line'}
      {#key 'line-chart'}
        <div class="flex items-center gap-4 mb-2">
          <span class="font-medium">Year Range:</span>
          <span >{yearRange[0]}</span>
          <Slider min={minYear} max={maxYear} step={1} type="multiple" bind:value={yearRange} class="max-w-[50%]" />
          <span >{yearRange[1]}</span>
        </div>
        <Plot y={{grid: false, axis: 'both'}} x={{tickRotate: -45, tickSpacing: 100}}>
          <Line canvas={true} data={lineData} x="date" y="RecreationVisits"/>
            {#snippet overlay()}
              <HTMLTooltip
                data={lineData}
                x="date"
                y="RecreationVisits"
              >
                {#snippet children({ datum })}
                  <div class="tooltip">
                    <div>Date: {datum.date}</div>
                    <div># Visits: {datum.RecreationVisits}</div>
                  </div>
                {/snippet}
              </HTMLTooltip>
            {/snippet}
        </Plot>
      {/key}
    {:else}
      {#key 'heatmap-chart'}
        <div class="relative">
          <Plot
            padding={0.1}
            aspectRatio={1}
            color={{ legend: true, scheme: 'PuBu', n: 5 }}
            x={{ tickRotate: -45 }}
            y={{ axis: 'both' }}
          >
            <Cell data={data} x="Year" y="Month" fill="RecreationVisits"/>
              {#snippet overlay()}
                <HTMLTooltip
                  data={data}
                  x="Year"
                  y="Month"
                >
                  {#snippet children({ datum })}
                    <div class="tooltip">
                      <div># Visits: {datum.RecreationVisits}</div>
                    </div>
                  {/snippet}
                </HTMLTooltip>
              {/snippet}
          </Plot>
        </div>
      {/key}
    {/if}
  {:else}
    <div class="h-96 flex items-center justify-center text-gray-500">
      <p>No visitor data available</p>
    </div>
  {/if}
</div>

<style>
  .tooltip {
    background: rgba(255, 255, 255, 0.95);
    color: #1f2937;
    padding: 8px 12px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 13px;
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.5;
    pointer-events: none;
  }
</style>