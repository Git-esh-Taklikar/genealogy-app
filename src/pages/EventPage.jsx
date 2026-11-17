import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, joinEvent } from '../api/client';
import EventQRCode from '../components/EventQRCode';
import { Users, Calendar, MapPin, Tv, Search, ArrowRight } from 'lucide-react';

export default function EventPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvent();
  }, [code]);

  const loadEvent = async () => {
    try {
      const res = await getEvent(code);
      setEvent(res.data.event);
      setParticipants(res.data.participants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-gray-400">Loading event...</div>;
  }

  if (!event) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">Event not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Event header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
        <div className="flex flex-wrap gap-4 text-indigo-100">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{event.eventType}</span>
          {event.date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{event.date}</span>}
          {event.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.location}</span>}
          <span className="flex items-center gap-1"><Users className="w-4 h-4" />{event.participantCount} guests</span>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate(`/kiosk/${code}`)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-xl transition-colors font-medium min-h-[48px]"
          >
            <Tv className="w-5 h-5" /> Launch Kiosk Mode
          </button>
          <button
            onClick={() => navigate('/pathfinder')}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 px-5 py-2.5 rounded-xl transition-colors font-medium min-h-[48px]"
          >
            <Search className="w-5 h-5" /> Find Connection
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participants */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Relatives Here Today
          </h2>
          {participants.length === 0 ? (
            <p className="text-gray-400 py-8 text-center">No guests have joined yet. Share the QR code!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {p.avatarUrl ? (
                      <img src={p.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      p.fullName?.[0] || '?'
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{p.fullName}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <h3 className="font-bold text-gray-900 mb-4">Share This Event</h3>
          <EventQRCode code={code} eventName={event.name} size={180} />
          <div className="mt-4 bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Join Code</p>
            <p className="text-2xl font-mono font-bold text-indigo-600 tracking-widest">{code}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
