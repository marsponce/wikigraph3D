// src/app/components/Footer.tsx
type FooterProps = {
  children?: React.ReactNode;
};

export default function Footer({ children }: FooterProps) {
  return (
    <footer>
      <p className="text-center p-1">Wikigraph3D 2025</p>
      {children}
    </footer>
  );
}
