// Map configurations
const maps = [
    { id: 'map-usa', center: [37.0902, -95.7129], zoom: 4 }, // Mainland USA
    { id: 'map-hawaii', center: [20.7984, -156.3319], zoom: 7 }, // Hawaii
    { id: 'map-alaska', center: [64.2008, -149.4937], zoom: 4 } // Alaska
];

// Function to handle map section layout
function updateLayout(mapId, isExpanded) {
    // Remove 'map-' prefix to match HTML IDs
    const sectionId = mapId.replace('map-', '');
    const section = document.getElementById(`${sectionId}-section`);
    const heatmapContainer = document.getElementById(`${sectionId}-heatmap`);
    
    if (!section || !heatmapContainer) {
        console.warn(`Could not find elements for ${mapId}`);
        return;
    }
    
    if (isExpanded) {
        section.classList.remove('w-full');
        section.classList.add('w-1/2');
        heatmapContainer.classList.remove('hidden');
        setTimeout(() => {
            maps.forEach(mapConfig => {
                if (mapConfig.mapInstance) {
                    mapConfig.mapInstance.invalidateSize();
                }
            });
        }, 300);
    } else {
        section.classList.remove('w-1/2');
        section.classList.add('w-full');
        heatmapContainer.classList.add('hidden');
    }
}

// Close heatmap when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.map-container') && !event.target.closest('.heatmap-container')) {
        maps.forEach(mapConfig => {
            updateLayout(mapConfig.id, false);
        });
    }
});

Promise.all([
    fetch('data/national-parks.geojson').then(response => response.json()),
    d3.csv('data/visit_data.csv')
]).then(([parkData, visitData]) => {
    // Process visit data
    const processedVisitData = visitData.map(d => ({
        year: +d.Year,
        month: +d.Month,
        visitors: +d.RecreationVisits,
        parkname: d.ParkName,
        unitcode: d.UnitCode
    }));

    // Filter for National Parks only
    const nationalParksOnly = parkData.features.filter(feature => 
        feature.properties.Name.toLowerCase().includes('national park')
    );

    // Initialize each map
    maps.forEach(mapConfig => {
        const map = L.map(mapConfig.id).setView(mapConfig.center, mapConfig.zoom);
        mapConfig.mapInstance = map; // Store map instance for later use
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Filter parks based on region
        nationalParksOnly
            .filter(feature => {
                const coords = feature.geometry.coordinates;
                const lng = coords[0];
                const lat = coords[1];

                if (mapConfig.id === 'map-usa') {
                    return lng > -130 && lng < -65 && lat > 24 && lat < 49;
                } else if (mapConfig.id === 'map-hawaii') {
                    return lng < -154 && lat < 25;
                } else if (mapConfig.id === 'map-alaska') {
                    return lat > 50;
                }
                return false;
            })
            .forEach(feature => {
                const coords = feature.geometry.coordinates;
                const props = feature.properties;
                
                // Create marker
                L.marker([coords[1], coords[0]])
                    .addTo(map)
                    // Inside your marker click event handler, modify this section:
                    .on('click', () => {
                        // Clear any existing heatmaps
                        maps.forEach(m => updateLayout(m.id, false));
                        
                        // Get the heatmap container ID by removing 'map-' prefix
                        const heatmapId = mapConfig.id.replace('map-', '');
                        const heatmapContainer = document.getElementById(`${heatmapId}-heatmap`);
                        
                        if (!heatmapContainer) {
                            console.warn(`Could not find heatmap container for ${mapConfig.id}`);
                            return;
                        }
                        
                        // Set the innerHTML
                        heatmapContainer.innerHTML = `
                            <h3 class="text-xl font-bold mb-4">${props.Name}</h3>
                            <div id="heatmap-${props.Code}"></div>
                        `;
                        
                        updateLayout(mapConfig.id, true);
                        
                        // Get park-specific visit data
                        const parkVisitData = processedVisitData.filter(d => 
                            d.unitcode === props.Code
                        );
                        
                        if (parkVisitData.length > 0) {
                            setTimeout(() => {
                                createHeatmap(
                                    parkVisitData, 
                                    d3.select(`#heatmap-${props.Code}`)
                                );
                            }, 100);
                        }
                    });
            });
    });
}).catch(error => console.error('Error loading data:', error));

// Your existing createHeatmap function here

// Your existing createHeatmap function here
function createHeatmap(data, container) {
    // Set up dimensions and margins
    const margin = { top: 80, right: 30, bottom: 80, left: 80 };

    // Get container width for responsive sizing
    const containerWidth = container.node().getBoundingClientRect().width;
  
    // Extract and sort years
    const years = Array.from(d3.group(data, d => d.year)).map(d => +d[0]).sort((a, b) => a - b);
    const months = d3.range(1, 13);
  
    // Calculate cell size based on container width and number of cells
    const cellSize = Math.min(
        (containerWidth - margin.left - margin.right) / years.length,
        15 // Maximum cell size
    );

    // Define seasons (0-based month indices)
    const seasonBreaks = [2, 5, 8, 11]; // After Feb, May, Aug, Nov
    const seasonGapSize = cellSize * 0.2; // Size of gap between seasons

    // Calculate dimensions based on cell size
    // Modify the height calculation to account for gaps
    const totalGapsHeight = seasonGapSize * 3; // 3 gaps between 4 seasons
    const height = (months.length * cellSize) + totalGapsHeight;
    const width = years.length * cellSize;
  
    // Create SVG container
    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Define scales
    const xScale = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.05);
    
    // Modify yScale to account for seasonal gaps
    const yScale = d3.scaleBand()
        .domain(months)
        .range([0, height])
        .padding(0.05);

    // Function to adjust y-position based on seasonal gaps
    function getAdjustedY(month) {
        const monthIndex = month - 1;
        const numGapsBefore = seasonBreaks.filter(breakMonth => monthIndex > breakMonth).length;
        return yScale(month) + (numGapsBefore * seasonGapSize);
    }
    
    // Color scale remains the same
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([d3.min(data, d => d.visitors), d3.max(data, d => d.visitors)]);
  
    // Add legend
    const legendWidth = 200;
    const legendHeight = 20;
  
    const legendScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.visitors), d3.max(data, d => d.visitors)])
      .range([0, legendWidth]);
  
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", `legend-gradient-${data[0].parkname.replace(/\s+/g, '-')}`)
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");
  
    gradient.selectAll("stop")
      .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: colorScale(t) })))
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
  
    // Append legend rectangle
    svg.append("rect")
      .attr("x", width / 2 - legendWidth / 2)
      .attr("y", -margin.top / 2 - legendHeight / 2)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", `url(#legend-gradient-${data[0].parkname.replace(/\s+/g, '-')})`);
  
    // Add legend axis
    const legendAxis = d3.axisTop(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".2s")); // Use SI prefix formatting for large numbers
  
    svg.append("g")
      .attr("transform", `translate(${width / 2 - legendWidth / 2},${-margin.top / 2 - legendHeight / 2})`)
      .call(legendAxis);
  
    // Update cell positions
    svg.selectAll(".cell")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", d => xScale(d.year))
        .attr("y", d => getAdjustedY(d.month))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.visitors))
        .append("title")
        .text(d => `Year: ${d.year}, Month: ${d.month}, Visitors: ${d3.format(",")(d.visitors)}`);
  
    // Add X axis with correctly adjusted position
    svg.append("g")
        .attr("transform", `translate(0,${height+cellSize})`) // Now positioned at the very bottom of the heatmap
        .call(d3.axisBottom(xScale)
            .tickFormat(d => {
                if (d === years[0] || 
                    d === years[years.length - 1] || 
                    (d % 5 === 0 && d !== years[0] && d !== years[years.length - 1])) {
                    return d;
                }
                return '';
            })
        )
        .selectAll("text")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start")
        .attr("dx", "0.8em")
        .attr("dy", "-0.5em");
    
    // Update Y axis
    const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => {
        const date = new Date(0);
        date.setUTCMonth(d - 1);
        return d3.timeFormat("%b")(date);
    });

    // Create custom Y axis with gaps
    const yAxisGroup = svg.append("g")
        .attr("class", "y-axis");

    // Draw y-axis lines and labels with gaps
    months.forEach(month => {
    const y = getAdjustedY(month);
    
    // Add month label
    yAxisGroup.append("text")
        .attr("x", -10)
        .attr("y", y + (yScale.bandwidth() / 2))
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .text(d3.timeFormat("%b")(new Date(0, month - 1)));
    
    // Add tick line
    yAxisGroup.append("line")
        .attr("x1", -6)
        .attr("x2", 0)
        .attr("y1", y + (yScale.bandwidth() / 2))
        .attr("y2", y + (yScale.bandwidth() / 2))
        .attr("stroke", "black");
});
  
    // Add pandemic period highlight
    if (years.includes(2020)) {
      const startMonth = 1; // January
      const endMonth = 5;   // May
      const startX = xScale(2020);
      const startY = yScale(startMonth);
      const width = xScale.bandwidth();
      const height = yScale(endMonth) + yScale.bandwidth() - yScale(startMonth);
  
      svg.append("rect")
        .attr("x", startX)
        .attr("y", startY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .append("title")
        .text("COVID-19 Pandemic Period");
    }
  
    // Axis labels
    svg.append("text")
        .attr("transform", `translate(${width / 2},${height + margin.bottom})`)
        .style("text-anchor", "middle")
        .text("Year");
 
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Month");
  }