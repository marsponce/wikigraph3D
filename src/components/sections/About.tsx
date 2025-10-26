// src/app/components/sections/Main.tsx

export default function About() {
  return (
    <>
      <main className="about">
        <div className="relative inline-block">
          <span className="absolute z-0 blur-lg select-none" aria-hidden="true">
            <h1>About</h1>
          </span>
          <h1>About</h1>
        </div>

        <p>
          I&apos;m Mars, a developer based in Toronto who studied at the
          University of Toronto.
          <br />I like to build reliable, efficient, well-designed software.
        </p>

        <p>
          <strong>Wikigraph3d</strong> is built with <strong>Next.js</strong>{" "}
          and <strong>Tailwind CSS</strong>, and deployed via{" "}
          <strong>TBD</strong>.
        </p>

        <p className="relative inline-block">
          If you’d like to connect, find me on{" "}
          <span
            className="absolute blur text-sky-400 select-none"
            aria-hidden="true"
          >
            GitHub
          </span>
          <a href="https://github.com/marceloponceardon" className="relative">
            GitHub
          </a>{" "}
          or reach out by email at{" "}
          <span
            className="absolute z-0 blur text-sky-400 select-none font-extrabold"
            aria-hidden="true"
          >
            marcelo.ponce@alumni.utoronto.ca
          </span>
          <a
            href="mailto:marcelo.ponce@alumni.utoronto.ca"
            className="relative"
          >
            marcelo.ponce@alumni.utoronto.ca
          </a>
          .
        </p>
      </main>
    </>
  );
}
