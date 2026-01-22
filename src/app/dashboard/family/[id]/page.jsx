'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { auth, reportsAPI, vitalsAPI } from '@/lib/api';

export default function FamilyMemberPage() {
  const router = useRouter();
  const params = useParams();
  const [member, setMember] = useState(null);
  const [reports, setReports] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    try {
      // Get member from localStorage
      const savedMembers = localStorage.getItem('familyMembers');
      if (savedMembers) {
        const members = JSON.parse(savedMembers);
        const foundMember = members.find((m) => m.id === params.id);
        if (foundMember) {
          setMember(foundMember);
        }
      }

      // Load all reports and vitals (in future, filter by family member)
      const [reportsData, vitalsData] = await Promise.all([
        reportsAPI.getAll(),
        vitalsAPI.getAll(),
      ]);
      setReports(reportsData.reports || []);
      setVitals(vitalsData.vitals || []);
    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      await reportsAPI.delete(reportId);
      setReports(reports.filter(r => r._id !== reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Family member not found</p>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Member Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-6">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg"
              style={{ backgroundColor: member.color }}
            >
              👤
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{member.name}</h1>
              <p className="text-xl text-gray-600 mb-1">{member.relation}</p>
              {member.customId && (
                <p className="text-sm text-gray-500">ID: {member.customId}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/upload"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                + Add Report
              </Link>
              <Link
                href="/dashboard/vitals"
                className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition"
              >
                + Add Vitals
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                📄
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                <p className="text-sm text-gray-600">Total Reports</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{vitals.length}</p>
                <p className="text-sm text-gray-600">Vitals Records</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                📅
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.length > 0
                    ? new Date(Math.max(...reports.map(r => new Date(r.testDate).getTime()))).toLocaleDateString()
                    : '-'}
                </p>
                <p className="text-sm text-gray-600">Last Activity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Reports */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Medical Reports</h2>
            <Link
              href="/dashboard/upload"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Upload New →
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 mb-4">No reports uploaded yet</p>
              <Link
                href="/dashboard/upload"
                className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition"
              >
                Upload First Report
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                    <th className="pb-3 font-semibold">Title</th>
                    <th className="pb-3 font-semibold">Test</th>
                    <th className="pb-3 font-semibold">Lab/Hospital</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 text-sm">{report.fileName}</td>
                      <td className="py-4 text-sm">{report.fileType}</td>
                      <td className="py-4 text-sm text-gray-600">{report.labHospital || '-'}</td>
                      <td className="py-4 text-sm">{new Date(report.testDate).toLocaleDateString()}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/reports/${report._id}`}
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            👁️ View
                          </Link>
                          <button
                            onClick={(e) => handleDeleteReport(report._id, e)}
                            className="text-red-600 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Vitals Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Vitals</h2>
            <Link
              href="/dashboard/vitals"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Add New →
            </Link>
          </div>

          {vitals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 mb-4">No vitals recorded yet</p>
              <Link
                href="/dashboard/vitals"
                className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition"
              >
                Add First Vitals
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {vitals.slice(0, 5).map((vital) => (
                <div
                  key={vital._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {new Date(vital.date).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm">
                        {vital.bloodPressure && (
                          <span className="text-gray-600">
                            BP: {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                          </span>
                        )}
                        {vital.bloodSugar && (
                          <span className="text-gray-600">Sugar: {vital.bloodSugar}</span>
                        )}
                        {vital.weight && (
                          <span className="text-gray-600">Weight: {vital.weight} kg</span>
                        )}
                        {vital.heartRate && (
                          <span className="text-gray-600">HR: {vital.heartRate} bpm</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
