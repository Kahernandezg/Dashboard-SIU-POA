import React, { useState } from 'react';
import { RecursoElectronicoSIU, MESES_CORTO, MESES_COMPLETO } from '../../../types';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { Database, Plus, Trash2, TrendingUp, Award, Calendar } from 'lucide-react';

interface S23Props {
  recursos: RecursoElectronicoSIU[];
  onChange: (recursos: RecursoElectronicoSIU[]) => void;
  year: number;
}

export const S23_RecursosElectronicos: React.FC<S23Props> = ({ recursos, onChange, year }) => {
  const [topCount, setTopCount] = useState<number>(5);
  const [heatmapPalette, setHeatmapPalette] = useState<'carbon_azul' | 'azul_profundo' | 'grises_acero'>('carbon_azul');
  const [showHeatmapValues, setShowHeatmapValues] = useState<boolean>(true);

  const calculateTotal = (meses: number[]) => meses.reduce((a, b) => a + (Number(b) || 0), 0);

  const grandTotal = recursos.reduce((sum, r) => sum + calculateTotal(r.meses), 0);
  const totalAnterior = recursos.reduce((sum, r) => sum + (Number(r.anterior) || 0), 0);
  const crecimientoGlobal = totalAnterior > 0 ? ((grandTotal - totalAnterior) / totalAnterior) * 100 : 0;

  // Totales por mes
  const monthlyTotals = new Array(12).fill(0);
  recursos.forEach((r) => {
    r.meses.forEach((val, idx) => {
      monthlyTotals[idx] += Number(val) || 0;
    });
  });

  const maxMonthIdx = monthlyTotals.indexOf(Math.max(...monthlyTotals));
  const peakMonth = MESES_COMPLETO[maxMonthIdx];

  // Recurso más consultado
  const sortedByTotal = [...recursos].sort((a, b) => calculateTotal(b.meses) - calculateTotal(a.meses));
  const topRecurso = sortedByTotal[0];

  const handleCellChange = (rowIndex: number, monthIndex: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = [...recursos];
    const newMonths = [...updated[rowIndex].meses];
    newMonths[monthIndex] = num;
    updated[rowIndex] = { ...updated[rowIndex], meses: newMonths };
    onChange(updated);
  };

  const handleNameChange = (rowIndex: number, newName: string) => {
    const updated = [...recursos];
    updated[rowIndex] = { ...updated[rowIndex], recurso: newName };
    onChange(updated);
  };

  const handleAnteriorChange = (rowIndex: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = [...recursos];
    updated[rowIndex] = { ...updated[rowIndex], anterior: num };
    onChange(updated);
  };

  const handleAddRecurso = () => {
    const newRec: RecursoElectronicoSIU = {
      id: `re-${Date.now()}`,
      recurso: `Nuevo Recurso ${recursos.length + 1}`,
      meses: new Array(12).fill(0),
      anterior: 0,
    };
    onChange([...recursos, newRec]);
  };

  const handleDeleteRecurso = (idx: number) => {
    const updated = [...recursos];
    updated.splice(idx, 1);
    onChange(updated);
  };

  // 1. Gráfico de Tendencia Mensual (Barras y Línea con paleta UCA)
  const chartTrendData: Plotly.Data[] = [
    {
      x: [...MESES_CORTO],
      y: monthlyTotals,
      type: 'bar',
      name: `Consultas ${year}`,
      marker: { color: '#234a80' },
    },
    {
      x: [...MESES_CORTO],
      y: monthlyTotals,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Tendencia',
      line: { color: '#e06d26', width: 2.5 },
      marker: { size: 6, color: '#e06d26' },
    },
  ];

  // 2. Mapa de Calor Recurso × Mes (Plotly Heatmap en tonos Negro, Grises y Azules - Cero Blanco)
  const HEATMAP_PALETTES = {
    carbon_azul: {
      label: 'Azul & Carbón',
      colorscale: [
        [0.0, '#090d16'],     // 0: Negro pizarra azulado (cero blanco)
        [0.15, '#1e293b'],    // Gris carbón oscuro
        [0.35, '#11294a'],    // Azul marino noche
        [0.55, '#1e40af'],    // Azul cobalto profundo
        [0.75, '#2563eb'],    // Azul rey intenso
        [0.90, '#38bdf8'],    // Azul cielo brillante
        [1.0, '#7dd3fc'],     // Pico: celeste luminoso
      ],
    },
    azul_profundo: {
      label: 'Azul Noche Profundo',
      colorscale: [
        [0.0, '#020617'],     // Negro obsidiana puro
        [0.18, '#0b192c'],    // Azul noche carbón
        [0.38, '#1e3a5f'],    // Azul acero marino
        [0.60, '#1d4ed8'],    // Azul zafiro
        [0.82, '#3b82f6'],    // Azul brillante
        [1.0, '#93c5fd'],     // Azul hielo luminoso
      ],
    },
    grises_acero: {
      label: 'Grises & Azul Acero',
      colorscale: [
        [0.0, '#111827'],     // Negro grafito
        [0.20, '#1f2937'],    // Gris plomo oscuro
        [0.40, '#374151'],    // Gris acero medio
        [0.60, '#334155'],    // Pizarra azulado
        [0.80, '#1e40af'],    // Azul noche
        [1.0, '#38bdf8'],     // Azul destello
      ],
    },
  };

  const selectedPalette = HEATMAP_PALETTES[heatmapPalette];

  const heatmapData: Plotly.Data[] = [
    {
      z: recursos.map((r) => r.meses),
      x: [...MESES_CORTO],
      y: recursos.map((r) => (r.recurso.length > 25 ? r.recurso.substring(0, 25) + '...' : r.recurso)),
      type: 'heatmap',
      colorscale: selectedPalette.colorscale as any,
      xgap: 2.5,
      ygap: 2.5,
      hoverongaps: false,
      hovertemplate: '<b>%{y}</b><br>Mes: <b>%{x}</b><br>Consultas: <b>%{z:,.0f}</b><extra></extra>',
      text: showHeatmapValues
        ? recursos.map((r) => r.meses.map((v) => (Number(v) > 0 ? Number(v).toLocaleString() : '0')))
        : undefined,
      texttemplate: showHeatmapValues ? '%{text}' : undefined,
      textfont: {
        family: 'JetBrains Mono, monospace',
        size: 9.5,
        color: '#ffffff',
      },
      colorbar: {
        title: { text: 'Consultas', side: 'right', font: { size: 11 } },
        tickfont: { size: 10 },
        thickness: 14,
        len: 0.85,
        outlinewidth: 0,
      },
    },
  ];

  // 3. Top N de Recursos (Plotly Horizontal Bar)
  const topN = sortedByTotal.slice(0, topCount).reverse();
  const chartTopData: Plotly.Data[] = [
    {
      x: topN.map((r) => calculateTotal(r.meses)),
      y: topN.map((r) => (r.recurso.length > 22 ? r.recurso.substring(0, 22) + '...' : r.recurso)),
      type: 'bar',
      orientation: 'h',
      marker: {
        color: topN.map((_, idx) => (idx === topN.length - 1 ? '#e06d26' : '#234a80')),
      },
      text: topN.map((r) => calculateTotal(r.meses).toLocaleString()),
      textposition: 'auto',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Consultas Electrónicas"
          value={grandTotal}
          subtitle={`Consultas registradas en ${year}`}
          meta={`Año base: ${totalAnterior.toLocaleString()}`}
          icon={Database}
          badge={{
            text: `${crecimientoGlobal >= 0 ? '+' : ''}${crecimientoGlobal.toFixed(1)}% vs anterior`,
            variant: crecimientoGlobal >= 0 ? 'success' : 'warning',
          }}
        />
        <KPICard
          title="Recurso Más Utilizado"
          value={topRecurso ? calculateTotal(topRecurso.meses) : 0}
          subtitle={topRecurso?.recurso || 'Sin registros'}
          meta="Líder de descargas"
          icon={Award}
        />
        <KPICard
          title="Mes con Mayor Demanda"
          value={peakMonth}
          subtitle={`${Math.max(...monthlyTotals).toLocaleString()} consultas`}
          meta="Pico de uso académico"
          icon={Calendar}
        />
        <KPICard
          title="Promedio Mensual General"
          value={Math.round(grandTotal / 12)}
          subtitle="Consultas por mes"
          meta="Plataformas suscritas"
          icon={TrendingUp}
        />
      </div>

      {/* Matriz Editable Recurso x 12 Meses */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              2.3 Estadísticas de Uso de Recursos Electrónicos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Matriz editable de consultas por recurso y mes. La lista se hereda anualmente.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddRecurso}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar recurso</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <th className="px-3 py-2.5 whitespace-nowrap">Recurso Electrónico</th>
                {MESES_CORTO.map((m) => (
                  <th key={m} className="px-1.5 py-2.5 text-center w-14">
                    {m}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-bold w-24">Total {year}</th>
                <th className="px-2 py-2.5 text-center w-20">Año Anterior</th>
                <th className="px-2 py-2.5 text-right w-16">Var %</th>
                <th className="px-2 py-2.5 text-center w-10">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recursos.map((r, rIdx) => {
                const rowTot = calculateTotal(r.meses);
                const ant = r.anterior || 0;
                const varPct = ant > 0 ? ((rowTot - ant) / ant) * 100 : 0;

                return (
                  <tr key={r.id || rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-1.5 min-w-[200px]">
                      <input
                        type="text"
                        value={r.recurso}
                        onChange={(e) => handleNameChange(rIdx, e.target.value)}
                        className="w-full py-1 px-2 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-500 rounded font-medium text-slate-800 dark:text-slate-200"
                      />
                    </td>
                    {r.meses.map((val, mIdx) => (
                      <td key={mIdx} className="px-1 py-1 text-center">
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => handleCellChange(rIdx, mIdx, e.target.value)}
                          className="w-12 text-center py-1 px-0.5 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-500 rounded font-mono tabular-nums text-slate-700 dark:text-slate-300 text-xs"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-1.5 text-right font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                      {rowTot.toLocaleString()}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <input
                        type="number"
                        min="0"
                        value={r.anterior || 0}
                        onChange={(e) => handleAnteriorChange(rIdx, e.target.value)}
                        className="w-16 text-center py-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent focus:border-slate-400 rounded font-mono tabular-nums text-slate-500 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums text-[11px]">
                      {ant > 0 ? (
                        <span className={varPct >= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
                          {varPct >= 0 ? '+' : ''}
                          {varPct.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRecurso(rIdx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Eliminar recurso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/90 font-bold border-t-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <td className="px-3 py-2.5">Total Mensual General</td>
                {monthlyTotals.map((tot, idx) => (
                  <td key={idx} className="px-1.5 py-2.5 text-center font-mono tabular-nums text-slate-800 dark:text-slate-200">
                    {tot.toLocaleString()}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-indigo-700 dark:text-indigo-400 text-sm">
                  {grandTotal.toLocaleString()}
                </td>
                <td className="px-2 py-2.5 text-center font-mono tabular-nums text-slate-500">
                  {totalAnterior.toLocaleString()}
                </td>
                <td className="px-2 py-2.5 text-right font-mono tabular-nums text-emerald-600 text-xs">
                  {totalAnterior > 0 ? `${crecimientoGlobal >= 0 ? '+' : ''}${crecimientoGlobal.toFixed(1)}%` : '-'}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Gráficos Interactivos: Tendencia, Top N y Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Tendencia Mensual de Consultas
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Evolución agregada a lo largo de los 12 meses del año {year}
          </p>
          <PlotlyChart
            data={chartTrendData}
            layout={{ margin: { l: 45, r: 20, t: 20, b: 40 } }}
            className="w-full h-72"
            chartId="recursos_tendencia_mensual"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                Top {topCount} Recursos Más Consultados
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Plataformas con mayor impacto en el CRAI</p>
            </div>
            <select
              value={topCount}
              onChange={(e) => setTopCount(Number(e.target.value))}
              className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border rounded"
            >
              <option value={3}>Top 3</option>
              <option value={5}>Top 5</option>
              <option value={8}>Top 8</option>
            </select>
          </div>
          <PlotlyChart
            data={chartTopData}
            layout={{ margin: { l: 140, r: 25, t: 10, b: 40 } }}
            className="w-full h-72"
            chartId="recursos_top_n"
          />
        </div>

        {/* Mapa de Calor: Recurso × Mes */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Mapa de Calor: Intensidad de Consultas por Recurso y Mes
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-sky-400 dark:bg-slate-800 dark:text-sky-300 border border-slate-700">
                  Cuadrícula Oscura (Sin Blanco)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cuadrícula de densidad visual en tonos negros, grises y azules de alto contraste
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="text-[11px] font-medium text-slate-500">Paleta:</span>
                <select
                  value={heatmapPalette}
                  onChange={(e) => setHeatmapPalette(e.target.value as any)}
                  className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <option value="carbon_azul">Azul & Carbón</option>
                  <option value="azul_profundo">Azul Noche Profundo</option>
                  <option value="grises_acero">Grises & Azul Acero</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowHeatmapValues((v) => !v)}
                className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors cursor-pointer ${
                  showHeatmapValues
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
                title="Mostrar u ocultar los valores numéricos sobre cada cuadrícula"
              >
                {showHeatmapValues ? 'Números: ON' : 'Números: OFF'}
              </button>
            </div>
          </div>

          <PlotlyChart
            data={heatmapData}
            layout={{
              margin: { l: 160, r: 35, t: 20, b: 50 },
              plot_bgcolor: '#0a0e17',
              paper_bgcolor: 'transparent',
              yaxis: {
                autorange: 'reversed',
              },
            }}
            className="w-full h-84"
            chartId="recursos_heatmap"
          />
        </div>
      </div>
    </div>
  );
};
