/**
 * Definiciones de tipos para el Sistema de Gestión POA y SIU
 * CRAI - Universidad Centroamericana José Simeón Cañas (UCA)
 */

export const MESES_CORTO = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
] as const;

export const MESES_COMPLETO = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
] as const;

export type EstadoReporte = 'sin_iniciar' | 'en_proceso' | 'entregado';

// ==========================================
// 1. MÓDULO POA (Línea Micelio)
// ==========================================

export interface RubroPresupuesto {
  id: string;
  rubro: string;
  monto: number;
  comentarios?: string;
}

export interface PublicacionTipoPOA {
  id: string;
  tipo: string;
  lineaBase: number;         // Año anterior (ej. 2025)
  proyeccionActual: number;  // Meta año actual (ej. 2026)
  resultadosActual: number;  // Resultado observado (ej. 2026)
  proyeccionSiguiente: number; // Proyección año siguiente (ej. 2027)
  observaciones?: string;    // Notas, justificación o descripción contextual del resultado
}

export interface DepositosMensualesPOA {
  lineaBase: number[];   // 12 meses (ej. 2025)
  proyeccion: number[];  // 12 meses (ej. 2026)
  resultados: number[];  // 12 meses (ej. 2026)
  proyeccionSiguiente?: number[]; // 12 meses (ej. Proyección 2027)
}

export interface AdopcionPOA {
  universoInvestigadores: number; // Por defecto 184
  tasaRegistroBase: number;       // Cantidad base (ej. 88)
  tasaRegistroMeta: number;       // Cantidad meta (ej. 100)
  tasaRegistroObservado: number;  // Cantidad observada (ej. 12)
  tasaConversionBase: number;     // Cantidad base (ej. 71)
  tasaConversionMeta: number;     // Cantidad meta (ej. 88)
  tasaConversionObservado: number;// Cantidad observada (ej. 8)
}

export interface SubactividadPOA {
  id: string;
  descripcion: string;
  cantidad: number;
}

export interface PerfilInvestigadorPOA {
  id: string;
  investigador: string;
  visualizaciones: number;
}

export interface BloquesCualitativos {
  logro: string;
  dificultades: string;
  acciones: string;
  resumen: string;
}

export interface AnalisisCualitativoPOA {
  maxCaracteres: number; // Por defecto 1000
  semestre1: BloquesCualitativos;
  anual: BloquesCualitativos;
}

export interface POAData {
  presupuesto: RubroPresupuesto[];
  publicaciones: PublicacionTipoPOA[];
  depositosMensuales: DepositosMensualesPOA;
  adopcion: AdopcionPOA;
  subactividades: SubactividadPOA[];
  visibilidadPerfiles: PerfilInvestigadorPOA[];
  analisisCualitativo: AnalisisCualitativoPOA;
}

// ==========================================
// 2. MÓDULO SIU (17+ Secciones del CRAI)
// ==========================================

export interface CabeceraSIU {
  ano: number;
  unidad: string;
  jefaturas: string;
  correosJefaturas: string;
  personaEnlace: string;
  correoEnlace: string;
}

export interface ReporteControlSIU {
  id: string;
  reporte: string; // 'Preliminar' | 'Anual'
  fechaLimite: string;
  responsable: string;
  correo: string;
  estado: 'Pendiente' | 'En revisión' | 'Entregado' | 'Prorrogado';
  fechaProrroga?: string;
  fechaEntrega?: string;
}

export interface FormacionPersonalSIU {
  id: string;
  tipo: string; // Seminario, Taller, Curso, Webinar, Diplomado, etc.
  nombre: string;
  participante: string;
  categoria: string; // Administrativo, Académico planta, Hora clase
  fechaInicio: string;
  fechaFin: string;
  institucion: string;
  horas: number;
  modalidad: 'Presencial' | 'En línea' | 'Híbrida';
  estado: 'Completado' | 'En curso' | 'Cancelado';
  observaciones?: string;
}

export interface PlanMejoraCdASIU {
  id: string;
  categoria: string;
  acciones: string;
  indicador: string;
  periodo: string;
  actividades: string;
  logros: string;
}

export interface RecursoElectronicoSIU {
  id: string;
  recurso: string;
  meses: number[]; // 12 meses
  anterior?: number; // Total año anterior
}

export interface CarneEmitidoSIU {
  id: string;
  tipo: string;
  cantidad: number;
}

export interface VisitasObrasSIU {
  visitasHombres: number[]; // 12 meses
  visitasMujeres: number[]; // 12 meses
  obrasConsultadas: number[]; // 12 meses
  carnesEmitidos: CarneEmitidoSIU[];
}

export interface RevistaFilaMeses {
  id: string;
  revista: string;
  meses: number[]; // 12 meses
}

export interface PortalRevistasSIU {
  articulosPublicados: RevistaFilaMeses[];
  numerosPublicados: RevistaFilaMeses[];
  visibilidadVistas: RevistaFilaMeses[];
  visibilidadAnterior: RevistaFilaMeses[];
  descargasCamjol?: RevistaFilaMeses[];
  vistasResumenCamjol?: RevistaFilaMeses[];
}

export interface DocumentoRIUCASIU {
  id: string;
  no: number;
  titulo: string;
  handle: string;
  comunidad: string;
  coleccion: string;
  financiamiento: string;
  fecha: string;
  areaMined: number; // 1-10
}

export interface RepositorioRIUCASIU {
  documentos: DocumentoRIUCASIU[];
  crecimientoMensual: number[]; // 12 meses
}

export interface RegionVistas {
  id: string;
  region: string;
  vistas: number;
}

export interface PaisVistas {
  id: string;
  pais: string;
  vistas: number;
}

export interface CiudadVistas {
  id: string;
  ciudad: string;
  vistasMicelio: number;
  vistasAnalytics: number;
}

export interface MicelioRepositorioSIU {
  publicacionesMes: Array<{ id: string; tipo: string; meses: number[] }>;
  proyectosMes: Array<{ id: string; tipo: string; meses: number[] }>;
  vistasRegion: RegionVistas[];
  paisesMicelio: PaisVistas[];
  paisesAnalytics: PaisVistas[];
  ciudades: CiudadVistas[];
  visitasMesComparativo: { anioAnterior: number[]; anioActual: number[] };
  loMasDescargado: Array<{ id: string; publicacion: string; descargas: number }>;
  eventos: Array<{ id: string; tipo: string; meses: number[] }>;
  softwareHerramientas: Array<{ id: string; tipo: string; meses: number[] }>;
}

export interface DesarrolloColeccionesSIU {
  id: string;
  titulo: string;
  proveedor: string;
  fechaInicio: string;
  fechaFin: string;
  costo: number;
  comentarios: string;
  area: string;
  modelo: string;
}

export interface AcervoHistoricoSIU {
  id: string;
  procedencia: string;
  titulosMes: number[]; // 12 meses
  paginasMes: number[]; // 12 meses
  atencionInvestigadores: number;
}

export interface CatalogadoKohaSIU {
  catalogadoMes: number[]; // 12 meses
  enProcesoMes: number[];  // 12 meses
  notaExplicativa: string;
  analisisCualitativo: string;
  conclusiones: string;
}

export interface AtomSIU {
  depositosMes: Array<{ id: string; comunidadColeccion: string; meses: number[] }>;
  estadisticasDSpace: Array<{ id: string; indicador: string; meses: number[] }>;
}

export interface PropiedadIntelectualSIU {
  id: string;
  tipoRegistro: 'ISSN' | 'ISBN';
  codigo: string;
  titulo: string;
  sello: string;
  unidad: string;
  ano: number;
  formato: 'Impreso' | 'Digital' | 'Ambos';
  autores: string;
}

export interface RedSocialMetricas {
  publicaciones: number;
  interacciones: number;
  seguidores: number;
  alcance: number;
}

export interface ComunicacionesSIU {
  id: string;
  red: string;
  periodo1: RedSocialMetricas; // Ene - Jun
  periodo2: RedSocialMetricas; // Jul - Dic
}

export interface TertuliaSIU {
  id: string;
  categoria: string;
  presencial: number;
  virtual: number;
}

export interface ActividadCulturalSIU {
  id: string;
  fecha: string;
  hora: string;
  nombre: string;
  asistenciaPresencial: number;
  visualizaciones: number;
  lugar: string;
  verificacion: string;
}

export interface AgendaCulturalSIU {
  tertulias: TertuliaSIU[];
  actividades: ActividadCulturalSIU[];
}

export interface ActividadFormacionSIU {
  id: string;
  tema: string;
  tipo: string;
  modalidad: 'Virtual' | 'Presencial' | 'Híbrida';
  participantes: number;
  fecha: string;
  facilitador: string;
}

export interface ResumenFormacionTipoSIU {
  id: string;
  tipo: string;
  cantidad: number;
  participantes: number;
}

export interface FormacionesUsuariosSIU {
  actividades: ActividadFormacionSIU[];
  resumenPorTipo: ResumenFormacionTipoSIU[];
}

export interface IngresoServicioSIU {
  id: string;
  area: string;
  servicio: string;
  precioUnitario: number;
  cantidadMes: number[]; // 12 meses
}

export interface EvacuacionSIU {
  id: string;
  fecha: string;
  tipo: string;
  participantes: number;
  tiempoMinutos: number;
  observaciones: string;
}

export interface ActividadSeguridadSIU {
  id: string;
  actividad: string;
  fecha: string;
  medio: string;
  descripcion: string;
}

export interface SeguridadSaludSIU {
  evacuaciones: EvacuacionSIU[];
  actividadesPersonal: ActividadSeguridadSIU[];
  actividadesUsuarios: ActividadSeguridadSIU[];
}

export interface DefinicionCatalogoSIU {
  id: string;
  categoria: string;
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface SIUData {
  cabecera: CabeceraSIU;
  controlReportes: ReporteControlSIU[];
  s21_formacion: FormacionPersonalSIU[];
  s22_planMejora: PlanMejoraCdASIU[];
  s23_recursosElectronicos: RecursoElectronicoSIU[];
  s24_visitasObras: VisitasObrasSIU;
  s25_portalRevistas: PortalRevistasSIU;
  s26_repositorioRIUCA: RepositorioRIUCASIU;
  s27_micelio: MicelioRepositorioSIU;
  s28_desarrolloColecciones: DesarrolloColeccionesSIU[];
  s29_acervosHistoricos: AcervoHistoricoSIU[];
  s210_catalogadoKoha: CatalogadoKohaSIU;
  s211_atom: AtomSIU;
  s212_propiedadIntelectual: PropiedadIntelectualSIU[];
  s213_comunicaciones: ComunicacionesSIU[];
  s214_agendaCultural: AgendaCulturalSIU;
  s215_formacionesUsuarios: FormacionesUsuariosSIU;
  s216_ingresosServicios: IngresoServicioSIU[];
  s217_seguridadSalud: SeguridadSaludSIU;
  s218_definiciones: DefinicionCatalogoSIU[];
}

// ==========================================
// REGISTRO GLOBAL POR AÑO
// ==========================================

export interface YearData {
  year: number;
  status: EstadoReporte;
  lastModified: string;
  modifiedBy: string;
  poa: POAData;
  siu: SIUData;
}

export interface ChangeLogEntry {
  id?: number;
  year: number;
  module: 'POA' | 'SIU' | 'AÑO';
  section: string;
  action: string;
  timestamp: string;
  user: string;
  detail?: string;
}
