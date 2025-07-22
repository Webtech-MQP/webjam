import { Sidebar } from "../../components/sidebar";
import { Toaster } from "@/components/ui/sonner"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <Toaster />
      <div className="max-h-screen w-full overflow-y-auto p-4">{children}</div>
    </div>
  );
}
