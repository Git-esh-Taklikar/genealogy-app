import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Share2, Check, Users } from 'lucide-react';
import { getInitials } from '../utils/helpers';

export default function RelationshipPathOverlay({ result, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleShare = async () => {
    const summary = `${result.englishTitle || 'Relative'} (Hindi: ${result.hindiTitle || 'N/A'}, Marathi: ${result.marathiTitle || 'N/A'}) - ${result.breadcrumb || ''}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'How We Are Related',
          text: summary,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header gradient banner */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Kinship Connection
            </div>

            <h2 className="text-2xl font-bold">How Are We Related?</h2>
            <p className="text-amber-100 text-sm mt-0.5">
              Verified lineage through graph shortest path
            </p>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {!result.found ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">No Direct Path Found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  {result.message || 'These two people appear to belong to different family branches not yet connected in the tree.'}
                </p>
              </div>
            ) : (
              <>
                {/* Kinship Title Highlights */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/80 text-center space-y-3">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-extrabold text-amber-900"
                  >
                    {result.englishTitle || 'Relative'}
                  </motion.div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    {result.hindiTitle && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-900 font-semibold text-sm shadow-sm border border-orange-200">
                        <span>🇮🇳 Hindi:</span>
                        <span>{result.hindiTitle}</span>
                      </span>
                    )}
                    {result.marathiTitle && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 font-semibold text-sm shadow-sm border border-amber-200">
                        <span>🇮🇳 Marathi:</span>
                        <span>{result.marathiTitle}</span>
                      </span>
                    )}
                  </div>

                  {/* Metadata subtitle */}
                  <div className="text-xs text-gray-500 pt-2 flex items-center justify-center gap-2 flex-wrap">
                    {result.generationsUp > 0 && (
                      <span className="bg-white/80 px-2 py-0.5 rounded border border-gray-200">
                        {result.generationsUp} gen up
                      </span>
                    )}
                    {result.generationsDown > 0 && (
                      <span className="bg-white/80 px-2 py-0.5 rounded border border-gray-200">
                        {result.generationsDown} gen down
                      </span>
                    )}
                    {result.pathLength !== undefined && (
                      <span className="bg-white/80 px-2 py-0.5 rounded border border-gray-200">
                        {result.pathLength} connection hop{result.pathLength === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Breadcrumb pills */}
                {result.breadcrumb && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Relationship Steps
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                      {result.breadcrumb.split(' → ').map((step, idx, arr) => (
                        <React.Fragment key={idx}>
                          <span className="bg-white px-3 py-1 rounded-lg text-xs font-semibold text-gray-800 shadow-sm border border-gray-200">
                            {step}
                          </span>
                          {idx < arr.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Path Nodes Visual List */}
                {result.pathNodes && result.pathNodes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Connecting Path Members
                    </h4>
                    <div className="space-y-2">
                      {result.pathNodes.map((node, index) => (
                        <div
                          key={node.id || index}
                          className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-amber-200 transition-colors shadow-sm"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {index + 1}
                          </div>

                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold text-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                            {node.avatarUrl ? (
                              <img
                                src={node.avatarUrl}
                                alt={node.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getInitials(node.fullName || 'User')
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {node.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {node.gender || 'Unknown'}
                              {node.birthYear ? ` · Born ${node.birthYear}` : ''}
                              {node.isAlive === false ? ' · Deceased' : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              onClick={handleShare}
              disabled={!result.found}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm transition-all disabled:opacity-40"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard!' : 'Share Kinship'}
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold text-sm rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

