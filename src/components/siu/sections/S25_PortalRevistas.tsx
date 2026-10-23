import React, { useState } from 'react';
import { PortalRevistasSIU, RevistaFilaMeses, MESES_CORTO } from '../../../types';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { BookMarked, Eye, Layers, TrendingUp, BarChart3, History, LineChart, Flame } from 'lucide-react';

interface S25Props {
  data: PortalRevistasSIU;
  onChange: (data: PortalRevistasSIU) => void;
  year: number;
}

const REVISTA_COLORS = [
  '#234a80', // Realidad (Azul marino UCA)
  '#e06d26', // Realidad Empresarial (Naranja institucional)
  '#2563eb', // ECA (Azul rey vibrante)
  '#059669', // Teología (Esmeralda)
  '#d97706', // Investigaciones UCA (Ámbar)
  '#7c3aed', // Proceso (Púrpura)
  '#0284c7', // ILIA (Celeste océano)
];

// Paletas de Mapa de Calor idénticas a la sección 2.3 (Negro, carbón y azules de alto contraste sin fondo blanco)
const HEATMAP_PALETTES = {
  carbon_azul: {
    label: 'Azul & Carbón (2.3)',
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

export const S25_PortalRevistas: React.FC<S25Props> = ({ data, onChange, year }) => {
  const [activeSubTable, setActiveSubTable] = useState<'articulos' | 'numeros' | 'vistas' | 'anterior'>('articulos');
  const [chartFilter, setChartFilter] = useState<'todos' | 'articulos' | 'numeros' | 'vistas' | 'anterior' | 'comparativa'>('todos');
  const [subView3, setSubView3] = useState<'heatmap' | 'lineas' | 'ambos'>('heatmap');
  const [subView4, setSubView4] = useState<'heatmap' | 'lineas' | 'ambos'>('heatmap');
  const [heatmapPalette, setHeatmapPalette] = useState<'carbon_azul' | 'azul_profundo' | 'grises_acero'>('carbon_azul');
  const [showHeatmapValues, setShowHeatmapValues] = useState<boolean>(true);

  const calculateRowTotal = (meses: number[]) => meses.reduce((a, b) => a + (Number(b) || 0), 0);

  const cleanRevistaName = (name: string) => {
    if (name.includes('Realidad:')) return 'Realidad (Cs. Sociales)';
    if (name.includes('Latinoamericana de Teología')) return 'Rev. Latinoamericana Teología';
    if (name.includes('Intersecciones')) return 'Intersecciones (ILIA)';
    return name.length > 32 ? name.substring(0, 30) + '...' : name;
  };

  const formatHeatmapVal = (val: number) => {
    if (!val || val === 0) return '0';
    return val.toLocaleString();
  };

  const totArticulos = data.articulosPublicados.reduce((a, b) => a + calculateRowTotal(b.meses), 0);
  const totNumeros = data.numerosPublicados.reduce((a, b) => a + calculateRowTotal(b.meses), 0);
  const totVistas = data.visibilidadVistas.reduce((a, b) => a + calculateRowTotal(b.meses), 0);
  const totVistasAnt = data.visibilidadAnterior.reduce((a, b) => a + calculateRowTotal(b.meses), 0);
  const varVistas = totVistasAnt > 0 ? ((totVistas - totVistasAnt) / totVistasAnt) * 100 : 0;

  // Manejador de edición de celdas
  const handleCellChange = (
    tableKey: 'articulosPublicados' | 'numerosPublicados' | 'visibilidadVistas' | 'visibilidadAnterior',
    rowIndex: number,
    monthIndex: number,
    val: string
  ) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = { ...data };
    const targetTable = [...updated[tableKey]];
    const newMonths = [...targetTable[rowIndex].meses];
    newMonths[monthIndex] = num;
    targetTable[rowIndex] = { ...targetTable[rowIndex], meses: newMonths };
    updated[tableKey] = targetTable;
    onChange(updated);
  };

  // 1. Gráfico Indicador 1: Artículos Publicados por Revista ({year})
  const chartArticulosData: Plotly.Data[] = data.articulosPublicados.map((rev, idx) => ({
    x: [...MESES_CORTO],
    y: rev.meses,
    name: rev.revista,
    type: 'bar',
    marker: { color: REVISTA_COLORS[idx % REVISTA_COLORS.length] },
    hovertemplate: `<b>${rev.revista}</b><br>Mes: %{x}<br>Artículos: %{y}<extra></extra>`,
  }));

  // 2. Gráfico Indicador 2: Números y Ediciones Publicadas ({year})
  const chartNumerosData: Plotly.Data[] = data.numerosPublicados.map((rev, idx) => ({
    x: [...MESES_CORTO],
    y: rev.meses,
    name: rev.revista,
    type: 'bar',
    marker: { color: REVISTA_COLORS[idx % REVISTA_COLORS.length] },
    hovertemplate: `<b>${rev.revista}</b><br>Mes: %{x}<br>Números: %{y}<extra></extra>`,
  }));

  const selectedPalette = HEATMAP_PALETTES[heatmapPalette];

  // 3. Gráfico Indicador 3: Heatmap (Mapa de Calor) Visibilidad - Año {year} con paleta idéntica a 2.3
  const heatmapVisibilidadActualData: Plotly.Data[] = [
    {
      z: data.visibilidadVistas.map((r) => r.meses),
      x: [...MESES_CORTO],
      y: data.visibilidadVistas.map((r) => cleanRevistaName(r.revista)),
      type: 'heatmap',
      colorscale: selectedPalette.colorscale as any,
      xgap: 2.5,
      ygap: 2.5,
      hoverongaps: false,
      text: showHeatmapValues
        ? data.visibilidadVistas.map((r) => r.meses.map((v) => formatHeatmapVal(Number(v))))
        : undefined,
      texttemplate: showHeatmapValues ? '%{text}' : undefined,
      textfont: {
        family: 'JetBrains Mono, monospace',
        size: 10,
        color: '#ffffff',
      },
      hovertemplate: `<b>%{y}</b><br>Mes: <b>%{x}</b><br>Vistas ${year}: <b>%{z:,.0f}</b><extra></extra>`,
      colorbar: {
        title: { text: `Vistas ${year}`, side: 'right', font: { size: 11, family: 'Plus Jakarta Sans' } },
        tickfont: { family: 'JetBrains Mono', size: 10 },
        thickness: 14,
        len: 0.85,
        outlinewidth: 0,
      },
    },
  ];

  // 3. Gráfico Indicador 3: Líneas de Tendencias Visibilidad - Año {year}
  const chartVisibilidadActualData: Plotly.Data[] = data.visibilidadVistas.map((rev, idx) => ({
    x: [...MESES_CORTO],
    y: rev.meses,
    name: rev.revista,
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: REVISTA_COLORS[idx % REVISTA_COLORS.length], width: 2.5 },
    marker: { size: 6, color: REVISTA_COLORS[idx % REVISTA_COLORS.length] },
    hovertemplate: `<b>${rev.revista} (${year})</b><br>Mes: %{x}<br>Vistas: %{y:,.0f}<extra></extra>`,
  }));

  // 4. Gráfico Indicador 4: Heatmap (Mapa de Calor) Histórico - Año {year - 1} con paleta idéntica a 2.3
  const heatmapVisibilidadAnteriorData: Plotly.Data[] = [
    {
      z: data.visibilidadAnterior.map((r) => r.meses),
      x: [...MESES_CORTO],
      y: data.visibilidadAnterior.map((r) => cleanRevistaName(r.revista)),
      type: 'heatmap',
      colorscale: selectedPalette.colorscale as any,
      xgap: 2.5,
      ygap: 2.5,
      hoverongaps: false,
      text: showHeatmapValues
        ? data.visibilidadAnterior.map((r) => r.meses.map((v) => formatHeatmapVal(Number(v))))
        : undefined,
      texttemplate: showHeatmapValues ? '%{text}' : undefined,
      textfont: {
        family: 'JetBrains Mono, monospace',
        size: 10,
        color: '#ffffff',
      },
      hovertemplate: `<b>%{y}</b><br>Mes: <b>%{x}</b><br>Vistas ${year - 1}: <b>%{z:,.0f}</b><extra></extra>`,
      colorbar: {
        title: { text: `Vistas ${year - 1}`, side: 'right', font: { size: 11, family: 'Plus Jakarta Sans' } },
        tickfont: { family: 'JetBrains Mono', size: 10 },
        thickness: 14,
        len: 0.85,
        outlinewidth: 0,
      },
    },
  ];

  // 4. Gráfico Indicador 4: Líneas de Tendencias Histórica - Año {year - 1}
  const chartVisibilidadAnteriorData: Plotly.Data[] = data.visibilidadAnterior.map((rev, idx) => ({
    x: [...MESES_CORTO],
    y: rev.meses,
    name: rev.revista,
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: REVISTA_COLORS[idx % REVISTA_COLORS.length], width: 2.2, dash: 'solid' },
    marker: { size: 5, color: REVISTA_COLORS[idx % REVISTA_COLORS.length] },
    hovertemplate: `<b>${rev.revista} (${year - 1})</b><br>Mes: %{x}<br>Vistas: %{y:,.0f}<extra></extra>`,
  }));



  // 5. Gráfico Indicador 5: Comparativa Interanual Global de Visibilidad ({year - 1} vs {year})
  const monthlyVistasActual = new Array(12).fill(0);
  const monthlyVistasAnterior = new Array(12).fill(0);

  data.visibilidadVistas.forEach((r) => r.meses.forEach((v, i) => (monthlyVistasActual[i] += Number(v) || 0)));
  data.visibilidadAnterior.forEach((r) => r.meses.forEach((v, i) => (monthlyVistasAnterior[i] += Number(v) || 0)));

  const lineVisibilidadData: Plotly.Data[] = [
    {
      x: [...MESES_CORTO],
      y: monthlyVistasAnterior,
      name: `Visibilidad Total ${year - 1}`,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#94a3b8', width: 2.2, dash: 'dot' },
      marker: { size: 6, color: '#64748b' },
      hovertemplate: `Total ${year - 1}: %{y:,.0f} vistas<extra></extra>`,
    },
    {
      x: [...MESES_CORTO],
      y: monthlyVistasActual,
      name: `Visibilidad Total ${year}`,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#234a80', width: 3 },
      marker: { size: 7, color: '#e06d26' },
      hovertemplate: `Total ${year}: %{y:,.0f} vistas<extra></extra>`,
    },
  ];

  // Helper para renderizar la tabla matricial activa
  const renderMatrix = (
    title: string,
    tableKey: 'articulosPublicados' | 'numerosPublicados' | 'visibilidadVistas' | 'visibilidadAnterior',
    rows: RevistaFilaMeses[]
  ) => {
    const monthlySum = new Array(12).fill(0);
    rows.forEach((r) => r.meses.forEach((v, i) => (monthlySum[i] += Number(v) || 0)));
    const gTot = monthlySum.reduce((a, b) => a + b, 0);

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Haga clic en las celdas numéricas para editar. Totales calculados automáticamente en tiempo real.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <th className="px-3 py-2.5 whitespace-nowrap">Revista OJS / UCA</th>
                {MESES_CORTO.map((m) => (
                  <th key={m} className="px-1.5 py-2.5 text-center w-14">
                    {m}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-bold w-24">TOTAL ANUAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {rows.map((r, rIdx) => {
                const rowTot = calculateRowTotal(r.meses);
                return (
                  <tr key={r.id || rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: REVISTA_COLORS[rIdx % REVISTA_COLORS.length] }}
                      />
                      <span>{r.revista}</span>
                    </td>
                    {r.meses.map((val, mIdx) => (
                      <td key={mIdx} className="px-1 py-1 text-center">
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => handleCellChange(tableKey, rIdx, mIdx, e.target.value)}
                          className="w-12 text-center py-1 px-0.5 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-500 rounded font-mono tabular-nums text-slate-700 dark:text-slate-300"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                      {rowTot.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/90 font-bold border-t-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <td className="px-3 py-2.5">Total General</td>
                {monthlySum.map((tot, idx) => (
                  <td key={idx} className="px-1.5 py-2.5 text-center font-mono tabular-nums text-slate-800 dark:text-slate-200">
                    {tot.toLocaleString()}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                  {gTot.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Artículos Publicados"
          value={totArticulos}
          subtitle={`En las 7 revistas OJS (${year})`}
          meta={`${data.articulosPublicados.length} títulos editoriales activos`}
          icon={BookMarked}
        />
        <KPICard
          title="Números / Ediciones"
          value={totNumeros}
          subtitle={`Fascículos completados (${year})`}
          meta="Acceso abierto OJS"
          icon={Layers}
        />
        <KPICard
          title={`Visibilidad Global (${year})`}
          value={totVistas}
          subtitle={`Vistas acumuladas en ${year}`}
          meta={`Año base: ${totVistasAnt.toLocaleString()}`}
          icon={Eye}
          badge={{
            text: `${varVistas >= 0 ? '+' : ''}${varVistas.toFixed(1)}% vs anterior`,
            variant: varVistas >= 0 ? 'success' : 'warning',
          }}
        />
        <KPICard
          title={`Visibilidad Base (${year - 1})`}
          value={totVistasAnt}
          subtitle="Total de vistas periodo anterior"
          meta="Referencia interanual"
          icon={History}
        />
      </div>

      {/* Selector de Sub-Tablas OJS */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTable('articulos')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-center whitespace-nowrap cursor-pointer ${
            activeSubTable === 'articulos'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          1. Artículos Publicados
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTable('numeros')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-center whitespace-nowrap cursor-pointer ${
            activeSubTable === 'numeros'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          2. Números / Ediciones
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTable('vistas')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-center whitespace-nowrap cursor-pointer ${
            activeSubTable === 'vistas'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          3. Visibilidad {year}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTable('anterior')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-center whitespace-nowrap cursor-pointer ${
            activeSubTable === 'anterior'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          4. Visibilidad {year - 1}
        </button>
      </div>

      {/* Tabla Matricial Activa */}
      {activeSubTable === 'articulos' &&
        renderMatrix('Tabla 1. Artículos Publicados en el Portal de Revistas OJS/UCA', 'articulosPublicados', data.articulosPublicados)}
      {activeSubTable === 'numeros' &&
        renderMatrix('Tabla 2. Números / Ediciones Publicadas en el Portal OJS/UCA', 'numerosPublicados', data.numerosPublicados)}
      {activeSubTable === 'vistas' &&
        renderMatrix(`Tabla 3. Visibilidad (Vistas) en el Portal OJS/UCA - ${year}`, 'visibilidadVistas', data.visibilidadVistas)}
      {activeSubTable === 'anterior' &&
        renderMatrix(`Tabla 4. Visibilidad (Vistas) en el Portal OJS/UCA - ${year - 1}`, 'visibilidadAnterior', data.visibilidadAnterior)}

      {/* ========================================================= */}
      {/* SECCIÓN DE GRÁFICOS: UN GRÁFICO POR CADA INDICADOR        */}
      {/* ========================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#234a80] dark:text-[#9bc2f7]" />
              <span>Análisis Gráfico de Indicadores de Revistas OJS</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualizaciones interactivas dedicadas para cada uno de los 4 indicadores editoriales más la comparativa global
            </p>
          </div>

          {/* Barra de Filtros de Gráficos */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => setChartFilter('todos')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                chartFilter === 'todos'
                  ? 'bg-[#234a80] text-white font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              Todos (5 Gráficos)
            </button>
            <button
              type="button"
              onClick={() => setChartFilter('articulos')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                chartFilter === 'articulos'
                  ? 'bg-[#234a80] text-white font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              1. Artículos
            </button>
            <button
              type="button"
              onClick={() => setChartFilter('numeros')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                chartFilter === 'numeros'
                  ? 'bg-[#234a80] text-white font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              2. Números
            </button>
            <button
              type="button"
              onClick={() => setChartFilter('vistas')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                chartFilter === 'vistas'
                  ? 'bg-[#234a80] text-white font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              3. Vistas {year}
            </button>
            <button
              type="button"
              onClick={() => setChartFilter('anterior')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                chartFilter === 'anterior'
                  ? 'bg-[#234a80] text-white font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              4. Vistas {year - 1}
            </button>
            <button
              type="button"
              onClick={() => setChartFilter('comparativa')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                chartFilter === 'comparativa'
                  ? 'bg-[#234a80] text-white font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              5. Comparativa
            </button>
          </div>
        </div>

        {/* Cuadrícula de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico 1: Artículos Publicados por Revista ({year}) */}
          {(chartFilter === 'todos' || chartFilter === 'articulos') && (
            <div
              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all ${
                chartFilter === 'articulos' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-0.5">
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>Indicador 1</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    Artículos Publicados por Revista ({year})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Distribución mensual acumulada de artículos académicos por título editorial
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800 shrink-0">
                  Total: {totArticulos}
                </span>
              </div>
              <PlotlyChart
                data={chartArticulosData}
                layout={{
                  barmode: 'stack',
                  margin: { l: 40, r: 20, t: 15, b: 50 },
                  legend: { orientation: 'h', y: -0.25 },
                }}
                className={`w-full ${chartFilter === 'articulos' ? 'h-84' : 'h-72'}`}
                chartId="revistas_articulos_stack"
              />
            </div>
          )}

          {/* Gráfico 2: Números y Ediciones Publicadas ({year}) */}
          {(chartFilter === 'todos' || chartFilter === 'numeros') && (
            <div
              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all ${
                chartFilter === 'numeros' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Indicador 2</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    Números y Ediciones Publicadas ({year})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Frecuencia de lanzamientos y fascículos completados por revista
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
                  Total: {totNumeros} fascículos
                </span>
              </div>
              <PlotlyChart
                data={chartNumerosData}
                layout={{
                  barmode: 'stack',
                  margin: { l: 40, r: 20, t: 15, b: 50 },
                  legend: { orientation: 'h', y: -0.25 },
                }}
                className={`w-full ${chartFilter === 'numeros' ? 'h-84' : 'h-72'}`}
                chartId="revistas_numeros_stack"
              />
            </div>
          )}

          {/* Gráfico 3: Visibilidad (Vistas) en el Portal OJS - Año {year} */}
          {(chartFilter === 'todos' || chartFilter === 'vistas') && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Indicador 3</span>
                    </div>
                    <span className="text-slate-400">·</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-sky-400 dark:bg-slate-800 dark:text-sky-300 border border-slate-700">
                      <Flame className="w-3 h-3 mr-1 text-[#e06d26]" />
                      {subView3 === 'heatmap' ? 'Mapa de Calor (2.3)' : subView3 === 'lineas' ? 'Líneas de Tendencia' : 'Vista Combinada'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                    Visibilidad por Revista en {year}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {subView3 === 'heatmap'
                      ? 'Mapa de calor de intensidad mensual de consultas con paleta idéntica a 2.3 (Carbón y Azul de alto contraste)'
                      : subView3 === 'lineas'
                      ? 'Evolución mensual y curvas de consulta en línea por revista'
                      : 'Mapa de calor matricial en primer lugar seguido por las líneas de tendencia mensual'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 rounded-lg border border-sky-200 dark:border-sky-800">
                    Total: {totVistas.toLocaleString()}
                  </span>

                  {/* Selector de paleta de calor */}
                  {(subView3 === 'heatmap' || subView3 === 'ambos') && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] font-medium text-slate-500">Paleta:</span>
                      <select
                        value={heatmapPalette}
                        onChange={(e) => setHeatmapPalette(e.target.value as any)}
                        className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                      >
                        <option value="carbon_azul">Azul & Carbón (2.3)</option>
                        <option value="azul_profundo">Azul Noche Profundo</option>
                        <option value="grises_acero">Grises & Azul Acero</option>
                      </select>
                    </div>
                  )}

                  {/* Toggle mostrar/ocultar números */}
                  {(subView3 === 'heatmap' || subView3 === 'ambos') && (
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
                  )}

                  {/* Selector de visualización: Mapa de calor en primer lugar, Líneas o Ambos */}
                  <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setSubView3('heatmap')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        subView3 === 'heatmap'
                          ? 'bg-white dark:bg-slate-900 text-[#e06d26] font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Ver mapa de calor en primer lugar"
                    >
                      <Flame className="w-3.5 h-3.5 text-[#e06d26]" />
                      <span>Heatmap</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubView3('lineas')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        subView3 === 'lineas'
                          ? 'bg-white dark:bg-slate-900 text-[#234a80] dark:text-[#9bc2f7] font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Ver líneas de tendencia"
                    >
                      <LineChart className="w-3.5 h-3.5 text-[#234a80] dark:text-[#9bc2f7]" />
                      <span>Líneas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubView3('ambos')}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        subView3 === 'ambos'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Ver ambos: Heatmap primero y luego líneas"
                    >
                      <span>Ambos</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Renderizado de Indicador 3: Heatmap en primer lugar */}
              {(subView3 === 'heatmap' || subView3 === 'ambos') && (
                <div className="space-y-1">
                  {subView3 === 'ambos' && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                      <Flame className="w-3.5 h-3.5 text-[#e06d26]" />
                      <span>1. Mapa de Calor Matricial ({year})</span>
                    </div>
                  )}
                  <PlotlyChart
                    data={heatmapVisibilidadActualData}
                    layout={{
                      margin: { l: 190, r: 35, t: 20, b: 45 },
                      plot_bgcolor: '#0a0e17',
                      paper_bgcolor: 'transparent',
                      yaxis: {
                        autorange: 'reversed',
                        automargin: true,
                      },
                      xaxis: {
                        automargin: true,
                      },
                    }}
                    className="w-full h-88 sm:h-96"
                    chartId="revistas_heatmap_actual"
                  />
                </div>
              )}

              {/* Renderizado de Indicador 3: Líneas de Tendencias */}
              {(subView3 === 'lineas' || subView3 === 'ambos') && (
                <div className={subView3 === 'ambos' ? 'pt-5 mt-4 border-t border-slate-200 dark:border-slate-800' : ''}>
                  {subView3 === 'ambos' && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                      <LineChart className="w-3.5 h-3.5 text-[#234a80] dark:text-[#9bc2f7]" />
                      <span>2. Líneas de Tendencia Mensual ({year})</span>
                    </div>
                  )}
                  <PlotlyChart
                    data={chartVisibilidadActualData}
                    layout={{
                      margin: { l: 60, r: 25, t: 20, b: 50 },
                      legend: { orientation: 'h', y: -0.25 },
                    }}
                    className="w-full h-84"
                    chartId="revistas_vistas_actual"
                  />
                </div>
              )}
            </div>
          )}

          {/* Gráfico 4: Visibilidad (Vistas) Histórica - Año {year - 1} */}
          {(chartFilter === 'todos' || chartFilter === 'anterior') && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <History className="w-3.5 h-3.5" />
                      <span>Indicador 4 (Periodo Base)</span>
                    </div>
                    <span className="text-slate-400">·</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-sky-400 dark:bg-slate-800 dark:text-sky-300 border border-slate-700">
                      <Flame className="w-3 h-3 mr-1 text-[#e06d26]" />
                      {subView4 === 'heatmap' ? 'Mapa de Calor (2.3)' : subView4 === 'lineas' ? 'Líneas de Tendencia' : 'Vista Combinada'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                    Visibilidad por Revista en {year - 1}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {subView4 === 'heatmap'
                      ? `Mapa de calor histórico de consultas del periodo base (${year - 1}) con paleta 2.3`
                      : subView4 === 'lineas'
                      ? `Registro mensual de visualizaciones del periodo histórico anterior (${year - 1})`
                      : `Mapa de calor histórico en primer lugar y líneas de tendencia (${year - 1})`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700">
                    Base: {totVistasAnt.toLocaleString()}
                  </span>

                  {/* Selector de paleta de calor */}
                  {(subView4 === 'heatmap' || subView4 === 'ambos') && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] font-medium text-slate-500">Paleta:</span>
                      <select
                        value={heatmapPalette}
                        onChange={(e) => setHeatmapPalette(e.target.value as any)}
                        className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                      >
                        <option value="carbon_azul">Azul & Carbón (2.3)</option>
                        <option value="azul_profundo">Azul Noche Profundo</option>
                        <option value="grises_acero">Grises & Azul Acero</option>
                      </select>
                    </div>
                  )}

                  {/* Toggle mostrar/ocultar números */}
                  {(subView4 === 'heatmap' || subView4 === 'ambos') && (
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
                  )}

                  {/* Selector de visualización: Mapa de calor en primer lugar, Líneas o Ambos */}
                  <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setSubView4('heatmap')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        subView4 === 'heatmap'
                          ? 'bg-white dark:bg-slate-900 text-[#e06d26] font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Ver mapa de calor en primer lugar"
                    >
                      <Flame className="w-3.5 h-3.5 text-[#e06d26]" />
                      <span>Heatmap</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubView4('lineas')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        subView4 === 'lineas'
                          ? 'bg-white dark:bg-slate-900 text-[#234a80] dark:text-[#9bc2f7] font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Ver líneas de tendencia"
                    >
                      <LineChart className="w-3.5 h-3.5 text-[#234a80] dark:text-[#9bc2f7]" />
                      <span>Líneas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubView4('ambos')}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        subView4 === 'ambos'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Ver ambos: Heatmap primero y luego líneas"
                    >
                      <span>Ambos</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Renderizado de Indicador 4: Heatmap en primer lugar */}
              {(subView4 === 'heatmap' || subView4 === 'ambos') && (
                <div className="space-y-1">
                  {subView4 === 'ambos' && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                      <Flame className="w-3.5 h-3.5 text-[#e06d26]" />
                      <span>1. Mapa de Calor Matricial Histórico ({year - 1})</span>
                    </div>
                  )}
                  <PlotlyChart
                    data={heatmapVisibilidadAnteriorData}
                    layout={{
                      margin: { l: 190, r: 35, t: 20, b: 45 },
                      plot_bgcolor: '#0a0e17',
                      paper_bgcolor: 'transparent',
                      yaxis: {
                        autorange: 'reversed',
                        automargin: true,
                      },
                      xaxis: {
                        automargin: true,
                      },
                    }}
                    className="w-full h-88 sm:h-96"
                    chartId="revistas_heatmap_anterior"
                  />
                </div>
              )}

              {/* Renderizado de Indicador 4: Líneas de Tendencias */}
              {(subView4 === 'lineas' || subView4 === 'ambos') && (
                <div className={subView4 === 'ambos' ? 'pt-5 mt-4 border-t border-slate-200 dark:border-slate-800' : ''}>
                  {subView4 === 'ambos' && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                      <LineChart className="w-3.5 h-3.5 text-[#234a80] dark:text-[#9bc2f7]" />
                      <span>2. Líneas de Tendencia Mensual ({year - 1})</span>
                    </div>
                  )}
                  <PlotlyChart
                    data={chartVisibilidadAnteriorData}
                    layout={{
                      margin: { l: 60, r: 25, t: 20, b: 50 },
                      legend: { orientation: 'h', y: -0.25 },
                    }}
                    className="w-full h-84"
                    chartId="revistas_vistas_anterior"
                  />
                </div>
              )}
            </div>
          )}


          {/* Gráfico 5: Comparativa Interanual Global ({year - 1} vs {year}) */}
          {(chartFilter === 'todos' || chartFilter === 'comparativa') && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Indicador 5 (Consolidado)</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    Comparativa Interanual Global de Visibilidad ({year - 1} vs {year})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Trayectoria mensual agregada del portal OJS: crecimiento del {varVistas >= 0 ? '+' : ''}
                    {varVistas.toFixed(1)}% interanual
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {year - 1}: {totVistasAnt.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#234a80] text-white rounded shadow-2xs">
                    {year}: {totVistas.toLocaleString()}
                  </span>
                </div>
              </div>
              <PlotlyChart
                data={lineVisibilidadData}
                layout={{
                  margin: { l: 55, r: 20, t: 20, b: 45 },
                  legend: { orientation: 'h', y: -0.2 },
                }}
                className="w-full h-80"
                chartId="revistas_visibilidad_lineas"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
