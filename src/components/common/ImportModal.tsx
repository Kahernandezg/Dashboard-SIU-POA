import React, { useState } from 'react';
import { Upload, FileSpreadsheet, X, Check, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { parseFile, ParsedTable, normalizeNumber, normalizeDate } from '../../services/excelImport';
import { YearData, MESES_COMPLETO } from '../../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearData: YearData;
  onApplyImport: (updatedYearData: YearData, logMessage: string) => Promise<void>;
  defaultTargetSection?: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  yearData,
  onApplyImport,
  defaultTargetSection = 'poa_publicaciones',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedSheets, setParsedSheets] = useState<{ [name: string]: ParsedTable } | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [targetSection, setTargetSection] = useState<string>(defaultTargetSection);
  const [columnMapping, setColumnMapping] = useState<{ [fieldKey: string]: string }>({});
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setParsing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await parseFile(selected);
      setParsedSheets(result.sheets);
      const firstSheet = Object.keys(result.sheets)[0];
      setSelectedSheet(firstSheet);
      autoMapColumns(targetSection, result.sheets[firstSheet]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el archivo seleccionado');
    } finally {
      setParsing(false);
    }
  };

  const autoMapColumns = (section: string, sheet: ParsedTable) => {
    if (!sheet) return;
    const headers = sheet.headers;
    const mapping: { [key: string]: string } = {};

    const findMatch = (possibleNames: string[]) => {
      const match = headers.find((h) =>
        possibleNames.some((p) => h.toLowerCase().includes(p.toLowerCase()))
      );
      return match || '';
    };

    if (section === 'poa_presupuesto') {
      mapping['rubro'] = findMatch(['rubro', 'concepto', 'descrip', 'nombre']);
      mapping['monto'] = findMatch(['monto', 'costo', 'presupuesto', 'usd', 'total']);
      mapping['comentarios'] = findMatch(['coment', 'nota', 'justif']);
    } else if (section === 'poa_publicaciones') {
      mapping['tipo'] = findMatch(['tipo', 'publicac', 'categoria']);
      mapping['lineaBase'] = findMatch(['linea base', 'base', '2025', 'anterior']);
      mapping['proyeccionActual'] = findMatch(['proyeccion', 'meta', '2026']);
      mapping['resultadosActual'] = findMatch(['resultado', 'observado', 'obtenido']);
      mapping['proyeccionSiguiente'] = findMatch(['siguiente', '2027']);
      mapping['observaciones'] = findMatch(['nota', 'descrip', 'observac', 'justific', 'coment']);
    } else if (section === 'siu_recursos') {
      mapping['recurso'] = findMatch(['recurso', 'base', 'nombre', 'plataforma']);
    } else if (section === 'siu_riuca') {
      mapping['titulo'] = findMatch(['titulo', 'nombre']);
      mapping['handle'] = findMatch(['handle', 'enlace', 'url', 'link']);
      mapping['comunidad'] = findMatch(['comunidad', 'facultad']);
      mapping['coleccion'] = findMatch(['coleccion', 'tipo']);
      mapping['fecha'] = findMatch(['fecha', 'ano', 'publicado']);
      mapping['areaMined'] = findMatch(['area', 'mined']);
    }

    setColumnMapping(mapping);
    generatePreview(section, sheet, mapping);
  };

  const generatePreview = (section: string, sheet: ParsedTable, mapping: { [key: string]: string }) => {
    if (!sheet || !sheet.rows) return;
    const headers = sheet.headers;

    const sample = sheet.rows.slice(0, 5).map((row) => {
      const rowObj: any = {};
      for (const [field, colName] of Object.entries(mapping)) {
        const colIdx = headers.indexOf(colName);
        if (colIdx !== -1) {
          rowObj[field] = row[colIdx];
        }
      }
      return rowObj;
    });

    setPreviewRows(sample);
  };

  const handleApply = async () => {
    if (!parsedSheets || !selectedSheet) return;
    const currentSheet = parsedSheets[selectedSheet];
    if (!currentSheet) return;

    try {
      const updatedData: YearData = JSON.parse(JSON.stringify(yearData));
      const headers = currentSheet.headers;

      if (targetSection === 'poa_presupuesto') {
        const rubroCol = headers.indexOf(columnMapping['rubro']);
        const montoCol = headers.indexOf(columnMapping['monto']);
        const comCol = headers.indexOf(columnMapping['comentarios']);

        if (rubroCol === -1 || montoCol === -1) {
          throw new Error('Debe mapear al menos las columnas de Rubro y Monto.');
        }

        const newItems = currentSheet.rows
          .filter((r) => r[rubroCol] && String(r[rubroCol]).trim() !== '')
          .map((r, i) => ({
            id: `pres-imp-${Date.now()}-${i}`,
            rubro: String(r[rubroCol]).trim(),
            monto: normalizeNumber(r[montoCol]),
            comentarios: comCol !== -1 && r[comCol] ? String(r[comCol]).trim() : '',
          }));

        updatedData.poa.presupuesto = newItems;
      } else if (targetSection === 'poa_publicaciones') {
        const tipoCol = headers.indexOf(columnMapping['tipo']);
        const baseCol = headers.indexOf(columnMapping['lineaBase']);
        const proyCol = headers.indexOf(columnMapping['proyeccionActual']);
        const resCol = headers.indexOf(columnMapping['resultadosActual']);
        const sigCol = headers.indexOf(columnMapping['proyeccionSiguiente']);
        const obsCol = headers.indexOf(columnMapping['observaciones']);

        if (tipoCol === -1) {
          throw new Error('Debe mapear la columna de Tipo de Publicación.');
        }

        const newPubs = currentSheet.rows
          .filter((r) => r[tipoCol] && String(r[tipoCol]).trim() !== '')
          .map((r, i) => ({
            id: `pub-imp-${Date.now()}-${i}`,
            tipo: String(r[tipoCol]).trim(),
            lineaBase: baseCol !== -1 ? normalizeNumber(r[baseCol]) : 0,
            proyeccionActual: proyCol !== -1 ? normalizeNumber(r[proyCol]) : 0,
            resultadosActual: resCol !== -1 ? normalizeNumber(r[resCol]) : 0,
            proyeccionSiguiente: sigCol !== -1 ? normalizeNumber(r[sigCol]) : 0,
            observaciones: obsCol !== -1 && r[obsCol] ? String(r[obsCol]).trim() : '',
          }));

        updatedData.poa.publicaciones = newPubs;
      } else if (targetSection === 'siu_recursos') {
        const recCol = headers.indexOf(columnMapping['recurso']);
        if (recCol === -1) {
          throw new Error('Debe mapear la columna con el nombre del Recurso Electrónico.');
        }

        // Buscar columnas correspondientes a los 12 meses
        const monthCols = MESES_COMPLETO.map((m) =>
          headers.findIndex((h) => h.toLowerCase().includes(m.toLowerCase().substring(0, 3)))
        );

        const newRecs = currentSheet.rows
          .filter((r) => r[recCol] && String(r[recCol]).trim() !== '')
          .map((r, i) => ({
            id: `re-imp-${Date.now()}-${i}`,
            recurso: String(r[recCol]).trim(),
            meses: monthCols.map((cIdx) => (cIdx !== -1 ? normalizeNumber(r[cIdx]) : 0)),
          }));

        updatedData.siu.s23_recursosElectronicos = newRecs;
      } else if (targetSection === 'siu_riuca') {
        const titCol = headers.indexOf(columnMapping['titulo']);
        const hanCol = headers.indexOf(columnMapping['handle']);
        const comCol = headers.indexOf(columnMapping['comunidad']);
        const colCol = headers.indexOf(columnMapping['coleccion']);
        const fecCol = headers.indexOf(columnMapping['fecha']);
        const areCol = headers.indexOf(columnMapping['areaMined']);

        if (titCol === -1) {
          throw new Error('Debe mapear al menos el Título del documento.');
        }

        const existingHandles = new Set(updatedData.siu.s26_repositorioRIUCA.documentos.map((d) => d.handle));
        const newDocs = currentSheet.rows
          .filter((r) => r[titCol] && String(r[titCol]).trim() !== '')
          .map((r, i) => {
            const handle = hanCol !== -1 && r[hanCol] ? String(r[hanCol]).trim() : `http://hdl.handle.net/11715/${Date.now()}_${i}`;
            return {
              id: `doc-imp-${Date.now()}-${i}`,
              no: i + 1,
              titulo: String(r[titCol]).trim(),
              handle,
              comunidad: comCol !== -1 && r[comCol] ? String(r[comCol]).trim() : 'General',
              coleccion: colCol !== -1 && r[colCol] ? String(r[colCol]).trim() : 'Artículos',
              financiamiento: 'VRII UCA',
              fecha: fecCol !== -1 ? normalizeDate(r[fecCol]) : new Date().toISOString().split('T')[0],
              areaMined: areCol !== -1 ? normalizeNumber(r[areCol]) || 1 : 1,
            };
          });

        // Detección de duplicados por enlace Handle
        const deduplicated = newDocs.filter((d) => !existingHandles.has(d.handle));
        updatedData.siu.s26_repositorioRIUCA.documentos = [...updatedData.siu.s26_repositorioRIUCA.documentos, ...deduplicated];
      }

      await onApplyImport(updatedData, `Importación completada en sección ${targetSection} desde archivo ${file?.name}`);
      setSuccessMsg('¡Datos importados y normalizados con éxito!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al aplicar los datos importados.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Importador Asistido de Excel / CSV
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Soporta codificación Windows-1252 (Latin-1) y UTF-8 con tildes y Ñ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Selección de sección de destino */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Seleccione la sección de destino en el informe:
            </label>
            <select
              value={targetSection}
              onChange={(e) => {
                setTargetSection(e.target.value);
                if (parsedSheets && selectedSheet) {
                  autoMapColumns(e.target.value, parsedSheets[selectedSheet]);
                }
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-200"
            >
              <optgroup label="Módulo POA (Micelio)">
                <option value="poa_presupuesto">1.1 Presupuesto de la línea</option>
                <option value="poa_publicaciones">1.2 Publicaciones por tipo</option>
              </optgroup>
              <optgroup label="Módulo SIU (CRAI UCA)">
                <option value="siu_recursos">2.3 Estadísticas de Recursos Electrónicos</option>
                <option value="siu_riuca">2.6 Repositorio Institucional (RIUCA)</option>
              </optgroup>
            </select>
          </div>

          {/* 2. Carga de archivo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              2. Suba su archivo Excel (.xlsx, .xls) o CSV (.csv):
            </label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl p-6 text-center transition-colors">
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                {file ? (
                  <span className="font-semibold text-slate-900 dark:text-white">{file.name}</span>
                ) : (
                  'Haga clic para seleccionar o arrastre un archivo aquí'
                )}
              </p>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-400 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Hoja y codificación detectada */}
          {parsedSheets && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Codificación detectada:</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {parsedSheets[selectedSheet]?.encodingUsed || 'UTF-8'}
                </span>
              </div>
              {Object.keys(parsedSheets).length > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Hoja de cálculo:</span>
                  <select
                    value={selectedSheet}
                    onChange={(e) => {
                      setSelectedSheet(e.target.value);
                      autoMapColumns(targetSection, parsedSheets[e.target.value]);
                    }}
                    className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border rounded"
                  >
                    {Object.keys(parsedSheets).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* 4. Mapeo asistido de columnas */}
          {parsedSheets && selectedSheet && parsedSheets[selectedSheet] && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                3. Verifique el mapeo de columnas:
              </h4>
              <div className="space-y-2">
                {Object.keys(columnMapping).map((fieldKey) => (
                  <div key={fieldKey} className="flex items-center justify-between text-xs gap-3">
                    <span className="text-slate-600 dark:text-slate-400 capitalize w-1/3">
                      {fieldKey.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <select
                      value={columnMapping[fieldKey] || ''}
                      onChange={(e) => {
                        const newMap = { ...columnMapping, [fieldKey]: e.target.value };
                        setColumnMapping(newMap);
                        generatePreview(targetSection, parsedSheets[selectedSheet], newMap);
                      }}
                      className="w-1/2 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono"
                    >
                      <option value="">-- No mapear --</option>
                      {parsedSheets[selectedSheet].headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Vista previa de datos extraídos */}
          {previewRows.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                4. Vista previa de datos normalizados (primeras 5 filas):
              </h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-[11px] text-left divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-800/80">
                    <tr>
                      {Object.keys(columnMapping).map((k) => (
                        <th key={k} className="px-2.5 py-1.5 font-medium text-slate-600 dark:text-slate-300">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {previewRows.map((row, idx) => (
                      <tr key={idx}>
                        {Object.keys(columnMapping).map((k) => (
                          <td key={k} className="px-2.5 py-1 text-slate-800 dark:text-slate-200 tabular-nums">
                            {String(row[k] !== undefined && row[k] !== null ? row[k] : '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!parsedSheets || parsing}
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#234a80] hover:bg-[#1b3b66] disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer border border-[#234a80]"
          >
            <Check className="w-3.5 h-3.5 text-[#e06d26]" />
            <span>Confirmar e Importar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
