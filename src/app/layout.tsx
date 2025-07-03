'use client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClerkProvider, SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';
import './globals.css'; // Import global styles

// Define Navbar component with authentication
const Navbar: React.FC = () => {
  const pathname = usePathname();
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/app', label: 'Analyzer' },
    { href: '/ai-chat', label: 'AI Chat' },
  ];
  return (
    <nav className="bg-black p-4 fixed w-full z-50 shadow-lg border-b border-blue-500/50">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex-1 flex items-center">
          <Link href="/" className="text-2xl font-bold text-white tracking-wider">
            SALES<span className="text-pink-500">DOC</span>
          </Link>
        </div>
        {/* Nav Links Centered */}
        <div className="flex-1 flex justify-center">
          <div className="flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-2 py-1 text-base font-medium transition-colors duration-200
                  ${pathname === link.href
                    ? 'text-white after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-pink-500 after:rounded-full'
                    : 'text-gray-300 hover:text-white hover:after:absolute hover:after:left-0 hover:after:-bottom-1 hover:after:w-full hover:after:h-0.5 hover:after:bg-gradient-to-r hover:after:from-blue-500 hover:after:to-pink-500 hover:after:rounded-full'}
                `}
                style={{ minWidth: 70, textAlign: 'center' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        {/* User/Auth Button Right */}
        <div className="flex-1 flex justify-end items-center">
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10",
                  userButtonPopoverCard: "bg-gray-900 border border-gray-700",
                  userButtonPopoverActionButton: "text-white hover:bg-gray-800",
                  userButtonPopoverActionButtonText: "text-white",
                  userButtonPopoverFooter: "hidden"
                }
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

// Define Footer component (moved here from page.tsx for layout)
const Footer: React.FC = () => {
  return (
    <footer id="footer-section" className="bg-black py-10 px-4 text-gray-400 text-center text-sm border-t border-pink-500/50">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
                <h4 className="text-white font-semibold mb-3">Company</h4>
                <ul className="space-y-2">
                    <li><a href="#" className="hover:text-blue-400 transition-colors duration-200">About Us</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors duration-200">Careers</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors duration-200">Blog</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-semibold mb-3">Support</h4>
                <ul className="space-y-2">
                    <li><a href="#" className="hover:text-blue-400 transition-colors duration-200">Help Center</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors duration-200">Contact Us</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors duration-200">Legal</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-semibold mb-3">Connect</h4>
                <ul className="space-y-2">
                    <li><a href="#" className="hover:text-blue-400 transition-colors duration-200">LinkedIn</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors duration-200">Twitter</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors duration-200">Facebook</a></li>
                </ul>
            </div>
        </div>
        <p className="mt-8">&copy; 2025 SALESDOC. All rights reserved.</p>
    </footer>
  );
};

// RootLayout component that wraps all pages
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showFooter = pathname === '/';

  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold transition-all duration-300 rounded-xl",
          card: "bg-gray-900/95 border border-white/10 shadow-2xl backdrop-blur-xl rounded-2xl",
          headerTitle: "text-white text-3xl font-bold",
          headerSubtitle: "text-gray-300",
          socialButtonsBlockButton: "bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300 rounded-xl",
          formFieldLabel: "text-white font-medium",
          formFieldInput: "bg-white/5 border border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 rounded-xl",
          footerActionLink: "text-blue-400 hover:text-blue-300 transition-colors",
          dividerLine: "bg-white/20",
          dividerText: "text-gray-400",
          formResendCodeLink: "text-blue-400 hover:text-blue-300 transition-colors",
          otpCodeFieldInput: "bg-white/5 border border-white/20 text-white focus:border-blue-400 rounded-xl",
          identityPreviewText: "text-gray-300",
          identityPreviewEditButton: "text-blue-400 hover:text-blue-300 transition-colors",
          modalBackdrop: "bg-black/80 backdrop-blur-sm",
          modalContent: "bg-gray-900/95 border border-white/10 shadow-2xl backdrop-blur-xl rounded-2xl"
        }
      }}
    >
      <html lang="en">
        <body className="bg-[#0a0a0a] text-gray-200 antialiased">
          <Navbar /> {/* Render the Navbar component */}
          <main>{children}</main> {/* Render page content */}
          {showFooter && <Footer />} {/* Render the Footer component conditionally */}
        </body>
      </html>
    </ClerkProvider>
  );
}