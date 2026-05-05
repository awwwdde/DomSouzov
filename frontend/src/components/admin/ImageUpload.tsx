import { useState } from 'react';
import { adminApi } from '../../api/client';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = 'Изображение' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminApi.uploadImage(file);
      onChange(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка загрузки файла');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{label}</label>
      <div className="grid gap-3">
        {value && (
          <img src={value} alt="preview" className="h-44 w-full rounded-2xl object-cover" />
        )}
        <input
          className="min-h-11 w-full rounded-xl border border-line bg-white px-3 outline-none transition focus:border-ink"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL изображения или загрузите файл"
        />
        <label className="inline-flex min-h-10 w-fit cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-paper px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
          <Upload size={14} />
          {uploading ? 'Загрузка...' : 'ЗАГРУЗИТЬ ФАЙЛ'}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
      </div>
    </div>
  );
}
