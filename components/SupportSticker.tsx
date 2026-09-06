const OPTIONS = [
  { label: 'R50',   href: 'https://express.stitch.money/barak/50/dog-world' },
  { label: 'R100',  href: 'https://express.stitch.money/barak/100/dog-world' },
  { label: 'other', href: 'https://express.stitch.money/barak' },
];

export default function SupportSticker() {
  return (
    <div className="support_sticker_group">
      <a
        className="support_sticker"
        href="https://express.stitch.money/barak"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="/support.svg" className="support_sticker__img" alt="" />
        <span className="support_sticker__text">
          Throw me<br />a bone
        </span>
      </a>

      <div className="support_sticker_options">
        {OPTIONS.map(({ label, href }) => (
          <a
            key={label}
            className="support_sticker_option"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/support.svg" className="support_sticker_option__img" alt="" />
            <span className="support_sticker_option__text">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
