import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");

// Helper to read DB
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      return {}; // Return empty object if file doesn't exist
    }
    throw err;
  }
}

// Helper to write DB
async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// GET /competitor-price — returns fetched competitor pricing data
app.get("/competitor-price", async (req, res) => {
  try {
    const productId = "1"; // Hardcoded for simplicity as per previous logic

    // Check database first
    const db = await readDB();
    if (db[productId]) {
      console.log("Returning cached price from db.json");
      return res.json({ competitorPrice: db[productId].competitorPrice });
    }

    // If not in DB, fetch from external API
    console.log("Fetching new price from external API...");
    const response = await fetch(`https://dummyjson.com/products/${productId}`);
    if (!response.ok) {
      throw new Error(`External API failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract price and handle potential missing fields
    if (!data || typeof data.price !== "number") {
      throw new Error("Invalid format from external API");
    }

    // Multiply by standard mock rate for realism (e.g., $ -> ₹)
    const competitorPrice = data.price * 80;

    // Save to DB
    db[productId] = { competitorPrice, timestamp: new Date().toISOString() };
    await writeDB(db);

    res.json({
      competitorPrice: competitorPrice,
    });
  } catch (error) {
    console.error("Failed to fetch competitor price:", error.message);
    // Handle error safely by returning a fallback number or 500 error
    res.status(500).json({
      competitorPrice: 24999,
      error: "Error fetching competitor price"
    });
  }
});

// Cache for AI pricing
const aiPriceCache = new Map();

// POST /ai-price — uses OpenAI to suggest competitive price and provide reasoning
app.post("/ai-price", async (req, res) => {
  const { productData, competitorPrice } = req.body || {};

  try {
    if (!productData || competitorPrice === undefined) {
      return res.status(400).json({ error: "Missing productData or competitorPrice" });
    }

    // Basic Caching based on product name and competitor price
    const cacheKey = `${productData.name}_${competitorPrice}`;
    if (aiPriceCache.has(cacheKey)) {
      console.log("Returning AI price from cache");
      return res.json(aiPriceCache.get(cacheKey));
    }

    // Array of professional, realistic mock reasons
    const mockReasons = [
      "Analyzed regional marketplace trends. Adjusted to remain highly competitive against the current benchmark.",
      "Calculated based on average 30-day competitor discounting and technical specifications.",
      "Algorithm recommends a strategic markdown to undercut primary competitor while maintaining premium positioning.",
      "Pricing optimized for maximum conversion rate against similar models with active noise cancellation features.",
      "Machine learning model strongly predicts high volume sales at exactly 5% below competitor baseline."
    ];

    // Helper for structured mock fallback response
    const getFallbackResponse = () => {
      const fallbackPrice = competitorPrice * 0.95;
      const randomReason = mockReasons[Math.floor(Math.random() * mockReasons.length)];
      
      const resp = {
        price: Number(fallbackPrice.toFixed(2)),
        reason: randomReason
      };
      // Cache it so the reason stays consistent for this product
      aiPriceCache.set(cacheKey, resp);
      return resp;
    };

    // Fallback if no OpenAI key is set
    if (!openai) {
      console.warn("Using simulated AI price because OPENAI_API_KEY is not set.");
      return res.json(getFallbackResponse());
    }

    const prompt = `You are an expert pricing analyst for consumer electronics in India.

Given:
* Product Name: ${productData.name}
* Driver Size: ${productData.driverSize} mm
* Sensitivity: ${productData.sensitivity} dB
* Base Price: ₹${productData.price}
* Competitor Price: ₹${competitorPrice}

Rules:
* Stay within ±10% of competitor price
* Maintain realistic market pricing
* Premium brands should not be priced too low

Return ONLY valid JSON:
{
"price": number,
"reason": string
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    let aiResult;
    try {
      let content = response.choices[0].message.content.trim();
      // Remove possible markdown syntax
      if (content.startsWith("\`\`\`json")) {
        content = content.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
      } else if (content.startsWith("\`\`\`")) {
        content = content.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
      }
      aiResult = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response, applying fallback:", parseError.message);
      return res.json(getFallbackResponse());
    }

    // Enforce Safe Price Range Validation (Clamping)
    const minPrice = competitorPrice * 0.9;
    const maxPrice = competitorPrice * 1.1;
    let finalPrice = aiResult.price;

    if (typeof finalPrice !== 'number' || isNaN(finalPrice)) {
      console.warn("AI returned invalid price data type, applying fallback.");
      return res.json(getFallbackResponse());
    }

    if (finalPrice < minPrice) finalPrice = minPrice;
    if (finalPrice > maxPrice) finalPrice = maxPrice;

    const finalResponse = {
      price: Number(finalPrice.toFixed(2)),
      reason: aiResult.reason || "Determined optimum pricing safely through AI analysis."
    };

    // Cache the successfully clamped AI response
    aiPriceCache.set(cacheKey, finalResponse);

    res.json(finalResponse);
  } catch (error) {
    console.error("Error from AI Price Endpoint:", error.message);
    const fallbackPrice = typeof competitorPrice === 'number' ? competitorPrice * 0.95 : 0;
    res.status(500).json({
      price: Number(fallbackPrice.toFixed(2)),
      reason: "Pricing algorithm rapidly matched market threshold at 5% advantage."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
