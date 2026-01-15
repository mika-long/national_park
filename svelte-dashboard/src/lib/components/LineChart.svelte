<script lang="ts">
    import { onMount } from "svelte";
    import * as d3 from 'd3'; 
    import type { VisitData } from "$lib/types";

    interface LineChartProps {
        data: VisitData[]; 
        parkName: string; 
    }

    let { data, parkName }: LineChartProps = $props(); 
    let container: HTMLDivElement; 

    onMount(() => {
        if (data.length === 0) return; 
        createLineChart(); 
    })

    function createLineChart() {
        d3.select(container).selectAll('*').remove(); 

        const margin = {top: 40, right: 30, bottom: 60, left: 80}; 
        const containerWidth = container.getBoundingClientRect().width;
        const width = containerWidth - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3
            .select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Aggregate by year (sum all months)
        const yearlyData = Array.from(
            d3.rollup(
                data,
                (v) => d3.sum(v, (d) => d.visitors),
                (d) => d.year
            )
        )
        .map(([year, visitors]) => ({ year, visitors }))
        .sort((a, b) => a.year - b.year);

        // Scales
        const xScale = d3
            .scaleLinear()
            .domain(d3.extent(yearlyData, (d) => d.year) as [number, number])
            .range([0, width]);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(yearlyData, (d) => d.visitors)!])
            .nice()
            .range([height, 0]);

        // Line generator
        const line = d3.line<{ year: number; visitors: number }>()
            .x((d) => xScale(d.year))
            .y((d) => yScale(d.visitors))
            .curve(d3.curveMonotoneX);

        // Draw line
        svg.append('path')
            .datum(yearlyData)
            .attr('fill', 'none')
            .attr('stroke', '#2563eb')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Add dots
    svg
      .selectAll('.dot')
      .data(yearlyData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.year))
      .attr('cy', (d) => yScale(d.visitors))
      .attr('r', 4)
      .attr('fill', '#2563eb')
      .append('title')
      .text((d) => `${d.year}: ${d3.format(',')(d.visitors)} visitors`);

    // COVID-19 highlight
    if (yearlyData.some((d) => d.year === 2020)) {
      svg
        .append('line')
        .attr('x1', xScale(2020))
        .attr('x2', xScale(2020))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .append('title')
        .text('COVID-19 Pandemic');
    }

    // Axes
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')));

    svg.append('g').call(d3.axisLeft(yScale).tickFormat(d3.format('.2s')));

    // Labels
    svg
      .append('text')
      .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .text('Year');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -height / 2)
      .style('text-anchor', 'middle')
      .text('Annual Visitors');

    }
</script>

<div bind:this={container} class="w-full"></div>