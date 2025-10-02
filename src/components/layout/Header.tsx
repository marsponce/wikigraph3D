// src/app/components/Header.tsx
type HeaderProps = {
  className?: string;
  children?: React.ReactNode;
};

export default function Header({ className, children }: HeaderProps) {
  return (
    <div>
      <header className={`bg-black/70 text-white shadow-md ${className ?? ""}`}>
        Header
        {children}
      </header>
    </div>
  );
}
