import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import About from "@/components/about";
import JoinUs from "@/components/join-us";
import Events from "@/components/events";
import Gamification from "@/components/gamification";
import News from "@/components/news";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <About />
      <JoinUs />
      <Events />
      <div className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Member Access</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access your personalized portal with one secure login
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-jgl-magenta rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-white text-xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Member Login</h3>
              <p className="text-gray-600">
                Gyms, coaches, and gymnasts - access your personalized dashboard
              </p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/api/login'}
                className="w-full bg-jgl-magenta hover:bg-pink-600 text-white py-4 rounded-full font-semibold transition-colors duration-200 text-lg"
              >
                Sign In to Your Portal
              </button>
              
              <button 
                onClick={() => window.location.href = '/demo-login'}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-full font-semibold transition-colors duration-200"
              >
                Demo Login (Test Platform)
              </button>
            </div>
          </div>
        </div>
      </div>
      <Gamification />
      <News />
      <Contact />
      <Footer />
    </div>
  );
}
