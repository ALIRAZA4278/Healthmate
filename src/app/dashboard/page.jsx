'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, reportsAPI, vitalsAPI, familyMembersAPI } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [newMember, setNewMember] = useState({ name: '', relation: '', color: '#ec4899', customId: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState({ from: '', to: '' });
  const [filterFamilyMember, setFilterFamilyMember] = useState('');

  const colors = ['#ec4899', '#10b981', '#3b82f6', '#a855f7', '#8b5cf6', '#f97316'];
  const relations = ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Cousin', 'Other'];

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = auth.getUser();
    setUser(userData);

    loadData();
    loadFamilyMembers();
  }, []);

  const loadData = async () => {
    try {
      const [reportsData, vitalsData] = await Promise.all([
        reportsAPI.getAll(),
        vitalsAPI.getAll(),
      ]);
      setReports(reportsData.reports || []);
      setVitals(vitalsData.vitals || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFamilyMembers = async () => {
    try {
      const data = await familyMembersAPI.getAll();
      setFamilyMembers(data.data || []);
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  const handleDeleteReport = async (reportId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      await reportsAPI.delete(reportId);
      setReports(reports.filter(r => r._id !== reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  const handleDeleteVital = async (vitalId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this vital record?')) return;

    try {
      await vitalsAPI.delete(vitalId);
      setVitals(vitals.filter(v => v._id !== vitalId));
    } catch (error) {
      console.error('Error deleting vital:', error);
      alert('Failed to delete vital');
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.relation) {
      alert('Please fill in name and relation');
      return;
    }

    try {
      await familyMembersAPI.create({
        name: newMember.name,
        relation: newMember.relation,
        color: newMember.color,
        customId: newMember.customId
      });

      setNewMember({ name: '', relation: '', color: '#ec4899', customId: '' });
      setShowAddMember(false);
      loadFamilyMembers();
    } catch (error) {
      console.error('Error adding family member:', error);
      alert('Failed to add family member');
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowEditMember(true);
  };

  const handleUpdateMember = async () => {
    if (!editingMember || !editingMember.name || !editingMember.relation) {
      alert('Please fill in name and relation');
      return;
    }

    try {
      await familyMembersAPI.update(editingMember._id, {
        name: editingMember.name,
        relation: editingMember.relation,
        color: editingMember.color,
        customId: editingMember.customId
      });

      setShowEditMember(false);
      setEditingMember(null);
      loadFamilyMembers();
    } catch (error) {
      console.error('Error updating family member:', error);
      alert('Failed to update family member');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm('Are you sure you want to delete this family member?')) return;

    try {
      await familyMembersAPI.delete(memberId);
      loadFamilyMembers();
    } catch (error) {
      console.error('Error deleting family member:', error);
      alert('Failed to delete family member');
    }
  };

  const handleOpenMember = (memberId) => {
    router.push(`/dashboard/family/${memberId}`);
  };

  const handleLogout = () => {
    auth.removeToken();
    router.push('/');
  };

  // Filter reports based on search, date, and family member
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const reportDate = new Date(report.testDate);
    const matchesDateFrom = !filterDate.from || reportDate >= new Date(filterDate.from);
    const matchesDateTo = !filterDate.to || reportDate <= new Date(filterDate.to);

    // Family member filter logic
    let matchesFamilyMember = true;
    if (filterFamilyMember) {
      if (filterFamilyMember === 'self') {
        // Show reports without family member (self)
        matchesFamilyMember = !report.familyMemberId;
      } else {
        // Show reports for specific family member
        matchesFamilyMember = report.familyMemberId?._id === filterFamilyMember;
      }
    }

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesFamilyMember;
  });

  // Calculate vitals trends for graph
  const getVitalsTrend = () => {
    const sortedVitals = [...vitals].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ).slice(-7); // Last 7 entries

    return sortedVitals;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">H</span>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  HealthMate
                </span>
                <p className="text-xs text-gray-500">Sehat ka Smart Dost</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hello, <strong>{user?.name}</strong></span>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Family Members Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Family Members</h2>
            <button
              onClick={() => setShowAddMember(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <span>+</span> Add Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {familyMembers.map((member) => (
              <div
                key={member._id}
                onClick={() => handleOpenMember(member._id)}
                className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition border border-gray-200 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.relation}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditMember(member); }}
                    className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteMember(member._id); }}
                    className="text-red-600 text-sm font-medium hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Add Member Card */}
            <div
              onClick={() => setShowAddMember(true)}
              className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-2xl font-bold mb-3">
                +
              </div>
              <p className="text-gray-700 font-medium">Add Member</p>
            </div>
          </div>
        </div>

        {/* Vitals Trend Graph */}
        {vitals.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Vitals Trend</h2>
              <Link href="/dashboard/vitals" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
                View All →
              </Link>
            </div>

            {/* Simple trend visualization */}
            <div className="relative h-48 border-b border-l border-gray-200">
              <div className="absolute inset-0 flex items-end justify-around pb-4 pl-8">
                {getVitalsTrend().map((vital, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                    {vital.bloodPressure && (
                      <div className="w-full flex flex-col items-center gap-1">
                        <div
                          className="w-3 bg-orange-400 rounded-t"
                          style={{ height: `${(vital.bloodPressure.systolic / 140) * 100}px` }}
                        />
                        <div
                          className="w-3 bg-teal-400 rounded-t"
                          style={{ height: `${(vital.bloodPressure.diastolic / 140) * 100}px` }}
                        />
                      </div>
                    )}
                    {vital.bloodSugar && (
                      <div
                        className="w-3 bg-yellow-400 rounded-t"
                        style={{ height: `${(vital.bloodSugar / 200) * 100}px` }}
                      />
                    )}
                    <span className="text-xs text-gray-500 mt-2">
                      {new Date(vital.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span className="text-gray-600">Diastolic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span className="text-gray-600">Sugar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-400 rounded"></div>
                <span className="text-gray-600">Systolic</span>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="grid md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />

            <select
              value={filterFamilyMember}
              onChange={(e) => setFilterFamilyMember(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">All Members</option>
              <option value="self">Self</option>
              {familyMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              placeholder="From"
              value={filterDate.from}
              onChange={(e) => setFilterDate({ ...filterDate, from: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />

            <input
              type="date"
              placeholder="To"
              value={filterDate.to}
              onChange={(e) => setFilterDate({ ...filterDate, to: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />

            <button
              onClick={() => { setSearchTerm(''); setFilterDate({ from: '', to: '' }); setFilterFamilyMember(''); }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Medical Reports</h2>
            <Link
              href="/dashboard/upload"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <span>+</span> Upload Report
            </Link>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 mb-4">No reports found</p>
              <Link
                href="/dashboard/upload"
                className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Upload Report
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                    <th className="pb-3 font-semibold">Title</th>
                    <th className="pb-3 font-semibold">Member</th>
                    <th className="pb-3 font-semibold">Test</th>
                    <th className="pb-3 font-semibold">Lab/Hospital</th>
                    <th className="pb-3 font-semibold">Doctor</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Price</th>
                    <th className="pb-3 font-semibold">Flag</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 text-sm">{report.fileName}</td>
                      <td className="py-4 text-sm">
                        {report.familyMemberId ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: report.familyMemberId.color }}
                            >
                              {report.familyMemberId.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{report.familyMemberId.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Self</span>
                        )}
                      </td>
                      <td className="py-4 text-sm">{report.fileType}</td>
                      <td className="py-4 text-sm text-gray-600">{report.labHospital || '-'}</td>
                      <td className="py-4 text-sm text-gray-600">{report.doctor || '-'}</td>
                      <td className="py-4 text-sm">{new Date(report.testDate).toLocaleDateString()}</td>
                      <td className="py-4 text-sm text-gray-600">{report.price || '-'}</td>
                      <td className="py-4">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          normal
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/reports/${report._id}`}
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={(e) => handleDeleteReport(report._id, e)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Family Member</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="e.g., Ammi"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                <select
                  value={newMember.relation}
                  onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Relation</option>
                  {relations.map((rel) => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewMember({ ...newMember, color })}
                      className={`w-10 h-10 rounded-lg transition ${
                        newMember.color === color ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom ID (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., mother"
                  value={newMember.customId}
                  onChange={(e) => setNewMember({ ...newMember, customId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddMember}
                className="flex-1 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => setShowAddMember(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditMember && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Family Member</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="e.g., Ammi"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                <select
                  value={editingMember.relation}
                  onChange={(e) => setEditingMember({ ...editingMember, relation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Relation</option>
                  {relations.map((rel) => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditingMember({ ...editingMember, color })}
                      className={`w-10 h-10 rounded-lg transition ${
                        editingMember.color === color ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom ID (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., mother"
                  value={editingMember.customId || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, customId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateMember}
                className="flex-1 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Update
              </button>
              <button
                onClick={() => { setShowEditMember(false); setEditingMember(null); }}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
