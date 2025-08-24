// src/config/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "E-Ticaret API",
      version: "1.0.0",
      description: "Katmanlı mimari E-Ticaret backend API dokümantasyonu",
    },
    // ÖNEMLİ: /api burada base path, bu yüzden route JSDoc'larında /orders, /products vb. kullan
    servers: [{ url: "http://localhost:3000/api" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "access_token",
          description: "HttpOnly JWT Token",
        },
      },
      schemas: {
        // ==== AUTH ====
        RegisterRequest: {
          type: "object",
          required: ["name", "tckn", "email", "phone", "password"],
          properties: {
            name: { type: "string" },
            tckn: { type: "string", example: "12345678901" },
            email: { type: "string", format: "email" },
            phone: { type: "string", example: "+905551112233" },
            password: { type: "string", minLength: 8 },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
        },
        AuthUser: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["user", "admin"] },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/AuthUser" },
            accessToken: { type: "string" },
          },
        },

        // ==== PRODUCT ====
        Product: {
          type: "object",
          properties: {
            _id: { type: "string" },
            materialNo: { type: "string" },
            shortText: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            currency: { type: "string", example: "TRY" },
            productType: { type: "string" },
            variant: { type: "object" },
            stock: { type: "integer" },
            // Şeman iki türlü olabilir: string[] ya da obje[]
            images: {
              oneOf: [
                { type: "array", items: { type: "string", format: "uri" } },
                {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["url"],
                    properties: {
                      url: { type: "string", format: "uri" },
                      isPrimary: { type: "boolean", default: false },
                      label: { type: "string" },
                      source: {
                        type: "string",
                        example: "external",
                        description: "external | sap | upload",
                      },
                    },
                  },
                },
              ],
            },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ProductCreate: {
          allOf: [
            { $ref: "#/components/schemas/Product" },
            {
              required: [
                "materialNo",
                "shortText",
                "name",
                "price",
                "productType",
              ],
            },
          ],
        },
        ProductUpdate: { $ref: "#/components/schemas/Product" },

        // ==== CART ====
        CartItem: {
          type: "object",
          required: ["productId", "quantity"],
          properties: {
            productId: { type: "string" },
            quantity: { type: "integer", minimum: 1 },
          },
        },
        Cart: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string" },
                  quantity: { type: "integer" },
                  product: { $ref: "#/components/schemas/Product" },
                },
              },
            },
            status: { type: "string", example: "active" },
          },
        },

        // ==== USER / ADDRESS / CARD ====
        Address: {
          type: "object",
          required: ["title", "address", "city", "district", "zip"],
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            address: { type: "string" },
            city: { type: "string" },
            district: { type: "string" },
            zip: { type: "string" },
            isDefault: { type: "boolean" },
          },
        },
        Card: {
          type: "object",
          properties: {
            _id: { type: "string" },
            holder: { type: "string" },
            brand: { type: "string", example: "VISA" },
            last4: { type: "string", example: "4242" },
            token: { type: "string", description: "Saklanmaz, maskele" },
            isDefault: { type: "boolean" },
          },
        },
        ApiMessage: {
          type: "object",
          properties: { message: { type: "string" } },
        },

        // ==== ORDERS ====
        OrderItem: {
          type: "object",
          properties: {
            productId: { type: "string", example: "66c2f8d2e9f1a2b345678901" },
            materialNo: { type: "string", example: "MAT-100001" },
            name: { type: "string", example: "Nike Air Max 270" },
            price: { type: "number", example: 2999.9 },
            qty: { type: "integer", example: 2 },
            image: { type: "string", example: "https://example.com/img.jpg" },
          },
        },
        Amounts: {
          type: "object",
          properties: {
            itemsTotal: { type: "number", example: 5999.8 },
            shippingFee: { type: "number", example: 0 },
            discountTotal: { type: "number", example: 0 },
            taxTotal: { type: "number", example: 0 },
            grandTotal: { type: "number", example: 5999.8 },
          },
        },
        AddressSnapshot: {
          type: "object",
          properties: {
            title: { type: "string", example: "Ev" },
            address: {
              type: "string",
              example: "Atatürk Mah. Çiçek Sk. No:12 D:4",
            },
            city: { type: "string", example: "İstanbul" },
            district: { type: "string", example: "Kadıköy" },
            zip: { type: "string", example: "34714" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            method: { type: "string", example: "card" },
            status: {
              type: "string",
              enum: ["pending", "paid", "failed", "refunded"],
              example: "pending",
            },
            txnId: { type: "string", example: "txn_abcd1234" },
            provider: { type: "string", example: "mock" },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { type: "string" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            amounts: { $ref: "#/components/schemas/Amounts" },
            addressSnapshot: {
              $ref: "#/components/schemas/AddressSnapshot",
            },
            payment: { $ref: "#/components/schemas/Payment" },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "shipped", "delivered", "canceled"],
              example: "pending",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        OrderCreateRequest: {
          type: "object",
          required: ["addressId"],
          properties: {
            addressId: { type: "string", example: "66c2f8d2e9f1a2b345678901" },
          },
        },
        ConfirmPaymentRequest: {
          type: "object",
          required: ["cardToken"],
          properties: {
            cardToken: { type: "string", example: "tok_abc123" },
          },
        },
      },
    },
    // Bearer default olsun:
    security: [{ bearerAuth: [] }],
  },
  // Router dosyalarındaki JSDoc'ları da tarayalım
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
