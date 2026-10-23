import React, { useState } from 'react';
import { IndexadoraRegistroSIU, MESES_CORTO } from '../../../types';
import { PlotlyChart } from '../../common/PlotlyChart';
import {
  Hexagon,
  Network,
  Plus,
  Trash2,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderTree,
  LayoutGrid,
  Sparkles,
  Database,
  Radio,
} from 'lucide-react';

interface IndexadorasManagerProps {
  title: string;
  subtitle: string;
  platformName: string; // 'RIUCA' | 'Micelio'
  indexadoras: IndexadoraRegistroSIU[];
  comentarios?: string;
  onChange: (updated: IndexadoraRegistroSIU[], comentarios?: string) => void;
  year: number;
}

const TIPO_COLORS: Record<string, string> = {
  Indexadora: '#2563eb', // Azul rey
  Cosechadora: '#0284c7', // Celeste océano
  Agregador: '#e06d26', // Naranja institucional UCA
  Directorio: '#059669', // Esmeralda
};

export const IndexadorasManager: React.FC<IndexadorasManagerProps> = ({
  title,
  subtitle,
  platformName,
  indexadoras = [],
  comentarios = '',
  onChange,
  year,
}) => {
  const [activeViz, setActiveViz] = useState<'hexbin' | 'treemap' | 'ambos'>('ambos');
  const [generalComments, setGeneralComments] = useState<string>(comentarios || '');
  const [isEditingComments, setIsEditingComments] = useState<boolean>(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Modal para agregar nueva indexadora
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newTipo, setNewTipo] = useState<'Indexadora' | 'Cosechadora' | 'Agregador' | 'Directorio'>('Cosechadora');
  const [newProtocolo, setNewProtocolo] = useState('OAI-PMH');
  const [newMesInclusion, setNewMesInclusion] = useState('Enero');
  const [newEstado, setNewEstado] = useState<'Activo' | 'En proceso' | 'En evaluación'>('Activo');
  const [newComentarios, setNewComentarios] = useState('');
  const [newEnlace, setNewEnlace] = useState('');

  // Estadísticas calculadas
  const calculateRowTotal = (meses: number[]) => (meses || []).reduce((a, b) => a + (Number(b) || 0), 0);
  const grandTotal = indexadoras.reduce((acc, curr) => acc + calculateRowTotal(curr.meses), 0);
  const activeCount = indexadoras.filter((i) => i.estado === 'Activo').length;
  const inProcessCount = indexadoras.filter((i) => i.estado === 'En proceso').length;
  const cosechadorasCount = indexadoras.filter((i) => i.tipo === 'Cosechadora').length;

  // Manejador para actualizar un registro específico
  const handleUpdateRecord = (id: string, updates: Partial<IndexadoraRegistroSIU>) => {
    const updatedList = indexadoras.map((item) => (item.id === id ? { ...item, ...updates } : item));
    onChange(updatedList, generalComments);
  };

  // Manejador para actualizar el valor mensual de una celda
  const handleMonthChange = (id: string, monthIdx: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updatedList = indexadoras.map((item) => {
      if (item.id === id) {
        const newMeses = [...(item.meses || new Array(12).fill(0))];
        newMeses[monthIdx] = num;
        return { ...item, meses: newMeses };
      }
      return item;
    });
    onChange(updatedList, generalComments);
  };

  // Manejador para eliminar un registro
  const handleDeleteRecord = (id: string) => {
    if (confirm('¿Desea eliminar esta plataforma de la lista de cosechadoras e indexadoras?')) {
      const updatedList = indexadoras.filter((item) => item.id !== id);
      onChange(updatedList, generalComments);
      if (selectedRecordId === id) setSelectedRecordId(null);
    }
  };

  // Manejador para agregar una nueva indexadora
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) return;

    const newRecord: IndexadoraRegistroSIU = {
      id: `idx-${Date.now()}`,
      nombre: newNombre.trim(),
      tipo: newTipo,
      protocolo: newProtocolo.trim() || 'OAI-PMH',
      mesInclusion: newMesInclusion,
      estado: newEstado,
      meses: new Array(12).fill(0),
      comentarios: newComentarios.trim(),
      enlace: newEnlace.trim() || undefined,
    };

    const updatedList = [...indexadoras, newRecord];
    onChange(updatedList, generalComments);

    // Reset form
    setNewNombre('');
    setNewTipo('Cosechadora');
    setNewProtocolo('OAI-PMH');
    setNewMesInclusion('Enero');
    setNewEstado('Activo');
    setNewComentarios('');
    setNewEnlace('');
    setIsAddModalOpen(false);
  };

  // Guardar comentarios generales
  const handleSaveGeneralComments = () => {
    setIsEditingComments(false);
    onChange(indexadoras, generalComments);
  };

  // ==========================================
  // 1. Gráfico de Binning Hexagonal (Hexbin 2D)
  // ==========================================
  // En Plotly representamos los datos mensuales y por plataforma en una malla
  // de dispersión binned hexagonal de alta densidad con símbolos de hexágonos
  const hexX: string[] = [];
  const hexY: string[] = [];
  const hexSizes: number[] = [];
  const hexColors: number[] = [];
  const hexHover: string[] = [];
  const hexSymbols: string[] = [];

  const maxVal = Math.max(1, ...indexadoras.flatMap((i) => i.meses || [0]));

  indexadoras.forEach((idxItem) => {
    (idxItem.meses || []).forEach((val, mIdx) => {
      const num = Number(val) || 0;
      hexX.push(MESES_CORTO[mIdx]);
      hexY.push(idxItem.nombre);
      // Tamaño dinámico del hexágono basado en la intensidad
      const scaledSize = num > 0 ? Math.min(38, Math.max(16, (num / maxVal) * 36 + 12)) : 10;
      hexSizes.push(scaledSize);
      hexColors.push(num);
      hexSymbols.push('hexagon');
      hexHover.push(
        `<b>${idxItem.nombre}</b> (${idxItem.tipo})<br>` +
          `Mes: <b>${MESES_CORTO[mIdx]} ${year}</b><br>` +
          `Registros Cosechados: <b>${num.toLocaleString()}</b><br>` +
          `Protocolo: <i>${idxItem.protocolo}</i><extra></extra>`
      );
    });
  });

  const hexbinChartData: Plotly.Data[] = [
    {
      x: hexX,
      y: hexY,
      type: 'scatter',
      mode: 'markers+text',
      marker: {
        symbol: hexSymbols as any,
        size: hexSizes,
        color: hexColors,
        colorscale: [
          [0.0, '#090d16'],
          [0.15, '#1e293b'],
          [0.35, '#11294a'],
          [0.55, '#1e40af'],
          [0.75, '#2563eb'],
          [0.9, '#38bdf8'],
          [1.0, '#7dd3fc'],
        ],
        colorbar: {
          title: { text: 'Cosechas', side: 'right', font: { size: 10, color: '#94a3b8' } },
          tickfont: { size: 9, color: '#94a3b8' },
          thickness: 12,
          len: 0.8,
          outlinewidth: 0,
        },
        line: {
          color: '#38bdf8',
          width: 1,
        },
      },
      text: hexColors.map((v) => (v > 0 ? (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)) : '')),
      textfont: {
        family: 'JetBrains Mono, monospace',
        size: 9,
        color: '#ffffff',
      },
      textposition: 'middle center',
      hovertemplate: '%{hovertext}',
      hovertext: hexHover,
    },
  ];

  // ==========================================
  // 2. Gráfico de Treemap Jerárquico
  // ==========================================
  // Estructura: Root -> Categorías (Indexadora, Cosechadora, Agregador, Directorio) -> Plataformas
  // Regla Plotly con branchvalues: 'total': el valor de cada nodo padre DEBE ser estrictamente
  // igual a la suma de los valores de sus hijos directos.
  const rootId = `root_${platformName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  // 1. Pre-calcular las hojas (plataformas individuales)
  const leafNodes = indexadoras.map((idxItem) => {
    const realTotal = calculateRowTotal(idxItem.meses);
    // Asignar un peso mínimo positivo (1) para garantizar que todas las plataformas registradas
    // mantengan visibilidad y partición geométrica en el Treemap, aun si en el año actual tienen 0 cosechas
    const weight = realTotal > 0 ? realTotal : 1;
    return {
      idxItem,
      realTotal,
      weight,
    };
  });

  // 2. Extraer las categorías únicas
  const categories = Array.from(new Set(indexadoras.map((i) => i.tipo)));

  // 3. Agrupar por categoría y calcular la suma EXACTA de los pesos de sus hojas
  const categoryNodes = categories.map((cat) => {
    const itemsInCat = leafNodes.filter((l) => l.idxItem.tipo === cat);
    // CRÍTICO para branchvalues: 'total': catWeight = sum(leaf.weight)
    const catWeight = itemsInCat.reduce((sum, l) => sum + l.weight, 0);
    const catRealTotal = itemsInCat.reduce((sum, l) => sum + l.realTotal, 0);
    return {
      cat,
      catWeight,
      catRealTotal,
      items: itemsInCat,
    };
  });

  // 4. Calcular el peso del nodo raíz como la suma EXACTA de los pesos de las categorías
  // CRÍTICO para branchvalues: 'total': rootWeight = sum(category.catWeight)
  const rootWeight = categoryNodes.reduce((sum, c) => sum + c.catWeight, 0);
  const rootRealTotal = categoryNodes.reduce((sum, c) => sum + c.catRealTotal, 0);

  const treemapIds: string[] = [rootId];
  const treemapLabels: string[] = [platformName];
  const treemapParents: string[] = [''];
  const treemapValues: number[] = [rootWeight > 0 ? rootWeight : 1];
  const treemapColors: string[] = ['#1e293b']; // Azul oscuro carbón institucional UCA
  const treemapCustomData: [number, string, string][] = [
    [rootRealTotal, `${indexadoras.length} plataformas registradas`, `Repositorio Institucional ${platformName}`],
  ];

  categoryNodes.forEach((catNode) => {
    const catId = `${rootId}_${catNode.cat.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    treemapIds.push(catId);
    treemapLabels.push(catNode.cat);
    treemapParents.push(rootId);
    treemapValues.push(catNode.catWeight);
    treemapColors.push(TIPO_COLORS[catNode.cat] || '#234a80');
    treemapCustomData.push([
      catNode.catRealTotal,
      `${catNode.items.length} plataformas vinculadas`,
      `Categoría: ${catNode.cat}`,
    ]);

    catNode.items.forEach(({ idxItem, realTotal, weight }) => {
      const leafId = `${catId}_${(idxItem.id || idxItem.nombre).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      treemapIds.push(leafId);
      treemapLabels.push(idxItem.nombre);
      treemapParents.push(catId);
      treemapValues.push(weight);
      treemapColors.push(TIPO_COLORS[catNode.cat] || '#3b82f6');
      treemapCustomData.push([
        realTotal,
        `Protocolo: ${idxItem.protocolo || 'N/D'} · Estado: ${idxItem.estado || 'Activo'}`,
        idxItem.mesInclusion ? `Inclusión: ${idxItem.mesInclusion} ${year}` : '',
      ]);
    });
  });

  const treemapChartData: Plotly.Data[] = [
    {
      type: 'treemap',
      ids: treemapIds,
      labels: treemapLabels,
      parents: treemapParents,
      values: treemapValues,
      branchvalues: 'total',
      textinfo: 'label+value',
      texttemplate: '<b>%{label}</b><br>%{customdata[0]:,d} cosechas',
      hovertemplate:
        '<b>%{label}</b><br>' +
        'Total Cosechas / Registros: <b>%{customdata[0]:,d}</b><br>' +
        'Participación en Categoría: %{percentParent:.1%}<br>' +
        'Participación Global: %{percentRoot:.1%}<br>' +
        '<i>%{customdata[1]}</i>' +
        '%{customdata[2]:+<br><i>%{customdata[2]}</i>}<extra></extra>',
      marker: {
        colors: treemapColors,
        showscale: false,
        line: { width: 1.5, color: '#ffffff' },
        pad: { t: 26, l: 4, r: 4, b: 4 },
      },
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-5">
      {/* Cabecera y KPIs del Indicador */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#234a80] text-white">
              <Radio className="w-3 h-3 text-[#e06d26] animate-pulse" />
              <span>Indicador SIU {platformName}</span>
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              Interoperabilidad & Visibilidad Abierta ({year})
            </span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
            <Network className="w-5 h-5 text-[#234a80] dark:text-sky-400" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Resumen de Métricas */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Plataformas</span>
            <span className="text-sm font-mono font-bold text-[#234a80] dark:text-sky-400">
              {indexadoras.length} conectadas
            </span>
          </div>

          <div className="px-3 py-1.5 bg-sky-50 dark:bg-sky-950/40 rounded-lg border border-sky-200 dark:border-sky-800 text-left">
            <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block">Cosechadoras OAI</span>
            <span className="text-sm font-mono font-bold text-sky-700 dark:text-sky-300">
              {cosechadorasCount} activas
            </span>
          </div>

          <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-left">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Cosecha Anual</span>
            <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-300">
              {grandTotal.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#234a80] hover:bg-[#1b3b66] rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#e06d26]" />
            <span>+ Agregar Plataforma</span>
          </button>
        </div>
      </div>

      {/* Selector de Visualización: Hexbin | Treemap | Ambos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#e06d26]" />
            <span>Modo de Visualización Gráfica:</span>
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveViz('hexbin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
              activeViz === 'hexbin'
                ? 'bg-[#234a80] text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Hexagon className="w-3.5 h-3.5 text-[#e06d26]" />
            <span>Binning Hexagonal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViz('treemap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
              activeViz === 'treemap'
                ? 'bg-[#234a80] text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
            <span>Treemap Jerárquico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViz('ambos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
              activeViz === 'ambos'
                ? 'bg-[#234a80] text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
            <span>Vista Combinada</span>
          </button>
        </div>
      </div>

      {/* Panel de Visualizaciones */}
      <div className="space-y-6">
        {/* Gráfico 1: Binning Hexagonal (Hexbin) */}
        {(activeViz === 'hexbin' || activeViz === 'ambos') && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                  <Hexagon className="w-4 h-4 text-[#e06d26]" />
                  <span>Malla de Binning Hexagonal: Intensidad Mensual de Cosecha ({year})</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Densidad visual binned hexagonal por plataforma y mes de Enero a Diciembre
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-700">
                  Paleta Carbón & Azul UCA
                </span>
              </div>
            </div>

            <PlotlyChart
              data={hexbinChartData}
              layout={{
                margin: { l: 200, r: 40, t: 25, b: 50 },
                plot_bgcolor: '#0a0e17',
                paper_bgcolor: 'transparent',
                xaxis: {
                  automargin: true,
                  tickfont: { color: '#94a3b8' },
                  gridcolor: '#1e293b',
                },
                yaxis: {
                  automargin: true,
                  autorange: 'reversed',
                  tickfont: { color: '#e2e8f0', size: 11 },
                  gridcolor: '#1e293b',
                },
              }}
              className="w-full h-88 sm:h-96"
              chartId={`hexbin_${platformName.toLowerCase()}`}
            />
          </div>
        )}

        {/* Gráfico 2: Treemap Jerárquico */}
        {(activeViz === 'treemap' || activeViz === 'ambos') && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Treemap Jerárquico: Distribución por Tipo y Plataforma</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Proporción del volumen cosechado por categoría: Cosechadoras, Agregadores, Indexadoras y Directorios
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                100% Cobertura
              </span>
            </div>

            <PlotlyChart
              data={treemapChartData}
              layout={{
                margin: { l: 10, r: 10, t: 25, b: 15 },
                paper_bgcolor: 'transparent',
              }}
              className="w-full h-96 sm:h-[450px]"
              chartId={`treemap_${platformName.toLowerCase()}`}
            />
          </div>
        )}
      </div>

      {/* Matriz Mensual Editable: Enero a Diciembre */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-[#234a80] dark:text-sky-400" />
              <span>Matriz Mensual de Cosecha & Registros de Indexadoras ({year})</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Haga clic sobre cualquier celda para modificar valores numéricos, protocolos, estados o notas
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#234a80] text-white rounded-lg">
            {indexadoras.length} Plataformas Registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                <th className="px-3 py-2.5 min-w-44">Plataforma / Red</th>
                <th className="px-2 py-2.5 w-24">Tipo</th>
                <th className="px-2 py-2.5 w-24">Protocolo</th>
                <th className="px-2 py-2.5 w-20">Inclusión</th>
                <th className="px-2 py-2.5 w-20">Estado</th>
                {MESES_CORTO.map((m) => (
                  <th key={m} className="px-1 py-2.5 text-center w-12 font-mono">
                    {m}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-bold w-20">Total</th>
                <th className="px-2 py-2.5 text-center w-14">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {indexadoras.map((item) => {
                const rowTot = calculateRowTotal(item.meses);
                const isSelected = selectedRecordId === item.id;
                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''
                      }`}
                    >
                      {/* Nombre y Enlace */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={item.nombre}
                            onChange={(e) => handleUpdateRecord(item.id, { nombre: e.target.value })}
                            className="font-semibold text-slate-900 dark:text-white bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 px-1 py-0.5 rounded border border-transparent focus:border-indigo-500 w-full"
                          />
                          {item.enlace && (
                            <a
                              href={item.enlace}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-sky-600 shrink-0"
                              title="Abrir enlace de la plataforma"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="px-2 py-1">
                        <select
                          value={item.tipo}
                          onChange={(e) => handleUpdateRecord(item.id, { tipo: e.target.value as any })}
                          className="w-full text-[11px] py-1 px-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300"
                        >
                          <option value="Cosechadora">Cosechadora</option>
                          <option value="Indexadora">Indexadora</option>
                          <option value="Agregador">Agregador</option>
                          <option value="Directorio">Directorio</option>
                        </select>
                      </td>

                      {/* Protocolo */}
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={item.protocolo}
                          onChange={(e) => handleUpdateRecord(item.id, { protocolo: e.target.value })}
                          className="w-full text-[11px] py-1 px-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-transparent focus:border-indigo-500 text-slate-600 dark:text-slate-400"
                        />
                      </td>

                      {/* Mes de Inclusión */}
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={item.mesInclusion}
                          onChange={(e) => handleUpdateRecord(item.id, { mesInclusion: e.target.value })}
                          className="w-full text-[11px] py-1 px-1 text-center bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-transparent focus:border-indigo-500 text-slate-600 dark:text-slate-400"
                        />
                      </td>

                      {/* Estado */}
                      <td className="px-2 py-1">
                        <select
                          value={item.estado}
                          onChange={(e) => handleUpdateRecord(item.id, { estado: e.target.value as any })}
                          className={`w-full text-[10px] font-bold py-1 px-1 rounded border cursor-pointer ${
                            item.estado === 'Activo'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : item.estado === 'En proceso'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          <option value="Activo">Activo</option>
                          <option value="En proceso">En proceso</option>
                          <option value="En evaluación">En evaluación</option>
                        </select>
                      </td>

                      {/* 12 Meses */}
                      {(item.meses || []).map((val, mIdx) => (
                        <td key={mIdx} className="px-0.5 py-1 text-center">
                          <input
                            type="number"
                            min="0"
                            value={val}
                            onChange={(e) => handleMonthChange(item.id, mIdx, e.target.value)}
                            className="w-11 text-center py-1 px-0.5 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-500 rounded font-mono tabular-nums text-slate-800 dark:text-slate-200"
                          />
                        </td>
                      ))}

                      {/* Total Fila */}
                      <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                        {rowTot.toLocaleString()}
                      </td>

                      {/* Acciones */}
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedRecordId(isSelected ? null : item.id)}
                            className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                              item.comentarios ? 'text-[#e06d26]' : 'text-slate-400'
                            }`}
                            title="Ver / Editar Comentario de la plataforma"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(item.id)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Fila expandible de comentarios específicos */}
                    {isSelected && (
                      <tr className="bg-sky-50/70 dark:bg-sky-950/30 border-b border-sky-100 dark:border-sky-900">
                        <td colSpan={18} className="p-3">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-sky-200 dark:border-sky-800">
                            <div className="flex-1 space-y-1">
                              <label className="text-[11px] font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-[#e06d26]" />
                                <span>Observaciones y Detalles de Integración: {item.nombre}</span>
                              </label>
                              <textarea
                                value={item.comentarios || ''}
                                onChange={(e) => handleUpdateRecord(item.id, { comentarios: e.target.value })}
                                placeholder="Escriba aquí observaciones técnicas, requerimientos de metadatos, acuerdos o periodicidad de cosecha..."
                                rows={2}
                                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-sky-500"
                              />
                            </div>
                            <div className="space-y-1 sm:w-64 shrink-0">
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                                Enlace / Portal Oficial
                              </label>
                              <input
                                type="text"
                                value={item.enlace || ''}
                                onChange={(e) => handleUpdateRecord(item.id, { enlace: e.target.value })}
                                placeholder="https://..."
                                className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-800/90 font-bold border-t-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <td colSpan={5} className="px-3 py-2.5">
                  Total Mensual Cosechado / Indexado ({platformName})
                </td>
                {MESES_CORTO.map((_, mIdx) => {
                  const mSum = indexadoras.reduce(
                    (acc, row) => acc + (Number((row.meses || [])[mIdx]) || 0),
                    0
                  );
                  return (
                    <td key={mIdx} className="px-1 py-2.5 text-center font-mono tabular-nums text-xs">
                      {mSum.toLocaleString()}
                    </td>
                  );
                })}
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-sm text-[#234a80] dark:text-sky-400">
                  {grandTotal.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Bloque de Comentarios y Bitácora General de la Plataforma */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#e06d26]" />
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Bitácora & Comentarios Generales sobre Indexación en {platformName}
            </h4>
          </div>
          {!isEditingComments ? (
            <button
              type="button"
              onClick={() => setIsEditingComments(true)}
              className="text-xs font-semibold text-[#234a80] dark:text-sky-400 hover:underline cursor-pointer"
            >
              Editar Bitácora
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveGeneralComments}
              className="px-2.5 py-1 text-xs font-semibold text-white bg-[#234a80] hover:bg-[#1b3b66] rounded-md transition-colors cursor-pointer"
            >
              Guardar
            </button>
          )}
        </div>

        {isEditingComments ? (
          <div className="space-y-2">
            <textarea
              value={generalComments}
              onChange={(e) => setGeneralComments(e.target.value)}
              rows={3}
              placeholder={`Escriba aquí el análisis general sobre las cosechadoras y el estado de la indexación institucional en ${platformName}...`}
              className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:border-[#234a80] focus:ring-1 focus:ring-[#234a80]"
            />
          </div>
        ) : (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
            {generalComments || (
              <span className="italic text-slate-400">
                No hay comentarios generales registrados para este periodo. Haga clic en &apos;Editar Bitácora&apos; para agregar observaciones institucionales.
              </span>
            )}
          </p>
        )}
      </div>

      {/* Modal para Agregar Nueva Indexadora */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#e06d26]" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Agregar Nueva Indexadora / Cosechadora a {platformName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de la Plataforma / Agregador *
                </label>
                <input
                  type="text"
                  required
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  placeholder="Ej: OpenAIRE, LA Referencia, BASE, CORE, Google Scholar..."
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Plataforma
                  </label>
                  <select
                    value={newTipo}
                    onChange={(e) => setNewTipo(e.target.value as any)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="Cosechadora">Cosechadora</option>
                    <option value="Indexadora">Indexadora</option>
                    <option value="Agregador">Agregador</option>
                    <option value="Directorio">Directorio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Protocolo / Mecanismo
                  </label>
                  <input
                    type="text"
                    value={newProtocolo}
                    onChange={(e) => setNewProtocolo(e.target.value)}
                    placeholder="Ej: OAI-PMH, REST API..."
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mes de Inclusión
                  </label>
                  <select
                    value={newMesInclusion}
                    onChange={(e) => setNewMesInclusion(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    {[
                      'Enero',
                      'Febrero',
                      'Marzo',
                      'Abril',
                      'Mayo',
                      'Junio',
                      'Julio',
                      'Agosto',
                      'Septiembre',
                      'Octubre',
                      'Noviembre',
                      'Diciembre',
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estado Actual
                  </label>
                  <select
                    value={newEstado}
                    onChange={(e) => setNewEstado(e.target.value as any)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="Activo">Activo</option>
                    <option value="En proceso">En proceso</option>
                    <option value="En evaluación">En evaluación</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Enlace URL Oficial (Opcional)
                </label>
                <input
                  type="url"
                  value={newEnlace}
                  onChange={(e) => setNewEnlace(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observaciones / Comentarios
                </label>
                <textarea
                  value={newComentarios}
                  onChange={(e) => setNewComentarios(e.target.value)}
                  rows={2}
                  placeholder="Notas sobre el estado de la cosecha o periodicidad..."
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#234a80] hover:bg-[#1b3b66] rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Guardar Plataforma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
