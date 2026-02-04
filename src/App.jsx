import React, { useState, useEffect } from 'react';
import { User, Brain, BarChart3, Plus, Ticket, Eye, Clock, MessageSquare, LogOut, Trash2, Download, CheckCircle, Calendar, Sparkles, Send, Star, X, Briefcase, ChevronRight } from 'lucide-react';
import apiService from './services/api';

const HamoPro = () => {
  const APP_VERSION = "1.4.2";

  // Contributors list
  const contributors = ['Chris Cheng', 'Anthropic Claude', 'Kerwin Du', 'Amy Chan'];

  // Profession options for sign up
  const professionOptions = [
    { value: 'mental_health_professional', label: 'Mental Health Professional' },
  ];

  // Helper function to get profession label
  const getProfessionLabel = (value) => {
    const option = professionOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // Avatar form options
  const specialtyOptions = [
    'Depression & Anxiety',
    'NPD & Personality Disorders',
    'Family & Couples Therapy',
    'Child & Adolescent Therapy',
    'Stress & Burnout',
    'PTSD & Trauma',
    'Substance Abuse & Addiction',
    'OCD & Anxiety Disorders'
  ];

  const therapeuticApproachOptions = [
    'Cognitive Behavioral Therapy',
    'Dialectical Behaviour Therapy',
    'Family Systems Therapy',
    'Play Therapy & Child Psychology',
    'Mindfulness-Based Therapy',
    'Trauma-Focused Therapy',
    'Addiction Recovery Therapy',
    'Acceptance and Commitment Therapy'
  ];

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '', profession: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('avatars');
  const [avatars, setAvatars] = useState([]);
  const [clients, setClients] = useState([]);
  const [showAvatarForm, setShowAvatarForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedMindClient, setSelectedMindClient] = useState(null);
  const [mindData, setMindData] = useState(null);
  const [mindLoading, setMindLoading] = useState(false);
  const [supervisionInputs, setSupervisionInputs] = useState({
    personality: '',
    emotion_pattern: '',
    cognition_beliefs: '',
    relationship_manipulations: ''
  });
  const [supervisionLoading, setSupervisionLoading] = useState({});
  const [expandedMindSection, setExpandedMindSection] = useState(null);
  const [showInvitationCard, setShowInvitationCard] = useState(null);
  const [invitationCode, setInvitationCode] = useState('');
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarForm, setAvatarForm] = useState({
    name: '',
    specialty: '',
    customSpecialty: '',
    therapeuticApproaches: [],
    customApproach: '',
    about: '',
    experienceYears: 0,
    experienceMonths: 0,
  });
  const [clientForm, setClientForm] = useState({ name: '', sex: '', age: '', emotionPattern: '', personality: '', cognition: '', goals: '', therapyPrinciples: '', avatarId: '' });

  // Load avatars and clients from backend
  const loadUserData = async () => {
    console.log('🔵 Loading user data...');

    // Load avatars
    const avatarsResult = await apiService.getAvatars();
    if (avatarsResult.success) {
      setAvatars(avatarsResult.avatars);
      console.log('✅ Loaded avatars:', avatarsResult.avatars.length);
    }

    // Load clients
    const clientsResult = await apiService.getClients();
    if (clientsResult.success) {
      setClients(clientsResult.clients);
      console.log('✅ Loaded clients:', clientsResult.clients.length);
    }
  };

  // Check authentication on mount and load data
  useEffect(() => {
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        setIsAuthenticated(true);
        // Load user data after confirming authentication
        await loadUserData();
      }
    };
    checkAuth();
  }, []);

  const generateMockConversations = () => [
    {
      date: '2026-01-10',
      messages: [
        { sender: 'client', text: 'I have been feeling anxious about work lately.', time: '14:23' },
        { sender: 'avatar', text: 'I hear that work brings up anxiety. What specifically triggers these feelings?', time: '14:24' },
        { sender: 'client', text: 'The deadlines. I always feel like I am not doing enough.', time: '14:25' },
        { sender: 'avatar', text: 'That belief that you are not doing enough seems significant. Where do you think that comes from?', time: '14:26' }
      ]
    },
    {
      date: '2026-01-08',
      messages: [
        { sender: 'client', text: 'I tried the breathing exercise you suggested.', time: '10:15' },
        { sender: 'avatar', text: 'That is wonderful that you tried it. How did it feel for you?', time: '10:16' },
        { sender: 'client', text: 'It helped a bit. I felt calmer for a while.', time: '10:18' }
      ]
    }
  ];

  const handleSignUp = async () => {
    setAuthError('');
    
    if (!authForm.email || !authForm.password || !authForm.fullName || !authForm.profession) {
      setAuthError('Please fill in all fields');
      return;
    }

    setAuthLoading(true);

    try {
      const result = await apiService.registerPro(
        authForm.fullName,
        authForm.profession,
        authForm.email,
        authForm.password
      );

      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        setAuthForm({ email: '', password: '', fullName: '', profession: '' });
        setAuthError('');

        // Load user's avatars and clients (likely empty for new user)
        await loadUserData();
      } else {
        setAuthError(result.error || 'Registration failed');
      }
    } catch (error) {
      setAuthError('Registration failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignIn = async () => {
    setAuthError('');
    
    if (!authForm.email || !authForm.password) {
      setAuthError('Please enter email and password');
      return;
    }

    setAuthLoading(true);

    try {
      const result = await apiService.loginPro(
        authForm.email,
        authForm.password
      );

      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        setAuthForm({ email: '', password: '', fullName: '', profession: '' });
        setAuthError('');

        // Load user's avatars and clients from API
        await loadUserData();
      } else {
        setAuthError(result.error || 'Invalid email or password');
      }
    } catch (error) {
      setAuthError('Login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await apiService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAvatars([]);
    setClients([]);
    setActiveTab('avatars');
    setAuthError('');
  };

  const handleDeleteAccount = () => {
    // TODO: Call API to delete account
    apiService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAvatars([]);
    setClients([]);
    setShowDeleteConfirm(false);
  };

  const handleCreateAvatar = async () => {
    // Validate required fields
    const specialty = avatarForm.specialty === 'custom' ? avatarForm.customSpecialty : avatarForm.specialty;
    const approaches = [...avatarForm.therapeuticApproaches];
    if (avatarForm.customApproach) approaches.push(avatarForm.customApproach);

    if (!avatarForm.name || !specialty || approaches.length === 0 || !avatarForm.about ||
        (avatarForm.experienceYears === 0 && avatarForm.experienceMonths === 0)) {
      alert('Please fill in all required fields');
      return;
    }

    if (approaches.length > 3) {
      alert('Maximum 3 therapeutic approaches allowed');
      return;
    }

    if (avatarForm.about.length > 280) {
      alert('About section must be 280 characters or less');
      return;
    }

    // Call API to create avatar and get backend-generated ID
    const result = await apiService.createAvatar({
      name: avatarForm.name,
      specialty: specialty,
      therapeutic_approaches: approaches,
      about: avatarForm.about,
      experience_years: avatarForm.experienceYears,
      experience_months: avatarForm.experienceMonths,
    });

    if (result.success) {
      // Use backend-generated avatar ID
      setAvatars([...avatars, {
        id: result.avatar.id,
        name: avatarForm.name,
        specialty: specialty,
        therapeuticApproaches: approaches,
        about: avatarForm.about,
        experienceYears: avatarForm.experienceYears,
        experienceMonths: avatarForm.experienceMonths,
      }]);
      console.log('✅ Avatar created with backend ID:', result.avatar.id);
    } else {
      // Fallback to local ID if API fails
      console.warn('⚠️ API failed, using local ID:', result.error);
      setAvatars([...avatars, {
        id: Date.now(),
        name: avatarForm.name,
        specialty: specialty,
        therapeuticApproaches: approaches,
        about: avatarForm.about,
        experienceYears: avatarForm.experienceYears,
        experienceMonths: avatarForm.experienceMonths,
      }]);
    }

    setAvatarForm({
      name: '',
      specialty: '',
      customSpecialty: '',
      therapeuticApproaches: [],
      customApproach: '',
      about: '',
      experienceYears: 0,
      experienceMonths: 0,
    });
    setShowAvatarForm(false);
  };

  const handleCreateClient = async () => {
    if (clientForm.name && clientForm.avatarId) {
      // Call API to create AI Mind (client profile)
      const result = await apiService.createMind({
        avatarId: clientForm.avatarId,
        name: clientForm.name,
        sex: clientForm.sex,
        age: clientForm.age,
        emotionPattern: clientForm.emotionPattern,
        personality: clientForm.personality,
        cognition: clientForm.cognition,
        goals: clientForm.goals,
        therapyPrinciples: clientForm.therapyPrinciples,
      });

      if (result.success) {
        // Use backend-generated mind as client
        setClients([...clients, {
          id: result.mind.id,
          name: result.mind.name,
          sex: result.mind.sex,
          age: result.mind.age,
          avatarId: result.mind.avatar_id,
          connectedAt: result.mind.connected_at,
          sessions: 0,
          avgTime: 0,
          conversations: []
        }]);
        console.log('✅ AI Mind created with ID:', result.mind.id);
      } else {
        // Fallback to local state if API fails
        console.warn('⚠️ API failed, using local state:', result.error);
        const newClient = {
          ...clientForm,
          id: Date.now(),
          sessions: 0,
          avgTime: 0,
          conversations: []
        };
        setClients([...clients, newClient]);
      }

      setClientForm({ name: '', sex: '', age: '', emotionPattern: '', personality: '', cognition: '', goals: '', therapyPrinciples: '', avatarId: '' });
      setShowClientForm(false);
    }
  };

  // Generate new invitation code for a client (AI Mind)
  // mindId is used to link the invitation to the specific AI Mind
  const handleGenerateInvitation = async (client) => {
    setInvitationLoading(true);
    try {
      const result = await apiService.generateInvitationCode(client.id);
      if (result.success) {
        setInvitationCode(result.invitationCode);
        setShowInvitationCard(client);
      }
    } catch (error) {
      console.error('Failed to generate invitation code:', error);
    } finally {
      setInvitationLoading(false);
    }
  };

  // Fetch and display AI Mind for a client
  const handleViewMind = async (client) => {
    // Close View Chats panel if open
    setSelectedClient(null);

    setMindLoading(true);
    setSelectedMindClient(client);
    setMindData(null);
    // Reset supervision inputs when viewing a new client
    setSupervisionInputs({
      personality: '',
      emotion_pattern: '',
      cognition_beliefs: '',
      relationship_manipulations: ''
    });

    try {
      const result = await apiService.getMind(client.id, client.avatarId);
      if (result.success) {
        setMindData(result.mind);
      } else {
        setMindData({ error: result.error || 'Failed to load AI Mind data' });
      }
    } catch (error) {
      console.error('Failed to fetch AI Mind:', error);
      setMindData({ error: 'Failed to load AI Mind data' });
    } finally {
      setMindLoading(false);
    }
  };

  // View chats for a client (close AI Mind if open)
  const handleViewChats = (client) => {
    // Close AI Mind panel if open
    setSelectedMindClient(null);
    setMindData(null);

    setSelectedClient(client);
  };

  // Handle supervision submission for a specific section
  const handleSupervise = async (section) => {
    const feedback = supervisionInputs[section];
    if (!feedback.trim() || !selectedMindClient) return;

    setSupervisionLoading(prev => ({ ...prev, [section]: true }));

    try {
      const result = await apiService.submitSupervision(
        selectedMindClient.id,
        selectedMindClient.avatarId,
        section,
        feedback
      );

      if (result.success) {
        // Clear the input after successful submission
        setSupervisionInputs(prev => ({ ...prev, [section]: '' }));
        console.log('✅ Supervision submitted for', section);
        // Optionally refresh mind data
        // handleViewMind(selectedMindClient);
      } else {
        console.error('Failed to submit supervision:', result.error);
      }
    } catch (error) {
      console.error('Failed to submit supervision:', error);
    } finally {
      setSupervisionLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  // Save invitation card as image to local device
  const handleSaveInvitationCard = () => {
    const card = document.getElementById('invitation-card-content');
    if (!card) return;

    // Create canvas and draw the card
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 400;
    canvas.height = 500;

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 400, 500);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#14B8A6');
    ctx.fillStyle = gradient;
    ctx.roundRect(0, 0, 400, 500, 20);
    ctx.fill();

    // Draw white card background
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(10, 10, 380, 480, 16);
    ctx.fill();

    // Draw title
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Invitation Code', 200, 60);

    // Draw Hamo Pro badge
    ctx.fillStyle = '#3B82F6';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Hamo Pro', 200, 90);

    // Draw invitation code
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(invitationCode, 200, 180);

    // Draw validity notice
    ctx.fillStyle = '#F97316';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText('Valid for 24 hours', 200, 230);

    // Draw divider line
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 270);
    ctx.lineTo(360, 270);
    ctx.stroke();

    // Draw client info
    const avatar = avatars.find(a => String(a.id) === String(showInvitationCard.avatarId) || String(a.id) === String(showInvitationCard.avatar_id));
    ctx.fillStyle = '#6B7280';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Client', 200, 310);
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(showInvitationCard.name, 200, 340);

    ctx.fillStyle = '#6B7280';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('AI Avatar', 200, 390);
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(avatar?.name || 'Unknown', 200, 420);

    // Draw footer
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('Download Hamo Client App to connect', 200, 470);

    // Download the image
    const link = document.createElement('a');
    link.download = `hamo-invitation-${invitationCode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Hamo Pro</h1>
            <p className="text-center text-gray-500 mb-8">AI Therapy Avatar Management</p>
            
            <div className="flex space-x-2 mb-6">
              <button 
                onClick={() => { setAuthMode('signin'); setAuthError(''); }} 
                className={`flex-1 py-2 rounded-lg font-medium ${authMode === 'signin' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthMode('signup'); setAuthError(''); }} 
                className={`flex-1 py-2 rounded-lg font-medium ${authMode === 'signup' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Sign Up
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}

            <div className="space-y-4">
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={authForm.fullName} 
                      onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="Dr. Jane Smith"
                      disabled={authLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                    <select
                      value={authForm.profession}
                      onChange={(e) => setAuthForm({ ...authForm, profession: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      disabled={authLoading}
                    >
                      <option value="">Select your profession</option>
                      {professionOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={authForm.email} 
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="your@email.com"
                  disabled={authLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={authForm.password} 
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="••••••••"
                  disabled={authLoading}
                />
              </div>
              <button 
                onClick={authMode === 'signin' ? handleSignIn : handleSignUp} 
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={authLoading}
              >
                {authLoading ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
              </button>
            </div>
            
            <div className="text-center mt-6 text-xs text-gray-400">
              Version {APP_VERSION}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hamo Pro</h1>
                <p className="text-sm text-gray-500">AI Therapy Avatar Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2 text-sm font-medium"><User className="w-4 h-4" /><span>{currentUser?.full_name || currentUser?.fullName}</span></div>
                <p className="text-xs text-gray-500">{getProfessionLabel(currentUser?.profession)}</p>
              </div>
              <button onClick={handleSignOut} className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"><LogOut className="w-4 h-4" /><span className="text-sm">Sign Out</span></button>
              <button onClick={() => setShowDeleteConfirm(true)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-6">Are you sure? This will permanently delete all your data.</p>
            <div className="flex space-x-3">
              <button onClick={handleDeleteAccount} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg">Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showInvitationCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl p-1 shadow-2xl">
            <div id="invitation-card-content" className="bg-white rounded-2xl p-8 w-80">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Invitation Code</h3>
                <p className="text-sm text-blue-500 mb-6">Hamo Pro</p>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-3xl font-bold font-mono text-gray-900 tracking-wider">{invitationCode}</p>
                </div>

                <div className="flex items-center justify-center space-x-2 text-orange-500 mb-6">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">24小时内有效</span>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Client</p>
                    <p className="font-semibold text-gray-900">{showInvitationCard.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">AI Avatar</p>
                    <p className="font-semibold text-gray-900">
                      {avatars.find(a => String(a.id) === String(showInvitationCard.avatarId) || String(a.id) === String(showInvitationCard.avatar_id))?.name || 'Unknown'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-6">Download Hamo Client App to connect</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveInvitationCard}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setShowInvitationCard(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
          <button onClick={() => setActiveTab('avatars')} className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md ${activeTab === 'avatars' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}><Brain className="w-5 h-5" /><span>AI Avatars</span></button>
          <button onClick={() => setActiveTab('clients')} className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md ${activeTab === 'clients' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}><User className="w-5 h-5" /><span>Clients</span></button>
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md ${activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}><BarChart3 className="w-5 h-5" /><span>Dashboard</span></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {activeTab === 'avatars' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your AI Avatars</h2>
              <button onClick={() => setShowAvatarForm(!showAvatarForm)} className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg"><Plus className="w-5 h-5" /><span>Create Avatar</span></button>
            </div>
            {showAvatarForm && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-5">Create New AI Avatar</h3>

                <div className="space-y-4">
                  {/* Section 1: Basic Identity - Blue tint */}
                  <div className="bg-blue-50/70 rounded-xl p-4 space-y-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-blue-700">Basic Identity</span>
                    </div>

                    {/* Avatar Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={avatarForm.name}
                        onChange={(e) => setAvatarForm({ ...avatarForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                        placeholder="e.g., Dr. Emily Chen"
                      />
                    </div>

                    {/* Specialty */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialty <span className="text-red-500">*</span></label>
                      <select
                        value={avatarForm.specialty}
                        onChange={(e) => setAvatarForm({ ...avatarForm, specialty: e.target.value })}
                        className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                      >
                        <option value="">Select Specialty</option>
                        {specialtyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        <option value="custom">Other (Custom)</option>
                      </select>
                      {avatarForm.specialty === 'custom' && (
                        <input
                          type="text"
                          value={avatarForm.customSpecialty}
                          onChange={(e) => setAvatarForm({ ...avatarForm, customSpecialty: e.target.value })}
                          className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-white mt-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                          placeholder="Enter custom specialty"
                        />
                      )}
                    </div>
                  </div>

                  {/* Section 2: Therapeutic Approach - Teal tint */}
                  <div className="bg-teal-50/70 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                        <Brain className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-teal-700">Therapeutic Approach</span>
                      <span className="text-xs text-teal-500 ml-1">(Select 1-3)</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {therapeuticApproachOptions.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            if (avatarForm.therapeuticApproaches.includes(opt)) {
                              setAvatarForm({ ...avatarForm, therapeuticApproaches: avatarForm.therapeuticApproaches.filter(a => a !== opt) });
                            } else if (avatarForm.therapeuticApproaches.length < 3) {
                              setAvatarForm({ ...avatarForm, therapeuticApproaches: [...avatarForm.therapeuticApproaches, opt] });
                            }
                          }}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all ${avatarForm.therapeuticApproaches.includes(opt) ? 'bg-teal-500 text-white border-teal-500 shadow-sm' : 'bg-white text-gray-600 border-teal-200 hover:border-teal-400 hover:bg-teal-50'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={avatarForm.customApproach}
                      onChange={(e) => setAvatarForm({ ...avatarForm, customApproach: e.target.value })}
                      className="w-full px-4 py-2.5 border border-teal-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition-all"
                      placeholder="Or add custom approach"
                    />
                  </div>

                  {/* Section 3: About - Purple tint */}
                  <div className="bg-purple-50/70 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-purple-700">About</span>
                    </div>

                    <textarea
                      value={avatarForm.about}
                      onChange={(e) => setAvatarForm({ ...avatarForm, about: e.target.value.slice(0, 280) })}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all resize-none"
                      rows="3"
                      placeholder="Describe the avatar's expertise and approach..."
                    />
                    <p className="text-xs text-purple-400 mt-1.5">{avatarForm.about.length}/280 characters</p>
                  </div>

                  {/* Section 4: Experience - Amber tint */}
                  <div className="bg-amber-50/70 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <Briefcase className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-amber-700">Experience</span>
                    </div>

                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <label className="block text-xs text-amber-600 mb-1">Years</label>
                        <select
                          value={avatarForm.experienceYears}
                          onChange={(e) => setAvatarForm({ ...avatarForm, experienceYears: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-amber-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all"
                        >
                          {[...Array(51)].map((_, i) => <option key={i} value={i}>{i} {i === 1 ? 'year' : 'years'}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-amber-600 mb-1">Months</label>
                        <select
                          value={avatarForm.experienceMonths}
                          onChange={(e) => setAvatarForm({ ...avatarForm, experienceMonths: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-amber-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all"
                        >
                          {[...Array(12)].map((_, i) => <option key={i} value={i}>{i} {i === 1 ? 'month' : 'months'}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-100">
                  <button onClick={handleCreateAvatar} className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2.5 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition-all shadow-sm">Create Avatar</button>
                  <button onClick={() => setShowAvatarForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-all">Cancel</button>
                </div>
              </div>
            )}
            {/* Avatar List - Vertical Layout */}
            <div className="space-y-3">
              {avatars.map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelectedAvatar(a)}
                  className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    {/* Avatar Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="w-8 h-8 text-white" />
                    </div>

                    {/* Avatar Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{a.name}</h3>
                          <p className="text-sm text-blue-600">{a.specialty || a.theory}</p>
                        </div>
                        {/* Rating placeholder - can be removed if not needed */}
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">5.0</span>
                        </div>
                      </div>

                      {/* Therapeutic Approaches */}
                      {a.therapeuticApproaches && a.therapeuticApproaches.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">{a.therapeuticApproaches.join(' • ')}</p>
                      )}

                      {/* Stats Row */}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        {(a.experienceYears !== undefined || a.experienceMonths !== undefined) && (
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{a.experienceYears || 0}y {a.experienceMonths || 0}m</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Avatar Detail Popup */}
            {selectedAvatar && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  {/* Header with gradient background */}
                  <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-6 rounded-t-2xl relative">
                    <button
                      onClick={() => setSelectedAvatar(null)}
                      className="absolute top-4 right-4 text-white hover:bg-white/20 p-1 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Brain className="w-12 h-12 text-blue-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">{selectedAvatar.name}</h2>
                      <p className="text-blue-100 mt-1">{selectedAvatar.specialty || selectedAvatar.theory}</p>

                      {/* Rating */}
                      <div className="flex items-center space-x-1 mt-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className="w-5 h-5 text-yellow-300 fill-current" />
                        ))}
                        <span className="text-white ml-2 text-sm">5.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-5">
                    {/* Therapeutic Approaches */}
                    {selectedAvatar.therapeuticApproaches && selectedAvatar.therapeuticApproaches.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Therapeutic Approach</h4>
                        <p className="text-gray-800">{selectedAvatar.therapeuticApproaches.join(' • ')}</p>
                      </div>
                    )}

                    {/* About */}
                    {selectedAvatar.about && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">About</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{selectedAvatar.about}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {(selectedAvatar.experienceYears !== undefined || selectedAvatar.experienceMonths !== undefined) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Experience</h4>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-800 font-medium">
                            {selectedAvatar.experienceYears || 0} years {selectedAvatar.experienceMonths || 0} months
                          </span>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Footer */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => setSelectedAvatar(null)}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Client Instances</h2>
              <button onClick={() => setShowClientForm(!showClientForm)} disabled={!avatars.length} className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"><Plus className="w-5 h-5" /><span>Invite Client</span></button>
            </div>
            {!avatars.length && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">Create an avatar first</div>}
            {showClientForm && avatars.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                <h3 className="text-lg font-semibold">Initialize AI Mind for the Client</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Client name" /></div>
                  <div><label className="block text-sm font-medium mb-1">Sex</label><select value={clientForm.sex} onChange={(e) => setClientForm({ ...clientForm, sex: e.target.value })} className="w-full px-4 py-2 border rounded-lg"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                  <div><label className="block text-sm font-medium mb-1">Age</label><input type="number" value={clientForm.age} onChange={(e) => setClientForm({ ...clientForm, age: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Age" /></div>
                  <div><label className="block text-sm font-medium mb-1">Avatar</label><select value={clientForm.avatarId} onChange={(e) => setClientForm({ ...clientForm, avatarId: e.target.value })} className="w-full px-4 py-2 border rounded-lg"><option value="">Select Avatar</option>{avatars.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                  <div className="col-span-2"><label className="block text-sm font-medium mb-1">Emotion Pattern</label><textarea value={clientForm.emotionPattern} onChange={(e) => setClientForm({ ...clientForm, emotionPattern: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows="2" placeholder="e.g., Tends toward anxiety in social situations..." /></div>
                  <div className="col-span-2"><label className="block text-sm font-medium mb-1">Personality & Characteristics</label><textarea value={clientForm.personality} onChange={(e) => setClientForm({ ...clientForm, personality: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows="2" placeholder="e.g., Introverted, perfectionist, people-pleaser..." /></div>
                  <div className="col-span-2"><label className="block text-sm font-medium mb-1">Cognition Features & Beliefs</label><textarea value={clientForm.cognition} onChange={(e) => setClientForm({ ...clientForm, cognition: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows="2" placeholder="e.g., 'If I perform well, disaster will come to me'..." /></div>
                  <div className="col-span-2"><label className="block text-sm font-medium mb-1">Therapy Goals</label><textarea value={clientForm.goals} onChange={(e) => setClientForm({ ...clientForm, goals: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows="2" placeholder="e.g., Reduce anxiety and depression, improve vitality..." /></div>
                  <div className="col-span-2"><label className="block text-sm font-medium mb-1">Therapy Principles</label><textarea value={clientForm.therapyPrinciples} onChange={(e) => setClientForm({ ...clientForm, therapyPrinciples: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows="2" placeholder="e.g., Be kind, empathy first, less suggestion..." /></div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={handleCreateClient} className="bg-blue-500 text-white px-6 py-2 rounded-lg">Initialize</button>
                  <button onClick={() => setShowClientForm(false)} className="bg-gray-200 px-6 py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {clients.map(c => {
                const avatar = avatars.find(a => a.id === parseInt(c.avatarId) || a.id === c.avatarId);
                const isConnected = c.connectedAt || c.connected_at;
                // Connection date now formatted inline in English
                return (
                  <div key={c.id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between mb-4">
                      <div><h3 className="font-semibold">{c.name}</h3><p className="text-sm text-gray-500">{c.sex}, {c.age} years</p></div>
                      {isConnected ? (
                        <div className="flex flex-col items-center text-green-500">
                          <Calendar className="w-5 h-5" />
                          <span className="text-xs mt-1">{new Date(isConnected).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="text-xs text-green-600 font-medium">Connected</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateInvitation(c)}
                          disabled={invitationLoading}
                          className="flex flex-col items-center text-blue-500 hover:text-blue-600 disabled:opacity-50"
                        >
                          <Ticket className="w-5 h-5" />
                          <span className="text-xs mt-1">邀请码</span>
                        </button>
                      )}
                    </div>
                    <p className="text-sm mb-3"><span className="font-medium">Avatar:</span> {avatar?.name || '未分配'}</p>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-2"><MessageSquare className="w-4 h-4" /><span>{c.sessions} sessions</span></div>
                      <div className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>{c.avgTime} min avg</span></div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleViewMind(c)} className="flex-1 bg-purple-50 text-purple-600 px-3 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-purple-100"><Sparkles className="w-4 h-4" /><span className="text-sm">AI Mind</span></button>
                      <button onClick={() => handleViewChats(c)} className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-100"><Eye className="w-4 h-4" /><span className="text-sm">View Chats</span></button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {selectedMindClient && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4" onClick={() => { setSelectedMindClient(null); setMindData(null); setExpandedMindSection(null); }}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 rounded-t-2xl">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                          <span>AI Mind</span>
                        </h3>
                        <p className="text-purple-100 text-sm">Psychological Profile Analysis</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedMindClient(null); setMindData(null); }}
                      className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {mindLoading ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p>Loading AI Mind data...</p>
                  </div>
                ) : mindData?.error ? (
                  <div className="text-center py-12 text-red-500">{mindData.error}</div>
                ) : mindData ? (
                  <div className="p-6 space-y-5">
                    {/* Client Info Card */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {mindData.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{mindData.name || selectedMindClient.name}</h4>
                            <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                              {mindData.sex && <span className="capitalize">{mindData.sex}</span>}
                              {mindData.age && <span>• {mindData.age} years old</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {mindData.avatar_name && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Brain className="w-4 h-4 text-purple-500" />
                              <span className="text-gray-600">{mindData.avatar_name}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            {mindData.sessions !== undefined && (
                              <span className="flex items-center space-x-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{mindData.sessions} sessions</span>
                              </span>
                            )}
                            {mindData.avg_time !== undefined && (
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{mindData.avg_time} min avg</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Mind Sections */}
                    <div className="space-y-3">
                      {/* Personality Section */}
                      {mindData.personality && (
                        <div
                          className={`bg-purple-500 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${expandedMindSection === 'personality' ? 'ring-2 ring-purple-300' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMindSection(expandedMindSection === 'personality' ? null : 'personality');
                          }}
                        >
                          <div className="px-5 py-4 flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-bold text-lg">Personality Traits</h4>
                              {mindData.personality.primary_traits?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {mindData.personality.primary_traits.slice(0, 3).map((trait, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-white/20 text-white/90 rounded-full text-xs border border-white/30">
                                      {trait}
                                    </span>
                                  ))}
                                  {mindData.personality.primary_traits.length > 3 && (
                                    <span className="px-2 py-0.5 text-white/70 text-xs">+{mindData.personality.primary_traits.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className={`w-10 h-10 bg-black rounded-full flex items-center justify-center transition-transform duration-300 ${expandedMindSection === 'personality' ? 'rotate-90' : ''}`}>
                              <ChevronRight className="w-5 h-5 text-white" />
                            </div>
                          </div>

                          {expandedMindSection === 'personality' && (
                            <div className="bg-white mx-2 mb-2 rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
                              {mindData.personality.primary_traits?.length > 0 && (
                                <div className="mb-4">
                                  <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">All Traits</span>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {mindData.personality.primary_traits.map((trait, idx) => (
                                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                        {trait}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {mindData.personality.description && (
                                <p className="text-sm text-gray-600 bg-purple-50 rounded-lg p-3 italic mb-4">
                                  "{mindData.personality.description}"
                                </p>
                              )}
                              <div className="flex pt-3 border-t border-purple-100">
                                <input
                                  type="text"
                                  value={supervisionInputs.personality}
                                  onChange={(e) => setSupervisionInputs(prev => ({ ...prev, personality: e.target.value }))}
                                  placeholder="Enter supervision feedback..."
                                  className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSupervise('personality'); }}
                                  disabled={!supervisionInputs.personality.trim() || supervisionLoading.personality}
                                  className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-r-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                >
                                  <Send className="w-4 h-4" />
                                  <span>{supervisionLoading.personality ? '...' : 'Supervise'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Emotion Pattern Section */}
                      {mindData.emotion_pattern && (
                        <div
                          className={`bg-emerald-500 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${expandedMindSection === 'emotion_pattern' ? 'ring-2 ring-emerald-300' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMindSection(expandedMindSection === 'emotion_pattern' ? null : 'emotion_pattern');
                          }}
                        >
                          <div className="px-5 py-4 flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-bold text-lg">Emotion Pattern</h4>
                              {mindData.emotion_pattern.dominant_emotions?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {mindData.emotion_pattern.dominant_emotions.slice(0, 3).map((emotion, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-white/20 text-white/90 rounded-full text-xs border border-white/30">
                                      {emotion}
                                    </span>
                                  ))}
                                  {mindData.emotion_pattern.dominant_emotions.length > 3 && (
                                    <span className="px-2 py-0.5 text-white/70 text-xs">+{mindData.emotion_pattern.dominant_emotions.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className={`w-10 h-10 bg-black rounded-full flex items-center justify-center transition-transform duration-300 ${expandedMindSection === 'emotion_pattern' ? 'rotate-90' : ''}`}>
                              <ChevronRight className="w-5 h-5 text-white" />
                            </div>
                          </div>

                          {expandedMindSection === 'emotion_pattern' && (
                            <div className="bg-white mx-2 mb-2 rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {mindData.emotion_pattern.dominant_emotions?.length > 0 && (
                                  <div className="bg-emerald-50 rounded-lg p-3">
                                    <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Dominant Emotions</span>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {mindData.emotion_pattern.dominant_emotions.map((emotion, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">
                                          {emotion}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {mindData.emotion_pattern.triggers?.length > 0 && (
                                  <div className="bg-amber-50 rounded-lg p-3">
                                    <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">Triggers</span>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {mindData.emotion_pattern.triggers.map((trigger, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                                          {trigger}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {mindData.emotion_pattern.coping_mechanisms?.length > 0 && (
                                  <div className="bg-green-50 rounded-lg p-3">
                                    <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Coping Mechanisms</span>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {mindData.emotion_pattern.coping_mechanisms.map((mechanism, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                          {mechanism}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {mindData.emotion_pattern.description && (
                                <p className="text-sm text-gray-600 bg-emerald-50 rounded-lg p-3 italic mb-4">
                                  "{mindData.emotion_pattern.description}"
                                </p>
                              )}
                              <div className="flex pt-3 border-t border-emerald-100">
                                <input
                                  type="text"
                                  value={supervisionInputs.emotion_pattern}
                                  onChange={(e) => setSupervisionInputs(prev => ({ ...prev, emotion_pattern: e.target.value }))}
                                  placeholder="Enter supervision feedback..."
                                  className="flex-1 px-3 py-2 text-sm border border-emerald-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSupervise('emotion_pattern'); }}
                                  disabled={!supervisionInputs.emotion_pattern.trim() || supervisionLoading.emotion_pattern}
                                  className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-r-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                >
                                  <Send className="w-4 h-4" />
                                  <span>{supervisionLoading.emotion_pattern ? '...' : 'Supervise'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cognition & Beliefs Section */}
                      {mindData.cognition_beliefs && (
                        <div
                          className={`bg-amber-400 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${expandedMindSection === 'cognition_beliefs' ? 'ring-2 ring-amber-300' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMindSection(expandedMindSection === 'cognition_beliefs' ? null : 'cognition_beliefs');
                          }}
                        >
                          <div className="px-5 py-4 flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-bold text-lg">Cognition & Beliefs</h4>
                              {mindData.cognition_beliefs.core_beliefs?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {mindData.cognition_beliefs.core_beliefs.slice(0, 2).map((belief, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-white/20 text-white/90 rounded-full text-xs border border-white/30 truncate max-w-[150px]">
                                      {belief}
                                    </span>
                                  ))}
                                  {mindData.cognition_beliefs.core_beliefs.length > 2 && (
                                    <span className="px-2 py-0.5 text-white/70 text-xs">+{mindData.cognition_beliefs.core_beliefs.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className={`w-10 h-10 bg-black rounded-full flex items-center justify-center transition-transform duration-300 ${expandedMindSection === 'cognition_beliefs' ? 'rotate-90' : ''}`}>
                              <ChevronRight className="w-5 h-5 text-white" />
                            </div>
                          </div>

                          {expandedMindSection === 'cognition_beliefs' && (
                            <div className="bg-white mx-2 mb-2 rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
                              <div className="space-y-3 mb-4">
                                {mindData.cognition_beliefs.core_beliefs?.length > 0 && (
                                  <div className="bg-amber-50 rounded-lg p-3">
                                    <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">Core Beliefs</span>
                                    <div className="mt-2 space-y-1">
                                      {mindData.cognition_beliefs.core_beliefs.map((belief, idx) => (
                                        <div key={idx} className="flex items-start space-x-2">
                                          <span className="text-amber-500 mt-1">•</span>
                                          <span className="text-sm text-gray-700">{belief}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {mindData.cognition_beliefs.cognitive_distortions?.length > 0 && (
                                  <div className="bg-red-50 rounded-lg p-3">
                                    <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Cognitive Distortions</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {mindData.cognition_beliefs.cognitive_distortions.map((distortion, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                          {distortion}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {mindData.cognition_beliefs.thinking_patterns?.length > 0 && (
                                  <div className="bg-amber-50 rounded-lg p-3">
                                    <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">Thinking Patterns</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {mindData.cognition_beliefs.thinking_patterns.map((pattern, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                                          {pattern}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {(mindData.cognition_beliefs.self_perception || mindData.cognition_beliefs.world_perception || mindData.cognition_beliefs.future_perception) && (
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                  {mindData.cognition_beliefs.self_perception && (
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Self</div>
                                      <div className="text-sm text-gray-700">{mindData.cognition_beliefs.self_perception}</div>
                                    </div>
                                  )}
                                  {mindData.cognition_beliefs.world_perception && (
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">World</div>
                                      <div className="text-sm text-gray-700">{mindData.cognition_beliefs.world_perception}</div>
                                    </div>
                                  )}
                                  {mindData.cognition_beliefs.future_perception && (
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Future</div>
                                      <div className="text-sm text-gray-700">{mindData.cognition_beliefs.future_perception}</div>
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="flex pt-3 border-t border-amber-100">
                                <input
                                  type="text"
                                  value={supervisionInputs.cognition_beliefs}
                                  onChange={(e) => setSupervisionInputs(prev => ({ ...prev, cognition_beliefs: e.target.value }))}
                                  placeholder="Enter supervision feedback..."
                                  className="flex-1 px-3 py-2 text-sm border border-amber-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSupervise('cognition_beliefs'); }}
                                  disabled={!supervisionInputs.cognition_beliefs.trim() || supervisionLoading.cognition_beliefs}
                                  className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-r-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                >
                                  <Send className="w-4 h-4" />
                                  <span>{supervisionLoading.cognition_beliefs ? '...' : 'Supervise'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Relationship Patterns Section */}
                      {mindData.relationship_manipulations && (
                        <div
                          className={`bg-blue-500 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${expandedMindSection === 'relationship_manipulations' ? 'ring-2 ring-blue-300' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMindSection(expandedMindSection === 'relationship_manipulations' ? null : 'relationship_manipulations');
                          }}
                        >
                          <div className="px-5 py-4 flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-bold text-lg">Relationship Patterns</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {mindData.relationship_manipulations.attachment_style && (
                                  <span className="px-2 py-0.5 bg-white/20 text-white/90 rounded-full text-xs border border-white/30 capitalize">
                                    {mindData.relationship_manipulations.attachment_style}
                                  </span>
                                )}
                                {mindData.relationship_manipulations.relationship_patterns?.slice(0, 2).map((pattern, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-white/20 text-white/90 rounded-full text-xs border border-white/30">
                                    {pattern}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className={`w-10 h-10 bg-black rounded-full flex items-center justify-center transition-transform duration-300 ${expandedMindSection === 'relationship_manipulations' ? 'rotate-90' : ''}`}>
                              <ChevronRight className="w-5 h-5 text-white" />
                            </div>
                          </div>

                          {expandedMindSection === 'relationship_manipulations' && (
                            <div className="bg-white mx-2 mb-2 rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {mindData.relationship_manipulations.attachment_style && (
                                  <div className="bg-blue-50 rounded-lg p-3">
                                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Attachment Style</span>
                                    <div className="mt-1">
                                      <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-semibold capitalize">
                                        {mindData.relationship_manipulations.attachment_style}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                {mindData.relationship_manipulations.communication_style && (
                                  <div className="bg-blue-50 rounded-lg p-3">
                                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Communication Style</span>
                                    <div className="text-sm text-gray-700 mt-1">{mindData.relationship_manipulations.communication_style}</div>
                                  </div>
                                )}
                              </div>
                              {mindData.relationship_manipulations.relationship_patterns?.length > 0 && (
                                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Relationship Patterns</span>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {mindData.relationship_manipulations.relationship_patterns.map((pattern, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                        {pattern}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {mindData.relationship_manipulations.conflict_resolution && (
                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Conflict Resolution</span>
                                  <div className="text-sm text-gray-700 mt-1">{mindData.relationship_manipulations.conflict_resolution}</div>
                                </div>
                              )}
                              <div className="flex pt-3 border-t border-blue-100">
                                <input
                                  type="text"
                                  value={supervisionInputs.relationship_manipulations}
                                  onChange={(e) => setSupervisionInputs(prev => ({ ...prev, relationship_manipulations: e.target.value }))}
                                  placeholder="Enter supervision feedback..."
                                  className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSupervise('relationship_manipulations'); }}
                                  disabled={!supervisionInputs.relationship_manipulations.trim() || supervisionLoading.relationship_manipulations}
                                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-r-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                >
                                  <Send className="w-4 h-4" />
                                  <span>{supervisionLoading.relationship_manipulations ? '...' : 'Supervise'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Goals & Therapy Principles Section */}
                      {(mindData.goals || mindData.therapy_principles) && (
                        <div
                          className={`bg-green-400 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${expandedMindSection === 'goals' ? 'ring-2 ring-green-300' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMindSection(expandedMindSection === 'goals' ? null : 'goals');
                          }}
                        >
                          <div className="px-5 py-4 flex items-center justify-between">
                            <div>
                              <h4 className="text-gray-900 font-bold text-lg">Goals & Principles</h4>
                              <p className="text-gray-700 text-sm mt-1 line-clamp-1">
                                {mindData.goals || mindData.therapy_principles}
                              </p>
                            </div>
                            <div className={`w-10 h-10 bg-black rounded-full flex items-center justify-center transition-transform duration-300 ${expandedMindSection === 'goals' ? 'rotate-90' : ''}`}>
                              <ChevronRight className="w-5 h-5 text-white" />
                            </div>
                          </div>

                          {expandedMindSection === 'goals' && (
                            <div className="bg-white mx-2 mb-2 rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mindData.goals && (
                                  <div className="bg-green-50 rounded-lg p-3">
                                    <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Therapy Goals</span>
                                    <p className="text-sm text-gray-700 mt-2">{mindData.goals}</p>
                                  </div>
                                )}
                                {mindData.therapy_principles && (
                                  <div className="bg-green-50 rounded-lg p-3">
                                    <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Therapy Principles</span>
                                    <p className="text-sm text-gray-700 mt-2">{mindData.therapy_principles}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer with metadata */}
                    <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        {mindData.connected_at && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Connected: {new Date(mindData.connected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </span>
                        )}
                        {mindData.created_at && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Created: {new Date(mindData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </span>
                        )}
                      </div>
                      {mindData.invitation_code && (
                        <span className="flex items-center space-x-1 text-purple-400">
                          <Ticket className="w-3 h-3" />
                          <span>{mindData.invitation_code}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">No AI Mind data available</div>
                )}
                </div>
              </div>
            )}

            {selectedClient && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4" onClick={() => setSelectedClient(null)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Conversations</h3>
                          <p className="text-blue-100 text-sm">{selectedClient.name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedClient(null)}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {selectedClient.conversations && selectedClient.conversations.length > 0 ? (
                      selectedClient.conversations.map((conv, i) => (
                        <div key={i} className="border-l-4 border-blue-500 pl-4 mb-6">
                          <p className="text-sm font-medium text-gray-500 mb-3">{conv.date}</p>
                          {conv.messages.map((msg, j) => (
                            <div key={j} className={`p-3 rounded-lg mb-2 ${msg.sender === 'client' ? 'bg-gray-100' : 'bg-blue-50'}`}>
                              <div className="flex justify-between mb-1"><span className="text-xs font-medium">{msg.sender === 'client' ? 'Client' : 'Avatar'}</span><span className="text-xs text-gray-400">{msg.time}</span></div>
                              <p className="text-sm">{msg.text}</p>
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">No conversations yet</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            {!clients.length ? <div className="text-center py-12 text-gray-500 bg-white rounded-xl">No client data available</div> : (
              <div className="grid grid-cols-3 gap-4">
                {clients.map(c => (
                  <div key={c.id} className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-semibold mb-4">{c.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3"><MessageSquare className="w-5 h-5 text-blue-500" /><div><p className="text-2xl font-bold">{c.sessions}</p><p className="text-xs text-gray-500">Sessions</p></div></div>
                      <div className="flex items-center space-x-3"><Clock className="w-5 h-5 text-teal-500" /><div><p className="text-2xl font-bold">{c.avgTime} min</p><p className="text-xs text-gray-500">Avg Time</p></div></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Contributors Section */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Contributors</h3>
              <div className="overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap">
                  {[...contributors, ...contributors].map((name, index) => (
                    <span key={index} className="mx-4 text-gray-400 font-medium">{name}</span>
                  ))}
                </div>
              </div>
              <style>{`
                @keyframes marquee {
                  0% { transform: translateX(0%); }
                  100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                  animation: marquee 15s linear infinite;
                }
              `}</style>
            </div>
          </div>
        )}
      </div>

      <footer className="max-w-7xl mx-auto px-6 py-4 text-center">
        <p className="text-xs text-gray-400">Hamo Pro Version {APP_VERSION}</p>
      </footer>
    </div>
  );
};

export default HamoPro;