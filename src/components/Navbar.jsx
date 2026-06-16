import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  House, ShoppingCart, Package, Users, ChartBar, Truck
} from '@phosphor-icons/react';

const navItems = [
  { path: '/',          icon: House,         label: 'Asosiy'  },
  { path: '/sales',     icon: ShoppingCart, label: 'Sotuv'   },
  { path: '/warehouse', icon: Package,      label: 'Ombor'   },
  { path: '/purchases', icon: Truck,        label: 'Xarid'   },
  { path: '/customers', icon: Users,        label: 'Mijozlar'},
  { path: '/reports',   icon: ChartBar,    label: 'Hisobot' },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <>
      {/* ── Desktop / Tablet sidebar ─────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 flex-col bg-white border-r border-slate-100 shadow-sm z-50">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-50 flex items-center gap-3">
          <img src="/person_logo.jpg" alt="logo" className="w-8 h-8 object-cover rounded-full" />
          <div>
            <h1 className="text-lg font-black text-[#6366f1] tracking-tight">Shaxrixon Balon</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">CRM Tizimi</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#6366f1] text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'w-5 h-5' : 'w-4 h-4'}`} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-50">
          <p className="text-[10px] text-slate-300 font-medium">v1.0.0 · NSD Corporation</p>
        </div>
      </aside>

      {/* ── Mobile bottom bar ───────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="mx-3 mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-white/85 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl shadow-black/10" />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/40 to-white/60 rounded-3xl" />
            <div className="relative flex justify-around items-center h-[68px] px-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative flex flex-col items-center justify-center gap-0.5 transition-all duration-300 ease-out min-w-[48px]"
                  >
                    <div className={`relative flex items-center justify-center rounded-xl transition-all duration-300 ease-out ${
                      isActive ? 'bg-slate-50 p-2 text-[#6366f1]' : 'p-1.5 text-slate-400 hover:text-slate-600'
                    }`}>
                      <Icon className={`transition-all duration-300 ${isActive ? 'w-5 h-5' : 'w-4 h-4'}`} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`font-medium transition-all duration-300 leading-none text-[9px] ${isActive ? 'text-[#6366f1]' : 'text-slate-400'}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
