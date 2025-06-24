import { Sidebar } from "./_components/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="max-h-screen w-full overflow-y-auto p-4">{children}</div>
    </div>
  );
}
