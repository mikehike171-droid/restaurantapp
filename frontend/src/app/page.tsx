'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8f9fc] text-[#111827] font-sans">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-semibold mb-6 animate-fade-in">
            <span>✨</span> Next Generation Restaurant Management
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            Dine Smart, <br />Manage Seamlessly
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Welcome to the future of restaurant ordering. A platform designed for speed, 
            efficiency, and an unparalleled customer experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/admin/login" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
              Administrator Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon="📱" 
              title="QR Ordering" 
              description="Customers scan, browse, and order directly from their table without waiting."
            />
            <FeatureCard 
              icon="👨‍🍳" 
              title="Kitchen Ops" 
              description="Real-time order management system to keep your kitchen running like clockwork."
            />
            <FeatureCard 
              icon="📊" 
              title="Live Insights" 
              description="Monitor revenue, active orders, and table occupancy from a single dashboard."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Experience the Flow</h2>
          <div className="space-y-12">
            <Step number="1" title="Scan Your Table QR" description="Every table has a unique QR code generated from your dashboard." />
            <Step number="2" title="Select Your Items" description="A beautiful, interactive menu grouped by categories for easy browsing." />
            <Step number="3" title="Order & Relax" description="Orders go straight to the kitchen. No more missed items or delays." />
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-100">
        &copy; {new Date().getFullYear()} RestaurantOS Management System
      </footer>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center group p-4">
      <div className="w-16 h-16 bg-gray-50 text-3xl flex items-center justify-center rounded-2xl mx-auto mb-6 group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-8 text-left max-w-md mx-auto">
      <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  );
}
