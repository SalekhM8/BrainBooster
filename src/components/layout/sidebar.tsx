"use client";

import { useState, useEffect } from "react";
import { NavItem, NavSection } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { LogOut, LayoutGrid, X, Menu } from "lucide-react";

interface SidebarProps {
  sections: NavSection[];
}

// Mobile menu button component - exported for use in header
export function MobileMenuButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 text-pastel-blue-border hover:text-pastel-blue-text hover:bg-pastel-blue/50 rounded-xl transition-all"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
}

export function Sidebar({ sections }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Menu Toggle - Fixed Position */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <MobileMenuButton onClick={() => setIsMobileOpen(!isMobileOpen)} isOpen={isMobileOpen} />
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-pastel-blue-border/30 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - PASTEL BLUE DOMINANT */}
      {/* On mobile: fixed, hidden off-screen, doesn't take up flex space */}
      {/* On desktop (lg+): relative, visible, takes up flex space */}
      <aside className={`
        fixed lg:relative
        w-[280px] sm:w-72 h-screen 
        bg-pastel-blue border-r-2 border-pastel-blue-border/30 
        flex-col z-50
        shadow-[4px_0_24px_-12px_rgba(123,163,224,0.3)]
        transition-transform duration-300 ease-out
        hidden lg:flex
        ${isMobileOpen ? "!flex translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="h-20 sm:h-24 px-5 sm:px-8 flex items-center border-b-2 border-pastel-blue-border/20 relative">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-pastel-blue-border/20 border-2 border-pastel-blue-border rounded-[0.75rem] sm:rounded-[1rem] flex items-center justify-center transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 shadow-sm">
              <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-pastel-blue-border" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-pastel-blue-border tracking-tightest">BrainBooster</span>
          </Link>
          
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden ml-auto p-2 text-pastel-blue-border/60 hover:text-pastel-blue-border hover:bg-pastel-blue-dark rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-10 relative">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <h3 className="px-3 sm:px-4 mb-3 sm:mb-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-pastel-blue-border/60">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1 sm:space-y-2">
                {section.items.map((item) => (
                  <NavItemComponent
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 sm:p-6 border-t-2 border-pastel-blue-border/20 relative bg-pastel-blue-dark/30">
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-pastel-cream/80 border-2 border-pastel-blue-border/30 shadow-sm group hover:border-pastel-blue-border transition-colors duration-300">
            <Avatar 
              name={user ? `${user.firstName} ${user.lastName}` : "User"} 
              size="sm"
              className="ring-2 ring-pastel-blue-border/40 border-2 border-pastel-cream group-hover:scale-105 transition-transform"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-pastel-blue-border truncate tracking-tightest">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[9px] sm:text-[10px] font-bold text-pastel-blue-border/60 uppercase tracking-widest mt-0.5">
                {user?.role}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 text-pastel-blue-border/60 hover:text-pastel-blue-text hover:bg-pastel-blue-dark rounded-xl transition-all duration-300"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItemComponent({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm font-bold transition-all duration-300 tracking-tightest relative group ${
          isActive
            ? "bg-pastel-blue-border text-pastel-cream border-2 border-pastel-blue-border shadow-[0_4px_0_0_rgba(74,123,199,1)] translate-y-[-2px]"
            : "text-pastel-blue-border/70 hover:bg-pastel-blue-dark hover:text-pastel-blue-border border-2 border-transparent hover:border-pastel-blue-border/30"
        }`}
      >
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-pastel-cream" : "text-pastel-blue-border/60"}`} />
        <span className="text-[13px] sm:text-sm">{item.title}</span>
        {item.badge && (
          <span className={`ml-auto text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full border transition-colors ${
            isActive 
              ? "bg-pastel-cream/30 text-pastel-cream border-pastel-cream/30" 
              : "bg-pastel-blue-border/10 text-pastel-blue-border border-pastel-blue-border/20"
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}
