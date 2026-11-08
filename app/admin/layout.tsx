import AdminIdleTimeout from './AdminIdleTimeout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AdminIdleTimeout />
    </>
  );
}
