'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import { resizeToSquare } from '@/lib/resizeToSquare';

interface Props {
  image: string | null;
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
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex">
        <div className="text-[48px] rounded-full border border-[rgb(30,30,30)] bg-[rgb(30,30,30)] w-42 h-42 flex items-center justify-center overflow-hidden">
          {preview ? (
            <img src={preview} alt="avatar" className="w-full h-full object-cover rounded-full" />
          ) : (
            '🐶'
          )}
        </div>

        <button
          className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[rgba(30,30,30,0.9)] border border-white/15 text-[#9aa0a6] flex items-center justify-center cursor-pointer transition-[background,color] duration-150 p-0 hover:enabled:bg-[rgba(50,50,50,0.95)] hover:enabled:text-[#e0e0e0] disabled:opacity-50 disabled:cursor-default"
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
        <p className="text-[12px] text-[#f28b82] font-[Arial,sans-serif] text-center">Image unable to load, please try again later</p>
      )}
    </div>
  );
}
