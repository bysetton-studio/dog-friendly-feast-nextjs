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
const DOG_SIZE  = 64;
const CENTER_X  = 140;  // horizontal center of the 280px area
const CENTER_Y  = 145;  // center of the main avatar (padding-top 90 + avatar radius 60)
const ARC_R     = 80;  // distance from main avatar center to dog center
const GAP       = -10;   // fixed pixel gap between adjacent dog circles
// Angle between adjacent dogs so their edges are always GAP apart
const STEP_DEG  = (2 * Math.asin((DOG_SIZE + GAP) / (2 * ARC_R))) * (180 / Math.PI);

const ADD_BUTTON_OFFSET = 25; // extra degrees away from the last dog

// index 0 = leftmost, arc centered at 90° (top)
function arcPosition(index: number, total: number, extraOffset = 0): React.CSSProperties {
  const deg = 90 + ((total - 1) / 2 - index) * STEP_DEG - extraOffset;
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
          style={{ ...arcPosition(i, dogs.length), zIndex: dogs.length - i }}
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
    </div>
  );
}
