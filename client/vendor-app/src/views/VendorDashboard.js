import React, { useState, useEffect } from "react";
import { useVendorSocket } from "../hooks/useVendorSocket";
import { vendorSocket } from "../socket/socketManager";

const MVP_VENDOR_ID = "654321012345678901234567";

let locationWatcherId = null;

function VendorDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [jobAccepted, setJobAccepted] = useState(false);

  const { jobAlert, isSocketConnected } = useVendorSocket(
    MVP_VENDOR_ID,
    isOnline
  );

  const handleAcceptJob = () => {
    if (jobAlert) {
      vendorSocket.emit("jobAccepted", {
        jobId: jobAlert.jobId,
        customerSocketId: jobAlert.customerSocketId,
        vendorId: MVP_VENDOR_ID,
      });
      setJobAccepted(true);

      locationWatcherId = startTracking(
        jobAlert.jobId,
        jobAlert.customerSocketId
      );

      alert("Job Accepted! Tracking started.");
    }
  };

  const startTracking = (jobId, customerSocketId) => {
    return navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        vendorSocket.emit("vendorLocationUpdate", {
          jobId: jobId,
          customerSocketId: customerSocketId,
          lat: latitude,
          lon: longitude,
        });
      },
      (error) => console.error("Tracking Error:", error.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "20px" }}>
      <h2>1. Availability</h2>
      <p>Socket Status: {isSocketConnected ? "Connected" : "Disconnected"}</p>
      <button
        onClick={() => setIsOnline(!isOnline)}
        style={{
          padding: "15px",
          backgroundColor: isOnline ? "green" : "red",
          color: "white",
        }}
      >
        {isOnline ? "🟢 ONLINE & LISTENING" : "🔴 OFFLINE"}
      </button>

      <h2 style={{ marginTop: "30px" }}>2. Job Alerts</h2>
      {jobAlert && !jobAccepted ? (
        <div
          style={{
            background: "#fff0e0",
            padding: "15px",
            border: "2px solid orange",
          }}
        >
          <h3>🚨 NEW JOB!</h3>
          <p>Description: {jobAlert.description}</p>
          <p>Score: {jobAlert.score.toFixed(3)} (Top Ranked)</p>
          <button
            onClick={handleAcceptJob}
            style={{
              padding: "10px",
              backgroundColor: "darkgreen",
              color: "white",
            }}
          >
            ACCEPT & START TRACKING
          </button>
        </div>
      ) : jobAccepted ? (
        <p style={{ color: "blue" }}>
          Task in Progress. Live Tracking Active...
        </p>
      ) : (
        <p>No active job alerts. Waiting...</p>
      )}
    </div>
  );
}

export default VendorDashboard;
