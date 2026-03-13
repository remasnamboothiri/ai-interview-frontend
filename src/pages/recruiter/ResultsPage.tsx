import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Download, CheckCircle2, XCircle, TrendingUp, TrendingDown, BarChart3, Users, Target, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import interviewResultService, { InterviewResult } from '@/services/interviewResultService';
import candidateService from '@/services/candidateService';
import jobService from '@/services/jobService';

export const ResultsPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ FIX: Load data separately and handle errors gracefully
      const [candidatesData, jobsData] = await Promise.all([
        
        candidateService.getAllCandidates().catch(() => []),
        jobService.getAllJobs().catch(() => [])
      ]);

      // ✅ FIX: Load results separately with better error handling
      let resultsData: InterviewResult[] = [];
      try {
        const response = await interviewResultService.getResults();
        resultsData = response.results || [];
      } catch (error) {
        console.error('Error loading results:', error);
        // Don't throw error, just use empty array
        resultsData = [];
      }

      setResults(resultsData);
      setCandidates(candidatesData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load results data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCandidate = (result: InterviewResult) => {
    // Try candidate_id from transformed result, or look up via interview
    if (result.candidate_id) {
      return candidates.find(c => c.id === result.candidate_id);
    }
    return null;
  };

  const getJob = (result: InterviewResult) => {
    if (result.job_id) {
      return jobs.find(j => j.id === result.job_id);
    }
    return null;
  };

  const totalResults = results.length;
  const passedResults = results.filter(r => r.passed).length;
  const passRate = totalResults > 0 ? (passedResults / totalResults) * 100 : 0;
  const avgScore = totalResults > 0
    ? results.reduce((sum, r) => sum + Number(r.overall_score), 0) / totalResults
    : 0;

  // Chart data from flat score fields
  const chartData = totalResults > 0 ? [
    { name: 'Technical', avg: Number((results.reduce((sum, r) => sum + Number(r.technical_score || 0), 0) / totalResults).toFixed(1)) },
    { name: 'Communication', avg: Number((results.reduce((sum, r) => sum + Number(r.communication_score || 0), 0) / totalResults).toFixed(1)) },
    { name: 'Cultural Fit', avg: Number((results.reduce((sum, r) => sum + Number(r.cultural_fit_score || 0), 0) / totalResults).toFixed(1)) },
    { name: 'Behavioral', avg: Number((results.reduce((sum, r) => sum + Number(r.behavioral_score || 0), 0) / totalResults).toFixed(1)) },
    { name: 'Overall', avg: Number((results.reduce((sum, r) => sum + Number(r.overall_score || 0), 0) / totalResults).toFixed(1)) },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Results & Analytics</h1>
            <p className="text-neutral-600 mt-1">Loading results...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-neutral-600">Loading results data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Results & Analytics</h1>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
          <Button onClick={loadData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Results & Analytics</h1>
          <p className="text-neutral-600 mt-1">Review interview results and performance metrics</p>
        </div>
        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={() => alert('Exporting all results as CSV...')}>
          Export All
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-neutral-600">Total Results</span>
            </div>
            <p className="text-3xl font-bold text-secondary">{totalResults}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-neutral-600">Pass Rate</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{passRate.toFixed(0)}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-neutral-600">Avg Score</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{avgScore.toFixed(1)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-neutral-600">Passed</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{passedResults}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-secondary mb-4">Average Scores by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg" fill="#16a34a" name="Average Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Result Cards */}
      <div className="grid grid-cols-1 gap-6">
        {results.map((result) => {
          const candidate = getCandidate(result);
          const job = getJob(result);

          const scoreBreakdown = [
            { key: 'technical', label: 'Technical', value: Number(result.technical_score) },
            { key: 'communication', label: 'Communication', value: Number(result.communication_score) },
            { key: 'cultural_fit', label: 'Cultural Fit', value: Number(result.cultural_fit_score) },
            { key: 'behavioral', label: 'Behavioral', value: Number(result.behavioral_score || 0) },
            { key: 'overall', label: 'Overall', value: Number(result.overall_score) },
          ];

          return (
            <Card key={result.id} className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-secondary">
                        {candidate?.full_name || candidate?.user?.full_name || 'Candidate'}
                      </h3>
                      <Badge variant={result.passed ? 'success' : 'danger'}>
                        {result.passed ? 'Passed' : 'Not Passed'}
                      </Badge>
                      <Badge variant="default" className="capitalize">
                        {result.recommendation?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-neutral-600">
                      {job?.title || 'Position'} • {result.created_at ? format(new Date(result.created_at), 'MMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {Number(result.overall_score).toFixed(1)}
                    </div>
                    <p className="text-sm text-neutral-600">Overall Score</p>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-3">Score Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {scoreBreakdown.map(({ key, label, value }) => (
                      <div key={key} className="bg-neutral-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-neutral-600">{label}</p>
                          {value >= 7.5 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-orange-600" />
                          )}
                        </div>
                        <p className="text-2xl font-bold text-secondary">{value.toFixed(1)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assessment */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-2">Assessment Summary</h4>
                  <p className="text-neutral-700 leading-relaxed">{result.assessment_summary}</p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {(result.strengths || []).map((strength, index) => (
                        <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                      {(!result.strengths || result.strengths.length === 0) && (
                        <li className="text-sm text-neutral-500">No strengths recorded</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {(result.weaknesses || []).map((weakness, index) => (
                        <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                      {(!result.weaknesses || result.weaknesses.length === 0) && (
                        <li className="text-sm text-neutral-500">No weaknesses recorded</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-200">
                  <Button
                    variant="default"
                    size="sm"
                    leftIcon={<Eye className="w-4 h-4" />}
                    onClick={() => navigate(`/results/${result.id}`)}
                  >
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => alert(`Downloading report...`)}>
                    Download Report
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => alert(`Sharing result...`)}>
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {results.length === 0 && (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-neutral-600">No results available yet. Complete an interview to see results here.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};



