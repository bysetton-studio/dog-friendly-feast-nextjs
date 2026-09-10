import Link from 'next/link';

export default function AddSticker() {
  return (
    <Link
      href="/add"
      className="absolute top-0 right-0 z-100 w-32 h-32 flex items-center justify-center no-underline transition-transform duration-250 ease-in-out hover:scale-[1.15] max-md:fixed max-md:top-auto max-md:left-auto max-md:bottom-5 max-md:right-5 max-md:w-[110px] max-md:h-[110px]"
    >
      <img src="/add_sticker.svg" className="absolute inset-0 w-full h-full animate-sticker-spin-8" alt="" />
      <span className="relative text-center font-['Comic_Neue','Comic_Sans_MS','Comic_Sans',cursive] text-base font-bold [-webkit-text-stroke:0.5px_#fff] text-white leading-[1.3] p-5 max-md:text-[14px] max-md:p-[14px]">Add your favourite spot ! ! ! !</span>
    </Link>
  );
}
