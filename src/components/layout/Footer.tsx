// src/app/components/Footer.tsx
type FooterProps = {
  children?: React.ReactNode;
};

export default function Footer({ children }: FooterProps) {
  return (
    <footer>
      <h6>Wikigraph3D 2025</h6>
      {children}
    </footer>
  );
}
