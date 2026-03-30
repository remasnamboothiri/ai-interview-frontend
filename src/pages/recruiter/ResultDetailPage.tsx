import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { Camera, AlertTriangle, ShieldAlert, VideoOff } from 'lucide-react';
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

// ✅ FIX: Helper to resolve screenshot URLs — always build absolute URLs upfront
// so images load correctly in both local dev and production (Render, etc.)
const resolveScreenshotUrl = (url: string): string => {
  if (!url) return '';
  // Already an absolute URL (http/https) — use as-is
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Relative path — prepend the backend API base URL from env
  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  // Ensure we don't double-slash
  const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};

export const ResultDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ NEW: State for button feedback
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadResultData(parseInt(id, 10));
    }
  }, [id]);

  const loadResultData = async (interviewId: number) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ FIX: Always fetch by interview ID, not result ID
      // This ensures we get the correct result for the interview we're viewing
      let resultData: InterviewResult;
      try {
        resultData = await interviewResultService.getResult(interviewId);
      } catch {
        resultData = await interviewResultService.getResultByInterview(interviewId);
      }
      setResult(resultData);

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

  // ============================================================
  // ✅ PDF DOWNLOAD FUNCTION
  // ============================================================
  const handleDownloadPDF = async () => {
    if (!result) return;
    setIsDownloading(true);

    try {
      const candidateName =
        candidate?.full_name ||
        candidate?.user?.full_name ||
        'Candidate';
      const jobTitle = job?.title || 'Position';
      const dateStr = result.created_at
        ? format(new Date(result.created_at), 'MMM dd, yyyy')
        : 'N/A';
      const recommendation = result.recommendation?.replace('_', ' ') || 'N/A';

      // ── Build HTML content for PDF ──────────────────────────
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Interview Report - ${candidateName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              font-size: 13px;
              color: #1a1a2e;
              padding: 40px;
              line-height: 1.6;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 3px solid #16a34a;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-name {
              font-size: 22px;
              font-weight: bold;
              color: #16a34a;
            }
            .report-title {
              font-size: 14px;
              color: #666;
              margin-top: 4px;
            }
            .overall-score {
              text-align: right;
            }
            .score-big {
              font-size: 48px;
              font-weight: bold;
              color: #16a34a;
              line-height: 1;
            }
            .score-label { font-size: 12px; color: #666; }
            .badge {
              display: inline-block;
              padding: 4px 14px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: bold;
              margin-top: 8px;
            }
            .badge-pass { background: #dcfce7; color: #16a34a; }
            .badge-fail { background: #fee2e2; color: #dc2626; }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 16px;
              background: #f8fafc;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 24px;
            }
            .info-label { font-size: 11px; color: #666; margin-bottom: 2px; }
            .info-value { font-weight: bold; font-size: 13px; }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #1a1a2e;
              margin-bottom: 12px;
              margin-top: 24px;
              border-left: 4px solid #16a34a;
              padding-left: 10px;
            }
            .score-row {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
              gap: 12px;
            }
            .score-name { width: 140px; font-size: 13px; }
            .score-bar-bg {
              flex: 1;
              height: 10px;
              background: #e5e7eb;
              border-radius: 5px;
              overflow: hidden;
            }
            .score-bar-fill {
              height: 100%;
              background: #16a34a;
              border-radius: 5px;
            }
            .score-value {
              width: 60px;
              text-align: right;
              font-weight: bold;
              font-size: 13px;
            }
            .assessment-box {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 8px;
              padding: 16px;
              margin-top: 8px;
            }
            .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 8px; }
            .strength-item {
              padding: 6px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 12px;
              color: #166534;
            }
            .weakness-item {
              padding: 6px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 12px;
              color: #92400e;
            }
            .redflag-item {
              padding: 6px 0;
              border-bottom: 1px solid #fee2e2;
              font-size: 12px;
              color: #dc2626;
            }
            .transcript-box {
              background: #f8fafc;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 16px;
              margin-top: 8px;
              max-height: 300px;
              overflow: hidden;
            }
            .transcript-line { margin-bottom: 10px; font-size: 12px; }
            .ai-label { font-weight: bold; color: #2563eb; }
            .candidate-label { font-weight: bold; color: #16a34a; }
            .footer {
              margin-top: 40px;
              padding-top: 16px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 11px;
              color: #999;
            }
            .recommendation-box {
              background: #f0fdf4;
              border: 2px solid #16a34a;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
              margin-top: 8px;
            }
            .recommendation-text {
              font-size: 20px;
              font-weight: bold;
              color: #16a34a;
              text-transform: capitalize;
            }
          </style>
        </head>
        <body>

          <!-- Header -->
          <div class="header">
            <div>
              <div class="company-name">HireFlow AI</div>
              <div class="report-title">Interview Assessment Report</div>
              <div style="font-size:11px; color:#999; margin-top:4px;">
                Generated on ${format(new Date(), 'MMMM dd, yyyy • hh:mm a')}
              </div>
            </div>
            <div class="overall-score">
              <div class="score-big">${Number(result.overall_score).toFixed(1)}</div>
              <div class="score-label">Overall Score / 10</div>
             <div class="badge ${isPassed ? 'badge-pass' : 'badge-fail'}">
  ${isPassed ? '✓ Passed' : '✗ Not Passed'}
              </div>
            </div>
          </div>

          <!-- Candidate Info -->
          <div class="info-grid">
            <div>
              <div class="info-label">Candidate Name</div>
              <div class="info-value">${candidateName}</div>
            </div>
            <div>
              <div class="info-label">Position Applied</div>
              <div class="info-value">${jobTitle}</div>
            </div>
            <div>
              <div class="info-label">Interview Date</div>
              <div class="info-value">${dateStr}</div>
            </div>
            <div>
              <div class="info-label">Email</div>
              <div class="info-value">
                ${candidate?.email || candidate?.user?.email || 'N/A'}
              </div>
            </div>
            <div>
              <div class="info-label">Phone</div>
              <div class="info-value">
                ${candidate?.phone || candidate?.user?.phone || 'N/A'}
              </div>
            </div>
            <div>
              <div class="info-label">Interview Type</div>
              <div class="info-value">AI-Powered Interview</div>
            </div>
          </div>

          <!-- Score Breakdown -->
          <div class="section-title">Score Breakdown</div>
          ${[
            { label: 'Technical', score: result.technical_score },
            { label: 'Communication', score: result.communication_score },
            { label: 'Cultural Fit', score: result.cultural_fit_score },
            { label: 'Behavioral', score: result.behavioral_score || 0 },
            { label: 'Overall', score: result.overall_score },
          ].map(({ label, score }) => `
            <div class="score-row">
              <div class="score-name">${label}</div>
              <div class="score-bar-bg">
                <div class="score-bar-fill" style="width:${(Number(score) / 10) * 100}%"></div>
              </div>
              <div class="score-value">${Number(score).toFixed(1)} / 10</div>
            </div>
          `).join('')}

          <!-- Recommendation -->
          <div class="section-title">Final Recommendation</div>
          <div class="recommendation-box">
            <div class="recommendation-text">${recommendation}</div>
          </div>

          ${result.ai_feedback?.evaluation_error ? `
            <div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:8px;padding:16px;margin-top:16px;">
              <div style="font-weight:bold;color:#92400e;margin-bottom:4px;">⚠ AI Evaluation Failed</div>
              <div style="color:#a16207;font-size:13px;">Scores shown are not valid. Please review the transcript manually.</div>
            </div>
          ` : ''}

          <!-- Assessment Summary -->
          <div class="section-title">Assessment Summary</div>
          <div class="assessment-box">
            ${result.assessment_summary || 'No assessment summary available.'}
          </div>

          <!-- Strengths & Weaknesses -->
          <div class="section-title">Strengths & Areas for Improvement</div>
          <div class="two-col">
            <div>
              <div style="font-weight:bold; color:#166534; margin-bottom:8px;">
                ✓ Key Strengths
              </div>
              ${(result.strengths || []).length > 0
                ? result.strengths.map(s =>
                    `<div class="strength-item">• ${s}</div>`
                  ).join('')
                : '<div class="strength-item">No strengths recorded</div>'
              }
            </div>
            <div>
              <div style="font-weight:bold; color:#92400e; margin-bottom:8px;">
                ⚠ Areas for Improvement
              </div>
              ${(result.weaknesses || []).length > 0
                ? result.weaknesses.map(w =>
                    `<div class="weakness-item">• ${w}</div>`
                  ).join('')
                : '<div class="weakness-item">No weaknesses recorded</div>'
              }
            </div>
          </div>

          <!-- Red Flags -->
          ${(result.red_flags || []).length > 0 ? `
            <div class="section-title">Red Flags</div>
            ${result.red_flags.map(f =>
              `<div class="redflag-item">⚑ ${f}</div>`
            ).join('')}
          ` : ''}

          <!-- Transcript -->
          ${result.transcript ? `
            <div class="section-title">Interview Transcript (Summary)</div>
            <div class="transcript-box">
              ${result.transcript.split('\n\n').slice(0, 10).map(line => {
                const isAI = line.includes('AI Interviewer:');
                return `
                  <div class="transcript-line">
                    <span class="${isAI ? 'ai-label' : 'candidate-label'}">
                      ${isAI ? '🤖 AI Interviewer' : '👤 Candidate'}:
                    </span>
                    <span>
                      ${line.replace(/^(:robot_face:|:bust_in_silhouette:|🤖|👤)?\s*(AI Interviewer|Candidate):\s*/i, '')}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            This report was automatically generated by HireFlow AI Interview Platform.
            Confidential — For Recruiter Use Only.
          </div>

        </body>
        </html>
      `;

      // ── Open in new window and trigger print/save as PDF ──
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        // Wait for content to load then trigger print dialog
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ============================================================
  // ✅ SHARE FUNCTION
  // ============================================================
  const handleShare = async () => {
    if (!result) return;

    const candidateName =
      candidate?.full_name ||
      candidate?.user?.full_name ||
      'Candidate';
    const jobTitle = job?.title || 'Position';
    const shareText = `Interview Result for ${candidateName} — ${jobTitle}\nOverall Score: ${Number(result.overall_score).toFixed(1)}/10\nResult: ${isPassed ? 'Passed ✓' : 'Not Passed ✗'}\nRecommendation: ${result.recommendation?.replace('_', ' ')}`;
    const shareUrl = window.location.href;

    // Try Web Share API first (works on mobile and some desktops)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Interview Report - ${candidateName}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled share — that's fine
        return;
      }
    }

    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(
        `${shareText}\n\nView full report: ${shareUrl}`
      );
      setShareMessage('Link copied to clipboard!');
      setTimeout(() => setShareMessage(''), 3000);
    } catch (err) {
      // Final fallback: show the URL in an alert
      alert(`Share this link:\n${shareUrl}`);
    }
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

  const scoreEntries = [
    { label: 'Technical', score: result.technical_score },
    { label: 'Communication', score: result.communication_score },
    { label: 'Cultural Fit', score: result.cultural_fit_score },
    { label: 'Behavioral', score: result.behavioral_score || 0 },
    { label: 'Overall', score: result.overall_score },
  ];


   const isPassed = (
  Number(result.overall_score) >= 5.0 &&
  Number(result.technical_score) >= 5.0 &&
  Number(result.cultural_fit_score) >= 5.0 &&
  Number(result.behavioral_score) >= 5.0 &&
  Number(result.communication_score) >= 4.0
);


  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* ── Top Navigation ── */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(ROUTES.RESULTS)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Results
        </Button>
        <div className="flex items-center gap-2">

          {/* ✅ Share message feedback */}
          {shareMessage && (
            <span className="text-sm text-green-600 font-medium">
              {shareMessage}
            </span>
          )}

          {/* ✅ Share Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>

          {/* ✅ Download PDF Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Generating...' : 'Download Report'}
          </Button>

        </div>
      </div>

      {/* ── Result Header ── */}
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
              {result.created_at
                ? format(new Date(result.created_at), 'MMM dd, yyyy')
                : 'N/A'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-primary-600 mb-2">
            {Number(result.overall_score).toFixed(1)}
          </div>
          <Badge
           variant={isPassed ? 'success' : 'danger'}
            className="text-base px-4 py-1"
          >
            {isPassed ? (
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

      {/* ── Candidate Info ── */}
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

      {/* ── Score Breakdown ── */}
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

      {/* ── AI Evaluation Error Warning ── */}
      {result.ai_feedback?.evaluation_error && (
        <Card>
          <CardContent className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
              <AlertCircle className="w-5 h-5" />
              AI Evaluation Failed
            </div>
            <p className="text-amber-700 text-sm">
              Scores shown are not valid. The AI could not evaluate this interview.
              Please review the transcript manually.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Assessment Summary ── */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-700 leading-relaxed">{result.assessment_summary}</p>
        </CardContent>
      </Card>

      {/* ── Strengths & Weaknesses ── */}
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

      {/* ── Red Flags ── */}
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

      {/* ── Screenshot Analysis / Integrity Detection ── */}
      {result.ai_feedback?.screenshot_analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Camera className="w-5 h-5" />
              Interview Integrity Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-neutral-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-secondary">
                  {result.ai_feedback.screenshot_analysis.total_screenshots || 0}
                </p>
                <p className="text-xs text-neutral-600 mt-1">Total Screenshots</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-secondary">
                  {result.ai_feedback.screenshot_analysis.screenshots_analyzed || 0}
                </p>
                <p className="text-xs text-neutral-600 mt-1">Screenshots Analyzed</p>
              </div>
              <div className={`rounded-lg p-3 text-center ${
                result.ai_feedback.screenshot_analysis.cheating_detected
                  ? 'bg-red-50'
                  : 'bg-green-50'
              }`}>
                <p className={`text-2xl font-bold ${
                  result.ai_feedback.screenshot_analysis.cheating_detected
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {result.ai_feedback.screenshot_analysis.cheating_detected
                    ? '⚠ Issues Found'
                    : '✓ Clean'
                  }
                </p>
                <p className="text-xs text-neutral-600 mt-1">Integrity Status</p>
              </div>
            </div>

            {/* Cheating Detected Warning */}
            {result.ai_feedback.screenshot_analysis.cheating_detected && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 mb-2">
                      Integrity Issues Detected —{' '}
                      {result.ai_feedback.screenshot_analysis.severity === 'high'
                        ? 'Interview Flagged For Review'
                        : 'Minor Concerns Found'
                      }
                    </p>
                    <ul className="space-y-2">
                      {result.ai_feedback.screenshot_analysis.cheating_flags?.map(
                        (flag: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                            {flag}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ── Detection Breakdown — now 4 columns including Camera Off ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

              {/* Multiple Persons */}
              <div className={`rounded-lg p-3 border ${
                (result.ai_feedback.screenshot_analysis.multiple_person_count || 0) >= 2
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                <p className="text-sm font-medium text-neutral-700 mb-1">Multiple Persons</p>
                <p className={`text-xl font-bold ${
                  (result.ai_feedback.screenshot_analysis.multiple_person_count || 0) >= 2
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {result.ai_feedback.screenshot_analysis.multiple_person_count || 0} detected
                </p>
              </div>

              {/* Phone Usage */}
              <div className={`rounded-lg p-3 border ${
                (result.ai_feedback.screenshot_analysis.phone_detected_count || 0) >= 1
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                <p className="text-sm font-medium text-neutral-700 mb-1">Phone Usage</p>
                <p className={`text-xl font-bold ${
                  (result.ai_feedback.screenshot_analysis.phone_detected_count || 0) >= 1
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {result.ai_feedback.screenshot_analysis.phone_detected_count || 0} detected
                </p>
              </div>

              {/* Looking Away */}
              <div className={`rounded-lg p-3 border ${
                (result.ai_feedback.screenshot_analysis.looking_away_count || 0) >= 3
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                <p className="text-sm font-medium text-neutral-700 mb-1">Looking Away</p>
                <p className={`text-xl font-bold ${
                  (result.ai_feedback.screenshot_analysis.looking_away_count || 0) >= 3
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {result.ai_feedback.screenshot_analysis.looking_away_count || 0} instances
                </p>
              </div>

              {/* ── NEW: Camera Off ── */}
              <div className={`rounded-lg p-3 border ${
                (result.ai_feedback.screenshot_analysis.camera_off_count || 0) >= 2
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-1 mb-1">
                  <VideoOff className="w-3.5 h-3.5 text-neutral-500" />
                  <p className="text-sm font-medium text-neutral-700">Camera Off</p>
                </div>
                <p className={`text-xl font-bold ${
                  (result.ai_feedback.screenshot_analysis.camera_off_count || 0) >= 2
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {result.ai_feedback.screenshot_analysis.camera_off_count || 0} instances
                </p>
              </div>

            </div>

            {/* Screenshot Thumbnails */}
            {result.ai_feedback.screenshot_analysis.screenshot_urls?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-3">
                  Sample Screenshots From Interview
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {result.ai_feedback.screenshot_analysis.screenshot_urls.map(
                    (url: string, index: number) => (
                      <div key={index} className="relative">
                        {/* ✅ FIX: Always resolve to absolute URL upfront using helper.
                            Never rely on onError retry — it fails silently in production
                            because the retry condition checked for 'localhost:8000' which
                            is never present in the live Render URL. */}
                        <img
                          src={resolveScreenshotUrl(url)}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-neutral-200"
                          onError={(e) => {
                            // Just hide broken images cleanly — no retry needed since
                            // URL is already resolved correctly above
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                          }}
                        />
                        <span className="absolute bottom-1 right-1 text-[10px] bg-black/50 text-white px-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* No screenshots note */}
            {result.ai_feedback.screenshot_analysis.total_screenshots === 0 && (
              <div className="text-center py-6 text-neutral-500">
                <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No screenshots were captured during this interview.</p>
              </div>
            )}

          </CardContent>
        </Card>
      )}

      {/* ── Transcript ── */}
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
                const isAI = line.includes('AI Interviewer');
                return (
                  <div key={i} className={`mb-3 ${isAI ? 'pl-0' : 'pl-4'}`}>
                    <span
                      className={`font-semibold ${
                        isAI ? 'text-blue-600' : 'text-green-600'
                      }`}
                    >
                      {isAI ? '🤖 AI Interviewer' : '👤 Candidate'}:
                    </span>
                    <p className="text-neutral-700 mt-1">
                      {line.replace(/^(:robot_face:|:bust_in_silhouette:|🤖|👤)?\s*(AI Interviewer|Candidate):\s*/i, '')}
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