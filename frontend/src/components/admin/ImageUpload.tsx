import { useState } from 'react';
import { adminApi } from '../../api/client';

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
    } catch {
      alert('Ошибка загрузки файла');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-form-group">
      <label>{label}</label>
      <div className="admin-image-upload">
        {value && (
          <img src={value} alt="preview" className="admin-image-preview" />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL изображения или загрузите файл"
          style={{ width: '100%' }}
        />
        <label className="btn" style={{ cursor: 'pointer' }}>
          {uploading ? 'Загрузка...' : '↑ ЗАГРУЗИТЬ ФАЙЛ'}
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
}
