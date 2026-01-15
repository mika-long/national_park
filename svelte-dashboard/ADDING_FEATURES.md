# Adding New Features: Line Chart + Year Slider

Since you mentioned wanting a **line chart with year slider** feature, here's exactly how to add it to your new Svelte dashboard.

## Feature 1: Line Chart Component

### Create `src/lib/components/LineChart.svelte`

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import type { VisitData } from '$lib/types';

	interface Props {
		data: VisitData[];
		parkName: string;
	}

	let { data, parkName }: Props = $props();
	let container: HTMLDivElement;

	onMount(() => {
		if (data.length === 0) return;
		createLineChart();
	});

	function createLineChart() {
		d3.select(container).selectAll('*').remove();

		const margin = { top: 40, right: 30, bottom: 60, left: 80 };
		const width = 800 - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		const svg = d3
			.select(container)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Group by year and sum visitors
		const yearlyData = Array.from(
			d3.rollup(
				data,
				(v) => d3.sum(v, (d) => d.visitors),
				(d) => d.year
			),
			([year, visitors]) => ({ year, visitors })
		).sort((a, b) => a.year - b.year);

		// Scales
		const xScale = d3
			.scaleLinear()
			.domain(d3.extent(yearlyData, (d) => d.year) as [number, number])
			.range([0, width]);

		const yScale = d3
			.scaleLinear()
			.domain([0, d3.max(yearlyData, (d) => d.visitors) as number])
			.nice()
			.range([height, 0]);

		// Line generator
		const line = d3
			.line<{ year: number; visitors: number }>()
			.x((d) => xScale(d.year))
			.y((d) => yScale(d.visitors))
			.curve(d3.curveMonotoneX);

		// Draw line
		svg
			.append('path')
			.datum(yearlyData)
			.attr('fill', 'none')
			.attr('stroke', 'steelblue')
			.attr('stroke-width', 2)
			.attr('d', line);

		// Add dots
		svg
			.selectAll('circle')
			.data(yearlyData)
			.enter()
			.append('circle')
			.attr('cx', (d) => xScale(d.year))
			.attr('cy', (d) => yScale(d.visitors))
			.attr('r', 4)
			.attr('fill', 'steelblue')
			.append('title')
			.text((d) => `${d.year}: ${d3.format(',')(d.visitors)} visitors`);

		// X Axis
		svg
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(xScale).tickFormat(d3.format('d')));

		// Y Axis
		svg.append('g').call(d3.axisLeft(yScale).tickFormat(d3.format('.2s')));

		// Labels
		svg
			.append('text')
			.attr('x', width / 2)
			.attr('y', height + 40)
			.style('text-anchor', 'middle')
			.text('Year');

		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('x', -height / 2)
			.attr('y', -60)
			.style('text-anchor', 'middle')
			.text('Annual Visitors');

		// Title
		svg
			.append('text')
			.attr('x', width / 2)
			.attr('y', -10)
			.style('text-anchor', 'middle')
			.style('font-size', '16px')
			.style('font-weight', 'bold')
			.text(`${parkName} - Annual Visitation`);
	}
</script>

<div bind:this={container} class="w-full" />
```

## Feature 2: Year Slider Component

### Create `src/lib/components/YearSlider.svelte`

```svelte
<script lang="ts">
	interface Props {
		min: number;
		max: number;
		value: number;
		onChange: (year: number) => void;
	}

	let { min, max, value = $bindable(), onChange }: Props = $props();

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const newValue = parseInt(target.value);
		value = newValue;
		if (onChange) {
			onChange(newValue);
		}
	}
</script>

<div class="flex flex-col gap-2 w-full">
	<div class="flex justify-between items-center">
		<label for="year-slider" class="text-sm font-medium">Select Year</label>
		<span class="text-lg font-bold text-blue-600">{value}</span>
	</div>

	<input
		id="year-slider"
		type="range"
		{min}
		{max}
		{value}
		on:input={handleChange}
		class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
	/>

	<div class="flex justify-between text-xs text-gray-500">
		<span>{min}</span>
		<span>{max}</span>
	</div>
</div>
```

## Feature 3: Chart Type Switcher

### Create `src/lib/components/ChartSelector.svelte`

```svelte
<script lang="ts">
	interface Props {
		selected: 'heatmap' | 'line';
		onChange: (type: 'heatmap' | 'line') => void;
	}

	let { selected = $bindable(), onChange }: Props = $props();

	function handleSelect(type: 'heatmap' | 'line') {
		selected = type;
		if (onChange) {
			onChange(type);
		}
	}
</script>

<div class="flex gap-2">
	<button
		class="px-4 py-2 rounded-lg font-medium transition-colors {selected === 'heatmap'
			? 'bg-blue-600 text-white'
			: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
		onclick={() => handleSelect('heatmap')}
	>
		Heatmap
	</button>

	<button
		class="px-4 py-2 rounded-lg font-medium transition-colors {selected === 'line'
			? 'bg-blue-600 text-white'
			: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
		onclick={() => handleSelect('line')}
	>
		Line Chart
	</button>
</div>
```

## Feature 4: Update Main Page

### Modify `src/routes/+page.svelte`

Add these imports at the top:

```svelte
<script lang="ts">
	// ... existing imports
	import LineChart from '$lib/components/LineChart.svelte';
	import ChartSelector from '$lib/components/ChartSelector.svelte';
	import YearSlider from '$lib/components/YearSlider.svelte';

	// ... existing code

	// Add new state
	let chartType: 'heatmap' | 'line' = $state('heatmap');
	let selectedYear = $state(2020);

	// Add filtered data
	$effect(() => {
		if (selectedPark && allVisitData.length > 0) {
			selectedParkVisitData = getVisitDataForPark(allVisitData, selectedPark.properties.Code);
		}
	});

	// Get year range
	const yearExtent = $derived.by(() => {
		if (allVisitData.length === 0) return [1980, 2021];
		return [
			Math.min(...allVisitData.map((d) => d.year)),
			Math.max(...allVisitData.map((d) => d.year))
		];
	});
</script>
```

Then replace the chart display section:

```svelte
<div>
	{#if selectedPark && selectedParkVisitData.length > 0}
		<div class="bg-gray-50 p-4 rounded-lg">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-xl font-bold">{selectedPark.properties.Name}</h3>
				<ChartSelector bind:selected={chartType} onChange={(type) => (chartType = type)} />
			</div>

			{#if chartType === 'heatmap'}
				<Heatmap data={selectedParkVisitData} parkName={selectedPark.properties.Name} />
			{:else}
				<div class="mb-4">
					<YearSlider
						min={yearExtent[0]}
						max={yearExtent[1]}
						bind:value={selectedYear}
						onChange={(year) => console.log('Year changed:', year)}
					/>
				</div>
				<LineChart data={selectedParkVisitData} parkName={selectedPark.properties.Name} />
			{/if}
		</div>
	{:else}
		<div class="bg-gray-50 p-4 rounded-lg h-full flex items-center justify-center">
			<p class="text-gray-500">Click on a park marker to view visitation data</p>
		</div>
	{/if}
</div>
```

## How to Use

1. **Create the new component files** in `src/lib/components/`
2. **Update `+page.svelte`** with the new imports and logic
3. **Run the dev server**: `yarn dev`
4. **Test it out**:
   - Click on a park
   - Toggle between Heatmap and Line Chart views
   - Use the year slider (you can filter data by year if you want)

## Additional Ideas

### Filter Heatmap by Year Range
```svelte
let yearRange = $state([1980, 2021]);

$: filteredData = selectedParkVisitData.filter(
	d => d.year >= yearRange[0] && d.year <= yearRange[1]
);

<Heatmap data={filteredData} parkName={selectedPark.properties.Name} />
```

### Compare Multiple Parks
```svelte
let selectedParks = $state<ParkFeature[]>([]);

{#each selectedParks as park}
	<LineChart data={getVisitDataForPark(allVisitData, park.properties.Code)} parkName={park.properties.Name} />
{/each}
```

### Monthly Line Chart (Show specific year)
```svelte
// Filter data for selected year only
$: monthlyData = selectedParkVisitData.filter(d => d.year === selectedYear);

<LineChart data={monthlyData} parkName={`${selectedPark.properties.Name} - ${selectedYear}`} />
```

## Benefits of This Approach

✅ **Reactive** - UI updates automatically when state changes
✅ **Reusable** - Components work with any park data
✅ **Type-safe** - TypeScript catches errors
✅ **Performant** - Svelte compiles to efficient vanilla JS
✅ **Maintainable** - Clear separation of concerns

Let me know if you want me to implement any of these features!
