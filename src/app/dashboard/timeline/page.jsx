'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, reportsAPI, vitalsAPI } from '@/lib/api';

export default function TimelinePage() {
  const router = useRouter();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const [reportsData, vitalsData] = await Promise.all([
        reportsAPI.getAll(),
        vitalsAPI.getAll(),
      ]);

      // Combine reports and vitals into timeline
      const reports = (reportsData.reports || []).map((report) => ({
        ...report,
        type: 'report',
        date: new Date(report.testDate),
      }));

      const vitals = (vitalsData.vitals || []).map((vital) => ({
        ...vital,
        type: 'vital',
        date: new Date(vital.date),
      }));

      // Merge and sort by date (newest first)
      const combined = [...reports, ...vitals].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      setTimeline(combined);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">H</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                HealthMate
              </span>
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Timeline</h1>
          <p className="text-gray-600">Your complete health history in chronological order</p>
        </div>

        {timeline.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-500 mb-6">No medical records yet</p>
            <div className="flex justify-center gap-4">
              <Link
                href="/dashboard/upload"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Upload Report
              </Link>
              <Link
                href="/dashboard/vitals"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Add Vitals
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Timeline Items */}
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="relative pl-20">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute left-6 w-5 h-5 rounded-full border-4 border-white ${
                      item.type === 'report'
                        ? 'bg-indigo-600'
                        : 'bg-purple-600'
                    } shadow`}
                  ></div>

                  {/* Content Card */}
                  {item.type === 'report' ? (
                    <Link
                      href={`/dashboard/reports/${item._id}`}
                      className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📄</span>
                          <div>
                            <h3 className="font-bold text-gray-900">{item.fileName}</h3>
                            <p className="text-sm text-gray-500">
                              {item.date.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                          {item.fileType}
                        </span>
                      </div>
                      {item.insight && (
                        <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                          <p className="text-sm text-indigo-900 line-clamp-2">
                            {item.insight.summaryEnglish}
                          </p>
                        </div>
                      )}
                    </Link>
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📊</span>
                          <div>
                            <h3 className="font-bold text-gray-900">Vitals Recorded</h3>
                            <p className="text-sm text-gray-500">
                              {item.date.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {item.bloodPressure && (
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs text-purple-600 font-medium">Blood Pressure</p>
                            <p className="text-lg font-bold text-purple-900">
                              {item.bloodPressure.systolic}/{item.bloodPressure.diastolic}
                            </p>
                          </div>
                        )}
                        {item.bloodSugar && (
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs text-purple-600 font-medium">Blood Sugar</p>
                            <p className="text-lg font-bold text-purple-900">
                              {item.bloodSugar} mg/dL
                            </p>
                          </div>
                        )}
                        {item.weight && (
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs text-purple-600 font-medium">Weight</p>
                            <p className="text-lg font-bold text-purple-900">{item.weight} kg</p>
                          </div>
                        )}
                        {item.heartRate && (
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs text-purple-600 font-medium">Heart Rate</p>
                            <p className="text-lg font-bold text-purple-900">{item.heartRate} bpm</p>
                          </div>
                        )}
                      </div>
                      {item.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
