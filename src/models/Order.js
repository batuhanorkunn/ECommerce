const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    materialNo: String,
    name: String,
    price: Number,   // sipariş anındaki fiyat snapshot
    qty: Number,
    image: String,
  },
  { _id: false }
);

const AmountsSchema = new mongoose.Schema(
  {
    itemsTotal: Number,
    shippingFee: Number,
    discountTotal: Number,
    taxTotal: Number,
    grandTotal: Number,
  },
  { _id: false }
);

const AddressSnapshotSchema = new mongoose.Schema(
  {
    title: String,
    address: String,
    city: String,
    district: String,
    zip: String,
  },
  { _id: false }
);

const PaymentSchema = new mongoose.Schema(
  {
    method: { type: String, default: "card" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    txnId: String,
    provider: { type: String, default: "mock" },
  },
  { _id: false }
);

//Kargo bilgisi (ayrı koleksiyon yok) 
const ShippingSchema = new mongoose.Schema(
  {
    carrier: { type: String, default: "manual" }, // ptt|yurtici|aras... (şimdilik manual)
    trackingNo: { type: String },
    status: { type: String, enum: ["none", "shipped", "delivered"], default: "none" },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    items: [OrderItemSchema],
    amounts: AmountsSchema,                
    addressSnapshot: AddressSnapshotSchema,
    payment: PaymentSchema,                
    shipping: { type: ShippingSchema, default: () => ({}) }, 
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "canceled"],
      default: "pending",
    },
    meta: {
      idempotencyKey: { type: String, index: true },
    },
  },
  { timestamps: true }
);

// Aynı kullanıcı + aynı idempotency ile tekrar oluşturmayı engelle (opsiyonel)
OrderSchema.index(
  { "meta.idempotencyKey": 1, user: 1 },
  { unique: true, partialFilterExpression: { "meta.idempotencyKey": { $exists: true } } }
);

module.exports = mongoose.model("Order", OrderSchema);
