import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getEvents, createEvent, joinEvent } from '../api/client';
import { Calendar, Plus, Users, Hash, MapPin, ArrowRight, X } from 'lucide-react';

export default function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', eventType: 'Wedding', date: '', location: '', kioskPin: '' });

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data.createdEvents || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError('');
    try {
      const res = await joinEvent(joinCode.toUpperCase());
      navigate(`/event/${joinCode.toUpperCase()}`);
    } catch (err) {
      setJoinError(err.response?.data?.detail || 'Failed to join event');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createEvent(form);
      setShowCreate(false);
      loadEvents();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Events</h1>
          <p className="text-gray-500 mt-1">Create or join family gatherings</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium min-h-[48px]"
        >
          <Plus className="w-5 h-5" /> Create Event
        </button>
      </div>

      {/* Join via code */}
      <form onSubmit={handleJoin} className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
          <Hash className="w-5 h-5" /> Join with Event Code
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter 6-character code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="flex-1 px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none uppercase tracking-widest font-mono text-lg min-h-[48px]"
          />
          <button
            type="submit"
            disabled={joinCode.length < 6}
            className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 min-h-[48px]"
          >
            Join
          </button>
        </div>
        {joinError && <p className="text-red-500 text-sm mt-2">{joinError}</p>}
      </form>

      {/* Events list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">No events yet. Create one for your next family gathering!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((evt, i) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/event/${evt.joinCode}`}
                className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                  <Calendar className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{evt.name}</h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                    <span>{evt.eventType}</span>
                    {evt.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{evt.date}</span>}
                    {evt.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{evt.location}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-lg font-bold text-indigo-600">{evt.participantCount || 0}</p>
                    <p className="text-xs text-gray-400">guests</p>
                  </div>
                  <div className="bg-gray-100 px-3 py-1.5 rounded-lg font-mono text-sm font-bold text-gray-700">
                    {evt.joinCode}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Create Event</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="text" placeholder="Event name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none" required />
              <select value={form.eventType} onChange={(e) => setForm({...form, eventType: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none">
                <option value="Wedding">Wedding</option><option value="Reunion">Reunion</option>
                <option value="Festival">Festival</option><option value="Birthday">Birthday</option><option value="Other">Other</option>
              </select>
              <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
              <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
              <input type="text" placeholder="Kiosk PIN (4-6 digits)" value={form.kioskPin}
                onChange={(e) => setForm({...form, kioskPin: e.target.value.replace(/\D/g,'').slice(0,6)})}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none" required minLength={4} />
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 min-h-[48px]">
                Create Event
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
