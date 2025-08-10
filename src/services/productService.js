const productRepository = require('../repositories/productRepository');

class ProductService {
  async createProduct(data) {
    // İleride ek iş mantıkları burada olabilir (ör: validasyon, stok kontrolü)
    return await productRepository.create(data);
  }

  async getAllProducts() {
    return await productRepository.findAll();
  }

  async getProductById(id) {
    return await productRepository.findById(id);
  }

  async deleteProduct(id) {
    return await productRepository.delete(id);
  }
  async updateProduct(id,data){
    return await productRepository.update(id,data);
  }
}

module.exports = new ProductService();
