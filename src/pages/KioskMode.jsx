import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tv,
  Maximize2,
  Minimize2,
  Sparkles,
  Users,
  Search,
  ArrowRight,
  RotateCcw,
  Clock,
  QrCode,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { getEvent, findPath } from '../api/client';
import { useIdleTimer } from '../hooks/useIdleTimer';
import EventQRCode from '../components/EventQRCode';
import { getInitials } from '../utils/helpers';

export default function KioskMode() {
  const { code } = useParams();
  const [eventData, setEventData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pathfinder selection state
  const [personA, setPersonA] = useState(null);
  const [personB, setPersonB] = useState(null);
  const [pathResult, setPathResult] = useState(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [activeSlot, setActiveSlot] = useState('A'); // 'A' or 'B'
  const [filterQuery, setFilterQuery] = useState('');

  // 90-second idle timer reset
  const { isIdle, secondsRemaining, resetTimer } = useIdleTimer(90);

  const resetKiosk = useCallback(() => {
    setPersonA(null);
    setPersonB(null);
    setPathResult(null);
    setActiveSlot('A');
    setFilterQuery('');
    resetTimer();
  }, [resetTimer]);

  // When idle timeout hits, reset state to attract mode
  useEffect(() => {
    if (isIdle) {
      resetKiosk();
    }
  }, [isIdle, resetKiosk]);

  // Fetch event details
  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        const res = await getEvent(code);
        setEventData(res.data.event);
        setParticipants(res.data.participants || []);
      } catch (err) {
        console.error('Failed to load kiosk event:', err);
        setError('Event not found or failed to load.');
      } finally {
        setLoading(false);
      }
    }
    if (code) loadEvent();
  }, [code]);

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.warn);
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.warn);
      }
      setIsFullscreen(false);
    }
  };

  // Find Path between A and B
  const handleDiscoverPath = async () => {
    if (!personA || !personB) return;
    setPathLoading(true);
    resetTimer();
    try {
      const res = await findPath(personA.id, personB.id);
      setPathResult(res.data);
    } catch (err) {
      console.error('Pathfinder error:', err);
      setPathResult({
        found: false,
        message: 'Could not resolve path between the selected persons.',
      });
    } finally {
      setPathLoading(false);
    }
  };

  const handleSelectPerson = (person) => {
    resetTimer();
    if (activeSlot === 'A') {
      setPersonA(person);
      setActiveSlot('B');
      setFilterQuery('');
    } else {
      setPersonB(person);
      setFilterQuery('');
    }
  };

  // Filter participants
  const filteredParticipants = participants.filter((p) =>
    p.fullName?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Virtual keyboard keys for touch screens
  const touchKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'Y', 'Z'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl font-bold tracking-wide text-amber-200">Loading Kiosk Mode...</p>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 text-center">
        <p className="text-2xl font-bold text-rose-400 mb-4">{error || 'Event Not Found'}</p>
        <Link to="/dashboard" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none overflow-x-hidden font-sans">
      {/* Top Banner / TV Navigation */}
      <header className="px-8 py-5 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md flex items-center justify-between gap-6 z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
            🌳
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-white">{eventData.name}</h1>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-mono text-xs font-bold border border-amber-400/30">
                CODE: {code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Family Tree & Relationship Pathfinder · {participants.length} Attending
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Idle indicator */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Idle reset in {secondsRemaining}s</span>
          </div>

          <button
            onClick={resetKiosk}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> Reset
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
            title="Toggle TV Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Kiosk Content */}
      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1920px] mx-auto w-full">
        {/* Left Column (8 cols): Interactive Ice Breaker */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* Person Selection Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Interactive Game
                </span>
                <h2 className="text-2xl font-extrabold text-white">How Are We Related?</h2>
              </div>
              <span className="text-xs text-slate-400">
                Tap two guests to uncover your exact multi-generational bond
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
              {/* Slot A */}
              <div
                onClick={() => {
                  setActiveSlot('A');
                  resetTimer();
                }}
                className={`md:col-span-5 p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                  activeSlot === 'A'
                    ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10'
                    : personA
                    ? 'border-slate-700 bg-slate-800/80'
                    : 'border-dashed border-slate-700 hover:border-slate-500 bg-slate-900'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Person 1 {activeSlot === 'A' && '(Select below)'}
                </div>
                {personA ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-bold flex items-center justify-center">
                      {personA.fullName?.[0] || '1'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-base truncate">{personA.fullName}</p>
                      <p className="text-xs text-slate-400">{personA.gender || 'Guest'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-slate-500 py-2">Tap to choose guest A</p>
                )}
              </div>

              {/* Center Icon */}
              <div className="md:col-span-1 flex justify-center">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                  <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
                </div>
              </div>

              {/* Slot B */}
              <div
                onClick={() => {
                  setActiveSlot('B');
                  resetTimer();
                }}
                className={`md:col-span-5 p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                  activeSlot === 'B'
                    ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10'
                    : personB
                    ? 'border-slate-700 bg-slate-800/80'
                    : 'border-dashed border-slate-700 hover:border-slate-500 bg-slate-900'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Person 2 {activeSlot === 'B' && '(Select below)'}
                </div>
                {personB ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-500 text-white font-bold flex items-center justify-center">
                      {personB.fullName?.[0] || '2'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-base truncate">{personB.fullName}</p>
                      <p className="text-xs text-slate-400">{personB.gender || 'Guest'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-slate-500 py-2">Tap to choose guest B</p>
                )}
              </div>
            </div>

            {/* Discover Button */}
            {personA && personB && (
              <div className="mt-5 flex justify-center">
                <button
                  onClick={handleDiscoverPath}
                  disabled={pathLoading}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2"
                >
                  {pathLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  Calculate Lineage Path!
                </button>
              </div>
            )}
          </div>

          {/* Result Card or Participant Directory */}
          {pathResult ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-amber-400/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setPathResult(null)}
                className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800"
              >
                Back to Guest List
              </button>

              {pathResult.found ? (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Kinship Result
                  </div>

                  <h3 className="text-4xl font-black text-amber-300 tracking-tight">
                    {pathResult.englishTitle}
                  </h3>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {pathResult.hindiTitle && (
                      <span className="px-4 py-2 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-200 font-bold text-base">
                        🇮🇳 Hindi: {pathResult.hindiTitle}
                      </span>
                    )}
                    {pathResult.marathiTitle && (
                      <span className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-200 font-bold text-base">
                        🇮🇳 Marathi: {pathResult.marathiTitle}
                      </span>
                    )}
                  </div>

                  {pathResult.breadcrumb && (
                    <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-xl mx-auto flex items-center justify-center gap-2 flex-wrap">
                      {pathResult.breadcrumb.split(' → ').map((step, i, arr) => (
                        <React.Fragment key={i}>
                          <span className="text-xs font-bold text-white px-3 py-1 bg-slate-800 rounded-lg">
                            {step}
                          </span>
                          {i < arr.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xl font-bold text-slate-300">{pathResult.message}</p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Participant Directory & Touch Filter */
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex-1 flex flex-col min-h-[380px]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base text-white">
                    Select Guest for Slot {activeSlot}
                  </h3>
                </div>

                {/* Touch Alphabet Filter */}
                <div className="flex flex-wrap gap-1 max-w-md justify-end">
                  <button
                    onClick={() => {
                      setFilterQuery('');
                      resetTimer();
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-bold ${
                      filterQuery === '' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    All
                  </button>
                  {touchKeys.map((letter) => (
                    <button
                      key={letter}
                      onClick={() => {
                        setFilterQuery(letter);
                        resetTimer();
                      }}
                      className={`w-6 h-6 rounded text-[11px] font-bold flex items-center justify-center transition-all ${
                        filterQuery.toUpperCase() === letter
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto max-h-[440px] pr-1">
                {filteredParticipants.map((p) => {
                  const isSelected = personA?.id === p.id || personB?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPerson(p)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-white'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {p.fullName?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">{p.fullName}</p>
                        <p className="text-[10px] text-slate-400">{p.gender || 'Guest'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Event QR Code & Mobile Join Callout */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              Join On Your Phone
            </span>
            <h3 className="text-xl font-bold text-white mb-4">Scan Event QR Code</h3>

            <div className="p-4 bg-white rounded-3xl shadow-2xl mb-4">
              <EventQRCode code={code} eventName={eventData.name} size={220} showControls={false} />
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 w-full border border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Event Join Code
              </p>
              <p className="text-3xl font-black font-mono tracking-widest text-amber-400 mt-1">
                {code}
              </p>
            </div>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Open camera on any smartphone to join this gathering, trace lineage, and add family members directly to the live tree!
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-700/30 rounded-3xl p-6 text-center">
            <Heart className="w-6 h-6 text-rose-400 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-white">Multi-Generational Heritage</h4>
            <p className="text-xs text-slate-300 mt-1">
              Preserving memories and connecting generations across Indian families worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

