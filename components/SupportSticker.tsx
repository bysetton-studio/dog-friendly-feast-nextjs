export default function SupportSticker() {
  return (
    <a
      className="support_sticker"
      href="https://express.stitch.money/barak"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Support us"
    >
      <img src="/support.svg" className="support_sticker__img" alt="" />
      <span className="support_sticker__text">
        Throw me<br />a bone
      </span>
    </a>
  );
}
