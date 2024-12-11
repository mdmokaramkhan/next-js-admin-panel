import { Separator } from '@/components/ui/separator';
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/ThemeToggle';
import { Breadcrumbs } from '@/components/breadcrumbs';
import SearchInput from '@/components/search-input';
import { UserNav } from '@/components/user-nav';

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="ml-1 [&_svg]:size-6" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2 px-4">
        <div className="hidden md:flex">
          <SearchInput />
        </div>
        <UserNav />
        <ModeToggle />
      </div>
    </header>
  );
}
