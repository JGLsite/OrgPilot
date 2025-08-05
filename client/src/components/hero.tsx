import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section id="home" className="relative bg-gradient-to-br from-jgl-teal to-jgl-light-teal">
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="text-white space-y-8">
            <h1 className="text-5xl lg:text-6xl font-black leading-tight">
              Elevate Your<br/>
              <span className="text-jgl-pink">Gymnastics</span><br/>
              Journey
            </h1>
            <p className="text-xl lg:text-2xl font-light leading-relaxed opacity-90">
              Join the premier inter-gymnastics league connecting talented gymnasts across 8+ cities. Where Jewish values meet athletic excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => window.location.href = '/register'}
                className="bg-jgl-magenta hover:bg-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <i className="fas fa-user-plus mr-2"></i>Register as Gymnast
              </Button>
              <Button 
                onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline"
                className="bg-white hover:bg-gray-100 text-jgl-teal border-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <i className="fas fa-calendar-alt mr-2"></i>View Events
              </Button>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="bg-white bg-opacity-95 rounded-2xl p-8 shadow-2xl">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-black text-jgl-magenta">8+</div>
                <div className="text-gray-600 font-medium">Cities</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-black text-jgl-teal">500+</div>
                <div className="text-gray-600 font-medium">Gymnasts</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-black text-jgl-magenta">25+</div>
                <div className="text-gray-600 font-medium">Gyms</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-black text-jgl-teal">15</div>
                <div className="text-gray-600 font-medium">Years</div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-jgl-teal bg-opacity-10 rounded-xl">
              <p className="text-center text-jgl-teal font-semibold italic">
                "Compete with Excellence, Uphold Halacha"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
