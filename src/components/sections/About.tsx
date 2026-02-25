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
          <strong>Wikigraph3d</strong> is built with <strong>Next.js</strong>,{" "}
          <strong>Tailwind CSS</strong>,{" "}
          <strong>{process.env.NEXT_PUBLIC_DATABASE_NAME || "Supabase"}</strong>{" "}
          and deployed via{" "}
          <strong>{process.env.NEXT_PUBLIC_DEPLOY_ENV || "Netlify"}</strong>.
        </p>

        <p className="relative inline-block">
          If you’d like to connect, find me on{" "}
          <span
            className="absolute blur text-sky-400 select-none"
            aria-hidden="true"
          >
            GitHub
          </span>
          <a
            href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME}`}
            className="relative text-sky-400"
          >
            GitHub
          </a>{" "}
          or reach out by email at{" "}
          <span
            className="absolute z-0 blur text-sky-400 select-none font-extrabold"
            aria-hidden="true"
          >
            {process.env.NEXT_PUBLIC_CONTACT}
          </span>
          <a
            href={`mailto:${process.env.NEXT_PUBLIC_CONTACT}`}
            className="relative text-sky-400"
          >
            {process.env.NEXT_PUBLIC_CONTACT}
          </a>
          .
        </p>
      </main>
    </>
  );
}
