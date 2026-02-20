'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, List, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navigation = [
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Lists', href: '/lists', icon: List },
  { name: 'Saved Searches', href: '/saved', icon: Search },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <span className="text-white font-semibold text-lg">Precision AI Scout</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400 hover:text-white p-2"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-60 bg-slate-900 flex flex-col transition-transform duration-200 ease-in-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'lg:pt-0 pt-14'
        )}
      >
        {/* Logo */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Precision AI</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">VC Intelligence Platform</p>
          <p className="text-xs text-slate-600 mt-1">v1.0.0</p>
        </div>
      </div>
    </>
  );
}
