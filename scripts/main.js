// National Parks Data (example data)
const parksData = [
    { name: "Yosemite", lat: 37.8651, lng: -119.5383, visitors: [10000, 12000, 15000, 13000, 14000, 16000, 17000] },
    { name: "Yellowstone", lat: 44.4280, lng: -110.5885, visitors: [20000, 22000, 25000, 23000, 24000, 26000, 27000] },
    { name: "Haleakalā", lat: 20.7208, lng: -156.1552, visitors: [5000, 6000, 7000, 6500, 6800, 7200, 7500] },
    { name: "Denali", lat: 63.1148, lng: -151.1926, visitors: [8000, 8500, 9000, 8700, 8800, 9200, 9500] }
];

// Initialize Maps
const maps = [
    { id: 'map-usa', center: [37.0902, -95.7129], zoom: 4 }, // Mainland USA
    { id: 'map-hawaii', center: [20.7984, -156.3319], zoom: 7 }, // Hawaii
    { id: 'map-alaska', center: [64.2008, -149.4937], zoom: 4 } // Alaska
];

maps.forEach(mapConfig => {
    const map = new NPMap.Map({
        target: mapConfig.id,
        center: { lat: mapConfig.center[0], lng: mapConfig.center[1] },
        zoom: mapConfig.zoom,
        baseLayers: NPMap.Config.baselayers,
        overlays: parksData
            .filter(park => {
                if (mapConfig.id === 'map-usa') {
                    return park.lng > -130 && park.lat > 24; // Mainland USA bounds
                } else if (mapConfig.id === 'map-hawaii') {
                    return park.lat < 25; // Hawaii bounds
                } else if (mapConfig.id === 'map-alaska') {
                    return park.lat > 55; // Alaska bounds
                }
                return false;
            })
            .map(park => ({
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [park.lng, park.lat]
                    },
                    properties: {
                        name: park.name,
                        visitors: park.visitors
                    }
                },
                popup: {
                    title: park.name,
                    description: `<div id="chart-${park.name.replace(/\s+/g, '-').toLowerCase()}"></div>`
                }
            }))
    });

    // Add D3 charts to popups
    map.on('popupopen', (e) => {
        const parkName = e.popup._content.querySelector('h3').textContent;
        const park = parksData.find(p => p.name === parkName);
        const chartDiv = e.popup._content.querySelector(`#chart-${parkName.replace(/\s+/g, '-').toLowerCase()}`);

        if (park && chartDiv) {
            const svg = d3.select(chartDiv)
                .append('svg')
                .attr('width', 200)
                .attr('height', 100);

            svg.selectAll('rect')
                .data(park.visitors)
                .enter()
                .append('rect')
                .attr('x', (d, i) => i * 25)
                .attr('y', d => 100 - d / 300)
                .attr('width', 20)
                .attr('height', d => d / 300)
                .attr('fill', 'teal');
        }
    });
});