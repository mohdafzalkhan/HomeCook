import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ChefTrackOrder.css";

export default function ChefTrackOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const statuses = ["Placed", "Accepted", "Cooking", "Out for Delivery", "Delivered", "Cancelled"];

  // Fetch all orders from backend
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/allOrders");
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");

      // Sort latest orders first
      const sortedOrders = data.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
      setOrders(sortedOrders);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Auto-refresh every 10 seconds
    const intervalId = setInterval(fetchOrders, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/order/updateStatus/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();

      if (result.success) {
        alert(`Order status updated to ${status}`);
        setOrders(prev =>
          prev.map(o =>
            o._id === orderId
              ? { ...o, status, trackingUpdates: result.order.trackingUpdates }
              : o
          )
        );
      } else {
        alert("Failed to update status: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating order status");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const goToDashboard = () => {
    navigate("/chef-dashboard");
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!orders.length) return <p>No orders found.</p>;

  return (
    <div className="track-container">
      <div className="header-actions mb-4">
        <button className="btn btn-primary" onClick={goToDashboard}>Chef Dashboard</button>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      <h4 className="track-title text-center mb-4">All Orders</h4>

      {orders.map((order, orderIdx) => {
        const currentStep = statuses.indexOf(order.status);
        const validItems = order.items?.filter(item => item.qty && item.qty > 0) || [];
        const trackingUpdates = order.trackingUpdates || [];

        return (
          <div key={`order-${order._id || orderIdx}`} className="track-card mb-4">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Current Status:</strong> {order.status}</p>
            {order.estimatedDeliveryTime && (
              <p><strong>Estimated Delivery:</strong> {order.estimatedDeliveryTime}</p>
            )}

            {/* Progress bar */}
            <div className="track-progress-bar mb-2">
              {statuses.map((status, idx) => (
                <div
                  key={`step-${order._id}-${idx}`}
                  className={`track-step ${idx <= currentStep ? "active" : "inactive"}`}
                  title={status}
                >
                  <div className="step-circle">{idx + 1}</div>
                  <p className="step-label">{status}</p>
                </div>
              ))}
            </div>

            {/* Tracking updates */}
            <div className="track-updates mb-2">
              <h5>Tracking History:</h5>
              <ul>
                {trackingUpdates
                  .slice()
                  .reverse()
                  .map((update, idx) => (
                    <li key={`update-${order._id}-${update._id || idx}-${idx}`}>
                      <strong>{update.message}</strong> —{" "}
                      <span className="text-muted">{update.timestamp ? new Date(update.timestamp).toLocaleString() : ""}</span>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Status buttons */}
            <div className="status-buttons mb-2">
              {statuses.map((s, idx) => (
                <button
                  key={`button-${order._id}-${s}-${idx}`}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to set status to ${s}?`)) {
                      handleStatusUpdate(order._id, s);
                    }
                  }}
                  disabled={s === order.status}
                  className={`btn ${s.toLowerCase().replace(/\s/g,'-')}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Items */}
            {validItems.length > 0 && (
              <div className="row justify-content-center gx-4 gy-4">
                {validItems.map((item, idx) => (
                  <div
                    key={`item-${order._id}-${item._id || idx}-${idx}`}
                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                  >
                    <div className="order-card shadow-sm rounded-4 overflow-hidden h-100">
                      <img
                        src={item.img || "https://via.placeholder.com/150"}
                        alt={item.name || "No name"}
                        className="order-card-img"
                      />
                      <div className="p-3">
                        <h5 className="fw-semibold mb-2">{item.name || "No name"}</h5>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          <span className="badge bg-secondary">Qty: {item.qty}</span>
                          <span className="badge bg-info text-dark">Size: {item.size || "-"}</span>
                        </div>
                        <div className="text-success fw-bold fs-6">₹{item.price || 0}/-</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <hr />
          </div>
        );
      })}
    </div>
  );
}
