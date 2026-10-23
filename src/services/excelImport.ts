import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { exportWorkbook, exportToCSV } from './excelExport';
import { MESES_COMPLETO } from '../types';

export interface ParsedTable {
  headers: string[];
  rows: any[][];
  rawRows: any[][];
  encodingUsed: 'UTF-8' | 'Windows-1252';
}

/**
 * Lee un archivo (CSV o XLSX) asegurando soporte para Windows-1252 / ISO-8859-1 y UTF-8
 */
export async function parseFile(file: File): Promise<{ fileName: string; sheets: { [name: string]: ParsedTable } }> {
  const isCSV = file.name.toLowerCase().endsWith('.csv');

  if (isCSV) {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Detección heurística de UTF-8 vs Windows-1252
    let isUtf8Valid = true;
    try {
      const decoderUtf8 = new TextDecoder('utf-8', { fatal: true });
      decoderUtf8.decode(bytes);
    } catch {
      isUtf8Valid = false;
    }

    const encoding: 'UTF-8' | 'Windows-1252' = isUtf8Valid ? 'UTF-8' : 'Windows-1252';
    const decoder = new TextDecoder(encoding === 'UTF-8' ? 'utf-8' : 'windows-1252');
    const text = decoder.decode(bytes);

    const parsed = Papa.parse<string[]>(text, {
      skipEmptyLines: 'greedy',
    });

    const rawRows = parsed.data || [];
    // Encontrar fila de encabezado más probable (primera fila no vacía con texto)
    let headerIndex = 0;
    while (headerIndex < rawRows.length && (!rawRows[headerIndex] || rawRows[headerIndex].every((c) => !c || c.trim() === ''))) {
      headerIndex++;
    }

    const headers = (rawRows[headerIndex] || []).map((h, i) => (h && h.trim() ? h.trim() : `Columna ${i + 1}`));
    const rows = rawRows.slice(headerIndex + 1).filter((r) => r.some((c) => c && c.trim() !== ''));

    return {
      fileName: file.name,
      sheets: {
        'Hoja Principal': {
          headers,
          rows,
          rawRows,
          encodingUsed: encoding,
        },
      },
    };
  } else {
    // Archivo Excel .xlsx o .xls
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetsResult: { [name: string]: ParsedTable } = {};

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, blankrows: false, defval: '' });
      if (rawData.length === 0) continue;

      let headerIdx = 0;
      while (headerIdx < rawData.length && (!rawData[headerIdx] || rawData[headerIdx].every((c: any) => c === ''))) {
        headerIdx++;
      }

      const headers = (rawData[headerIdx] || []).map((h: any, i: number) => (h ? String(h).trim() : `Columna ${i + 1}`));
      const rows = rawData.slice(headerIdx + 1);

      sheetsResult[sheetName] = {
        headers,
        rows,
        rawRows: rawData,
        encodingUsed: 'UTF-8',
      };
    }

    return {
      fileName: file.name,
      sheets: sheetsResult,
    };
  }
}

/**
 * Limpia y normaliza números (elimina signos de dólar, comas de miles, espacios)
 */
export function normalizeNumber(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val).replace(/[$€,\s]/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Normaliza fechas procedentes de texto o serial de Excel a formato ISO YYYY-MM-DD
 */
export function normalizeDate(val: any): string {
  if (!val) return '';
  // Si es un número serial de Excel (ej. 45320)
  if (typeof val === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + val * 86400000);
    return date.toISOString().split('T')[0];
  }

  const str = String(val).trim();
  // Formato dd/mm/aaaa
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // Formato aaaa-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }

  return str;
}

/**
 * Descarga plantilla vacía de captura para una sección
 */
export function downloadEmptyTemplate(sectionId: string, format: 'xlsx' | 'csv' = 'xlsx') {
  let headers: string[] = [];
  let sampleRows: any[][] = [];
  let title = 'Plantilla_CRAI';

  switch (sectionId) {
    case 'poa_presupuesto':
      title = 'Plantilla_POA_Presupuesto';
      headers = ['Rubro / Concepto', 'Monto (USD)', 'Comentarios'];
      sampleRows = [
        ['1- Software / Licencia', '150.00', 'Justificación del gasto'],
        ['2- Membresía técnica', '500.00', 'Membresía institucional anual'],
      ];
      break;

    case 'poa_publicaciones':
      title = 'Plantilla_POA_Publicaciones';
      headers = ['Tipo de Publicación', 'Línea Base (Año Anterior)', 'Proyección (Año Actual)', 'Resultados Observados', 'Proyección (Siguiente)', 'Notas / Justificación'];
      sampleRows = [
        ['Conjunto de datos', 0, 5, 0, 5, 'En proceso de curaduría y anonimización de datos'],
        ['Artículo externo (indexado)', 0, 4, 8, 4, 'Meta superada en revistas Scopus/WoS'],
        ['Artículo UCA', 0, 1, 8, 2, 'Revistas ECA y Realidad y Reflexión'],
      ];
      break;

    case 'siu_recursos':
      title = 'Plantilla_SIU_Recursos_Electronicos';
      headers = ['Recurso Electrónico', ...MESES_COMPLETO];
      sampleRows = [
        ['EBSCO Academic Search Ultimate', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ['JSTOR Arts & Sciences', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ];
      break;

    case 'siu_formacion':
      title = 'Plantilla_SIU_Formacion_Personal';
      headers = ['Tipo', 'Nombre de la Formación', 'Participante', 'Categoría', 'Fecha Inicio', 'Fecha Fin', 'Institución', 'Horas', 'Modalidad', 'Estado', 'Observaciones'];
      sampleRows = [
        ['Curso', 'Curaduría y metadatos de investigación', 'Nombre del colaborador', 'Académico planta', '2026-03-01', '2026-03-15', 'Institución capacitadora', 20, 'En línea', 'Completado', 'Sin observaciones'],
      ];
      break;

    case 'siu_riuca':
      title = 'Plantilla_SIU_RIUCA_Documentos';
      headers = ['No.', 'Título', 'Enlace Handle', 'Comunidad', 'Colección', 'Financiamiento', 'Fecha', 'Área MINED (1-10)'];
      sampleRows = [
        [1, 'Título de investigación', 'http://hdl.handle.net/11715/0000', 'Ciencias Sociales', 'Artículos', 'VRII UCA', '2026-04-10', 5],
      ];
      break;

    default:
      title = 'Plantilla_Datos_CRAI';
      headers = ['Identificador / Nombre', ...MESES_COMPLETO];
      sampleRows = [['Elemento 1', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
      break;
  }

  const allData = [headers, ...sampleRows];

  if (format === 'csv') {
    exportToCSV(`${title}.csv`, allData);
  } else {
    exportWorkbook(`${title}.xlsx`, [{ name: 'Datos', data: allData }]);
  }
}
