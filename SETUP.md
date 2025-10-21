# Water Dashboard Setup

## Adding Your Mapbox Token

To use the map, you need to add your Mapbox access token:

1. Open `src/Map.jsx`
2. Find line with `mapboxAccessToken="YOUR_MAPBOX_TOKEN_HERE"`
3. Replace `YOUR_MAPBOX_TOKEN_HERE` with your actual Mapbox token

Example:
```javascript
mapboxAccessToken="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImFiYzEyMyJ9.xyz123"
```

## Running the Application

```bash
npm start
```

The app will open at http://localhost:3000 (or another port if 3000 is busy).

## Features

- **Two USGS Water Monitoring Stations:**
  - GROS VENTRE RIVER AT KELLY, WY (Streamflow data)
  - FLAT CREEK BELOW CACHE CREEK, NEAR JACKSON, WY (Water Temperature data)

- **Interactive Map:**
  - Click on any 💧 marker to view station details
  - Popup shows statistics for the past week
  - View recent readings with timestamps

## Data Source

Data is fetched live from the USGS Water Services API:
https://waterservices.usgs.gov/

