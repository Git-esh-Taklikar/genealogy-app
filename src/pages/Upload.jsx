import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  AlertTriangle,
  CheckCircle2,
  Users,
  GitMerge,
  ArrowRight,
  RefreshCw,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadPreview, uploadCommit, downloadTemplate } from '../api/client';

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [resolutions, setResolutions] = useState({});
  const [commitResult, setCommitResult] = useState(null);

  // Template download handler
  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadTemplate();
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Genealogy_Family_Upload_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download template:', err);
      setError('Unable to download template. Please try again.');
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      setError('Please select an Excel (.xlsx or .xls) file.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }
    setError('');
    setFile(selectedFile);
    setPreviewData(null);
    setCommitResult(null);
  };

  // Preview / deduplication analysis
  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError('');
    try {
      const res = await uploadPreview(file);
      const data = res.data;
      setPreviewData(data);

      // Initialize default resolutions for conflict reviews
      const initialResolutions = {};
      (data.conflictReviews || []).forEach((conflict) => {
        initialResolutions[conflict.tempRowId] = {
          tempRowId: conflict.tempRowId,
          action: 'merge', // default to merge with existing
          existingPersonId: conflict.existingPerson?.id,
        };
      });
      setResolutions(initialResolutions);
    } catch (err) {
      console.error('Upload analysis failed:', err);
      setError(err.response?.data?.detail || 'Failed to process Excel spreadsheet.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResolutionChange = (tempRowId, action, existingPersonId) => {
    setResolutions((prev) => ({
      ...prev,
      [tempRowId]: {
        tempRowId,
        action,
        existingPersonId: action === 'merge' ? existingPersonId : null,
      },
    }));
  };

  // Commit handler
  const handleCommit = async () => {
    if (!previewData || !previewData.sessionId) return;
    setIsCommitting(true);
    setError('');
    try {
      const resolutionList = Object.values(resolutions);
      const res = await uploadCommit(resolutionList, previewData.sessionId);
      setCommitResult(res.data);
    } catch (err) {
      console.error('Upload commit failed:', err);
      setError(err.response?.data?.detail || 'Failed to commit family data.');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Batch Excel Importer
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mass Tree Upload</h1>
          <p className="text-gray-500 text-sm mt-1">
            Import multiple generations from Excel with automated Indian name deduplication.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          Download Excel Template
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Finished Commit State */}
      {commitResult ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl text-center max-w-xl mx-auto"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successfully Merged!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your family records have been committed to the graph database.
          </p>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="border-r border-gray-200">
              <p className="text-2xl font-extrabold text-brand-600">
                {commitResult.createdCount ?? commitResult.nodesCreated ?? 0}
              </p>
              <p className="text-xs font-semibold text-gray-500 uppercase">Nodes Created</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-indigo-600">
                {commitResult.mergedCount ?? commitResult.relationshipsCreated ?? 0}
              </p>
              <p className="text-xs font-semibold text-gray-500 uppercase">Relationships Linked</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setFile(null);
                setPreviewData(null);
                setCommitResult(null);
              }}
              className="px-6 py-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Upload Another File
            </button>
          </div>
        </motion.div>
      ) : !previewData ? (
        /* Step 1: File Dropzone */
        <div className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
              dragActive
                ? 'border-brand-500 bg-brand-50/50 scale-[1.01]'
                : file
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>

            {file ? (
              <div>
                <p className="text-base font-bold text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB · Ready for analysis
                </p>
                <p className="text-xs text-brand-600 font-semibold mt-2">Click or drag another file to replace</p>
              </div>
            ) : (
              <div>
                <p className="text-base font-bold text-gray-900">
                  Drop your completed Excel file here, or <span className="text-brand-600">browse</span>
                </p>
                <p className="text-xs text-gray-500 mt-1.5">
                  Supports .xlsx and .xls formats up to 5MB (up to 2,000 rows)
                </p>
              </div>
            )}
          </div>

          {/* Action button */}
          {file && (
            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Lineage & Conflicts...
                  </>
                ) : (
                  <>
                    Preview & Detect Duplicates
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Instructions card */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-6">
            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              Guidelines for Family Tree Excel Upload
            </h3>
            <ul className="text-xs text-amber-800/90 space-y-2 list-disc list-inside">
              <li>
                <strong>Temp IDs:</strong> Each row should have a unique temporary ID (e.g., 1, 2, 3) to link parents and spouses.
              </li>
              <li>
                <strong>Phonetic Deduplication:</strong> Our system automatically maps phonetic spellings for Indian names (e.g. "Dikshit" and "Dixit").
              </li>
              <li>
                <strong>Biological Parent Limits:</strong> A child can have at most two biological parents (one father, one mother).
              </li>
              <li>
                <strong>Preview First:</strong> No records are committed until you review duplicates and click "Commit".
              </li>
            </ul>
          </div>
        </div>
      ) : (
        /* Step 2: Preview & Deduplication Screen */
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <Users className="w-4 h-4 text-gray-400" /> Total Processed
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{previewData.totalRows}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> New Persons
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {previewData.newNodes?.length || 0}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
                <GitMerge className="w-4 h-4 text-indigo-500" /> Auto-Merges
              </div>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {previewData.autoMerges?.length || 0}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Conflicts To Review
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {previewData.conflictReviews?.length || 0}
              </p>
            </div>
          </div>

          {/* Validation Errors */}
          {previewData.validationErrors && previewData.validationErrors.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
              <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Validation Warnings ({previewData.validationErrors.length})
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {previewData.validationErrors.map((err, idx) => (
                  <p key={idx} className="text-xs text-rose-700">
                    Row {err.row || idx + 1}: {err.message || JSON.stringify(err)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Conflict Reviews Table / Cards */}
          {previewData.conflictReviews && previewData.conflictReviews.length > 0 && (
            <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Resolve Potential Duplicates</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Choose whether to merge these incoming rows into existing profiles or create separate new profiles.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {previewData.conflictReviews.map((conflict) => {
                  const currentRes = resolutions[conflict.tempRowId]?.action || 'merge';
                  return (
                    <div
                      key={conflict.tempRowId}
                      className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Incoming vs Existing comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                        <div className="p-3 bg-white rounded-xl border border-gray-200">
                          <span className="text-[10px] font-bold uppercase text-gray-400">Incoming Record</span>
                          <p className="font-bold text-sm text-gray-900 mt-0.5">{conflict.candidate?.fullName}</p>
                          <p className="text-xs text-gray-500">
                            {conflict.candidate?.gender} · Born {conflict.candidate?.birthYear || 'N/A'}
                          </p>
                        </div>

                        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-amber-700">Existing In Tree</span>
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded">
                              {Math.round((conflict.score || 0.8) * 100)}% Match
                            </span>
                          </div>
                          <p className="font-bold text-sm text-amber-950 mt-0.5">{conflict.existingPerson?.fullName}</p>
                          <p className="text-xs text-amber-800">
                            {conflict.existingPerson?.gender} · Born {conflict.existingPerson?.birthYear || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleResolutionChange(conflict.tempRowId, 'merge', conflict.existingPerson?.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            currentRes === 'merge'
                              ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Merge into Existing
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolutionChange(conflict.tempRowId, 'create_new', null)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            currentRes === 'create_new'
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Create as New Node
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom commit actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setPreviewData(null);
                setFile(null);
              }}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Start Over
            </button>

            <button
              onClick={handleCommit}
              disabled={isCommitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {isCommitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Committing to Graph...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Commit & Build Family Tree
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

