<script lang="ts">
  import { Plot, Cell, Line } from 'svelteplot';

  interface VisitorChartProps { 
    data: any[];
  }

  let { data } : VisitorChartProps = $props(); 
  
  let viewMode: 'line' | 'heatmap' = $state('heatmap');
  
  // Transform data for line chart
  let lineData = $derived(
    data.map(d => ({
      ...d,
      date: `${d.Year}-${String(d.Month).padStart(2, '0')}`
    }))
  );
  
  // COVID-19 date markers
  const covidStart = "2020-03"; // March 2020
  const covidAnnotation = [{ date: "2020-03", label: "COVID-19" }];
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
        <Plot y={{grid: true, axis: 'both'}} x={{tickRotate: -45, tickSpacing: 100}}>
          <!-- <Line canvas={true} data={lineData} x="Month" y="RecreationVisits" z="Year"/> -->
           <Line canvas={true} data={lineData} x="date" y="RecreationVisits"/>
        </Plot>
      {/key}
    {:else}
      {#key 'heatmap-chart'}
        <div class="relative">
          <Plot grid padding={0.1} aspectRatio={1} color={{legend: true, scheme: 'Blues'}} x={{tickRotate: -45}} y={{axis: 'both'}}>
            <Cell data={data} x="Year" y="Month" fill="RecreationVisits"/>
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