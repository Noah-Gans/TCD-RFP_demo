import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Water Dashboard Demo</h1>
        <p>Welcome to your new React site!</p>
        <div className="features">
          <div className="feature-card">
            <h2>🌊 Water Quality</h2>
            <p>Monitor water quality metrics in real-time</p>
          </div>
          <div className="feature-card">
            <h2>📊 Analytics</h2>
            <p>Visualize data with interactive charts</p>
          </div>
          <div className="feature-card">
            <h2>🔔 Alerts</h2>
            <p>Get notified of important changes</p>
          </div>
        </div>
      </header>
    </div>
  )
}

export default App

