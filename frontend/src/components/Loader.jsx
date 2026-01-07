import React from "react";

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <div className="spinner"></div>
        <p className="loader-text">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;
