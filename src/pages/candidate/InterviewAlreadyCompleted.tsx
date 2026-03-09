import { CheckCircle, Mail } from 'lucide-react';

export const InterviewAlreadyCompletedPage = () => {
  return (
    <div className="h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-white text-2xl font-bold mb-3">Interview Already Completed</h1>
        <p className="text-neutral-400 text-sm mb-6">
          You have already attended this interview. Your responses have been recorded and are being evaluated.
        </p>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-5 text-left space-y-3">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <p className="text-neutral-300 text-sm">
              Please contact the HR team if you have any questions about your interview status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};