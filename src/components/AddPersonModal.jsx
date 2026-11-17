import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, AlertCircle, Check, Users } from 'lucide-react';
import { createPerson, createRelationship } from '../api/client';

export default function AddPersonModal({ relType, referenceNode, onClose, onAdded }) {
  const relationshipName = typeof relType === 'string' ? relType : relType?.type || 'Relative';
  const targetNode = referenceNode || relType?.referenceNode;
  const refName = targetNode?.data?.fullName || targetNode?.fullName || 'Relative';
  const refId = targetNode?.id;

  // Default gender based on relationship type
  const defaultGender = () => {
    if (relationshipName === 'Father') return 'Male';
    if (relationshipName === 'Mother') return 'Female';
    if (relationshipName === 'Spouse') {
      const refGender = targetNode?.data?.gender || targetNode?.gender;
      return refGender === 'Male' ? 'Female' : refGender === 'Female' ? 'Male' : 'Other';
    }
    return 'Male';
  };

  const [formData, setFormData] = useState({
    fullName: '',
    gender: defaultGender(),
    isAlive: true,
    birthYear: '',
    dob: '',
    birthPlace: '',
    phone: '',
    email: '',
    subType: 'Biological',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conflictReview, setConflictReview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const establishRelationship = async (newPersonId) => {
    if (!refId) return;

    let sourceId = '';
    let targetId = '';
    let edgeRelType = 'PARENT_OF';

    if (relationshipName === 'Father' || relationshipName === 'Mother') {
      sourceId = newPersonId;
      targetId = refId;
      edgeRelType = 'PARENT_OF';
    } else if (relationshipName === 'Child') {
      sourceId = refId;
      targetId = newPersonId;
      edgeRelType = 'PARENT_OF';
    } else if (relationshipName === 'Spouse') {
      sourceId = refId;
      targetId = newPersonId;
      edgeRelType = 'SPOUSE_OF';
    } else if (relationshipName === 'Sibling') {
      sourceId = refId;
      targetId = newPersonId;
      edgeRelType = 'SIBLING_OF';
    }

    await createRelationship({
      sourceId,
      targetId,
      relType: edgeRelType,
      subType: formData.subType || 'Biological',
    });
  };

  const handleSubmit = async (e, forceCreate = false) => {
    if (e) e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Please enter a full name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        gender: formData.gender,
        isAlive: formData.isAlive,
        subType: formData.subType,
        birthYear: formData.birthYear ? parseInt(formData.birthYear, 10) : undefined,
        dob: formData.dob || undefined,
        birthPlace: formData.birthPlace.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
      };

      if (forceCreate) {
        payload.forceCreate = true;
      }

      const res = await createPerson(payload);
      const data = res.data;

      // Handle conflict review return from deduplication engine
      if (data.action === 'needs_review' && !forceCreate) {
        setConflictReview(data);
        setLoading(false);
        return;
      }

      const createdPerson = data.person || data;
      const createdId = createdPerson.id;

      if (createdId && refId) {
        await establishRelationship(createdId);
      }

      onAdded();
    } catch (err) {
      console.error('Failed to create person or relationship:', err);
      const msg = err.response?.data?.detail || 'An error occurred while saving relative.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUseExisting = async (existingPerson) => {
    setLoading(true);
    setError('');
    try {
      if (existingPerson?.id && refId) {
        await establishRelationship(existingPerson.id);
      }
      onAdded();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to link existing person.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-indigo-700 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-2">
              <UserPlus className="w-3.5 h-3.5" />
              Add Relative
            </div>
            <h2 className="text-xl font-bold">
              Add {relationshipName}
            </h2>
            <p className="text-indigo-100 text-xs mt-0.5">
              Connecting relative to <span className="font-semibold text-white">{refName}</span>
            </p>
          </div>

          {/* Conflict review modal step */}
          {conflictReview ? (
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-bold">Possible Duplicate Detected</p>
                  <p className="text-xs text-amber-700 mt-1">
                    A person with a similar name or profile already exists in the family graph ({Math.round((conflictReview.score || 0.8) * 100)}% match).
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Users className="w-4 h-4" /> Existing Match in Graph
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-1">
                  <p className="font-bold text-gray-900">{conflictReview.existingPerson?.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {conflictReview.existingPerson?.gender}
                    {conflictReview.existingPerson?.birthYear ? ` · Born ${conflictReview.existingPerson.birthYear}` : ''}
                    {conflictReview.existingPerson?.birthPlace ? ` · ${conflictReview.existingPerson.birthPlace}` : ''}
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleUseExisting(conflictReview.existingPerson)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm text-sm transition-colors"
                >
                  <Check className="w-4 h-4" /> Link to Existing Person
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(null, true)}
                  disabled={loading}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl text-sm transition-colors"
                >
                  No, Create as New Person
                </button>
                <button
                  type="button"
                  onClick={() => setConflictReview(null)}
                  disabled={loading}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-1"
                >
                  Back to edit form
                </button>
              </div>
            </div>
          ) : (
            /* Regular Form */
            <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 overflow-y-auto space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Rameshchandra Patel"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    name="isAlive"
                    value={formData.isAlive ? 'true' : 'false'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isAlive: e.target.value === 'true' }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  >
                    <option value="true">Living</option>
                    <option value="false">Deceased</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Birth Year</label>
                  <input
                    type="number"
                    name="birthYear"
                    placeholder="e.g. 1968"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.birthYear}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Birth Place</label>
                  <input
                    type="text"
                    name="birthPlace"
                    placeholder="e.g. Pune, MH"
                    value={formData.birthPlace}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              {(relationshipName === 'Father' || relationshipName === 'Mother' || relationshipName === 'Child') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Lineage Type</label>
                  <select
                    name="subType"
                    value={formData.subType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  >
                    <option value="Biological">Biological</option>
                    <option value="Adoptive">Adoptive</option>
                    <option value="Step">Step</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91..."
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="relative@..."
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Save Relative
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

