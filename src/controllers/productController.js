const productRepository = require('../repositories/productRepository');
const productService = require('../services/productService');

// Ürün oluşturma
exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Ürün eklenemedi', error: error.message });
  }
};

// Tüm ürünleri listeleme
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Ürünler getirilemedi', error: error.message });
  }
};

// ID ile ürün bulma
exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Ürün getirilemedi', error: error.message });
  }
};

// Ürün silme-
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await productService.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Ürün silinemedi', error: error.message });
  }
};

//Ürün güncelleme
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await productService.updateProduct(req.params.id, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Ürün bulunamadı!' });
    }
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Ürün güncellenemedi', error: err.message });
  }
};

