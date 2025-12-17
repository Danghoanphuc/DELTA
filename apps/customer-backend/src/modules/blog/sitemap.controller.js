// apps/customer-backend/src/modules/blog/sitemap.controller.js
// Generate XML sitemap for blog posts

import mongoose from "mongoose";
import { Logger } from "../../shared/utils/logger.util.js";

// Import SupplierPost model
let SupplierPost;
try {
  SupplierPost = mongoose.model("SupplierPost");
} catch (error) {
  const supplierPostSchema = new mongoose.Schema({
    slug: String,
    title: String,
    updatedAt: Date,
    createdAt: Date,
    visibility: String,
  });
  SupplierPost = mongoose.model("SupplierPost", supplierPostSchema);
}

export class SitemapController {
  /**
   * Generate XML sitemap
   * @route GET /sitemap.xml
   */
  async generateSitemap(req, res, next) {
    try {
      const baseUrl = process.env.FRONTEND_URL || "https://deltaswag.vn";

      // Get all public blog posts
      const posts = await SupplierPost.find({
        visibility: "public",
        slug: { $exists: true, $ne: null },
      })
        .select("slug title updatedAt createdAt")
        .sort({ createdAt: -1 })
        .lean();

      Logger.info(
        `[SitemapCtrl] Generating sitemap with ${posts.length} blog posts`
      );

      // Generate XML
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Homepage
      xml += "  <url>\n";
      xml += `    <loc>${baseUrl}/</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += "    <changefreq>daily</changefreq>\n";
      xml += "    <priority>1.0</priority>\n";
      xml += "  </url>\n";

      // Blog index
      xml += "  <url>\n";
      xml += `    <loc>${baseUrl}/blog</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += "    <changefreq>daily</changefreq>\n";
      xml += "    <priority>0.9</priority>\n";
      xml += "  </url>\n";

      // Blog posts
      posts.forEach((post) => {
        xml += "  <url>\n";
        xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
        xml += `    <lastmod>${(
          post.updatedAt || post.createdAt
        ).toISOString()}</lastmod>\n`;
        xml += "    <changefreq>weekly</changefreq>\n";
        xml += "    <priority>0.8</priority>\n";
        xml += "  </url>\n";
      });

      // Static pages
      const staticPages = [
        { url: "/about", priority: "0.7" },
        { url: "/contact", priority: "0.7" },
        { url: "/shop", priority: "0.9" },
        { url: "/services", priority: "0.8" },
        { url: "/policy", priority: "0.5" },
        { url: "/warranty", priority: "0.5" },
        { url: "/shipping-policy", priority: "0.5" },
      ];

      staticPages.forEach((page) => {
        xml += "  <url>\n";
        xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += "    <changefreq>monthly</changefreq>\n";
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += "  </url>\n";
      });

      xml += "</urlset>";

      // Set headers
      res.header("Content-Type", "application/xml");
      res.header("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
      res.send(xml);
    } catch (error) {
      Logger.error("[SitemapCtrl] Error generating sitemap:", error);
      next(error);
    }
  }
}
