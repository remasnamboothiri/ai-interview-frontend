import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  Calendar,
  Video,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { ROUTES } from '@/constants';
import { format } from 'date-fns';
import interviewResultService, { InterviewResult } from '@/services/interviewResultService';
import candidateService from '@/services/candidateService';
import jobService from '@/services/jobService';

export const ResultDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadResultData(parseInt(id));
    }
  }, [id]);

  const loadResultData = async (resultId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Try fetching by result ID first, then by interview ID
      let resultData: InterviewResult;
      try {
        resultData = await interviewResultService.getResult(resultId);
      } catch {
        // If not found by result ID, try by interview ID
        resultData = await interviewResultService.getResultByInterview(resultId);
      }
      setResult(resultData);

      // Load related candidate and job data
      const loadPromises: Promise<any>[] = [];

      if (resultData.candidate_id) {
        loadPromises.push(
          candidateService.getCandidate(resultData.candidate_id).catch(() => null)
        );
      } else {
        loadPromises.push(Promise.resolve(null));
      }

      if (resultData.job_id) {
        loadPromises.push(
          jobService.getJob(resultData.job_id).catch(() => null)
        );
      } else {
        loadPromises.push(Promise.resolve(null));
      }

      const [candidateData, jobData] = await Promise.all(loadPromises);
      setCandidate(candidateData);
      setJob(jobData);
    } catch (error) {
      console.error('Error loading result data:', error);
      setError('Failed to load result details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score >= 6) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(ROUTES.RESULTS)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-neutral-600">Loading result details...</div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(ROUTES.RESULTS)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">{error || 'Result not found'}</p>
          <Button onClick={() => id && loadResultData(parseInt(id))} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Build score entries for display
  const scoreEntries = [
    { label: 'Technical', score: result.technical_score },
    { label: 'Communication', score: result.communication_score },
    { label: 'Cultural Fit', score: result.cultural_fit_score },
    { label: 'Behavioral', score: result.behavioral_score || 0 },
    { label: 'Overall', score: result.overall_score },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(ROUTES.RESULTS)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Results
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">Interview Result</h1>
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {candidate?.full_name || candidate?.user?.full_name || 'Candidate'}
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {job?.title || 'Position'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {result.created_at ? format(new Date(result.created_at), 'MMM dd, yyyy') : 'N/A'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-primary-600 mb-2">
            {Number(result.overall_score).toFixed(1)}
          </div>
          <Badge
            variant={result.passed ? 'success' : 'error'}
            className="text-base px-4 py-1"
          >
            {result.passed ? (
              <><CheckCircle className="w-4 h-4 mr-2 inline" /> Passed</>
            ) : (
              <><XCircle className="w-4 h-4 mr-2 inline" /> Not Passed</>
            )}
          </Badge>
          <p className="text-sm text-neutral-500 mt-1 capitalize">
            Recommendation: {result.recommendation?.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Candidate Info */}
      {candidate && (
        <Card>
          <CardHeader>
            <CardTitle>Candidate Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Full Name</p>
                <p className="font-semibold text-secondary">
                  {candidate?.full_name || candidate?.user?.full_name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Email</p>
                <p className="font-semibold text-secondary">
                  {candidate?.email || candidate?.user?.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Phone</p>
                <p className="font-semibold text-secondary">
                  {candidate?.phone || candidate?.user?.phone || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scoreEntries.map(({ label, score }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getScoreIcon(Number(score))}
                  <span className="font-medium text-secondary">{label}</span>
                </div>
                <span className={`text-lg font-bold ${getScoreColor(Number(score))}`}>
                  {Number(score).toFixed(1)} / 10
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
                  style={{ width: `${(Number(score) / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-700 leading-relaxed">{result.assessment_summary}</p>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.strengths && result.strengths.length > 0 ? (
              <ul className="space-y-3">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-neutral-700">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral-500">No strengths recorded</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.weaknesses && result.weaknesses.length > 0 ? (
              <ul className="space-y-3">
                {result.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span className="text-neutral-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral-500">No weaknesses recorded</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Red Flags */}
      {result.red_flags && result.red_flags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Red Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.red_flags.map((flag, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-neutral-700">{flag}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      {result.transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Interview Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-neutral-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              {result.transcript.split('\n\n').map((line, i) => {
                const isAI = line.startsWith('AI Interviewer:');
                return (
                  <div key={i} className={`mb-3 ${isAI ? 'pl-0' : 'pl-4'}`}>
                    <span className={`font-semibold ${isAI ? 'text-blue-600' : 'text-green-600'}`}>
                      {isAI ? '🤖 AI Interviewer' : '👤 Candidate'}:
                    </span>
                    <p className="text-neutral-700 mt-1">
                      {line.replace(/^(AI Interviewer|Candidate):\s*/, '')}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};












