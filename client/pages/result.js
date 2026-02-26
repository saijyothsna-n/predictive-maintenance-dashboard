import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Result() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedResult = sessionStorage.getItem('analysisResult');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    }
    setLoading(false);
  }, []);

  const getHealthScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score) => {
    if (score >= 75) return 'bg-green-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewAnalysis = () => {
    sessionStorage.removeItem('analysisResult');
    router.push('/');
  };

  const handleViewHistory = () => {
    router.push('/history');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h2>
          <p className="text-gray-600 mb-6">Please perform an analysis first.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
          >
            Start Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
            <div className="flex gap-2">
              <button
                onClick={handleViewHistory}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                View History
              </button>
              <button
                onClick={handleNewAnalysis}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                New Analysis
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Score Card */}
            <div className={`rounded-lg p-6 ${getHealthScoreBg(result.health_score)}`}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Machine Health Score</h2>
              <div className="text-center">
                <div className={`text-6xl font-bold ${getHealthScoreColor(result.health_score)} mb-2`}>
                  {result.health_score}
                </div>
                <div className="text-gray-600 text-sm">out of 100</div>
              </div>
            </div>

            {/* Risk Level Card */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
              <div className="text-center">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getRiskBadgeColor(result.risk_level)}`}>
                  {result.risk_level} Risk
                </span>
              </div>
            </div>

            {/* Machine Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Machine Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Machine ID:</span>
                  <span className="font-medium">{result.machine_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Primary Issue:</span>
                  <span className="font-medium">{result.primary_contributing_sensor}</span>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendation</h2>
              <p className="text-gray-700">{result.recommended_action}</p>
            </div>
          </div>

          {/* Health Score Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Health Score Progress</span>
              <span>{result.health_score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-300 ${
                  result.health_score >= 75 ? 'bg-green-500' : 
                  result.health_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.health_score}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleNewAnalysis}
            className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Analyze Another Machine
          </button>
          <button
            onClick={handleViewHistory}
            className="bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors"
          >
            View Historical Data
          </button>
        </div>
      </div>
    </div>
  );
}
