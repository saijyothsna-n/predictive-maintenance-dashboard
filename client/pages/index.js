import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://exrvwwcsfv.us-east-1.awsapprunner.com'
    : 'http://localhost:3001');

export default function Home() {
  const [formData, setFormData] = useState({
    machine_id: '',
    temperature: '',
    vibration: '',
    power_consumption: '',
    pressure: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.machine_id.trim()) {
      setError('Machine ID is required');
      return false;
    }
    if (!formData.temperature || isNaN(formData.temperature)) {
      setError('Valid temperature is required');
      return false;
    }
    if (!formData.vibration || isNaN(formData.vibration)) {
      setError('Valid vibration is required');
      return false;
    }
    if (!formData.power_consumption || isNaN(formData.power_consumption)) {
      setError('Valid power consumption is required');
      return false;
    }
    if (!formData.pressure || isNaN(formData.pressure)) {
      setError('Valid pressure is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/analyze`, formData);
      
      if (response.data.success) {
        // Store result in session storage for result page
        sessionStorage.setItem('analysisResult', JSON.stringify(response.data.data));
        router.push('/result');
      } else {
        setError('Analysis failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Predictive Maintenance</h1>
          <p className="text-gray-600 mb-8">Enter machine telemetry data for health analysis</p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="machine_id" className="block text-sm font-medium text-gray-700 mb-2">
                Machine ID
              </label>
              <input
                type="text"
                id="machine_id"
                name="machine_id"
                value={formData.machine_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., MACHINE-001"
                disabled={loading}
                maxLength="50"
                pattern="[a-zA-Z0-9-_]+"
                required
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  step="0.1"
                  min="-50"
                  max="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 75.5"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="vibration" className="block text-sm font-medium text-gray-700 mb-2">
                  Vibration (Hz)
                </label>
                <input
                  type="number"
                  id="vibration"
                  name="vibration"
                  value={formData.vibration}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 45.2"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="power_consumption" className="block text-sm font-medium text-gray-700 mb-2">
                  Power Consumption (W)
                </label>
                <input
                  type="number"
                  id="power_consumption"
                  name="power_consumption"
                  value={formData.power_consumption}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 450.0"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="pressure" className="block text-sm font-medium text-gray-700 mb-2">
                  Pressure (PSI)
                </label>
                <input
                  type="number"
                  id="pressure"
                  name="pressure"
                  value={formData.pressure}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 55.0"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Analyze Health'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/history')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                View History
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
