// app/(app)/layout.tsx
import Header from '../components/Dashboard/Header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen font-poppins">
      <Header />
      <main className="p-8 pt-0">
        {children}
      </main>
    </div>
  );
}
