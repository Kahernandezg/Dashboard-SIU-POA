import React, { useState } from 'react';
import { PerfilInvestigadorPOA } from '../../types';
import { EditableTable, ColumnDef } from '../common/EditableTable';
import { KPICard } from '../common/KPICard';
import { Eye, Trophy, Users, BarChart3, Network, GitFork } from 'lucide-react';
import { PlotlyChart } from '../common/PlotlyChart';

interface POAPerfilesProps {
  items: PerfilInvestigadorPOA[];
  onChange: (items: PerfilInvestigadorPOA[]) => void;
  year: number;
}

const PALETTE = [
  '#e06d26', // Naranja UCA
  '#2563eb', // Azul rey
  '#059669', // Esmeralda
  '#d97706', // Ámbar
  '#7c3aed', // Púrpura
  '#0284c7', // Celeste
  '#ca8a04', // Dorado
  '#0d9488', // Verde azulado
];

const SANKEY_LINK_COLORS = [
  'rgba(224, 109, 38, 0.45)', // Naranja UCA
  'rgba(37, 99, 235, 0.45)',  // Azul rey
  'rgba(5, 150, 105, 0.45)',  // Esmeralda
  'rgba(217, 119, 6, 0.45)',  // Ámbar
  'rgba(124, 58, 237, 0.45)', // Púrpura
  'rgba(2, 132, 199, 0.45)',  // Celeste
  'rgba(202, 138, 4, 0.45)',  // Dorado
  'rgba(13, 148, 136, 0.45)', // Verde azulado
];

export const POAPerfiles: React.FC<POAPerfilesProps> = ({ items, onChange, year }) => {
  const [chartMode, setChartMode] = useState<'barras' | 'network' | 'sankey'>('barras');

  const totalVistas = items.reduce((sum, item) => sum + (Number(item.visualizaciones) || 0), 0);
  const maxVistas = items.length > 0 ? Math.max(...items.map((i) => i.visualizaciones)) : 0;
  const topInvestigador = items.find((i) => i.visualizaciones === maxVistas);

  const columns: ColumnDef<PerfilInvestigadorPOA>[] = [
    {
      key: 'posicion',
      header: 'Ranking',
      accessor: (row, idx) => `#${idx + 1}`,
      type: 'readonly',
      width: '80px',
      align: 'center',
      format: (val, row) => (
        <span className="font-mono font-bold text-[#234a80] dark:text-[#9bc2f7]">{val}</span>
      ),
    },
    {
      key: 'investigador',
      header: 'Nombre del Investigador / Académico',
      accessor: (row) => row.investigador,
      type: 'text',
      onCellChange: (row, val) => {
        row.investigador = String(val);
      },
    },
    {
      key: 'visualizaciones',
      header: 'Visualizaciones Acumuladas',
      accessor: (row) => row.visualizaciones,
      type: 'number',
      align: 'right',
      sumTotal: true,
      onCellChange: (row, val) => {
        row.visualizaciones = Number(val) || 0;
      },
      format: (val) => <span className="font-bold tabular-nums">{Number(val).toLocaleString()}</span>,
    },
    {
      key: 'participacion',
      header: '% de Consultas',
      accessor: (row) => (totalVistas > 0 ? ((row.visualizaciones / totalVistas) * 100).toFixed(1) + '%' : '0%'),
      type: 'readonly',
      align: 'right',
      calculate: (row) => (totalVistas > 0 ? ((row.visualizaciones / totalVistas) * 100).toFixed(1) + '%' : '0%'),
    },
  ];

  const handleAddRow = () => {
    const newItem: PerfilInvestigadorPOA = {
      id: `per-${Date.now()}`,
      investigador: 'Nuevo Investigador',
      visualizaciones: 0,
    };
    onChange([...items, newItem]);
  };

  const handleDeleteRow = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    onChange(updated);
  };

  // 1. Datos para Barras Horizontales (Ranking)
  const sortedForChart = [...items].sort((a, b) => a.visualizaciones - b.visualizaciones);
  const barChartData: Plotly.Data[] = [
    {
      x: sortedForChart.map((i) => i.visualizaciones),
      y: sortedForChart.map((i) => i.investigador),
      type: 'bar',
      orientation: 'h',
      marker: {
        color: sortedForChart.map((_, idx) => (idx === sortedForChart.length - 1 ? '#e06d26' : '#234a80')),
      },
      text: sortedForChart.map((i) => `${i.visualizaciones} vistas`),
      textposition: 'auto',
      hovertemplate: '<b>%{y}</b><br>Visualizaciones: %{x}<extra></extra>',
    },
  ];

  // 2. Datos para Grafo de Red (Network Analysis)
  // Generar coordenadas orbitales alrededor del nodo central "Micelio CRIS UCA"
  const N = Math.max(items.length, 1);
  const edgeX: (number | null)[] = [];
  const edgeY: (number | null)[] = [];

  const nodeX: number[] = [0]; // Nodo 0: Hub Central Micelio
  const nodeY: number[] = [0];
  const nodeText: string[] = ['Micelio CRIS (UCA)'];
  const nodeHover: string[] = [`<b>Hub Central Micelio</b><br>Total Vistas Red: ${totalVistas.toLocaleString()}`];
  const nodeSizes: number[] = [48];
  const nodeColors: string[] = ['#234a80'];
  const nodeSymbols: string[] = ['diamond'];

  items.forEach((item, idx) => {
    const angle = (2 * Math.PI * idx) / N - Math.PI / 2;
    // Radio orgánico con ligera variación alterna
    const radius = 1.75 + (idx % 2 === 0 ? 0.2 : -0.15);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    // Aristas desde el nodo central hacia cada investigador
    edgeX.push(0, x, null);
    edgeY.push(0, y, null);

    // Aristas inter-investigadores adyacentes para reflejar la red académica
    if (idx > 0) {
      const prevAngle = (2 * Math.PI * (idx - 1)) / N - Math.PI / 2;
      const prevRadius = 1.75 + ((idx - 1) % 2 === 0 ? 0.2 : -0.15);
      const px = prevRadius * Math.cos(prevAngle);
      const py = prevRadius * Math.sin(prevAngle);
      edgeX.push(px, x, null);
      edgeY.push(py, y, null);
    }

    // Nodos de investigadores
    nodeX.push(x);
    nodeY.push(y);
    const partes = item.investigador.split(',');
    const nombreCorto = partes.length > 0 ? partes[0].trim() : item.investigador;
    nodeText.push(nombreCorto);
    nodeHover.push(
      `<b>${item.investigador}</b><br>Visualizaciones: ${item.visualizaciones.toLocaleString()}<br>% Impacto: ${
        totalVistas > 0 ? ((item.visualizaciones / totalVistas) * 100).toFixed(1) : 0
      }%`
    );

    // Tamaño proporcional al volumen de visitas
    const size = Math.round(18 + (item.visualizaciones / (maxVistas || 1)) * 24);
    nodeSizes.push(size);
    nodeColors.push(PALETTE[idx % PALETTE.length]);
    nodeSymbols.push('circle');
  });

  // Cerrar el anillo de la red interconectando el último con el primero
  if (items.length > 2) {
    const lastIdx = items.length - 1;
    const lastAngle = (2 * Math.PI * lastIdx) / N - Math.PI / 2;
    const lastRadius = 1.75 + (lastIdx % 2 === 0 ? 0.2 : -0.15);
    const firstAngle = -Math.PI / 2;
    const firstRadius = 1.75 + (0 % 2 === 0 ? 0.2 : -0.15);
    edgeX.push(lastRadius * Math.cos(lastAngle), firstRadius * Math.cos(firstAngle), null);
    edgeY.push(lastRadius * Math.sin(lastAngle), firstRadius * Math.sin(firstAngle), null);
  }

  const networkChartData: Plotly.Data[] = [
    // Traza de aristas / enlaces
    {
      x: edgeX,
      y: edgeY,
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(148, 163, 184, 0.45)', width: 1.5 },
      hoverinfo: 'none',
      showlegend: false,
    },
    // Traza de nodos de investigadores y hub central
    {
      x: nodeX,
      y: nodeY,
      type: 'scatter',
      mode: 'markers+text',
      text: nodeText,
      textposition: 'top center',
      textfont: {
        family: 'Plus Jakarta Sans, sans-serif',
        size: 10,
        color: '#334155',
      },
      hovertext: nodeHover,
      hoverinfo: 'text',
      marker: {
        size: nodeSizes,
        color: nodeColors,
        symbol: nodeSymbols as any,
        line: { color: '#ffffff', width: 2 },
      },
      showlegend: false,
    },
  ];

  // 3. Datos para Diagrama de Flujo Sankey
  const sankeyNodeLabels = [
    `Plataforma Micelio (${totalVistas.toLocaleString()} vistas)`,
    ...items.map((i) => i.investigador),
  ];

  const sankeyNodeColors = [
    '#234a80', // Hub central institucional
    ...items.map((_, idx) => PALETTE[idx % PALETTE.length]),
  ];

  const sankeyChartData: Plotly.Data[] = [
    {
      type: 'sankey',
      orientation: 'h',
      valueformat: ',d',
      valuesuffix: ' vistas',
      node: {
        pad: 18,
        thickness: 20,
        line: { color: 'rgba(0, 0, 0, 0.15)', width: 1 },
        label: sankeyNodeLabels,
        color: sankeyNodeColors,
        hovertemplate: '<b>%{label}</b><br>Total: %{value:,.0f} vistas<extra></extra>',
      },
      link: {
        source: items.map(() => 0), // Desde nodo origen 0 (Plataforma Micelio)
        target: items.map((_, idx) => idx + 1), // Hacia cada nodo de investigador
        value: items.map((i) => Math.max(1, i.visualizaciones)),
        color: items.map((_, idx) => SANKEY_LINK_COLORS[idx % SANKEY_LINK_COLORS.length]),
        hovertemplate: 'De: <b>%{source.label}</b><br>Hacia: <b>%{target.label}</b><br>Visualizaciones: <b>%{value:,.0f}</b> vistas<extra></extra>',
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Consultas Acumuladas"
          value={totalVistas}
          subtitle={`Visitas a perfiles en ${year}`}
          meta="Plataforma Micelio"
          icon={Eye}
        />
        <KPICard
          title="Perfil Más Consultado"
          value={topInvestigador?.investigador || 'Sin registros'}
          subtitle={`${maxVistas} visualizaciones registradas`}
          icon={Trophy}
          badge={{ text: 'Top 1', variant: 'success' }}
        />
        <KPICard
          title="Investigadores en Ranking"
          value={items.length}
          subtitle="Monitoreo de impacto"
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Tabla Editable */}
        <div>
          <EditableTable
            title="1.6 Ranking de Perfiles Más Vistos"
            subtitle="Permite registrar y ordenar los investigadores de la UCA con mayor impacto de consulta en Micelio."
            columns={columns}
            data={items}
            onDataChange={(newData) => onChange([...newData])}
            canAddRow={true}
            canDeleteRow={true}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
            totalsLabel="Total Visitas Acumuladas"
          />
        </div>

        {/* Tarjeta de Gráfico con Selector de Vista */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                Impacto por Investigador (Visualizaciones)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {chartMode === 'barras' && 'Ranking clásico de barras horizontales por número de vistas'}
                {chartMode === 'network' && 'Análisis de Red: Nodos de investigadores conectados al hub Micelio'}
                {chartMode === 'sankey' && 'Diagrama de Flujo Sankey: Distribución de consultas desde Micelio hacia cada perfil'}
              </p>
            </div>

            {/* Selector de Modos de Vista */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => setChartMode('barras')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  chartMode === 'barras'
                    ? 'bg-white dark:bg-slate-900 text-[#234a80] dark:text-[#9bc2f7] shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Vista clásica de barras horizontales (ranking de vistas)"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Barras</span>
              </button>

              <button
                type="button"
                onClick={() => setChartMode('network')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  chartMode === 'network'
                    ? 'bg-white dark:bg-slate-900 text-[#234a80] dark:text-[#9bc2f7] shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Vista de Grafo de Red (Network Analysis de investigadores conectados a Micelio)"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Grafo de Red</span>
              </button>

              <button
                type="button"
                onClick={() => setChartMode('sankey')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  chartMode === 'sankey'
                    ? 'bg-white dark:bg-slate-900 text-[#234a80] dark:text-[#9bc2f7] shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Vista Diagrama Sankey: Flujo de visualizaciones hacia investigadores"
              >
                <GitFork className="w-3.5 h-3.5 rotate-90" />
                <span>Sankey</span>
              </button>
            </div>
          </div>

          {/* Gráfico Activo según la selección */}
          {chartMode === 'barras' && (
            <PlotlyChart
              data={barChartData}
              layout={{
                margin: { l: 150, r: 30, t: 10, b: 40 },
                xaxis: { title: { text: 'Vistas acumuladas', font: { size: 11 } } },
              }}
              className="w-full h-84"
              chartId="poa_perfiles_barras_horiz"
            />
          )}

          {chartMode === 'network' && (
            <PlotlyChart
              data={networkChartData}
              layout={{
                margin: { l: 20, r: 20, t: 25, b: 25 },
                showlegend: false,
                hovermode: 'closest',
                xaxis: {
                  showgrid: false,
                  zeroline: false,
                  showticklabels: false,
                  range: [-2.6, 2.6],
                },
                yaxis: {
                  showgrid: false,
                  zeroline: false,
                  showticklabels: false,
                  range: [-2.6, 2.6],
                },
              }}
              className="w-full h-84"
              chartId="poa_perfiles_network"
            />
          )}

          {chartMode === 'sankey' && (
            <PlotlyChart
              data={sankeyChartData}
              layout={{
                margin: { l: 20, r: 25, t: 25, b: 25 },
              }}
              className="w-full h-84"
              chartId="poa_perfiles_sankey"
            />
          )}
        </div>
      </div>
    </div>
  );
};
