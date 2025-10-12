const mongoose = require('mongoose')

const { Schema } = mongoose;

const OrderSchema = new Schema({
    email: { type: String, required: true },
    items: { type: Array, required: true },

    status: {
  type: String,
  enum: ["Placed", "Accepted", "Cooking", "Out for Delivery", "Delivered", "Cancelled"],
  default: "Placed"
},
estimatedDeliveryTime: {
  type: String,
},
trackingUpdates: [
  {
    message: String,
    timestamp: { type: Date, default: Date.now }
  }
]

});

module.exports = mongoose.model('order', OrderSchema)