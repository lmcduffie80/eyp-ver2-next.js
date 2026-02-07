'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SignaturePad from '@/components/crm/SignaturePad';

interface Contract {
  id: number;
  contract_number: string;
  contract_title: string;
  contract_content: string;
  status: string;
  project_name: string;
  event_type: string;
  event_date: string;
  client_name: string;
  signed_at: string;
  client_signature_data: string;
}

export default function ContractViewPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signedName, setSignedName] = useState('');
  const [signatureData, setSignatureData] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchContract();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/client-portal/auth/verify');
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push('/client-portal/login');
      }
    } catch (error) {
      router.push('/client-portal/login');
    }
  };

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/client-portal/contracts/${contractId}`);
      const data = await response.json();

      if (data.success) {
        setContract(data.contract);
        setSignedName(data.contract.client_name || '');
      } else {
        setError(data.error || 'Failed to load contract');
      }
    } catch (error) {
      console.error('Failed to fetch contract:', error);
      setError('An error occurred loading the contract');
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = () => {
    setShowSignatureModal(true);
  };

  const handleSaveSignature = (data: string) => {
    setSignatureData(data);
  };

  const handleSubmitSignature = async () => {
    if (!signatureData || !signedName || !agreeToTerms) {
      alert('Please complete all fields');
      return;
    }

    setSigning(true);

    try {
      const response = await fetch(`/api/crm/contracts/${contractId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature_data: signatureData,
          signed_name: signedName
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowSignatureModal(false);
        fetchContract(); // Refresh to show signed status
        alert('Contract signed successfully!');
      } else {
        alert(data.error || 'Failed to sign contract');
        setSigning(false);
      }
    } catch (error) {
      console.error('Failed to sign contract:', error);
      alert('An error occurred');
      setSigning(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleLogout = async () => {
    await fetch('/api/client-portal/auth/logout', { method: 'POST' });
    router.push('/client-portal/login');
  };

  if (loading) {
    return (
      <div className="contract-page">
        <div className="loading">Loading contract...</div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="contract-page">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error || 'Contract not found'}</p>
          <button onClick={() => router.push('/client-portal/dashboard')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isSigned = contract.status === 'signed';

  return (
    <div className="contract-page">
      <div className="top-bar">
        <div className="top-bar-content">
          <h1>{contract.contract_title}</h1>
          <div className="actions">
            <button onClick={() => router.push('/client-portal/dashboard')} className="nav-button">
              Dashboard
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="contract-header">
          <div className="contract-meta">
            <span className="contract-number">Contract #{contract.contract_number}</span>
            <span className={`status-badge ${isSigned ? 'signed' : 'pending'}`}>
              {isSigned ? '✓ Signed' : 'Awaiting Signature'}
            </span>
          </div>
          
          {contract.event_type && (
            <p className="event-info">
              {contract.event_type}
              {contract.event_date && ` • ${formatDate(contract.event_date)}`}
            </p>
          )}
        </div>

        <div className="contract-content">
          <div dangerouslySetInnerHTML={{ __html: contract.contract_content.replace(/\n/g, '<br />') }} />
        </div>

        {isSigned ? (
          <div className="signed-section">
            <h3>✓ Contract Signed</h3>
            <p>Signed on {formatDate(contract.signed_at)}</p>
            {contract.client_signature_data && (
              <div className="signature-display">
                <p>Signature:</p>
                <img src={contract.client_signature_data} alt="Signature" />
              </div>
            )}
          </div>
        ) : (
          <div className="action-section">
            <button onClick={handleSignContract} className="sign-button">
              Sign Contract
            </button>
          </div>
        )}
      </div>

      {showSignatureModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-button" onClick={() => setShowSignatureModal(false)}>×</button>
            
            <h2>Sign Contract</h2>
            
            <div className="form-group">
              <label>Full Legal Name *</label>
              <input
                type="text"
                value={signedName}
                onChange={(e) => setSignedName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Signature *</label>
              <SignaturePad onSave={handleSaveSignature} />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
                <span>I agree to the terms and conditions outlined in this contract</span>
              </label>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowSignatureModal(false)} className="cancel-btn" disabled={signing}>
                Cancel
              </button>
              <button onClick={handleSubmitSignature} className="submit-btn" disabled={signing || !signatureData || !agreeToTerms}>
                {signing ? 'Submitting...' : 'Submit Signature'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .contract-page {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .top-bar {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .top-bar-content {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .top-bar h1 {
          margin: 0;
          font-size: 1.6rem;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .nav-button,
        .logout-button {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .nav-button {
          background: #ff6b35;
          color: white;
        }

        .nav-button:hover {
          background: #e55a2b;
        }

        .logout-button {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .logout-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 30px 20px;
        }

        .loading,
        .error-state {
          text-align: center;
          padding: 60px 20px;
        }

        .error-state h2 {
          color: #dc3545;
          margin-bottom: 15px;
        }

        .error-state p {
          color: #666;
          margin-bottom: 25px;
        }

        .back-button {
          padding: 12px 30px;
          background: #ff6b35;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .contract-header {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 20px;
        }

        .contract-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .contract-number {
          font-family: monospace;
          font-weight: 700;
          color: #1a1a1a;
        }

        .status-badge {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-badge.signed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.pending {
          background: #fed7aa;
          color: #92400e;
        }

        .event-info {
          color: #666;
          margin: 0;
        }

        .contract-content {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 20px;
          white-space: pre-wrap;
          line-height: 1.8;
          color: #333;
        }

        .signed-section {
          background: #d1fae5;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
        }

        .signed-section h3 {
          color: #065f46;
          margin: 0 0 10px 0;
        }

        .signed-section p {
          color: #047857;
          margin: 0 0 20px 0;
        }

        .signature-display {
          margin-top: 20px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          display: inline-block;
        }

        .signature-display img {
          max-width: 300px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
        }

        .action-section {
          text-align: center;
          padding: 30px;
        }

        .sign-button {
          padding: 16px 50px;
          background: #ff6b35;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sign-button:hover {
          background: #e55a2b;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal {
          background: white;
          border-radius: 16px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          position: relative;
        }

        .close-button {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border: none;
          background: #f0f0f0;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .close-button:hover {
          background: #e0e0e0;
        }

        .modal h2 {
          margin: 0 0 25px 0;
          color: #1a1a1a;
          font-size: 1.8rem;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
        }

        .form-group input[type="text"] {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #ff6b35;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
          cursor: pointer;
          accent-color: #ff6b35;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
        }

        .cancel-btn,
        .submit-btn {
          padding: 12px 30px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: #f0f0f0;
          color: #666;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .submit-btn {
          background: #ff6b35;
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          background: #e55a2b;
        }

        .cancel-btn:disabled,
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .contract-content {
            padding: 25px;
          }

          .modal-actions {
            flex-direction: column;
          }

          .cancel-btn,
          .submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
