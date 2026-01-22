'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, reportsAPI, familyMembersAPI } from '@/lib/api';

export default function UploadReportPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    fileType: 'lab_report',
    testDate: '',
    labHospital: '',
    doctor: '',
    price: '',
    notes: '',
    familyMemberId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadFamilyMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFamilyMembers = async () => {
    try {
      const data = await familyMembersAPI.getAll();
      setFamilyMembers(data.data || []);
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Check file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only JPEG, PNG, WebP, and PDF files are allowed');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!formData.testDate) {
      setError('Please select test date');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('file', file);
      submitData.append('fileType', formData.fileType);
      submitData.append('testDate', formData.testDate);
      submitData.append('labHospital', formData.labHospital);
      submitData.append('doctor', formData.doctor);
      submitData.append('price', formData.price);
      submitData.append('notes', formData.notes);
      if (formData.familyMemberId) {
        submitData.append('familyMemberId', formData.familyMemberId);
      }

      const response = await reportsAPI.upload(submitData);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/reports/${response.data.file._id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">H</span>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  HealthMate
                </span>
                <p className="text-xs text-gray-500">Sehat ka Smart Dost</p>
              </div>
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Upload Medical Report</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                Report uploaded successfully! Analyzing with AI...
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition">
                <input
                  type="file"
                  id="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  {file ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-gray-900 font-medium">File Selected</p>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                        className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-700 font-medium mb-1">
                        Click to upload file
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, JPEG, PNG, or WebP (max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Family Member Selection */}
              <div>
                <label htmlFor="familyMember" className="block text-sm font-medium text-gray-700 mb-2">
                  Family Member
                </label>
                <select
                  id="familyMember"
                  value={formData.familyMemberId}
                  onChange={(e) => setFormData({ ...formData, familyMemberId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Self (Default)</option>
                  {familyMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.relation})
                    </option>
                  ))}
                </select>
              </div>

              {/* File Type */}
              <div>
                <label htmlFor="fileType" className="block text-sm font-medium text-gray-700 mb-2">
                  Test / Report Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="fileType"
                  value={formData.fileType}
                  onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                >
                  <option value="lab_report">Lab Report</option>
                  <option value="CBC">CBC</option>
                  <option value="prescription">Prescription</option>
                  <option value="x-ray">X-Ray</option>
                  <option value="ultrasound">Ultrasound</option>
                  <option value="MRI">MRI</option>
                  <option value="CT_Scan">CT Scan</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Test Date */}
              <div>
                <label htmlFor="testDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="testDate"
                  type="date"
                  value={formData.testDate}
                  onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              {/* Lab/Hospital */}
              <div>
                <label htmlFor="labHospital" className="block text-sm font-medium text-gray-700 mb-2">
                  Lab/Hospital
                </label>
                <input
                  id="labHospital"
                  type="text"
                  value={formData.labHospital}
                  onChange={(e) => setFormData({ ...formData, labHospital: e.target.value })}
                  placeholder="e.g., Aga Khan Laboratory"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Doctor */}
              <div>
                <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor
                </label>
                <input
                  id="doctor"
                  type="text"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  placeholder="e.g., Dr. Ahmed"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  id="price"
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., Rs 3500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g., Routine check, Follow-up test"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </span>
              ) : (
                'Upload & Analyze Report'
              )}
            </button>
          </form>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Disclaimer:</span> AI analysis is for informational purposes only. Always consult your doctor for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
