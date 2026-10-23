import React, { useState } from 'react';
import { MicelioRepositorioSIU, POAData, IndexadoraRegistroSIU, MESES_CORTO } from '../../../types';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { Globe, RefreshCw, BarChart2, Eye, MapPin, DownloadCloud, Network } from 'lucide-react';
import { IndexadorasManager } from '../common/IndexadorasManager';

const DEFAULT_MICELIO_INDEXADORAS: IndexadoraRegistroSIU[] = [
  {
    id: 'idx-m-1',
    nombre: 'DataCite',
    tipo: 'Indexadora',
    mesInclusion: 'Enero',
    protocolo: 'REST API (DataCite 4.4)',
    estado: 'Activo',
    meses: [12, 18, 24, 20, 28, 35, 16, 26, 38, 34, 22, 14],
    comentarios: 'Asignación oficial de DOIs institucionales para conjuntos de datos (datasets) y software de investigación.',
    enlace: 'https://datacite.org',
  },
  {
    id: 'idx-m-2',
    nombre: 're3data (Registry of Research Data)',
    tipo: 'Directorio',
    mesInclusion: 'Enero',
    protocolo: 'Certificación OAI',
    estado: 'Activo',
    meses: [10, 15, 20, 18, 25, 30, 14, 22, 32, 28, 19, 12],
    comentarios: 'Registro internacional de repositorios de datos indexado con identificador global y metadata estándar.',
    enlace: 'https://www.re3data.org',
  },
  {
    id: 'idx-m-3',
    nombre: 'LA Referencia - Datos de Investigación',
    tipo: 'Cosechadora',
    mesInclusion: 'Febrero',
    protocolo: 'OAI-PMH (DataCite Schema)',
    estado: 'Activo',
    meses: [0, 16, 22, 19, 26, 32, 15, 24, 35, 30, 20, 13],
    comentarios: 'Cosecha regional de datasets científicos latinoamericanos vinculados al nodo nacional.',
    enlace: 'https://www.lareferencia.info',
  },
  {
    id: 'idx-m-4',
    nombre: 'OpenAIRE Research Graph',
    tipo: 'Cosechadora',
    mesInclusion: 'Marzo',
    protocolo: 'OAI-PMH / REST API',
    estado: 'Activo',
    meses: [0, 0, 20, 17, 24, 29, 13, 21, 31, 27, 18, 11],
    comentarios: 'Interconexión de conjuntos de datos con publicaciones y proyectos de investigación VRII UCA.',
    enlace: 'https://graph.openaire.eu',
  },
  {
    id: 'idx-m-5',
    nombre: 'Google Dataset Search',
    tipo: 'Indexadora',
    mesInclusion: 'Enero',
    protocolo: 'Schema.org (Dataset JSON-LD)',
    estado: 'Activo',
    meses: [12, 17, 23, 19, 27, 34, 15, 25, 36, 32, 21, 13],
    comentarios: 'Indexación directa a través de metadatos embebidos Schema.org estructurados en cada registro de Micelio.',
    enlace: 'https://datasetsearch.research.google.com',
  },
  {
    id: 'idx-m-6',
    nombre: 'Dataverse Global Network',
    tipo: 'Agregador',
    mesInclusion: 'Abril',
    protocolo: 'OAI-PMH Dataverse',
    estado: 'Activo',
    meses: [0, 0, 0, 18, 25, 31, 14, 23, 33, 29, 19, 12],
    comentarios: 'Federación internacional de repositorios de datos abiertos de investigación.',
    enlace: 'https://dataverse.org',
  },
  {
    id: 'idx-m-7',
    nombre: 'Mendeley Data',
    tipo: 'Agregador',
    mesInclusion: 'Mayo',
    protocolo: 'REST API',
    estado: 'En proceso',
    meses: [0, 0, 0, 0, 15, 20, 9, 16, 22, 19, 13, 8],
    comentarios: 'Cosechador de datasets indexados con enlace al DOI emitido por DataCite.',
    enlace: 'https://data.mendeley.com',
  },
];

interface S27Props {
  data: MicelioRepositorioSIU;
  poaData: POAData;
  onChange: (data: MicelioRepositorioSIU) => void;
  onSyncWithPOA: () => void;
  year: number;
}

export const S27_Micelio: React.FC<S27Props> = ({ data, poaData, onChange, onSyncWithPOA, year }) => {
  const [activeTab, setActiveTab] = useState<'publicaciones' | 'proyectos' | 'regiones' | 'paises' | 'ciudades' | 'indexadoras'>('publicaciones');

  const calculateRowTotal = (meses: number[]) => meses.reduce((a, b) => a + (Number(b) || 0), 0);

  const totPublicaciones = data.publicacionesMes.reduce((a, b) => a + calculateRowTotal(b.meses), 0);
  const totProyectos = data.proyectosMes.reduce((a, b) => a + calculateRowTotal(b.meses), 0);
  const totVistasRegiones = data.vistasRegion.reduce((a, b) => a + (Number(b.vistas) || 0), 0);
  const totPaisesMicelio = data.paisesMicelio.reduce((a, b) => a + (Number(b.vistas) || 0), 0);

  // Manejo de cambios en celdas de publicaciones
  const handlePubCellChange = (rowIndex: number, monthIndex: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = { ...data };
    const list = [...updated.publicacionesMes];
    const newMonths = [...list[rowIndex].meses];
    newMonths[monthIndex] = num;
    list[rowIndex] = { ...list[rowIndex], meses: newMonths };
    updated.publicacionesMes = list;
    onChange(updated);
  };

  // Manejo de cambios en proyectos
  const handleProjCellChange = (rowIndex: number, monthIndex: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = { ...data };
    const list = [...updated.proyectosMes];
    const newMonths = [...list[rowIndex].meses];
    newMonths[monthIndex] = num;
    list[rowIndex] = { ...list[rowIndex], meses: newMonths };
    updated.proyectosMes = list;
    onChange(updated);
  };

  // Manejo de cambios en regiones
  const handleRegionChange = (rowIndex: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = { ...data };
    const list = [...updated.vistasRegion];
    list[rowIndex] = { ...list[rowIndex], vistas: num };
    updated.vistasRegion = list;
    onChange(updated);
  };

  // Manejo de cambios en indexadoras y cosechadoras
  const handleIndexadorasChange = (updatedList: IndexadoraRegistroSIU[], comentarios?: string) => {
    onChange({
      ...data,
      indexadoras: updatedList,
      comentariosIndexadoras: comentarios !== undefined ? comentarios : data.comentariosIndexadoras,
    });
  };

  // 1. Gráfico de Barras por Región con paleta UCA
  const chartRegionData: Plotly.Data[] = [
    {
      x: data.vistasRegion.map((r) => r.region),
      y: data.vistasRegion.map((r) => r.vistas),
      type: 'bar',
      marker: { color: ['#234a80', '#e06d26', '#2563eb', '#059669', '#d97706', '#64748b'] },
      text: data.vistasRegion.map((r) => r.vistas.toLocaleString()),
      textposition: 'auto',
    },
  ];

  // 2. Mapa Coroplético Mundial (Choropleth Map Plotly)
  const choroplethData: Plotly.Data[] = [
    {
      type: 'choropleth',
      locationmode: 'country names',
      locations: data.paisesMicelio.map((p) => p.pais),
      z: data.paisesMicelio.map((p) => p.vistas),
      text: data.paisesMicelio.map((p) => `${p.pais}: ${p.vistas.toLocaleString()} visitas`),
      colorscale: 'Blues',
      autocolorscale: false,
      reversescale: false,
      marker: {
        line: {
          color: 'rgb(180,180,180)',
          width: 0.5,
        },
      },
      colorbar: {
        title: { text: 'Visitas', side: 'right' },
      },
    },
  ];

  // 3. Gráfico Comparativo de Vistas Mensuales (Año Anterior vs Actual)
  const lineVisitasCompData: Plotly.Data[] = [
    {
      x: [...MESES_CORTO],
      y: data.visitasMesComparativo.anioAnterior,
      name: `Visitas ${year - 1}`,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#64748b', width: 2, dash: 'dot' },
      marker: { size: 5, color: '#64748b' },
    },
    {
      x: [...MESES_CORTO],
      y: data.visitasMesComparativo.anioActual,
      name: `Visitas ${year}`,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#234a80', width: 3 },
      marker: { size: 6, color: '#e06d26' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Barra de Sincronización POA <-> SIU */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-[#234a80] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#234a80] text-white rounded-lg shrink-0">
            <RefreshCw className="w-4 h-4 text-[#e06d26]" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Sincronización Bidireccional POA Micelio ↔ SIU 2.7
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Conecta los datos de producción y depósitos con el módulo POA para evitar recapturas manuales.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSyncWithPOA}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#234a80] hover:bg-[#1b3b66] rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs cursor-pointer border border-[#234a80]"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#e06d26]" />
          <span>Sincronizar datos con POA</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Publicaciones Micelio"
          value={totPublicaciones}
          subtitle={`Producción registrada (${year})`}
          meta={`${data.publicacionesMes.length} tipologías`}
          icon={BarChart2}
        />
        <KPICard
          title="Proyectos de Investigación"
          value={totProyectos}
          subtitle="Proyectos y convocatorias activas"
          meta="Seguimiento VRII UCA"
          icon={Eye}
        />
        <KPICard
          title="Total Vistas Internacionales"
          value={totVistasRegiones}
          subtitle="Consultas por continente"
          meta="América del Norte y Europa"
          icon={Globe}
        />
        <KPICard
          title="Países con Acceso"
          value={data.paisesMicelio.length + data.paisesAnalytics.length}
          subtitle="Alcance global de Micelio"
          meta="Micelio & Google Analytics"
          icon={MapPin}
        />
        <div onClick={() => setActiveTab('indexadoras')} className="cursor-pointer transition-transform hover:scale-[1.01]" title="Haga clic para ver el módulo de Indexadoras, Hexbin y Treemap">
          <KPICard
            title="Indexadoras & Redes"
            value={(data.indexadoras || DEFAULT_MICELIO_INDEXADORAS).length}
            subtitle="Cosechadoras y agregadores (Ver Treemap)"
            meta="DataCite, OpenAIRE, re3data..."
            icon={Network}
          />
        </div>
      </div>

      {/* Selector de Sub-pestañas de Micelio */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto max-w-5xl">
        <button
          type="button"
          onClick={() => setActiveTab('publicaciones')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap text-center cursor-pointer ${
            activeTab === 'publicaciones'
              ? 'bg-white dark:bg-slate-900 text-[#234a80] dark:text-[#9bc2f7] shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          1. Publicaciones × Mes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('proyectos')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap text-center cursor-pointer ${
            activeTab === 'proyectos'
              ? 'bg-white dark:bg-slate-900 text-[#234a80] dark:text-[#9bc2f7] shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          2. Proyectos × Mes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('regiones')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap text-center cursor-pointer ${
            activeTab === 'regiones'
              ? 'bg-white dark:bg-slate-900 text-[#234a80] dark:text-[#9bc2f7] shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          3. Vistas por Región
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paises')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap text-center cursor-pointer ${
            activeTab === 'paises'
              ? 'bg-white dark:bg-slate-900 text-[#234a80] dark:text-[#9bc2f7] shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          4. Países (Micelio / GA)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ciudades')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap text-center cursor-pointer ${
            activeTab === 'ciudades'
              ? 'bg-white dark:bg-slate-900 text-[#234a80] dark:text-[#9bc2f7] shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          5. Ciudades de Consulta
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('indexadoras')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'indexadoras'
              ? 'bg-white dark:bg-slate-900 text-[#234a80] dark:text-[#9bc2f7] shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Network className="w-3.5 h-3.5 text-[#e06d26]" />
          <span>6. Indexadoras & Cosechadoras</span>
        </button>
      </div>

      {/* 1. Publicaciones por Mes */}
      {activeTab === 'publicaciones' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Tabla 1. Estadística General de Publicaciones Depositadas en Micelio ({year})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Total de publicaciones científicas depositadas mensualmente
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  <th className="px-3 py-2.5 whitespace-nowrap">Tipo de Publicación</th>
                  {MESES_CORTO.map((m) => (
                    <th key={m} className="px-1.5 py-2.5 text-center w-14">
                      {m}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-right font-bold w-24">TOTAL ANUAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {data.publicacionesMes.map((p, rIdx) => {
                  const rowTot = calculateRowTotal(p.meses);
                  return (
                    <tr key={p.id || rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                        {p.tipo}
                      </td>
                      {p.meses.map((val, mIdx) => (
                        <td key={mIdx} className="px-1 py-1 text-center">
                          <input
                            type="number"
                            min="0"
                            value={val}
                            onChange={(e) => handlePubCellChange(rIdx, mIdx, e.target.value)}
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
                  <td className="px-3 py-2.5">Total Mensual General</td>
                  {MESES_CORTO.map((_, mIdx) => {
                    const mSum = data.publicacionesMes.reduce((acc, row) => acc + (Number(row.meses[mIdx]) || 0), 0);
                    return (
                      <td key={mIdx} className="px-1.5 py-2.5 text-center font-mono tabular-nums">
                        {mSum.toLocaleString()}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                    {totPublicaciones.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 2. Proyectos por Mes */}
      {activeTab === 'proyectos' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Tabla 2. Estadística General de los Proyectos Depositados en Micelio ({year})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Proyectos de investigación retrospectivos, metas y resultados observados
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  <th className="px-3 py-2.5 whitespace-nowrap">Serie de Proyectos</th>
                  {MESES_CORTO.map((m) => (
                    <th key={m} className="px-1.5 py-2.5 text-center w-14">
                      {m}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-right font-bold w-24">TOTAL ANUAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {data.proyectosMes.map((p, rIdx) => {
                  const rowTot = calculateRowTotal(p.meses);
                  return (
                    <tr key={p.id || rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                        {p.tipo}
                      </td>
                      {p.meses.map((val, mIdx) => (
                        <td key={mIdx} className="px-1 py-1 text-center">
                          <input
                            type="number"
                            min="0"
                            value={val}
                            onChange={(e) => handleProjCellChange(rIdx, mIdx, e.target.value)}
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
            </table>
          </div>
        </div>
      )}

      {/* 3. Vistas por Región */}
      {activeTab === 'regiones' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                Tabla 3. Visibilidad por Región o Continente
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fuente de datos plataforma Micelio</p>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-2.5">Región / Continente</th>
                  <th className="px-4 py-2.5 text-right">Vistas Registradas</th>
                  <th className="px-4 py-2.5 text-right">% Participación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {data.vistasRegion.map((r, idx) => (
                  <tr key={r.id || idx}>
                    <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{r.region}</td>
                    <td className="px-4 py-1 text-right">
                      <input
                        type="number"
                        min="0"
                        value={r.vistas}
                        onChange={(e) => handleRegionChange(idx, e.target.value)}
                        className="w-20 text-right py-1 px-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono tabular-nums font-semibold"
                      />
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums text-slate-500">
                      {totVistasRegiones > 0 ? ((r.vistas / totVistasRegiones) * 100).toFixed(1) + '%' : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-800/90 font-bold border-t-2 text-slate-900 dark:text-white">
                  <td className="px-4 py-2.5">Total Vistas Globales</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                    {totVistasRegiones.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Distribución por Continente</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Gráfico de barras de impacto internacional</p>
            <PlotlyChart
              data={chartRegionData}
              layout={{ margin: { l: 45, r: 20, t: 10, b: 60 }, xaxis: { tickangle: -20 } }}
              className="w-full h-72"
              chartId="micelio_region_barras"
            />
          </div>
        </div>
      )}

      {/* 4. Países (Micelio y GA) + Mapa Coroplético */}
      {activeTab === 'paises' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
              Mapa Coroplético Mundial de Visibilidad Micelio
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Distribución geográfica de consultas internacionales a investigaciones de la UCA
            </p>
            <PlotlyChart
              data={choroplethData}
              layout={{
                geo: {
                  showframe: false,
                  showcoastlines: true,
                  projection: { type: 'equirectangular' },
                },
                margin: { l: 0, r: 0, t: 0, b: 0 },
              }}
              className="w-full h-80"
              chartId="micelio_choropleth"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Países Micelio */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
                Top Países de Consulta (Micelio)
              </h4>
              <div className="space-y-2">
                {data.paisesMicelio.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{p.pais}</span>
                    <span className="font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
                      {p.vistas.toLocaleString()} vistas
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Países Google Analytics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
                Top Países de Consulta (Google Analytics)
              </h4>
              <div className="space-y-2">
                {data.paisesAnalytics.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{p.pais}</span>
                    <span className="font-mono tabular-nums font-bold text-sky-600 dark:text-sky-400">
                      {p.vistas.toLocaleString()} usuarios
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Ciudades de Consulta */}
      {activeTab === 'ciudades' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Tabla 5. Estadística de Visibilidad por Ciudades de Consulta
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Consolidado de fuentes Micelio, EuroCRIS y Google Analytics
            </p>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-2.5">Ciudad de Consulta</th>
                <th className="px-4 py-2.5 text-right">Vistas en Micelio</th>
                <th className="px-4 py-2.5 text-right">Vistas Google Analytics</th>
                <th className="px-4 py-2.5 text-right font-bold">Total Combinado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {data.ciudades.map((c, idx) => {
                const combined = (c.vistasMicelio || 0) + (c.vistasAnalytics || 0);
                return (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{c.ciudad}</td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">
                      {(c.vistasMicelio || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums text-sky-600">
                      {(c.vistasAnalytics || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums font-bold text-indigo-700 dark:text-indigo-400">
                      {combined.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. Indexadoras, Cosechadoras y Agregadores (Hexbin + Treemap) */}
      {activeTab === 'indexadoras' && (
        <IndexadorasManager
          title="Indexadoras, Cosechadoras de Datos y Agregadores que Incluyen a Micelio"
          subtitle="Seguimiento mensual de plataformas globales de ciencia abierta que cosechan metadatos, DOIs DataCite y conjuntos de datos de Micelio"
          platformName="Micelio"
          indexadoras={data.indexadoras || DEFAULT_MICELIO_INDEXADORAS}
          comentarios={data.comentariosIndexadoras}
          onChange={handleIndexadorasChange}
          year={year}
        />
      )}

      {/* Gráfico Comparativo Interanual de Visitas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
          Reporte de Visitas por Mes a Micelio: {year - 1} vs {year}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Comportamiento del tráfico mensual en la plataforma para la investigación UCA
        </p>
        <PlotlyChart
          data={lineVisitasCompData}
          layout={{ margin: { l: 45, r: 20, t: 20, b: 40 } }}
          className="w-full h-72"
          chartId="micelio_visitas_comp"
        />
      </div>
    </div>
  );
};
