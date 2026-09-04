import Link from 'next/link';
import CopyEmail from '@/components/CopyEmail';
import BackgroundArt from '@/components/BackgroundArt';
import './about.css';

export default function AboutPage() {
  return (
    <main className="about">
      <BackgroundArt />
      <Link href="/" className="about__back">← Back to map</Link>

      <h1 className="about__title">About Dog Friendly Feast</h1>

      <section className="about__section">
        <h2>South Africa&apos;s dog-friendly restaurant directory</h2>
        <p>
          Finding restaurants that allow our furry friends can be a real pain – we&apos;re here to help take the guesswork out of it!
        </p>
        <p>
          Dog Friendly Feast is a community-driven map of spots across South Africa where you can bring your dog and feel welcomed.
        </p>
      </section>

      <section className="about__section">
        <h2>How to find a dog-friendly cafe or restaurant near you</h2>
        <ul>
          <li>Search for a restaurant name, suburb, or city in the search bar.</li>
          <li>Browse the interactive map to see dog-friendly spots near you, or use the list view to explore by city and suburb.</li>
          <li>Toggle &lsquo;Verified only&rsquo; to filter out locations we haven&apos;t confirmed yet.</li>
        </ul>
      </section>

      <section className="about__section">
        <h2>How restaurants get added</h2>
        <p>
          Anyone can submit a dog-friendly spot. Use the search bar to find the restaurant or cafe you&apos;re thinking of, and you&apos;ll see an option to mark it as dog-friendly or not.
        </p>
        <p>
          Submissions are reviewed before being marked as verified, so you can trust that verified listings have been checked.
        </p>
      </section>

      <section className="about__section">
        <h2>Get involved</h2>
        <p>
          We do our best to keep the map updated, and we welcome community feedback if we&apos;ve missed something or if anything has changed.
        </p>
        <p>Or if you have ideas for making the website better!</p>
        <CopyEmail />
      </section>
    </main>
  );
}
