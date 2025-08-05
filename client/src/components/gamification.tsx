export default function Gamification() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Gamification Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-4">Gamified Challenges</h2>
              <div className="w-20 h-1 bg-jgl-magenta rounded-full"></div>
            </div>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Stay motivated and engaged with our unique challenge system. Earn points, compete on leaderboards, and redeem exciting rewards while improving your gymnastics skills.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-jgl-magenta bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-trophy text-jgl-magenta"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Skill Challenges</h3>
                  <p className="text-gray-600 text-sm">Complete skill-based challenges to earn points and improve your abilities</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-jgl-teal bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-list-ol text-jgl-teal"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Leaderboards</h3>
                  <p className="text-gray-600 text-sm">Compete with gymnasts across levels, teams, and the entire league</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-jgl-magenta bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-gift text-jgl-magenta"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Rewards Store</h3>
                  <p className="text-gray-600 text-sm">Redeem your earned points for exciting prizes and gymnastics gear</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gamification Visual */}
          <div className="bg-gradient-to-br from-jgl-magenta to-jgl-pink rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Current Challenge</h3>
            
            <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Perfect Your Handstand</h4>
                <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm">50 pts</span>
              </div>
              <p className="text-sm opacity-90 mb-4">Hold a handstand for 30 seconds without falling</p>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{width: '70%'}}></div>
              </div>
              <div className="text-xs mt-2 opacity-80">Progress: 7/10 gymnasts completed</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">1,250</div>
                <div className="text-sm opacity-80">Your Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">#3</div>
                <div className="text-sm opacity-80">Your Rank</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
