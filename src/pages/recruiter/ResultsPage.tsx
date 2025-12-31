import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Download, CheckCircle2, XCircle, TrendingUp, TrendingDown, BarChart3, Users, Target, Eye } from 'lucide-react';
import { mockResults, mockCandidates, mockJobs } from '@/data/mockData';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const ResultsPage = () => {
  const navigate = useNavigate();

  const getCandidate = (candidateId: string) => {
    return mockCandidates.find(c => c.id === candidateId);
  };

  const getJob = (jobId: string) => {
    return mockJobs.find(j => j.id === jobId);
  };

  const totalResults = mockResults.length;
  const passedResults = mockResults.filter(r => r.passed).length;
  const passRate = totalResults > 0 ? (passedResults / totalResults) * 100 : 0;
  const avgScore = totalResults > 0
    ? mockResults.reduce((sum, r) => sum + r.overall_score, 0) / totalResults
    : 0;

  const chartData = [
    { name: 'Tech Depth', avg: 8.0 },
    { name: 'Problem Solving', avg: 8.75 },
    { name: 'Communication', avg: 7.5 },
    { name: 'Experience', avg: 8.25 },
    { name: 'Culture Fit', avg: 8.0 },
  ];

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

      <div className="grid grid-cols-1 gap-6">
        {mockResults.map((result) => {
          const candidate = getCandidate(result.candidate_id);
          const job = getJob(result.job_id);

          return (
            <Card key={result.id} className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-secondary">
                        {candidate?.full_name}
                      </h3>
                      <Badge variant={result.passed ? 'success' : 'danger'}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                    <p className="text-neutral-600">
                      {job?.title} • {format(new Date(result.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {result.overall_score.toFixed(1)}
                    </div>
                    <p className="text-sm text-neutral-600">Overall Score</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-3">Score Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Object.entries(result.scores).map(([key, value]) => (
                      <div key={key} className="bg-neutral-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-neutral-600 capitalize">
                            {key.replace('_', ' ')}
                          </p>
                          {value >= 7.5 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-orange-600" />
                          )}
                        </div>
                        <p className="text-2xl font-bold text-secondary">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-2">Assessment Summary</h4>
                  <p className="text-neutral-700 leading-relaxed">{result.assessment_summary}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {result.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {result.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
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
                  <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => alert(`Downloading report for ${candidate?.full_name}...`)}>
                    Download Report
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => alert(`Sharing result for ${candidate?.full_name}...`)}>
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {mockResults.length === 0 && (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-neutral-600">No results available yet</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
