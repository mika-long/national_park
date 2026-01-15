# National Parks Visitor Dashboard (Svelte Version)

A modern, interactive dashboard for visualizing U.S. National Parks visitor data built with **SvelteKit**, **D3.js**, **MapLibre GL**, and **Tailwind CSS**.

## Features

- 🗺️ Interactive maps for Mainland USA, Hawaii, and Alaska using MapLibre GL
- 📊 D3.js heatmap visualizations showing monthly visitor patterns (1980-2021)
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design
- ⚡ Fast and lightweight with Svelte's reactive framework
- 🔧 TypeScript support for type safety

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── MapView.svelte      # MapLibre GL map component
│   │   └── Heatmap.svelte      # D3.js heatmap visualization
│   ├── utils/
│   │   └── index.ts            # Utility functions (cn for Tailwind)
│   ├── types.ts                # TypeScript type definitions
│   └── data-loader.ts          # Data loading and filtering utilities
├── routes/
│   ├── +layout.svelte          # Root layout with CSS imports
│   └── +page.svelte            # Main dashboard page
├── app.css                     # Global styles with Tailwind
└── app.html                    # HTML template
static/
└── data/
    ├── national-parks.geojson  # Park locations
    └── visit_data.csv          # Historical visitation data
```

## Getting Started

### Installation

```bash
# Install dependencies
yarn install
```

### Development

```bash
# Start the dev server
yarn dev

# Open in browser (usually http://localhost:5173)
```

### Build for Production

```bash
# Build the app
yarn build

# Preview the production build
yarn preview
```

## Technologies Used

- **SvelteKit** - Full-stack framework with file-based routing
- **TypeScript** - Type safety and better IDE support
- **D3.js** - Data visualization library for heatmaps
- **MapLibre GL** - Open-source map rendering (Mapbox alternative)
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn-svelte** - Component library (utilities installed)

## Key Improvements Over Vanilla JS Version

1. **Reactive State Management** - Svelte's built-in reactivity eliminates manual DOM manipulation
2. **Component Architecture** - Clean separation of concerns (MapView, Heatmap)
3. **Type Safety** - TypeScript prevents runtime errors
4. **Better Performance** - Svelte compiles to vanilla JS with no virtual DOM overhead
5. **Easier to Extend** - Adding new features (line charts, sliders) is simpler

## Next Steps / Future Enhancements

- [ ] Add line chart component for yearly trends
- [ ] Add year slider control
- [ ] Add chart type switcher (heatmap, line, bar)
- [ ] Add park comparison feature
- [ ] Add data export functionality
- [ ] Improve mobile responsiveness
- [ ] Add animations with Svelte transitions

## Comparison with Original

The original version used:
- Vanilla JavaScript
- Leaflet.js for maps
- Manual DOM manipulation
- No build tooling

This version provides:
- Better code organization
- Type safety
- Easier to maintain and extend
- Modern development experience
- Ready for adding dashboard features

## Data Sources

- National Parks Service (park locations)
- Recreation.gov (visitation data 1980-2021)
