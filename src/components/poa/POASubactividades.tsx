import React from 'react';
import { SubactividadPOA } from '../../types';
import { EditableTable, ColumnDef } from '../common/EditableTable';
import { KPICard } from '../common/KPICard';
import { CheckCircle, ListTodo } from 'lucide-react';
import { PlotlyChart } from '../common/PlotlyChart';

interface POASubactividadesProps {
  items: SubactividadPOA[];
  onChange: (items: SubactividadPOA[]) => void;
  year: number;
}

export const POASubactividades: React.FC<POASubactividadesProps> = ({ items, onChange, year }) => {
  const totalCantidad = items.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0);

  const columns: ColumnDef<SubactividadPOA>[] = [
    {
      key: 'descripcion',
      header: 'Descripción de la Subactividad Institucional',
      accessor: (row) => row.descripcion,
      type: 'text',
      onCellChange: (row, val) => {
        row.descripcion = String(val);
      },
    },
    {
      key: 'cantidad',
      header: 'Cantidad Comprometida',
      accessor: (row) => row.cantidad,
      type: 'number',
      align: 'right',
      sumTotal: true,
      onCellChange: (row, val) => {
        row.cantidad = Number(val) || 0;
      },
    },
    {
      key: 'porcentaje',
      header: '% del Total Proyectado',
      accessor: (row) => (totalCantidad > 0 ? ((Number(row.cantidad) / totalCantidad) * 100).toFixed(2) + '%' : '0%'),
      type: 'readonly',
      align: 'right',
      calculate: (row) => (totalCantidad > 0 ? ((Number(row.cantidad) / totalCantidad) * 100).toFixed(2) + '%' : '0%'),
      format: (val) => <span className="font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">{val}</span>,
    },
  ];

  const handleAddRow = () => {
    const newItem: SubactividadPOA = {
      id: `sub-${Date.now()}`,
      descripcion: `Nueva subactividad de la línea ${items.length + 1}`,
      cantidad: 0,
    };
    onChange([...items, newItem]);
  };

  const handleDeleteRow = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    onChange(updated);
  };

  const pieChartData: Plotly.Data[] = [
    {
      labels: items.map((i, idx) => `Subactividad ${idx + 1}`),
      values: items.map((i) => i.cantidad),
      type: 'pie',
      textinfo: 'percent',
      hovertext: items.map((i) => i.descripcion),
      marker: {
        colors: ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#ec4899'],
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPICard
          title="Total de Subactividades Comprometidas"
          value={totalCantidad}
          subtitle={`Unidades planificadas para ${year}`}
          meta="100% distribuido"
          icon={CheckCircle}
        />
        <KPICard
          title="Líneas de Acción Registradas"
          value={items.length}
          subtitle="Proyectos y acciones de seguimiento"
          icon={ListTodo}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <EditableTable
            title="1.5 Subactividades de la Línea Micelio"
            subtitle="La columna '% del Total Proyectado' se calcula automáticamente a partir de las cantidades ingresadas."
            columns={columns}
            data={items}
            onDataChange={(newData) => onChange([...newData])}
            canAddRow={true}
            canDeleteRow={true}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
            totalsLabel="Total Proyectado Subactividades"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Ponderación de Metas</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Distribución porcentual de las subactividades</p>
          <PlotlyChart
            data={pieChartData}
            layout={{
              margin: { l: 20, r: 20, t: 10, b: 20 },
              showlegend: true,
            }}
            className="w-full h-64"
            chartId="poa_subactividades_pie"
          />
        </div>
      </div>
    </div>
  );
};
