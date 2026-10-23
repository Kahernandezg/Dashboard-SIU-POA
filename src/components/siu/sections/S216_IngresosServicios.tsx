import React from 'react';
import { IngresoServicioSIU, MESES_CORTO } from '../../../types';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { DollarSign, Receipt, CreditCard, Plus, Trash2 } from 'lucide-react';

interface S216Props {
  items: IngresoServicioSIU[];
  onChange: (items: IngresoServicioSIU[]) => void;
  year: number;
}

export const S216_IngresosServicios: React.FC<S216Props> = ({ items, onChange, year }) => {
  const calculateRowCant = (meses: number[]) => meses.reduce((a, b) => a + (Number(b) || 0), 0);
  const calculateRowIngreso = (item: IngresoServicioSIU) =>
    calculateRowCant(item.cantidadMes) * (Number(item.precioUnitario) || 0);

  const totalIngresoGeneral = items.reduce((sum, item) => sum + calculateRowIngreso(item), 0);
  const totalCantidadServicios = items.reduce((sum, item) => sum + calculateRowCant(item.cantidadMes), 0);

  // Ingresos por mes
  const ingresosMensuales = new Array(12).fill(0);
  items.forEach((item) => {
    const precio = Number(item.precioUnitario) || 0;
    item.cantidadMes.forEach((cant, idx) => {
      ingresosMensuales[idx] += (Number(cant) || 0) * precio;
    });
  });

  // Ingresos por área
  const ingresosPorArea: { [area: string]: number } = {};
  items.forEach((item) => {
    const a = item.area || 'Otros';
    ingresosPorArea[a] = (ingresosPorArea[a] || 0) + calculateRowIngreso(item);
  });

  const handleCellChange = (rIdx: number, mIdx: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = [...items];
    const newMonths = [...updated[rIdx].cantidadMes];
    newMonths[mIdx] = num;
    updated[rIdx] = { ...updated[rIdx], cantidadMes: newMonths };
    onChange(updated);
  };

  const handlePriceChange = (rIdx: number, val: string) => {
    const num = Math.max(0, parseFloat(val) || 0);
    const updated = [...items];
    updated[rIdx] = { ...updated[rIdx], precioUnitario: num };
    onChange(updated);
  };

  const handleTextChange = (rIdx: number, field: 'area' | 'servicio', val: string) => {
    const updated = [...items];
    updated[rIdx] = { ...updated[rIdx], [field]: val };
    onChange(updated);
  };

  const handleAddService = () => {
    const newServ: IngresoServicioSIU = {
      id: `ing-${Date.now()}`,
      area: 'Servicios de Sala',
      servicio: 'Nuevo servicio arancelario',
      precioUnitario: 1.0,
      cantidadMes: new Array(12).fill(0),
    };
    onChange([...items, newServ]);
  };

  const handleDeleteService = (idx: number) => {
    const updated = [...items];
    updated.splice(idx, 1);
    onChange(updated);
  };

  // 1. Gráfico de Ingresos por Área (Donut)
  const chartAreaData: Plotly.Data[] = [
    {
      labels: Object.keys(ingresosPorArea),
      values: Object.values(ingresosPorArea),
      type: 'pie',
      hole: 0.45,
      textinfo: 'label+percent',
      marker: {
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'],
      },
    },
  ];

  // 2. Gráfico de Ingresos Mensuales (Bar)
  const chartMonthlyData: Plotly.Data[] = [
    {
      x: [...MESES_CORTO],
      y: ingresosMensuales,
      type: 'bar',
      marker: { color: '#6366f1' },
      text: ingresosMensuales.map((v) => `$${v.toFixed(0)}`),
      textposition: 'auto',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Ingresos por Servicios"
          value={`$${totalIngresoGeneral.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`Recaudación año ${year}`}
          meta="Fondos propios CRAI"
          icon={DollarSign}
        />
        <KPICard
          title="Servicios / Operaciones Brindadas"
          value={totalCantidadServicios.toLocaleString()}
          subtitle="Transacciones en el año"
          meta="Carnetización, mora y reprografía"
          icon={Receipt}
        />
        <KPICard
          title="Promedio de Recaudación Mensual"
          value={`$${(totalIngresoGeneral / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Ingreso medio por mes"
          meta="Sostenibilidad operativa"
          icon={CreditCard}
        />
      </div>

      {/* Matriz Mensual Editable de Servicios con Fórmulas de Ingreso */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              2.16 Matriz de Ingresos por Servicios Bibliotecarios ({year})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ingrese la cantidad mensual de servicios. Los ingresos totales se calculan multiplicando por el precio unitario.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddService}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar servicio</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <th className="px-3 py-2.5">Área</th>
                <th className="px-3 py-2.5">Servicio / Concepto</th>
                <th className="px-2 py-2.5 text-center w-20">Precio ($)</th>
                {MESES_CORTO.map((m) => (
                  <th key={m} className="px-1 py-2.5 text-center w-12">
                    {m}
                  </th>
                ))}
                <th className="px-2 py-2.5 text-right font-bold w-16">Cant.</th>
                <th className="px-3 py-2.5 text-right font-bold w-24">Ingreso ($)</th>
                <th className="px-2 py-2.5 text-center w-10">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {items.map((serv, rIdx) => {
                const rowCant = calculateRowCant(serv.cantidadMes);
                const rowIngreso = calculateRowIngreso(serv);

                return (
                  <tr key={serv.id || rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-1.5 min-w-[120px]">
                      <input
                        type="text"
                        value={serv.area}
                        onChange={(e) => handleTextChange(rIdx, 'area', e.target.value)}
                        className="w-full py-1 px-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium text-slate-800 dark:text-slate-200"
                      />
                    </td>
                    <td className="px-3 py-1.5 min-w-[180px]">
                      <input
                        type="text"
                        value={serv.servicio}
                        onChange={(e) => handleTextChange(rIdx, 'servicio', e.target.value)}
                        className="w-full py-1 px-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"
                      />
                    </td>
                    <td className="px-2 py-1 text-center">
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={serv.precioUnitario}
                        onChange={(e) => handlePriceChange(rIdx, e.target.value)}
                        className="w-16 text-center py-1 bg-slate-50 dark:bg-slate-800 border rounded font-mono tabular-nums text-xs"
                      />
                    </td>
                    {serv.cantidadMes.map((val, mIdx) => (
                      <td key={mIdx} className="px-0.5 py-1 text-center">
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => handleCellChange(rIdx, mIdx, e.target.value)}
                          className="w-11 text-center py-1 px-0.5 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent focus:border-indigo-500 rounded font-mono tabular-nums text-slate-700 dark:text-slate-300 text-xs"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                      {rowCant.toLocaleString()}
                    </td>
                    <td className="px-3 py-1.5 text-right font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                      ${rowIngreso.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteService(rIdx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/90 font-bold border-t-2 text-slate-900 dark:text-white">
                <td className="px-3 py-2.5" colSpan={3}>
                  Total General Recaudado
                </td>
                {MESES_CORTO.map((_, mIdx) => {
                  const mSum = items.reduce(
                    (acc, row) => acc + (Number(row.cantidadMes[mIdx]) || 0) * (Number(row.precioUnitario) || 0),
                    0
                  );
                  return (
                    <td key={mIdx} className="px-0.5 py-2.5 text-center font-mono tabular-nums text-[11px]">
                      ${mSum.toFixed(0)}
                    </td>
                  );
                })}
                <td className="px-2 py-2.5 text-right font-mono tabular-nums">
                  {totalCantidadServicios.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-emerald-700 dark:text-emerald-400 text-sm">
                  ${totalIngresoGeneral.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Gráficos de Ingresos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Participación de Ingresos por Área
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Distribución porcentual por línea de servicio</p>
          <PlotlyChart
            data={chartAreaData}
            layout={{ margin: { l: 20, r: 20, t: 10, b: 20 }, showlegend: true }}
            className="w-full h-64"
            chartId="ingresos_area_donut"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Recaudación Mensual de Servicios ($ USD)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Evolución de ingresos mes a mes</p>
          <PlotlyChart
            data={chartMonthlyData}
            layout={{ margin: { l: 45, r: 20, t: 10, b: 40 } }}
            className="w-full h-64"
            chartId="ingresos_mensual_barras"
          />
        </div>
      </div>
    </div>
  );
};
