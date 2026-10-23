import React from 'react';
import { ReporteControlSIU } from '../../../types';
import { EditableTable, ColumnDef } from '../../common/EditableTable';
import { KPICard } from '../../common/KPICard';
import { CalendarClock, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface S20Props {
  reportes: ReporteControlSIU[];
  onChange: (reportes: ReporteControlSIU[]) => void;
  year: number;
}

export const S20_ControlReportes: React.FC<S20Props> = ({ reportes, onChange, year }) => {
  const entregados = reportes.filter((r) => r.estado === 'Entregado').length;
  const enRevision = reportes.filter((r) => r.estado === 'En revisión').length;
  const pendientes = reportes.filter((r) => r.estado === 'Pendiente').length;

  const columns: ColumnDef<ReporteControlSIU>[] = [
    {
      key: 'reporte',
      header: 'Reporte / Entrega',
      accessor: (row) => row.reporte,
      type: 'text',
      onCellChange: (row, val) => {
        row.reporte = String(val);
      },
    },
    {
      key: 'fechaLimite',
      header: 'Fecha Límite Oficial',
      accessor: (row) => row.fechaLimite,
      type: 'date',
      onCellChange: (row, val) => {
        row.fechaLimite = String(val);
      },
    },
    {
      key: 'responsable',
      header: 'Persona que Reporta',
      accessor: (row) => row.responsable,
      type: 'text',
      onCellChange: (row, val) => {
        row.responsable = String(val);
      },
    },
    {
      key: 'correo',
      header: 'Correo Institucional',
      accessor: (row) => row.correo,
      type: 'text',
      onCellChange: (row, val) => {
        row.correo = String(val);
      },
    },
    {
      key: 'estado',
      header: 'Estado de la Entrega',
      accessor: (row) => row.estado,
      type: 'select',
      options: ['Pendiente', 'En revisión', 'Entregado', 'Prorrogado'],
      onCellChange: (row, val) => {
        row.estado = val;
      },
      format: (val) => {
        const isEntregado = val === 'Entregado';
        const isRevision = val === 'En revisión';
        const isProrrogado = val === 'Prorrogado';
        return (
          <span
            className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
              isEntregado
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                : isRevision
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                : isProrrogado
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
            }`}
          >
            {val}
          </span>
        );
      },
    },
    {
      key: 'fechaProrroga',
      header: 'Fecha Prórroga Solicitada',
      accessor: (row) => row.fechaProrroga || '-',
      type: 'date',
      onCellChange: (row, val) => {
        row.fechaProrroga = String(val);
      },
    },
    {
      key: 'fechaEntrega',
      header: 'Fecha Efectiva de Entrega',
      accessor: (row) => row.fechaEntrega || '-',
      type: 'date',
      onCellChange: (row, val) => {
        row.fechaEntrega = String(val);
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Alerta de Estado y Próximos Vencimientos */}
      <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-semibold text-amber-900 dark:text-amber-200">
            Control de Plazos Institucionales SIU ({year})
          </h4>
          <p className="text-amber-800 dark:text-amber-300 mt-0.5">
            El informe preliminar de medio año debe entregarse a más tardar el 15 de julio, y el informe anual consolidado el 20 de enero del año siguiente.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Reportes Entregados"
          value={`${entregados} de ${reportes.length}`}
          subtitle="Cumplimiento formal"
          meta="Con medio de verificación"
          icon={CheckCircle}
          badge={{ text: entregados === reportes.length ? 'Al día' : 'En curso', variant: 'success' }}
        />
        <KPICard
          title="En Revisión"
          value={enRevision}
          subtitle="Validación de jefatura"
          meta="CRAI UCA"
          icon={Clock}
        />
        <KPICard
          title="Pendientes / En Proceso"
          value={pendientes}
          subtitle="Fase de recolección de datos"
          meta="Monitoreo activo"
          icon={CalendarClock}
        />
      </div>

      <EditableTable
        title="2.0 Control de Reportes SIU CRAI"
        subtitle="Registro oficial de plazos, fechas límite, prórrogas y constancias de entrega ante la Unidad de Información y Estadísticas."
        columns={columns}
        data={reportes}
        onDataChange={(newData) => onChange([...newData])}
        showTotals={false}
      />
    </div>
  );
};
