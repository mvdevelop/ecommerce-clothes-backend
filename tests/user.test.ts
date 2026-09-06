import request from "supertest";
import app from "../src/app.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

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
});

describe("User Authentication", () => {
  const validUser = {
    name: "John Doe",
    email: "john@example.com",
    password: "Password123",
  };

  describe("POST /api/users/signup", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/users/signup")
        .send(validUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(validUser.name);
      expect(res.body.data.email).toBe(validUser.email);
      expect(res.body.data.role).toBe("user");
      expect(res.body.token).toBeDefined();
    });

    it("should reject duplicate email", async () => {
      await request(app).post("/api/users/signup").send(validUser);

      const res = await request(app)
        .post("/api/users/signup")
        .send(validUser)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("already exists");
    });

    it("should reject invalid email", async () => {
      const res = await request(app)
        .post("/api/users/signup")
        .send({ ...validUser, email: "not-an-email" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject weak password", async () => {
      const res = await request(app)
        .post("/api/users/signup")
        .send({ ...validUser, password: "123" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject missing fields", async () => {
      const res = await request(app)
        .post("/api/users/signup")
        .send({ email: "john@example.com" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/users/signup").send(validUser);
    });

    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.data.email).toBe(validUser.email);
    });

    it("should reject wrong password", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({ email: validUser.email, password: "WrongPassword123" })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Invalid credentials");
    });

    it("should reject non-existent email", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({ email: "notfound@example.com", password: validUser.password })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Invalid credentials");
    });
  });

  describe("GET /api/users/me", () => {
    let token: string;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/users/signup")
        .send(validUser);
      token = res.body.token;
    });

    it("should return current user profile", async () => {
      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(validUser.name);
      expect(res.body.data.email).toBe(validUser.email);
      expect(res.body.data.password).toBeUndefined();
    });

    it("should reject request without token", async () => {
      const res = await request(app)
        .get("/api/users/me")
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("no token");
    });

    it("should reject invalid token", async () => {
      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
