import React, { useState } from 'react';
import { Map, Marker, Popup } from 'react-map-gl';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

// USGS Water Monitoring Stations
const stations = [
  {
    id: '13014500',
    name: 'GROS VENTRE RIVER AT KELLY, WY',
    latitude: 43.62088889,
    longitude: -110.6230556,
    hasTemperature: true
  },
  {
    id: '13018750',
    name: 'SNAKE RIVER BELOW FLAT CREEK, NEAR JACKSON, WY',
    latitude: 43.3722222,
    longitude: -110.7386111,
    hasTemperature: true
  },
  {
    id: '13018300',
    name: 'CACHE CREEK NEAR JACKSON, WY',
    latitude: 43.45213098,
    longitude: -110.7041203,
    hasTemperature: true
  },
  {
    id: '13018350',
    name: 'FLAT CREEK BELOW CACHE CREEK, NEAR JACKSON, WY',
    latitude: 43.4583611,
    longitude: -110.7970278,
    hasTemperature: true
  },
  {
    id: '13016450',
    name: 'FISH CREEK AT WILSON, WY',
    latitude: 43.50076005,
    longitude: -110.8716,
    hasTemperature: true
  },
  {
    id: '13015000',
    name: 'GROS VENTRE RIVER AT ZENITH, WY',
    latitude: 43.5572222,
    longitude: -110.7627778,
    hasTemperature: false
  }
];

const PARAMETERS = {
  FLOW: { code: '00060', name: 'Streamflow', unit: 'ft³/s', label: 'Flow' },
  TEMP: { code: '00010', name: 'Water Temperature', unit: '°C', label: 'Temperature' }
};

function WaterMap() {
  const [viewState, setViewState] = useState({
    longitude: -110.72,
    latitude: 43.50,
    zoom: 9.5
  });
  
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationData, setStationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState('FLOW');

  // Function to fetch data for the past week
  const fetchStationData = async (station, parameter = 'FLOW') => {
    setLoading(true);
    try {
      // Calculate dates for the past week
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      // Format dates for USGS API (ISO format)
      const startDateStr = startDate.toISOString().split('.')[0] + '.000-06:00';
      const endDateStr = endDate.toISOString().split('.')[0] + '.999-06:00';
      
      const paramCode = PARAMETERS[parameter].code;
      const url = `https://nwis.waterservices.usgs.gov/nwis/iv/?sites=${station.id}&agencyCd=USGS&startDT=${startDateStr}&endDT=${endDateStr}&parameterCd=${paramCode}&format=json`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Extract the values from the response
      const timeSeries = data.value?.timeSeries?.[0];
      const values = timeSeries?.values?.[0]?.value || [];
      
      setStationData({
        station,
        parameter,
        values: values.slice(-50), // Get last 50 readings
        allValues: values
      });
    } catch (error) {
      console.error('Error fetching station data:', error);
      setStationData({ error: 'Failed to load data' });
    }
    setLoading(false);
  };

  const handleParameterChange = (parameter) => {
    setSelectedParameter(parameter);
    if (selectedStation) {
      fetchStationData(selectedStation, parameter);
    }
  };

  const handleMarkerClick = (station) => {
    setSelectedStation(station);
    setSelectedParameter('FLOW'); // Reset to flow when opening new station
    fetchStationData(station, 'FLOW');
  };

  const calculateStats = (values) => {
    if (!values || values.length === 0) return null;
    
    const numericValues = values.map(v => parseFloat(v.value)).filter(v => !isNaN(v));
    
    if (numericValues.length === 0) return null;
    
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    const latest = numericValues[numericValues.length - 1];
    
    return { min, max, avg, latest };
  };

  return (
    <div className="map-container">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100vh' }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken="pk.eyJ1Ijoibm9haC1nYW5zIiwiYSI6ImNtZ3lqc2kxbjFrZmEybHEyb29mYmU3Z20ifQ.Oc5oFX008aYDUBJD1svTwQ"
      >
        {stations.map(station => (
          <Marker
            key={station.id}
            longitude={station.longitude}
            latitude={station.latitude}
            anchor="bottom"
          >
            <div 
              className="marker"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkerClick(station);
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" className="marker-icon">
                <circle cx="20" cy="20" r="18" fill="#2a5298" stroke="#fff" strokeWidth="3"/>
                <path d="M20 10 C20 10, 15 15, 15 20 C15 23, 17 25, 20 25 C23 25, 25 23, 25 20 C25 15, 20 10, 20 10 Z" fill="#fff"/>
                <circle cx="20" cy="20" r="3" fill="#61dafb"/>
              </svg>
            </div>
          </Marker>
        ))}

        {selectedStation && (
          <Popup
            longitude={selectedStation.longitude}
            latitude={selectedStation.latitude}
            anchor="top"
            onClose={() => {
              setSelectedStation(null);
              setStationData(null);
            }}
            closeButton={false}
            closeOnClick={false}
            maxWidth="95vw"
            className="station-popup"
          >
            <div className="popup-content">
              <button 
                className="popup-close-btn"
                onClick={() => {
                  setSelectedStation(null);
                  setStationData(null);
                }}
                aria-label="Close popup"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div className="popup-header">
                <h3>{selectedStation.name}</h3>
                <p className="station-id">Station ID: {selectedStation.id}</p>
              </div>
              
              {/* Parameter Selection Buttons */}
              <div className="parameter-selector">
                <button 
                  className={`parameter-btn ${selectedParameter === 'FLOW' ? 'active' : ''}`}
                  onClick={() => handleParameterChange('FLOW')}
                >
                  <span className="param-icon">💧</span>
                  <span className="param-label">{PARAMETERS.FLOW.label}</span>
                </button>
                {selectedStation.hasTemperature && (
                  <button 
                    className={`parameter-btn ${selectedParameter === 'TEMP' ? 'active' : ''}`}
                    onClick={() => handleParameterChange('TEMP')}
                  >
                    <span className="param-icon">🌡️</span>
                    <span className="param-label">{PARAMETERS.TEMP.label}</span>
                  </button>
                )}
              </div>
              
              {loading && <p className="loading">Loading data...</p>}
              
              {stationData && !stationData.error && stationData.values && (
                <div className="data-summary">
                  {(() => {
                    const stats = calculateStats(stationData.allValues);
                    if (!stats) return <p>No data available</p>;
                    
                    // Prepare chart data - sample every 6 hours to keep it readable
                    const chartData = stationData.allValues
                      .filter((_, idx) => idx % 24 === 0) // Sample every 24 readings (6 hours if 15-min intervals)
                      .map(reading => ({
                        time: new Date(reading.dateTime).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit'
                        }),
                        value: parseFloat(reading.value)
                      }));
                    
                    return (
                      <>
                        <div className="stats">
                          <div className="stat">
                            <span className="label">Latest</span>
                            <span className="value">{stats.latest.toFixed(1)}</span>
                          </div>
                          <div className="stat">
                            <span className="label">Avg</span>
                            <span className="value">{stats.avg.toFixed(1)}</span>
                          </div>
                          <div className="stat">
                            <span className="label">Min</span>
                            <span className="value">{stats.min.toFixed(1)}</span>
                          </div>
                          <div className="stat">
                            <span className="label">Max</span>
                            <span className="value">{stats.max.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <div className="chart-container">
                          <h4>Past Week Trend - {PARAMETERS[stationData.parameter || 'FLOW'].name} ({PARAMETERS[stationData.parameter || 'FLOW'].unit})</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                              <XAxis 
                                dataKey="time" 
                                tick={{ fontSize: 10 }}
                                interval="preserveStartEnd"
                              />
                              <YAxis 
                                tick={{ fontSize: 12 }}
                                domain={['dataMin - 5', 'dataMax + 5']}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  border: '1px solid #2a5298',
                                  borderRadius: '4px'
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#2a5298" 
                                strokeWidth={2}
                                dot={{ fill: '#2a5298', r: 3 }}
                                activeDot={{ r: 5 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
              
              {stationData?.error && (
                <p className="error">{stationData.error}</p>
              )}
            </div>
          </Popup>
        )}
      </Map>
      
      <div className={`map-legend ${selectedStation ? 'legend-hidden' : ''}`}>
        <h3>USGS Water Monitoring Stations</h3>
        <p>6 streamflow monitoring sites near Jackson, WY</p>
        <p className="legend-subtitle">Click on a marker to view past week's flow data</p>
      </div>
    </div>
  );
}

export default WaterMap;

