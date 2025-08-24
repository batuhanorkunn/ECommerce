const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const { User } = require("../models/User");

// Totaller
function calcTotals(items) {
  const itemsTotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shippingFee = itemsTotal >= 1000 ? 0 : 49.9;
  const discountTotal = 0;
  const taxTotal = 0;
  return {
    itemsTotal,
    shippingFee,
    discountTotal,
    taxTotal,
    grandTotal: itemsTotal + shippingFee + taxTotal - discountTotal,
  };
}

// Sepetteki ürünlerden sipariş item snapshot oluştur
async function snapshotItemsFromCart(cartItems) {
  const ids = cartItems.map((ci) => ci.productId);
  const products = await Product.find({ _id: { $in: ids } }).lean();

  return cartItems.map((ci) => {
    const p = products.find((x) => String(x._id) === String(ci.productId));
    if (!p) throw new Error("Ürün bulunamadı: " + ci.productId);

    const firstImage =
      Array.isArray(p.images) && p.images.length
        ? p.images[0]?.url || null
        : null;

    return {
      productId: p._id,
      materialNo: p.materialNo,
      name: ci.name || p.name, // cart snapshot > product
      price: ci.price,         // cart snapshot fiyatını kullan
      qty: ci.quantity,        // cart'ta quantity
      image: firstImage,
    };
  });
}

module.exports.createFromCart = async ({ userId, addressId, idempotencyKey }) => {
  // Idempotency kontrolü
  if (idempotencyKey) {
    const exists = await Order.findOne({
      "meta.idempotencyKey": idempotencyKey,
      user: userId,
    });
    if (exists) return exists;
  }

  // 1) Aktif sepeti oku
  const cartDoc = await Cart.findOne({ userId, status: "active" }).lean();
  if (!cartDoc || !Array.isArray(cartDoc.items) || cartDoc.items.length === 0) {
    throw new Error("Sepet boş");
  }

  // 2) Adres seçimi (addressId varsa o; yoksa varsayılan)
  const userDoc = await User.findById(userId).lean();
  const addr =
    (addressId &&
      userDoc?.addresses?.find((a) => String(a._id) === String(addressId))) ||
    userDoc?.addresses?.find((a) => a.isDefault);
  if (!addr) {
    throw new Error("Adres bulunamadı (seçili ya da varsayılan)");
  }

  // 3) Snapshot + toplamlar
  const items = await snapshotItemsFromCart(cartDoc.items);
  const amounts = calcTotals(items);

  // (Not) Stok: Sen stokları sepete eklerken düşüyorsun.
  // Bu yüzden burada tekrar stok düşme veya iade yapmıyoruz.

  // 4) Siparişi oluştur
  const orderDoc = await Order.create({
    user: userId,
    items,
    amounts,
    addressSnapshot: {
      title: addr.title,
      address: addr.address,
      city: addr.city,
      district: addr.district,
      zip: addr.zip,
    },
    payment: { method: "card", status: "pending", provider: "mock" },
    status: "pending",
    meta: { idempotencyKey },
  });

  // 5) Sepeti kapat: userId unique olduğu için yeni sepete yer açmak adına siliyoruz
  await Cart.deleteOne({ _id: cartDoc._id });

  return orderDoc;
};

module.exports.confirmPayment = async ({ orderId, userId, cardToken }) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new Error("Sipariş bulunamadı");

  if (!cardToken) throw new Error("Kart token gerekli");
  if (order.payment.status === "paid") return order;

  // (Mock) Ödeme onayı
  order.payment.status = "paid";
  order.payment.txnId = "txn_" + Math.random().toString(36).slice(2);
  order.status = "confirmed";

  // Stok zaten sepete eklerken düşmüştü; burada tekrar düşmüyoruz.
  await order.save();
  return order;
};

module.exports.listByUser = (userId) =>
  Order.find({ user: userId }).sort({ createdAt: -1 });

module.exports.getByIdForUser = (id, userId) =>
  Order.findOne({ _id: id, user: userId });
