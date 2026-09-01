import Link from 'next/link';
import './about.css';

export default function AboutPage() {
  return (
    <main className="about">
      <Link href="/" className="about__back">← Back to map</Link>

      <h1 className="about__title">About Dog Friendly Feast</h1>

      <section className="about__section">
        <h2>South Africa&apos;s dog-friendly restaurant directory</h2>
        <p>
          Dog Friendly Feast is a community-driven directory of pet-friendly
          restaurants, cafes, and eateries across South Africa where you can
          bring your dog. Finding restaurants that allow dogs can be hit or miss
          — we&apos;re here to take the guesswork out of it.
        </p>
        <p>
          Whether you&apos;re looking for dog-friendly restaurants in Cape Town,
          Johannesburg, Durban, Pretoria, Stellenbosch, or anywhere in between,
          our map helps you find a spot with outdoor dining where your
          four-legged friend is genuinely welcome — not just tolerated.
        </p>
      </section>

      <section className="about__section">
        <h2>How to find a dog-friendly cafe or restaurant near you</h2>
        <ul>
          <li>Search for a restaurant name, suburb, or city in the search bar.</li>
          <li>Browse the interactive map to spot dog-friendly patios and al fresco dining near you.</li>
          <li>Use the list view to explore pet-friendly spots by city and suburb.</li>
          <li>Toggle &ldquo;Verified only&rdquo; to filter to locations our team has confirmed allow dogs.</li>
        </ul>
      </section>

      <section className="about__section">
        <h2>How restaurants get added</h2>
        <p>
          Anyone can submit a dog-welcoming restaurant. If you search for a
          place and it isn&apos;t listed yet, you&apos;ll see an option to suggest it.
          Submissions are reviewed before being marked as verified, so you can
          trust that verified listings have been checked and genuinely allow you
          to bring your dog.
        </p>
      </section>

      <section className="about__section">
        <h2>Know a spot we&apos;re missing?</h2>
        <p>
          South Africa has no shortage of great outdoor dining with dogs — help
          us keep the directory complete. Search for the restaurant on the map
          and use the submission form to suggest it, or flag any incorrect info
          on an existing listing.
        </p>
      </section>
    </main>
  );
}
