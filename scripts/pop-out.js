d3.csv("data/visit_data.csv").then(data => {
    // Process data
    const processedData = data.map(d => ({
      year: +d.Year,
      month: +d.Month,
      visitors: +d.RecreationVisits,
      parkname: d.ParkName,
      unitcode: d.UnitCode
    }));
  
    // Get unique park names
    const parks = [...new Set(processedData.map(d => d.parkname))];
    
    // Create a container div for all heatmaps
    const container = d3.select("body")
      .append("div")
      .attr("class", "container mx-auto px-4 py-8 grid grid-cols-1 gap-8");
  
    // Create a heatmap for each park
    parks.forEach(park => {
      const parkData = processedData.filter(d => d.parkname === park);
      
      // Create div for this park's heatmap
      const parkDiv = container.append("div")
        .attr("id", `heatmap-${park.replace(/\s+/g, '-')}`)
        .attr("class", "flex flex-col items-center bg-white rounded-lg shadow-lg p-6");
      
      // Add park name as header
      parkDiv.append("h2")
        .attr("class", "text-2xl font-bold mb-6 text-gray-800")
        .text(park);
      
      createHeatmap(parkData, parkDiv);
    });
  }).catch(error => {
    console.error("Error loading csv file:", error);
  });
  
  // Function to create the heatmap
  function createHeatmap(data, container) {
    // Set up dimensions and margins
    const margin = { top: 80, right: 30, bottom: 80, left: 80 };
  
    // Extract and sort years
    const years = Array.from(d3.group(data, d => d.year)).map(d => +d[0]).sort((a, b) => a - b);
    const months = d3.range(1, 13);
  
    // Calculate cell size and dimensions
    const cellSize = 15;
    const width = years.length * cellSize;
    const height = months.length * cellSize;
  
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
  
    const yScale = d3.scaleBand()
      .domain(months)
      .range([0, height])
      .padding(0.05);
  
    // Use a separate color scale for each park based on its own min/max values
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
  
    // Add cells
    svg.selectAll(".cell")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.month))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.visitors))
      .append("title")
      .text(d => `Year: ${d.year}, Month: ${d.month}, Visitors: ${d3.format(",")(d.visitors)}`);
  
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => {
        if (d === years[0] || d === years[years.length - 1] || d === 2000) {
          return d; // Show full year for first and last
        } else {
          return String(d).slice(-2); // Show last two digits for others
        }
      }))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
  
    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => {
        const date = new Date(0);
        date.setUTCMonth(d - 1);
        return d3.timeFormat("%b")(date);
      }));
  
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
  
    // Add axis labels
    svg.append("text")
      .attr("transform", `translate(${width / 2},${height + margin.top + 20})`)
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