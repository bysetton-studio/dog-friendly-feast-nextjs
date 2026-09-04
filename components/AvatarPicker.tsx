'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';

interface Props {
  image: string | null;
}

function resizeToSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const SIZE = 200;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d')!;

      // Center-crop to square
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/jpeg',
        0.8
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function AvatarPicker({ image }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(image);
  const [error, setError] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(false);
    try {
      const resized = await resizeToSquare(file);
      const localUrl = URL.createObjectURL(resized);
      setPreview(localUrl);

      const fd = new FormData();
      fd.append('file', resized, 'avatar.jpg');

      const res = await fetch('/api/avatar', { method: 'POST', body: fd });
      if (!res.ok) {
        setPreview(image);
        setError(true);
        throw new Error('Upload failed');
      }

      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="kennel__avatar-outer">
      <div className="kennel__avatar-wrapper">
        <div className="kennel__avatar">
          {preview ? (
            <img src={preview} alt="avatar" className="kennel__avatar-img" />
          ) : (
            '🐶'
          )}
        </div>

        <button
          className="kennel__avatar-camera"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Change avatar"
        >
          <Camera size={14} strokeWidth={2.5} />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      {error && (
        <p className="kennel__avatar-error">Image unable to load, please try again later</p>
      )}
    </div>
  );
}
