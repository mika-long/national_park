import * as d3 from 'd3';
import type { VisitData } from '$lib/types';

export interface HeatmapOptions {
	width?: number;
	margin?: { top: number; right: number; bottom: number; left: number };
	colorScheme?: (t: number) => string;
	maxCellSize?: number;
	seasonBreaks?: number[];
	highlightYear?: number;
	highlightMonths?: { start: number; end: number };
}

/**
 * Creates a heatmap visualization of visitor data by year and month
 * @param data - Array of visitor data points
 * @param parkName - Name of the park (used for legend gradient ID)
 * @param options - Configuration options with sensible defaults
 * @returns SVG DOM element ready to be appended to the page
 */
export function createHeatmapChart(
	data: VisitData[],
	parkName: string,
	{
		width: containerWidth = 800,
		margin = { top: 80, right: 30, bottom: 80, left: 80 },
		colorScheme = d3.interpolateBlues,
		maxCellSize = 15,
		seasonBreaks = [2, 5, 8, 11],
		highlightYear = 2020,
		highlightMonths = { start: 1, end: 5 }
	}: HeatmapOptions = {}
): SVGSVGElement {
	// Extract unique years from data
	const years = Array.from(d3.group(data, (d) => d.year))
		.map((d) => +d[0])
		.sort((a, b) => a - b);
	const months = d3.range(1, 13);

	// Calculate cell dimensions
	const cellSize = Math.min((containerWidth - margin.left - margin.right) / years.length, maxCellSize);
	const seasonGapSize = cellSize * 0.2;
	const totalGapsHeight = seasonGapSize * 3;
	const height = months.length * cellSize + totalGapsHeight;
	const width = years.length * cellSize;

	// Create SVG element
	const svg = d3
		.create('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
		.attr('style', 'max-width: 100%; height: auto;');

	const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

	// Create scales
	const xScale = d3.scaleBand().domain(years.map(String)).range([0, width]).padding(0.05);

	const yScale = d3.scaleBand().domain(months.map(String)).range([0, height]).padding(0.05);

	// Helper function to get y position with seasonal gaps
	function getAdjustedY(month: number) {
		const monthIndex = month - 1;
		const numGapsBefore = seasonBreaks.filter((breakMonth) => monthIndex > breakMonth).length;
		return yScale(String(month))! + numGapsBefore * seasonGapSize;
	}

	// Memoize min/max calculations - compute once instead of 3+ times
	const minVisitors = d3.min(data, (d) => d.visitors)!;
	const maxVisitors = d3.max(data, (d) => d.visitors)!;

	// Create color scale
	const colorScale = d3
		.scaleSequential(colorScheme)
		.domain([minVisitors, maxVisitors]);

	// Legend setup
	const legendWidth = 200;
	const legendHeight = 20;

	const legendScale = d3
		.scaleLinear()
		.domain([minVisitors, maxVisitors])
		.range([0, legendWidth]);

	// Create gradient for legend
	const gradient = g
		.append('defs')
		.append('linearGradient')
		.attr('id', `legend-gradient-${parkName.replace(/\s+/g, '-')}`)
		.attr('x1', '0%')
		.attr('x2', '100%')
		.attr('y1', '0%')
		.attr('y2', '0%');

	const tickValues = d3.ticks(minVisitors, maxVisitors, 5);

	gradient
		.selectAll('stop')
		.data(tickValues.map((t, i, n) => ({ offset: `${(100 * i) / n.length}%`, color: colorScale(t) })))
		.enter()
		.append('stop')
		.attr('offset', (d) => d.offset)
		.attr('stop-color', (d) => d.color);

	// Draw legend rectangle
	g.append('rect')
		.attr('x', width / 2 - legendWidth / 2)
		.attr('y', -margin.top / 2 - legendHeight / 2)
		.attr('width', legendWidth)
		.attr('height', legendHeight)
		.style('fill', `url(#legend-gradient-${parkName.replace(/\s+/g, '-')})`);

	// Legend axis
	const legendAxis = d3.axisTop(legendScale).ticks(5).tickFormat(d3.format('.2s'));

	g.append('g')
		.attr('transform', `translate(${width / 2 - legendWidth / 2},${-margin.top / 2 - legendHeight / 2})`)
		.call(legendAxis);

	// Draw cells
	g.selectAll('.cell')
		.data(data)
		.enter()
		.append('rect')
		.attr('class', 'cell')
		.attr('x', (d) => xScale(String(d.year))!)
		.attr('y', (d) => getAdjustedY(d.month))
		.attr('width', xScale.bandwidth())
		.attr('height', yScale.bandwidth())
		.attr('fill', (d) => colorScale(d.visitors))
		.append('title')
		.text((d) => `Year: ${d.year}, Month: ${d.month}, Visitors: ${d3.format(',')(d.visitors)}`);

	// X Axis
	g.append('g')
		.attr('transform', `translate(0,${height + cellSize})`)
		.call(
			d3.axisBottom(xScale).tickFormat((d) => {
				const year = +d;
				if (
					year === years[0] ||
					year === years[years.length - 1] ||
					(year % 5 === 0 && year !== years[0] && year !== years[years.length - 1])
				) {
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
	const yAxisGroup = g.append('g').attr('class', 'y-axis');

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

	// COVID-19 highlight (if applicable)
	if (years.includes(highlightYear)) {
		const startX = xScale(String(highlightYear))!;
		const startY = yScale(String(highlightMonths.start))!;
		const rectWidth = xScale.bandwidth();
		const rectHeight =
			yScale(String(highlightMonths.end))! +
			yScale.bandwidth() -
			yScale(String(highlightMonths.start))!;

		g.append('rect')
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
	g.append('text')
		.attr('transform', `translate(${width / 2},${height + margin.bottom})`)
		.style('text-anchor', 'middle')
		.text('Year');

	g.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('y', -margin.left)
		.attr('x', -height / 2)
		.attr('dy', '1em')
		.style('text-anchor', 'middle')
		.text('Month');

	return svg.node()!;
}
