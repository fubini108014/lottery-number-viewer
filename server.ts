import express from "express";
import { createServer as createViteServer } from "vite";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Routes
  app.get("/api/files", (req, res) => {
    const dataDir = path.join(process.cwd(), 'data');
    
    if (!fs.existsSync(dataDir)) {
      return res.json([]);
    }

    try {
      const files = fs.readdirSync(dataDir)
        .filter(file => file.endsWith('.csv'))
        .map(file => ({
          name: file,
          // Extract year for sorting/display if possible
          year: file.match(/\d{4}/)?.[0] || null
        }))
        .sort((a, b) => {
            // Sort by year descending, then name
            if (a.year && b.year) return parseInt(b.year) - parseInt(a.year);
            return a.name.localeCompare(b.name);
        });
      
      res.json(files);
    } catch (error) {
      console.error("Error reading data directory:", error);
      res.status(500).json({ error: "Failed to read data directory" });
    }
  });

  app.get("/api/files/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'data', filename);

    // Basic security check to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ error: "Invalid filename" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.send(content);
    } catch (error) {
      console.error("Error reading file:", error);
      res.status(500).json({ error: "Failed to read file" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving (if we were building for prod)
    app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
