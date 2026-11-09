import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiBriefcase,
  FiUser,
  FiMail,
  FiLock,
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiInfo,
  FiShield
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const COMPANY_TYPES = [
  'Private Limited (Pvt Ltd)',
  'Limited Liability Partnership (LLP)',
  'Limited Liability Company (LLC)',
  'Partnership Firm',
  'Sole Proprietorship',
  'Public Limited Company (Ltd)',
  'One Person Company (OPC)',
  'Other Corporate Entity'
];

const Signup = () => {
  const navigate = useNavigate();
  const { signup, user, loading: authLoading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    // Company Details
    businessName: '',
    companyType: '',
    gstNumber: '',
    // Account Creator (Admin) Details
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Team Access
    teamAccessCount: 0,
    teamMembers: ['', '', '']
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/expense-book');
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleTeamMemberEmailChange = (index, value) => {
    setFormData((prev) => {
      const updatedMembers = [...prev.teamMembers];
      updatedMembers[index] = value;
      return {
        ...prev,
        teamMembers: updatedMembers
      };
    });
    setError('');
  };

  const handleAccessCountSelect = (count) => {
    setFormData((prev) => ({
      ...prev,
      teamAccessCount: count
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Company Validation
    if (!formData.businessName.trim()) {
      setError('Company / Business name is required');
      return;
    }

    if (!formData.companyType) {
      setError('Please select your company type (e.g. Pvt Ltd, LLP, LLC)');
      return;
    }

    // 2. Creator Validation
    if (!formData.name.trim()) {
      setError('Account creator full name is required');
      return;
    }

    const creatorEmail = formData.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!creatorEmail || !emailRegex.test(creatorEmail)) {
      setError('Please provide a valid Gmail/email address for the account creator');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // 3. User Access (Maximum 3 excluding creator) Validation
    const requestedCount = Number(formData.teamAccessCount);
    if (requestedCount < 0 || requestedCount > 3) {
      setError('User access count must be between 0 and 3 (excluding the creator)');
      return;
    }

    const activeTeamEmails = formData.teamMembers
      .slice(0, requestedCount)
      .map((em) => em.trim().toLowerCase());

    const seenTeamEmails = new Set();
    for (let i = 0; i < activeTeamEmails.length; i++) {
      const memberEmail = activeTeamEmails[i];
      if (!memberEmail) {
        setError(`Please enter the Gmail ID for User ${i + 1}`);
        return;
      }
      if (!emailRegex.test(memberEmail)) {
        setError(`Invalid Gmail/email format for User ${i + 1}: ${memberEmail}`);
        return;
      }
      if (memberEmail === creatorEmail) {
        setError(`User ${i + 1} Gmail cannot be the same as the account creator email`);
        return;
      }
      if (seenTeamEmails.has(memberEmail)) {
        setError(`Duplicate team member Gmail entered: ${memberEmail}`);
        return;
      }
      seenTeamEmails.add(memberEmail);
    }

    setLoading(true);

    try {
      await signup({
        businessName: formData.businessName.trim(),
        companyType: formData.companyType,
        gstNumber: formData.gstNumber.trim().toUpperCase(),
        name: formData.name.trim(),
        email: creatorEmail,
        password: formData.password,
        teamAccessCount: requestedCount,
        teamMembers: activeTeamEmails
      });
      navigate('/expense-book');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Company onboarding failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content auth-content-wide">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <Link to="/" className="auth-logo inline-block cursor-pointer hover:opacity-85 transition-opacity" title="Back to Home">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 7L12 12L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <h1 className="auth-title">Company Onboarding</h1>
            <p className="auth-subtitle">Register your corporate account and configure team access</p>
          </div>

          {/* Corporate Only Notice */}
          <div className="company-onboard-notice mb-4">
            <FiShield className="text-base shrink-0 text-emerald-600" />
            <span>
              <strong>Corporate Access Only:</strong> FinTrack onboarding is reserved exclusively for companies and businesses, not for individual personal accounts.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* SECTION 1: Company Profile */}
            <div className="auth-form-section">
              <div className="auth-form-section-header">
                <span className="auth-form-section-title">
                  <FiBriefcase className="text-blue-600 text-sm" />
                  1. Company Profile
                </span>
                <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                  Required
                </span>
              </div>

              {/* Business Name */}
              <div className="auth-input-group">
                <label htmlFor="businessName" className="auth-label">
                  Business / Company Name <span className="text-red-500">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <FiBriefcase className="auth-input-icon" />
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="auth-input"
                    placeholder="e.g. Acme Technologies Pvt Ltd"
                    required
                  />
                </div>
              </div>

              {/* Company Type & GST */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="auth-input-group">
                  <label htmlFor="companyType" className="auth-label">
                    Company Type <span className="text-red-500">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <FiFileText className="auth-input-icon" />
                    <select
                      id="companyType"
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleChange}
                      className="auth-select"
                      required
                    >
                      <option value="">Select Company Type...</option>
                      {COMPANY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="gstNumber" className="auth-label flex items-center justify-between">
                    <span>GST Number (GSTIN)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <FiCheckCircle className="auth-input-icon" />
                    <input
                      type="text"
                      id="gstNumber"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="auth-input uppercase"
                      placeholder="e.g. 27AAPFU0939F1ZV"
                      maxLength={15}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Account Creator (Admin) */}
            <div className="auth-form-section">
              <div className="auth-form-section-header">
                <span className="auth-form-section-title">
                  <FiUser className="text-blue-600 text-sm" />
                  2. Account Creator (Primary Admin)
                </span>
                <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                  Admin Credentials
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="auth-input-group">
                  <label htmlFor="name" className="auth-label">
                    Creator Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <FiUser className="auth-input-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="auth-input"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="email" className="auth-label">
                    Creator Gmail / Email <span className="text-red-500">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <FiMail className="auth-input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="auth-input"
                      placeholder="creator@gmail.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="auth-input-group">
                  <label htmlFor="password" className="auth-label">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <FiLock className="auth-input-icon" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="auth-input"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="confirmPassword" className="auth-label">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <FiLock className="auth-input-icon" />
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="auth-input"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: User Access Given (Maximum 3 excluding creator) */}
            <div className="auth-form-section">
              <div className="auth-form-section-header">
                <span className="auth-form-section-title">
                  <FiUsers className="text-blue-600 text-sm" />
                  3. Team Member Access (Max 3 Users)
                </span>
                <span className="text-[10px] font-mono font-medium text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                  Excluding Creator
                </span>
              </div>

              <div className="auth-input-group">
                <label className="auth-label flex items-center justify-between">
                  <span>How many user access to be given?</span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Maximum 3 seats
                  </span>
                </label>

                {/* Seat Selector (0, 1, 2, 3) */}
                <div className="team-access-pill-group">
                  {[0, 1, 2, 3].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleAccessCountSelect(count)}
                      className={`team-access-pill ${formData.teamAccessCount === count ? 'active' : ''}`}
                    >
                      <span className="text-sm font-bold">{count}</span>
                      <span className="text-[10px] text-slate-400">
                        {count === 0 ? 'Only Creator' : count === 1 ? '1 User' : `${count} Users`}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="auth-hint-text">
                  Allocate user seats for team members (maximum 3, excluding the account creator).
                </p>
              </div>

              {/* Dynamic Gmail ID inputs for each authorized person */}
              {formData.teamAccessCount > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-200/80">
                  <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <FiInfo className="text-blue-600" />
                    Enter Gmail ID for each authorized person:
                  </div>

                  {Array.from({ length: formData.teamAccessCount }).map((_, idx) => (
                    <div key={idx} className="auth-input-group">
                      <label htmlFor={`teamMember-${idx}`} className="auth-label text-xs">
                        User {idx + 1} Gmail ID <span className="text-red-500">*</span>
                      </label>
                      <div className="auth-input-wrapper">
                        <FiMail className="auth-input-icon text-slate-400" />
                        <input
                          type="email"
                          id={`teamMember-${idx}`}
                          value={formData.teamMembers[idx] || ''}
                          onChange={(e) => handleTeamMemberEmailChange(idx, e.target.value)}
                          className="auth-input"
                          placeholder={`team.member${idx + 1}@gmail.com`}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-button mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="auth-spinner" viewBox="0 0 24 24">
                    <circle className="auth-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                  Onboarding Company...
                </>
              ) : (
                'Complete Company Onboarding'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have a company account?{' '}
              <Link to="/login" className="auth-footer-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
