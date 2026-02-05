import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { ArrowLeft, Camera, AlertTriangle, Eye, Download, Filter, Shield, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { interviewScreenshotService, InterviewScreenshot } from '@/services/interviewScreenshotService';

export const InterviewScreenshotsPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [screenshots, setScreenshots] = useState<InterviewScreenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'flagged'>('all');
  const [selectedScreenshot, setSelectedScreenshot] = useState<InterviewScreenshot | null>(null);

  useEffect(() => {
    if (interviewId) {
      loadScreenshots(parseInt(interviewId));
    }
  }, [interviewId]);

  const loadScreenshots = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await interviewScreenshotService.getScreenshotsByInterview(id);
      setScreenshots(data);
    } catch (err) {
      console.error('Error loading screenshots:', err);
      setError('Failed to load screenshots');
    } finally {
      setLoading(false);
    }
  };

  const filteredScreenshots = screenshots.filter(screenshot => {
    if (filter === 'flagged') {
      return screenshot.multiple_people_detected || screenshot.issue_type;
    }
    return true;
  });

  const flaggedCount = screenshots.filter(s => s.multiple_people_detected || s.issue_type).length;
  const totalScreenshots = screenshots.length;

  const getIssueColor = (issueType?: string) => {
    switch (issueType) {
      case 'multiple_people': return 'text-red-600';
      case 'no_face': return 'text-orange-600';
      case 'looking_away': return 'text-yellow-600';
      case 'phone_detected': return 'text-purple-600';
      default: return 'text-neutral-600';
    }
  };

  const getIssueLabel = (issueType?: string) => {
    switch (issueType) {
      case 'multiple_people': return 'Multiple People';
      case 'no_face': return 'No Face Detected';
      case 'looking_away': return 'Looking Away';
      case 'phone_detected': return 'Phone Detected';
      default: return 'Unknown Issue';
    }
  };

  const handleScreenshotClick = (screenshot: InterviewScreenshot) => {
    setSelectedScreenshot(screenshot);
  };

  const closeModal = () => {
    setSelectedScreenshot(null);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/interviews')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Interviews
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadScreenshots(parseInt(interviewId!))}>
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-secondary">Interview Screenshots</h1>
          <p className="text-neutral-600">Proctoring screenshots and security monitoring</p>
        </div>
      </div>

      {/* Summary Stats */}
      {screenshots.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-neutral-600">Total Screenshots</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{totalScreenshots}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-neutral-600">Flagged</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{flaggedCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-neutral-600">Multiple People</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {screenshots.filter(s => s.multiple_people_detected).length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-neutral-600">Latest</span>
              </div>
              <p className="text-sm font-bold text-orange-600">
                {screenshots.length > 0 
                  ? format(new Date(screenshots[0].timestamp), 'HH:mm')
                  : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Filter className="w-4 h-4 mr-2 inline" />
            All Screenshots ({totalScreenshots})
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'flagged'
                ? 'bg-red-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 mr-2 inline" />
            Flagged ({flaggedCount})
          </button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent>
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Screenshots Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredScreenshots.map((screenshot) => (
          <Card 
            key={screenshot.id} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              screenshot.multiple_people_detected || screenshot.issue_type ? 'border-red-200 bg-red-50' : ''
            }`}
            onClick={() => handleScreenshotClick(screenshot)}
          >
            <CardContent className="p-4">
              <div className="aspect-video bg-neutral-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {screenshot.screenshot_url ? (
                  <img 
                    src={screenshot.screenshot_url} 
                    alt={`Screenshot ${screenshot.screenshot_number}`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className="flex flex-col items-center text-neutral-400">
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-xs">No Image</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-secondary text-sm">
                    Screenshot #{screenshot.screenshot_number}
                  </h3>
                  {(screenshot.multiple_people_detected || screenshot.issue_type) && (
                    <Badge variant="danger" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Flagged
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-neutral-600">
                  {format(new Date(screenshot.timestamp), 'MMM dd, HH:mm:ss')}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-600">Faces:</span>
                    <span className={`ml-1 font-medium ${
                      screenshot.face_count > 1 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {screenshot.face_count}
                    </span>
                  </div>
                  {screenshot.confidence_score && (
                    <div>
                      <span className="text-neutral-600">Confidence:</span>
                      <span className="ml-1 font-medium">{screenshot.confidence_score}%</span>
                    </div>
                  )}
                </div>

                {screenshot.issue_type && (
                  <div className="text-xs">
                    <span className="text-red-600 font-medium">Issue:</span>
                    <span className={`ml-1 ${getIssueColor(screenshot.issue_type)}`}>
                      {getIssueLabel(screenshot.issue_type)}
                    </span>
                  </div>
                )}

                {screenshot.multiple_people_detected && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <Users className="w-3 h-3" />
                    <span>Multiple people detected</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredScreenshots.length === 0 && !loading && (
          <div className="col-span-full">
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-600">
                    {filter === 'flagged' ? 'No flagged screenshots found' : 'No screenshots available'}
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">
                    {filter === 'flagged' 
                      ? 'All screenshots appear to be normal'
                      : 'Screenshots will appear here during the interview'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-secondary">
                  Screenshot #{selectedScreenshot.screenshot_number}
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="ghost" size="sm" onClick={closeModal}>
                    ✕
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <img 
                  src={selectedScreenshot.screenshot_url} 
                  alt={`Screenshot ${selectedScreenshot.screenshot_number}`}
                  className="w-full max-h-96 object-contain rounded-lg bg-neutral-100"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-secondary mb-3">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Timestamp:</span>
                      <span>{format(new Date(selectedScreenshot.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Face Count:</span>
                      <span className={selectedScreenshot.face_count > 1 ? 'text-red-600 font-medium' : ''}>
                        {selectedScreenshot.face_count}
                      </span>
                    </div>
                    {selectedScreenshot.confidence_score && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Confidence:</span>
                        <span>{selectedScreenshot.confidence_score}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Multiple People:</span>
                      <span className={selectedScreenshot.multiple_people_detected ? 'text-red-600' : 'text-green-600'}>
                        {selectedScreenshot.multiple_people_detected ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-secondary mb-3">Issues</h4>
                  {selectedScreenshot.issue_type ? (
                    <div className="space-y-2">
                      <Badge variant="danger" className="text-sm">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        {getIssueLabel(selectedScreenshot.issue_type)}
                      </Badge>
                      <p className="text-sm text-neutral-600">
                        This screenshot has been flagged for review due to detected issues.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">No issues detected</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};