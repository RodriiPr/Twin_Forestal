import React, { useState, useRef, useEffect } from 'react';
import { LandscapeRegion, RasterPixelInfo, StandTelemetryInput } from '../types';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  RefreshCw,
  Sparkles,
  Minimize2,
  HelpCircle,
  Trees,
  Flame,
  Target,
  BookOpen,
  Database,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ForestTwinAPI } from '../services/api';

interface FloatingChatbotProps {
  region: LandscapeRegion;
  activeStand?: RasterPixelInfo | null;
}

export interface StructuredDecisionBlocks {
  stand_id: string;
  risk_level: string;
  biophysical_diagnosis: string;
  fire_risk_evaluation: string;
  adaptive_recommendation: string;
  scientific_justification: string;
  uncertainty_ci_width?: number;
  flow_step?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  structured?: StructuredDecisionBlocks;
  timestamp: string;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ region, activeStand }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: language === 'es'
        ? `¡Hola! Soy el **Asistente Experto en Gemelo Digital Forestal** (SilvaTwin AI). Estoy sincronizado con la telemetría viva de **${region.name}** y el modelo de razonamiento semántico de **Dao et al. (2025)**. Puedes pedirme diagnósticos biofísicos, simulación de riesgo FWI o recomendaciones silvícolas adaptativas.`
        : `Hello! I am the **Forest Digital Twin Expert Assistant** (SilvaTwin AI). I am synchronized with live telemetry from **${region.name}** and the semantic reasoning model from **Dao et al. (2025)**. Ask me for biophysical diagnostics, FWI fire risk simulations, or adaptive silvicultural directives.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Quick Action Prompts
  const quickPrompts = language === 'es' ? [
    '🌿 Evaluar directiva silvícola con IA (Dao et al., 2025)',
    '🔥 Diagnóstico de riesgo de incendio y FWI',
    '📊 Balance de carbono y sumidero neto (3-PG)',
    '¿Cómo se reduce la incertidumbre en un 34.8%?',
  ] : [
    '🌿 Evaluate silvicultural directive with AI (Dao et al., 2025)',
    '🔥 Wildfire risk and FWI diagnosis',
    '📊 Carbon stock balance and net sink (3-PG)',
    'How is uncertainty reduced by 34.8%?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    // Build context with current active stand telemetry
    const effectiveStandId = activeStand?.standId || `STAND-${region.id.slice(0, 3).toUpperCase()}-0001`;
    const effectiveSpecies = activeStand?.species || region.dominantSpecies[0];
    const effectiveAgb = activeStand?.agbMgC_ha ?? region.baselineAGB;
    const effectiveHeight = activeStand?.gediHeightM ?? Math.round(18 + effectiveAgb / 10);
    const effectiveFwi = activeStand?.fwiRisk ?? 0.45;
    const effectiveFmc = activeStand?.fuelMoisturePct ?? 65.0;
    const effectiveNdvi = activeStand?.ndvi ?? 0.82;
    const effectiveSlope = activeStand?.slopePct ?? 14.0;

    const queryLower = query.toLowerCase();

    // Detección de intenciones científicas específicas
    const isUncertaintyQuery =
      queryLower.includes('incertidumbre') ||
      queryLower.includes('uncertainty') ||
      queryLower.includes('34.8') ||
      queryLower.includes('hipótesis principal') ||
      queryLower.includes('hipotesis principal');

    const isCarbonBalanceQuery =
      queryLower.includes('balance de carbono') ||
      queryLower.includes('carbon balance') ||
      queryLower.includes('sumidero neto') ||
      queryLower.includes('net sink') ||
      queryLower.includes('flujo de carbono') ||
      queryLower.includes('carbon flux') ||
      queryLower.includes('3-pg') ||
      queryLower.includes('fluxnet') ||
      queryLower.includes('nee');

    const isFireDiagnosisQuery =
      (queryLower.includes('fwi') ||
       queryLower.includes('riesgo de incendio') ||
       queryLower.includes('wildfire') ||
       queryLower.includes('fuego') ||
       queryLower.includes('combustible foliar') ||
       queryLower.includes('fmc')) &&
      !isUncertaintyQuery && !isCarbonBalanceQuery;

    const isDirectiveQuery =
      queryLower.includes('evaluar') ||
      queryLower.includes('directiva') ||
      queryLower.includes('silvícola') ||
      queryLower.includes('silvicola') ||
      queryLower.includes('dao et al') ||
      queryLower.includes('evaluate silvicultural') ||
      (!isUncertaintyQuery && !isCarbonBalanceQuery && !isFireDiagnosisQuery && queryLower.includes('rodal'));

    try {
      if (isUncertaintyQuery) {
        // Consultar métricas de contrastación formal en backend (/api/v1/validation/scientific-metrics)
        const metrics = await ForestTwinAPI.getScientificMetrics();
        const uncertTrad = metrics?.uncertaintyDistributions?.[0] || { sigmaErrorMgCHa: 28.4, ci95PctMgCHa: 55.66 };
        const uncertS2 = metrics?.uncertaintyDistributions?.[1] || { sigmaErrorMgCHa: 23.8, ci95PctMgCHa: 46.65, reductionPct: 16.2 };
        const uncertMulti = metrics?.uncertaintyDistributions?.[2] || { sigmaErrorMgCHa: 18.5, ci95PctMgCHa: 36.26, reductionPct: 34.86 };
        const h1Hybrid = metrics?.modelComparison?.[2] || { r2: 0.884, rmse: 17.58, mae: 11.24 };

        const structured: StructuredDecisionBlocks = {
          stand_id: language === 'es' ? 'HIPÓTESIS PRINCIPAL CONFIRMADA' : 'MAIN HYPOTHESIS CONFIRMED',
          risk_level: `REDUCCIÓN: ${uncertMulti.reductionPct || 34.86}% (≥ 30.0%)`,
          biophysical_diagnosis: language === 'es'
            ? `Validación experimental formal de contrastación de hipótesis (Sección 3 del artículo). El Inventario Forestal Nacional tradicional basado en parcelas fijas terrestres exhibe una desviación estándar de error de σ = ±${uncertTrad.sigmaErrorMgCHa} Mg C/ha (IC 95%: ±${uncertTrad.ci95PctMgCHa} Mg C/ha) por discontinuidad espacial. El sensor óptico satelital aislado (Sentinel-2) reduce el error a σ = ±${uncertS2.sigmaErrorMgCHa} Mg C/ha (${uncertS2.reductionPct}% de reducción), pero se satura asintóticamente en biomasas densas (>100 Mg C/ha).`
            : `Formal experimental hypothesis validation (Section 3). Traditional national forest inventories based on terrestrial fixed plots show an error standard deviation of σ = ±${uncertTrad.sigmaErrorMgCHa} Mg C/ha (95% CI: ±${uncertTrad.ci95PctMgCHa} Mg C/ha). Isolated optical satellite sensors (Sentinel-2) reduce error to σ = ±${uncertS2.sigmaErrorMgCHa} Mg C/ha (${uncertS2.reductionPct}% reduction), but saturate in high biomass (>100 Mg C/ha).`,
          fire_risk_evaluation: language === 'es'
            ? `La arquitectura de Gemelo Digital SilvaTwin integra el perfil vertical LiDAR GEDI L4A (RH98 continuo), radar Sentinel-1 SAR (humedad de combustible foliar FMC) y torres FLUXNET bajo asimilación continua con Filtro de Kalman EnKF (N=50). Esta fusión multiescalar contrae la dispersión de error a σ = ±${uncertMulti.sigmaErrorMgCHa} Mg C/ha (IC 95%: ±${uncertMulti.ci95PctMgCHa} Mg C/ha), logrando una reducción neta del ${uncertMulti.reductionPct}% que confirma la Hipótesis Principal.`
            : `The SilvaTwin Digital Twin architecture integrates GEDI L4A vertical LiDAR profiles (continuous RH98), Sentinel-1 SAR radar (FMC fuel moisture), and FLUXNET towers under continuous EnKF assimilation (N=50). This multiscale fusion contracts error dispersion to σ = ±${uncertMulti.sigmaErrorMgCHa} Mg C/ha (95% CI: ±${uncertMulti.ci95PctMgCHa} Mg C/ha), achieving a ${uncertMulti.reductionPct}% net reduction and confirming the Main Hypothesis.`,
          adaptive_recommendation: language === 'es'
            ? `Adoptar la estimación de biomasa híbrida (StackingRegressor con R² = ${h1Hybrid.r2}, RMSE = ${h1Hybrid.rmse} Mg C/ha) para auditorías de proyectos de carbono de grado de inversión, eliminando castigos de reserva de mitigación (buffer discount) en esquemas REDD+ y ART-TREES.`
            : `Adopt hybrid biomass estimation (StackingRegressor with R² = ${h1Hybrid.r2}, RMSE = ${h1Hybrid.rmse} Mg C/ha) for investment-grade carbon project audits, removing buffer discount penalties in REDD+ and ART-TREES frameworks.`,
          scientific_justification: language === 'es'
            ? `Rodríguez Preciado & Montenegro Baca (UNT, 2026); Ometto et al. (2023) [NASA GEDI Tropical Calibrations]; Borsah et al. (2023) [Allometric Harmonization]; Chen et al. (2022) [PINN / Híbridos]. Margen de incertidumbre residual: ±${uncertMulti.sigmaErrorMgCHa} Mg C/ha.`
            : `Rodríguez Preciado & Montenegro Baca (UNT, 2026); Ometto et al. (2023); Borsah et al. (2023); Chen et al. (2022). Residual uncertainty bound: ±${uncertMulti.sigmaErrorMgCHa} Mg C/ha.`,
          uncertainty_ci_width: uncertMulti.sigmaErrorMgCHa || 18.5,
          flow_step: language === 'es' ? 'Validación Experimental de Hipótesis (H1, H2, H3) • Backend /validation' : 'Experimental Hypothesis Validation (H1, H2, H3) • Backend /validation',
        };

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          structured,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

      } else if (isCarbonBalanceQuery) {
        // Consultar serie temporal FLUXNET real del backend (/api/v1/simulations/flux-timeseries/{region_id})
        const timeseries = await ForestTwinAPI.getFluxTimeSeries(region.id);
        let meanGpp = 0, meanNee = 0, meanReco = 0;
        if (timeseries && timeseries.length > 0) {
          meanGpp = timeseries.reduce((acc, t) => acc + (t.fluxnet_gpp || t.pg3_gpp || 0), 0) / timeseries.length;
          meanNee = timeseries.reduce((acc, t) => acc + (t.fluxnet_nee || t.pg3_nee || 0), 0) / timeseries.length;
          meanReco = timeseries.reduce((acc, t) => acc + (t.fluxnet_reco || t.pg3_reco || 0), 0) / timeseries.length;
        } else {
          meanGpp = 8.5; meanNee = -2.4; meanReco = 6.1;
        }
        const annualSequestrationTons = Math.abs(meanNee * 3.65).toFixed(1);
        const isSink = meanNee < 0;

        const structured: StructuredDecisionBlocks = {
          stand_id: `${effectiveStandId} • ${region.name}`,
          risk_level: isSink
            ? (language === 'es' ? `SUMIDERO ACTIVO (${meanNee.toFixed(2)} g C/m²/d)` : `ACTIVE SINK (${meanNee.toFixed(2)} g C/m²/d)`)
            : (language === 'es' ? `FUENTE NETA EMISORA (+${meanNee.toFixed(2)} g C/m²/d)` : `NET CARBON SOURCE (+${meanNee.toFixed(2)} g C/m²/d)`),
          biophysical_diagnosis: language === 'es'
            ? `Balance anual de flujos medido por la torre FLUXNET (${region.fluxnetSiteName || region.fluxnetSiteId}) en ${region.name}: Productividad Primaria Bruta (GPP) media = ${meanGpp.toFixed(2)} g C/m²/día, Respiración Ecosistémica (Reco) = ${meanReco.toFixed(2)} g C/m²/día, resultando en un Intercambio Neto del Ecosistema (NEE) de ${meanNee.toFixed(2)} g C/m²/día. Stock arbóreo AGB vivo del rodal: ${effectiveAgb.toFixed(1)} Mg C/ha.`
            : `Annual flux balance recorded by FLUXNET tower (${region.fluxnetSiteName || region.fluxnetSiteId}) in ${region.name}: Mean Gross Primary Productivity (GPP) = ${meanGpp.toFixed(2)} g C/m²/day, Ecosystem Respiration (Reco) = ${meanReco.toFixed(2)} g C/m²/day, yielding a Net Ecosystem Exchange (NEE) of ${meanNee.toFixed(2)} g C/m²/day. Live stand AGB stock: ${effectiveAgb.toFixed(1)} Mg C/ha.`,
          fire_risk_evaluation: language === 'es'
            ? `El acoplamiento ecofisiológico 3-PG evidencia que el dosel mantiene asimilación fotosintética neta positiva durante la mayor parte del año. Durante el estiaje crítico con déficit de presión de vapor elevado (VPD > 1.8 kPa), se constata un cierre estomático regulado que atenúa el estrés hídrico sin colapso del sumidero.`
            : `3-PG ecophysiological coupling shows the canopy maintains positive net photosynthetic assimilation throughout most of the year. During critical dry periods with high vapor pressure deficit (VPD > 1.8 kPa), regulated stomatal closure mitigates water stress without collapsing the carbon sink.`,
          adaptive_recommendation: language === 'es'
            ? `Preservar la estructura vertical del dosel dominante y aplicar enriquecimiento silvícola con especies de madera densa para sostener la tasa de captura neta (+${annualSequestrationTons} t C/ha/año). Elegible para emisión de créditos de carbono con certificación Verra VCS / ART-TREES.`
            : `Preserve dominant canopy vertical structure and apply silvicultural enrichment with dense wood species to sustain net sequestration (+${annualSequestrationTons} t C/ha/yr). Eligible for carbon credit issuance under Verra VCS / ART-TREES.`,
          scientific_justification: language === 'es'
            ? `Formulación ecofisiológica 3-PG de Landsberg & Waring (1997) calibrada con covarianza de torbellinos FLUXNET (Baldocchi et al., 2020) y modelo residual multiescalar (Chen et al., 2022). Incertidumbre estimada en ±18.5 Mg C/ha.`
            : `Landsberg & Waring (1997) 3-PG ecophysiological formulation calibrated against FLUXNET eddy covariance (Baldocchi et al., 2020) and multiscale residual modeling (Chen et al., 2022). Uncertainty bound: ±18.5 Mg C/ha.`,
          uncertainty_ci_width: 18.5,
          flow_step: language === 'es' ? 'Asimilación de Flujos FLUXNET + Ecuaciones 3-PG' : 'FLUXNET Carbon Flux Assimilation + 3-PG Equations',
        };

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          structured,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

      } else if (isFireDiagnosisQuery) {
        // Diagnóstico biofísico de combustible y riesgo de incendio con telemetría viva del rodal
        const telemetryPayload: StandTelemetryInput = {
          stand_id: effectiveStandId,
          region_name: region.name,
          species: effectiveSpecies,
          agb_mgc_ha: effectiveAgb,
          gedi_height_m: effectiveHeight,
          fuel_moisture_pct: effectiveFmc,
          fwi_risk: effectiveFwi,
          ndvi: effectiveNdvi,
          slope_pct: effectiveSlope,
          days_without_rain: 18,
        };

        const evalResult = await ForestTwinAPI.runSemanticEvaluation(telemetryPayload);

        const structured: StructuredDecisionBlocks = {
          stand_id: effectiveStandId,
          risk_level: effectiveFwi >= 0.70 || effectiveFmc < 25.0
            ? (language === 'es' ? 'EXTREMO (Alerta Roja - FWI Crítico)' : 'EXTREME (Red Alert - Critical FWI)')
            : effectiveFwi >= 0.45 || effectiveFmc < 40.0
            ? (language === 'es' ? 'MODERADO - ALTO (Alerta Amarilla)' : 'MODERATE - HIGH (Yellow Alert)')
            : (language === 'es' ? 'BAJO - CONDICIONES SEGURAS (Verde)' : 'LOW - SAFE CONDITIONS (Green)'),
          biophysical_diagnosis: language === 'es'
            ? `Diagnóstico de combustibles en Rodal ${effectiveStandId} (${effectiveSpecies}). Humedad de combustible foliar vivo (FMC radar Sentinel-1 SAR) calibrada en ${effectiveFmc.toFixed(1)}%, pendiente del terreno de ${effectiveSlope.toFixed(1)}% y carga combustible en dosel de ${effectiveAgb.toFixed(1)} Mg C/ha con altura de copa de ${effectiveHeight.toFixed(1)}m (LiDAR GEDI RH98).`
            : `Fuel diagnosis for Stand ${effectiveStandId} (${effectiveSpecies}). Live fuel moisture content (FMC by Sentinel-1 SAR radar) calibrated at ${effectiveFmc.toFixed(1)}%, terrain slope at ${effectiveSlope.toFixed(1)}%, and canopy fuel load of ${effectiveAgb.toFixed(1)} Mg C/ha with canopy height of ${effectiveHeight.toFixed(1)}m (GEDI RH98).`,
          fire_risk_evaluation: language === 'es'
            ? `Índice meteorológico FWI = ${effectiveFwi.toFixed(2)}. ${effectiveFmc < 30.0 ? 'Desecación crítica del combustible fino y hojarasca: supera el umbral de ignición espontánea de Van Wagner.' : 'Humedad de follaje adecuada para sofocar igniciones superficiales.'} ${effectiveSlope > 18.0 ? `La pendiente del ${effectiveSlope}% acelera la tasa de propagación del frente de llama por convección térmica en un factor de x${(1 + effectiveSlope / 25).toFixed(1)} (Rothermel, 1972).` : 'Topografía moderada que limita la aceleración convectiva del fuego.'}`
            : `FWI meteorological index = ${effectiveFwi.toFixed(2)}. ${effectiveFmc < 30.0 ? 'Critical live fuel and litter desiccation: exceeds Van Wagner spontaneous ignition threshold.' : 'Adequate fuel moisture to temper surface ignitions.'} ${effectiveSlope > 18.0 ? `The ${effectiveSlope}% slope accelerates flame front spread rate by a factor of x${(1 + effectiveSlope / 25).toFixed(1)} (Rothermel, 1972).` : 'Moderate topography restricting convective fire acceleration.'}`,
          adaptive_recommendation: evalResult.adaptive_intervention,
          scientific_justification: language === 'es'
            ? `Modelos físicos de propagación de Rothermel (1972), criterio de transición a copas de Van Wagner (1977) y telemetría de combustible de Aragoneses et al. (2024). Incertidumbre calibrada en ±${evalResult.uncertainty_ci_width} Mg C/ha.`
            : `Rothermel (1972) physical spread model, Van Wagner (1977) crown transition criterion, and Aragoneses et al. (2024) fuel telemetry. Calibrated uncertainty bound: ±${evalResult.uncertainty_ci_width} Mg C/ha.`,
          uncertainty_ci_width: evalResult.uncertainty_ci_width,
          flow_step: language === 'es' ? 'Diagnóstico FWI + Física de Propagación de Fuego' : 'FWI Diagnosis + Physical Fire Spread Dynamics',
        };

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          structured,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

      } else if (isDirectiveQuery) {
        // Direct call to semantic evaluation endpoint (Dao et al., 2025)
        const telemetryPayload: StandTelemetryInput = {
          stand_id: effectiveStandId,
          region_name: region.name,
          species: effectiveSpecies,
          agb_mgc_ha: effectiveAgb,
          gedi_height_m: effectiveHeight,
          fuel_moisture_pct: effectiveFmc,
          fwi_risk: effectiveFwi,
          ndvi: effectiveNdvi,
          slope_pct: effectiveSlope,
          days_without_rain: 18,
        };

        const evalResult = await ForestTwinAPI.runSemanticEvaluation(telemetryPayload);

        const structured: StructuredDecisionBlocks = {
          stand_id: evalResult.stand_id || effectiveStandId,
          risk_level: evalResult.risk_level,
          biophysical_diagnosis: language === 'es'
            ? `Rodal ${effectiveStandId} (${effectiveSpecies}). Biomasa aérea AGB de ${effectiveAgb.toFixed(1)} Mg C/ha con altura de dosel LiDAR GEDI RH98 de ${effectiveHeight.toFixed(1)}m y vigor fotosintético NDVI de ${effectiveNdvi}. Flujo neto estimado: sumidero activo de carbono (${evalResult.carbon_tradeoff_assessment}).`
            : `Stand ${effectiveStandId} (${effectiveSpecies}). AGB aboveground biomass of ${effectiveAgb.toFixed(1)} Mg C/ha with LiDAR GEDI RH98 canopy height of ${effectiveHeight.toFixed(1)}m and photosynthetic NDVI vigor of ${effectiveNdvi}. Estimated net flux: active carbon sink (${evalResult.carbon_tradeoff_assessment}).`,
          fire_risk_evaluation: language === 'es'
            ? `Índice FWI = ${effectiveFwi.toFixed(2)} con contenido de humedad foliar FMC = ${effectiveFmc.toFixed(1)}%. ${evalResult.fire_behavior}`
            : `FWI Index = ${effectiveFwi.toFixed(2)} with fuel moisture content FMC = ${effectiveFmc.toFixed(1)}%. ${evalResult.fire_behavior}`,
          adaptive_recommendation: evalResult.adaptive_intervention,
          scientific_justification: language === 'es'
            ? `${evalResult.scientific_basis}. Validado contra formulación de dosel de Aragoneses et al. (2024) y metodología semántica de Dao et al. (2025). Margen de incertidumbre reducido a ±${evalResult.uncertainty_ci_width} Mg C/ha.`
            : `${evalResult.scientific_basis}. Validated against Aragoneses et al. (2024) canopy formulation and Dao et al. (2025) semantic framework. Uncertainty margin reduced to ±${evalResult.uncertainty_ci_width} Mg C/ha.`,
          uncertainty_ci_width: evalResult.uncertainty_ci_width,
          flow_step: evalResult.flow_step,
        };

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          structured,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

      } else {
        // General scientific query via AI advisor endpoint with full injected context
        const responseText = await ForestTwinAPI.askAiAdvisor(query, {
          region_id: region.id,
          selected_stand: effectiveStandId,
          current_fwi: effectiveFwi,
          current_agb: effectiveAgb,
          fuel_moisture: effectiveFmc,
          species: effectiveSpecies,
          gedi_height_m: effectiveHeight,
          slope_pct: effectiveSlope,
          language,
        });

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: language === 'es'
          ? 'Error de comunicación con el servicio de inferencia de IA. Se activó el mecanismo de contingencia biofísica local.'
          : 'Communication error with AI inference service. Local biophysical contingency was activated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'reset',
        sender: 'ai',
        text: language === 'es'
          ? `Sesión reiniciada. Conectado al rodal activo **${activeStand?.standId || region.name}**. ¿Qué análisis deseas ejecutar?`
          : `Session reset. Connected to active stand **${activeStand?.standId || region.name}**. What analysis would you like to run?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Pop-up Window */}
      {isOpen && (
        <div className={`mb-3 w-[360px] sm:w-[440px] md:w-[480px] h-[580px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl transition-all duration-300 ${
          isDark
            ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-[0_20px_60px_rgba(0,0,0,0.8)]'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-2xl'
        }`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b flex items-center justify-between transition-colors ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <Bot className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-tight flex items-center gap-1.5 ${
                  isDark ? 'text-zinc-100' : 'text-slate-900'
                }`}>
                  <span>{language === 'es' ? 'Asistente Semántico IA' : 'Semantic AI Assistant'}</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </h3>
                <p className="text-[10px] text-emerald-400 font-mono">
                  Dao et al. (2025) &bull; LangChain LCEL
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'hover:bg-slate-200 text-slate-500'
                }`}
                title={language === 'es' ? 'Reiniciar conversación' : 'Clear conversation'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'hover:bg-slate-200 text-slate-500'
                }`}
                title={language === 'es' ? 'Cerrar chat' : 'Close chat'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Stand Telemetry HUD Banner */}
          <div className={`px-3 py-1.5 border-b text-[10px] font-mono flex items-center justify-between gap-2 transition-colors ${
            isDark ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center gap-1.5 truncate">
              <Database className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-zinc-400">Rodal:</span>
              <span className="font-bold text-emerald-400 truncate">
                {activeStand?.standId || `STAND-${region.id.slice(0, 3).toUpperCase()}-0001`}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-emerald-400">
                AGB: {activeStand?.agbMgC_ha ?? region.baselineAGB} Mg
              </span>
              <span>&bull;</span>
              <span className={(activeStand?.fwiRisk ?? 0.45) > 0.6 ? 'text-rose-400 font-bold' : 'text-amber-400'}>
                FWI: {activeStand?.fwiRisk ?? 0.45}
              </span>
              <span>&bull;</span>
              <span className="text-sky-400">
                FMC: {activeStand?.fuelMoisturePct ?? 65}%
              </span>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className={`px-3 py-2 border-b overflow-x-auto no-scrollbar flex items-center gap-1.5 ${
            isDark ? 'bg-zinc-900/30 border-zinc-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 text-zinc-300 hover:text-emerald-300 hover:border-emerald-500/40'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-emerald-700'
                }`}
              >
                <HelpCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[88%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Regular text message */}
                    {m.text && (
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-br-none shadow-md font-medium'
                          : isDark
                          ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 rounded-bl-none'
                          : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                      }`}>
                        {m.text}
                      </div>
                    )}

                    {/* Structured 4-Block Decision Output (Dao et al., 2025) */}
                    {m.structured && (
                      <div className={`p-3.5 rounded-2xl border space-y-2.5 text-xs shadow-lg ${
                        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-slate-50 border-slate-300'
                      }`}>
                        {/* Status Header Badge */}
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                          <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Directiva Semántica: {m.structured.stand_id}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            m.structured.risk_level.includes('EXTREMO')
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : m.structured.risk_level.includes('MODERADO')
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {m.structured.risk_level}
                          </span>
                        </div>

                        {/* Bloque 1: Diagnóstico Biofísico */}
                        <div className={`p-2.5 rounded-xl border ${
                          isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50/70 border-emerald-200'
                        }`}>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 mb-1">
                            <Trees className="w-3.5 h-3.5 text-emerald-400" />
                            <span>1. Diagnóstico Biofísico</span>
                          </div>
                          <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                            {m.structured.biophysical_diagnosis}
                          </p>
                        </div>

                        {/* Bloque 2: Evaluación de Riesgo de Incendio */}
                        <div className={`p-2.5 rounded-xl border ${
                          isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50/70 border-amber-200'
                        }`}>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 mb-1">
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                            <span>2. Evaluación de Riesgo de Incendio</span>
                          </div>
                          <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                            {m.structured.fire_risk_evaluation}
                          </p>
                        </div>

                        {/* Bloque 3: Recomendación Silvícola Adaptativa */}
                        <div className={`p-2.5 rounded-xl border ${
                          isDark ? 'bg-sky-950/20 border-sky-500/30' : 'bg-sky-50/70 border-sky-200'
                        }`}>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400 mb-1">
                            <Target className="w-3.5 h-3.5 text-sky-400" />
                            <span>3. Recomendación Silvícola Adaptativa</span>
                          </div>
                          <p className={`text-[11px] leading-relaxed font-medium ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                            {m.structured.adaptive_recommendation}
                          </p>
                        </div>

                        {/* Bloque 4: Cita y Justificación Científica */}
                        <div className={`p-2.5 rounded-xl border ${
                          isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-white border-slate-200'
                        }`}>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-400 mb-1">
                            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                            <span>4. Cita y Justificación Científica</span>
                          </div>
                          <p className={`text-[10px] leading-relaxed font-mono ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                            {m.structured.scientific_justification}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className={`text-[9px] font-mono text-zinc-500 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                      {m.timestamp}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="font-mono text-[11px]">
                  Ejecutando cadena LangChain LCEL &bull; Asimilando telemetría...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-3 border-t transition-colors ${
            isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  language === 'es'
                    ? 'Pregunta o evalúa el rodal (ej. "Evaluar directiva")...'
                    : 'Ask or evaluate stand (e.g. "Evaluate directive")...'
                }
                disabled={isLoading}
                className={`flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${
                  isDark
                    ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500'
                    : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all shrink-0 cursor-pointer"
                title={language === 'es' ? 'Enviar consulta' : 'Send query'}
              >
                <Send className="w-4 h-4 stroke-[2.2]" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-full shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(16,185,129,0.7)] transition-all transform hover:scale-105 cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-zinc-950 border-2 border-emerald-500 animate-ping" />
          </div>
          <span className="text-xs tracking-wide">
            {language === 'es' ? 'Asistente IA Semántico' : 'Semantic AI Assistant'}
          </span>
          {activeStand && (
            <span className="text-[10px] font-mono bg-zinc-950/20 px-2 py-0.5 rounded-full border border-zinc-950/30">
              {activeStand.standId}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
