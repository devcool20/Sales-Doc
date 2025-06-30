'use client'; // This directive makes this a Client Component

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { SquareStack, Sparkles, Zap } from 'lucide-react'; // Importing icons

// --- Utility Component for Scroll-based Fade In ---
// This component applies the fade-in animation as sections come into view.
interface FadeInSectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string; // Allow passing additional classes
}

const FadeInSection: React.FC<FadeInSectionProps> = ({ children, id, className }) => {
  const domRef = useRef<HTMLDivElement>(null);
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      // If the section is intersecting, set it to visible
      if (entries[0].isIntersecting) {
        setVisible(true);
        // Stop observing once it's visible to avoid re-triggering animation
        observer.unobserve(domRef.current!);
      }
    }, { threshold: 0.1 }); // Trigger when 10% of the section is visible

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Cleanup observer on component unmount
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []); // Empty dependency array means this effect runs once after initial render

  return (
    <section
      id={id}
      ref={domRef}
      className={`py-20 px-4 transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className || ''}`} /* Apply animation based on isVisible state */
    >
      {children}
    </section>
  );
};

export default function HomePage() {
  // --- State Management for Email Capture ---
  const [email, setEmail] = useState<string>('');

  // Handles email submission
  const handleEmailSubmit = () => {
    if (email.trim()) {
      alert(`Thank you for your interest! Your email "${email}" has been submitted.`);
      setEmail(''); // Clear input
    } else {
      alert('Please enter a valid email address.');
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-gray-200">
      {/* Hero Section */}
      <section id="hero-section" className="min-h-screen flex flex-col items-center justify-center text-center bg-black py-20 px-4 relative overflow-hidden">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up">Boost Your Sales.</h1>
        <p className="text-lg md:text-2xl text-gray-400 mb-10 animate-fade-in-up-delay-200">Smarter conversions start here.</p>
        <Link href="/app" className="btn-premium animate-pop-in">Get Started</Link>
        <div className="gradient-line pulsate-gradient"></div>
      </section>

      {/* Email Capture Section */}
      <FadeInSection id="email-section" className="bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-800">
        <div className="py-20 px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Enter your email.</h2>
          <p className="text-md md:text-lg text-gray-400 mb-8">Unlock exclusive offers.</p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow p-4 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-md"
            />
            <button className="btn-premium flex-shrink-0" onClick={handleEmailSubmit}>Submit</button>
          </div>
          <div className="gradient-line pulsate-gradient"></div>
        </div>
      </FadeInSection>

      {/* Features Section */}
      <FadeInSection id="features-section" className="bg-black">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Why Choose SalesDoc?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Feature 1 */}
            <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-lg border border-gray-800 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-5xl mb-4 text-blue-400 glow-icon flex justify-center">
                <SquareStack size={48} strokeWidth={1.5} /> {/* Lucide icon */}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Real-time data.</h3>
              <p className="text-gray-400">See exactly how your sales are performing and take action within moments.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-lg border border-gray-800 hover:border-pink-500 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-5xl mb-4 text-pink-400 glow-icon flex justify-center">
                <Sparkles size={48} strokeWidth={1.5} /> {/* Lucide icon */}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Sleek design.</h3>
              <p className="text-gray-400">Intuitive user interface for a seamless experience.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-lg border border-gray-800 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-5xl mb-4 text-blue-400 glow-icon flex justify-center">
                <Zap size={48} strokeWidth={1.5} /> {/* Lucide icon */}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Fast results.</h3>
              <p className="text-gray-400">Accelerate sales cycles and save time with powerful tools.</p>
            </div>
          </div>
        </div>
        <div className="gradient-line pulsate-gradient mt-12"></div>
      </FadeInSection>

      {/* About Section */}
      <FadeInSection id="about-section" className="bg-gray-950">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Transform Your Sales Process</h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            SalesDoc is an AI-powered platform that analyzes your sales conversations in real-time, 
            providing actionable insights to improve conversion rates. Our advanced machine learning 
            algorithms help you understand customer sentiment, identify key opportunities, and 
            optimize your sales approach.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Analysis</h3>
              <p className="text-gray-400">
                Get instant feedback on your sales conversations with our advanced AI that 
                understands context, sentiment, and conversion signals.
              </p>
            </div>
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-4">Actionable Insights</h3>
              <p className="text-gray-400">
                Receive specific recommendations on how to improve your approach and 
                increase your chances of closing deals.
              </p>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* CTA Section */}
      <FadeInSection id="cta-section" className="bg-black">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Boost Your Sales?</h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of sales professionals who are already using SalesDoc to 
            improve their conversion rates and close more deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app" className="btn-premium">Start Free Trial</Link>
            <a 
              href="#features-section" 
              className="px-8 py-3 border-2 border-gray-600 text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
}
