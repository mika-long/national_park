<script lang="ts">
    import Heatmap from "./Heatmap.svelte";
    import LineChart from "./LineChart.svelte";
    import ToggleGroup from "./ui/toggle-group/toggle-group.svelte";
    import  ToggleGroupItem from "./ui/toggle-group/toggle-group-item.svelte";
    import type { VisitData } from "$lib/types";

    interface VisitorChartProps { 
        data: VisitData[];
        parkName: string; 
    }

    let { data, parkName } : VisitorChartProps = $props(); 
    let viewMode = $state<'heatmap' | 'line'>('line');
</script>

<div class="space-y-4">
  <!-- Toggle -->
  <div class="flex justify-end">
    <ToggleGroup bind:value={viewMode} type="single">
      <ToggleGroupItem value="heatmap">Heatmap</ToggleGroupItem>
      <ToggleGroupItem value="line">Line Chart</ToggleGroupItem>
    </ToggleGroup>
  </div>

  <!-- Visualization -->
  {#if viewMode === 'heatmap'}
    <Heatmap {data} {parkName} />
  {:else}
    <LineChart {data} {parkName} />
  {/if}
</div>