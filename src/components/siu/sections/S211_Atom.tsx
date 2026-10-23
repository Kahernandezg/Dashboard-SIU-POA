import React from 'react';
import { AtomSIU, MESES_CORTO } from '../../../types';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { FolderArchive, DownloadCloud, Database, Plus, Trash2 } from 'lucide-react';

interface S211Props {
  data: AtomSIU;
  onChange: (data: AtomSIU) => void;
  year: number;
}

export const S211_Atom: React.FC<S211Props> = ({ data, onChange, year }) => {
  const calculateRowTotal = (meses: number[]) => meses.reduce((a, b) => a + (Number(b) || 0), 0);

  const totDepositosAtom = data.depositosMes.reduce((a, b) => a + calculateRowTotal(b.meses), 0);
  const totDspace = data.estadisticasDSpace.reduce((a, b) => a + calculateRowTotal(b.meses), 0);

  const handleAtomCellChange = (rIdx: number, mIdx: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = { ...data };
    const list = [...updated.depositosMes];
    const newMonths = [...list[rIdx].meses];
    newMonths[mIdx] = num;
    list[rIdx] = { ...list[rIdx], meses: newMonths };
    updated.depositosMes = list;
    onChange(updated);
  };

  const handleDSpaceCellChange = (rIdx: number, mIdx: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = { ...data };
    const list = [...updated.estadisticasDSpace];
    const newMonths = [...list[rIdx].meses];
    newMonths[mIdx] = num;
    list[rIdx] = { ...list[rIdx], meses: newMonths };
    updated.estadisticasDSpace = list;
    onChange(updated);
  };

  const chartAtomData: Plotly.Data[] = data.depositosMes.map((d) => ({
    x: [...MESES_CORTO],
    y: d.meses,
    name: d.comunidadColeccion,
    type: 'bar',
  }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Depósitos en ATOM"
          value={totDepositosAtom}
          subtitle={`Unidades archivísticas en ${year}`}
          meta="Preservación de memoria histórica"
          icon={FolderArchive}
        />
        <KPICard
          title="Colecciones ATOM Registradas"
          value={data.depositosMes.length}
          subtitle="Fondos documentales"
          meta="Archivos y colecciones fotográficas"
          icon={Database}
        />
        <KPICard
          title="Métricas en DSpace"
          value={totDspace.toLocaleString()}
          subtitle="Ítems y descargas registradas"
          meta="Repositorio digital institucional"
          icon={DownloadCloud}
        />
      </div>

      {/* Matriz 1: Depósitos en ATOM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Depósitos Mensuales en ATOM por Comunidad / Colección ({year})
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Plataforma de descripción archivística Access to Memory (ATOM)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <th className="px-3 py-2.5 whitespace-nowrap">Comunidad / Colección ATOM</th>
                {MESES_CORTO.map((m) => (
                  <th key={m} className="px-1.5 py-2.5 text-center w-14">
                    {m}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-bold w-24">TOTAL ANUAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {data.depositosMes.map((d, rIdx) => {
                const rowTot = calculateRowTotal(d.meses);
                return (
                  <tr key={d.id || rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                      {d.comunidadColeccion}
                    </td>
                    {d.meses.map((val, mIdx) => (
                      <td key={mIdx} className="px-1 py-1 text-center">
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => handleAtomCellChange(rIdx, mIdx, e.target.value)}
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
              <tr className="bg-slate-50 dark:bg-slate-800/90 font-bold border-t-2 text-slate-900 dark:text-white">
                <td className="px-3 py-2.5">Total Depósitos ATOM</td>
                {MESES_CORTO.map((_, mIdx) => {
                  const mSum = data.depositosMes.reduce((acc, row) => acc + (Number(row.meses[mIdx]) || 0), 0);
                  return (
                    <td key={mIdx} className="px-1.5 py-2.5 text-center font-mono tabular-nums">
                      {mSum.toLocaleString()}
                    </td>
                  );
                })}
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                  {totDepositosAtom.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Gráfico de Barras Apiladas ATOM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
          Depósitos en ATOM por Fondo / Colección
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Comportamiento mensual de descripción documental
        </p>
        <PlotlyChart
          data={chartAtomData}
          layout={{ barmode: 'stack', margin: { l: 45, r: 20, t: 20, b: 40 } }}
          className="w-full h-72"
          chartId="atom_depositos_barras"
        />
      </div>

      {/* Matriz 2: Estadísticas en DSpace */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Estadísticas Consolidadas en DSpace ({year})
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoreo técnico de ítems y descargas
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <th className="px-3 py-2.5 whitespace-nowrap">Indicador DSpace</th>
                {MESES_CORTO.map((m) => (
                  <th key={m} className="px-1.5 py-2.5 text-center w-14">
                    {m}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-bold w-24">TOTAL ANUAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {data.estadisticasDSpace.map((ds, rIdx) => {
                const rowTot = calculateRowTotal(ds.meses);
                return (
                  <tr key={ds.id || rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">{ds.indicador}</td>
                    {ds.meses.map((val, mIdx) => (
                      <td key={mIdx} className="px-1 py-1 text-center">
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => handleDSpaceCellChange(rIdx, mIdx, e.target.value)}
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
    </div>
  );
};
