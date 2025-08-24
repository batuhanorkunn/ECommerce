// src/app.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();
const port = process.env.PORT || 3000;

/* === CORS (cookie için credentials:true) === */
const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000"
)
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman / curl gibi origin olmayan durumları da kabul et
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS engellendi: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    // CSRF header yok; fakat checkout için Idempotency-Key ekledik
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
  })
);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// (Reverse proxy/ingress arkasında Secure cookie kullanacaksan aç)
/// app.set("trust proxy", 1);

/* CORS hatalarını JSON döndür (uygulama çökmesin) */
app.use((err, _req, res, next) => {
  if (err && /CORS/.test(String(err.message || ""))) {
    return res.status(403).json({ message: err.message });
  }
  next(err);
});

/* Basit sağlık kontrolü */
app.get("/healthz", (_req, res) => res.json({ ok: true }));

/* İstek logger (debug) */
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log("Body:", req.body);
  console.log("Query:", req.query);
  console.log("Params:", req.params);
  console.log("End of Request");
  next();
});

/* === ROUTES === */
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes"); // ✅ EKLENDİ
const adminOrderRoutes = require("./routes/adminOrderRoutes");


app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes); // ✅ EKLENDİ
app.use("/api/admin", adminOrderRoutes);


app.get("/", (_req, res) => {
  res.send("Merhaba, Node.js çok katmanlı mimari backend projesi çalışıyor!");
});

/* 404 */
app.use((req, res, next) => {
  if (res.headersSent) return next();
  res.status(404).json({ message: "Endpoint bulunamadı" });
});

/* Genel hata yakalama */
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Sunucu hatası" });
});

/* === MongoDB bağlantısı & server === */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB bağlantısı başarılı!");
    console.log("CORS allowed origins:", allowedOrigins);
    app.listen(port, () => {
      console.log(`Server çalışıyor: http://localhost:${port}`);
      console.log(`Swagger UI:      http://localhost:${port}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("MongoDB bağlantı hatası:", err);
  });

module.exports = app;
