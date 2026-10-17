import React, { useState } from 'react';
import { colors } from '@shared/theme/colors';
import { typography, formatPaiseToRupees } from '@shared/theme/typography';
import { evaluatePermissions } from '@shared/permissions/usePermissions';
import { DEFAULT_ROLE_PERMISSIONS } from '@shared/generated/permission-types';

export default function App() {
  const [currentRole, setCurrentRole] = useState<'SUPER_ADMIN' | 'MANAGER' | 'SALESPERSON'>('SUPER_ADMIN');
  const [isPnlRestricted, setIsPnlRestricted] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'kyc_queue' | 'loan_approvals' | 'handovers' | 'reports' | 'workflows' | 'forms' | 'masters' | 'restrictions' | 'pnl' | 'audit'
  >('dashboard');

  // Workflow Designer State
  const [selectedWorkflow, setSelectedWorkflow] = useState<'CUSTOMER_ONBOARDING' | 'LOAN_DAILY' | 'LOAN_METAL'>('LOAN_DAILY');
  const [simulatedState, setSimulatedState] = useState('PENDING_APPROVAL');

  // Rates State
  const [goldRate, setGoldRate] = useState(6850);
  const [silverRate, setSilverRate] = useState(92);

  // Form Builder State
  const [customFields, setCustomFields] = useState<Array<{ name: string; label: string; type: string; required: boolean }>>([
    { name: 'businessNature', label: 'Nature of Field Business', type: 'text', required: true },
    { name: 'dailyCashFlow', label: 'Average Daily Cash Flow (₹)', type: 'currency', required: false },
  ]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');

  const permissions = DEFAULT_ROLE_PERMISSIONS[currentRole] || [];
  const restrictions = isPnlRestricted && currentRole === 'MANAGER'
    ? { blockedModules: ['pnl', 'expenses'], presetName: 'NO_PNL_EXPENSES' }
    : null;

  const evaluator = evaluatePermissions({
    role: currentRole,
    permissions,
    restrictions,
    permissionsVersion: 1,
  });

  const canViewPnl = evaluator.hasPermission('pnl:read');
  const canManageWorkflows = evaluator.hasPermission('workflows:manage');
  const canManageForms = evaluator.hasPermission('forms:manage');

  const addCustomField = () => {
    if (!newFieldName.trim()) return;
    setCustomFields((prev) => [
      ...prev,
      {
        name: newFieldName.toLowerCase().replace(/\s+/g, '_'),
        label: newFieldName,
        type: newFieldType,
        required: false,
      },
    ]);
    setNewFieldName('');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: typography.fontFamily.sans }}>
      {/* Brand App Bar */}
      <header style={{
        backgroundColor: colors.primary,
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `2px solid ${colors.primaryDark}`,
        boxShadow: '0 2px 4px rgba(184, 134, 11, 0.15)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', color: colors.textOnPrimary, letterSpacing: '0.5px' }}>
              SHRI AMUDHA SMALL FINANCE
            </span>
            <span style={{
              backgroundColor: colors.primarySoftest,
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: '700',
              color: colors.primaryDeep
            }}>
              ADMIN & ENGINES PORTAL
            </span>
          </div>
          <div style={{ fontSize: '13px', color: colors.textPrimary, opacity: 0.85, marginTop: '2px' }}>
            Fully Dynamic, Configuration-Driven Loan Management System
          </div>
        </div>

        {/* Role Simulator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFF', padding: '6px 12px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: colors.textSecondary }}>SIMULATE ROLE:</span>
          <select
            value={currentRole}
            onChange={(e) => {
              const r = e.target.value as any;
              setCurrentRole(r);
              if (r !== 'MANAGER') setIsPnlRestricted(false);
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: `1px solid ${colors.border}`,
              fontWeight: '700',
              color: colors.textPrimary,
              outline: 'none'
            }}
          >
            <option value="SUPER_ADMIN">Super Admin (Owner)</option>
            <option value="MANAGER">Branch Manager</option>
            <option value="SALESPERSON">Salesperson (Field)</option>
          </select>

          {currentRole === 'MANAGER' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', marginLeft: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPnlRestricted}
                onChange={(e) => setIsPnlRestricted(e.target.checked)}
              />
              Apply "No P&L" Restriction
            </label>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ display: 'flex', maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
        {/* Sidebar Nav */}
        <nav style={{ width: '250px', marginRight: '24px' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '16px', border: `1px solid ${colors.border}`, padding: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            {[
              { id: 'dashboard', label: '📊 Portfolio Dashboard', perm: 'dashboard:portfolio' },
              { id: 'kyc_queue', label: '🪪 KYC Verification Queue', perm: 'documents:verify' },
              { id: 'loan_approvals', label: '📑 Loan Approvals Queue', perm: 'loans.daily:approve' },
              { id: 'handovers', label: '💼 Cash Handovers', perm: 'handover:accept' },
              { id: 'reports', label: '📈 PAR & Recovery Reports', perm: 'reports:read' },
              { id: 'workflows', label: '⚡ Workflow Designer', perm: 'workflows:manage' },
              { id: 'forms', label: '📝 Form Builder', perm: 'forms:manage' },
              { id: 'masters', label: '🥇 Gold Rate & Masters', perm: 'rates:manage' },
              { id: 'restrictions', label: '🛡️ Manager Restrictions', perm: 'restrictions:manage' },
              { id: 'pnl', label: '💰 Profit & Loss', perm: 'pnl:read' },
              { id: 'audit', label: '📜 Audit Ledger', perm: 'audit:read' },
            ].map((item) => {
              const isAllowed = evaluator.hasPermission(item.perm);
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isAllowed) setActiveTab(item.id as any);
                  }}
                  disabled={!isAllowed}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isActive ? colors.primary : 'transparent',
                    color: !isAllowed ? colors.textMuted : colors.textPrimary,
                    fontWeight: isActive ? '700' : '500',
                    textAlign: 'left',
                    cursor: isAllowed ? 'pointer' : 'not-allowed',
                    marginBottom: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{item.label}</span>
                  {!isAllowed && <span style={{ fontSize: '11px', color: colors.danger }}>🔒</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content Pane */}
        <main style={{ flex: 1 }}>
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: colors.primaryDeep }}>TOTAL ACTIVE PORTFOLIO</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: colors.textPrimary, marginTop: '4px' }}>
                    {formatPaiseToRupees(1485000000)}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>418 active loan accounts</div>
                </div>

                <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: colors.success }}>TODAY'S COLLECTION RECOVERY</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: colors.textPrimary, marginTop: '4px' }}>
                    {formatPaiseToRupees(4850000)}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.success, marginTop: '4px' }}>↑ 94.2% daily target achieved</div>
                </div>

                <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: colors.primaryDark }}>GOLD COLLATERAL IN CUSTODY</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: colors.textPrimary, marginTop: '4px' }}>
                    1,840.5 g
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>Valuation: ₹1,24,50,000</div>
                </div>
              </div>
            </div>
          )}

          {/* KYC Verification Queue Panel */}
          {activeTab === 'kyc_queue' && (
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Customer KYC Verification Queue</h2>
                  <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '4px 0 0 0' }}>
                    Verify demographic documents, live Verhoeff Aadhaar checksums, and Mantra thumbprint templates.
                  </p>
                </div>
                <span style={{ backgroundColor: colors.primaryLight, padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '700', color: colors.primaryDeep }}>
                  2 Pending Verification
                </span>
              </div>

              <div style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead style={{ backgroundColor: colors.primarySoftest, borderBottom: `1px solid ${colors.border}` }}>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>Customer / Code</th>
                      <th style={{ padding: '12px 16px' }}>Identity & Checks</th>
                      <th style={{ padding: '12px 16px' }}>CIBIL & Biometric</th>
                      <th style={{ padding: '12px 16px' }}>Onboarded By</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '800', color: colors.textPrimary }}>K. Murugesan</div>
                        <div style={{ fontSize: '12px', color: colors.textSecondary }}>Code: CUST-00042 • Phone: 98421-54321</div>
                        <div style={{ fontSize: '11px', color: colors.textMuted }}>14A, Anna Nagar 2nd St, Madurai</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: colors.success, fontWeight: '700' }}>✓ Aadhaar: XXXX-XXXX-4034</div>
                        <div style={{ fontSize: '11px', color: colors.textSecondary }}>Verhoeff valid • Encrypted AES-256</div>
                        <div style={{ color: colors.primaryDeep, fontWeight: '600', marginTop: '2px' }}>PAN: ABCDE1234F (Verified)</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ backgroundColor: colors.success, color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                          CIBIL: 785 EXCELLENT
                        </span>
                        <div style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '4px' }}>
                          Thumbprint: ISO Template (96% Quality)
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '600' }}>sales1 (Route 1)</div>
                        <div style={{ fontSize: '11px', color: colors.textSecondary }}>Today at 10:15 AM</div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button
                          onClick={() => alert('Customer CUST-00042 KYC approved! Status updated to VERIFIED.')}
                          style={{
                            backgroundColor: colors.primary,
                            color: colors.textOnPrimary,
                            border: `1px solid ${colors.primaryDark}`,
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            marginRight: '8px',
                          }}
                        >
                          Approve KYC ✓
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Maker-Checker Loan Approvals Queue */}
          {activeTab === 'loan_approvals' && (
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Loan Approvals Queue (Maker-Checker Enforced)</h2>
                  <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '4px 0 0 0' }}>
                    Branch Manager maker-checker validation. A manager cannot approve their own submitted loan.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ backgroundColor: colors.primaryLight, padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', color: colors.primaryDeep }}>
                        DAILY MICRO LOAN
                      </span>
                      <h3 style={{ margin: '8px 0 4px 0', fontSize: '18px', fontWeight: '800' }}>
                        ₹20,000 • LN-202610-0012
                      </h3>
                      <div style={{ fontSize: '13px', color: colors.textSecondary }}>
                        Customer: M. Murugan (CUST-00042) • Tenure: 100 Days • Installment: ₹224/day • Created By: <b>sales1</b>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => alert('Loan LN-202610-0012 approved! Ready for disbursal.')}
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.textOnPrimary,
                          border: `1px solid ${colors.primaryDark}`,
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontWeight: '800',
                          cursor: 'pointer',
                        }}
                      >
                        Approve Application
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ backgroundColor: '#FEF3C7', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', color: '#B45309' }}>
                        GOLD COLLATERAL LOAN (70% LTV)
                      </span>
                      <h3 style={{ margin: '8px 0 4px 0', fontSize: '18px', fontWeight: '800' }}>
                        ₹1,20,000 • LN-202610-0014
                      </h3>
                      <div style={{ fontSize: '13px', color: colors.textSecondary }}>
                        Collateral: 25.5g Net 22K Gold • Valuation: ₹1,74,675 • LTV: 68.7% (Ceiling: 75%) • Vault Packet: <b>PKT-GLD-0042</b>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Gold Loan LN-202610-0014 approved & vault custody confirmed!')}
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.textOnPrimary,
                        border: `1px solid ${colors.primaryDark}`,
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      Approve Application
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cash Handovers Verification Panel */}
          {activeTab === 'handovers' && (
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800' }}>Daily Cash Handover Verification</h2>
              <p style={{ color: colors.textSecondary, fontSize: '13px', marginBottom: '20px' }}>
                Reconcile physical cash counts submitted by field agents against system collection records.
              </p>

              <div style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>Agent: sales1 (Route 1 - Madurai Town)</h3>
                    <div style={{ fontSize: '12px', color: colors.textSecondary }}>Handover Ref: HND-202610-00042 • Submitted at 06:30 PM</div>
                  </div>
                  <span style={{ backgroundColor: colors.success, color: '#FFF', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold' }}>
                    Exact Match (₹0 Discrepancy) ✓
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', backgroundColor: colors.primarySoftest, padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: colors.textSecondary }}>System Expected Cash</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: colors.textPrimary }}>₹18,500.00</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: colors.textSecondary }}>Counted & Submitted</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: colors.textPrimary }}>₹18,500.00</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: colors.textSecondary }}>Direct UPI Collection</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: colors.primaryDeep }}>₹4,200.00</div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '16px' }}>
                  <b>Denomination Breakdown:</b> 30x ₹500 (₹15,000) + 10x ₹200 (₹2,000) + 12x ₹100 (₹1,200) + 4x ₹50 (₹200) + 4x ₹20 (₹80) + 2x ₹10 (₹20) = ₹18,500
                </div>

                <button
                  onClick={() => alert('Cash Handover HND-202610-00042 accepted and vaulted into Branch Till!')}
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.textOnPrimary,
                    border: `1px solid ${colors.primaryDark}`,
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    cursor: 'pointer',
                  }}
                >
                  Accept & Vault Cash ✓
                </button>
              </div>
            </div>
          )}

          {/* PAR & Recovery Reports Panel */}
          {activeTab === 'reports' && (
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800' }}>Portfolio at Risk (PAR) & Recovery Reports</h2>
              <p style={{ color: colors.textSecondary, fontSize: '13px', marginBottom: '20px' }}>
                Overdue aging buckets and route-wise collection performance.
              </p>

              <h4 style={{ margin: '0 0 12px 0' }}>Portfolio Aging Buckets</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <div style={{ border: `1px solid ${colors.border}`, padding: '12px', borderRadius: '8px', backgroundColor: '#F0FDF4' }}>
                  <div style={{ fontSize: '11px', color: colors.success, fontWeight: '700' }}>CURRENT (0 DAYS)</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, margin: '4px 0' }}>₹1,38,20,000</div>
                  <div style={{ fontSize: '11px', color: colors.textSecondary }}>93.1% of portfolio</div>
                </div>
                <div style={{ border: `1px solid ${colors.border}`, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: colors.warning, fontWeight: '700' }}>PAR 1-30 DAYS</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, margin: '4px 0' }}>₹6,40,000</div>
                  <div style={{ fontSize: '11px', color: colors.textSecondary }}>4.3% of portfolio</div>
                </div>
                <div style={{ border: `1px solid ${colors.border}`, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#D97706', fontWeight: '700' }}>PAR 31-60 DAYS</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, margin: '4px 0' }}>₹2,10,000</div>
                  <div style={{ fontSize: '11px', color: colors.textSecondary }}>1.4% of portfolio</div>
                </div>
                <div style={{ border: `1px solid ${colors.border}`, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: colors.danger, fontWeight: '700' }}>PAR 61-90 DAYS</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, margin: '4px 0' }}>₹1,10,000</div>
                  <div style={{ fontSize: '11px', color: colors.textSecondary }}>0.7% of portfolio</div>
                </div>
                <div style={{ border: `1px solid ${colors.border}`, padding: '12px', borderRadius: '8px', backgroundColor: '#FEF2F2' }}>
                  <div style={{ fontSize: '11px', color: colors.danger, fontWeight: '700' }}>NPA (&gt;90 DAYS)</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: colors.danger, margin: '4px 0' }}>₹70,000</div>
                  <div style={{ fontSize: '11px', color: colors.textSecondary }}>0.5% (Very low NPA)</div>
                </div>
              </div>

              <h4 style={{ margin: '0 0 12px 0' }}>Route Recovery Efficiency</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead style={{ backgroundColor: colors.primarySoftest }}>
                  <tr>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Route</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Active Borrowers</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Monthly Target</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total Collected</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Recovery Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>Route 1 - Madurai Town</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>148</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹5,00,000</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹4,85,000</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: colors.success }}>97.0%</td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>Route 2 - Anna Nagar Market</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>132</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹4,20,000</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹3,98,000</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: colors.success }}>94.8%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Workflow Designer Screen */}
          {activeTab === 'workflows' && (
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Dynamic Workflow Designer</h2>
                  <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '4px 0 0 0' }}>
                    Configure versioned states, declarative guards, Maker-Checker rules and SLA triggers.
                  </p>
                </div>
                <select
                  value={selectedWorkflow}
                  onChange={(e) => setSelectedWorkflow(e.target.value as any)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontWeight: '700' }}
                >
                  <option value="LOAN_DAILY">Daily Collection Loan</option>
                  <option value="LOAN_METAL">Gold & Silver Pawn Loan</option>
                  <option value="CUSTOMER_ONBOARDING">Customer Onboarding</option>
                </select>
              </div>

              {/* State Stepper Visualizer */}
              <div style={{ backgroundColor: colors.primarySoftest, padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: colors.primaryDeep, marginBottom: '8px' }}>
                  SIMULATE WORKFLOW TRANSITION GRAPH
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {['DRAFT', 'PENDING_VERIFICATION', 'PENDING_APPROVAL', 'APPROVED', 'DISBURSED', 'ACTIVE', 'CLOSED'].map((s, idx) => (
                    <React.Fragment key={s}>
                      <button
                        onClick={() => setSimulatedState(s)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '99px',
                          border: `1px solid ${simulatedState === s ? colors.primaryDark : colors.border}`,
                          backgroundColor: simulatedState === s ? colors.primary : '#FFF',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        {s}
                      </button>
                      {idx < 6 && <span style={{ color: colors.textSecondary }}>→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Allowed Transitions from: <code>{simulatedState}</code></h4>
                {simulatedState === 'PENDING_APPROVAL' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: colors.textPrimary }}>Action: Sanction & Approve Loan</div>
                        <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                          Guards: Maker-Checker required (cannot approve own application) • Ceilings: Manager max ₹1,00,000; Super Admin unlimited
                        </div>
                      </div>
                      <span style={{ backgroundColor: colors.successLight, color: colors.success, padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '700' }}>
                        Permitted for {currentRole}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: colors.danger }}>Action: Reject Application</div>
                        <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                          Action: Returns application to DRAFT with required rejection reason note
                        </div>
                      </div>
                      <span style={{ backgroundColor: colors.dangerLight, color: colors.danger, padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '700' }}>
                        Permitted for {currentRole}
                      </span>
                    </div>
                  </div>
                )}
                {simulatedState !== 'PENDING_APPROVAL' && (
                  <div style={{ color: colors.textSecondary, fontSize: '13px' }}>
                    Transitions from <b>{simulatedState}</b> are evaluated inside an ACID transaction with optimistic concurrency lock (<code>rev</code>).
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Builder Screen */}
          {activeTab === 'forms' && (
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '800' }}>Dynamic Form Builder</h2>
              <p style={{ color: colors.textSecondary, fontSize: '13px', marginBottom: '20px' }}>
                Add custom fields stored in indexed <code>customFields</code> subdocument without requiring mobile app updates.
              </p>

              {/* Add Field Bar */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', padding: '16px', backgroundColor: colors.primarySoftest, borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                <input
                  type="text"
                  placeholder="New Field Label (e.g. Shop Ownership Status)"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}` }}
                />
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}` }}
                >
                  <option value="text">Text Input</option>
                  <option value="number">Numeric</option>
                  <option value="currency">Currency (Paise)</option>
                  <option value="date">Date Picker</option>
                  <option value="dropdown">Dropdown Options</option>
                </select>
                <button
                  onClick={addCustomField}
                  style={{
                    backgroundColor: colors.primary,
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    color: colors.textOnPrimary,
                    cursor: 'pointer',
                  }}
                >
                  + Add Custom Field
                </button>
              </div>

              {/* Active Fields Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.divider}`, textAlign: 'left', color: colors.textSecondary }}>
                    <th style={{ padding: '8px' }}>Field Key</th>
                    <th style={{ padding: '8px' }}>Label</th>
                    <th style={{ padding: '8px' }}>Type</th>
                    <th style={{ padding: '8px' }}>Mandatory</th>
                    <th style={{ padding: '8px' }}>Classification</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: '10px 8px' }}><code>fullName</code></td>
                    <td>Borrower Full Name</td>
                    <td>Text</td>
                    <td>Yes</td>
                    <td><span style={{ fontSize: '11px', fontWeight: '700', color: colors.primaryDeep }}>System Baseline</span></td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: '10px 8px' }}><code>aadhaarNumber</code></td>
                    <td>Aadhaar (Verhoeff Checksum)</td>
                    <td>Number</td>
                    <td>Yes</td>
                    <td><span style={{ fontSize: '11px', fontWeight: '700', color: colors.primaryDeep }}>System Baseline (AES-256-GCM)</span></td>
                  </tr>
                  {customFields.map((f) => (
                    <tr key={f.name} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '10px 8px' }}><code>customFields.{f.name}</code></td>
                      <td>{f.label}</td>
                      <td>{f.type}</td>
                      <td>{f.required ? 'Yes' : 'No'}</td>
                      <td><span style={{ fontSize: '11px', fontWeight: '700', color: colors.success }}>Dynamic Field</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Masters & Daily Gold/Silver Rates */}
          {activeTab === 'masters' && (
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '800' }}>Gold & Silver Rate Master</h2>
              <p style={{ color: colors.textSecondary, fontSize: '13px', marginBottom: '20px' }}>
                Daily bullion rates drive gold collateral valuations, LTV calculations, and appraisal sheets.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', backgroundColor: colors.goldCardBg, borderRadius: '12px', border: `1px solid ${colors.goldCardBorder}` }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: colors.primaryDeep }}>TODAY'S 22K GOLD RATE (PER GRAM)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <span style={{ fontSize: '28px', fontWeight: '800' }}>₹</span>
                    <input
                      type="number"
                      value={goldRate}
                      onChange={(e) => setGoldRate(Number(e.target.value))}
                      style={{ fontSize: '24px', fontWeight: '800', width: '140px', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${colors.border}` }}
                    />
                    <button
                      onClick={() => alert(`22K Gold Rate published at ₹${goldRate}/g. Push alert dispatched to field managers.`)}
                      style={{ backgroundColor: colors.primary, border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Publish Rate
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '8px' }}>
                    24K Pure: ₹{Math.round(goldRate * (24 / 22))} • 18K: ₹{Math.round(goldRate * (18 / 22))}
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: colors.silverCardBg, borderRadius: '12px', border: `1px solid ${colors.silverCardBorder}` }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: colors.textSecondary }}>TODAY'S 999 SILVER RATE (PER GRAM)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <span style={{ fontSize: '28px', fontWeight: '800' }}>₹</span>
                    <input
                      type="number"
                      value={silverRate}
                      onChange={(e) => setSilverRate(Number(e.target.value))}
                      style={{ fontSize: '24px', fontWeight: '800', width: '140px', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${colors.border}` }}
                    />
                    <button
                      onClick={() => alert(`Silver Rate published at ₹${silverRate}/g.`)}
                      style={{ backgroundColor: colors.primary, border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Publish Rate
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '8px' }}>
                    925 Sterling: ₹{Math.round(silverRate * 0.925)}/g
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'restrictions' && (
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '800' }}>Manager Restrictions Engine (Super Admin Only)</h2>
              <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
                Restrict specific branch managers without changing role definitions. Changes take effect instantly across active mobile & web sessions.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div style={{ border: `1px solid ${colors.border}`, padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Pre-configured Presets</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button style={{ padding: '8px 12px', textAlign: 'left', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.primarySoftest, fontWeight: '600', cursor: 'pointer' }}>
                      🔒 "No P&L and Expenses" (Hide Net Margins)
                    </button>
                    <button style={{ padding: '8px 12px', textAlign: 'left', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: '#FFF', fontWeight: '600', cursor: 'pointer' }}>
                      📋 "Operations Only (No Finance)"
                    </button>
                    <button style={{ padding: '8px 12px', textAlign: 'left', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: '#FFF', fontWeight: '600', cursor: 'pointer' }}>
                      ⏱️ "Junior Manager (₹50,000 Ceiling)"
                    </button>
                  </div>
                </div>

                <div style={{ border: `1px solid ${colors.border}`, padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Enforced Security Properties</h4>
                  <ul style={{ paddingLeft: '20px', fontSize: '13px', color: colors.textSecondary, lineHeight: '20px' }}>
                    <li>Deny-Wins principle enforced centrally in PermissionsGuard</li>
                    <li>Manager cannot approve own loans (Maker-Checker enforced)</li>
                    <li>Automatic TTL index evicts expired temporary restrictions</li>
                    <li>Realtime invalidation increments user <code>permissionsVersion</code></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pnl' && (
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              {canViewPnl ? (
                <div>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '800' }}>Profit & Loss Statement (Guarded by pnl:read)</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', margin: '20px 0' }}>
                    <div style={{ padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: colors.textSecondary }}>Interest Income</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: colors.success }}>+₹3,42,000</div>
                    </div>
                    <div style={{ padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: colors.textSecondary }}>Fees & Charges</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: colors.success }}>+₹48,000</div>
                    </div>
                    <div style={{ padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: colors.textSecondary }}>Branch Expenses</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: colors.danger }}>-₹1,24,000</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: colors.primaryLight, borderRadius: '8px', border: `1px solid ${colors.primary}` }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: colors.primaryDeep }}>NET PROFIT</div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: colors.textPrimary }}>₹2,66,000</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                  <h3 style={{ margin: '0 0 8px 0', color: colors.danger }}>403 FORBIDDEN: Access to P&L Restricted</h3>
                  <p style={{ color: colors.textSecondary, maxWidth: '400px', margin: '0 auto' }}>
                    Your current account does not have authorization to inspect business net profit margins or financial statements.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '800' }}>System Audit & Security Activity</h2>
              <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '16px' }}>
                Immutable ledger of all state mutations, approvals, and unauthorized permission attempts.
              </p>
              <div style={{ fontSize: '13px', color: colors.textSecondary }}>
                <div style={{ padding: '10px', borderBottom: `1px solid ${colors.border}` }}>
                  [2026-10-17 22:30] <b>SUPER_ADMIN</b> assigned preset "NO_PNL_EXPENSES" to manager <code>manager2</code>.
                </div>
                <div style={{ padding: '10px', borderBottom: `1px solid ${colors.border}` }}>
                  [2026-10-17 22:24] <b>sales1</b> collected ₹500 (CASH) from customer M. Murugan. Receipt <code>REC-BR1-000492</code> issued.
                </div>
                <div style={{ padding: '10px', borderBottom: `1px solid ${colors.border}` }}>
                  [2026-10-17 22:15] <b>manager1</b> approved Daily Loan Application #D-104 (₹15,000). Maker-checker verified.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
