<script lang="ts">
	import { createHeatmapChart } from '$lib/charts/heatmap';
	import type { VisitData } from '$lib/types';

	interface HeatmapProps {
		data: VisitData[];
		parkName: string;
	}

	let { data, parkName }: HeatmapProps = $props();
	let container: HTMLDivElement;

	$effect(() => {
		if (!container || data.length === 0) return;

		// Schedule chart rendering to avoid blocking interactions
		requestAnimationFrame(() => {
			if (!container) return;

			// Clear old chart
			container.innerHTML = '';

			// Get width once
			const width = container.getBoundingClientRect().width;

			// Create new chart using pure function
			const chart = createHeatmapChart(data, parkName, { width });

			// Append to DOM
			container.appendChild(chart);
		});
	});
</script>

<div bind:this={container} class="w-full"></div>
