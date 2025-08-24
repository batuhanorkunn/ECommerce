const router = require("express").Router();
const { authRequired } = require("../middlewares/authMiddleware");
const { body, param, validationResult } = require("express-validator");
const shippingService = require("../services/shippingService");

/* küçük validator helper */
const v = (req, res, next) => {
  const e = validationResult(req);
  if (!e.isEmpty()) return res.status(400).json({ message: "Doğrulama hatası", errors: e.array() });
  next();
};

/**
 * @swagger
 * tags:
 *   name: AdminOrders
 *   description: Admin sipariş kargo işlemleri
 */

/**
 * @swagger
 * /admin/orders/{id}/ship:
 *   post:
 *     summary: Siparişi kargoya ver (basit)
 *     tags: [AdminOrders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carrier: { type: string, example: "yurtici" }
 *               trackingNo: { type: string, example: "TRK-ABC12345" }
 *     responses:
 *       200:
 *         description: Sipariş shipped oldu
 */
router.post(
  "/orders/:id/ship",
  authRequired("admin"),
  [param("id").isMongoId(), body("carrier").optional().isString(), body("trackingNo").optional().isString()],
  v,
  async (req, res) => {
    try {
      const data = await shippingService.shipOrder({
        orderId: req.params.id,
        carrier: req.body.carrier,
        trackingNo: req.body.trackingNo,
      });
      res.json(data);
    } catch (err) {
      res.status(400).json({ message: "Kargoya verme başarısız", error: err.message });
    }
  }
);

/**
 * @swagger
 * /admin/orders/{id}/mark-delivered:
 *   post:
 *     summary: Siparişi teslim edildi olarak işaretle
 *     tags: [AdminOrders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200:
 *         description: Sipariş delivered oldu
 */
router.post(
  "/orders/:id/mark-delivered",
  authRequired("admin"),
  [param("id").isMongoId()],
  v,
  async (req, res) => {
    try {
      const data = await shippingService.markDelivered({ orderId: req.params.id });
      res.json(data);
    } catch (err) {
      res.status(400).json({ message: "Teslim işareti başarısız", error: err.message });
    }
  }
);

module.exports = router;
