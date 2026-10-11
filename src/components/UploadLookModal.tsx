import React, { useRef, useState } from 'react';
import { SALONS_DATA } from '../data/mockData';

interface UploadLookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadLook: (newLook: {
    imageUrl: string;
    caption: string;
    salonName: string;
    salonId: string;
    treatment: string;
    rating: number;
  }) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const UploadLookModal: React.FC<UploadLookModalProps> = ({
  isOpen,
  onClose,
  onUploadLook,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  /** Lee la imagen elegida y la reduce (máx. 1600 px) para no cargar la memoria. */
  const loadImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Elegí un archivo de imagen (JPG, PNG, HEIC…)', 'error');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      onShowToast('La foto pesa demasiado (máx. 25 MB)', 'error');
      return;
    }
    setIsProcessing(true);
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      setSelectedPhoto(canvas.toDataURL('image/jpeg', 0.85));
      URL.revokeObjectURL(objectUrl);
      setIsProcessing(false);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setIsProcessing(false);
      onShowToast('No pudimos abrir esa foto. Probá con otra.', 'error');
    };
    img.src = objectUrl;
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) loadImage(file);
  };

  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [caption, setCaption] = useState('');
  const [salonId, setSalonId] = useState('maison-hair-co');
  const [treatment, setTreatment] = useState('');
  const [rating, setRating] = useState(5);

  if (!isOpen) return null;

  const resetForm = () => {
    setSelectedPhoto('');
    setCaption('');
    setTreatment('');
    setRating(5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhoto) {
      onShowToast('Primero elegí una foto', 'add_a_photo');
      return;
    }
    const salon = SALONS_DATA[salonId] || SALONS_DATA['maison-hair-co'];
    onUploadLook({
      imageUrl: selectedPhoto,
      caption,
      salonName: salon.name,
      salonId: salon.id,
      treatment,
      rating,
    });
    onShowToast('¡Look subido con éxito a tu perfil!', 'add_a_photo');
    resetForm();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Subir look de belleza"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FFFFFF] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4 border-t border-[#F1F1F1] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-[#8A8A8A]/30 mx-auto" />

        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#111111] text-[22px]">
              photo_camera
            </span>
            <h3 className="text-base font-semibold text-[#111111]">Subir un look</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FDE7EE] flex items-center justify-center text-[#B82E5F] hover:text-[#111111]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Foto: galería / carrete en el celular, explorador de archivos en la compu */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#6B6B6B]">Foto</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
            {selectedPhoto ? (
              <div className="relative rounded-2xl overflow-hidden bg-[#F1F1F1]">
                <img src={selectedPhoto} alt="Vista previa" className="w-full max-h-72 object-cover" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 h-9 px-4 rounded-full bg-white/95 text-[#111111] text-xs font-semibold shadow-md hover:bg-white"
                >
                  Cambiar foto
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
                className={`w-full h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
                  isDragging
                    ? 'border-[#B82E5F] bg-[#FDE7EE]'
                    : 'border-[#D9D9D9] bg-[#F7F7F7] hover:border-[#B82E5F]'
                }`}
              >
                <span className="material-symbols-outlined text-[32px] text-[#111111]">
                  {isProcessing ? 'hourglass_top' : 'add_photo_alternate'}
                </span>
                <span className="text-sm font-semibold text-[#111111]">
                  {isProcessing ? 'Procesando…' : 'Elegir una foto'}
                </span>
                <span className="text-xs text-[#6B6B6B] px-6 text-center">
                  <span className="sm:hidden">Abrí tu galería o sacá una foto</span>
                  <span className="hidden sm:inline">
                    Buscala en tus archivos o arrastrala hasta acá
                  </span>
                </span>
              </button>
            )}
          </div>

          {/* Salón de atención */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111111]">Salón o Profesional</label>
            <select
              value={salonId}
              onChange={(e) => setSalonId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-[#D9D9D9] text-xs text-[#111111] outline-none"
            >
              {Object.values(SALONS_DATA).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.neighborhood})
                </option>
              ))}
            </select>
          </div>

          {/* Tratamiento */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111111]">Tratamiento realizado</label>
            <input
              type="text"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Ej: Balayage, Kapping Gel..."
              className="w-full p-2.5 rounded-xl bg-white border border-[#D9D9D9] text-xs text-[#111111] outline-none"
              required
            />
          </div>

          {/* Calificación */}
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#D9D9D9]">
            <span className="text-xs font-semibold text-[#111111]">Tu valoración:</span>
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Comentario / Experiencia */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111111]">Comentario o tips de cuidado</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-xl bg-white border border-[#D9D9D9] text-xs text-[#111111] outline-none"
              placeholder="Contale a la comunidad cómo quedó..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={!selectedPhoto}
            className="w-full h-11 rounded-lg bg-[#FDE7EE] text-[#B82E5F] font-semibold text-sm mt-1 hover:bg-[#FBD5E2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Publicar
          </button>
        </form>
      </div>
    </div>
  );
};
