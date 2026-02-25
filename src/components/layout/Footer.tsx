// src/app/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="absolute bottom-0 left-0 w-full pointer-events-none">
      <h6 className="relative">
        <span className="absolute left-4 bottom-4">
          {process.env.NEXT_PUBLIC_APP_NAME}{" "}
          {process.env.NEXT_PUBLIC_APP_VERSION} 2026
        </span>
      </h6>
    </footer>
  );
}
