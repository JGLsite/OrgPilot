export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="text-jgl-magenta font-black text-3xl">JGL</div>
              <div>
                <h3 className="text-jgl-teal font-semibold text-lg">Jewish Gymnastics League</h3>
                <p className="text-gray-400 text-sm italic">Where standards and excellence meet</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Connecting talented gymnasts across 8+ cities through competition that honors both athletic excellence and Jewish values.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#home" 
                  className="text-gray-400 hover:text-jgl-teal transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#join" 
                  className="text-gray-400 hover:text-jgl-teal transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Join Us
                </a>
              </li>
              <li>
                <a 
                  href="#events" 
                  className="text-gray-400 hover:text-jgl-teal transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Events
                </a>
              </li>
              <li>
                <a 
                  href="#news" 
                  className="text-gray-400 hover:text-jgl-teal transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  News
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="text-gray-400 hover:text-jgl-teal transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>info@jglgymnastics.com</li>
              <li>(555) 123-4567</li>
              <li className="text-sm">Serving 8+ cities nationwide</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 Jewish Gymnastics League. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-jgl-teal transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-jgl-teal transition-colors duration-200">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
