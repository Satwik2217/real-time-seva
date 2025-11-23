import React, { useEffect, useState } from "react";
import axios from "axios";
import { customerSocket } from "../socket/socketManager";

function JobForm() {
  const [socketId, setSocketId] = useState(null);
  const [status, setStatus] = useState("Connecting...");
  const [trackingLocation, setTrackingLocation] = useState(null);

  useEffect(() => {
    customerSocket.on("connect", () => setSocketId(customerSocket.id));

    customerSocket.on("vendorAccepted", (data) => {
      setStatus(
        `✅ Vendor Accepted! ID: ${data.vendorId}. Awaiting location...`
      );
    });

    customerSocket.on("trackingUpdate", (data) => {
      setStatus("🚚 Vendor Tracking Active...");
      setTrackingLocation(data);
    });

    return () => {
      customerSocket.off("connect");
      customerSocket.off("vendorAccepted");
      customerSocket.off("trackingUpdate");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!socketId) {
      alert("Socket not connected yet. Please wait.");
      return;
    }

    setStatus("Searching for nearest Vendor...");

    const jobData = {
      serviceType: "Plumber",
      customerLon: -74.005,
      customerLat: 40.713,
      customerSocketId: socketId,
      description: "Leaky faucet",
    };

    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/jobs/dispatch`,
        jobData
      );
      setStatus("Job Dispatched. Waiting for Vendor Acceptance...");
    } catch (error) {
      setStatus("❌ Error dispatching job. Check server logs.");
      console.error(error);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "20px" }}>
      <h2>1. Post a New Job</h2>
      <p>
        Your Socket ID (for tracking replies):{" "}
        <strong>{socketId || "N/A"}</strong>
      </p>
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          style={{ padding: "10px", backgroundColor: "blue", color: "white" }}
        >
          Dispatch Plumber Job
        </button>
      </form>

      <h2 style={{ marginTop: "30px" }}>2. Live Status</h2>
      <p>
        Status: <strong>{status}</strong>
      </p>
      {trackingLocation && (
        <div style={{ background: "#e0ffe0", padding: "10px" }}>
          <p>Vendor Live Location:</p>
          <p>
            Lat: {trackingLocation.lat.toFixed(6)}, Lon:{" "}
            {trackingLocation.lon.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}

export default JobForm;
