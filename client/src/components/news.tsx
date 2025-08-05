import { Card, CardContent } from '@/components/ui/card';

export default function News() {
  const newsArticles = [
    {
      id: 1,
      category: "COMPETITION",
      date: "March 5, 2024",
      title: "Winter Championship Results",
      description: "Congratulations to all gymnasts who participated in our winter championship. Outstanding performances across all levels...",
      categoryColor: "bg-jgl-teal"
    },
    {
      id: 2,
      category: "ANNOUNCEMENT", 
      date: "February 28, 2024",
      title: "New Gym Joins JGL",
      description: "We're excited to welcome Precision Gymnastics from Philadelphia to the JGL family. Their team of talented gymnasts...",
      categoryColor: "bg-jgl-magenta"
    },
    {
      id: 3,
      category: "UPDATE",
      date: "February 20, 2024", 
      title: "New Challenge System Launch",
      description: "Our enhanced gamification platform is now live! Gymnasts can participate in skill challenges and earn points...",
      categoryColor: "bg-jgl-teal"
    }
  ];

  return (
    <section id="news" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Latest News</h2>
          <p className="text-xl text-gray-600">
            Stay updated with the latest from the JGL community
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsArticles.map((article) => (
            <Card key={article.id} className="rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <div className="text-gray-600 text-center">
                  <i className="fas fa-newspaper text-4xl mb-2"></i>
                  <p className="font-semibold">News Article</p>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`${article.categoryColor} text-white px-2 py-1 rounded text-xs font-semibold`}>
                    {article.category}
                  </span>
                  <span className="text-gray-500 text-sm">{article.date}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{article.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{article.description}</p>
                
                <button className="text-jgl-teal hover:text-jgl-magenta font-semibold text-sm">
                  Read More <i className="fas fa-arrow-right ml-1"></i>
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
