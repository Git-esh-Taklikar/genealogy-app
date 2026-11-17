import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { findPath, getPeople } from '../api/client';
import { useDebounce } from '../hooks/useDebounce';
import RelationshipPathOverlay from '../components/RelationshipPathOverlay';
import { Search, Sparkles, ArrowRight, Users, X } from 'lucide-react';

function PersonSearch({ label, selected, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      getPeople({ search: debouncedQuery, limit: 10 })
        .then((res) => {
          setResults(res.data.people || []);
          setOpen(true);
        })
        .catch(() => setResults([]));
    } else {
      setResults([]);
      setOpen(false);
    }
  }, [debouncedQuery]);

  if (selected) {
    return (
      <div className="flex items-center gap-3 bg-white border-2 border-indigo-200 rounded-xl p-3 min-h-[56px]">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {selected.fullName?.[0] || '?'}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{selected.fullName}</p>
          <p className="text-xs text-gray-500">{selected.birthYear ? `Born ${selected.birthYear}` : ''}</p>
        </div>
        <button onClick={() => onSelect(null)} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="text-sm font-medium text-gray-600 mb-1 block">{label}</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-none text-gray-900 min-h-[48px]"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setQuery(''); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left min-h-[48px]"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {p.fullName?.[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{p.fullName}</p>
                <p className="text-xs text-gray-500">{p.birthYear ? `Born ${p.birthYear}` : ''} {p.gender}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Pathfinder() {
  const { personNode } = useAuth();
  const [person1, setPerson1] = useState(null);
  const [person2, setPerson2] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill person A with logged-in user
  useEffect(() => {
    if (personNode && !person1) {
      setPerson1(personNode);
    }
  }, [personNode]);

  const handleDiscover = async () => {
    if (!person1 || !person2) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await findPath(person1.id, person2.id);
      setResult(res.data);
    } catch (err) {
      setError('Failed to find connection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" /> Ice Breaker Game
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">How Are We Related?</h1>
        <p className="text-gray-500">Discover the family connection between any two people</p>
      </motion.div>

      {/* Person selectors */}
      <div className="space-y-4 mb-6">
        <PersonSearch label="Person A" selected={person1} onSelect={setPerson1} />
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
          </div>
        </div>
        <PersonSearch label="Person B" selected={person2} onSelect={setPerson2} />
      </div>

      {/* Discover button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDiscover}
        disabled={!person1 || !person2 || loading}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg min-h-[56px]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Discovering...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" /> Discover Lineage!
          </span>
        )}
      </motion.button>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-8"
          >
            {result.found ? (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200 shadow-lg">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 flex-wrap justify-center mb-6">
                  {result.breadcrumb?.split(' → ').map((step, i, arr) => (
                    <React.Fragment key={i}>
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                        {step}
                      </span>
                      {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-amber-500" />}
                    </React.Fragment>
                  ))}
                </div>

                {/* Kinship titles */}
                <div className="text-center space-y-3">
                  <motion.h2
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="text-3xl font-bold text-amber-800"
                  >
                    {result.englishTitle}
                  </motion.h2>
                  <div className="flex flex-wrap justify-center gap-3">
                    <span className="bg-orange-100 text-orange-800 px-4 py-1.5 rounded-full text-sm font-medium">
                      🇮🇳 Hindi: {result.hindiTitle}
                    </span>
                    <span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-medium">
                      🇮🇳 Marathi: {result.marathiTitle}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    {result.generationsUp > 0 && `${result.generationsUp} generation${result.generationsUp > 1 ? 's' : ''} up`}
                    {result.generationsUp > 0 && result.generationsDown > 0 && ', '}
                    {result.generationsDown > 0 && `${result.generationsDown} generation${result.generationsDown > 1 ? 's' : ''} down`}
                    {' · '}Path length: {result.pathLength} hop{result.pathLength !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{result.message || 'No connection found.'}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
