import React from 'react';

interface InactivityWarningModalProps {
  countdown: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}

export default function InactivityWarningModal({
  countdown,
  onStayLoggedIn,
  onLogoutNow
}: InactivityWarningModalProps) {
  return (
    <>
      <div 
        className="inactivity-modal-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inactivity-modal">
          <div className="inactivity-modal-icon">⚠️</div>
          <h2 className="inactivity-modal-title">Session Timeout Warning</h2>
          <p className="inactivity-modal-message">
            You&apos;ve been inactive for 30 seconds.
          </p>
          {countdown > 10 ? (
            <div className="inactivity-message">
              <p className="warning-text">
                You will be automatically logged out in {countdown} seconds unless you take action.
              </p>
            </div>
          ) : (
            <div className="inactivity-countdown">
              <div className="countdown-circle">
                <span className="countdown-number">{countdown}</span>
              </div>
              <p className="countdown-text">seconds until automatic logout</p>
            </div>
          )}
          <div className="inactivity-modal-actions">
            <button 
              className="stay-logged-in-btn"
              onClick={onStayLoggedIn}
            >
              Stay Logged In
            </button>
            <button 
              className="logout-now-btn"
              onClick={onLogoutNow}
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .inactivity-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .inactivity-modal {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          max-width: 450px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .inactivity-modal-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .inactivity-modal-title {
          color: #dc2626;
          font-size: 1.75rem;
          font-weight: bold;
          margin: 0 0 1rem 0;
        }

        .inactivity-modal-message {
          color: #666;
          font-size: 1.1rem;
          margin: 0 0 2rem 0;
          line-height: 1.5;
        }

        .inactivity-message {
          margin: 2rem 0;
        }

        .warning-text {
          color: #dc2626;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
          padding: 1.5rem;
          background: #fef2f2;
          border-radius: 8px;
          border: 2px solid #fecaca;
        }

        .inactivity-countdown {
          margin: 2rem 0;
        }

        .countdown-circle {
          width: 120px;
          height: 120px;
          margin: 0 auto 1rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b35 0%, #f41b1b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3);
          animation: countdownPulse 1s ease-in-out infinite;
        }

        @keyframes countdownPulse {
          0%, 100% {
            box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3);
          }
          50% {
            box-shadow: 0 8px 32px rgba(255, 107, 53, 0.5);
          }
        }

        .countdown-number {
          color: white;
          font-size: 3rem;
          font-weight: bold;
          font-variant-numeric: tabular-nums;
        }

        .countdown-text {
          color: #999;
          font-size: 0.95rem;
          margin: 0;
        }

        .inactivity-modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .stay-logged-in-btn,
        .logout-now-btn {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .stay-logged-in-btn {
          background: #10b981;
          color: white;
        }

        .stay-logged-in-btn:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .stay-logged-in-btn:active {
          transform: translateY(0);
        }

        .logout-now-btn {
          background: #f3f4f6;
          color: #374151;
        }

        .logout-now-btn:hover {
          background: #e5e7eb;
          transform: translateY(-2px);
        }

        .logout-now-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .inactivity-modal {
            padding: 2rem;
            max-width: 90%;
          }

          .inactivity-modal-icon {
            font-size: 3rem;
          }

          .inactivity-modal-title {
            font-size: 1.5rem;
          }

          .inactivity-modal-message {
            font-size: 1rem;
          }

          .countdown-circle {
            width: 100px;
            height: 100px;
          }

          .countdown-number {
            font-size: 2.5rem;
          }

          .inactivity-modal-actions {
            flex-direction: column;
          }

          .stay-logged-in-btn,
          .logout-now-btn {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
