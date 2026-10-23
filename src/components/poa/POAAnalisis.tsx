import React, { useState } from 'react';
import { AnalisisCualitativoPOA, BloquesCualitativos } from '../../types';
import { Sparkles, Settings2, FileText, Check, AlertCircle } from 'lucide-react';

interface POAAnalisisProps {
  analisis: AnalisisCualitativoPOA;
  onChange: (analisis: AnalisisCualitativoPOA) => void;
  year: number;
}

export const POAAnalisis: React.FC<POAAnalisisProps> = ({ analisis, onChange, year }) => {
  const [activePeriod, setActivePeriod] = useState<'semestre1' | 'anual'>('semestre1');
  const [maxChars, setMaxChars] = useState<number>(analisis.maxCaracteres || 1000);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);

  const currentBloque: BloquesCualitativos = analisis[activePeriod];

  const handleTextChange = (field: keyof BloquesCualitativos, text: string) => {
    onChange({
      ...analisis,
      maxCaracteres: maxChars,
      [activePeriod]: {
        ...currentBloque,
        [field]: text,
      },
    });
  };

  const handleMaxCharsChange = (val: number) => {
    const cleanVal = Math.max(200, val);
    setMaxChars(cleanVal);
    onChange({
      ...analisis,
      maxCaracteres: cleanVal,
    });
  };

  const handleGenerateSummary = async () => {
    setAiError(null);
    setAiSuccess(null);

    const fullTextToSummarize = `LOGROS DEL OBJETIVO:
${currentBloque.logro}

DIFICULTADES ENCONTRADAS:
${currentBloque.dificultades}

ACCIONES REALIZADAS:
${currentBloque.acciones}`;

    if (!currentBloque.logro && !currentBloque.dificultades && !currentBloque.acciones) {
      setAiError('Por favor complete al menos uno de los tres campos cualitativos antes de generar el resumen.');
      return;
    }

    try {
      setIsSummarizing(true);
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullTextToSummarize,
          maxChars,
          context: `POA ${year} CRAI UCA - Línea Micelio (${activePeriod === 'semestre1' ? 'Enero-Junio' : 'Anual'})`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo generar el resumen.');
      }

      handleTextChange('resumen', data.summary);
      setAiSuccess(`¡Resumen generado con éxito! Longitud: ${data.summary.length} caracteres.`);
    } catch (err: any) {
      setAiError(err.message || 'Error comunicándose con el servicio de IA.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const renderTextArea = (
    label: string,
    field: keyof BloquesCualitativos,
    placeholder: string,
    rows: number = 6
  ) => {
    const val = currentBloque[field] || '';
    const charCount = val.length;
    const isOver = charCount > maxChars;

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-900 dark:text-white text-xs">
            {label}
          </label>
          <div className="flex items-center gap-2 text-[11px] tabular-nums font-mono">
            <span
              className={isOver ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'}
            >
              {charCount} / {maxChars} caracteres
            </span>
            {isOver && (
              <span className="text-[10px] bg-rose-50 dark:bg-rose-950/50 text-rose-600 px-1.5 py-0.5 rounded">
                Excede el límite
              </span>
            )}
          </div>
        </div>

        <textarea
          rows={rows}
          value={val}
          onChange={(e) => handleTextChange(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-1 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-y leading-relaxed transition-colors ${
            isOver
              ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
              : 'border-slate-200 dark:border-slate-700 focus:ring-[#234a80]'
          }`}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controles de Configuración y Periodo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-100 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Selector de Periodo */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActivePeriod('semestre1')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activePeriod === 'semestre1'
                ? 'bg-[#234a80] text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Periodo Enero - Junio (Semestral)
          </button>
          <button
            type="button"
            onClick={() => setActivePeriod('anual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activePeriod === 'anual'
                ? 'bg-[#234a80] text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Periodo Anual (Enero - Diciembre)
          </button>
        </div>

        {/* Límite de Caracteres Configurable */}
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-600 dark:text-slate-300">Límite por recuadro:</span>
          <input
            type="number"
            min="200"
            max="5000"
            step="50"
            value={maxChars}
            onChange={(e) => handleMaxCharsChange(Number(e.target.value))}
            className="w-20 px-2 py-1 text-xs font-mono tabular-nums text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          />
          <span className="text-xs text-slate-400">caracteres</span>
        </div>
      </div>

      {aiError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {aiSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <Check className="w-4 h-4 shrink-0" />
          <span>{aiSuccess}</span>
        </div>
      )}

      {/* Los 4 Cuadros de Texto Requeridos en el POA */}
      <div className="space-y-4">
        {renderTextArea(
          '1. Descripción de logro del objetivo del periodo:',
          'logro',
          'Detalle el grado de cumplimiento de los objetivos planteados para la línea Micelio...'
        )}

        {renderTextArea(
          '2. Dificultades encontradas (internas y externas):',
          'dificultades',
          'Explique los retos temporales, administrativos o técnicos ocurridos durante el periodo...'
        )}

        {renderTextArea(
          '3. Acciones realizadas:',
          'acciones',
          'Detalle las actividades, acompañamientos a investigadores y seguimiento a depósitos efectuados...'
        )}

        {/* Cuadro de Resumen con Asistente Gemini opcional */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#234a80] dark:text-[#9bc2f7]" />
              <label className="font-semibold text-slate-900 dark:text-white text-xs">
                4. Resumen consolidado para el POA:
              </label>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-[11px] tabular-nums font-mono text-slate-500 dark:text-slate-400">
                {(currentBloque.resumen || '').length} / {maxChars} caracteres
              </div>
              <button
                type="button"
                disabled={isSummarizing}
                onClick={handleGenerateSummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#234a80] hover:bg-[#1b3b66] disabled:opacity-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#e06d26]" />
                <span>{isSummarizing ? 'Condensando texto...' : 'Generar resumen con Gemini'}</span>
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={currentBloque.resumen || ''}
            onChange={(e) => handleTextChange('resumen', e.target.value)}
            placeholder="Resumen ejecutivo que condensa los logros, retos y acciones al límite exacto de caracteres solicitado en el POA..."
            className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#234a80] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-y leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
