'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { Menu, X } from 'lucide-react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    // Check if user is authenticated
    const checkUserAccess = () => {
      try {
        const loginUser = localStorage.getItem('login_user');
        
        if (loginUser) {
          const user = JSON.parse(loginUser);
          const userEmail = user?.email;
          
          // Allowed emails list
          const allowedEmails = [
            'tauheeddeveloper13@gmail.com',
            'nesticktech@gmail.com',
            'neezamiya@gmail.com',
            'ayeshamubashra@cuivehari.edu.pk'
          ];
          
          // Check if user email is not in allowed list
          if (!allowedEmails.includes(userEmail)) {
            // Redirect to login page
            localStorage.removeItem('login_user'); // Clear unauthorized user
            router.push('/auth/login');
          }
        } else {
          // No user found, redirect to login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error checking user access:', error);
        router.push('/auth/login');
      }
    };

    checkUserAccess();
  }, [router, pathname]);

  return (
    <div className="flex min-h-screen bg-[#0B0F19] transition-colors duration-500">
      {/* 🔹 Mobile Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl shadow-lg transition-all duration-300 ${
          isSidebarOpen
            ? 'bg-[#FFD700] text-black'
            : 'bg-[#0F172A] border border-[#1E293B] text-white hover:border-[#FFD700]/50'
        }`}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* 🔹 Sidebar */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-40 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar />
      </div>

      {/* 🔹 Overlay for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
        ></div>
      )}

      {/* 🔹 Main Content Area - No extra gaps */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-[#0B0F19]">
          {children}
        </main>
      </div>
    </div>
  );
}