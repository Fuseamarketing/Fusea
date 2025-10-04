// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// --- Healthcheck (utile pour vérifier que le serveur tourne)
app.get("/health", (_req, res) => {
  res.json({ ok: true, port: PORT, node: process.version });
});

// --- Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};
    if (!message) return res.status(400).json({ error: "message manquant" });

    // 1) MODE MOCK (ne passe pas par OpenAI) -> pratique pour tester le flux
    if (req.query.mock === "1") {
      return res.json({ reply: `Mock ok — tu as dit: "${message}"` });
    }

    // 2) Sécurité : la clé est requise en mode réel
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY manquante. Ajoute-la dans .env");
      return res.status(500).json({ error: "server_misconfigured" });
    }

    // 3) Contexte (system) + historique + message utilisateur
    const system =
      "Tu es l’assistant du site Fusea. Réponds en français, clairement et brièvement. " +
      "Domaines: services, tarifs indicatifs, délais, audit gratuit, CGU/CGV, confidentialité. " +
      "Si la question sort du périmètre, reste bref et propose le formulaire d’audit.";

    const messages = [
      { role: "system", content: system },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    // 4) Appel OpenAI (chat.completions — stable et simple)
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.4,
        max_tokens: 400,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("OpenAI NOT OK:", resp.status, txt); // <-- LOG utile pour déboguer
      return res.status(502).json({ error: "llm_error" });
    }

    const data = await resp.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Je n’ai pas compris, pouvez-vous reformuler ?";

    return res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "server_error" });
  }
});

// --- Démarrage
app.listen(PORT, () => {
  console.log(`✅ Backend Fusea actif sur http://localhost:${PORT}`);
});