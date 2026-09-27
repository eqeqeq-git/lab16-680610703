import { Outlet } from "react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type RootLayoutProps = {
  firstName: string;
  lastName: string;
  studentId: string;
};

export default function RootLayout({
  firstName,
  lastName,
  studentId,
}: RootLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background text-foreground">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="h-8 w-8 border border-border bg-transparent text-foreground hover:bg-muted" />
            <div className="text-sm font-medium text-foreground">
              <span>จัดการวิชาเรียนและสถานะนักศึกษา</span>
            </div>
          </div>

          <ModeToggle />
        </header>

        <main className="flex flex-1 flex-col gap-4 bg-background p-4 md:gap-8 md:p-6">
          <Outlet />
        </main>

        <footer className="mt-auto border-t border-border bg-muted/30 px-4 py-3 text-center text-xs text-muted-foreground">
          <p>
            จัดทำโดย {firstName} {lastName} — รหัสนักศึกษา {studentId}
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
