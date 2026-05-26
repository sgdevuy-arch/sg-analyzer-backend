import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import lighthouse from "lighthouse";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/screenshots", express.static("screenshots"));

/* =========================
   ANALISIS CON LIGHTHOUSE
========================= */
async function analizarSitio(url) {

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    });

    const ws = browser.wsEndpoint();
    const port = new URL(ws).port;

    const result = await lighthouse(url, {
        port,
        output: "json",
        logLevel: "silent"
    });

    const lhr = result.lhr;

    await browser.close();

    return {
        performance: Math.round(lhr.categories.performance.score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories["best-practices"].score * 100)
    };
}

/* =========================
   SCREENSHOT
========================= */
async function tomarScreenshot(url) {

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    });

    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: "networkidle2"
    });

    const nombreArchivo = `screenshot-${Date.now()}.png`;
    const ruta = `screenshots/${nombreArchivo}`;

    await page.screenshot({
        path: ruta,
        fullPage: true
    });

    await browser.close();

    return nombreArchivo;
}

/* =========================
   RECOMENDACIONES
========================= */
function generarAnalisis(resultado) {

    let recomendaciones = [];

    if (resultado.performance < 50) {
        recomendaciones.push("⚡ Rendimiento bajo. Optimiza imágenes y scripts.");
    } else if (resultado.performance < 80) {
        recomendaciones.push("⚡ Rendimiento aceptable, pero mejorable.");
    } else {
        recomendaciones.push("⚡ Excelente rendimiento.");
    }

    if (resultado.seo < 70) {
        recomendaciones.push("🔍 SEO necesita mejoras en meta etiquetas.");
    } else {
        recomendaciones.push("🔍 Buen SEO.");
    }

    if (resultado.accessibility < 70) {
        recomendaciones.push("♿ Problemas de accesibilidad detectados.");
    } else {
        recomendaciones.push("♿ Buena accesibilidad.");
    }

    if (resultado.bestPractices < 70) {
        recomendaciones.push("✅ Faltan buenas prácticas.");
    } else {
        recomendaciones.push("✅ Buenas prácticas correctas.");
    }

    return recomendaciones;
}

/* =========================
   ENDPOINT
========================= */
app.post("/analizar", async (req, res) => {

    try {

        const { url } = req.body;

        const resultado = await analizarSitio(url);
        const screenshot = await tomarScreenshot(url);
        const recomendaciones = generarAnalisis(resultado);

        res.json({
            ...resultado,
            recomendaciones,
            screenshot
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: "Error analizando sitio"
        });
    }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor funcionando en puerto ${PORT}`);
});