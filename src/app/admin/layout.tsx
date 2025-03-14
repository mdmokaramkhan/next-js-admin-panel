import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import Header from "@/components/header";
import { Separator } from "@radix-ui/react-separator";
import Footer from "@/components/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  // const cookieStore = cookies();
  // const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen flex flex-col">
        <Header />
        <Separator orientation="horizontal" className="h-px" />
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-[calc(100%-4rem)] flex flex-col">
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
