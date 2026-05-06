import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiShoppingCart, 
  FiPackage, 
  FiUsers, 
  FiBarChart2, 
  FiMoreHorizontal 
} from 'react-icons/fi';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { 
      path: '/', 
      icon: FiHome, 
      label: 'Dashboard',
      id: 'dashboard'
    },
    { 
      path: '/sales', 
      icon: FiShoppingCart, 
      label: 'Sotuv',
      id: 'sales',
    },
    { 
      path: '/warehouse', 
      icon: FiPackage, 
      label: 'Ombor',
      id: 'warehouse'
    },
    { 
      path: '/customers', 
      icon: FiUsers, 
      label: 'Mijozlar',
      id: 'customers'
    },
    { 
      path: '/reports', 
      icon: FiBarChart2, 
      label: 'Hisobot',
      id: 'reports'
    },
    { 
      path: '/more', 
      icon: FiMoreHorizontal, 
      label: "Ko'proq",
      id: 'more'
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-slide-up">
      <div className="mx-4 mb-4">
        <div className="relative">
          {/* Glass effect background */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-black/10" />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/50 rounded-3xl" />
          
          {/* Navigation items */}
          <div className="relative flex justify-around items-center h-[72px] px-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isCTA = item.isCTA;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`
                    relative flex flex-col items-center justify-center 
                    transition-all duration-300 ease-out
                    ${isCTA ? 'scale-110' : 'scale-100'}
                    ${isActive ? 'transform' : ''}
                  `}
                >
                  {/* Icon container */}
                  <div
                    className={`
                      relative flex items-center justify-center
                      transition-all duration-300 ease-out
                      ${isCTA ? 'w-12 h-12' : 'w-10 h-10'}
                      ${isActive 
                        ? 'text-purple-600 scale-110' 
                        : 'text-gray-400 hover:text-gray-600'
                      }
                    `}
                  >
                    {/* Icon background glow for active state */}
                    {isActive && (
                      <div className="absolute inset-0 bg-purple-100 rounded-2xl blur-xl opacity-60" />
                    )}
                    
                    <Icon 
                      className={`
                        relative z-10 transition-all duration-300
                        ${isCTA ? 'w-6 h-6' : 'w-5 h-5'}
                        ${isActive ? 'drop-shadow-sm' : ''}
                      `}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  
                  {/* Label */}
                  <span
                    className={`
                      mt-1 font-medium transition-all duration-300 text-[10px]
                      ${isActive 
                        ? 'text-purple-600 opacity-100 translate-y-0' 
                        : 'text-gray-400 opacity-70 translate-y-0.5'
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
