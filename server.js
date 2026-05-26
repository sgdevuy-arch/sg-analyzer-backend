import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

import lighthouse from "lighthouse";
import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import lighthouse from "lighthouse";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/screenshots", express.static("screenshots"));

async function analizarSitio(url) {

    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const { port } = new URL(browser.wsEndpoint());

    const options = {
        logLevel: "info",
        output: "json",
        port
    };

    const result = await lighthouse(url, options);

    const report = result.lhr;

    await browser.close();

    return {
        performance: Math.round(report.categories.performance.score * 100),
        seo: Math.round(report.categories.seo.score * 100),
        accessibility: Math.round(report.categories.accessibility.score * 100),
        bestPractices: Math.round(report.categories["best-practices"].score * 100)
    };
}

app.use(cors());

app.use("/screenshots", express.static("screenshots"));

app.use(express.json());

async function analizarSitio(url) {

    const chrome = await chromeLauncher.launch({

        chromeFlags: [
            "--headless",
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    });

    const options = {

        logLevel: "info",

        output: "json",

        port: chrome.port
    };

    const runnerResult = await lighthouse(url, options);

    const report = runnerResult.lhr;

    await chrome.kill();

    return {

        performance: Math.round(
            report.categories.performance.score * 100
        ),

        seo: Math.round(
            report.categories.seo.score * 100
        ),

        accessibility: Math.round(
            report.categories.accessibility.score * 100
        ),

        bestPractices: Math.round(
            report.categories["best-practices"].score * 100
        )
    };
}

async function tomarScreenshot(url){

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

function generarAnalisis(resultado){

    let recomendaciones = [];

    // PERFORMANCE

    if(resultado.performance < 50){

        recomendaciones.push(
            "⚡ El rendimiento es bajo. Optimiza imágenes y reduce scripts pesados."
        );

    } else if(resultado.performance < 80){

        recomendaciones.push(
            "⚡ El rendimiento es aceptable, pero todavía puede mejorar."
        );

    } else {

        recomendaciones.push(
            "⚡ Excelente rendimiento general."
        );
    }

    // SEO

    if(resultado.seo < 70){

        recomendaciones.push(
            "🔍 El SEO necesita mejoras en meta etiquetas y estructura."
        );

    } else {

        recomendaciones.push(
            "🔍 Buen nivel de SEO."
        );
    }

    // ACCESSIBILITY

    if(resultado.accessibility < 70){

        recomendaciones.push(
            "♿ Hay problemas de accesibilidad para algunos usuarios."
        );

    } else {

        recomendaciones.push(
            "♿ Buena accesibilidad."
        );
    }

    // BEST PRACTICES

    if(resultado.bestPractices < 70){

        recomendaciones.push(
            "✅ Algunas buenas prácticas de seguridad y desarrollo faltan."
        );

    } else {

        recomendaciones.push(
            "✅ Buenas prácticas correctas."
        );
    }

    return recomendaciones;
}

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Servidor funcionando en puerto ${PORT}`);
});