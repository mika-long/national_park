mapboxgl.accessToken = 'pk.eyJ1IjoibWlrYS1sb25nIiwiYSI6ImNtNmU0MndwcTEzaTEybHB5c3MwaGd1dGYifQ.vB7eAYlX44RjfDGO77_cTw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-98.5795, 39.8283], // Center on the U.S.
    zoom: 3,
  });

// Overlay deck.gl on top of the Mapbox map 
const deck = new deck.DeckGL({
    container: 'map',
    controller: true,
    mapStyle: 'mapbox://styles/mapbox/streets-v11',
    initialViewState: {
      longitude: -98.5795,
      latitude: 39.8283,
      zoom: 3,
      pitch: 45, // Tilt the map for a 3D effect
      bearing: 0,
    },
    layers: [], // Add layers here
  });

map.on('load', () => {
map.addSource('parks', {
    type: 'geojson',
    data: 'parks.geojson',
});

map.addLayer({
    id: 'parks-spikes',
    type: 'fill-extrusion',
    source: 'parks',
    paint: {
    'fill-extrusion-height': [
        'interpolate',
        ['linear'],
        ['get', 'visitors'], // Use visitor data for height
        0, 0,
        100000, 100000,
    ],
    'fill-extrusion-base': 0,
    'fill-extrusion-color': '#FF0000',
    },
});
});

// Animate the spikes 
let year = 2010;
setInterval(() => {
  map.setPaintProperty('parks-spikes', 'fill-extrusion-height', [
    'interpolate',
    ['linear'],
    ['get', `visitors_${year}`], // Use visitor data for the current year
    0, 0,
    100000, 100000,
  ]);
  year = (year < 2020) ? year + 1 : 2010; // Loop through years
}, 1000);