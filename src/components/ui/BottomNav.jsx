import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/buildings',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
      ),
      active: location.pathname === '/buildings' || location.pathname.startsWith('/building'),
    },
    {
      path: '/search',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
      ),
      active: location.pathname === '/search',
    },
    {
      path: '/profile',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
      ),
      active: location.pathname === '/profile',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0D1C22] flex justify-around items-center shadow-lg">
      {navItems.map((item, index) => (
        <Link
          key={index}
          to={item.path}
          className={`flex-1 flex justify-center items-center h-full text-gray-400 hover:text-white transition-colors ${item.active ? '!text-[#00BFA5]' : ''
            }`}
        >
          {item.icon}
        </Link>
      ))}
    </div>
  );
};

export default BottomNav;