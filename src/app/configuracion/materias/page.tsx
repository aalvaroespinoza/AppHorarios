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
  X, 
  Check, 
  AlertTriangle,
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
    const name = subjectToDelete.name;
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
    <main className="min-h-[100dvh] bg-zinc-950 text-white font-sans max-w-lg mx-auto pb-16 transition-colors duration-300">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2"
          >
            <Check size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-zinc-950/90 backdrop-blur-md pt-12 pb-4 px-3 sticky top-0 z-10 flex items-center justify-between border-b border-zinc-900">
        <button 
          onClick={() => router.back()}
          className="text-blue-500 p-2 flex items-center gap-1 active:opacity-50"
        >
          <ChevronLeft size={28} className="-ml-2" />
          <span className="text-lg -ml-1">Volver</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            title="Restablecer materias por defecto"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 active:scale-95 transition-all"
          >
            <RotateCcw size={18} />
          </button>
          
          <motion.button
            whileTap={TAP_ANIMATION}
            onClick={handleOpenCreateModal}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus size={16} />
            <span>Nueva</span>
          </motion.button>
        </div>
      </header>

      <div className="px-4 pt-4">
        {/* Título & Resumen */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-zinc-400 mb-1">
            <GraduationCap size={20} className="text-blue-400" />
            <span className="text-xs uppercase tracking-wider font-semibold">Configuración Académica</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Gestor de Materias</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Administrá tus horarios de cursado, comisiones y aulas. Esta data alimenta automáticamente tus recomendaciones y el ContextEngine.
          </p>
        </div>

        {/* Barra de Filtros por Día */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-6 -mx-4 px-4">
          <button
            onClick={() => setSelectedDayFilter('todos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDayFilter === 'todos'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Todos ({subjects.length})
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <span>{d.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-800 text-blue-200' : 'bg-zinc-800 text-zinc-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Lista de Materias */}
        {filteredSubjects.length === 0 ? (
          <NativeCard className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-zinc-900/60 border-zinc-800">
            <div className="w-14 h-14 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="font-semibold text-zinc-200">No hay materias registradas</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {selectedDayFilter !== 'todos'
                  ? `No tenés materias cargadas para el día ${selectedDayFilter}.`
                  : 'Tocá "Nueva" para agregar tu primera materia.'}
              </p>
            </div>
            <motion.button
              whileTap={TAP_ANIMATION}
              onClick={handleOpenCreateModal}
              className="mt-2 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-xl hover:bg-blue-500/20 transition-colors"
            >
              + Agregar Materia
            </motion.button>
          </NativeCard>
        ) : (
          <div className="flex flex-col gap-3">
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
                  className="bg-zinc-900/80 border-zinc-800/90 hover:border-zinc-700/80 transition-all p-4 flex flex-col gap-3 relative overflow-hidden"
                >
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                          {block.day}
                        </span>
                        {subject.shift && (
                          <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md capitalize">
                            Turno {subject.shift}
                          </span>
                        )}
                        {subject.modality && (
                          <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md capitalize">
                            {subject.modality}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-zinc-100 leading-snug">
                        {info.nombre}
                      </h3>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(subject)}
                        title="Editar materia"
                        className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/40 active:scale-95 transition-all"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setSubjectToDelete(subject)}
                        title="Eliminar materia"
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 active:scale-95 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Detalles de Cursado: Horario, Curso, Aula y Edificio */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/60 text-xs text-zinc-300">
                    <div className="flex items-center gap-1.5 bg-zinc-950/50 p-2 rounded-xl border border-zinc-800/50">
                      <Clock size={14} className="text-zinc-400 shrink-0" />
                      <span className="font-medium">
                        {block.startTime} a {block.endTime} hs
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-zinc-950/50 p-2 rounded-xl border border-zinc-800/50">
                      <GraduationCap size={14} className="text-purple-400 shrink-0" />
                      <span className="font-medium truncate">
                        {info.curso && info.curso !== 'Consultar' ? `Curso ${info.curso}` : 'Sin curso'}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center justify-between bg-zinc-950/50 p-2 rounded-xl border border-zinc-800/50">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin size={14} className="text-emerald-400 shrink-0" />
                        <span className="font-medium">
                          {aula ? `Aula ${aula}` : 'Aula no asignada'}
                        </span>
                      </div>
                      {edificio && (
                        <span className="text-[11px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md truncate ml-2">
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
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={SPRING_CONFIG}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">
                      {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
                    </h2>
                    <span className="text-xs text-zinc-400">Completá los datos de cursado</span>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Formulario Reactivo */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Campo: Nombre */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Nombre de la Materia *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Análisis de Sistemas de Información"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Campo: Día */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Día de Cursada *
                  </label>
                  <select
                    value={formData.dia}
                    onChange={(e) => setFormData({ ...formData, dia: e.target.value as DayOfWeek })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors capitalize"
                  >
                    {DIAS_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campos: Horarios (Inicio y Fin) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Hora Inicio *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.horaInicio}
                      onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Hora Fin *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.horaFin}
                      onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Campos: Curso y Aula */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Curso
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 2K3"
                      value={formData.curso}
                      onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Aula
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 400"
                      value={formData.aula}
                      onChange={(e) => setFormData({ ...formData, aula: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Previsualización del Edificio */}
                {edificioPreview && (
                  <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
                    <Building2 size={16} className="shrink-0" />
                    <span>Ubicación detectada: <strong>{edificioPreview}</strong></span>
                  </div>
                )}

                {/* Botones de acción del Modal */}
                <div className="flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileTap={TAP_ANIMATION}
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Check size={16} />
                    <span>{editingSubject ? 'Guardar Cambios' : 'Crear Materia'}</span>
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
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={SPRING_CONFIG}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center flex flex-col items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                <AlertTriangle size={26} />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white">¿Eliminar materia?</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Vas a eliminar <strong className="text-zinc-200">"{parseMateriaInfo(subjectToDelete.name).nombre}"</strong> de tus horarios.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full pt-2">
                <button
                  type="button"
                  onClick={() => setSubjectToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
