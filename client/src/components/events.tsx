import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Events() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events'],
  });

  if (isLoading) {
    return (
      <section id="events" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Upcoming Events</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us for exciting gymnastics competitions and community events throughout the year
          </p>
        </div>

        {/* Featured Upcoming Event */}
        <div className="bg-gradient-to-r from-jgl-magenta to-jgl-pink rounded-2xl p-8 mb-12 text-white">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <span className="font-semibold">FEATURED EVENT</span>
                </div>
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <span className="font-semibold">MAR 15, 2024</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold">Spring Championship Meet</h3>
              <p className="text-lg opacity-90">
                Join us for our biggest competition of the season featuring gymnasts from all participating cities. Multiple sessions available for different levels.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-white text-jgl-magenta hover:bg-gray-100 px-6 py-3 rounded-full font-semibold transition-colors duration-200"
                >
                  <i className="fas fa-user-plus mr-2"></i>Register to Compete ($100)
                </Button>
                <Button 
                  variant="outline"
                  className="bg-white bg-opacity-20 text-white border-white hover:bg-opacity-30 px-6 py-3 rounded-full font-semibold transition-all duration-200"
                >
                  <i className="fas fa-ticket-alt mr-2"></i>Buy Spectator Tickets
                </Button>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="w-full h-64 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-trophy text-6xl mb-2 opacity-70"></i>
                  <p className="font-semibold">Competition Venue</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Placeholder events since we don't have real data yet */}
          {[
            {
              id: 1,
              date: "APR 12",
              location: "Brooklyn, NY",
              name: "Regional Qualifier",
              description: "Levels 3-4 competition hosted by Elite Gymnastics Brooklyn",
              registered: 32
            },
            {
              id: 2,
              date: "MAY 8", 
              location: "Lakewood, NJ",
              name: "Fun Meet",
              description: "Pre-team and recreational gymnasts showcase event",
              registered: 18
            },
            {
              id: 3,
              date: "JUN 2",
              location: "Miami, FL", 
              name: "Season Finale",
              description: "Year-end championship and awards celebration",
              registered: null
            }
          ].map((event) => (
            <Card key={event.id} className="rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <div className="text-gray-600 text-center">
                  <i className="fas fa-star text-4xl mb-2"></i>
                  <p className="font-semibold">Gymnastics Event</p>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-jgl-teal text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {event.date}
                  </span>
                  <span className="text-gray-500 text-sm">{event.location}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{event.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <i className="fas fa-users mr-1"></i>
                    {event.registered ? `${event.registered} registered` : 'Registration opens soon'}
                  </div>
                  <button className="text-jgl-teal hover:text-jgl-magenta font-semibold text-sm">
                    Learn More <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Event Photo Gallery Preview */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Event Photo Gallery</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer flex items-center justify-center"
              >
                <div className="text-gray-500 text-center">
                  <i className="fas fa-image text-3xl mb-2"></i>
                  <p className="text-sm">Gallery Photo {i}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <Button className="bg-jgl-teal hover:bg-jgl-light-teal text-white px-8 py-3 rounded-full font-semibold transition-all duration-200">
              <i className="fas fa-images mr-2"></i>View Full Gallery
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
