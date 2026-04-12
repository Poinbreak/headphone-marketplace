import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the server directory
dotenv.config({ path: path.join(__dirname, ".env") });

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

console.log("[Server] Gemini API Key present:", !!process.env.GEMINI_API_KEY);
console.log("[Server] API Key value (first 20 chars):", process.env.GEMINI_API_KEY?.substring(0, 20) || "NOT SET");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const DB_PATH        = path.join(__dirname, "db.json");
const USERS_PATH     = path.join(__dirname, "users.json");
const REVIEWS_PATH   = path.join(__dirname, "reviews.json");
const COMPLAINTS_PATH = path.join(__dirname, "complaints.json");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey_dev_only";

// ── FILE HELPERS ──────────────────────────────────────────────────────────────

async function readDB() {
  try { return JSON.parse(await fs.readFile(DB_PATH, "utf-8")); }
  catch (e) { if (e.code === "ENOENT") return {}; throw e; }
}
async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

async function readUsers() {
  try { return JSON.parse(await fs.readFile(USERS_PATH, "utf-8")); }
  catch (e) { if (e.code === "ENOENT") return {}; throw e; }
}
async function writeUsers(data) {
  await fs.writeFile(USERS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

async function readReviews() {
  try { return JSON.parse(await fs.readFile(REVIEWS_PATH, "utf-8")); }
  catch { return []; }
}
async function writeReviews(data) {
  await fs.writeFile(REVIEWS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

async function readComplaints() {
  try { return JSON.parse(await fs.readFile(COMPLAINTS_PATH, "utf-8")); }
  catch { return []; }
}
async function writeComplaints(data) {
  await fs.writeFile(COMPLAINTS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// ── LEGACY COMPETITOR PRICE ───────────────────────────────────────────────────

app.get("/competitor-price", async (req, res) => {
  try {
    const productId = "1";
    const db = await readDB();
    if (db[productId]) {
      return res.json({ competitorPrice: db[productId].competitorPrice });
    }
    const response = await fetch(`https://dummyjson.com/products/${productId}`);
    if (!response.ok) throw new Error(`External API ${response.status}`);
    const data = await response.json();
    if (!data || typeof data.price !== "number") throw new Error("Invalid API format");
    const competitorPrice = data.price * 80;
    db[productId] = { competitorPrice, timestamp: new Date().toISOString() };
    await writeDB(db);
    res.json({ competitorPrice });
  } catch (error) {
    console.error("competitor-price error:", error.message);
    res.status(500).json({ competitorPrice: 24999, error: "Error fetching competitor price" });
  }
});

// ── AUTHENTICATION ────────────────────────────────────────────────────────────

const pendingUsers = new Map();

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: "Name, email, and password are required." });
  try {
    const users = await readUsers();
    if (users[email])
      return res.status(400).json({ error: "User already exists with this email." });
    const passwordHash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n===========================================`);
    console.log(`[OTP GENERATED] for ${email}: ${otp}`);
    console.log(`===========================================\n`);
    pendingUsers.set(email, { name, email, passwordHash, otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    res.json({ message: "OTP sent. Please verify to complete registration.", requiresOtp: true });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration." });
  }
});

app.post("/api/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ error: "Email and OTP are required." });
  try {
    const pendingUser = pendingUsers.get(email);
    if (!pendingUser)
      return res.status(400).json({ error: "No pending registration found or OTP expired." });
    if (Date.now() > pendingUser.expiresAt) {
      pendingUsers.delete(email);
      return res.status(400).json({ error: "OTP expired." });
    }
    if (pendingUser.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP." });
    const users = await readUsers();
    users[email] = {
      name: pendingUser.name, email: pendingUser.email,
      passwordHash: pendingUser.passwordHash, role: "user",
      createdAt: new Date().toISOString()
    };
    await writeUsers(users);
    pendingUsers.delete(email);
    const token = jwt.sign({ email: pendingUser.email, name: pendingUser.name, role: "user" }, JWT_SECRET, { expiresIn: "24h" });
    res.status(201).json({ message: "User registered successfully", token, user: { name: pendingUser.name, email: pendingUser.email, role: "user" } });
  } catch (error) {
    console.error("OTP Verification error:", error);
    res.status(500).json({ error: "Server error during OTP verification." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });
  try {
    const users = await readUsers();
    const user = users[email];
    if (!user)
      return res.status(400).json({ error: "Invalid email or password." });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(400).json({ error: "Invalid email or password." });
    const token = jwt.sign({ email: user.email, name: user.name, role: user.role || "user" }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ message: "Login successful", token, user: { name: user.name, email: user.email, role: user.role || "user" } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login." });
  }
});

// ── LEGACY AI PRICE (kept for backwards compat) ───────────────────────────────

const aiPriceCache = new Map();

app.post("/ai-price", async (req, res) => {
  const { productData, competitorPrice } = req.body || {};
  try {
    if (!productData || competitorPrice === undefined)
      return res.status(400).json({ error: "Missing productData or competitorPrice" });

    const cacheKey = `${productData.name}_${competitorPrice}`;
    if (aiPriceCache.has(cacheKey)) return res.json(aiPriceCache.get(cacheKey));

    const getFallback = () => {
      const r = { price: Number((competitorPrice * 0.95).toFixed(2)), reason: "Calculated based on average 30-day competitor discounting." };
      aiPriceCache.set(cacheKey, r); return r;
    };

    if (!genAI) return res.json(getFallback());

    const prompt = `You are an expert pricing analyst for consumer electronics in India.
Given:
* Product Name: ${productData.name}
* Driver Size: ${productData.driverSize} mm
* Base Price: Rs ${productData.price}
* Competitor Price: Rs ${competitorPrice}
Rules:
* Stay within plus or minus 10% of competitor price
* Maintain realistic market pricing
Return ONLY valid JSON: { "price": number, "reason": "string" }`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    let content = result.response.text().trim()
      .replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const aiResult = JSON.parse(content);

    let finalPrice = aiResult.price;
    const minP = competitorPrice * 0.9, maxP = competitorPrice * 1.1;
    if (finalPrice < minP) finalPrice = minP;
    if (finalPrice > maxP) finalPrice = maxP;

    const finalResponse = { price: Number(finalPrice.toFixed(2)), reason: aiResult.reason || "Optimum pricing via AI analysis." };
    aiPriceCache.set(cacheKey, finalResponse);
    res.json(finalResponse);
  } catch (error) {
    console.error("ai-price error:", error.message);
    const fallbackPrice = typeof competitorPrice === "number" ? competitorPrice * 0.95 : 0;
    res.json({ price: Number(fallbackPrice.toFixed(2)), reason: "Pricing matched market threshold at 5% advantage." });
  }
});

// ── MAIN AI ANALYSIS ENDPOINT ─────────────────────────────────────────────────

app.post("/api/analyze-pricing", async (req, res) => {
  const { productData } = req.body;
  try {
    if (!productData)
      return res.status(400).json({ error: "Missing productData" });

    console.log(`[Analyze] Request for: ${productData.name}`);

    // Find closest competitor from local data
    const dataPath = path.join(__dirname, "../public/headphones_data.json");
    const allHeadphones = JSON.parse(await fs.readFile(dataPath, "utf-8"));

    let closestCompetitor = null, minDiff = Infinity;
    // First try same type
    for (const hp of allHeadphones) {
      if (hp.id === productData.id) continue;
      if (hp.type === productData.type) {
        const diff = Math.abs(hp.price - productData.price);
        if (diff < minDiff) { minDiff = diff; closestCompetitor = hp; }
      }
    }
    // Fallback: any type
    if (!closestCompetitor) {
      minDiff = Infinity;
      for (const hp of allHeadphones) {
        if (hp.id === productData.id) continue;
        const diff = Math.abs(hp.price - productData.price);
        if (diff < minDiff) { minDiff = diff; closestCompetitor = hp; }
      }
    }

    const compPrice = closestCompetitor ? closestCompetitor.price : productData.price * 0.95;
    const compName  = closestCompetitor ? closestCompetitor.name  : "Market Average";

    const prompt = `You are an expert pricing analyst for consumer electronics in India.

Given:
* Product Name: ${productData.name}
* Driver Size: ${productData.driverSize} mm
* Base Price: Rs ${productData.price}
* Closest Competitor: ${compName} priced at Rs ${compPrice}

Rules:
1. Stay within plus or minus 10% of competitor price.
2. Provide a realistic pricing rationale.
3. Predict the best time to buy within the next month.

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "suggestedPrice": number,
  "reason": "string",
  "buyPrediction": { "advice": "string", "period": "string" }
}`;

    if (!genAI) {
      console.warn("[Analyze] Gemini key missing — using fallback");
      return res.json({
        competitorName: compName, competitorPrice: compPrice,
        price: Number((compPrice * 0.95).toFixed(2)),
        reason: "AI not configured. Price estimated from market data.",
        buyPrediction: { advice: "Buy anytime", period: "Throughout the month" }
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("[Gemini] Calling gemini-2.5-flash...");
    const result = await model.generateContent(prompt);
    let content = result.response.text().trim();
    console.log("[Gemini] Response preview:", content.substring(0, 200));
    content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(content);

    let finalPrice = parsed.suggestedPrice;
    if (finalPrice < compPrice * 0.8) finalPrice = compPrice * 0.9;
    if (finalPrice > compPrice * 1.2) finalPrice = compPrice * 1.1;

    res.json({
      competitorName: compName, competitorPrice: compPrice,
      price: finalPrice, reason: parsed.reason,
      buyPrediction: parsed.buyPrediction
    });

  } catch (error) {
    console.error("[Analyze Error]", error?.message || error);
    const fallbackPrice = Number(((productData?.price || 0) * 0.97).toFixed(0));
    res.json({
      competitorName: "Market Average",
      competitorPrice: productData?.price || 0,
      price: fallbackPrice,
      reason: "AI analysis temporarily unavailable. Price estimated from market data.",
      buyPrediction: { advice: "Check back soon", period: "Next few days" }
    });
  }
});

// ── GENERATE PROS AND CONS ────────────────────────────────────────────────────

app.post("/api/generate-pros-cons", async (req, res) => {
  try {
    const { productName, productSpecs } = req.body;
    if (!productName) {
      return res.status(400).json({ error: "Product name is required." });
    }

    if (!genAI) {
      return res.json({
        pros: ["High quality sound", "Comfortable fit", "Good battery life"],
        cons: ["Expensive", "Limited color options", "Heavy design"]
      });
    }

    const prompt = `You are an expert headphone reviewer. Analyze the "${productName}" headphones and provide exactly 3 pros and 3 cons.

Product specs: ${productSpecs ? JSON.stringify(productSpecs) : 'Standard headphones'}

Return ONLY valid JSON with this exact format:
{
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2", "con3"]
}

Make the points realistic, specific, and relevant to high-quality headphones.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("[Gemini] Generating pros/cons for:", productName);

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({
      pros: parsed.pros?.slice(0, 3) || [],
      cons: parsed.cons?.slice(0, 3) || []
    });

  } catch (error) {
    console.error("[Generate Pros/Cons Error]", error?.message || error);
    res.json({
      pros: ["High quality sound", "Comfortable fit", "Good battery life"],
      cons: ["Expensive", "Limited color options", "Heavy design"]
    });
  }
});

// ── REVIEWS ───────────────────────────────────────────────────────────────────

app.post("/api/reviews", async (req, res) => {
  try {
    const { name, email, product, rating, body } = req.body;
    if (!name || !rating || !body)
      return res.status(400).json({ error: "Name, rating, and body are required." });
    const reviews = await readReviews();
    const review = {
      id: `REV-${Date.now()}`,
      name, email: email || "",
      product: product || "General",
      rating: Number(rating),
      body,
      sentiment: Number(rating) >= 4 ? "Positive" : Number(rating) === 3 ? "Neutral" : "Negative",
      source: "Customer",
      createdAt: new Date().toISOString()
    };
    reviews.unshift(review);
    await writeReviews(reviews);
    res.json({ success: true, review });
  } catch (err) {
    console.error("Review error:", err);
    res.status(500).json({ error: "Failed to save review." });
  }
});

app.get("/api/reviews", async (req, res) => {
  try { res.json(await readReviews()); }
  catch { res.status(500).json({ error: "Failed to read reviews." }); }
});

// ── COMPLAINTS ────────────────────────────────────────────────────────────────

app.post("/api/complaints", async (req, res) => {
  try {
    const { name, email, category, title, description } = req.body;
    if (!name || !title || !description)
      return res.status(400).json({ error: "Name, title and description are required." });
    const complaints = await readComplaints();
    const id = `CMP-${String(complaints.length + 1).padStart(4, "0")}`;
    const complaint = {
      id, name, email: email || "",
      category: category || "General",
      title, description,
      status: "Open",
      createdAt: new Date().toISOString()
    };
    complaints.unshift(complaint);
    await writeComplaints(complaints);
    res.json({ success: true, complaint });
  } catch (err) {
    console.error("Complaint error:", err);
    res.status(500).json({ error: "Failed to save complaint." });
  }
});

app.get("/api/complaints", async (req, res) => {
  try { res.json(await readComplaints()); }
  catch { res.status(500).json({ error: "Failed to read complaints." }); }
});

app.patch("/api/complaints/:id/resolve", async (req, res) => {
  try {
    const { id } = req.params;
    const complaints = await readComplaints();
    const idx = complaints.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ error: "Complaint not found." });
    complaints[idx].status = "Resolved";
    complaints[idx].resolvedAt = new Date().toISOString();
    await writeComplaints(complaints);
    res.json({ success: true, complaint: complaints[idx] });
  } catch (err) {
    console.error("Resolve error:", err);
    res.status(500).json({ error: "Failed to resolve complaint." });
  }
});

// ── ADMIN LOGIN ───────────────────────────────────────────────────────────────

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await readUsers();
    const userList = Array.isArray(users) ? users : Object.values(users);
    const admin = userList.find(u => u.email === email && u.role === "admin");
    if (!admin) return res.status(401).json({ error: "Invalid admin credentials." });
    const valid = await bcrypt.compare(password, admin.password || admin.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid admin credentials." });
    const token = jwt.sign({ id: admin.id || admin.email, role: "admin" }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, user: { name: admin.name, email: admin.email, role: "admin" } });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// ── START ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
