require('dotenv').config(); // .env dosyasını okuyacak
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// ROUTES
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Merhaba, Node.js çok katmanlı mimari backend projesi çalışıyor!');
});

// **MongoDB bağlantısı**
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı!');
    // Sunucuyu başlat
    app.listen(port, () => {
      console.log(`Server çalışıyor: http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
  });
