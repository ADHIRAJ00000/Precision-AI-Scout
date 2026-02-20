'use client';

import { Bell, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-end sticky top-0 z-30">
      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-500" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-900">VC Analyst</p>
            <p className="text-xs text-slate-500">analyst@vcfirm.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
