import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware for parsing request body
  app.use(express.json({ limit: '50mb' }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy endpoint for Google Apps Script POST
  app.post("/api/gas", async (req, res) => {
    const GAS_ENDPOINT = process.env.VITE_GAS_ENDPOINT;
    if (!GAS_ENDPOINT) {
      return res.status(500).json({ success: false, error: "Missing GAS_ENDPOINT configuration", code: "CONFIGURATION_ERROR" });
    }

    try {
      const response = await fetch(GAS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ success: false, error: "Backend error", code: "SERVER_ERROR" });
      }

      const data = await response.json();
      return res.json(data);
    } catch (error: any) {
      console.error("Error proxying to GAS:", error);
      return res.status(500).json({ success: false, error: "Network error", code: "NETWORK_ERROR" });
    }
  });

  // Proxy endpoint for Google Apps Script GET
  app.get("/api/gas", async (req, res) => {
    const GAS_ENDPOINT = process.env.VITE_GAS_ENDPOINT;
    if (!GAS_ENDPOINT) {
      return res.status(500).json({ success: false, error: "Missing GAS_ENDPOINT configuration", code: "CONFIGURATION_ERROR" });
    }

    try {
      const url = new URL(GAS_ENDPOINT);
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === "string") url.searchParams.append(key, value);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
      });

      if (!response.ok) {
        return res.status(response.status).json({ success: false, error: "Backend error", code: "SERVER_ERROR" });
      }

      const data = await response.json();
      return res.json(data);
    } catch (error: any) {
      console.error("Error proxying GET to GAS:", error);
      return res.status(500).json({ success: false, error: "Network error", code: "NETWORK_ERROR" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
