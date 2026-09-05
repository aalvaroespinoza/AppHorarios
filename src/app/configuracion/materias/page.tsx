"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  Clock, 
  MapPin, 
  Building2, 
  RotateCcw, 
  BookOpen, 
  Check, 
  GraduationCap
} from 'lucide-react';
import NativeCard from '@/core/components/ui/NativeCard';
import { useSubjects, SubjectFormData, subjectToFormData } from '@/hooks/useSubjects';
import { Subject } from '@/types/subject';
import { DayOfWeek } from '@/core/types/common';
import { parseMateriaInfo, getEdificioByAula } from '@/core/utils/edificio';
import { SPRING_CONFIG, TAP_ANIMATION } from '@/lib/animations';

const DIAS_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
];

const INITIAL_FORM: SubjectFormData = {
  nombre: '',
  dia: 'lunes',
  horaInicio: '08:00',
  horaFin: '11:10',
  curso: '',
  aula: '',
};

export default function GestorMateriasPage() {
  const router = useRouter();
  const { 
    subjects, 
    loading, 
    isMounted, 
    addSubject, 
    updateSubject, 
    deleteSubject, 
    resetToDefaults 
  } = useSubjects();

  // Estados de interfaz y filtrado
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>(INITIAL_FORM);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingSubject(null);
    setFormData({
      ...INITIAL_FORM,
      dia: (selectedDayFilter !== 'todos' ? selectedDayFilter : 'lunes') as DayOfWeek
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData(subjectToFormData(subject));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setFormData(INITIAL_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    if (editingSubject) {
      await updateSubject(editingSubject.id, formData);
      showToast(`Materia "${formData.nombre}" actualizada`);
    } else {
      await addSubject(formData);
      showToast(`Materia "${formData.nombre}" agregada`);
    }

    handleCloseModal();
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    await deleteSubject(subjectToDelete.id);
    setSubjectToDelete(null);
    showToast(`Materia eliminada`);
  };

  const handleReset = async () => {
    if (window.confirm('¿Seguro que querés restablecer las materias por defecto? Se perderán las modificaciones personalizadas.')) {
      await resetToDefaults();
      showToast('Materias restablecidas a valores iniciales');
    }
  };

  // Filtrado de materias según día seleccionado
  const filteredSubjects = subjects.filter((subject) => {
    if (selectedDayFilter === 'todos') return true;
    return subject.classBlocks.some(
      (b) => b.day.toLowerCase() === selectedDayFilter.toLowerCase()
    );
  });

  if (!isMounted || loading) {
    return <div className="min-h-[100dvh] bg-zinc-950" />;
  }

  // Previsualización de edificio según aula ingresada en modal
  const aulaParsedNum = parseInt(formData.aula, 10);
  const edificioPreview = !isNaN(aulaParsedNum) ? getEdificioByAula(aulaParsedNum) : null;

  return (
    <main className="min-h-[100dvh] bg-[#0A0A0C] text-[#F4F4F6] font-sans max-w-md mx-auto pb-24">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-acid-green text-black px-3.5 py-1.5 rounded-sm border border-acid-green shadow-none font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Check size={14} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Sticky */}
      <header className="bg-[#0A0A0C]/95 backdrop-blur-md pt-8 pb-3 px-4 sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 shadow-none">
        <button 
          onClick={() => router.back()}
          className="text-safety-orange font-mono text-xs uppercase tracking-wider p-1 flex items-center gap-1 active:opacity-60 transition-opacity cursor-pointer"
        >
          <ChevronLeft size={16} className="-ml-1" />
          <span>VOLVER</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            title="Restablecer materias por defecto"
            className="p-1.5 rounded-sm text-zinc-400 hover:text-safety-orange bg-zinc-900 border border-zinc-800 hover:border-zinc-700 active:translate-y-[0.5px] transition-all cursor-pointer shadow-none"
          >
            <RotateCcw size={15} />
          </button>
          
          <motion.button
            whileTap={TAP_ANIMATION}
            onClick={handleOpenCreateModal}
            className="bg-safety-orange hover:bg-[#ff681a] text-black px-3 py-1.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-none cursor-pointer transition-all border border-safety-orange active:translate-y-[0.5px]"
          >
            <Plus size={14} />
            <span>NUEVA</span>
          </motion.button>
        </div>
      </header>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Título & Resumen */}
        <div>
          <span className="text-[10px] font-mono font-bold text-safety-orange tracking-[0.2em] uppercase block mb-0.5">
            SYS.DATABASE // MATERIAS
          </span>
          <h1 className="text-2xl font-mono font-black tracking-tight text-zinc-100 uppercase">
            GESTOR DE AULAS
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            CONFIGURACIÓN ACADÉMICA Y TELEMETRÍA DE CURSADO.
          </p>
        </div>

        {/* Barra de Filtros por Día */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 font-mono">
          <button
            onClick={() => setSelectedDayFilter('todos')}
            className={`px-3 py-1 rounded-sm text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors border select-none cursor-pointer ${
              selectedDayFilter === 'todos'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-bold shadow-none'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
            }`}
          >
            TODOS ({subjects.length})
          </button>
          {DIAS_OPTIONS.map((d) => {
            const count = subjects.filter((s) =>
              s.classBlocks.some((b) => b.day === d.value)
            ).length;
            const isSelected = selectedDayFilter === d.value;
            return (
              <button
                key={d.value}
                onClick={() => setSelectedDayFilter(d.value)}
                className={`px-3 py-1 rounded-sm text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-1.5 border select-none cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 text-safety-orange border-safety-orange/60 font-bold shadow-none'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <span>{d.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1 py-0.5 rounded-sm font-mono ${isSelected ? 'bg-safety-orange/20 text-safety-orange border border-safety-orange/40' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Lista de Materias */}
        {filteredSubjects.length === 0 ? (
          <NativeCard className="flex flex-col items-center justify-center py-10 text-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-sm shadow-none">
            <div className="w-10 h-10 rounded-sm bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <BookOpen size={18} />
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">[SIN REGISTROS ACADÉMICOS]</p>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                {selectedDayFilter !== 'todos'
                  ? `No hay materias cargadas para el día ${selectedDayFilter}.`
                  : 'Presioná "+ NUEVA" para ingresar una materia.'}
              </p>
            </div>
            <motion.button
              whileTap={TAP_ANIMATION}
              onClick={handleOpenCreateModal}
              className="mt-1 text-xs font-mono font-bold uppercase tracking-wider text-safety-orange bg-safety-orange/10 border border-safety-orange/40 px-3.5 py-1.5 rounded-sm hover:bg-safety-orange/20 transition-colors cursor-pointer"
            >
              + REGISTRAR MATERIA
            </motion.button>
          </NativeCard>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredSubjects.map((subject) => {
              const info = parseMateriaInfo(subject.name);
              const block = subject.classBlocks[0] || {
                day: 'lunes',
                startTime: '08:00',
                endTime: '11:10',
                classroom: 'N/A'
              };
              const aula = block.classroom || (info.aula !== 'N/A' ? info.aula : '');
              const aulaNum = parseInt(aula, 10);
              const edificio = !isNaN(aulaNum) && aulaNum > 0 ? getEdificioByAula(aulaNum) : (info.edificio !== 'N/A' ? info.edificio : '');

              return (
                <NativeCard 
                  key={subject.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors p-3.5 flex flex-col gap-2.5 rounded-sm shadow-none overflow-hidden"
                >
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-safety-orange bg-safety-orange/10 border border-safety-orange/40 px-1.5 py-0.5 rounded-sm">
                          {block.day}
                        </span>
                        {subject.shift && (
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            TURNO {subject.shift}
                          </span>
                        )}
                        {subject.modality && (
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            {subject.modality}
                          </span>
                        )}
                      </div>

                      <h3 className="font-mono font-bold text-sm sm:text-base text-zinc-100 uppercase tracking-tight leading-snug">
                        {info.nombre}
                      </h3>
                    </div>

                    {/* Botones mecánicos de acción */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(subject)}
                        title="Editar materia"
                        className="w-7 h-7 rounded-sm bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center transition-all cursor-pointer active:translate-y-[0.5px]"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setSubjectToDelete(subject)}
                        title="Eliminar materia"
                        className="w-7 h-7 rounded-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 flex items-center justify-center transition-all cursor-pointer active:translate-y-[0.5px]"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Detalles de Cursado Técnico */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-xs font-mono">
                    <div className="flex items-center gap-1.5 bg-zinc-950 p-2 rounded-sm border border-zinc-800 text-zinc-300">
                      <Clock size={12} className="text-zinc-500 shrink-0" />
                      <span className="font-semibold text-zinc-200">
                        {block.startTime} a {block.endTime} HS
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-zinc-950 p-2 rounded-sm border border-zinc-800 text-zinc-300">
                      <GraduationCap size={12} className="text-safety-orange shrink-0" />
                      <span className="font-semibold text-zinc-200 truncate">
                        {info.curso && info.curso !== 'Consultar' ? `CURSO ${info.curso}` : 'SIN CURSO'}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center justify-between bg-zinc-950 p-2 rounded-sm border border-zinc-800 text-zinc-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin size={12} className="text-acid-green shrink-0" />
                        <span className="font-bold text-acid-green uppercase">
                          {aula ? `AULA ${aula}` : 'AULA NO ASIGNADA'}
                        </span>
                      </div>
                      {edificio && (
                        <span className="text-[10px] font-mono text-safety-orange bg-safety-orange/10 border border-safety-orange/40 px-1.5 py-0.5 rounded-sm uppercase tracking-wide truncate ml-2">
                          📍 {edificio}
                        </span>
                      )}
                    </div>
                  </div>
                </NativeCard>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Crear / Editar Materia */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={SPRING_CONFIG}
              className="bg-zinc-900 border border-zinc-700 rounded-sm w-full max-w-md p-5 shadow-none relative max-h-[90vh] overflow-y-auto no-scrollbar font-mono text-zinc-100"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-safety-orange uppercase tracking-widest block">
                    SYS.INPUT // {editingSubject ? 'EDITAR REGISTRO' : 'NUEVO REGISTRO'}
                  </span>
                  <h2 className="text-base font-mono font-bold text-zinc-100 leading-tight uppercase mt-0.5">
                    {editingSubject ? 'Modificar Materia' : 'Ingresar Materia'}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-6 h-6 rounded-sm bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center font-mono text-xs cursor-pointer active:translate-y-[0.5px]"
                >
                  ✕
                </button>
              </div>

              {/* Formulario Reactivo */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                {/* Campo: Nombre */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
                    NOMBRE DE LA MATERIA *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Análisis de Sistemas"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-safety-orange transition-colors"
                  />
                </div>

                {/* Campo: Día */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
                    DÍA DE CURSADA *
                  </label>
                  <select
                    value={formData.dia}
                    onChange={(e) => setFormData({ ...formData, dia: e.target.value as DayOfWeek })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-safety-orange transition-colors capitalize"
                  >
                    {DIAS_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campos: Horarios (Inicio y Fin) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
                      HORA INICIO *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.horaInicio}
                      onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-safety-orange transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
                      HORA FIN *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.horaFin}
                      onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-safety-orange transition-colors"
                    />
                  </div>
                </div>

                {/* Campos: Curso y Aula */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
                      CURSO / COMISIÓN
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 2K3"
                      value={formData.curso}
                      onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-safety-orange transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
                      AULA
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 400"
                      value={formData.aula}
                      onChange={(e) => setFormData({ ...formData, aula: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-safety-orange transition-colors"
                    />
                  </div>
                </div>

                {/* Previsualización del Edificio */}
                {edificioPreview && (
                  <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-sm flex items-center gap-2 text-xs font-mono text-acid-green">
                    <Building2 size={14} className="shrink-0" />
                    <span>EDIFICIO DETECTADO: <strong className="text-zinc-100">{edificioPreview.toUpperCase()}</strong></span>
                  </div>
                )}

                {/* Botones de acción del Modal */}
                <div className="flex items-center justify-end gap-2 pt-3 mt-1 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-3.5 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-100 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                  >
                    CANCELAR
                  </button>
                  <motion.button
                    whileTap={TAP_ANIMATION}
                    type="submit"
                    className="bg-safety-orange hover:bg-[#ff681a] text-black border border-safety-orange px-4 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider shadow-none flex items-center gap-1.5 transition-colors cursor-pointer active:translate-y-[0.5px]"
                  >
                    <Check size={14} />
                    <span>{editingSubject ? 'GUARDAR' : 'REGISTRAR'}</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Confirmación de Eliminación */}
      <AnimatePresence>
        {subjectToDelete && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={SPRING_CONFIG}
              className="bg-zinc-900 border border-zinc-700 rounded-sm w-full max-w-sm p-5 shadow-none text-center flex flex-col items-center gap-3 font-mono text-zinc-100"
            >
              <div className="w-10 h-10 rounded-sm bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/30 text-sm font-bold">
                [!]
              </div>
              
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">
                  SYS.CONFIRM // ELIMINAR
                </span>
                <h3 className="text-base font-bold text-zinc-100 uppercase tracking-tight">¿CONFIRMAR ELIMINACIÓN?</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Se removerá <strong className="text-zinc-200">&quot;{parseMateriaInfo(subjectToDelete.name).nombre}&quot;</strong> del sistema de cursado.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full pt-2">
                <button
                  type="button"
                  onClick={() => setSubjectToDelete(null)}
                  className="flex-1 py-2 rounded-sm text-xs font-mono uppercase tracking-wider bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 transition-colors cursor-pointer"
                >
                  ELIMINAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
