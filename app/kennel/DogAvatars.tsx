'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, X, Plus } from 'lucide-react';
import { resizeToSquare } from '@/lib/resizeToSquare';

interface Dog {
  id: string;
  image: string | null;
}

interface Props {
  initial: Dog[];
}

const MAX_DOGS = 5;
const DOG_SIZE  = 64;
const CENTER_X  = 150;  // half of the 300px area width
const CENTER_Y  = 60;   // center of the 120px main avatar from area top
const ARC_R     = 85;   // px from main-avatar center to dog center

function arcPosition(index: number, total: number): React.CSSProperties {
  // spread from 210° to 330° (standard math: 0=right, 90=up, CCW)
  const deg = total === 1 ? 270 : 25 + (index / (total - 1)) * (28*total);
  const rad = (deg * Math.PI) / 180;
  return {
    left: CENTER_X + ARC_R * Math.cos(rad) - DOG_SIZE / 2,
    top:  CENTER_Y - ARC_R * Math.sin(rad) - DOG_SIZE / 2,
  };
}


export default function DogAvatars({ initial }: Props) {
  const router = useRouter();
  const [dogs, setDogs] = useState<Dog[]>(initial);
  const [uploading, setUploading] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingDogId = useRef<string | null>(null);

  const canAdd = dogs.length < MAX_DOGS;
  const totalSlots = dogs.length + (canAdd ? 1 : 0);

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

  async function handleRemove(dogId: string) {
    await fetch(`/api/dogs/${dogId}`, { method: 'DELETE' });
    setDogs((prev) => prev.filter((d) => d.id !== dogId));
    router.refresh();
  }

  return (
    <div className="dog-avatars">
      {dogs.map((dog, i) => (
        <div
          key={dog.id}
          className="dog-avatar"
          style={arcPosition(i, totalSlots)}
        >
          <div className="dog-avatar__circle">
            {dog.image
              ? <img src={dog.image} alt="dog" className="dog-avatar__img" />
              : <span className="dog-avatar__placeholder">🐶</span>
            }
            {uploading === dog.id && <div className="dog-avatar__spinner" />}
          </div>

          <button
            className="dog-avatar__btn dog-avatar__btn--camera"
            onClick={() => handleChangeImage(dog.id)}
            disabled={uploading !== null}
            aria-label="Change dog photo"
          >
            <Camera size={10} strokeWidth={2.5} />
          </button>

          <button
            className="dog-avatar__btn dog-avatar__btn--remove"
            onClick={() => handleRemove(dog.id)}
            disabled={uploading !== null}
            aria-label="Remove dog"
          >
            <X size={10} strokeWidth={2.5} />
          </button>
        </div>
      ))}

      {canAdd && (
        <button
          className="dog-avatar__add"
          style={arcPosition(dogs.length, totalSlots)}
          onClick={handleAdd}
          aria-label="Add dog"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  );
}
