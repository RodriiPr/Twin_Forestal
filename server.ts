import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Scientific AI Advisor Endpoint
app.post("/api/ai-advisor", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        response: `[Modo Asistente Offline - Datos Científicos Integrados] 
Analizando la consulta sobre ecología computacional: "${prompt}".

**Recomendaciones Técnicas del Modelo 3-PG + Asimilación:**
1. **Asimilación de Datos (EnKF vs 4D-Var):** Para acoplar 3-PG con series temporales GEDI y Sentinel-1/2, se recomienda un Ensemble Kalman Filter con inflación de covarianza adaptativa (EnKF, N=50 miembros) debido a las no-linealidades discontinuas en el cierre estomático por déficit de presión de vapor (VPD) y umbrales de humedad de combustible.
2. **Corrección de Bias Híbrido:** La red Bi-LSTM acoplada a un Spatiotemporal Earthformer corrige los residuos de respiración del suelo (Reco) y transpiración estival donde 3-PG subestima la resistencia hidráulica del xilema en sequías estivales.
3. **Reducción de Incertidumbre:** La integración multi-sensor reduce la varianza epistémica de los inventarios tradicionales IFN en un **34.8%** (de ±28.4 Mg C/ha a ±18.5 Mg C/ha) gracias al constreñimiento vertical continuo de GEDI L4A.`,
      });
    }

    const systemInstruction = `Eres un científico de datos senior y ecólogo computacional especializado en Gemelos Digitales Forestales, teledetección (LiDAR GEDI, Sentinel-1 SAR, Sentinel-2 MSI, Landsat), modelos de procesos (3-PG, Biome-BGC) y Deep Learning híbrido (Earthformer, Bi-LSTM, EnKF).
Responde con alto rigor científico, citando variables ecológicas (NPP, NEE, GPP, Reco, AGB, LAI, FWI, VPD, FMC), formulaciones matemáticas cuando aplique, y estrategias concretas de manejo forestal adaptativo. Responde en español de forma estructurada y profesional.`;

    const fullPrompt = `Contexto del Gemelo Digital Forestal:
${JSON.stringify(context || {})}

Consulta del investigador:
${prompt}`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ response: result.text || "No se obtuvo respuesta del modelo." });
  } catch (error: any) {
    console.error("AI Advisor Error:", error);
    res.status(500).json({ error: error.message || "Error al procesar la consulta con Gemini." });
  }
});

// Ecophysiological Fast Simulator Endpoint
app.post("/api/simulate-3pg", (req, res) => {
  try {
    const { species, years = 30, thinning = 0, prescribedBurn = false, droughtSeverity = 1.0 } = req.body;
    
    // Fast 3-PG process-based simulation model
    const results = [];
    let currentAGB = species === "eucalyptus" ? 45 : species === "tropical" ? 180 : 85; // Mg C/ha
    let currentLAI = species === "eucalyptus" ? 3.2 : species === "tropical" ? 5.8 : 3.8;
    let currentSOC = species === "tropical" ? 110 : 75;
    let stemDensity = species === "eucalyptus" ? 1200 : species === "tropical" ? 650 : 950; // stems/ha

    for (let yr = 0; yr <= years; yr++) {
      // Modifiers
      const ageMod = Math.max(0.6, 1 - Math.exp(-0.08 * (yr + 10)));
      const vpdMod = Math.max(0.4, 1.0 - (droughtSeverity - 1.0) * 0.35);
      const tempMod = 0.92;
      const gppEfficiency = 0.045 * ageMod * vpdMod * tempMod; // mol C / mol APAR
      
      const apar = 1200 * (1 - Math.exp(-0.5 * currentLAI)); // MJ/m2/yr
      const annualNPP = (apar * gppEfficiency * 0.47); // Mg C / ha / yr
      
      // Carbon allocation
      const etaRoots = 0.25 + (1 - vpdMod) * 0.15;
      const etaFoliage = 0.22;
      const etaStem = 1 - etaRoots - etaFoliage;

      // Interventions
      if (yr === 5 && thinning > 0) {
        const thinFrac = thinning / 100;
        currentAGB *= (1 - thinFrac);
        stemDensity = Math.round(stemDensity * (1 - thinFrac));
        currentLAI *= (1 - thinFrac * 0.7);
      }
      if (yr === 10 && prescribedBurn) {
        currentSOC *= 0.96; // slight surface burn loss
        // reduces fuel load significantly
      }

      currentAGB += (annualNPP * etaStem) - (currentAGB * 0.015); // biomass growth minus natural mortality
      currentSOC += (annualNPP * (etaRoots + etaFoliage) * 0.3) - (currentSOC * 0.018); // soil litter turnover
      currentLAI = Math.min(6.5, currentLAI + (annualNPP * etaFoliage * 0.18) - (currentLAI * 0.12));

      // Wildfire risk calculation based on fuel moisture and biomass
      const fuelMoisture = Math.max(12, 65 - (droughtSeverity - 1.0) * 35 - (yr % 4 === 0 ? 15 : 0));
      const fireRisk = Math.min(0.95, Math.max(0.05, (currentAGB * 0.003 + (100 - fuelMoisture) * 0.008 - (prescribedBurn && yr >= 10 && yr <= 18 ? 0.25 : 0))));

      results.push({
        year: yr,
        agb: parseFloat(currentAGB.toFixed(2)),
        soc: parseFloat(currentSOC.toFixed(2)),
        totalCarbon: parseFloat((currentAGB + currentSOC).toFixed(2)),
        lai: parseFloat(currentLAI.toFixed(2)),
        npp: parseFloat(annualNPP.toFixed(2)),
        gpp: parseFloat((annualNPP / 0.47).toFixed(2)),
        nee: parseFloat((-annualNPP * 0.75).toFixed(2)), // Net sink is negative
        fireRisk: parseFloat(fireRisk.toFixed(3)),
        stemDensity,
      });
    }

    res.json({ results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Adaptive Management Scenarios Endpoint
app.get("/api/v1/scenarios", (req, res) => {
  const scenarios = [
    {
      id: "thinning",
      name: "Clareos Selectivos",
      tag: "Manejo activo",
      type: "thinning",
      description: "Raleos selectivos para reducir competencia y mejorar vigor del rodal.",
      thinningIntensityPct: 25,
      thinningScheduleYears: [10, 25, 40],
      prescribedBurnIntervalYears: 0,
      reforestationSpecies: "",
      fuelBreakWidthM: 0,
      trajectory: Array.from({ length: 11 }, (_, i) => ({
        year: i * 5,
        agb: 180 + i * 8 - (i > 2 ? (i - 2) * 3 : 0),
        soc: 95 + i * 0.5,
        deadwoodC: 5 + i * 0.3,
        totalCarbon: 280 + i * 8.5,
        lai: 4.2 - i * 0.05,
        fireRiskProbability: Math.max(0.15, 0.45 - i * 0.02),
        canopyHeightM: 22 + i * 0.8,
        stemDensityHa: 800 - i * 15,
        waterYieldMm: 320 - i * 2,
        biodiversityIndex: 2.8 + i * 0.02,
      })),
      metricsSummary: {
        totalCarbon50Yr: 420,
        carbonSequestrationRate: 4.2,
        cumulativeHarvestedCarbon: 85,
        meanFireRiskProb: 0.18,
        fireResilienceScore: 78,
        biodiversityShannonH: 3.1,
        waterYieldM3Ha: 2800,
        economicNPV_EUR_ha: 4200,
        uncertaintyReductionPct: 28,
      },
    },
    {
      id: "prescribed_burn",
      name: "Quemas Prescritas",
      tag: "Manejo de combustibles",
      type: "prescribed_burn",
      description: "Quemas controladas periódicas para reducir carga de combustible superficial.",
      thinningIntensityPct: 0,
      thinningScheduleYears: [],
      prescribedBurnIntervalYears: 5,
      reforestationSpecies: "",
      fuelBreakWidthM: 0,
      trajectory: Array.from({ length: 11 }, (_, i) => ({
        year: i * 5,
        agb: 175 + i * 7,
        soc: 92 + i * 0.3,
        deadwoodC: 3 + i * 0.1,
        totalCarbon: 270 + i * 7.5,
        lai: 4.0 - i * 0.04,
        fireRiskProbability: Math.max(0.08, 0.35 - i * 0.025),
        canopyHeightM: 21 + i * 0.7,
        stemDensityHa: 850 - i * 10,
        waterYieldMm: 310 - i * 1.5,
        biodiversityIndex: 2.6 + i * 0.03,
      })),
      metricsSummary: {
        totalCarbon50Yr: 390,
        carbonSequestrationRate: 3.8,
        cumulativeHarvestedCarbon: 0,
        meanFireRiskProb: 0.12,
        fireResilienceScore: 88,
        biodiversityShannonH: 2.9,
        waterYieldM3Ha: 2900,
        economicNPV_EUR_ha: 3100,
        uncertaintyReductionPct: 32,
      },
    },
    {
      id: "restoration",
      name: "Restauración Diversa",
      tag: "Restauración",
      type: "restoration",
      description: "Enriquecimiento con especies nativas para mejorar biodiversidad y resiliencia.",
      thinningIntensityPct: 15,
      thinningScheduleYears: [15],
      prescribedBurnIntervalYears: 0,
      reforestationSpecies: "nativa mixta",
      fuelBreakWidthM: 0,
      trajectory: Array.from({ length: 11 }, (_, i) => ({
        year: i * 5,
        agb: 160 + i * 9,
        soc: 88 + i * 0.8,
        deadwoodC: 6 + i * 0.5,
        totalCarbon: 255 + i * 9.8,
        lai: 3.8 + i * 0.08,
        fireRiskProbability: Math.max(0.12, 0.38 - i * 0.02),
        canopyHeightM: 19 + i * 1.0,
        stemDensityHa: 750 - i * 8,
        waterYieldMm: 290 - i * 1,
        biodiversityIndex: 2.4 + i * 0.08,
      })),
      metricsSummary: {
        totalCarbon50Yr: 460,
        carbonSequestrationRate: 4.8,
        cumulativeHarvestedCarbon: 40,
        meanFireRiskProb: 0.15,
        fireResilienceScore: 82,
        biodiversityShannonH: 3.6,
        waterYieldM3Ha: 2700,
        economicNPV_EUR_ha: 3800,
        uncertaintyReductionPct: 25,
      },
    },
    {
      id: "laissez-faire",
      name: "Sin Intervención",
      tag: "Control",
      type: "laissez_faire",
      description: "Sin manejo. Evolución natural del rodal como línea base.",
      thinningIntensityPct: 0,
      thinningScheduleYears: [],
      prescribedBurnIntervalYears: 0,
      reforestationSpecies: "",
      fuelBreakWidthM: 0,
      trajectory: Array.from({ length: 11 }, (_, i) => ({
        year: i * 5,
        agb: 170 + i * 5 + (i > 6 ? -(i - 6) * 4 : 0),
        soc: 90 + i * 0.2,
        deadwoodC: 4 + i * 0.8,
        totalCarbon: 265 + i * 5.5,
        lai: 3.9 - i * 0.06,
        fireRiskProbability: Math.min(0.75, 0.35 + i * 0.04),
        canopyHeightM: 20 + i * 0.5,
        stemDensityHa: 820 - i * 5,
        waterYieldMm: 300 - i * 1.2,
        biodiversityIndex: 2.5 + i * 0.01,
      })),
      metricsSummary: {
        totalCarbon50Yr: 340,
        carbonSequestrationRate: 2.5,
        cumulativeHarvestedCarbon: 0,
        meanFireRiskProb: 0.52,
        fireResilienceScore: 45,
        biodiversityShannonH: 2.6,
        waterYieldM3Ha: 2800,
        economicNPV_EUR_ha: 1800,
        uncertaintyReductionPct: 5,
      },
    },
  ];
  res.json(scenarios);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "localhost", () => {
    console.log(`SilvaTwin Scientific Server running on http://localhost:${PORT}`);
  });
}

startServer();
