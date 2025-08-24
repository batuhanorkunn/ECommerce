const router = require("express").Router();
const { authRequired } = require("../middlewares/authMiddleware");
const orderController = require("../controllers/orderController");
const shippingService = require("../services/shippingService");
const { body, param, query, header, validationResult } = require("express-validator");

/* --- validate helper --- */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Doğrulama hatası", errors: errors.array() });
  }
  next();
};

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Sipariş işlemleri
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Sepetten sipariş oluştur
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: false
 *         schema: { type: string }
 *         description: Aynı isteğin tekrarlanmasını engelleyen anahtar
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreateRequest'
 *           examples:
 *             withAddress:
 *               summary: Seçili adres ile
 *               value: { "addressId": "66c2f8d2e9f1a2b345678901" }
 *             defaultAddress:
 *               summary: Göndermezsen varsayılan adres kullanılır
 *               value: {}
 *     responses:
 *       201:
 *         description: Sipariş oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Doğrulama/iş kuralı hatası
 *
 *   get:
 *     summary: Kullanıcının siparişlerini listele
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Sipariş listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Tek siparişi getir
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sipariş
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Bulunamadı
 */

/**
 * @swagger
 * /orders/{id}/confirm-payment:
 *   post:
 *     summary: Ödemeyi onayla (mock)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmPaymentRequest'
 *     responses:
 *       200:
 *         description: Ödeme onaylandı, sipariş güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Ödeme hatası
 */

/**
 * @swagger
 * /orders/{id}/shipping:
 *   get:
 *     summary: Siparişin basit kargo bilgisi
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Kargo bilgisi ve sipariş durumu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shipping:
 *                   type: object
 *                   properties:
 *                     carrier: { type: string }
 *                     trackingNo: { type: string }
 *                     status: { type: string, enum: [none, shipped, delivered] }
 *                     shippedAt: { type: string, format: date-time }
 *                     deliveredAt: { type: string, format: date-time }
 *                 status:
 *                   type: string
 */

// === Sipariş oluştur (checkout)
router.post(
  "/",
  authRequired(),
  [
    header("Idempotency-Key").optional().isString().withMessage("Idempotency-Key string olmalı"),
    // addressId opsiyonel: göndermezsen servis varsayılan adresi kullanır
    body("addressId").optional().isMongoId().withMessage("Geçersiz addressId"),
  ],
  handleValidation,
  orderController.createOrder
);

// === Siparişleri listele (kullanıcı)
router.get(
  "/",
  authRequired(),
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page >= 1 olmalı"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit 1-100 arası olmalı"),
  ],
  handleValidation,
  orderController.listMyOrders
);

// === Tek sipariş
router.get(
  "/:id",
  authRequired(),
  [param("id").isMongoId().withMessage("Geçersiz id")],
  handleValidation,
  orderController.getMyOrderById
);

// === Ödeme onayı (mock)
router.post(
  "/:id/confirm-payment",
  authRequired(),
  [
    param("id").isMongoId().withMessage("Geçersiz id"),
    body("cardToken").trim().notEmpty().withMessage("cardToken gerekli"),
  ],
  handleValidation,
  orderController.confirmPayment
);

// === Kullanıcı: kargo bilgisi (basit)
router.get(
  "/:id/shipping",
  authRequired(),
  [param("id").isMongoId().withMessage("Geçersiz id")],
  handleValidation,
  async (req, res) => {
    try {
      const data = await shippingService.getShippingByOrder({
        orderId: req.params.id,
        userId: req.user.id,
      });
      if (!data) return res.status(404).json({ message: "Sipariş bulunamadı" });
      res.json(data);
    } catch (err) {
      res.status(400).json({ message: "Kargo bilgisi alınamadı", error: err.message });
    }
  }
);

module.exports = router;
