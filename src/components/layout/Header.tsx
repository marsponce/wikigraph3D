// src/app/components/Header.tsx
type HeaderProps = {
  children?: React.ReactNode;
};

export default function Header({ children }: HeaderProps) {
  return (
    <header>
      Header
      {children}
    </header>
  );
}
