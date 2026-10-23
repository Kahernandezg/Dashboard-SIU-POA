import React from 'react';
import { DesarrolloColeccionesSIU } from '../../../types';
import { EditableTable, ColumnDef } from '../../common/EditableTable';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { DollarSign, Layers, Calendar, AlertCircle } from 'lucide-react';

interface S28Props {
  items: DesarrolloColeccionesSIU[];
  onChange: (items: DesarrolloColeccionesSIU[]) => void;
  year: number;
}

export const S28_DesarrolloColecciones: React.FC<S28Props> = ({ items, onChange, year }) => {
  const totalInversion = items.reduce((a, b) => a + (Number(b.costo) || 0), 0);

  // Inversión por proveedor
  const invPorProveedor: { [prov: string]: number } = {};
  items.forEach((i) => {
    const prov = i.proveedor || 'Sin proveedor';
    invPorProveedor[prov] = (invPorProveedor[prov] || 0) + (Number(i.costo) || 0);
  });

  // Inversión por área
  const invPorArea: { [area: string]: number } = {};
  items.forEach((i) => {
    const a = i.area || 'General';
    invPorArea[a] = (invPorArea[a] || 0) + (Number(i.costo) || 0);
  });

  const columns: ColumnDef<DesarrolloColeccionesSIU>[] = [
    {
      key: 'titulo',
      header: 'Título de la Base de Datos Académica',
      accessor: (row) => row.titulo,
      type: 'text',
      onCellChange: (row, val) => {
        row.titulo = String(val);
      },
    },
    {
      key: 'proveedor',
      header: 'Proveedor / Editorial',
      accessor: (row) => row.proveedor,
      type: 'text',
      onCellChange: (row, val) => {
        row.proveedor = String(val);
      },
    },
    {
      key: 'fechaInicio',
      header: 'Inicio Suscripción',
      accessor: (row) => row.fechaInicio,
      type: 'date',
      onCellChange: (row, val) => {
        row.fechaInicio = String(val);
      },
    },
    {
      key: 'fechaFin',
      header: 'Fin Suscripción',
      accessor: (row) => row.fechaFin,
      type: 'date',
      onCellChange: (row, val) => {
        row.fechaFin = String(val);
      },
      format: (val) => {
        const d = new Date(val);
        const hoy = new Date();
        const diffDays = Math.ceil((d.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
        const venciendo = diffDays > 0 && diffDays <= 90;
        const vencido = diffDays <= 0;

        return (
          <div className="flex items-center gap-1.5 tabular-nums">
            <span>{val}</span>
            {venciendo && (
              <span className="text-[10px] bg-amber-50 dark:bg-amber-950/50 text-amber-600 px-1.5 py-0.5 rounded font-medium">
                Vence en {diffDays}d
              </span>
            )}
            {vencido && (
              <span className="text-[10px] bg-rose-50 dark:bg-rose-950/50 text-rose-600 px-1.5 py-0.5 rounded font-medium">
                Vencido
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'costo',
      header: 'Inversión Anual ($ USD)',
      accessor: (row) => row.costo,
      type: 'number',
      align: 'right',
      sumTotal: true,
      format: (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      onCellChange: (row, val) => {
        row.costo = Number(val) || 0;
      },
    },
    {
      key: 'area',
      header: 'Área del Conocimiento',
      accessor: (row) => row.area,
      type: 'text',
      onCellChange: (row, val) => {
        row.area = String(val);
      },
    },
    {
      key: 'modelo',
      header: 'Modelo',
      accessor: (row) => row.modelo,
      type: 'select',
      options: ['Suscripción anual', 'Perpetuo', 'Acceso abierto', 'Consorcio CBUES'],
      onCellChange: (row, val) => {
        row.modelo = val;
      },
    },
    {
      key: 'comentarios',
      header: 'Comentarios / Observaciones',
      accessor: (row) => row.comentarios,
      type: 'text',
      onCellChange: (row, val) => {
        row.comentarios = String(val);
      },
    },
  ];

  const handleAdd = () => {
    const newItem: DesarrolloColeccionesSIU = {
      id: `dc-${Date.now()}`,
      titulo: 'Nueva base de datos académica',
      proveedor: 'Proveedor suscripción',
      fechaInicio: `${year}-01-01`,
      fechaFin: `${year}-12-31`,
      costo: 5000,
      comentarios: 'Renovación proyectada',
      area: 'Multidisciplinar',
      modelo: 'Suscripción anual',
    };
    onChange([...items, newItem]);
  };

  const handleDelete = (idx: number) => {
    const updated = [...items];
    updated.splice(idx, 1);
    onChange(updated);
  };

  // 1. Gráfico Inversión por Proveedor (Pie con paleta UCA)
  const chartProvData: Plotly.Data[] = [
    {
      labels: Object.keys(invPorProveedor),
      values: Object.values(invPorProveedor),
      type: 'pie',
      hole: 0.45,
      textinfo: 'label+percent',
      marker: {
        colors: ['#234a80', '#e06d26', '#3b82f6', '#059669', '#d97706', '#64748b'],
      },
    },
  ];

  // 2. Gráfico Inversión por Área (Bar con UCA Blue)
  const chartAreaData: Plotly.Data[] = [
    {
      x: Object.keys(invPorArea),
      y: Object.values(invPorArea),
      type: 'bar',
      marker: { color: '#234a80' },
      text: Object.values(invPorArea).map((v) => `$${v.toLocaleString()}`),
      textposition: 'auto',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Inversión Total en Bases de Datos"
          value={`$${totalInversion.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle={`Presupuesto ejecutado en ${year}`}
          meta="Recursos de información"
          icon={DollarSign}
        />
        <KPICard
          title="Bases de Datos Suscritas"
          value={items.length}
          subtitle="Colecciones activas en el CRAI"
          meta="Acceso multiusuario"
          icon={Layers}
        />
        <KPICard
          title="Proveedores Contratados"
          value={Object.keys(invPorProveedor).length}
          subtitle="Editoriales y consorcios"
          meta="Gestión de licencias"
          icon={Calendar}
        />
      </div>

      <EditableTable
        title="2.8 Desarrollo de Colecciones (Bases de Datos Académicas)"
        subtitle="Registro de adquisiciones, vigencias de suscripción y montos de inversión institucional."
        columns={columns}
        data={items}
        onDataChange={(newData) => onChange([...newData])}
        canAddRow={true}
        canDeleteRow={true}
        onAddRow={handleAdd}
        onDeleteRow={handleDelete}
        totalsLabel="Total Inversión Colecciones"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Inversión por Proveedor / Editorial
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Distribución presupuestaria</p>
          <PlotlyChart
            data={chartProvData}
            layout={{ margin: { l: 20, r: 20, t: 10, b: 20 }, showlegend: true }}
            className="w-full h-72"
            chartId="colecciones_prov_pie"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Inversión por Área del Conocimiento
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Gasto asignado por facultad o disciplina</p>
          <PlotlyChart
            data={chartAreaData}
            layout={{ margin: { l: 45, r: 20, t: 10, b: 60 }, xaxis: { tickangle: -20 } }}
            className="w-full h-72"
            chartId="colecciones_area_barras"
          />
        </div>
      </div>
    </div>
  );
};
