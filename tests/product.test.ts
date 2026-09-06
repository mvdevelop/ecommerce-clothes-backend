import request from "supertest";
import app from "../src/app.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../src/models/User.js";

let mongoServer: MongoMemoryServer;
let userToken: string;
let adminToken: string;
let userId: string;
let adminId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = "test_jwt_secret_for_testing";
  process.env.REFRESH_SECRET = "test_refresh_secret_for_testing";
  process.env.JWT_EXPIRES_IN = "1d";
  process.env.REFRESH_EXPIRES_IN = "30d";
  process.env.NODE_ENV = "test";
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.dropDatabase();

  // Create regular user
  const userRes = await request(app)
    .post("/api/users/signup")
    .send({ name: "Regular User", email: "user@test.com", password: "Password123" });
  userToken = userRes.body.token;
  userId = userRes.body.data._id ?? userId;

  // Create admin user
  const adminData = await User.create({
    name: "Admin User",
    email: "admin@test.com",
    password: "AdminPass123",
    role: "admin",
  });
  adminId = adminData._id.toString();
  adminToken = adminData.getSignedJwtToken();
});

describe("Product Endpoints", () => {
  const validProduct = {
    name: "Classic T-Shirt",
    description: "A comfortable cotton t-shirt for everyday use",
    category: "men",
    new_price: 29.99,
    old_price: 39.99,
    image: "https://example.com/tshirt.jpg",
    stock: 100,
  };

  describe("GET /api/products", () => {
    it("should return empty list when no products exist", async () => {
      const res = await request(app)
        .get("/api/products")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.pagination).toBeDefined();
    });

    it("should support pagination", async () => {
      // Create 15 products
      for (let i = 0; i < 15; i++) {
        await request(app)
          .post("/api/products")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ ...validProduct, name: `Product ${i}` });
      }

      const res = await request(app)
        .get("/api/products?page=1&limit=10")
        .expect(200);

      expect(res.body.data).toHaveLength(10);
      expect(res.body.pagination.total).toBe(15);
      expect(res.body.pagination.pages).toBe(2);
    });

    it("should filter by category", async () => {
      await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...validProduct, category: "men" });

      await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...validProduct, name: "Women Dress", category: "women" });

      const res = await request(app)
        .get("/api/products?category=women")
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].category).toBe("women");
    });
  });

  describe("POST /api/products", () => {
    it("should allow admin to create a product", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validProduct)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(validProduct.name);
      expect(res.body.data.new_price).toBe(validProduct.new_price);
    });

    it("should reject non-admin users", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send(validProduct)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it("should reject unauthenticated requests", async () => {
      const res = await request(app)
        .post("/api/products")
        .send(validProduct)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it("should validate required fields", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Incomplete Product" })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("GET /api/products/:id", () => {
    let productId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validProduct);
      productId = res.body.data._id.toString();
    });

    it("should return a single product", async () => {
      const res = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(productId);
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/products/:id", () => {
    let productId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validProduct);
      productId = res.body.data._id.toString();
    });

    it("should allow admin to update a product", async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Updated T-Shirt", new_price: 24.99 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Updated T-Shirt");
      expect(res.body.data.new_price).toBe(24.99);
    });

    it("should reject non-admin users", async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Hacked Name" })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/products/:id", () => {
    let productId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validProduct);
      productId = res.body.data._id.toString();
    });

    it("should allow admin to delete a product", async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      await request(app)
        .get(`/api/products/${productId}`)
        .expect(404);
    });
  });
});

describe("Health Check", () => {
  it("should return healthy status", async () => {
    const res = await request(app)
      .get("/health")
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Server is healthy");
    expect(res.body.timestamp).toBeDefined();
  });
});
