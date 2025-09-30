// src/app/components/Footer.tsx
type FooterProps = {
  className?: string;
  children?: React.ReactNode;
};

export default function Footer({ className, children }: FooterProps) {
  return (
    <footer className={`bg-black/70 text-white shadow-md ${className ?? ""}`}>
      <div className="text-center p-1">Wikigraph3D 2025</div>
      {children}
    </footer>
  );
}
