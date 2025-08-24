const orderService = require("../services/orderService");

module.exports.createOrder = async (req, res) => {
  try {
    const { addressId } = req.body;
    const userId = req.user.id; // authRequired middleware’den geliyor

    const order = await orderService.createFromCart({ userId, addressId, idempotencyKey: req.headers["idempotency-key"] });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: "Sipariş oluşturulamadı", error: err.message });
  }
};

module.exports.listMyOrders = async (req, res) => {
  try {
    const data = await orderService.listByUser(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getMyOrderById = async (req, res) => {
  try {
    const data = await orderService.getByIdForUser(req.params.id, req.user.id);
    if (!data) return res.status(404).json({ message: "Sipariş bulunamadı" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.confirmPayment = async (req, res) => {
  try {
    const data = await orderService.confirmPayment({ orderId: req.params.id, userId: req.user.id, cardToken: req.body.cardToken });
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: "Ödeme onayı başarısız", error: err.message });
  }
};
