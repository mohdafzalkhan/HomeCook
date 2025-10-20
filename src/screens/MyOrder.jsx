import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import "./MyOrder.css";

export default function MyOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyOrders = async () => {
  try {
    setLoading(true);
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setError("You need to login first");
      setLoading(false);
      return;
    }

    const res = await fetch(`${API_URL}/api/myOrderData`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail }),
    });

    if (!res.ok) throw new Error("Failed to fetch orders");

    const data = await res.json();

    // Sort orders by date descending (latest first)
    const sortedOrders = (data.orders || []).sort(
      (a, b) => new Date(b.order_date) - new Date(a.order_date)
    );

    setOrders(sortedOrders);
  } catch (err) {
    console.error("Fetch orders failed:", err);
    setError("Failed to fetch orders: " + err.message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchMyOrders();
  }, []);

  const statuses = ["Placed", "Accepted", "Cooking", "Out for Delivery", "Delivered", "Cancelled"];

  return (
    <>
      <Navbar />
      <div className="myorder-container container py-4">
        <h2 className="text-center mb-4">My Orders</h2>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status" />
            <p className="mt-3">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger mt-3 text-center">{error}</div>
        ) : orders.length === 0 ? (
          <h5 className="text-center text-muted">You have no past orders.</h5>
        ) : (
          [...orders].reverse().map((order) => {
            const currentStep = statuses.indexOf(order.status);

            // Only keep items with qty > 0
            const validItems = order.items?.filter(item => item.qty && item.qty > 0) || [];

            return (
              <div key={order._id} className="mb-4">
                <h6 className="order-date text-center mb-3">
                  <span className="badge bg-light text-dark shadow-sm px-3 py-2">
                    Order ID: {order._id}
                  </span>
                </h6>

                {/* Tracking info */}
                <div className="track-container mb-3">
                  <h6 className="track-title">Tracking Info</h6>
                  <div className="track-progress-bar mb-2">
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
                  <p className='status'><strong>Status:</strong> {order.status}</p>
                  {order.estimatedDeliveryTime && (
                    <p className='delivery'><strong>Estimated Delivery:</strong> {order.estimatedDeliveryTime}</p>
                  )}
                  <ul>
                    {order.trackingUpdates?.map((update, i) => (
                      <li key={i} className="update-item">
                        {update.message} — {update.timestamp ? new Date(update.timestamp).toLocaleString() : ""}
                      </li>
                    ))}
                  </ul>
                   {/* Items in order */}
                <div className="row justify-content-center gx-4 gy-4">
                  {validItems.map((item, itemIdx) => (
                    <div key={itemIdx} className="col-12 col-sm-6 col-md-4 col-lg-3">
                      <div className="order-card shadow-sm rounded-4 overflow-hidden h-100">
                        <img
                          src={item.img || "https://via.placeholder.com/150"}
                          alt={item.title || "No name"}
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
                </div>

               
              </div>
            );
          })
        )}
      </div>
      <Footer />
    </>
  );
}
