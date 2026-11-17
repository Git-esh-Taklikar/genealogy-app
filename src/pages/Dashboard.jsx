import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getEvents, createEvent } from '../api/client';
import {
  TreePine, Search, Upload, Calendar, Plus, Users, GitBranch,
  Layers, ArrowRight, X,
} from 'lucide-react';

export default function Dashboard() {
  const { personNode } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: '', eventType: 'Wedding', date: '', location: '', kioskPin: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data.createdEvents || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createEvent(eventForm);
      setShowCreateEvent(false);
      setEventForm({ name: '', eventType: 'Wedding', date: '', location: '', kioskPin: '' });
      loadEvents();
    } catch (err) {
      console.error('Failed to create event:', err);
    } finally {
      setCreating(false);
    }
  };

  const cards = [
    {
      title: 'My Family Tree',
      desc: 'Explore your interactive family tree',
      icon: TreePine,
      color: 'from-emerald-500 to-teal-600',
      action: () => navigate(`/tree/${personNode?.id || '1'}`),
      disabled: false,
    },
    {
      title: 'Find Connection',
      desc: '"How are we related?" ice-breaker',
      icon: Search,
      color: 'from-amber-500 to-orange-600',
      action: () => navigate('/pathfinder'),
    },
    {
      title: 'Upload Excel',
      desc: 'Bulk-add relatives from a spreadsheet',
      icon: Upload,
      color: 'from-blue-500 to-indigo-600',
      action: () => navigate('/upload'),
    },
    {
      title: 'Events',
      desc: 'Create or join family gatherings',
      icon: Calendar,
      color: 'from-purple-500 to-pink-600',
      action: () => navigate('/events'),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome{personNode?.fullName ? `, ${personNode.fullName}` : ''}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Explore your family heritage and connections</p>
      </motion.div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.button
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={card.action}
            disabled={card.disabled}
            className="group relative overflow-hidden rounded-2xl p-6 text-left text-white shadow-lg hover:shadow-xl transition-all min-h-[140px] disabled:opacity-50"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color}`} />
            <div className="relative z-10">
              <card.icon className="w-8 h-8 mb-3 opacity-90" />
              <h3 className="font-bold text-lg">{card.title}</h3>
              <p className="text-sm text-white/80 mt-1">{card.desc}</p>
              <ArrowRight className="w-5 h-5 absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Events section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">My Events</h2>
          </div>
          <button
            onClick={() => setShowCreateEvent(true)}
            className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> New Event
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No events yet. Create one for your next family gathering!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {events.map((evt) => (
              <Link
                key={evt.id}
                to={`/event/${evt.joinCode}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{evt.name}</p>
                  <p className="text-sm text-gray-500">{evt.eventType} · Code: {evt.joinCode}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {evt.participantCount || 0} <Users className="w-3 h-3 inline" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Create Event</h3>
              <button onClick={() => setShowCreateEvent(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <input
                type="text"
                placeholder="Event name"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              />
              <select
                value={eventForm.eventType}
                onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              >
                <option value="Wedding">Wedding</option>
                <option value="Reunion">Family Reunion</option>
                <option value="Festival">Festival</option>
                <option value="Birthday">Birthday</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Location"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Kiosk PIN (4-6 digits)"
                value={eventForm.kioskPin}
                onChange={(e) => setEventForm({ ...eventForm, kioskPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
                minLength={4}
                maxLength={6}
              />
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 min-h-[48px]"
              >
                {creating ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
