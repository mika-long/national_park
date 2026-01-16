<script lang="ts">
  import { Plot, Cell, Line, RuleX, Text } from 'svelteplot';

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
          <Line canvas={true} data={lineData} x="date" y="RecreationVisits" />
          <!-- COVID-19 marker line -->
          <RuleX data={[{date: covidStart}]} x="date" stroke="red" strokeWidth={2} strokeDasharray="5,5" />
        </Plot>
        <!-- COVID-19 label below chart -->
        <div class="flex items-center gap-2 text-sm text-red-600">
          <div class="w-8 h-0.5 bg-red-600 border-dashed"></div>
          <span>COVID-19 Pandemic (March 2020)</span>
        </div>
      {/key}
    {:else}
      {#key 'heatmap-chart'}
        <div class="relative">
          <Plot grid padding={0.1} aspectRatio={1} color={{legend: true, scheme: 'Blues'}} x={{tickRotate: -45}} y={{axis: 'both'}}>
            <Cell data={data} x="Year" y="Month" fill="RecreationVisits"/>
          </Plot>
          <!-- COVID-19 overlay annotation for heatmap -->
          <div class="absolute top-4 right-4 bg-red-50 border-2 border-red-300 px-3 py-2 rounded shadow-sm">
            <div class="text-xs font-semibold text-red-700">COVID-19 Impact</div>
            <div class="text-xs text-red-600">March 2020 →</div>
          </div>
        </div>
      {/key}
    {/if}
  {:else}
    <div class="h-96 flex items-center justify-center text-gray-500">
      <p>No visitor data available</p>
    </div>
  {/if}
</div>