/**
 * Hospital Dashboard – Main Page
 * 
 * Allows hospital staff to:
 * 1. Create emergency blood requests
 * 2. View all active requests with real-time status
 * 3. See matched donors for each request
 * 4. Mark requests as completed
 * 
 * Features stat cards, request form, and request list with live updates.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BLOOD_GROUPS, URGENCY_LEVELS, HOSPITAL_LOCATION } from '../data/sampleData';
import { getUrgencyDetails, getStatusDetails } from '../utils/matching';
import './HospitalDashboard.css';

export default function HospitalDashboard() {
  const {
    requests,
    stats,
    createRequest,
    completeRequest,
    getMatchedDonors,
    autoDispatch,
  } = useApp();

  // ======= Form State =======
  const [formData, setFormData] = useState({
    hospitalName: 'BloodLink Central Hospital',
    bloodGroup: 'O+',
    units: 2,
    urgency: 'Critical',
  });

  // Track which request is expanded to show matched donors
  const [expandedRequest, setExpandedRequest] = useState(null);

  // ======= Handle Form Submit =======
  const handleSubmit = (e) => {
    e.preventDefault();

    createRequest({
      ...formData,
      units: parseInt(formData.units, 10),
      location: HOSPITAL_LOCATION,
    });

    // Reset units but keep other defaults for quick re-entry
    setFormData(prev => ({ ...prev, units: 2 }));
  };

  // ======= Handle Input Change =======
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ======= Get matched donors for expanded request =======
  const matchedDonors = useMemo(() => {
    if (!expandedRequest) return [];
    const request = requests.find(r => r.id === expandedRequest);
    if (!request) return [];
    return getMatchedDonors(request);
  }, [expandedRequest, requests, getMatchedDonors]);

  return (
    <div className="hospital-dashboard" id="hospital-dashboard">
      {/* Page Header */}
      <header className="page-header animate-fadeInUp">
        <div className="page-header-content">
          <h1>🏥 Hospital Dashboard</h1>
          <p className="page-description">
            Manage emergency blood requests and track donor assignments in real-time
          </p>
        </div>
      </header>

      {/* Stats Row */}
      <div className="stats-row animate-fadeInUp delay-1">
        <div className="stat-card stat-total">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalRequests}</span>
            <span className="stat-label">Total Requests</span>
          </div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-number">{stats.pendingRequests}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card stat-assigned">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-number">{stats.assignedRequests}</span>
            <span className="stat-label">Assigned</span>
          </div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-icon">🎉</div>
          <div className="stat-info">
            <span className="stat-number">{stats.completedRequests}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left: Request Form */}
        <div className="form-section animate-fadeInUp delay-2">
          <div className="card card-glass">
            <div className="card-header">
              <h2>🚨 Create Emergency Request</h2>
              <p className="card-description">
                Submit a new blood request to alert nearby donors
              </p>
            </div>

            <form onSubmit={handleSubmit} className="request-form" id="request-form">
              <div className="form-group">
                <label htmlFor="hospitalName">Hospital Name</label>
                <input
                  type="text"
                  id="hospitalName"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bloodGroup">Blood Group</label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    required
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="units">Units Required</label>
                  <input
                    type="number"
                    id="units"
                    name="units"
                    min="1"
                    max="20"
                    value={formData.units}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="urgency">Emergency Level</label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                >
                  {URGENCY_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Urgency Preview */}
              <div className={`urgency-preview urgency-${formData.urgency.toLowerCase()}`}>
                <span>{getUrgencyDetails(formData.urgency).icon}</span>
                <span>{formData.urgency} Priority</span>
              </div>

              <button type="submit" className="btn btn-primary btn-lg submit-btn" id="submit-request">
                <span>🩸</span>
                Send Emergency Request
              </button>
            </form>
          </div>
        </div>

        {/* Right: Active Requests */}
        <div className="requests-section animate-fadeInUp delay-3">
          <div className="section-header">
            <h2>📋 Active Requests</h2>
            <span className="request-count">{requests.length} total</span>
          </div>

          {requests.length === 0 ? (
            <div className="empty-state card card-glass">
              <div className="empty-icon">🩹</div>
              <h3>No Active Requests</h3>
              <p>Create your first emergency blood request using the form</p>
            </div>
          ) : (
            <div className="requests-list">
              {requests.map((request, index) => {
                const urgency = getUrgencyDetails(request.urgency);
                const status = getStatusDetails(request.status);
                const isExpanded = expandedRequest === request.id;
                const donors = isExpanded ? matchedDonors : [];

                return (
                  <div
                    key={request.id}
                    className={`request-card card animate-fadeInUp delay-${Math.min(index + 1, 6)} ${
                      request.urgency === 'Critical' ? 'critical-glow' : ''
                    } ${isExpanded ? 'expanded' : ''}`}
                    id={`request-${request.id}`}
                  >
                    {/* Request Header */}
                    <div className="request-header">
                      <div className="request-blood-group">
                        <span className="blood-type">{request.bloodGroup}</span>
                        <span className="blood-units">{request.units} units</span>
                      </div>
                      <div className="request-badges">
                        <span className={`badge ${urgency.className}`}>
                          {urgency.icon} {urgency.label}
                        </span>
                        <span className={`badge ${status.className}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="request-details">
                      <p className="request-hospital">
                        <span>🏥</span> {request.hospitalName}
                      </p>
                      <p className="request-time">
                        <span>🕐</span> {new Date(request.createdAt).toLocaleTimeString()}
                      </p>
                      {request.assignedDonorName && (
                        <p className="request-donor-assigned">
                          <span>👤</span> Donor: <strong>{request.assignedDonorName}</strong>
                        </p>
                      )}
                    </div>

                    {/* Status Progress Bar */}
                    <div className="status-progress">
                      <div className={`progress-step ${['Pending', 'Donor Assigned', 'Completed'].includes(request.status) ? 'active' : ''}`}>
                        <div className="step-dot"></div>
                        <span>Pending</span>
                      </div>
                      <div className="progress-line">
                        <div className={`progress-fill ${['Donor Assigned', 'Completed'].includes(request.status) ? 'filled' : ''}`}></div>
                      </div>
                      <div className={`progress-step ${['Donor Assigned', 'Completed'].includes(request.status) ? 'active' : ''}`}>
                        <div className="step-dot"></div>
                        <span>Assigned</span>
                      </div>
                      <div className="progress-line">
                        <div className={`progress-fill ${request.status === 'Completed' ? 'filled' : ''}`}></div>
                      </div>
                      <div className={`progress-step ${request.status === 'Completed' ? 'active' : ''}`}>
                        <div className="step-dot"></div>
                        <span>Complete</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="request-actions">
                      {request.status === 'Pending' && (
                        <>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setExpandedRequest(isExpanded ? null : request.id)}
                            id={`view-donors-${request.id}`}
                          >
                            {isExpanded ? '▲ Hide Donors' : '▼ View Matches'}
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => autoDispatch(request.id)}
                            id={`auto-dispatch-${request.id}`}
                            title="Automatically assign the nearest matching donor"
                          >
                            <span>🤖</span> Auto-Dispatch
                          </button>
                        </>
                      )}
                      {request.status === 'Donor Assigned' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => completeRequest(request.id)}
                          id={`complete-${request.id}`}
                        >
                          ✓ Mark Completed
                        </button>
                      )}
                    </div>

                    {/* Expanded: Matched Donors */}
                    {isExpanded && (
                      <div className="matched-donors animate-fadeIn">
                        <h4>🔍 Matching Donors ({donors.length})</h4>
                        {donors.length === 0 ? (
                          <p className="no-donors">No matching donors found within 20km radius</p>
                        ) : (
                          <div className="donors-mini-list">
                            {donors.map(donor => (
                              <div key={donor.id} className="donor-mini-card">
                                <div className="donor-mini-info">
                                  <span className="donor-mini-name">{donor.name}</span>
                                  <span className="donor-mini-blood">{donor.bloodGroup}</span>
                                </div>
                                <span className="donor-mini-distance">
                                  📍 {donor.distance} km
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
