import React, { useState } from 'react';
import { PublicacionTipoPOA } from '../../types';
import { EditableTable, ColumnDef } from '../common/EditableTable';
import { KPICard } from '../common/KPICard';
import { FileText, Target, Award, TrendingUp, MessageSquare, Check, X, HelpCircle, Sparkles, BookOpen } from 'lucide-react';
import { PlotlyChart } from '../common/PlotlyChart';

interface POAPublicacionesProps {
  items: PublicacionTipoPOA[];
  onChange: (items: PublicacionTipoPOA[]) => void;
  year: number;
}

export const POAPublicaciones: React.FC<POAPublicacionesProps> = ({ items, onChange, year }) => {
  const [selectedRowForNote, setSelectedRowForNote] = useState<PublicacionTipoPOA | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');
  const [showNotesSummary, setShowNotesSummary] = useState(false);

  const totBase = items.reduce((a, b) => a + (Number(b.lineaBase) || 0), 0);
  const totProy = items.reduce((a, b) => a + (Number(b.proyeccionActual) || 0), 0);
  const totRes = items.reduce((a, b) => a + (Number(b.resultadosActual) || 0), 0);
  const totSig = items.reduce((a, b) => a + (Number(b.proyeccionSiguiente) || 0), 0);

  const cumplimientoGlobal = totProy > 0 ? (totRes / totProy) * 100 : 0;
  const brechaGlobal = Math.max(0, totProy - totRes);

  const itemsWithNotesCount = items.filter((i) => (i.observaciones || '').trim().length > 0).length;

  const handleOpenNoteModal = (row: PublicacionTipoPOA) => {
    setSelectedRowForNote(row);
    setTempNoteText(row.observaciones || '');
  };

  const handleSaveNoteModal = () => {
    if (!selectedRowForNote) return;
    const updated = items.map((it) =>
      it.id === selectedRowForNote.id ? { ...it, observaciones: tempNoteText.trim() } : it
    );
    onChange(updated);
    setSelectedRowForNote(null);
  };

  const handleQuickTag = (tag: string) => {
    setTempNoteText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tag;
      if (trimmed.includes(tag)) return trimmed;
      return `${trimmed}. ${tag}`;
    });
  };

  const columns: ColumnDef<PublicacionTipoPOA>[] = [
    {
      key: 'tipo',
      header: 'Tipos de Publicación',
      accessor: (row) => row.tipo,
      type: 'text',
      width: '220px',
      onCellChange: (row, val) => {
        row.tipo = String(val);
      },
    },
    {
      key: 'lineaBase',
      header: `Línea Base (${year - 1})`,
      accessor: (row) => row.lineaBase,
      type: 'number',
      align: 'right',
      sumTotal: true,
      width: '110px',
      onCellChange: (row, val) => {
        row.lineaBase = Number(val) || 0;
      },
    },
    {
      key: 'proyeccionActual',
      header: `Proyección (${year})`,
      accessor: (row) => row.proyeccionActual,
      type: 'number',
      align: 'right',
      sumTotal: true,
      width: '110px',
      onCellChange: (row, val) => {
        row.proyeccionActual = Number(val) || 0;
      },
    },
    {
      key: 'resultadosActual',
      header: `Resultados (${year})`,
      accessor: (row) => row.resultadosActual,
      type: 'number',
      align: 'right',
      sumTotal: true,
      width: '110px',
      onCellChange: (row, val) => {
        row.resultadosActual = Number(val) || 0;
      },
    },
    {
      key: 'proyeccionSiguiente',
      header: `Proyección (${year + 1})`,
      accessor: (row) => row.proyeccionSiguiente,
      type: 'number',
      align: 'right',
      sumTotal: true,
      width: '110px',
      onCellChange: (row, val) => {
        row.proyeccionSiguiente = Number(val) || 0;
      },
    },
    {
      key: 'cumplimiento',
      header: '% Avance',
      accessor: (row) =>
        row.proyeccionActual > 0 ? ((row.resultadosActual / row.proyeccionActual) * 100).toFixed(1) + '%' : 'N/A',
      type: 'readonly',
      align: 'right',
      width: '100px',
      calculate: (row) =>
        row.proyeccionActual > 0 ? ((row.resultadosActual / row.proyeccionActual) * 100).toFixed(1) + '%' : 'N/A',
      format: (val, row) => {
        const pct = row.proyeccionActual > 0 ? (row.resultadosActual / row.proyeccionActual) * 100 : 0;
        return (
          <span
            className={`font-semibold tabular-nums ${
              pct >= 100
                ? 'text-emerald-600 dark:text-emerald-400'
                : pct >= 50
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {val}
          </span>
        );
      },
    },
    {
      key: 'brecha',
      header: 'Brecha',
      accessor: (row) => Math.max(0, row.proyeccionActual - row.resultadosActual),
      type: 'readonly',
      align: 'right',
      width: '100px',
      calculate: (row) => Math.max(0, row.proyeccionActual - row.resultadosActual),
      format: (val) => {
        const b = Number(val) || 0;
        return b === 0 ? (
          <span className="text-emerald-600 font-medium">Meta cumplida</span>
        ) : (
          <span className="text-rose-600 font-medium">-{b}</span>
        );
      },
    },
    {
      key: 'observaciones',
      header: 'Notas / Justificación de Resultados',
      accessor: (row) => row.observaciones || '',
      type: 'text',
      width: '320px',
      onCellChange: (row, val) => {
        row.observaciones = String(val);
      },
      format: (val, row) => {
        const text = (val || '').toString().trim();
        return (
          <div className="flex items-center justify-between gap-2 min-w-[200px] max-w-sm group/note">
            <div
              className="truncate text-[11px] text-slate-700 dark:text-slate-300 font-normal flex-1"
              title={text || 'Haga clic para escribir una nota o descripción'}
            >
              {text ? (
                <span>{text}</span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
                  <span>+ Agregar nota / justificación...</span>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenNoteModal(row);
              }}
              title="Abrir editor completo de notas y justificación para este tipo"
              className={`p-1 rounded-md transition-colors shrink-0 ${
                text
                  ? 'text-[#234a80] dark:text-amber-400 hover:bg-[#234a80]/10 dark:hover:bg-slate-700'
                  : 'text-slate-400 hover:text-[#234a80] dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  const handleAddRow = () => {
    const newItem: PublicacionTipoPOA = {
      id: `pub-${Date.now()}`,
      tipo: 'Nuevo tipo de publicación',
      lineaBase: 0,
      proyeccionActual: 0,
      resultadosActual: 0,
      proyeccionSiguiente: 0,
      observaciones: '',
    };
    onChange([...items, newItem]);
  };

  const handleDeleteRow = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    onChange(updated);
  };

  // Barras agrupadas Plotly con paleta institucional UCA
  const chartGroupedData: Plotly.Data[] = [
    {
      x: items.map((i) => i.tipo),
      y: items.map((i) => i.lineaBase),
      name: `Línea Base (${year - 1})`,
      type: 'bar',
      marker: { color: '#64748b' },
    },
    {
      x: items.map((i) => i.tipo),
      y: items.map((i) => i.proyeccionActual),
      name: `Proyección (${year})`,
      type: 'bar',
      marker: { color: '#234a80' },
    },
    {
      x: items.map((i) => i.resultadosActual),
      y: items.map((i) => i.resultadosActual),
      name: `Resultados (${year})`,
      type: 'bar',
      marker: { color: '#e06d26' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Resultados Observados"
          value={totRes}
          subtitle={`Publicaciones año ${year}`}
          meta={`Meta: ${totProy}`}
          icon={Award}
          progress={{ current: totRes, target: totProy, percent: cumplimientoGlobal }}
        />
        <KPICard
          title="Meta Anual Proyectada"
          value={totProy}
          subtitle={`Planificada para ${year}`}
          meta={`Año base: ${totBase}`}
          icon={Target}
        />
        <KPICard
          title="% Cumplimiento POA"
          value={`${cumplimientoGlobal.toFixed(1)}%`}
          subtitle={cumplimientoGlobal >= 100 ? 'Meta superada' : `Faltan ${brechaGlobal} publicaciones`}
          icon={TrendingUp}
          badge={{
            text: cumplimientoGlobal >= 100 ? 'Cumplido' : 'En seguimiento',
            variant: cumplimientoGlobal >= 100 ? 'success' : 'warning',
          }}
        />
        <KPICard
          title="Proyección Siguiente"
          value={totSig}
          subtitle={`Para el ejercicio ${year + 1}`}
          meta="Crecimiento futuro"
          icon={FileText}
        />
      </div>

      {/* Banner de Ayuda / Instrucción para Justificaciones */}
      <div className="bg-[#234a80]/5 dark:bg-[#234a80]/15 border border-[#234a80]/20 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#234a80]/10 dark:bg-[#234a80]/30 text-[#234a80] dark:text-sky-300 shrink-0">
            <Sparkles className="w-4 h-4 text-[#e06d26]" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Columna de Notas y Justificación de Totales habilitada
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
              Haga clic sobre cualquier celda de la columna <strong className="text-[#234a80] dark:text-sky-300">"Notas / Justificación"</strong> para escribir directamente, o use el icono <MessageSquare className="w-3 h-3 inline text-[#234a80] dark:text-amber-400" /> para abrir el editor extendido con etiquetas rápidas.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNotesSummary(!showNotesSummary)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-[#234a80] dark:text-sky-300 bg-white dark:bg-slate-800 border border-[#234a80]/30 hover:bg-[#234a80]/10 transition-colors shrink-0 shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#e06d26]" />
          <span>{showNotesSummary ? 'Ocultar resumen de notas' : `Ver notas registradas (${itemsWithNotesCount}/${items.length})`}</span>
        </button>
      </div>

      {/* Resumen Expandible de Justificaciones */}
      {showNotesSummary && (
        <div className="bg-white dark:bg-slate-900 border border-[#234a80]/30 dark:border-slate-800 rounded-xl p-4 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#e06d26]" />
                <span>Resumen de Justificaciones y Contexto por Tipo de Publicación</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Explicación de los números y resultados observados durante el periodo {year}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNotesSummary(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {items.map((it) => {
              const hasNote = (it.observaciones || '').trim().length > 0;
              return (
                <div
                  key={it.id}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    hasNote
                      ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                      : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">
                      {it.tipo}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">
                        Meta: <strong>{it.proyeccionActual}</strong>
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <span className="text-[#234a80] dark:text-sky-300 font-semibold">
                        Res: <strong>{it.resultadosActual}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenNoteModal(it)}
                        className="text-xs text-[#e06d26] hover:underline font-medium ml-1"
                      >
                        {hasNote ? 'Editar' : '+ Agregar'}
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic text-[11.5px] leading-relaxed">
                    {hasNote ? it.observaciones : 'Sin justificación registrada todavía.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabla Editable */}
      <EditableTable
        title="1.2 Publicaciones por Tipo en Micelio"
        subtitle="Las columnas de '% Avance' y 'Brecha' son automáticas. Utilice la columna de 'Notas / Justificación' para documentar a qué corresponden los resultados obtenidos."
        columns={columns}
        data={items}
        onDataChange={(newData) => onChange([...newData])}
        canAddRow={true}
        canDeleteRow={true}
        onAddRow={handleAddRow}
        onDeleteRow={handleDeleteRow}
        totalsLabel="Total General de Publicaciones"
      />

      {/* Gráfico Comparativo de Barras Agrupadas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="mb-4">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Comparativo de Publicaciones: Base vs Meta vs Resultado
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comportamiento por tipo de producción científica registrada en Micelio
          </p>
        </div>
        <PlotlyChart
          data={chartGroupedData}
          layout={{
            barmode: 'group',
            margin: { l: 40, r: 20, t: 20, b: 90 },
            xaxis: { tickangle: -30 },
          }}
          className="w-full h-80"
          chartId="poa_publicaciones_barras"
        />
      </div>

      {/* Modal / Diálogo para Edición Extensa de Notas y Justificación */}
      {selectedRowForNote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-scaleIn">
            {/* Header del Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-[#234a80]/5 dark:bg-[#234a80]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#234a80] text-white">
                  <MessageSquare className="w-5 h-5 text-[#e06d26]" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    Notas y Justificación de Resultados
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tipo: <strong className="text-slate-800 dark:text-slate-200">{selectedRowForNote.tipo}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRowForNote(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Métricas contextuales de la fila */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Línea Base:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  {selectedRowForNote.lineaBase}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Meta Proyectada:</span>
                <span className="font-semibold text-[#234a80] dark:text-sky-300 text-sm">
                  {selectedRowForNote.proyeccionActual}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Resultado Observado:</span>
                <span className="font-semibold text-[#e06d26] text-sm">
                  {selectedRowForNote.resultadosActual}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">% Avance:</span>
                <span
                  className={`font-semibold text-sm ${
                    selectedRowForNote.proyeccionActual > 0 &&
                    selectedRowForNote.resultadosActual >= selectedRowForNote.proyeccionActual
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {selectedRowForNote.proyeccionActual > 0
                    ? ((selectedRowForNote.resultadosActual / selectedRowForNote.proyeccionActual) * 100).toFixed(1) + '%'
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Contenido / Textarea */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Descripción o justificación contextual de los resultados obtenidos:
                </label>
                <textarea
                  autoFocus
                  rows={4}
                  value={tempNoteText}
                  onChange={(e) => setTempNoteText(e.target.value)}
                  placeholder="Ej: Los 8 artículos corresponden a publicaciones en revistas indexadas en Scopus y Web of Science derivadas de proyectos cerrados con la VRII..."
                  className="w-full px-3 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#234a80] dark:focus:ring-[#e06d26] text-slate-900 dark:text-white resize-y"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>Explique a qué corresponden los totales o causas de variaciones para auditoría y acreditación.</span>
                  <span>{tempNoteText.length} caracteres</span>
                </div>
              </div>

              {/* Etiquetas Rápidas */}
              <div>
                <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#e06d26]" />
                  <span>Insertar etiqueta rápida:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Revistas indexadas Scopus/WoS',
                    'Curaduría y anonimización de datos',
                    'Proyectos VRII cerrados',
                    'En proceso de arbitraje editorial',
                    'Depósitos retrospectivos',
                    'Sello UCA Editores',
                    'Sin depósitos en el periodo',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTag(tag)}
                      className="px-2 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-[#234a80]/10 hover:text-[#234a80] dark:hover:text-sky-300 text-slate-600 dark:text-slate-400 rounded-md transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedRowForNote(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNoteModal}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#234a80] hover:bg-[#1b3b66] rounded-lg transition-colors cursor-pointer shadow-xs border border-[#234a80]"
              >
                <Check className="w-3.5 h-3.5 text-[#e06d26]" />
                <span>Guardar nota</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
