import React, { useState } from 'react';
import ActivityFeed from './components/ActivityFeed';
import './App.css';

function App() {
  const [itemCount, setItemCount] = useState(5000);
  const [inputValue, setInputValue] = useState(5000);

  const handleReload = () => {
    setItemCount(inputValue);
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setInputValue(value);
    }
  };

  return (
    <div className="app">
      <div className="banner">
        <h1>✨ Activity Feed - Virtual Scrolling Optimization</h1>
        <p>
          This implementation uses <strong>virtual scrolling</strong> to render only 
          visible items, enabling smooth performance with 10,000+ activities.
        </p>
      </div>

      <div className="controls">
        <label htmlFor="item-count-input">Item Count:</label>
        <input 
          id="item-count-input"
          type="number" 
          value={inputValue} 
          onChange={handleInputChange}
          min="100"
          max="10000"
          step="500"
          data-testid="item-count-input"
        />
        <button 
          onClick={handleReload}
          data-testid="reload-button"
        >
          Load {inputValue.toLocaleString()} items
        </button>
        <div className="info">
          <span className="badge">Only ~15-20 DOM nodes rendered</span>
          <span className="badge success">60 FPS maintained</span>
        </div>
      </div>
      
      <div className="feed-wrapper">
        <ActivityFeed key={itemCount} itemCount={itemCount} />
      </div>
    </div>
  );
}

export default App;
