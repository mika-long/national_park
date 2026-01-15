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
		createHeatmap();
	});

	function createHeatmap() {
		// Clear any existing SVG
		d3.select(container).selectAll('*').remove();

		const margin = { top: 80, right: 30, bottom: 80, left: 80 };
		const containerWidth = container.getBoundingClientRect().width;

		const years = Array.from(d3.group(data, (d) => d.year))
			.map((d) => +d[0])
			.sort((a, b) => a - b);
		const months = d3.range(1, 13);

		const cellSize = Math.min((containerWidth - margin.left - margin.right) / years.length, 15);

		const seasonBreaks = [2, 5, 8, 11];
		const seasonGapSize = cellSize * 0.2;
		const totalGapsHeight = seasonGapSize * 3;
		const height = months.length * cellSize + totalGapsHeight;
		const width = years.length * cellSize;

		const svg = d3
			.select(container)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const xScale = d3.scaleBand().domain(years).range([0, width]).padding(0.05);

		const yScale = d3.scaleBand().domain(months).range([0, height]).padding(0.05);

		function getAdjustedY(month: number) {
			const monthIndex = month - 1;
			const numGapsBefore = seasonBreaks.filter((breakMonth) => monthIndex > breakMonth).length;
			return yScale(month)! + numGapsBefore * seasonGapSize;
		}

		const colorScale = d3
			.scaleSequential(d3.interpolateBlues)
			.domain([d3.min(data, (d) => d.visitors)!, d3.max(data, (d) => d.visitors)!]);

		// Legend
		const legendWidth = 200;
		const legendHeight = 20;

		const legendScale = d3
			.scaleLinear()
			.domain([d3.min(data, (d) => d.visitors)!, d3.max(data, (d) => d.visitors)!])
			.range([0, legendWidth]);

		const gradient = svg
			.append('defs')
			.append('linearGradient')
			.attr('id', `legend-gradient-${parkName.replace(/\s+/g, '-')}`)
			.attr('x1', '0%')
			.attr('x2', '100%')
			.attr('y1', '0%')
			.attr('y2', '0%');

		gradient
			.selectAll('stop')
			.data(
				colorScale.ticks().map((t, i, n) => ({ offset: `${(100 * i) / n.length}%`, color: colorScale(t) }))
			)
			.enter()
			.append('stop')
			.attr('offset', (d) => d.offset)
			.attr('stop-color', (d) => d.color);

		svg
			.append('rect')
			.attr('x', width / 2 - legendWidth / 2)
			.attr('y', -margin.top / 2 - legendHeight / 2)
			.attr('width', legendWidth)
			.attr('height', legendHeight)
			.style('fill', `url(#legend-gradient-${parkName.replace(/\s+/g, '-')})`);

		const legendAxis = d3.axisTop(legendScale).ticks(5).tickFormat(d3.format('.2s'));

		svg
			.append('g')
			.attr('transform', `translate(${width / 2 - legendWidth / 2},${-margin.top / 2 - legendHeight / 2})`)
			.call(legendAxis);

		// Cells
		svg
			.selectAll('.cell')
			.data(data)
			.enter()
			.append('rect')
			.attr('class', 'cell')
			.attr('x', (d) => xScale(d.year)!)
			.attr('y', (d) => getAdjustedY(d.month))
			.attr('width', xScale.bandwidth())
			.attr('height', yScale.bandwidth())
			.attr('fill', (d) => colorScale(d.visitors))
			.append('title')
			.text((d) => `Year: ${d.year}, Month: ${d.month}, Visitors: ${d3.format(',')(d.visitors)}`);

		// X Axis
		svg
			.append('g')
			.attr('transform', `translate(0,${height + cellSize})`)
			.call(
				d3.axisBottom(xScale).tickFormat((d) => {
					const year = +d;
					if (year === years[0] || year === years[years.length - 1] || (year % 5 === 0 && year !== years[0] && year !== years[years.length - 1])) {
						return String(year);
					}
					return '';
				})
			)
			.selectAll('text')
			.attr('transform', 'rotate(90)')
			.style('text-anchor', 'start')
			.attr('dx', '0.8em')
			.attr('dy', '-0.5em');

		// Y Axis
		const yAxisGroup = svg.append('g').attr('class', 'y-axis');

		months.forEach((month) => {
			const y = getAdjustedY(month);

			yAxisGroup
				.append('text')
				.attr('x', -10)
				.attr('y', y + yScale.bandwidth() / 2)
				.attr('text-anchor', 'end')
				.attr('dominant-baseline', 'middle')
				.text(d3.timeFormat('%b')(new Date(0, month - 1)));

			yAxisGroup
				.append('line')
				.attr('x1', -6)
				.attr('x2', 0)
				.attr('y1', y + yScale.bandwidth() / 2)
				.attr('y2', y + yScale.bandwidth() / 2)
				.attr('stroke', 'black');
		});

		// COVID-19 highlight
		if (years.includes(2020)) {
			const startMonth = 1;
			const endMonth = 5;
			const startX = xScale(2020)!;
			const startY = yScale(startMonth)!;
			const rectWidth = xScale.bandwidth();
			const rectHeight = yScale(endMonth)! + yScale.bandwidth() - yScale(startMonth)!;

			svg
				.append('rect')
				.attr('x', startX)
				.attr('y', startY)
				.attr('width', rectWidth)
				.attr('height', rectHeight)
				.attr('fill', 'none')
				.attr('stroke', 'red')
				.attr('stroke-width', 2)
				.attr('stroke-dasharray', '5,5')
				.append('title')
				.text('COVID-19 Pandemic Period');
		}

		// Axis labels
		svg
			.append('text')
			.attr('transform', `translate(${width / 2},${height + margin.bottom})`)
			.style('text-anchor', 'middle')
			.text('Year');

		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', -margin.left)
			.attr('x', -height / 2)
			.attr('dy', '1em')
			.style('text-anchor', 'middle')
			.text('Month');
	}
</script>

<div bind:this={container} class="w-full"></div>
