import React, { useEffect, useState } from "react";
import "./TrackOrder.css";

export default function TrackOrder() {
  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState("");
  const orderId = localStorage.getItem("currentOrderId");

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        if (!orderId) throw new Error("Order ID not found in localStorage");
        const res = await fetch(`${API_URL}/api/order/track/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch tracking info");

        const data = await res.json();
        setTracking(data);
      } catch (err) {
        console.error(err);
        setError("Unable to fetch order tracking information");
      }
    };

    fetchTracking();
  }, [orderId]);

  if (error) return <p className="track-error">{error}</p>;
  if (!tracking) return <p className="track-loading">Loading tracking info...</p>;

  const statuses = ["Placed", "Accepted", "Cooking", "Out for Delivery", "Delivered", "Cancelled"];
  const currentStep = statuses.indexOf(tracking.status);

  return (
    <div className="track-container">
      <h4 className="track-title">Order Tracking</h4>

      <div className="track-progress-bar">
        {statuses.map((status, index) => (
          <div
            key={status}
            className={`track-step ${index <= currentStep ? "active" : "inactive"}`}
          >
            <div className="step-circle">{index + 1}</div>
            <p className="step-label">{status}</p>
          </div>
        ))}
      </div>

      <div className="track-info">
        <p><strong>Current Status:</strong> {tracking.status}</p>
        {tracking.estimatedDeliveryTime && (
          <p><strong>Estimated Delivery:</strong> {tracking.estimatedDeliveryTime}</p>
        )}
      </div>

      <div className="track-updates">
        <h5>Tracking History:</h5>
        <ul>
          {tracking.trackingUpdates?.map((update, i) => (
            <li key={i}>
              {update.message} — {new Date(update.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
