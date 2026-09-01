import Link from 'next/link';

export default function AddSticker() {
  return (
    <Link href="/add" className="add_sticker">
      <img src="/add_sticker.svg" className="add_sticker__img" alt="" />
      <span className="add_sticker__text">Add your favourite spot ! ! ! !</span>
    </Link>
  );
}
