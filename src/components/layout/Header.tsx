// src/app/components/Header.tsx
type HeaderProps = {
  children?: React.ReactNode;
};

export default function Header({ children }: HeaderProps) {
  return (
    <header className="bg-white/70 dark:bg-black/70 fixed z-1 top-0 bottom-auto right-auto p-2 m-2 rounded">
      {children}
    </header>
  );
}
