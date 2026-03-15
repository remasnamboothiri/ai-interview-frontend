import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Download, CheckCircle2, XCircle, TrendingUp, TrendingDown, BarChart3, Users, Target, Eye, Share2 } from 'lucide-react';
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
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [candidatesRes, jobsRes, resultsRes] = await Promise.allSettled([
        candidateService.getAllCandidates(),
        jobService.getAllJobs(),
        interviewResultService.getResults(),
      ]);

      const safeCandidates = candidatesRes.status === 'fulfilled' ? candidatesRes.value : [];
      const safeJobs = jobsRes.status === 'fulfilled' ? jobsRes.value : [];
      const safeResults = resultsRes.status === 'fulfilled'
        ? (resultsRes.value.results || resultsRes.value || [])
        : [];

      setCandidates(Array.isArray(safeCandidates) ? safeCandidates : []);
      setJobs(Array.isArray(safeJobs) ? safeJobs : []);
      setResults(Array.isArray(safeResults) ? safeResults : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load results data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCandidate = (result: InterviewResult) => {
    if (result.candidate_id) return candidates.find(c => c.id === result.candidate_id);
    return null;
  };

  const getJob = (result: InterviewResult) => {
    if (result.job_id) return jobs.find(j => j.id === result.job_id);
    return null;
  };

  // ── PDF Download ──
  const handleDownloadPDF = (result: InterviewResult) => {
    const candidate = getCandidate(result);
    const job = getJob(result);
    const candidateName = candidate?.full_name || candidate?.user?.full_name || 'Candidate';
    const jobTitle = job?.title || 'Position';
    const dateStr = result.created_at ? format(new Date(result.created_at), 'MMM dd, yyyy') : 'N/A';
    const recommendation = result.recommendation?.replace('_', ' ') || 'N/A';
    const scores = [
      { label: 'Technical', score: result.technical_score },
      { label: 'Communication', score: result.communication_score },
      { label: 'Cultural Fit', score: result.cultural_fit_score },
      { label: 'Behavioral', score: result.behavioral_score || 0 },
      { label: 'Overall', score: result.overall_score },
    ];

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Interview Report - ${candidateName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a2e;padding:40px;line-height:1.6}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #16a34a;padding-bottom:20px;margin-bottom:30px}
.company{font-size:22px;font-weight:bold;color:#16a34a}
.score-big{font-size:48px;font-weight:bold;color:#16a34a;line-height:1}
.badge{display:inline-block;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:bold;margin-top:8px}
.pass{background:#dcfce7;color:#16a34a}.fail{background:#fee2e2;color:#dc2626}
.grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;background:#f8fafc;padding:16px;border-radius:8px;margin-bottom:24px}
.lbl{font-size:11px;color:#666;margin-bottom:2px}.val{font-weight:bold;font-size:13px}
.sec{font-size:16px;font-weight:bold;margin:24px 0 12px;border-left:4px solid #16a34a;padding-left:10px}
.row{display:flex;align-items:center;margin-bottom:10px;gap:12px}
.nm{width:140px}.bar{flex:1;height:10px;background:#e5e7eb;border-radius:5px;overflow:hidden}
.fill{height:100%;background:#16a34a;border-radius:5px}.sv{width:60px;text-align:right;font-weight:bold}
.box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-top:8px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:8px}
.s{padding:6px 0;border-bottom:1px solid #e5e7eb;font-size:12px;color:#166534}
.w{padding:6px 0;border-bottom:1px solid #e5e7eb;font-size:12px;color:#92400e}
.rec{background:#f0fdf4;border:2px solid #16a34a;border-radius:8px;padding:16px;text-align:center;margin-top:8px}
.rec-t{font-size:20px;font-weight:bold;color:#16a34a;text-transform:capitalize}
.foot{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#999}
</style></head><body>
<div class="header"><div>
<div class="company">HireFlow AI</div>
<div style="font-size:14px;color:#666">Interview Assessment Report</div>
<div style="font-size:11px;color:#999;margin-top:4px">Generated ${format(new Date(), 'MMMM dd, yyyy • hh:mm a')}</div>
</div><div style="text-align:right">
<div class="score-big">${Number(result.overall_score).toFixed(1)}</div>
<div style="font-size:12px;color:#666">Overall Score / 10</div>
<div class="badge ${result.passed ? 'pass' : 'fail'}">${result.passed ? '✓ Passed' : '✗ Not Passed'}</div>
</div></div>
<div class="grid">
<div><div class="lbl">Candidate</div><div class="val">${candidateName}</div></div>
<div><div class="lbl">Position</div><div class="val">${jobTitle}</div></div>
<div><div class="lbl">Date</div><div class="val">${dateStr}</div></div>
<div><div class="lbl">Email</div><div class="val">${candidate?.email || candidate?.user?.email || 'N/A'}</div></div>
<div><div class="lbl">Phone</div><div class="val">${candidate?.phone || candidate?.user?.phone || 'N/A'}</div></div>
<div><div class="lbl">Type</div><div class="val">AI-Powered Interview</div></div>
</div>
<div class="sec">Score Breakdown</div>
${scores.map(s => `<div class="row"><div class="nm">${s.label}</div><div class="bar"><div class="fill" style="width:${(Number(s.score)/10)*100}%"></div></div><div class="sv">${Number(s.score).toFixed(1)}/10</div></div>`).join('')}
<div class="sec">Recommendation</div>
<div class="rec"><div class="rec-t">${recommendation}</div></div>
<div class="sec">Assessment</div>
<div class="box">${result.assessment_summary || 'No summary available.'}</div>
<div class="sec">Strengths & Improvements</div>
<div class="cols"><div>
<div style="font-weight:bold;color:#166534;margin-bottom:8px">✓ Strengths</div>
${(result.strengths||[]).map(s=>`<div class="s">• ${s}</div>`).join('')||'<div class="s">None recorded</div>'}
</div><div>
<div style="font-weight:bold;color:#92400e;margin-bottom:8px">⚠ Improvements</div>
${(result.weaknesses||[]).map(w=>`<div class="w">• ${w}</div>`).join('')||'<div class="w">None recorded</div>'}
</div></div>
${(result.red_flags||[]).length>0?`<div class="sec">Red Flags</div>${result.red_flags.map(f=>`<div style="padding:6px 0;border-bottom:1px solid #fee2e2;font-size:12px;color:#dc2626">⚑ ${f}</div>`).join('')}`:''}
<div class="foot">Generated by HireFlow AI. Confidential — For Recruiter Use Only.</div>
</body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.onload = () => setTimeout(() => w.print(), 500); }
  };

  // ── Share ──
  const handleShare = async (result: InterviewResult) => {
    const candidate = getCandidate(result);
    const job = getJob(result);
    const name = candidate?.full_name || candidate?.user?.full_name || 'Candidate';
    const title = job?.title || 'Position';
    const text = `Interview Result: ${name} — ${title}\nScore: ${Number(result.overall_score).toFixed(1)}/10 | ${result.passed ? 'Passed ✓' : 'Not Passed ✗'}`;
    const url = `${window.location.origin}/results/${result.id}`;

    if (navigator.share) {
      try { await navigator.share({ title: `Report - ${name}`, text, url }); return; } catch { return; }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareMessage(`Copied link for ${name}!`);
      setTimeout(() => setShareMessage(null), 3000);
    } catch { prompt('Copy this link:', url); }
  };

  // ── Export CSV ──
  const handleExportCSV = () => {
    if (!results.length) return;
    const headers = ['Candidate','Position','Date','Overall','Technical','Communication','Cultural Fit','Behavioral','Passed','Recommendation'];
    const rows = results.map(r => {
      const c = getCandidate(r); const j = getJob(r);
      return [
        c?.full_name||c?.user?.full_name||'Candidate', j?.title||'Position',
        r.created_at ? format(new Date(r.created_at),'yyyy-MM-dd') : '',
        Number(r.overall_score).toFixed(1), Number(r.technical_score).toFixed(1),
        Number(r.communication_score).toFixed(1), Number(r.cultural_fit_score).toFixed(1),
        Number(r.behavioral_score||0).toFixed(1), r.passed?'Yes':'No',
        r.recommendation?.replace('_',' ')||'',
      ];
    });
    const csv = [headers,...rows].map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `interview_results_${format(new Date(),'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // ── Stats ──
  const totalResults = results.length;
  const passedResults = results.filter(r => r.passed).length;
  const passRate = totalResults > 0 ? (passedResults / totalResults) * 100 : 0;
  const avgScore = totalResults > 0 ? results.reduce((s, r) => s + Number(r.overall_score), 0) / totalResults : 0;

  const chartData = totalResults > 0 ? [
    { name: 'Technical', avg: Number((results.reduce((s, r) => s + Number(r.technical_score || 0), 0) / totalResults).toFixed(1)) },
    { name: 'Communication', avg: Number((results.reduce((s, r) => s + Number(r.communication_score || 0), 0) / totalResults).toFixed(1)) },
    { name: 'Cultural Fit', avg: Number((results.reduce((s, r) => s + Number(r.cultural_fit_score || 0), 0) / totalResults).toFixed(1)) },
    { name: 'Behavioral', avg: Number((results.reduce((s, r) => s + Number(r.behavioral_score || 0), 0) / totalResults).toFixed(1)) },
    { name: 'Overall', avg: Number((results.reduce((s, r) => s + Number(r.overall_score || 0), 0) / totalResults).toFixed(1)) },
  ] : [];

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Results & Analytics</h1>
            <p className="text-neutral-600 mt-1">Loading results...</p>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i}><CardContent className="p-6"><div className="animate-pulse space-y-3">
              <div className="h-4 bg-neutral-100 rounded w-24" />
              <div className="h-8 bg-neutral-100 rounded w-16" />
            </div></CardContent></Card>
          ))}
        </div>
        {[1,2].map(i => (
          <Card key={i}><CardContent><div className="animate-pulse space-y-4 py-4">
            <div className="flex justify-between"><div className="space-y-2 flex-1">
              <div className="h-5 bg-neutral-100 rounded w-48" />
              <div className="h-4 bg-neutral-100 rounded w-32" />
            </div><div className="h-10 bg-neutral-100 rounded w-16" /></div>
            <div className="grid grid-cols-5 gap-4">{[1,2,3,4,5].map(j => <div key={j} className="h-16 bg-neutral-50 rounded-lg" />)}</div>
            <div className="h-16 bg-neutral-50 rounded" />
          </div></CardContent></Card>
        ))}
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
          <Button onClick={() => { hasFetchedRef.current = false; loadData(); }}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {shareMessage && (
        <div className="fixed top-20 right-6 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
          ✓ {shareMessage}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Results & Analytics</h1>
          <p className="text-neutral-600 mt-1">Review interview results and performance metrics</p>
        </div>
        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportCSV} disabled={!results.length}>
          Export CSV
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
                      <Badge variant="neutral" className="capitalize">
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

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-3">Score Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {scoreBreakdown.map(({ key, label, value }) => (
                      <div key={key} className="bg-neutral-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-neutral-600">{label}</p>
                          {value >= 7.5 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-orange-600" />}
                        </div>
                        <p className="text-2xl font-bold text-secondary">{value.toFixed(1)}</p>
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
                      <CheckCircle2 className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {(result.strengths || []).map((s, i) => (
                        <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span><span>{s}</span>
                        </li>
                      ))}
                      {(!result.strengths || result.strengths.length === 0) && (
                        <li className="text-sm text-neutral-500">No strengths recorded</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {(result.weaknesses || []).map((w, i) => (
                        <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span><span>{w}</span>
                        </li>
                      ))}
                      {(!result.weaknesses || result.weaknesses.length === 0) && (
                        <li className="text-sm text-neutral-500">No weaknesses recorded</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-200">
                  <Button size="sm" leftIcon={<Eye className="w-4 h-4" />} onClick={() => navigate(`/results/${result.id}`)}>
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => handleDownloadPDF(result)}>
                    Download Report
                  </Button>
                  <Button variant="ghost" size="sm" leftIcon={<Share2 className="w-4 h-4" />} onClick={() => handleShare(result)}>
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