"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, BarChart3, MessageCircle } from 'lucide-react';

const MobileSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/app', label: 'Sales AI', icon: BarChart3 },
    { href: '/ai-chat', label: 'Chat', icon: MessageCircle },
  ];

  const toggleSidebar = () => {
    console.log('Toggling sidebar, current state:', isOpen);
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    console.log('Closing sidebar');
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={toggleSidebar}
        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
        aria-label="Toggle mobile menu"
        type="button"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 sm:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-64 bg-black border-r border-white/20 transform transition-transform duration-300 ease-in-out z-[60] sm:hidden flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 bg-gray-900">
          <Link href="/" onClick={closeSidebar} className="text-xl font-bold text-white tracking-wider">
            SALES<span className="text-pink-500">DOC</span>
          </Link>
          <button
            onClick={closeSidebar}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200 z-10"
            aria-label="Close sidebar"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 bg-gray-900">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/30 to-purple-600/30 text-white border border-blue-500/50'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/20 bg-gray-900">
          <div className="text-center">
            <p className="text-xs text-gray-300">
              Mobile Navigation
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Swipe or tap to navigate
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar; 