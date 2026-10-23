import React from 'react';
import { PlanMejoraCdASIU } from '../../../types';
import { EditableTable, ColumnDef } from '../../common/EditableTable';
import { KPICard } from '../../common/KPICard';
import { CheckSquare, Target, ListChecks } from 'lucide-react';

interface S22Props {
  items: PlanMejoraCdASIU[];
  onChange: (items: PlanMejoraCdASIU[]) => void;
  year: number;
}

export const S22_PlanMejora: React.FC<S22Props> = ({ items, onChange, year }) => {
  const columns: ColumnDef<PlanMejoraCdASIU>[] = [
    {
      key: 'categoria',
      header: 'Categoría del Plan',
      accessor: (row) => row.categoria,
      type: 'text',
      onCellChange: (row, val) => {
        row.categoria = String(val);
      },
    },
    {
      key: 'acciones',
      header: 'Acciones Principales Comprometidas',
      accessor: (row) => row.acciones,
      type: 'text',
      onCellChange: (row, val) => {
        row.acciones = String(val);
      },
    },
    {
      key: 'indicador',
      header: 'Indicador de Logro Esperado',
      accessor: (row) => row.indicador,
      type: 'text',
      onCellChange: (row, val) => {
        row.indicador = String(val);
      },
    },
    {
      key: 'periodo',
      header: 'Periodo de Ejecución',
      accessor: (row) => row.periodo,
      type: 'text',
      onCellChange: (row, val) => {
        row.periodo = String(val);
      },
    },
    {
      key: 'actividades',
      header: 'Detalle de Actividades Desarrolladas',
      accessor: (row) => row.actividades,
      type: 'text',
      onCellChange: (row, val) => {
        row.actividades = String(val);
      },
    },
    {
      key: 'logros',
      header: 'Logros Obtenidos y Evidencias',
      accessor: (row) => row.logros,
      type: 'text',
      onCellChange: (row, val) => {
        row.logros = String(val);
      },
    },
  ];

  const handleAdd = () => {
    const newItem: PlanMejoraCdASIU = {
      id: `pm-${Date.now()}`,
      categoria: 'Gestión y Servicios CRAI',
      acciones: 'Nueva acción de mejora continua',
      indicador: 'Indicador de cumplimiento',
      periodo: `Anual ${year}`,
      actividades: '',
      logros: '',
    };
    onChange([...items, newItem]);
  };

  const handleDelete = (idx: number) => {
    const updated = [...items];
    updated.splice(idx, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Acciones de Mejora"
          value={items.length}
          subtitle={`Planificadas para ${year}`}
          meta="Comité de Autoevaluación (CdA)"
          icon={Target}
        />
        <KPICard
          title="Categorías Estratégicas"
          value={Array.from(new Set(items.map((i) => i.categoria))).length}
          subtitle="Áreas de intervención"
          meta="Calidad y acreditación"
          icon={ListChecks}
        />
        <KPICard
          title="Con Logros Reportados"
          value={items.filter((i) => i.logros && i.logros.trim().length > 0).length}
          subtitle="Acciones con evidencias"
          meta="Avance documentado"
          icon={CheckSquare}
          badge={{ text: 'En seguimiento', variant: 'success' }}
        />
      </div>

      <EditableTable
        title="2.2 Plan de Mejora del Comité de Autoevaluación (CdA)"
        subtitle="Registro de compromisos de mejora de la calidad académica, infraestructura, repositorios y servicios a la comunidad."
        columns={columns}
        data={items}
        onDataChange={(newData) => onChange([...newData])}
        canAddRow={true}
        canDeleteRow={true}
        onAddRow={handleAdd}
        onDeleteRow={handleDelete}
        showTotals={false}
      />
    </div>
  );
};
