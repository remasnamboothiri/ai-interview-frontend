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

const mockResult = {
  id: '1',
  candidate: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
  },
  job: {
    title: 'Senior Software Engineer',
    department: 'Engineering',
  },
  interview: {
    date: new Date('2024-12-20T10:00:00'),
    duration: 45,
    agent: 'Senior Technical Interviewer',
  },
  overallScore: 8.3,
  status: 'passed',
  scores: [
    { category: 'Technical Depth', score: 8.5, weight: 30, maxScore: 10 },
    { category: 'Problem Solving', score: 9.0, weight: 25, maxScore: 10 },
    { category: 'Communication', score: 7.5, weight: 20, maxScore: 10 },
    { category: 'Experience', score: 8.0, weight: 15, maxScore: 10 },
    { category: 'Culture Fit', score: 8.5, weight: 10, maxScore: 10 },
  ],
  summary: 'The candidate demonstrated exceptional problem-solving abilities and strong technical knowledge. Communication was clear and effective throughout the interview. Shows great potential for the senior role with proven experience in similar environments.',
  strengths: [
    'Excellent understanding of microservices architecture and distributed systems',
    'Strong problem-solving approach with clear articulation of trade-offs',
    'Demonstrated leadership experience in previous roles',
    'Good cultural alignment with company values',
  ],
  improvements: [
    'Could benefit from more experience with specific cloud platforms (AWS/GCP)',
    'Some hesitation when discussing recent technology trends',
  ],
  questionAnalysis: [
    {
      question: 'Describe your experience with microservices architecture',
      candidateAnswer: 'I have extensive experience building and maintaining microservices...',
      evaluation: 'Excellent response demonstrating deep technical knowledge',
      score: 9,
      category: 'Technical Depth',
    },
    {
      question: 'How do you handle disagreements with team members?',
      candidateAnswer: 'I believe in open communication and finding common ground...',
      evaluation: 'Good answer showing strong interpersonal skills',
      score: 8,
      category: 'Culture Fit',
    },
    {
      question: 'Describe a challenging technical problem you solved recently',
      candidateAnswer: 'We had a performance issue in our payment processing system...',
      evaluation: 'Strong problem-solving demonstrated with clear methodology',
      score: 9,
      category: 'Problem Solving',
    },
  ],
  transcript: [
    { speaker: 'AI', text: 'Hello John, thank you for joining. Let\'s begin with your experience.', timestamp: '00:00:15' },
    { speaker: 'Candidate', text: 'Thank you for having me. I\'m excited to discuss the role.', timestamp: '00:00:22' },
    { speaker: 'AI', text: 'Can you tell me about your experience with microservices architecture?', timestamp: '00:00:35' },
    { speaker: 'Candidate', text: 'I have extensive experience building and maintaining microservices. In my current role...', timestamp: '00:00:42' },
  ],
  recommendation: 'Strong Hire',
  nextSteps: 'Schedule technical panel interview with engineering team',
};

export const ResultDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const result = mockResult;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-error';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <TrendingUp className="w-4 h-4 text-success" />;
    if (score >= 6) return <AlertCircle className="w-4 h-4 text-warning" />;
    return <TrendingDown className="w-4 h-4 text-error" />;
  };

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
              {result.candidate.name}
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {result.job.title}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(result.interview.date, 'MMM dd, yyyy')}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-primary-600 mb-2">
            {result.overallScore.toFixed(1)}
          </div>
          <Badge
            variant={result.status === 'passed' ? 'success' : 'error'}
            className="text-base px-4 py-1"
          >
            {result.status === 'passed' ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            {result.status === 'passed' ? 'Passed' : 'Not Passed'}
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Video className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-neutral-600">Duration</span>
            </div>
            <p className="text-2xl font-bold text-secondary">{result.interview.duration} min</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-neutral-600">Questions</span>
            </div>
            <p className="text-2xl font-bold text-secondary">{result.questionAnalysis.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-neutral-600">Completed</span>
            </div>
            <p className="text-lg font-bold text-secondary">
              {format(result.interview.date, 'hh:mm a')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Full Name</p>
              <p className="font-semibold text-secondary">{result.candidate.name}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Email</p>
              <p className="font-semibold text-secondary">{result.candidate.email}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Phone</p>
              <p className="font-semibold text-secondary">{result.candidate.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.scores.map((score) => (
            <div key={score.category}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getScoreIcon(score.score)}
                  <span className="font-medium text-secondary">{score.category}</span>
                  <span className="text-sm text-neutral-500">({score.weight}% weight)</span>
                </div>
                <span className={`text-lg font-bold ${getScoreColor(score.score)}`}>
                  {score.score.toFixed(1)} / {score.maxScore}
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
                  style={{ width: `${(score.score / score.maxScore) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overall Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-700 leading-relaxed">{result.summary}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-neutral-700">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-warning" />
                  </div>
                  <span className="text-neutral-700">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question-by-Question Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.questionAnalysis.map((qa, index) => (
            <div key={index} className="p-4 border-2 border-neutral-100 rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="neutral">Q{index + 1}</Badge>
                    <Badge variant="primary">{qa.category}</Badge>
                  </div>
                  <p className="font-semibold text-secondary">{qa.question}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(qa.score)}`}>
                    {qa.score}/10
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-neutral-600 mb-1">Candidate Response:</p>
                <p className="text-neutral-700">{qa.candidateAnswer}</p>
              </div>

              <div className="bg-primary-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-primary-700 mb-1">AI Evaluation:</p>
                <p className="text-primary-900">{qa.evaluation}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Full Interview Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {result.transcript.map((entry, index) => (
              <div
                key={index}
                className={`flex gap-3 p-3 rounded-lg ${
                  entry.speaker === 'AI' ? 'bg-primary-50' : 'bg-neutral-50'
                }`}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      entry.speaker === 'AI' ? 'bg-primary-600' : 'bg-neutral-600'
                    }`}
                  >
                    <span className="text-white text-xs font-bold">
                      {entry.speaker === 'AI' ? 'AI' : 'C'}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-secondary">
                      {entry.speaker === 'AI' ? result.interview.agent : result.candidate.name}
                    </span>
                    <span className="text-xs text-neutral-500">{entry.timestamp}</span>
                  </div>
                  <p className="text-neutral-700">{entry.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-secondary mb-2">Recommendation</h3>
              <p className="text-xl font-bold text-primary-600 mb-2">{result.recommendation}</p>
              <p className="text-neutral-700">
                <span className="font-semibold">Next Steps:</span> {result.nextSteps}
              </p>
            </div>
            <Button>
              Schedule Follow-up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
