import { useState, useContext, useEffect } from 'react';
import { 
  FiSettings, 
  FiBriefcase, 
  FiUsers, 
  FiTag, 
  FiCreditCard, 
  FiTrash2, 
  FiEdit2, 
  FiPlus, 
  FiCheck, 
  FiX, 
  FiAlertTriangle, 
  FiSave, 
  FiSearch, 
  FiShield,
  FiMail,
  FiPhone,
  FiCheckCircle
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

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

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'CAD', 'AUD'];

const BusinessSettings = () => {
  const navigate = useNavigate();
  const { user, activeBusiness, updateBusiness, deleteBusiness, deleteAccount } = useContext(AuthContext);
  const { 
    categories, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    paymentModes, 
    createPaymentMode, 
    updatePaymentMode, 
    deletePaymentMode,
    parties,
    createParty,
    updateParty,
    deleteParty,
    refreshData
  } = useContext(DataContext);

  const [activeTab, setActiveTab] = useState('profile');

  // Business Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    companyType: '',
    gstNumber: '',
    currency: 'INR',
    description: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync profile form when active business changes
  useEffect(() => {
    if (activeBusiness) {
      setProfileForm({
        name: activeBusiness.name || '',
        companyType: activeBusiness.companyType || '',
        gstNumber: activeBusiness.gstNumber || '',
        currency: activeBusiness.currency || 'INR',
        description: activeBusiness.description || ''
      });
    }
  }, [activeBusiness]);

  // Categories Local State
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Payment Modes Local State
  const [newModeName, setNewModeName] = useState('');
  const [editingModeId, setEditingModeId] = useState(null);
  const [editingModeName, setEditingModeName] = useState('');

  // Parties Local State
  const [partySearch, setPartySearch] = useState('');
  const [newPartyForm, setNewPartyForm] = useState({ partyName: '', phone: '', partyType: 'Supplier' });
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [editingPartyId, setEditingPartyId] = useState(null);
  const [editingPartyForm, setEditingPartyForm] = useState({ partyName: '', phone: '', partyType: 'Supplier' });

  // Team Access Local State
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);

  // Danger Zone Confirmation Modals
  const [showDeleteBizModal, setShowDeleteBizModal] = useState(false);
  const [deleteBizConfirmText, setDeleteBizConfirmText] = useState('');
  const [isDeletingBiz, setIsDeletingBiz] = useState(false);

  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountConfirmText, setDeleteAccountConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Profile Save
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;
    try {
      setIsSavingProfile(true);
      await updateBusiness(activeBusiness._id, profileForm);
    } catch (_) {
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Category Actions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await createCategory({ category: newCatName.trim() });
      setNewCatName('');
    } catch (_) {}
  };

  const handleSaveEditCategory = async (id) => {
    if (!editingCatName.trim()) return;
    try {
      await updateCategory(id, { category: editingCatName.trim() });
      setEditingCatId(null);
    } catch (_) {}
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      await deleteCategory(id);
    }
  };

  // Payment Mode Actions
  const handleAddMode = async (e) => {
    e.preventDefault();
    if (!newModeName.trim()) return;
    try {
      await createPaymentMode({ paymentMode: newModeName.trim() });
      setNewModeName('');
    } catch (_) {}
  };

  const handleSaveEditMode = async (id) => {
    if (!editingModeName.trim()) return;
    try {
      await updatePaymentMode(id, { paymentMode: editingModeName.trim() });
      setEditingModeId(null);
    } catch (_) {}
  };

  const handleDeleteMode = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete payment mode "${name}"?`)) {
      await deletePaymentMode(id);
    }
  };

  // Party Actions
  const handleAddParty = async (e) => {
    e.preventDefault();
    if (!newPartyForm.partyName.trim()) return;
    try {
      await createParty(newPartyForm);
      setNewPartyForm({ partyName: '', phone: '', partyType: 'Supplier' });
      setShowAddPartyModal(false);
    } catch (_) {}
  };

  const handleSaveEditParty = async (id) => {
    if (!editingPartyForm.partyName.trim()) return;
    try {
      await updateParty(id, editingPartyForm);
      setEditingPartyId(null);
    } catch (_) {}
  };

  const handleDeleteParty = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete party "${name}"?`)) {
      await deleteParty(id);
    }
  };

  // Team Access Actions (Max 3 excluding creator)
  const currentTeam = activeBusiness?.teamMembers || [];
  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    const emailToAdd = newMemberEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToAdd)) {
      alert('Please enter a valid Gmail / email address');
      return;
    }
    if (emailToAdd === user?.email?.toLowerCase()) {
      alert('You cannot add the account creator as an additional team member');
      return;
    }
    if (currentTeam.some(m => (m.email || m).toLowerCase() === emailToAdd)) {
      alert('This team member is already added');
      return;
    }
    if (currentTeam.length >= 3) {
      alert('Maximum 3 additional users allowed excluding the account creator');
      return;
    }

    try {
      setIsUpdatingTeam(true);
      const updatedMembers = [...currentTeam.map(m => m.email || m), emailToAdd];
      await updateBusiness(activeBusiness._id, {
        teamMembers: updatedMembers,
        teamAccessCount: updatedMembers.length
      });
      setNewMemberEmail('');
    } catch (_) {
    } finally {
      setIsUpdatingTeam(false);
    }
  };

  const handleRemoveTeamMember = async (emailToRemove) => {
    if (!window.confirm(`Remove team member access for ${emailToRemove}?`)) return;
    try {
      setIsUpdatingTeam(true);
      const updatedMembers = currentTeam
        .map(m => m.email || m)
        .filter(em => em.toLowerCase() !== emailToRemove.toLowerCase());
      await updateBusiness(activeBusiness._id, {
        teamMembers: updatedMembers,
        teamAccessCount: updatedMembers.length
      });
    } catch (_) {
    } finally {
      setIsUpdatingTeam(false);
    }
  };

  // Delete Business
  const handleConfirmDeleteBusiness = async () => {
    if (deleteBizConfirmText !== activeBusiness.name) {
      alert('Please type the exact business name to confirm deletion');
      return;
    }
    try {
      setIsDeletingBiz(true);
      await deleteBusiness(activeBusiness._id);
      setShowDeleteBizModal(false);
      setDeleteBizConfirmText('');
      refreshData();
      navigate('/expense-book');
    } catch (_) {
    } finally {
      setIsDeletingBiz(false);
    }
  };

  // Delete Account
  const handleConfirmDeleteAccount = async () => {
    if (deleteAccountConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion');
      return;
    }
    try {
      setIsDeletingAccount(true);
      await deleteAccount();
      navigate('/signup');
    } catch (_) {
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Filtered parties
  const filteredParties = (parties || []).filter(p => {
    const q = partySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.partyName || '').toLowerCase().includes(q) ||
      (p.phone || '').toLowerCase().includes(q) ||
      (p.partyType || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
              <FiSettings className="text-blue-600" />
              Business Settings
            </h1>
            {activeBusiness?.businessId && (
              <span className="text-[11px] font-mono font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {activeBusiness.businessId}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your company entity, categories, payment modes, counterparties, team access, and ledger options.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <FiBriefcase className="text-blue-600" />
          <span>{activeBusiness?.name || 'Active Ledger'}</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FiBriefcase className="text-sm" />
          <span>Company Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FiTag className="text-sm" />
          <span>Categories ({categories?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('paymentModes')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'paymentModes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FiCreditCard className="text-sm" />
          <span>Payment Modes ({paymentModes?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('parties')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'parties'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FiUsers className="text-sm" />
          <span>Parties ({parties?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'team'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FiShield className="text-sm" />
          <span>Team Access ({currentTeam.length}/3)</span>
        </button>

        <button
          onClick={() => setActiveTab('danger')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ml-auto ${
            activeTab === 'danger'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-600 hover:bg-rose-50'
          }`}
        >
          <FiAlertTriangle className="text-sm" />
          <span>Danger Zone</span>
        </button>
      </div>

      {/* TAB 1: Company Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-1 flex items-center gap-2">
            <FiBriefcase className="text-blue-600" />
            Company & Entity Details
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Update your registered company information, tax identifiers, and ledger preferences.
          </p>

          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                placeholder="e.g. Acme Technologies Pvt Ltd"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Type
                </label>
                <select
                  value={profileForm.companyType}
                  onChange={(e) => setProfileForm({ ...profileForm, companyType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="">Select Company Type...</option>
                  {COMPANY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GST Number (GSTIN)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={profileForm.gstNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, gstNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden uppercase font-mono"
                  placeholder="e.g. 27AAPFU0939F1ZV"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Currency
                </label>
                <select
                  value={profileForm.currency}
                  onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white font-mono"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Code (System Identifier)
                </label>
                <input
                  type="text"
                  disabled
                  value={activeBusiness?.businessId || 'BIZ-MAIN'}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Notes
              </label>
              <textarea
                rows={3}
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                placeholder="Optional description of this business ledger..."
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <FiSave className="text-sm" />
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FiTag className="text-blue-600" />
                Transaction Categories ({categories?.length || 0})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Categories help tag, filter, and summarize your expenses, sales, and transfers.
              </p>
            </div>

            {/* Quick Add Input */}
            <form onSubmit={handleAddCategory} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="New category name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
              >
                <FiPlus className="text-xs" />
                <span>Add</span>
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {(categories || []).map((cat) => {
              const catId = cat._id || cat.id || cat;
              const catName = typeof cat === 'string' ? cat : cat.category || cat.name;
              const isEditing = editingCatId === catId;

              return (
                <div
                  key={catId}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all shadow-2xs"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full">
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-blue-500 rounded focus:outline-hidden"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEditCategory(catId)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Save"
                      >
                        <FiCheck className="text-xs" />
                      </button>
                      <button
                        onClick={() => setEditingCatId(null)}
                        className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                        title="Cancel"
                      >
                        <FiX className="text-xs" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-slate-800 truncate mr-2">
                        {catName}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingCatId(catId);
                            setEditingCatName(catName);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Rename Category"
                        >
                          <FiEdit2 className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(catId, catName)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Category"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Payment Modes */}
      {activeTab === 'paymentModes' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FiCreditCard className="text-blue-600" />
                Payment Modes ({paymentModes?.length || 0})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage supported payment methods (Cash, UPI, Card, Bank Transfer, Online, etc.).
              </p>
            </div>

            <form onSubmit={handleAddMode} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="New payment mode..."
                value={newModeName}
                onChange={(e) => setNewModeName(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
              >
                <FiPlus className="text-xs" />
                <span>Add</span>
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {(paymentModes || []).map((mode) => {
              const modeId = mode._id || mode.id || mode;
              const modeName = typeof mode === 'string' ? mode : mode.paymentMode || mode.name;
              const isEditing = editingModeId === modeId;

              return (
                <div
                  key={modeId}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all shadow-2xs"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full">
                      <input
                        type="text"
                        value={editingModeName}
                        onChange={(e) => setEditingModeName(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-blue-500 rounded focus:outline-hidden"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEditMode(modeId)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Save"
                      >
                        <FiCheck className="text-xs" />
                      </button>
                      <button
                        onClick={() => setEditingModeId(null)}
                        className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                        title="Cancel"
                      >
                        <FiX className="text-xs" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 truncate mr-2">
                        <FiCreditCard className="text-xs text-blue-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {modeName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingModeId(modeId);
                            setEditingModeName(modeName);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Rename Mode"
                        >
                          <FiEdit2 className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDeleteMode(modeId, modeName)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Mode"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Parties */}
      {activeTab === 'parties' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FiUsers className="text-blue-600" />
                Parties / Counterparties ({parties?.length || 0})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your suppliers, customers, and client contacts.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <FiSearch className="absolute left-2.5 top-2.5 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search parties..."
                  value={partySearch}
                  onChange={(e) => setPartySearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => setShowAddPartyModal(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
              >
                <FiPlus className="text-xs" />
                <span>Add Party</span>
              </button>
            </div>
          </div>

          {/* Parties Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Party Name</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Phone</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParties.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                      No parties found. Click &quot;Add Party&quot; above to create one.
                    </td>
                  </tr>
                ) : (
                  filteredParties.map((p) => {
                    const isEditing = editingPartyId === p._id;
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingPartyForm.partyName}
                              onChange={(e) => setEditingPartyForm({ ...editingPartyForm, partyName: e.target.value })}
                              className="px-2 py-1 text-xs border border-blue-500 rounded w-full"
                            />
                          ) : (
                            p.partyName
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {isEditing ? (
                            <select
                              value={editingPartyForm.partyType}
                              onChange={(e) => setEditingPartyForm({ ...editingPartyForm, partyType: e.target.value })}
                              className="px-2 py-1 text-xs border border-blue-500 rounded bg-white"
                            >
                              <option value="Supplier">Supplier</option>
                              <option value="Customer">Customer</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              p.partyType === 'Customer'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {p.partyType || 'Supplier'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 font-mono">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingPartyForm.phone}
                              onChange={(e) => setEditingPartyForm({ ...editingPartyForm, phone: e.target.value })}
                              className="px-2 py-1 text-xs border border-blue-500 rounded w-full"
                            />
                          ) : (
                            p.phone || '—'
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleSaveEditParty(p._id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Save"
                              >
                                <FiCheck className="text-xs" />
                              </button>
                              <button
                                onClick={() => setEditingPartyId(null)}
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                title="Cancel"
                              >
                                <FiX className="text-xs" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingPartyId(p._id);
                                  setEditingPartyForm({
                                    partyName: p.partyName,
                                    phone: p.phone || '',
                                    partyType: p.partyType || 'Supplier'
                                  });
                                }}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit Party"
                              >
                                <FiEdit2 className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleDeleteParty(p._id, p.partyName)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Delete Party"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Team Access */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FiShield className="text-blue-600" />
                Team Access Allocation (Max 3 Users)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Grant dashboard and ledger access to team members using their Gmail address (excluding creator).
              </p>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {currentTeam.length} / 3 Seats Used
            </span>
          </div>

          {/* Add Team Member Input */}
          {currentTeam.length < 3 ? (
            <form onSubmit={handleAddTeamMember} className="flex items-center gap-2 max-w-md mb-6">
              <div className="relative flex-1">
                <FiMail className="absolute left-3 top-3 text-slate-400 text-xs" />
                <input
                  type="email"
                  required
                  placeholder="colleague@gmail.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingTeam}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer shrink-0 disabled:opacity-60"
              >
                <FiPlus className="text-xs" />
                <span>Add Member</span>
              </button>
            </form>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-medium mb-6">
              Maximum 3 additional team access seats have been allocated. Remove an existing member to add someone else.
            </div>
          )}

          {/* Team Members List */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {/* Account Creator Row */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  👑
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    {user?.name || 'Account Creator'}
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                      Primary Admin (Creator)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Additional Members */}
            {currentTeam.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No additional team members added yet. Add up to 3 Gmail accounts above.
              </div>
            ) : (
              currentTeam.map((member, idx) => {
                const memberEmail = typeof member === 'string' ? member : member.email;
                return (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                          Team Member {idx + 1}
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium px-2 py-0.2 rounded-full">
                            Authorized Access
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{memberEmail}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveTeamMember(memberEmail)}
                      disabled={isUpdatingTeam}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Revoke Team Member Access"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Danger Zone */}
      {activeTab === 'danger' && (
        <div className="space-y-6">
          {/* Delete Business Section */}
          <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-2xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-rose-700 flex items-center gap-2 mb-1">
              <FiAlertTriangle className="text-rose-600" />
              Delete Business Ledger
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              Permanently delete <strong>&quot;{activeBusiness?.name}&quot;</strong> and all of its associated transactions, categories, parties, and payment modes. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteBizModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FiTrash2 className="text-xs" />
              <span>Delete This Business</span>
            </button>
          </div>

          {/* Delete Account Section */}
          <div className="bg-white rounded-xl border border-rose-300 p-6 shadow-2xs bg-rose-50/20">
            <h2 className="text-sm font-bold uppercase tracking-wider text-rose-800 flex items-center gap-2 mb-1">
              <FiAlertTriangle className="text-rose-700" />
              Delete User Account
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              Permanently delete your personal administrator account, credentials, and all businesses and data you own. You will immediately be signed out.
            </p>
            <button
              onClick={() => setShowDeleteAccountModal(true)}
              className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FiTrash2 className="text-xs" />
              <span>Delete Entire Account</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Add Party */}
      {showAddPartyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FiUsers className="text-blue-600" />
                Add New Counterparty
              </h3>
              <button onClick={() => setShowAddPartyModal(false)} className="text-slate-400 hover:text-slate-600">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleAddParty} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Party Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp / John Vendor"
                  value={newPartyForm.partyName}
                  onChange={(e) => setNewPartyForm({ ...newPartyForm, partyName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Party Type</label>
                <select
                  value={newPartyForm.partyType}
                  onChange={(e) => setNewPartyForm({ ...newPartyForm, partyType: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="Supplier">Supplier</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={newPartyForm.phone}
                  onChange={(e) => setNewPartyForm({ ...newPartyForm, phone: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPartyModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                >
                  Add Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Business Confirmation */}
      {showDeleteBizModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-rose-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <FiAlertTriangle className="text-xl" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Business Ledger?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              This will permanently delete <strong>&quot;{activeBusiness?.name}&quot;</strong> and all associated transactions, counterparties, categories, and payment modes.
            </p>
            <p className="text-xs font-medium text-slate-700 mb-2">
              To confirm, type <strong>{activeBusiness?.name}</strong> below:
            </p>
            <input
              type="text"
              value={deleteBizConfirmText}
              onChange={(e) => setDeleteBizConfirmText(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden mb-4"
              placeholder={activeBusiness?.name}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteBizModal(false);
                  setDeleteBizConfirmText('');
                }}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBizConfirmText !== activeBusiness?.name || isDeletingBiz}
                onClick={handleConfirmDeleteBusiness}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeletingBiz ? 'Deleting...' : 'Delete Business'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Account Confirmation */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-red-300">
            <div className="flex items-center gap-3 text-red-700 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiAlertTriangle className="text-xl" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Entire User Account?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              This will permanently erase your user account (<strong>{user?.email}</strong>), along with all owned businesses and financial entries. You will not be able to recover this account.
            </p>
            <p className="text-xs font-medium text-slate-700 mb-2">
              To confirm, type <strong>DELETE</strong> below:
            </p>
            <input
              type="text"
              value={deleteAccountConfirmText}
              onChange={(e) => setDeleteAccountConfirmText(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden mb-4"
              placeholder="DELETE"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setDeleteAccountConfirmText('');
                }}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteAccountConfirmText !== 'DELETE' || isDeletingAccount}
                onClick={handleConfirmDeleteAccount}
                className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeletingAccount ? 'Deleting...' : 'Delete Account Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSettings;

