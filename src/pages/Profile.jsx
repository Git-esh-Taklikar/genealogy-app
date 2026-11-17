import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Save,
  Camera,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPerson, updatePerson, getPresignedUrl } from '../api/client';
import { compressAvatar, readFileAsDataUrl } from '../utils/imageCompression';
import { getInitials } from '../utils/helpers';
import PrivacyBadge from '../components/PrivacyBadge';

export default function Profile() {
  const { user, personNode, setPersonNode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    birthYear: '',
    dob: '',
    birthPlace: '',
    phone: '',
    email: '',
    privacyLevel: 'FAMILY_ONLY',
    avatarUrl: '',
    isAlive: true,
  });

  const personId = personNode?.id;

  // Load latest Person profile
  useEffect(() => {
    async function loadProfile() {
      if (!personId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getPerson(personId);
        const p = res.data.person || res.data;
        setFormData({
          fullName: p.fullName || user?.displayName || '',
          gender: p.gender || 'Male',
          birthYear: p.birthYear ? String(p.birthYear) : '',
          dob: p.dob || '',
          birthPlace: p.birthPlace || '',
          phone: p.phone || '',
          email: p.email || user?.email || '',
          privacyLevel: p.privacyLevel || 'FAMILY_ONLY',
          avatarUrl: p.avatarUrl || '',
          isAlive: p.isAlive ?? true,
        });
      } catch (err) {
        console.warn('Could not fetch person node:', err);
        // Fallback to auth context
        if (personNode) {
          setFormData((prev) => ({
            ...prev,
            fullName: personNode.fullName || user?.displayName || '',
            gender: personNode.gender || 'Male',
            birthYear: personNode.birthYear ? String(personNode.birthYear) : '',
            email: personNode.email || user?.email || '',
            avatarUrl: personNode.avatarUrl || '',
          }));
        }
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [personId, personNode, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Avatar upload with WebP compression
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMessage('');
    try {
      // 1. Compress client-side to <= 35KB WebP
      const compressed = await compressAvatar(file);
      const dataUrl = await readFileAsDataUrl(compressed);

      let finalUrl = dataUrl;

      // 2. Attempt R2 presigned upload if available
      try {
        const ext = 'webp';
        const filename = `avatar_${personId || 'user'}_${Date.now()}.${ext}`;
        const presignRes = await getPresignedUrl(filename, 'image/webp');
        if (presignRes.data?.uploadUrl) {
          await fetch(presignRes.data.uploadUrl, {
            method: 'PUT',
            body: compressed,
            headers: { 'Content-Type': 'image/webp' },
          });
          finalUrl = presignRes.data.publicUrl || presignRes.data.url;
        }
      } catch (storageErr) {
        console.warn('Cloudflare R2 storage not configured, using local data URL:', storageErr);
      }

      setFormData((prev) => ({ ...prev, avatarUrl: finalUrl }));
      setSuccessMessage('Avatar uploaded! Click "Save Profile" to apply changes.');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setErrorMessage('Failed to compress or upload avatar.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        gender: formData.gender,
        birthYear: formData.birthYear ? parseInt(formData.birthYear, 10) : undefined,
        dob: formData.dob || undefined,
        birthPlace: formData.birthPlace.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        privacyLevel: formData.privacyLevel,
        avatarUrl: formData.avatarUrl || undefined,
        isAlive: formData.isAlive,
      };

      if (personId) {
        const res = await updatePerson(personId, payload);
        const updated = res.data.person || res.data;
        if (setPersonNode) setPersonNode(updated);
        setSuccessMessage('Profile and privacy settings saved successfully!');
      } else {
        setSuccessMessage('Profile saved.');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      setErrorMessage(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5" />
            My Identity & Privacy
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Family Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your personal details, lineage visibility, and DPDP Act privacy safeguards.
          </p>
        </div>

        {personId && (
          <Link
            to={`/tree/${personId}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            View in Tree
          </Link>
        )}
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar and Basic Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center overflow-hidden shadow-inner">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt={formData.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(formData.fullName || 'User')
              )}
            </div>

            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-md cursor-pointer transition-transform group-hover:scale-105"
              title="Upload photo (auto-compressed to WebP)"
            >
              <Camera className="w-4 h-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{formData.fullName || 'Family Member'}</h2>
              <PrivacyBadge level={formData.privacyLevel} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {user?.email} · {personNode?.isClaimed ? 'Claimed Node' : 'Linked Profile'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Photos are automatically compressed to high-efficiency WebP (&lt;35KB) for instant loading on mobile.
            </p>
          </div>
        </div>

        {/* Identity & Personal Info */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full name as in family tree"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Birth Year</label>
              <input
                type="number"
                name="birthYear"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.birthYear}
                onChange={handleChange}
                placeholder="e.g. 1985"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date of Birth (Private)
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Birth Place / Native</label>
              <input
                type="text"
                name="birthPlace"
                value={formData.birthPlace}
                onChange={handleChange}
                placeholder="e.g. Ahmedabad, GJ"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">
                Hashed with HMAC-SHA256 for duplicate detection without exposing raw numbers.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* DPDP Privacy Policy Safeguards */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-base text-gray-900">Privacy & DPDP Compliance</h3>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            In compliance with India's Digital Personal Data Protection (DPDP) Act, living family members have full sovereignty over their personally identifiable information.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'FAMILY_ONLY',
                title: 'Family Only (Recommended)',
                desc: 'Visible to verified family members attending your events.',
              },
              {
                id: 'PUBLIC',
                title: 'Public',
                desc: 'Visible in searches and open branches.',
              },
              {
                id: 'PRIVATE',
                title: 'Strictly Private',
                desc: 'Only you and direct admins can see profile details.',
              },
            ].map((option) => (
              <label
                key={option.id}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  formData.privacyLevel === option.id
                    ? 'border-brand-500 bg-brand-50/40 text-brand-900'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs">{option.title}</span>
                  <input
                    type="radio"
                    name="privacyLevel"
                    value={option.id}
                    checked={formData.privacyLevel === option.id}
                    onChange={handleChange}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <p className="text-[11px] text-gray-500 leading-snug">{option.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

