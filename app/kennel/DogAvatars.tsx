'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, X } from 'lucide-react';
import { resizeToSquare } from '@/lib/resizeToSquare';

interface Dog {
  id: string;
  image: string | null;
}

interface Props {
  initial: Dog[];
}

const MAX_DOGS  = 5;
const DOG_SIZE  = 84;
const CENTER_X  = 140;  // horizontal center of the 280px area
const CENTER_Y  = 145;  // center of the main avatar (padding-top 90 + avatar radius 60)
const ARC_R     = 110;  // distance from main avatar center to dog center
const GAP       = -10;   // fixed pixel gap between adjacent dog circles
// Angle between adjacent dogs so their edges are always GAP apart
const STEP_DEG  = (2 * Math.asin((DOG_SIZE + GAP) / (2 * ARC_R))) * (180 / Math.PI);

const ADD_BUTTON_OFFSET = 25; // extra degrees away from the last dog

// index 0 = leftmost, arc centered at 90° (top)
function arcPosition(index: number, total: number, extraOffset = 0): React.CSSProperties {
  const deg = 90 + ((total - 1) / 2 - index) * STEP_DEG - extraOffset;
  const rad = (deg * Math.PI) / 180;
  // Round to 2 decimal places so SSR-serialized HTML and client values agree.
  const r = (n: number) => Math.round(n * 100) / 100;
  return {
    left: r(CENTER_X + ARC_R * Math.cos(rad) - DOG_SIZE / 2),
    top:  r(CENTER_Y - ARC_R * Math.sin(rad) - DOG_SIZE / 2),
  };
}


export default function DogAvatars({ initial }: Props) {
  const router = useRouter();
  const [dogs, setDogs] = useState<Dog[]>(initial);
  const [uploading, setUploading] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingDogId = useRef<string | null>(null);

  const canAdd = dogs.length < MAX_DOGS;

  async function handleAdd() {
    if (!canAdd) return;
    const res = await fetch('/api/dogs', { method: 'POST' });
    if (!res.ok) return;
    const dog: Dog = await res.json();
    setDogs((prev) => [...prev, dog]);
    pendingDogId.current = dog.id;
    inputRef.current?.click();
  }

  function handleChangeImage(dogId: string) {
    pendingDogId.current = dogId;
    inputRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    const dogId = pendingDogId.current;
    if (!file || !dogId) return;

    setUploading(dogId);
    try {
      const resized = await resizeToSquare(file);
      const preview = URL.createObjectURL(resized);
      setDogs((prev) => prev.map((d) => d.id === dogId ? { ...d, image: preview } : d));

      const fd = new FormData();
      fd.append('file', resized, 'avatar.jpg');
      const res = await fetch(`/api/dogs/${dogId}/avatar`, { method: 'POST', body: fd });

      if (res.ok) {
        const { url } = await res.json();
        setDogs((prev) => prev.map((d) => d.id === dogId ? { ...d, image: url } : d));
        router.refresh();
      } else {
        setDogs((prev) => prev.map((d) => d.id === dogId ? { ...d, image: null } : d));
      }
    } catch {
      setDogs((prev) => prev.map((d) => d.id === dogId ? { ...d, image: null } : d));
    } finally {
      setUploading(null);
      pendingDogId.current = null;
    }
  }

  async function handleConfirmRemove() {
    if (!confirmDeleteId) return;
    setDeleting(true);
    await fetch(`/api/dogs/${confirmDeleteId}`, { method: 'DELETE' });
    setDogs((prev) => prev.filter((d) => d.id !== confirmDeleteId));
    router.refresh();
    setConfirmDeleteId(null);
    setDeleting(false);
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {dogs.map((dog, i) => (
        <div
          key={dog.id}
          className="absolute pointer-events-auto group/dog"
          style={{ ...arcPosition(i, dogs.length), zIndex: dogs.length - i }}
        >
          <div className="w-21 h-21 rounded-full bg-[rgb(30,30,30)] border-3 border-black flex items-center justify-center overflow-hidden relative">
            {dog.image
              ? <img src={dog.image} alt="dog" className="w-full h-full object-cover" />
              : <span className="text-[28px]">🐶</span>
            }
            {uploading === dog.id && <div className="absolute inset-0 bg-black/45 rounded-full" />}
          </div>

          <button
            className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full border border-white/12 bg-surface/92 text-fg-muted flex items-center justify-center cursor-pointer p-0 opacity-0 group-hover/dog:opacity-100 transition-[opacity,background,color] duration-150 hover:enabled:bg-surface-hover/95 hover:enabled:text-fg disabled:opacity-30 disabled:cursor-default"
            onClick={() => handleChangeImage(dog.id)}
            disabled={uploading !== null}
            aria-label="Change dog photo"
          >
            <Camera size={10} strokeWidth={2.5} />
          </button>

          <button
            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full border border-white/12 bg-surface/92 text-fg-muted flex items-center justify-center cursor-pointer p-0 opacity-0 group-hover/dog:opacity-100 transition-[opacity,background,color] duration-150 hover:enabled:bg-[rgba(255,125,125,0.9)] hover:enabled:text-unfriendly-dark hover:enabled:border-unfriendly-vivid/30 disabled:opacity-30 disabled:cursor-default"
            onClick={() => setConfirmDeleteId(dog.id)}
            disabled={uploading !== null}
            aria-label="Remove dog"
          >
            <X size={10} strokeWidth={2.5} />
          </button>
        </div>
      ))}

      {canAdd && (
        <button
          className="absolute pointer-events-auto w-16 h-16 rounded-full border-2 border-dashed bg-no-repeat bg-transparent text-fg-muted hidden group-hover/avatar-area:flex items-center justify-center text-center text-[10px] font-[Arial,sans-serif] leading-[1.2] p-2 cursor-pointer transition-[left,top,color,background,opacity] duration-150 opacity-0 group-hover/avatar-area:opacity-100 hover:bg-white/4 hover:text-fg"
          style={arcPosition(dogs.length, dogs.length + 1, ADD_BUTTON_OFFSET)}
          onClick={handleAdd}
          aria-label="Add dog"
        >
          {dogs.length === 0 ? 'add your pup' : 'add another pup'}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-100 pointer-events-auto" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-surface/98 border border-white/10 rounded-[14px] pt-7 px-6 pb-6 w-full max-w-80 font-[Arial,sans-serif]" onClick={(e) => e.stopPropagation()}>
            <p className="text-[15px] text-fg mt-0 mb-6 text-center">Remove this pup?</p>
            <div className="flex gap-2.5">
              <button className="flex-1 py-2.5 rounded-lg text-[14px] font-[Arial,sans-serif] cursor-pointer transition-[background] duration-150 bg-transparent border border-white/10 text-fg-muted hover:text-fg hover:border-white/25" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </button>
              <button className="flex-1 py-2.5 rounded-lg text-[14px] font-[Arial,sans-serif] cursor-pointer transition-[background] duration-150 bg-unfriendly-vivid/15 border border-unfriendly-vivid/30 text-unfriendly hover:enabled:bg-unfriendly-vivid/25 disabled:opacity-50 disabled:cursor-default" onClick={handleConfirmRemove} disabled={deleting}>
                {deleting ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
