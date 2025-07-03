'use client'; // This directive makes this a Client Component

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { SquareStack, Sparkles, Zap } from 'lucide-react'; // Importing icons
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

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
  const [useCaseTab, setUseCaseTab] = useState<'training' | 'ab-testing' | 'assistance'>('training');

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-gray-200">
      {/* Hero Section */}
      <section id="hero-section" className="min-h-screen flex flex-col items-center justify-center text-center bg-black py-20 px-4 relative overflow-hidden">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up">Boost Your Sales.</h1>
        <p className="text-lg md:text-2xl text-gray-400 mb-10 animate-fade-in-up-delay-200">Smarter conversions start here.</p>
        <Link href="/app" className="btn-premium animate-pop-in">Get Started</Link>
        <div className="gradient-line pulsate-gradient"></div>
      </section>

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

      {/* --- NEW HOMEPAGE SECTIONS BELOW --- */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 pt-24">
        {/* Performance & Impact Section */}
        <section className="w-full max-w-6xl z-10 mx-auto mt-12 mb-24">
          <h2 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500">Unmatched Performance & Impact</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 text-center">
              <div className="text-pink-400 text-4xl font-bold">+43.2%</div>
              <p className="mt-2 text-gray-200 font-medium">Increase in Conversion Rate</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 text-center">
              <div className="text-pink-400 text-4xl font-bold">-22%</div>
              <p className="mt-2 text-gray-200 font-medium">Reduction in Sales Cycle</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 text-center">
              <div className="text-pink-400 text-4xl font-bold">96.7%</div>
              <p className="mt-2 text-gray-200 font-medium">Prediction Accuracy</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 text-center">
              <div className="text-pink-400 text-4xl font-bold">85ms</div>
              <p className="mt-2 text-gray-200 font-medium">Inference Time</p>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8">
              <h3 className="text-lg font-semibold text-white mb-2">Prediction Accuracy vs. Alternatives</h3>
              <p className="text-sm text-gray-400 mb-4">The model significantly outperforms both commercial systems and LLM-only approaches.</p>
              <div className="flex items-center justify-center h-48">
                <span className="text-gray-600/40 italic">[Accuracy Chart Placeholder]</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8">
              <h3 className="text-lg font-semibold text-white mb-2">Inference Speed Comparison (Latency)</h3>
              <p className="text-sm text-gray-400 mb-4">Optimized for real-time use, the model is over 40x faster than GPT-4.</p>
              <div className="flex items-center justify-center h-48">
                <span className="text-gray-600/40 italic">[Speed Chart Placeholder]</span>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Section */}
        <section className="w-full max-w-6xl z-10 mx-auto mb-24">
          <h2 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500">How It Works: A Hybrid AI Approach</h2>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white/5 border-l-4 border-blue-400 rounded-2xl shadow-lg w-full text-center p-4">
              <p className="font-semibold text-white">Input: Conversation Turns & Metrics</p>
            </div>
            <div className="text-2xl text-gray-500">↓</div>
            <div className="grid md:grid-cols-2 gap-4 w-full">
              <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-6">
                <h4 className="font-bold text-white">1. State Encoder Network</h4>
                <p className="text-sm text-gray-400 mt-1">Processes conversation data into a rich state representation using embeddings and sales-specific features.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-6">
                <h4 className="font-bold text-white">2. Meta-Learning Module</h4>
                <p className="text-sm text-gray-400 mt-1">Assesses the model's confidence in its own predictions, allowing it to express uncertainty.</p>
              </div>
            </div>
            <div className="text-2xl text-gray-500">↓</div>
            <div className="grid md:grid-cols-2 gap-4 w-full">
              <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-6">
                <h4 className="font-bold text-white">3. Policy Network</h4>
                <p className="text-sm text-gray-400 mt-1">The core decision-maker. It takes the state representation and estimates the conversion probability.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-6">
                <h4 className="font-bold text-white">4. Value Network</h4>
                <p className="text-sm text-gray-400 mt-1">Estimates the long-term cumulative reward, helping the model understand the future impact of current turns.</p>
              </div>
            </div>
            <div className="text-2xl text-gray-500">↓</div>
            <div className="bg-white/5 border-l-4 border-blue-400 rounded-2xl shadow-lg w-full text-center p-4">
              <p className="font-semibold text-white">Output: Probability, Insights & Confidence</p>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="w-full max-w-6xl z-10 mx-auto mb-24">
          <h2 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500">Versatile Applications</h2>
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex border-b border-white/10 mb-6">
              <button onClick={() => setUseCaseTab('training')} className={`flex-1 py-3 px-1 text-center font-semibold border-b-2 transition-all duration-200 ${useCaseTab === 'training' ? 'text-pink-400 border-pink-400' : 'text-gray-400 border-transparent hover:text-white'}`}>Sales Training</button>
              <button onClick={() => setUseCaseTab('ab-testing')} className={`flex-1 py-3 px-1 text-center font-semibold border-b-2 transition-all duration-200 ${useCaseTab === 'ab-testing' ? 'text-pink-400 border-pink-400' : 'text-gray-400 border-transparent hover:text-white'}`}>A/B Testing</button>
              <button onClick={() => setUseCaseTab('assistance')} className={`flex-1 py-3 px-1 text-center font-semibold border-b-2 transition-all duration-200 ${useCaseTab === 'assistance' ? 'text-pink-400 border-pink-400' : 'text-gray-400 border-transparent hover:text-white'}`}>Real-time Assistance</button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-b-2xl shadow-lg p-8">
              {useCaseTab === 'training' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Analyze and Improve Sales Techniques</h3>
                  <p className="text-gray-300 mb-4">Use the model to dissect past conversations. By observing how conversion probability rises and falls, coaches can pinpoint exactly which phrases, questions, and strategies are effective and which ones are not, providing targeted feedback to sales reps.</p>
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-2">
                    <p className="text-pink-400 font-semibold mb-2">Example:</p>
                    <ul className="list-disc list-inside text-gray-200 space-y-1">
                      <li><span className="font-bold text-blue-300">Customer:</span> I'm comparing different CRM vendors.</li>
                      <li><span className="font-bold text-blue-300">Sales Rep:</span> Smart approach! What's most important to you?</li>
                      <li><span className="font-bold text-blue-300">Customer:</span> Integration with existing tools.</li>
                      <li><span className="font-bold text-blue-300">Sales Rep:</span> We integrate with 200+ tools. Which do you use?</li>
                    </ul>
                  </div>
                </div>
              )}
              {useCaseTab === 'ab-testing' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Quantitatively Test Sales Scripts</h3>
                  <p className="text-gray-300 mb-4">Stop guessing which sales script is better. Run two different approaches through the model to get a quantitative prediction of which one is more likely to lead to a conversion, allowing for data-driven optimization of your sales playbook.</p>
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-2">
                    <p className="text-pink-400 font-semibold mb-2">Example:</p>
                    <ul className="list-disc list-inside text-gray-200 space-y-1">
                      <li><span className="font-bold text-blue-300">Script A:</span> Customer: I need pricing | Sales Rep: Our Pro plan is $99/month per user.</li>
                      <li><span className="font-bold text-blue-300">Script B:</span> Customer: I need pricing | Sales Rep: Of course. To get you the most accurate pricing, what's your team size?</li>
                    </ul>
                  </div>
                </div>
              )}
              {useCaseTab === 'assistance' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Get Real-time Guidance During Calls</h3>
                  <p className="text-gray-300 mb-4">Integrate the model into live sales tools to provide reps with real-time suggestions. If customer engagement drops, the model can suggest asking an open-ended question to re-engage them.</p>
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-2">
                    <p className="text-pink-400 font-semibold mb-2">Example:</p>
                    <ul className="list-disc list-inside text-gray-200 space-y-1">
                      <li><span className="font-bold text-blue-300">Customer:</span> Your solution looks expensive compared to others.</li>
                      <li><span className="font-bold text-blue-300">Sales Rep:</span> I understand the investment is a consideration. Can we explore the long-term value and ROI it provides?</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="w-full max-w-6xl z-10 mx-auto mb-24">
          <h2 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500">About This Tool</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-200 mb-2">SalesDoc is a next-generation sales analytics and enablement platform powered by hybrid AI. It helps sales teams unlock actionable insights from conversations, improve conversion rates, and deliver real business impact in real time.</p>
            <p className="text-gray-400">Built by Devcool20 with a passion for sales, AI, and empowering teams to win more deals.</p>
          </div>
        </section>

        {/* CTA Section - moved below About This Tool */}
        <section id="cta-section" className="bg-black w-full max-w-4xl mx-auto rounded-2xl shadow-lg p-12 mt-12 mb-24 text-center border border-white/10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Boost Your Sales?</h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of sales professionals who are already using SalesDoc to 
            improve their conversion rates and close more deals.
          </p>
          <SignedOut>
            <SignInButton mode="modal" appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-gray-900/95 border border-white/10 shadow-2xl backdrop-blur-xl rounded-2xl",
                headerTitle: "text-white text-3xl font-bold",
                headerSubtitle: "text-gray-300",
                socialButtonsBlockButton: "bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300 rounded-xl",
                formFieldLabel: "text-white font-medium",
                formFieldInput: "bg-white/5 border border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 rounded-xl",
                formButtonPrimary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold transition-all duration-300 rounded-xl",
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
            }}>
              <button className="btn-premium">Start Free Trial</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/app" className="btn-premium">Go to Analyzer</Link>
          </SignedIn>
        </section>
      </div>
    </div>
  );
}
