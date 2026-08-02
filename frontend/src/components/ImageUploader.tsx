import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import { uploadImageApi } from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';
import { SafeImage } from './SafeImage';

interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  currentImage?: string;
  onImageUploaded?: (url: string) => void;
  folder?: 'products' | 'categories' | 'collections' | 'avatars' | 'banners';
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  currentImage,
  onImageUploaded,
  folder = 'products',
  label
}) => {
  const actualValue = value !== undefined ? value : (currentImage || '');
  const handleImageChange = (url: string) => {
    if (onChange) onChange(url);
    if (onImageUploaded) onImageUploaded(url);
  };
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setError('');
    setUploading(true);

    try {
      const uploadedUrl = await uploadImageApi(file, folder);
      handleImageChange(uploadedUrl);
    } catch (err: any) {
      const msg = err.response?.data?.message || t('فشل تحميل الصورة', 'Image upload failed');
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1.5 text-xs">
      {label && <label className="block text-muted font-semibold">{label}</label>}

      {actualValue ? (
        /* Uploaded Image Preview */
        <div className="relative glass-panel rounded-2xl p-3 border border-outline-variant/30 flex items-center justify-between gap-4 group">
          <div className="flex items-center gap-3 truncate">
            <SafeImage
              src={actualValue}
              alt="Preview"
              className="w-14 h-14 object-cover rounded-xl bg-secondary-bg shrink-0 border border-primary/20"
            />
            <div className="truncate">
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t('تم رفع الصورة', 'Uploaded')}</span>
              </span>
              <span className="text-[10px] text-muted truncate block mt-0.5 font-mono">
                {actualValue}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleImageChange('')}
            className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
            title={t('حذف الصورة', 'Remove image')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Drag & Drop Upload Zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
            dragOver ? 'border-primary bg-primary/10 scale-102' : 'border-outline-variant/30 bg-secondary-bg/40 hover:border-primary/60 hover:bg-secondary-bg/80'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-2 text-primary">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <span className="font-bold">{t('جاري رفع الصورة إلى الخادم...', 'Uploading image to server...')}</span>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-on-surface block">
                  {t('اضغط هنا لاختيار صورة أو اسحب الصورة هنا', 'Click to upload or drag & drop image')}
                </span>
                <span className="text-[10px] text-muted block">
                  {t('PNG, JPG, WEBP, GIF (الحد الأقصى: 5MB)', 'PNG, JPG, WEBP, GIF (Max: 5MB)')}
                </span>
              </div>
            </>
          )}

          {error && (
            <span className="text-[11px] text-red-400 font-bold block pt-1">{error}</span>
          )}
        </div>
      )}
    </div>
  );
};
