import React, { useState } from 'react';
import { useCart, useDispatchCart } from '../components/ContextReducer';
import DeleteIcon from '@mui/icons-material/Delete';
import './Cart.css';

export default function Cart() {
  const cartData = useCart();
  const dispatch = useDispatchCart();
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const totalPrice = cartData.reduce((total, food) => total + food.price, 0);

  const handleCheckOut = async () => {
    const userEmail = localStorage.getItem('userEmail');

    if (cartData.length === 0) {
      setModalMessage("Your cart is empty!");
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/orderData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_data: cartData,
          email: userEmail,
          order_date: new Date().toLocaleString(),
        }),
      });

      const result = await response.json();


      if (response.ok && result.success) {
        localStorage.setItem("currentOrderId", result.order._id);
        setModalMessage("✅ Your order has been placed successfully!");
        setShowModal(true);
        dispatch({ type: 'DROP' }); // clear cart
      } else {
        setModalMessage("❌ Failed to place order: " + (result.message || "Unknown error"));
        setShowModal(true);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setModalMessage("❌ Something went wrong while placing your order.");
      setShowModal(true);
    }
  };

  return (
    <div className="cart-container">
      {cartData.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h3>Your Cart is Empty</h3>
          <p>Add some items to your cart to get started!</p>
          <a href="/" className="checkout-btn">🍽️ Start Ordering</a>
        </div>
      ) : (
        <div className="cart-card">
          <h2 className="cart-title">🛍️ Your Cart</h2>
          <table className="cart-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Size</th>
                <th>Price (₹)</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {cartData.map((food, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{food.name}</td>
                  <td>{food.qty}</td>
                  <td>{food.size}</td>
                  <td>₹{food.price}</td>
                  <td>
                    <button onClick={() => dispatch({ type: 'REMOVE', index })}>
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-footer">
            <h4>Total: ₹{totalPrice}</h4>
            <button className="checkout-btn" onClick={handleCheckOut}>
              ✅ Check Out
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
