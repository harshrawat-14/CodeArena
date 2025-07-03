/**
 * PREMIUM TOAST NOTIFICATIONS - ENHANCED USER FEEDBACK
 * 
 * Features:
 * - Beautiful animated notifications
 * - Success, error, warning, and info variants
 * - Auto-dismiss with custom durations
 * - Action buttons for interactive toasts
 */

import React from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, Zap } from 'lucide-react';

const toastStyles = {
  success: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    icon: CheckCircle
  },
  error: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#ffffff',
    icon: XCircle
  },
  warning: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#ffffff',
    icon: AlertCircle
  },
  info: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#ffffff',
    icon: Info
  },
  premium: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: '#ffffff',
    icon: Zap
  }
};

const createToast = (type, message, options = {}) => {
  const style = toastStyles[type];
  const Icon = style.icon;

  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        style={{ background: style.background }}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6" style={{ color: style.color }} />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium" style={{ color: style.color }}>
                {message}
              </p>
              {options.description && (
                <p className="mt-1 text-sm opacity-90" style={{ color: style.color }}>
                  {options.description}
                </p>
              )}
            </div>
          </div>
        </div>
        {options.action && (
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                options.action.onClick();
                toast.dismiss(t.id);
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: style.color }}
            >
              {options.action.label}
            </button>
          </div>
        )}
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: style.color }}
          >
            ×
          </button>
        </div>
      </div>
    ),
    {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      ...options
    }
  );
};

// Export individual toast functions
export const toastSuccess = (message, options) => createToast('success', message, options);
export const toastError = (message, options) => createToast('error', message, options);
export const toastWarning = (message, options) => createToast('warning', message, options);
export const toastInfo = (message, options) => createToast('info', message, options);
export const toastPremium = (message, options) => createToast('premium', message, options);

// Quick notification functions for common use cases
export const notifyCodeRun = (executionTime) => {
  toastSuccess(`Code executed successfully in ${executionTime}ms`, {
    description: 'Check the output panel for results'
  });
};

export const notifyCodeError = (error) => {
  toastError('Code execution failed', {
    description: error.message || 'Check your code for syntax errors'
  });
};

export const notifyProblemLoaded = (problemName) => {
  toastPremium(`Problem loaded: ${problemName}`, {
    description: 'Lightning-fast loading via premium API'
  });
};

export const notifyContestCreated = (roomCode) => {
  toastSuccess('Contest created successfully!', {
    description: `Room code: ${roomCode}`,
    action: {
      label: 'Copy',
      onClick: () => navigator.clipboard.writeText(roomCode)
    }
  });
};

export const notifySystemHealth = (health) => {
  if (health.scraping.available) {
    toastInfo('All systems operational', {
      description: `Premium API v${health.version} ready`
    });
  } else {
    toastWarning('Limited functionality', {
      description: 'Scraping service temporarily unavailable'
    });
  }
};

export const notifyAPIError = (operation, error) => {
  toastError(`${operation} failed`, {
    description: error.message || 'Please try again later',
    duration: 6000
  });
};

export const notifyFeatureComingSoon = (feature) => {
  toastInfo(`${feature} coming soon!`, {
    description: 'This premium feature is under development'
  });
};

// Default export for direct use
const premiumToast = {
  success: toastSuccess,
  error: toastError,
  warning: toastWarning,
  info: toastInfo,
  premium: toastPremium,
  
  // Utility functions
  codeRun: notifyCodeRun,
  codeError: notifyCodeError,
  problemLoaded: notifyProblemLoaded,
  contestCreated: notifyContestCreated,
  systemHealth: notifySystemHealth,
  apiError: notifyAPIError,
  comingSoon: notifyFeatureComingSoon
};

export default premiumToast;
