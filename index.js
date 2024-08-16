const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 9000;

const app = express();
//

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_NEW_PASS}@cluster0.6u1ikeh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const productsCollection = client.db("vagalshop").collection("products");

    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
// -----------
app.get('/api/products', async (req, res) => {
  const { page = 1, limit = 6, q, brand, category, priceRange, sortBy } = req.query;

  // Initialize filter
  const filter = {};

  if (q) filter.name = { $regex: q, $options: 'i' };
  if (brand) filter.brand = brand;
  if (category) filter.category = category;
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(Number);
    filter.price = { $gte: min, $lte: max };
  }

  // Initialize sorting option
  let sortOption = {};
  if (sortBy === 'price-asc') {
    sortOption.price = 1;
  } else if (sortBy === 'price-desc') {
    sortOption.price = -1;
  } else if (sortBy === 'date') {
    sortOption._id = -1;
  }

  // Fetch products with filter and sort
  const products = await productsCollection.find(filter)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .toArray();

  const total = await productsCollection.countDocuments(filter);

  res.json({ products, totalPages: Math.ceil(total / limit) });
});
// ------------------------

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from vagal-shop Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
