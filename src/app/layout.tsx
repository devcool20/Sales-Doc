import type { Metadata } from 'next';
import './globals.css'; // Import global styles

// Define Navbar component (moved here from page.tsx for layout)
const Navbar: React.FC = () => {
  return (
    <nav className="bg-black p-4 fixed w-full z-50 shadow-lg border-b border-blue-500/50">
      <div className="container mx-auto flex justify-between items-center px-4">
        <a href="/" className="text-2xl font-bold text-white tracking-wider">SALES<span className="text-pink-500">DOC</span></a>
        <div className="space-x-8 hidden md:flex">
          <a href="/" className="text-white hover:text-blue-400 transition-colors duration-200">Home</a>
          <a href="/app" className="text-white hover:text-blue-400 transition-colors duration-200">App</a>
          <a href="/#features-section" className="text-white hover:text-blue-400 transition-colors duration-200">Features</a>
          <a href="/#footer-section" className="text-white hover:text-blue-400 transition-colors duration-200">Contact</a>
        </div>
        {/* Mobile Menu Button - for future expansion */}
        <button className="md:hidden text-white focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
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

// Metadata for the page (SEO)
export const metadata: Metadata = {
  title: 'Sales Doc: Smarter Conversions',
  description: 'Boost your sales with AI-powered conversation analysis.',
};

// RootLayout component that wraps all pages
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-gray-200 antialiased">
        <Navbar /> {/* Render the Navbar component */}
        <main>{children}</main> {/* Render page content */}
        <Footer /> {/* Render the Footer component */}
      </body>
    </html>
  );
}
