const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB connection ---
// Set MONGO_URI in your environment, or it will fall back to local Mongo.
const mongoUri =
  process.env.MONGO_URI || 'mongodb://localhost:27017/assignment13';

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Mongo connection error:', err));

// --- schema / model ---
// Matches the assignment:
// {
//   "id": 0,
//   "product": {
//     "productid": 0,
//     "category": "",
//     "price": 0,
//     "name": "",
//     "instock": true
//   }
// }

const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  product: {
    productid: { type: Number, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    name: { type: String, required: true },
    instock: { type: Boolean, default: true }
  }
});

const Product = mongoose.model('Product', ProductSchema);

// Utility: compute next integer id
async function getNextId() {
  const maxDoc = await Product.findOne().sort({ id: -1 });
  return maxDoc ? maxDoc.id + 1 : 1;
}

// --- routes ---
// GET /product/get/  -> get all products
app.get('/product/get', async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /product/create -> create a new product
app.post('/product/create', async (req, res) => {
  try {
    const { product } = req.body;

    if (!product) {
      return res.status(400).json({ message: 'Product field is required' });
    }

    const nextId = await getNextId();

    const newProduct = new Product({
      id: nextId,
      product: {
        productid: product.productid || nextId,
        category: product.category,
        price: product.price,
        name: product.name,
        instock: product.instock
      }
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /product/update/:id -> update a product by id
app.put('/product/update/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { product } = req.body;

    if (!product) {
      return res.status(400).json({ message: 'Product field is required' });
    }

    const updated = await Product.findOneAndUpdate(
      { id },
      { product },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /product/delete/:id -> delete by id
app.delete('/product/delete/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const deleted = await Product.findOneAndDelete({ id });

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted', id: deleted.id });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- start server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
