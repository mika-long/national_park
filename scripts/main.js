// Fetch the GeoJSON file
fetch('data/national-parks.geojson') // Updated path
  .then(response => response.json())
  .then(data => {
    // Filter the features to include only national parks
    const nationalParks = data.features.filter(feature => {
      const name = feature.properties.Name;
      return name.includes('National Park'); // Check if the name includes "National Park"
    });

    // Create a new GeoJSON object with only national parks
    const filteredGeoJSON = {
      type: 'FeatureCollection',
      features: nationalParks
    };

    // Function to filter parks by region based on coordinates
    const filterByRegion = (parks, minLat, maxLat, minLng, maxLng) => {
      return parks.filter(park => {
        const [lng, lat] = park.geometry.coordinates;
        return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
      });
    };

    // Define regions
    const mainlandParks = filterByRegion(filteredGeoJSON.features, 24, 50, -125, -66); // Mainland USA
    const alaskaParks = filterByRegion(filteredGeoJSON.features, 50, 72, -180, -130); // Alaska
    const hawaiiParks = filterByRegion(filteredGeoJSON.features, 18, 23, -161, -154); // Hawaii

    // Initialize maps
    const mapMainland = L.map('map-mainland').setView([37.8, -96], 4); // Mainland USA
    const mapAlaska = L.map('map-alaska').setView([64, -150], 4); // Alaska
    const mapHawaii = L.map('map-hawaii').setView([20, -157], 6); // Hawaii

    // Add base map layers
    const baseMapMainland = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });
    const baseMapAlaska = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      });
      const baseMapHawaii = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      });
    baseMapMainland.addTo(mapMainland);
    baseMapAlaska.addTo(mapAlaska);
    baseMapHawaii.addTo(mapHawaii);

    // Add GeoJSON data to each map separately
    L.geoJSON(mainlandParks, {
      onEachFeature: (feature, layer) => layer.bindPopup(feature.properties.Name)
    }).addTo(mapMainland);

    L.geoJSON(alaskaParks, {
      onEachFeature: (feature, layer) => layer.bindPopup(feature.properties.Name)
    }).addTo(mapAlaska);

    L.geoJSON(hawaiiParks, {
      onEachFeature: (feature, layer) => layer.bindPopup(feature.properties.Name)
    }).addTo(mapHawaii);
  })
  .catch(error => {
    console.error('Error loading the GeoJSON file:', error);
  });
