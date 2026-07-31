import { useRef, useState } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024;

export function ImageUploader({ previewUrl, onFileSelected, onValidationError }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSelect = (file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      onValidationError('JPG 또는 PNG 이미지만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_SIZE) {
      onValidationError('이미지 용량은 5MB를 초과할 수 없습니다.');
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSelect(e.dataTransfer.files?.[0]);
  };

  return (
    <div
      className={`uploader ${isDragging ? 'uploader--dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        hidden
        onChange={(e) => validateAndSelect(e.target.files?.[0])}
      />
      {previewUrl ? (
        <img src={previewUrl} alt="냉장고 사진 미리보기" className="uploader__preview" />
      ) : (
        <p>냉장고 사진을 드래그하거나 클릭해서 업로드하세요 (JPG/PNG, 5MB 이하)</p>
      )}
    </div>
  );
}
