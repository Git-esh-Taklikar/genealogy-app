import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, ChevronRight, X, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';

export default function ClaimNodeBanner({ nodes = [] }) {
  const navigate = useNavigate();
  const { setPersonNode, claimNode: authClaimNode } = useAuth();
  const [claimableList, setClaimableList] = useState(nodes);
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !claimableList || claimableList.length === 0) {
    return null;
  }

  const handleClaim = async (node) => {
    setClaimingId(node.id);
    setError('');
    try {
      let claimedPerson = null;
      if (authClaimNode) {
        try {
          claimedPerson = await authClaimNode(node.id);
        } catch (e) {
          // Fallback to /api/auth/claim
          const res = await client.post('/api/auth/claim', { personId: node.id });
          claimedPerson = res.data?.personNode || res.data;
        }
      } else {
        const res = await client.post('/api/auth/claim', { personId: node.id });
        claimedPerson = res.data?.personNode || res.data;
      }

      if (claimedPerson && setPersonNode) {
        setPersonNode(claimedPerson);
      }

      // Remove from list
      const remaining = claimableList.filter((n) => n.id !== node.id);
      setClaimableList(remaining);

      // Navigate to tree or dashboard
      navigate(`/tree/${node.id}`);
    } catch (err) {
      console.error('Failed to claim profile:', err);
      setError(err.response?.data?.detail || 'Failed to claim this profile.');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-600/20 border border-amber-300/40 backdrop-blur-md text-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400 text-amber-950 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-200">
                Matching Profiles Found ({claimableList.length})
              </h3>
              <p className="text-xs text-amber-100/80">
                Relatives added these profiles matching your email or phone. Claim your node to connect your tree!
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-300 bg-rose-950/40 p-2 rounded-lg mb-3 border border-rose-500/30">
            {error}
          </p>
        )}

        <div className="space-y-2">
          {claimableList.map((node) => (
            <div
              key={node.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-950 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {node.fullName?.[0] || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-white truncate">{node.fullName}</p>
                  <p className="text-[10px] text-amber-100/70">
                    {node.gender || 'Person'} {node.birthYear ? `· Born ${node.birthYear}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleClaim(node)}
                disabled={claimingId === node.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow transition-all disabled:opacity-50 flex-shrink-0"
              >
                {claimingId === node.id ? (
                  <div className="w-3.5 h-3.5 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
                <span>Claim This Node</span>
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

