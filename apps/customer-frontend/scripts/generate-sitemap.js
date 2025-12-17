/**
 * Sitemap Generator Script
 * Run: node scripts/generate-sitemap.js
 *
 * This script generates a sitemap.xml file for SEO purposes.
 * It fetches dynamic routes (artisans, products, magazine posts) from the API
 * and generates a standard sitemap.xml file.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SITE_URL = process.env.VITE_SITE_URL || "https://printz.vn";
const API_URL = process.env.VITE_API_URL || "https://api.printz.vn";
const OUTPUT_PATH = path.join(__dirname, "../public/sitemap.xml");

// Current date in W3C format
const today = new Date().toISOString().split("T")[0];

/**
 * Fetch artisan codes from API
 */
async function fetchArtisans() {
  try {
    const response = await fetch(`${API_URL}/artisans?limit=1000`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.data?.artisans || [];
  } catch (error) {
    console.warn("⚠️ Could not fetch artisans:", error.message);
    // Return mock data for build if API is unavailable
    return [
      { code: "ARTISAN001" },
      { code: "ARTISAN002" },
      { code: "ARTISAN003" },
    ];
  }
}

/**
 * Fetch product slugs from API
 */
async function fetchProducts() {
  try {
    const response = await fetch(
      `${API_URL}/catalog/products?limit=1000&status=active`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.products || data.data?.products || [];
  } catch (error) {
    console.warn("⚠️ Could not fetch products:", error.message);
    // Return mock data for build if API is unavailable
    return [
      { slug: "product-1" },
      { slug: "product-2" },
      { slug: "product-3" },
    ];
  }
}

/**
 * Fetch magazine post slugs from API
 */
async function fetchMagazinePosts() {
  try {
    const response = await fetch(
      `${API_URL}/magazine/posts?limit=1000&visibility=public`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.data?.posts || [];
  } catch (error) {
    console.warn("⚠️ Could not fetch magazine posts:", error.message);
    // Return mock data for build if API is unavailable
    return [{ slug: "post-1" }, { slug: "post-2" }, { slug: "post-3" }];
  }
}

/**
 * Generate XML for a single URL entry
 */
function generateUrlEntry(loc, priority = 0.5, changefreq = "weekly") {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Main function to generate sitemap
 */
async function generateSitemap() {
  console.log("🗺️  Generating sitemap.xml...");
  console.log(`   Site URL: ${SITE_URL}`);
  console.log(`   API URL: ${API_URL}`);

  // Fetch dynamic data
  const [artisans, products, posts] = await Promise.all([
    fetchArtisans(),
    fetchProducts(),
    fetchMagazinePosts(),
  ]);

  console.log(`   Found: ${artisans.length} artisans`);
  console.log(`   Found: ${products.length} products`);
  console.log(`   Found: ${posts.length} magazine posts`);

  // Static pages with priorities
  const staticPages = [
    { path: "/", priority: 1.0, changefreq: "daily" },
    { path: "/shop", priority: 0.9, changefreq: "daily" },
    { path: "/artisans", priority: 0.8, changefreq: "weekly" },
    { path: "/tap-chi", priority: 0.8, changefreq: "daily" },
    { path: "/templates", priority: 0.7, changefreq: "weekly" },
    { path: "/about", priority: 0.6, changefreq: "monthly" },
    { path: "/contact", priority: 0.6, changefreq: "monthly" },
    { path: "/process", priority: 0.6, changefreq: "monthly" },
    { path: "/faq", priority: 0.6, changefreq: "monthly" },
    { path: "/policy", priority: 0.4, changefreq: "monthly" },
    { path: "/warranty", priority: 0.4, changefreq: "monthly" },
    { path: "/quality-standards", priority: 0.5, changefreq: "monthly" },
    { path: "/shipping-policy", priority: 0.4, changefreq: "monthly" },
    { path: "/design-guidelines", priority: 0.5, changefreq: "monthly" },
    { path: "/careers", priority: 0.5, changefreq: "weekly" },
    { path: "/trends", priority: 0.6, changefreq: "weekly" },
    { path: "/quote", priority: 0.7, changefreq: "monthly" },
    // Magazine category pages
    { path: "/tap-chi/triet-ly-song", priority: 0.7, changefreq: "weekly" },
    { path: "/tap-chi/goc-giam-tuyen", priority: 0.7, changefreq: "weekly" },
    { path: "/tap-chi/cau-chuyen-di-san", priority: 0.7, changefreq: "weekly" },
    { path: "/tap-chi/ngu-hanh/kim", priority: 0.6, changefreq: "weekly" },
    { path: "/tap-chi/ngu-hanh/moc", priority: 0.6, changefreq: "weekly" },
    { path: "/tap-chi/ngu-hanh/thuy", priority: 0.6, changefreq: "weekly" },
    { path: "/tap-chi/ngu-hanh/hoa", priority: 0.6, changefreq: "weekly" },
    { path: "/tap-chi/ngu-hanh/tho", priority: 0.6, changefreq: "weekly" },
    // Solutions pages
    { path: "/solutions/warehousing", priority: 0.6, changefreq: "monthly" },
    { path: "/solutions/kitting", priority: 0.6, changefreq: "monthly" },
    {
      path: "/solutions/corporate-gifting",
      priority: 0.6,
      changefreq: "monthly",
    },
  ];

  // Build URL entries
  const urlEntries = [];

  // Static pages
  for (const page of staticPages) {
    urlEntries.push(
      generateUrlEntry(
        `${SITE_URL}${page.path}`,
        page.priority,
        page.changefreq
      )
    );
  }

  // Artisan pages (priority 0.8)
  for (const artisan of artisans) {
    if (artisan.code) {
      urlEntries.push(
        generateUrlEntry(`${SITE_URL}/artisans/${artisan.code}`, 0.8, "weekly")
      );
    }
  }

  // Product pages (priority 0.7)
  for (const product of products) {
    if (product.slug) {
      urlEntries.push(
        generateUrlEntry(`${SITE_URL}/product/${product.slug}`, 0.7, "weekly")
      );
    }
  }

  // Magazine post pages (priority 0.6)
  for (const post of posts) {
    if (post.slug) {
      urlEntries.push(
        generateUrlEntry(`${SITE_URL}/tap-chi/${post.slug}`, 0.6, "monthly")
      );
    }
  }

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries.join("\n")}
</urlset>`;

  // Write to file
  fs.writeFileSync(OUTPUT_PATH, sitemap, "utf-8");

  console.log(`✅ Sitemap generated: ${OUTPUT_PATH}`);
  console.log(`   Total URLs: ${urlEntries.length}`);
}

// Run
generateSitemap().catch((error) => {
  console.error("❌ Failed to generate sitemap:", error);
  process.exit(1);
});
