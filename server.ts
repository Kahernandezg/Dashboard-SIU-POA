import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';
import {
  getReportYearsFromDb,
  getReportByYearFromDb,
  upsertReportInDb,
  getChangeLogsFromDb,
  addChangeLogToDb,
} from './src/db/reports.ts';
import { db } from './src/db/index.ts';
import { reports, changeLogs } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import { createSample2026Data, cloneYearStructure } from './src/services/sampleData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google Gemini Client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Check Gemini AI availability endpoint
app.get('/api/ai/status', (_req, res) => {
  res.json({
    available: !!aiClient,
    model: 'gemini-3.8-flash',
  });
});

// Summarize / Condense qualitative text for POA & SIU
app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { text, maxChars = 1000, context = 'Informe POA/SIU CRAI UCA' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Texto no proporcionado o inválido' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'El servicio Gemini AI no está configurado con una clave válida en el entorno del servidor.',
      });
    }

    const prompt = `Actúa como editor senior de informes académicos y de gestión universitaria para el CRAI (Centro de Recursos para el Aprendizaje y la Investigación) de la UCA (El Salvador).
Condensa el siguiente texto manteniendo el rigor técnico, datos clave, nombres de personas o métricas relevantes, pero asegurando que la extensión sea de máximo ${maxChars} caracteres (incluyendo espacios).
Debe redactarse en un único párrafo formal, coherente e institucional, sin viñetas, sin introducciones tipo "Aquí está el resumen", directamente el texto consolidado.

Contexto del informe: ${context}
Texto original:
"${text}"`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const summary = response.text?.trim() || '';

    return res.json({
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
    });
  } catch (error: any) {
    console.error('Error generating summary with Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Error al procesar la solicitud con Gemini AI',
    });
  }
});

// ==========================================
// CLOUD SQL & FIREBASE AUTH API ROUTES
// ==========================================

// Sincronizar o registrar usuario autenticado en PostgreSQL
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { uid, email } = req.user!;
    const { name, photoUrl } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: 'User UID and email are required.' });
    }

    const user = await getOrCreateUser(uid, email, name, photoUrl);
    return res.json({ user });
  } catch (error: any) {
    console.error('Error in /api/auth/sync:', error);
    return res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// Lazy seeder check helper
let isDbSeeded = false;
async function ensureSampleDataIfEmpty() {
  if (isDbSeeded) return;
  try {
    const existingYears = await getReportYearsFromDb();
    if (existingYears.length === 0) {
      const sample = createSample2026Data();
      await upsertReportInDb(sample, 'Sistema CRAI');
      await addChangeLogToDb({
        year: 2026,
        module: 'AÑO',
        section: 'Inicialización',
        action: 'Carga inicial de datos institucionales 2026 en Cloud SQL',
        user: 'Sistema CRAI',
        timestamp: new Date().toISOString(),
        detail: 'Carga automática de estructura y datos 2026 desde informes UCA',
      });
      console.log('Cloud SQL initialized with sample 2026 data.');
    }
    isDbSeeded = true;
  } catch (err) {
    console.error('Lazy DB seed check failed:', err);
  }
}

// Obtener años disponibles
app.get('/api/reports/years', async (_req, res) => {
  try {
    await ensureSampleDataIfEmpty();
    const years = await getReportYearsFromDb();
    return res.json(years);
  } catch (error: any) {
    console.error('Error in GET /api/reports/years:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch report years' });
  }
});

// Obtener informe por año
app.get('/api/reports/:year', async (req, res) => {
  try {
    await ensureSampleDataIfEmpty();
    const year = parseInt(req.params.year, 10);
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Año inválido' });
    }
    const report = await getReportByYearFromDb(year);
    if (!report) {
      return res.status(404).json({ error: `Informe para el año ${year} no encontrado` });
    }
    return res.json(report);
  } catch (error: any) {
    console.error(`Error in GET /api/reports/${req.params.year}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to fetch report' });
  }
});

// Guardar o actualizar informe por año
app.post('/api/reports/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Año inválido' });
    }
    const { data, user = 'Kevin Hernández', logDetail } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    data.lastModified = new Date().toISOString();
    data.modifiedBy = user;

    await upsertReportInDb(data, user);

    if (logDetail) {
      await addChangeLogToDb({
        year,
        module: logDetail.module || 'POA',
        section: logDetail.section || 'General',
        action: logDetail.action || 'Actualización',
        user: logDetail.user || user,
        timestamp: data.lastModified,
      });
    }

    return res.json({ success: true, lastModified: data.lastModified });
  } catch (error: any) {
    console.error(`Error in POST /api/reports/${req.params.year}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to save report' });
  }
});

// Clonar año
app.post('/api/reports/clone', async (req, res) => {
  try {
    const { sourceYear, targetYear, user = 'Kevin Hernández' } = req.body;
    if (!sourceYear || !targetYear) {
      return res.status(400).json({ error: 'sourceYear y targetYear son requeridos' });
    }

    const existingTarget = await getReportByYearFromDb(targetYear);
    if (existingTarget) {
      return res.status(409).json({ error: `El año ${targetYear} ya existe en el sistema.` });
    }

    const sourceData = await getReportByYearFromDb(sourceYear);
    if (!sourceData) {
      return res.status(404).json({ error: `El año de origen ${sourceYear} no existe para clonar.` });
    }

    const newYearData = cloneYearStructure(sourceData, targetYear);
    newYearData.modifiedBy = user;
    await upsertReportInDb(newYearData, user);

    await addChangeLogToDb({
      year: targetYear,
      module: 'AÑO',
      section: 'Clonación',
      action: `Año ${targetYear} creado como clon estructurado desde ${sourceYear}`,
      user,
      timestamp: new Date().toISOString(),
    });

    return res.json(newYearData);
  } catch (error: any) {
    console.error('Error in POST /api/reports/clone:', error);
    return res.status(500).json({ error: error.message || 'Failed to clone year' });
  }
});

// Eliminar año
app.delete('/api/reports/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const user = (req.query.user as string) || 'Usuario';
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Año inválido' });
    }

    await db.delete(reports).where(eq(reports.year, year));
    await addChangeLogToDb({
      year,
      module: 'AÑO',
      section: 'Gestión de Años',
      action: `Año ${year} eliminado del sistema`,
      user,
      timestamp: new Date().toISOString(),
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error(`Error in DELETE /api/reports/${req.params.year}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to delete year' });
  }
});

// Obtener bitácora de auditoría
app.get('/api/reports/:year/changelogs', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const logs = await getChangeLogsFromDb(isNaN(year) ? undefined : year);
    return res.json(logs);
  } catch (error: any) {
    console.error('Error in GET changelogs:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch changelogs' });
  }
});

// Restablecer datos a valores de muestra
app.post('/api/reports/reset', async (_req, res) => {
  try {
    const sample = createSample2026Data();
    await upsertReportInDb(sample, 'Sistema CRAI');
    return res.json({ success: true, message: 'Restablecido con éxito a los datos 2026' });
  } catch (error: any) {
    console.error('Error in POST /api/reports/reset:', error);
    return res.status(500).json({ error: error.message || 'Failed to reset reports' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
