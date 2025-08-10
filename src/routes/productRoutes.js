const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Yeni ürün ekle
router.post('/', productController.createProduct);

// Tüm ürünleri getir
router.get('/', productController.getAllProducts);

// ID ile ürünü getir
router.get('/:id', productController.getProductById);

// ID ile ürünü sil
router.delete('/:id', productController.deleteProduct);

//PUT ile tüm ürünü güncelle
router.put('/:id',productController.updateProduct);

module.exports = router;
