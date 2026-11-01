import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportAbuseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportAbuseModal: React.FC<ReportAbuseModalProps> = ({ isOpen, onClose }) => {
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDetails('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative border border-gray-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-800">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 id="report-title" className="text-base font-bold">
              Report Abuse
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close report abuse modal"
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#00acc1] mx-auto" />
            <p className="font-semibold text-gray-900">Thank you for your report</p>
            <p className="text-xs text-gray-500">
              Our review team has recorded your submission for inspection.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <p className="text-xs text-gray-600">
              Blogger takes content guidelines seriously. Please let us know why you are reporting this blog:
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded p-2 focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
              >
                <option value="spam">Spam or deceptive content</option>
                <option value="hate">Hate speech or harassment</option>
                <option value="copyright">Copyright violation</option>
                <option value="privacy">Personal information invasion</option>
                <option value="other">Other policy violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Additional Comments (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Provide any additional context..."
                className="w-full text-xs border border-gray-200 rounded p-2 focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#00acc1] hover:bg-[#00838f] rounded uppercase tracking-wider"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
