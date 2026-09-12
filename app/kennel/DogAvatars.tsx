'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, X } from 'lucide-react';
import { resizeToSquare } from '@/lib/resizeToSquare';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';

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
const NEW_DOG_SENTINEL = 'new';

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
  const [activeDogId, setActiveDogId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingDogId = useRef<string | null>(null);
  const dogElemsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!activeDogId) return;
    function handleClickOutside(e: MouseEvent) {
      const el = dogElemsRef.current.get(activeDogId!);
      if (el && !el.contains(e.target as Node)) {
        setActiveDogId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as EventListener);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, [activeDogId]);

  const canAdd = dogs.length < MAX_DOGS;

  async function handleAdd() {
    if (!canAdd) return;
    pendingDogId.current = NEW_DOG_SENTINEL;
    inputRef.current?.click();
  }

  function handleChangeImage(dogId: string) {
    pendingDogId.current = dogId;
    inputRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    const pending = pendingDogId.current;
    if (!file || !pending) return;

    let dogId: string;
    if (pending === NEW_DOG_SENTINEL) {
      const res = await fetch('/api/dogs', { method: 'POST' });
      if (!res.ok) { pendingDogId.current = null; return; }
      const dog: Dog = await res.json();
      dogId = dog.id;
      setDogs((prev) => [...prev, { id: dogId, image: null }]);
      pendingDogId.current = dogId;
    } else {
      dogId = pending;
    }

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
          ref={(el) => { if (el) dogElemsRef.current.set(dog.id, el); else dogElemsRef.current.delete(dog.id); }}
          className="absolute pointer-events-auto group/dog"
          style={{ ...arcPosition(i, dogs.length), zIndex: dogs.length - i }}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            setActiveDogId(prev => prev === dog.id ? null : dog.id);
          }}
        >
          <div className=" w-21 h-21 rounded-full border-6 [border-style:ridge] border-btn-base-from flex items-center justify-center overflow-hidden relative">
            {dog.image
              ? <img src={dog.image} alt="dog" className="w-full h-full object-cover" />
              : <span className="text-[28px]">🐶</span>
            }
            {uploading === dog.id && <div className="absolute inset-0 bg-black/45 rounded-full" />}
          </div>

          <IconButton
            className={`absolute bottom-0.5 right-0.5 w-5! h-5! transition-opacity duration-150 ${activeDogId === dog.id ? 'opacity-100' : 'opacity-0 group-hover/dog:opacity-100'}`}
            onClick={() => { handleChangeImage(dog.id); setActiveDogId(null); }}
            disabled={uploading !== null}
            aria-label="Change dog photo"
          >
            <Camera size={10} strokeWidth={2.5} />
          </IconButton>

          <IconButton
            intent="alert"
            className={`absolute top-0.5 right-0.5 w-5! h-5! transition-opacity duration-150 ${activeDogId === dog.id ? 'opacity-100' : 'opacity-0 group-hover/dog:opacity-100'}`}
            onClick={() => { setConfirmDeleteId(dog.id); setActiveDogId(null); }}
            disabled={uploading !== null}
            aria-label="Remove dog"
          >
            <X size={10} strokeWidth={2.5} />
          </IconButton>
        </div>
      ))}

      {canAdd && (
        <IconButton
          className="absolute pointer-events-auto w-10 h-10 sm:w-16! sm:h-16! text-[10px] leading-[1.2] p-2 text-center flex opacity-100 sm:hidden sm:group-hover/avatar-area:flex sm:opacity-0 sm:group-hover/avatar-area:opacity-100 transition-[left,top,opacity] duration-150"
          style={arcPosition(dogs.length, dogs.length + 1, ADD_BUTTON_OFFSET)}
          onClick={handleAdd}
          aria-label="Add dog"
        >
          <span className="sm:hidden">{dogs.length === 0 ? 'add pup' : <span className="text-2xl">+</span>}</span>
          <span className="hidden sm:inline">{dogs.length === 0 ? 'add your pup' : 'add another pup'}</span>
        </IconButton>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      <Modal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <p className="text-[15px] text-card-fg mt-0 mb-6 text-center">Remove this pup?</p>
        <div className="flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button intent="alert" className="flex-1" onClick={handleConfirmRemove} disabled={deleting}>{deleting ? 'Removing…' : 'Remove'}</Button>
        </div>
      </Modal>
    </div>
  );
}
