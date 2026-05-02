'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { auth, reportsAPI } from '@/lib/api';

const URGENCY_CONFIG = {
  normal: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-700',
    icon: '✅',
    label: 'All Clear',
  },
  monitor: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-700',
    icon: '⚠️',
    label: 'Monitor Closely',
  },
  urgent: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-700',
    icon: '🚨',
    label: 'Needs Attention',
  },
};

export default function ViewReportPage() {
  const router = useRouter();
  const params = useParams();
  const [report, setReport] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('english');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

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

  const handleReanalyze = async () => {
    if (!report) return;
    setAnalyzing(true);
    setAnalyzeError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reports/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          reportId: report._id,
          fileUrl: report.fileUrl,
          mimeType: report.fileUrl.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          fileType: report.fileType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInsight(data.data);
      } else {
        setAnalyzeError(data.message || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      setAnalyzeError('Network error. Please try again.');
    } finally {
      setAnalyzing(false);
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

  const urgency = URGENCY_CONFIG[insight?.urgencyLevel] || URGENCY_CONFIG.normal;

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
            <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition font-medium text-sm sm:text-base">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Report Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">{report.fileName}</h1>
          <p className="text-sm text-gray-500 mt-1">{new Date(report.testDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Urgency Banner */}
        {insight && (
          <div className={`${urgency.bg} border-l-4 ${urgency.border} rounded-xl p-4 mb-6 flex items-start gap-3`}>
            <span className="text-2xl flex-shrink-0">{urgency.icon}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${urgency.badge}`}>
                  {urgency.label}
                </span>
              </div>
              <p className={`text-sm font-medium ${urgency.text}`}>{insight.urgencyReason}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Report Details */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Report Details</h2>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Test Type', value: report.fileType },
                  { label: 'Lab / Hospital', value: report.labHospital },
                  { label: 'Doctor', value: report.doctor },
                  { label: 'Date', value: new Date(report.testDate).toLocaleDateString() },
                  { label: 'Price', value: report.price },
                  { label: 'Notes', value: report.notes },
                ].map(({ label, value }) => value ? (
                  <div key={label} className="flex items-start justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">{label}:</span>
                    <span className="font-medium text-gray-900 text-right">{value}</span>
                  </div>
                ) : null)}
              </div>
            </div>

            {/* File Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">File Preview</h3>
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                {report.fileUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={`${report.fileUrl}#toolbar=0`}
                    className="w-full h-[300px] sm:h-[400px] md:h-[500px]"
                    title="Report Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <img
                      src={report.fileUrl}
                      alt="Report"
                      className="max-w-full h-auto rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerHTML = '<p class="text-gray-500 p-4">Image preview not available</p>';
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
                  className="flex-1 text-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                >
                  Open Full View
                </a>
                <a
                  href={report.fileUrl}
                  download
                  className="flex-1 text-center border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition font-medium text-sm"
                >
                  Download
                </a>
              </div>
            </div>

            {/* Key Findings */}
            {insight?.keyFindings?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🔍</span> Key Findings
                </h3>
                <ul className="space-y-2">
                  {insight.keyFindings.map((finding, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-indigo-500 font-bold mt-0.5 flex-shrink-0">›</span>
                      <span className="text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - AI Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {insight ? (
              <>
                {/* AI Summary */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                    <h2 className="text-lg font-bold text-gray-900">🤖 AI Analysis Summary</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLanguage('english')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          language === 'english'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setLanguage('urdu')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          language === 'urdu'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Roman Urdu
                      </button>
                    </div>
                  </div>
                  <div className="text-gray-700 leading-relaxed text-sm space-y-3 whitespace-pre-line">
                    {language === 'english' ? insight.summaryEnglish : insight.summaryUrdu}
                  </div>
                </div>

                {/* Abnormal Values */}
                {insight.abnormalValues?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-xl">⚠️</span> Abnormal Values
                      <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                        {insight.abnormalValues.length} flagged
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {insight.abnormalValues.map((value, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                          <span className="text-red-500 font-bold text-lg flex-shrink-0 mt-0.5">!</span>
                          <span className="text-gray-800 text-sm leading-relaxed">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Normal Values */}
                {insight.normalValues?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-xl">✅</span> Normal Values
                      <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        {insight.normalValues.length} normal
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {insight.normalValues.map((value, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                          <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                          <span className="text-gray-700 text-sm">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warning Signs */}
                {insight.warningSignsToWatch?.length > 0 && (
                  <div className="bg-red-50 rounded-2xl shadow-sm p-6 border border-red-200">
                    <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                      <span className="text-xl">🚨</span> Warning Signs — Seek Medical Help If You Notice
                    </h3>
                    <ul className="space-y-3">
                      {insight.warningSignsToWatch.map((sign, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-white border border-red-200 rounded-xl">
                          <span className="text-red-500 font-bold flex-shrink-0 mt-0.5">⚡</span>
                          <span className="text-gray-800 text-sm leading-relaxed">{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Questions for Doctor */}
                {insight.questionsToAsk?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-xl">❓</span> Questions to Ask Your Doctor
                    </h3>
                    <ul className="space-y-3">
                      {insight.questionsToAsk.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                          <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="text-gray-700 text-sm leading-relaxed pt-0.5">{item.question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Food Recommendations */}
                {insight.foodRecommendations && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-xl">🍎</span> Food Recommendations
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {insight.foodRecommendations.recommended?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span className="text-base">✅</span> Eat More Of These
                          </h4>
                          <ul className="space-y-2">
                            {insight.foodRecommendations.recommended.map((food, i) => (
                              <li key={i} className="flex items-start gap-2 p-2.5 bg-green-50 border border-green-100 rounded-lg">
                                <span className="text-green-600 flex-shrink-0 mt-0.5">•</span>
                                <span className="text-gray-700 text-sm">{food}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {insight.foodRecommendations.avoid?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span className="text-base">🚫</span> Avoid These
                          </h4>
                          <ul className="space-y-2">
                            {insight.foodRecommendations.avoid.map((food, i) => (
                              <li key={i} className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg">
                                <span className="text-red-500 flex-shrink-0 mt-0.5">•</span>
                                <span className="text-gray-700 text-sm">{food}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Lifestyle Recommendations */}
                {insight.lifestyleRecommendations?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-xl">🏃</span> Lifestyle Recommendations
                    </h3>
                    <ul className="space-y-3">
                      {insight.lifestyleRecommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-100 rounded-xl">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="text-gray-700 text-sm leading-relaxed pt-0.5">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Home Remedies */}
                {insight.homeRemedies?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-xl">🏠</span> Home Remedies
                    </h3>
                    <div className="space-y-4">
                      {insight.homeRemedies.map((remedy, i) => (
                        <div key={i} className="border-l-4 border-teal-500 pl-4 py-3 bg-teal-50 rounded-r-xl">
                          <h4 className="font-bold text-gray-900 mb-2 text-sm">{remedy.remedy}</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{remedy.description}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4 italic">
                      Always inform your doctor before starting any home remedy.
                    </p>
                  </div>
                )}

                {/* Follow-up Plan */}
                {insight.followUpRecommendations && (
                  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
                    <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">📅</span> Follow-Up Plan
                    </h3>
                    <p className="text-indigo-800 text-sm leading-relaxed">{insight.followUpRecommendations}</p>
                  </div>
                )}

                {/* Precautions */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🛡️</span> General Precautions
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {[
                      'Avoid self-medication — always consult your doctor before starting any medicine.',
                      'If symptoms worsen suddenly, visit the nearest emergency room immediately.',
                      'Keep all your reports organized and bring them to every doctor visit.',
                      'Maintain regular checkups even if you feel well — prevention is better than cure.',
                    ].map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span>
                        <span className="text-gray-700">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">⚠️</span>
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
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-12 text-center border border-gray-100">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-gray-500 text-lg font-semibold">No AI Analysis Available</p>
                <p className="text-gray-400 text-sm mt-2 mb-6">
                  Analysis upload ke time fail ho gayi. Neeche button se dobara try karein.
                </p>
                {analyzeError && (
                  <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    {analyzeError}
                  </p>
                )}
                <button
                  onClick={handleReanalyze}
                  disabled={analyzing}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing... (may take 30–60 sec)
                    </>
                  ) : (
                    <>🔄 Re-Analyze with AI</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
