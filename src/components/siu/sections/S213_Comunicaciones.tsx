import React from 'react';
import { ComunicacionesSIU } from '../../../types';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { Share2, Users, Heart, Eye } from 'lucide-react';

interface S213Props {
  items: ComunicacionesSIU[];
  onChange: (items: ComunicacionesSIU[]) => void;
  year: number;
}

export const S213_Comunicaciones: React.FC<S213Props> = ({ items, onChange, year }) => {
  const totPublicaciones = items.reduce(
    (acc, i) => acc + (Number(i.periodo1.publicaciones) || 0) + (Number(i.periodo2.publicaciones) || 0),
    0
  );
  const totInteracciones = items.reduce(
    (acc, i) => acc + (Number(i.periodo1.interacciones) || 0) + (Number(i.periodo2.interacciones) || 0),
    0
  );
  const totAlcance = items.reduce(
    (acc, i) => acc + (Number(i.periodo1.alcance) || 0) + (Number(i.periodo2.alcance) || 0),
    0
  );
  const totSeguidores = items.reduce((acc, i) => acc + (Number(i.periodo2.seguidores) || 0), 0);

  const handleFieldChange = (
    rIdx: number,
    periodo: 'periodo1' | 'periodo2',
    field: 'publicaciones' | 'interacciones' | 'seguidores' | 'alcance',
    val: string
  ) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = [...items];
    updated[rIdx] = {
      ...updated[rIdx],
      [periodo]: {
        ...updated[rIdx][periodo],
        [field]: num,
      },
    };
    onChange(updated);
  };

  const chartData: Plotly.Data[] = [
    {
      x: items.map((i) => i.red),
      y: items.map((i) => (i.periodo1.publicaciones || 0) + (i.periodo2.publicaciones || 0)),
      name: 'Publicaciones Totales',
      type: 'bar',
      marker: { color: '#6366f1' },
    },
    {
      x: items.map((i) => i.red),
      y: items.map((i) => (i.periodo1.interacciones || 0) + (i.periodo2.interacciones || 0)),
      name: 'Interacciones Totales',
      type: 'bar',
      marker: { color: '#10b981' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Publicaciones"
          value={totPublicaciones}
          subtitle={`Contenidos difundidos en ${year}`}
          meta="Redes oficiales CRAI"
          icon={Share2}
        />
        <KPICard
          title="Total Interacciones"
          value={totInteracciones.toLocaleString()}
          subtitle="Reacciones, comentarios, clics"
          meta="Engagement comunitario"
          icon={Heart}
        />
        <KPICard
          title="Alcance Total de Audiencia"
          value={totAlcance.toLocaleString()}
          subtitle="Impresiones y visualizaciones"
          meta="Difusión semestral"
          icon={Eye}
        />
        <KPICard
          title="Comunidad de Seguidores"
          value={totSeguidores.toLocaleString()}
          subtitle="Seguidores al cierre del año"
          meta="Comunidad digital UCA"
          icon={Users}
        />
      </div>

      {/* Matriz Semestral de Redes Sociales */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            2.13 Comunicaciones y Redes Sociales (Servicios Académicos) ({year})
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro semestral de alcance e interacción en Facebook, X (Twitter), Instagram y YouTube
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <th className="px-3 py-2.5">Red Social</th>
                <th className="px-2 py-2.5 text-center" colSpan={4}>Periodo 1 (Enero - Junio)</th>
                <th className="px-2 py-2.5 text-center" colSpan={4}>Periodo 2 (Julio - Diciembre)</th>
                <th className="px-3 py-2.5 text-right font-bold">Total Pub.</th>
                <th className="px-3 py-2.5 text-right font-bold">Total Interac.</th>
              </tr>
              <tr className="bg-slate-100/50 dark:bg-slate-800/30 text-[11px] text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th />
                <th className="px-1 text-center">Pub.</th>
                <th className="px-1 text-center">Inter.</th>
                <th className="px-1 text-center">Seg.</th>
                <th className="px-1 text-center">Alcance</th>
                <th className="px-1 text-center">Pub.</th>
                <th className="px-1 text-center">Inter.</th>
                <th className="px-1 text-center">Seg.</th>
                <th className="px-1 text-center">Alcance</th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {items.map((c, rIdx) => {
                const totPub = (c.periodo1.publicaciones || 0) + (c.periodo2.publicaciones || 0);
                const totInt = (c.periodo1.interacciones || 0) + (c.periodo2.interacciones || 0);

                return (
                  <tr key={c.id || rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200 min-w-[150px]">
                      {c.red}
                    </td>

                    {/* Periodo 1 */}
                    <td className="px-1 py-1 text-center">
                      <input
                        type="number"
                        min="0"
                        value={c.periodo1.publicaciones}
                        onChange={(e) => handleFieldChange(rIdx, 'periodo1', 'publicaciones', e.target.value)}
                        className="w-12 text-center py-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border rounded font-mono tabular-nums text-xs"
                      />
                    </td>
                    <td className="px-1 py-1 text-center">
                      <input
                        type="number"
                        min="0"
                        value={c.periodo1.interacciones}
                        onChange={(e) => handleFieldChange(rIdx, 'periodo1', 'interacciones', e.target.value)}
                        className="w-14 text-center py-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border rounded font-mono tabular-nums text-xs"
                      />
                    </td>
                    <td className="px-1 py-1 text-center">
                      <input
                        type="number"
                        min="0"
                        value={c.periodo1.seguidores}
                        onChange={(e) => handleFieldChange(rIdx, 'periodo1', 'seguidores', e.target.value)}
                        className="w-16 text-center py-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border rounded font-mono tabular-nums text-xs"
                      />
                    </td>
                    <td className="px-1 py-1 text-center">
                      <input
                        type="number"
                        min="0"
                        value={c.periodo1.alcance}
                        onChange={(e) => handleFieldChange(rIdx, 'periodo1', 'alcance', e.target.value)}
                        className="w-18 text-center py-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border rounded font-mono tabular-nums text-xs"
                      />
                    </td>

                    {/* Periodo 2 */}
                    <td className="px-1 py-1 text-center">
                      <input
                        type="number"
                        min="0"
                        value={c.periodo2.publicaciones}
                        onChange={(e) => handleFieldChange(rIdx, 'periodo2', 'publicaciones', e.target.value)}
                        className="w-12 text-center py-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border rounded font-mono tabular-nums text-xs"
                      />
                    </td>
                    <td className="px-1 py-1 text-center">
                      <input
                        type="number"
                        min="0"
                        value={c.periodo2.interacciones}
                        onChange={(e) => handleFieldChange(rIdx, 'periodo2', 'interacciones', e.target.value)}
                        className="w-14 text-center py-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border rounded font-mono tabular-nums text-xs"
                      />
                    </td>
                    <td className="px-1 py-1 text-center">
                      <input
                        type="number"
                        min="0"
                        value={c.periodo2.seguidores}
                        onChange={(e) => handleFieldChange(rIdx, 'periodo2', 'seguidores', e.target.value)}
                        className="w-16 text-center py-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border rounded font-mono tabular-nums text-xs"
                      />
                    </td>
                    <td className="px-1 py-1 text-center">
                      <input
                        type="number"
                        min="0"
                        value={c.periodo2.alcance}
                        onChange={(e) => handleFieldChange(rIdx, 'periodo2', 'alcance', e.target.value)}
                        className="w-18 text-center py-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border rounded font-mono tabular-nums text-xs"
                      />
                    </td>

                    <td className="px-3 py-1 text-right font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                      {totPub.toLocaleString()}
                    </td>
                    <td className="px-3 py-1 text-right font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                      {totInt.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico Comparativo de Redes */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
          Publicaciones vs Interacciones por Red Social
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Métricas anuales de impacto digital</p>
        <PlotlyChart
          data={chartData}
          layout={{ barmode: 'group', margin: { l: 45, r: 20, t: 20, b: 40 } }}
          className="w-full h-72"
          chartId="comunicaciones_barras"
        />
      </div>
    </div>
  );
};
