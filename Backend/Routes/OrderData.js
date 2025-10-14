const express = require('express');
const router = express.Router();
const Order = require('../models/Orders');

router.post('/orderData', async (req, res) => {
  try {
   const newOrder = await Order.create({
  email: req.body.email,
  items: req.body.order_data,  // keep items as is
  order_date: new Date(),      // ✅ keep this, ensures proper Date object
  status: "Placed",
  estimatedDeliveryTime: "30–40 min",
  trackingUpdates: [{ message: "Order placed successfully", timestamp: new Date() }]
});



    res.status(200).json({ success: true, message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch all orders for a user along with tracking info
router.post('/myOrderData', async (req, res) => {
  try {
    const userOrders = await Order.find({ email: req.body.email })
      .sort({ order_date: -1 }); // latest first

    if (!userOrders || userOrders.length === 0) {
      return res.status(200).json({ orders: [] });
    }

    // Map orders to include tracking info directly
    const ordersWithTracking = userOrders.map(order => ({
      _id: order._id,
      order_date: order.order_date,
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      items: order.items,
      trackingUpdates: order.trackingUpdates || [
        { message: "Order placed successfully", timestamp: new Date() }
      ],
    }));

    res.status(200).json({ orders: ordersWithTracking });
  } catch (error) {
    console.error("Error fetching user orders:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Track order route (fetch by email instead of orderId)
router.get("/track/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);


    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
       _id: order._id,
      status: order.status || "Placed",
      estimatedDeliveryTime: order.estimatedDeliveryTime || "30–40 min",
      trackingUpdates: order.trackingUpdates || [
        { message: "Order placed successfully", timestamp: new Date() },
      ],
    });
  } catch (error) {
    console.error("Tracking route error:", error);
    res.status(500).json({ error: "Unable to fetch order tracking information" });
  }
});

// Get all orders for chefs
// Get all orders for chefs
router.get("/allOrders", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }); // newest first
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Update order status
// Update order status
router.put("/updateStatus/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const validStatuses = ["Placed", "Accepted", "Cooking", "Out for Delivery", "Delivered", "Cancelled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.status = status;
    // Initialize trackingUpdates if undefined
    order.trackingUpdates = order.trackingUpdates || [];
    order.trackingUpdates.push({ message: `Order ${status}`, timestamp: new Date() });

    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Update order status by email
router.put("/updateStatusByEmail/:email", async (req, res) => {
  const { email } = req.params;
  const { status } = req.body;
  const validStatuses = ["Placed", "Accepted", "Cooking", "Out for Delivery", "Delivered", "Cancelled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const order = await Order.findOneAndUpdate(
      { email },
      { 
        $set: { status },
        $push: { trackingUpdates: { message: `Order ${status}`, timestamp: new Date() } }
      },
      { new: true } // return updated order
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
