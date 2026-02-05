import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { ArrowLeft, Video, Clock, User, Calendar, Activity, AlertCircle, Play, Pause, Square } from 'lucide-react';
import { interviewDataService, InterviewSession } from '@/services/interviewDataService';
import { format } from 'date-fns';

export const InterviewSessionPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (interviewId) {
      loadSessions(parseInt(interviewId));
    }
  }, [interviewId]);

  const loadSessions = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await interviewDataService.getSessionsByInterview(id);
      setSessions(data);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load interview sessions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'warning';
      case 'abandoned': return 'danger';
      case 'paused': return 'neutral';
      default: return 'neutral';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Square className="w-4 h-4" />;
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/interviews')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Interviews
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/interviews')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Interviews
        </Button>
        <Button variant="outline" onClick={() => loadSessions(parseInt(interviewId!))}>
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <Video className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-secondary">Interview Sessions</h1>
          <p className="text-neutral-600">Track interview session data and quality metrics</p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent>
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {sessions.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-neutral-600">Total Sessions</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{sessions.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Square className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-neutral-600">Completed</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {sessions.filter(s => s.status === 'completed').length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-neutral-600">Total Time</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {formatDuration(sessions.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0))}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-neutral-600">Avg Quality</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {sessions.filter(s => s.session_quality_score).length > 0
                  ? (sessions.reduce((sum, s) => sum + (s.session_quality_score || 0), 0) / 
                     sessions.filter(s => s.session_quality_score).length).toFixed(1)
                  : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <Card key={session.id} className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    {getStatusIcon(session.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-1">
                      Session #{session.session_number}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {session.started_at 
                          ? format(new Date(session.started_at), 'MMM dd, yyyy HH:mm') 
                          : 'Not started'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(session.actual_duration_minutes || 0)}
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusColor(session.status)}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Badge>
              </div>

              {/* Session Metrics */}
              <div className="grid md:grid-cols-5 gap-4 mb-4">
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-600 mb-1">Completion</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-secondary">{session.completion_percentage}%</p>
                    <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-600 transition-all"
                        style={{ width: `${session.completion_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-600 mb-1">Questions</p>
                  <p className="text-lg font-bold text-secondary">{session.questions_answered}</p>
                </div>

                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-600 mb-1">Quality Score</p>
                  <p className={`text-lg font-bold ${
                    session.session_quality_score 
                      ? getQualityColor(session.session_quality_score)
                      : 'text-neutral-400'
                  }`}>
                    {session.session_quality_score || 'N/A'}
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-600 mb-1">Interruptions</p>
                  <p className={`text-lg font-bold ${
                    session.network_interruptions > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {session.network_interruptions}
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-600 mb-1">Primary</p>
                  <p className="text-lg font-bold text-secondary">
                    {session.is_primary_session ? '✓' : '—'}
                  </p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-2 text-sm">
                {session.device_info && (
                  <div className="flex items-start gap-2">
                    <span className="text-neutral-600 font-medium min-w-[80px]">Device:</span>
                    <span className="text-neutral-700">{session.device_info}</span>
                  </div>
                )}
                
                {session.candidate_location && (
                  <div className="flex items-start gap-2">
                    <span className="text-neutral-600 font-medium min-w-[80px]">Location:</span>
                    <span className="text-neutral-700">{session.candidate_location}</span>
                  </div>
                )}

                {session.candidate_ip && (
                  <div className="flex items-start gap-2">
                    <span className="text-neutral-600 font-medium min-w-[80px]">IP:</span>
                    <span className="text-neutral-700">{session.candidate_ip}</span>
                  </div>
                )}

                {session.last_activity_at && (
                  <div className="flex items-start gap-2">
                    <span className="text-neutral-600 font-medium min-w-[80px]">Last Activity:</span>
                    <span className="text-neutral-700">
                      {format(new Date(session.last_activity_at), 'MMM dd, yyyy HH:mm:ss')}
                    </span>
                  </div>
                )}
              </div>

              {/* Quality Breakdown */}
              {(session.audio_quality || session.video_quality) && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-2">Quality Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {session.audio_quality && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Audio Quality:</span>
                        <span className={`text-sm font-medium ${getQualityColor(session.audio_quality)}`}>
                          {session.audio_quality}/10
                        </span>
                      </div>
                    )}
                    {session.video_quality && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Video Quality:</span>
                        <span className={`text-sm font-medium ${getQualityColor(session.video_quality)}`}>
                          {session.video_quality}/10
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {sessions.length === 0 && !loading && (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600">No sessions found for this interview</p>
                <p className="text-sm text-neutral-500 mt-2">
                  Sessions will appear here once the interview starts
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};