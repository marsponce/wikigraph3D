// src/app/components/Footer.tsx
type FooterProps = {
  children?: React.ReactNode;
};

export default function Footer({ children }: FooterProps) {
  return (
    <footer>
      <h6>
        {process.env.NEXT_PUBLIC_APP_NAME} {process.env.NEXT_PUBLIC_APP_VERSION}{" "}
        2026
      </h6>
      {children}
    </footer>
  );
}
