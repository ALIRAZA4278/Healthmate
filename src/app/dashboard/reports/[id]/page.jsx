'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { auth, reportsAPI } from '@/lib/api';

export default function ViewReportPage() {
  const router = useRouter();
  const params = useParams();
  const [report, setReport] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('english');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReport = async () => {
    try {
      const response = await reportsAPI.getById(params.id);
      const reportData = response.data;
      setReport(reportData);
      setInsight(reportData?.aiInsight);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Report not found</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{report.fileName}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Report Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Report Details Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Report details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Test:</p>
                  <p className="font-medium text-gray-900">{report.fileType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Lab/Hospital:</p>
                  <p className="font-medium text-gray-900">{report.labHospital || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Doctor:</p>
                  <p className="font-medium text-gray-900">{report.doctor || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date:</p>
                  <p className="font-medium text-gray-900">
                    {new Date(report.testDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Price:</p>
                  <p className="font-medium text-gray-900">{report.price || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Files:</p>
                  <p className="font-medium text-gray-900 truncate">{report.fileName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Notes:</p>
                  <p className="font-medium text-gray-900">{report.notes || '-'}</p>
                </div>
              </div>
            </div>

            {/* File Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">File Preview</h3>
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                {report.fileUrl.toLowerCase().endsWith('.pdf') ? (
                  <div className="relative">
                    <iframe
                      src={`${report.fileUrl}#toolbar=0`}
                      className="w-full h-[500px]"
                      title="Report Preview"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <img
                      src={report.fileUrl}
                      alt="Report"
                      className="max-w-full h-auto rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerHTML = '<p class="text-gray-500">Image preview not available</p>';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-3">
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Open Full View
                </a>
                <a
                  href={report.fileUrl}
                  download
                  className="flex-1 text-center border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition font-medium"
                >
                  Download
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - AI Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {insight ? (
              <>
                {/* AI Summary Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900">AI Summary (simple words)</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLanguage('english')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          language === 'english'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLanguage('urdu')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          language === 'urdu'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        UR
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {language === 'english' ? insight.summaryEnglish : insight.summaryUrdu}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Home Remedies */}
                  {insight.homeRemedies && insight.homeRemedies.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Home remedies</h3>
                      <ul className="space-y-3 text-sm">
                        {insight.homeRemedies.slice(0, 3).map((remedy, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">•</span>
                            <div>
                              <p className="font-medium text-gray-900">{remedy.remedy}</p>
                              <p className="text-gray-600 text-xs mt-1">{remedy.description}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500 mt-4 italic">Always consult your doctor.</p>
                    </div>
                  )}

                  {/* Questions for Doctor */}
                  {insight.questionsToAsk && insight.questionsToAsk.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Questions for your doctor</h3>
                      <ul className="space-y-2 text-sm">
                        {insight.questionsToAsk.slice(0, 3).map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-indigo-600 font-semibold">{index + 1}.</span>
                            <span className="text-gray-700">{item.question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Precautions */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Precautions</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span className="text-gray-700">Self-medication se parhez karein.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span className="text-gray-700">Signs worsen ho to ER visit karein.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span className="text-gray-700">Regular checkups maintain karein.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Diet Tips */}
                  {insight.foodRecommendations && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Diet tips</h3>
                      {insight.foodRecommendations.recommended &&
                        insight.foodRecommendations.recommended.length > 0 && (
                          <div className="mb-3">
                            <ul className="space-y-1 text-sm">
                              {insight.foodRecommendations.recommended.slice(0, 3).map(
                                (food, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">•</span>
                                    <span className="text-gray-700">{food}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      {insight.foodRecommendations.avoid &&
                        insight.foodRecommendations.avoid.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">Avoid:</p>
                            <ul className="space-y-1 text-sm">
                              {insight.foodRecommendations.avoid.slice(0, 2).map(
                                (food, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-red-600 mt-0.5">•</span>
                                    <span className="text-gray-700">{food}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Abnormal Values - Full Width */}
                {insight.abnormalValues && insight.abnormalValues.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">⚠️</span> Abnormal Values
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {insight.abnormalValues.map((value, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <span className="text-red-600 font-bold mt-0.5">•</span>
                          <span className="text-gray-800 text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Food Recommendations - Expandable */}
                {insight.foodRecommendations && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">🍎</span> Complete Food Recommendations
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {insight.foodRecommendations.recommended &&
                        insight.foodRecommendations.recommended.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                              <span>✓</span> Foods to Eat
                            </h4>
                            <ul className="space-y-2">
                              {insight.foodRecommendations.recommended.map(
                                (food, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <span className="text-green-600 mt-0.5">•</span>
                                    <span className="text-gray-700">{food}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      {insight.foodRecommendations.avoid &&
                        insight.foodRecommendations.avoid.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                              <span>✗</span> Foods to Avoid
                            </h4>
                            <ul className="space-y-2">
                              {insight.foodRecommendations.avoid.map(
                                (food, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <span className="text-red-600 mt-0.5">•</span>
                                    <span className="text-gray-700">{food}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* All Questions for Doctor */}
                {insight.questionsToAsk && insight.questionsToAsk.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">❓</span> All Questions to Ask Your Doctor
                    </h3>
                    <ul className="space-y-3">
                      {insight.questionsToAsk.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 pt-0.5">{item.question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* All Home Remedies */}
                {insight.homeRemedies && insight.homeRemedies.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">🏠</span> Detailed Home Remedies
                    </h3>
                    <div className="space-y-4">
                      {insight.homeRemedies.map((remedy, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r-lg"
                        >
                          <h4 className="font-bold text-gray-900 mb-2">{remedy.remedy}</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{remedy.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-800 mb-1">
                        Important Disclaimer / Zaruri Tanbih:
                      </p>
                      <p className="text-gray-700">
                        This AI analysis is for informational purposes only. It is NOT a substitute for
                        professional medical advice, diagnosis, or treatment. Always consult your doctor
                        before making any medical decisions.
                      </p>
                      <p className="text-gray-700 mt-2">
                        Yeh AI analysis sirf samajhne ke liye hai, ilaaj ke liye nahi. Koi bhi medical
                        decision lene se pehle hamesha apne doctor se mashwara karein.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-gray-500 text-lg">No AI analysis available for this report</p>
                <p className="text-gray-400 text-sm mt-2">
                  The report may still be processing or there was an error during analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
