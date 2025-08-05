export default function About() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* About Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-4">The JGL</h2>
              <div className="w-20 h-1 bg-jgl-magenta rounded-full"></div>
            </div>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              The Jewish Gymnastics League (JGL) is a national initiative formed by frum owned gyms in Lakewood, Brooklyn, Edison, Monsey, Miami, Passaic, Baltimore and 5 Towns. This unique opportunity allows our girls to compete against gymnasts of similar ages, abilities, and lifestyles from other cities, in a competition judged by professional certified USAG judges.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-jgl-teal rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-medal text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Professional Standards</h3>
                  <p className="text-gray-600 text-sm">USAG certified judges ensure fair and professional competition</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-jgl-magenta rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-heart text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Jewish Values</h3>
                  <p className="text-gray-600 text-sm">Maintaining halacha while pursuing athletic excellence</p>
                </div>
              </div>
            </div>
          </div>

          {/* About Image */}
          <div className="relative">
            <div className="w-full h-80 bg-gradient-to-br from-jgl-teal to-jgl-light-teal rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="text-white text-center">
                <i className="fas fa-trophy text-6xl mb-4 opacity-50"></i>
                <p className="text-xl font-semibold">Excellence Through Community</p>
              </div>
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-jgl-magenta to-jgl-pink rounded-full flex items-center justify-center">
                  <i className="fas fa-trophy text-white"></i>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Excellence</div>
                  <div className="text-sm text-gray-600">Driven by Jewish Values</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
