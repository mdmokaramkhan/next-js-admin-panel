import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import Header from "@/components/header";
import { Separator } from "@radix-ui/react-separator";
// import Footer from "@/components/footer"; // Add this import

export default function Layout({ children }: { children: React.ReactNode }) {
  // const cookieStore = cookies();
  // const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <Separator orientation="horizontal" className="h-px" />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
