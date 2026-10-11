import React, { useState } from 'react';

interface FilterOptions {
  category: string;
  maxDistance: string;
  availability: string;
  minRating: number;
  maxPrice: number;
}

interface FilterSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
}

export const FilterSheetModal: React.FC<FilterSheetModalProps> = ({
  isOpen,
  onClose,
  currentFilters,
  onApplyFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  if (!isOpen) return null;

  const categories = [
    'Todas',
    'Uñas',
    'Pelo & Color',
    'Cejas & Pestañas',
    'Maquillaje',
    'Estética Facial',
    'Botox & Armonización',
  ];
  const distances = ['< 1 km', '< 5 km', '< 20 km', 'Todo Montevideo'];
  const availabilities = ['Cualquiera', 'Hoy', 'Mañana', 'Esta semana'];
  const ratings = [4.5, 4.8, 4.9];

  const handleReset = () => {
    const resetValues: FilterOptions = {
      category: 'Todas',
      maxDistance: 'Todo Montevideo',
      availability: 'Cualquiera',
      minRating: 4.8,
      maxPrice: 30000,
    };
    setFilters(resetValues);
    onApplyFilters(resetValues);
    onClose();
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#FFFFFF] rounded-t-3xl p-5 shadow-2xl flex flex-col gap-4 border-t border-[#F1F1F1] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-[#8A8A8A]/30 mx-auto" />

        <div className="flex items-center justify-between pb-1">
          <h3 className="text-lg font-bold text-[#111111]">Filtros de Búsqueda</h3>
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-[#111111] hover:underline"
          >
            Restablecer
          </button>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
            Categoría de Belleza
          </span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilters({ ...filters, category: cat })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filters.category === cat
                    ? 'bg-[#FDE7EE] text-[#B82E5F] shadow-xs'
                    : 'bg-white text-[#444444] border border-[#D9D9D9]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Distance */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
            Distancia máxima
          </span>
          <div className="grid grid-cols-2 gap-2">
            {distances.map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => setFilters({ ...filters, maxDistance: dist })}
                className={`py-2 px-3 rounded-xl text-xs font-medium text-center border transition-all ${
                  filters.maxDistance === dist
                    ? 'bg-[#FDE7EE] border-[#B82E5F] text-[#B82E5F] font-bold'
                    : 'bg-white border-[#D9D9D9] text-[#444444]'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
            Disponibilidad de Turno
          </span>
          <div className="grid grid-cols-2 gap-2">
            {availabilities.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setFilters({ ...filters, availability: av })}
                className={`py-2 px-3 rounded-xl text-xs font-medium text-center border transition-all ${
                  filters.availability === av
                    ? 'bg-[#FDE7EE] border-[#B82E5F] text-[#B82E5F] font-bold'
                    : 'bg-white border-[#D9D9D9] text-[#444444]'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
            Calificación Mínima
          </span>
          <div className="flex gap-2">
            {ratings.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setFilters({ ...filters, minRating: rate })}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                  filters.minRating === rate
                    ? 'bg-[#FDE7EE] text-[#B82E5F] border-[#B82E5F]'
                    : 'bg-white border-[#D9D9D9] text-[#444444]'
                }`}
              >
                <span>{rate}★</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleApply}
          className="w-full py-3.5 rounded-full bg-[#FDE7EE] hover:bg-[#FBD5E2] text-[#B82E5F] font-bold text-sm shadow-md mt-2 active:scale-98 transition-transform"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  );
};
