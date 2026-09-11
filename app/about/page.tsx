import CopyEmail from '@/components/CopyEmail';
import Button from '@/components/Button';

export default function AboutPage() {
  return (
    <main className="max-w-160 mx-auto px-6 pt-15 pb-20 font-sans text-fg">
      <Button href="/" className="mb-10">← Back to map</Button>

      <h1 className="text-[36px] m-0 mb-10 font-['Comic_Neue','Comic_Sans_MS','Comic_Sans',cursive] font-bold">About Dog World</h1>

      <section className="mb-9">
        <h2 className="text-[18px] font-semibold m-0 mb-3">South Africa&apos;s dog-friendly restaurant directory</h2>
        <p className="text-[15px] leading-[1.7] text-fg-soft m-0 mb-2">
          Finding restaurants that allow our furry friends can be a real pain – we&apos;re here to help take the guesswork out of it!
        </p>
        <p className="text-[15px] leading-[1.7] text-fg-soft m-0 mb-2">
          Dog World is a community-driven map of spots across South Africa where you can bring your dog and feel welcomed.
        </p>
      </section>

      <section className="mb-9">
        <h2 className="text-[18px] font-semibold m-0 mb-3">How to find a dog-friendly cafe or restaurant near you</h2>
        <ul className="pl-5">
          <li className="text-[15px] leading-[1.7] text-fg-soft mb-2">Search for a restaurant name, suburb, or city in the search bar.</li>
          <li className="text-[15px] leading-[1.7] text-fg-soft mb-2">Browse the interactive map to see dog-friendly spots near you, or use the list view to explore by city and suburb.</li>
          <li className="text-[15px] leading-[1.7] text-fg-soft mb-2">Toggle &lsquo;Verified only&rsquo; to filter out locations we haven&apos;t confirmed yet.</li>
        </ul>
      </section>

      <section className="mb-9">
        <h2 className="text-[18px] font-semibold m-0 mb-3">How restaurants get added</h2>
        <p className="text-[15px] leading-[1.7] text-fg-soft m-0 mb-2">
          Anyone can submit a dog-friendly spot. Use the search bar to find the restaurant or cafe you&apos;re thinking of, and you&apos;ll see an option to mark it as dog-friendly or not.
        </p>
        <p className="text-[15px] leading-[1.7] text-fg-soft m-0 mb-2">
          Submissions are reviewed before being marked as verified, so you can trust that verified listings have been checked.
        </p>
      </section>

      <section className="mb-9">
        <h2 className="text-[18px] font-semibold m-0 mb-3">Get involved</h2>
        <p className="text-[15px] leading-[1.7] text-fg-soft m-0 mb-2">
          We do our best to keep the map updated, and we welcome community feedback if we&apos;ve missed something or if anything has changed.
        </p>
        <p className="text-[15px] leading-[1.7] text-fg-soft m-0 mb-2">Or if you have ideas for making the website better!</p>
        <CopyEmail />
      </section>
    </main>
  );
}
