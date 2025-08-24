const Order = require("../models/Order");

/* Basit tracking üretici */
function genTracking() {
  return "TRK-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

/* Admin: siparişi kargoya ver (ship) */
async function shipOrder({ orderId, carrier, trackingNo }) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Sipariş bulunamadı");

  if (order.status !== "confirmed") {
    throw new Error('Sipariş "confirmed" durumda olmalı');
  }

  order.shipping = {
    carrier: carrier || "manual",
    trackingNo: trackingNo || genTracking(),
    status: "shipped",
    shippedAt: new Date(),
    deliveredAt: order.shipping?.deliveredAt || null,
  };
  order.status = "shipped";

  await order.save();
  return order;
}

/* Admin: teslim edildi olarak işaretle */
async function markDelivered({ orderId }) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Sipariş bulunamadı");

  if (order.status !== "shipped") {
    throw new Error('Sipariş "shipped" durumda olmalı');
  }

  order.shipping = {
    ...(order.shipping?.toObject ? order.shipping.toObject() : order.shipping),
    status: "delivered",
    deliveredAt: new Date(),
  };
  order.status = "delivered";

  await order.save();
  return order;
}

/* Kullanıcı: kendi siparişinin kargo bilgisi */
function getShippingByOrder({ orderId, userId }) {
  return Order.findOne({ _id: orderId, user: userId }).select("shipping status");
}

module.exports = { shipOrder, markDelivered, getShippingByOrder };
