// src/app/components/Header.tsx
type HeaderProps = {
  className?: string;
  children?: React.ReactNode;
};

export default function Header({ className, children }: HeaderProps) {
  return (
    <header className="header">
      Header
      {children}
    </header>
  );
}
