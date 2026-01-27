import React, { useState, useEffect } from 'react';
import { User, Brain, BarChart3, Plus, Ticket, Eye, Clock, MessageSquare, LogOut, Trash2, Download } from 'lucide-react';
import apiService from './services/api';

const HamoPro = () => {
  const APP_VERSION = "1.2.4";
  
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
  const [showInvitationCard, setShowInvitationCard] = useState(null);
  const [invitationCode, setInvitationCode] = useState('');
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [avatarForm, setAvatarForm] = useState({ name: '', theory: '', methodology: '', principles: '' });
  const [clientForm, setClientForm] = useState({ name: '', sex: '', age: '', emotionPattern: '', personality: '', cognition: '', goals: '', therapyPrinciples: '', avatarId: '' });

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        // TODO: Fetch user profile from API
        setIsAuthenticated(true);
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
        
        // TODO: Load user's avatars and clients from API
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

  const handleCreateAvatar = () => {
    if (avatarForm.name && avatarForm.theory) {
      // TODO: Call API to create avatar
      setAvatars([...avatars, { ...avatarForm, id: Date.now() }]);
      setAvatarForm({ name: '', theory: '', methodology: '', principles: '' });
      setShowAvatarForm(false);
    }
  };

  const handleCreateClient = () => {
    if (clientForm.name && clientForm.avatarId) {
      // TODO: Call API to create client and generate invitation
      const newClient = {
        ...clientForm,
        id: Date.now(),
        sessions: 0,
        avgTime: 0,
        conversations: []
      };
      setClients([...clients, newClient]);
      setClientForm({ name: '', sex: '', age: '', emotionPattern: '', personality: '', cognition: '', goals: '', therapyPrinciples: '', avatarId: '' });
      setShowClientForm(false);
    }
  };

  // Generate new invitation code for a client
  const handleGenerateInvitation = async (client) => {
    setInvitationLoading(true);
    try {
      const result = await apiService.generateInvitationCode(client.avatarId);
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
    const avatar = avatars.find(a => a.id === parseInt(showInvitationCard.avatarId));
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
                    <input 
                      type="text" 
                      value={authForm.profession} 
                      onChange={(e) => setAuthForm({ ...authForm, profession: e.target.value })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="Clinical Psychologist"
                      disabled={authLoading}
                    />
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
                <p className="text-xs text-gray-500">{currentUser?.profession}</p>
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
                      {avatars.find(a => a.id === parseInt(showInvitationCard.avatarId))?.name || 'Unknown'}
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
              <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                <h3 className="text-lg font-semibold">Create New AI Avatar</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Avatar Name</label><input type="text" value={avatarForm.name} onChange={(e) => setAvatarForm({ ...avatarForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Dr. Compassion" /></div>
                  <div><label className="block text-sm font-medium mb-1">Theory</label><input type="text" value={avatarForm.theory} onChange={(e) => setAvatarForm({ ...avatarForm, theory: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Cognitive Behavioral Therapy" /></div>
                  <div><label className="block text-sm font-medium mb-1">Methodology</label><input type="text" value={avatarForm.methodology} onChange={(e) => setAvatarForm({ ...avatarForm, methodology: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Solution-Focused Brief Therapy" /></div>
                  <div><label className="block text-sm font-medium mb-1">Principles</label><input type="text" value={avatarForm.principles} onChange={(e) => setAvatarForm({ ...avatarForm, principles: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Empathy, Active Listening, Non-judgment" /></div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={handleCreateAvatar} className="bg-blue-500 text-white px-6 py-2 rounded-lg">Create</button>
                  <button onClick={() => setShowAvatarForm(false)} className="bg-gray-200 px-6 py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              {avatars.map(a => (
                <div key={a.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center mb-4"><Brain className="w-6 h-6 text-white" /></div>
                  <h3 className="text-lg font-semibold mb-2">{a.name}</h3>
                  <p className="text-sm text-gray-600"><span className="font-medium">Theory:</span> {a.theory}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Client Instances</h2>
              <button onClick={() => setShowClientForm(!showClientForm)} disabled={!avatars.length} className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"><Plus className="w-5 h-5" /><span>Initialize Client</span></button>
            </div>
            {!avatars.length && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">Create an avatar first</div>}
            {showClientForm && avatars.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                <h3 className="text-lg font-semibold">Initialize Client</h3>
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
                const avatar = avatars.find(a => a.id === parseInt(c.avatarId));
                return (
                  <div key={c.id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between mb-4">
                      <div><h3 className="font-semibold">{c.name}</h3><p className="text-sm text-gray-500">{c.sex}, {c.age} years</p></div>
                      <button
                        onClick={() => handleGenerateInvitation(c)}
                        disabled={invitationLoading}
                        className="flex flex-col items-center text-blue-500 hover:text-blue-600 disabled:opacity-50"
                      >
                        <Ticket className="w-5 h-5" />
                        <span className="text-xs mt-1">邀请码</span>
                      </button>
                    </div>
                    <p className="text-sm mb-3"><span className="font-medium">Avatar:</span> {avatar?.name}</p>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-2"><MessageSquare className="w-4 h-4" /><span>{c.sessions} sessions</span></div>
                      <div className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>{c.avgTime} min avg</span></div>
                    </div>
                    <button onClick={() => setSelectedClient(c)} className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-100"><Eye className="w-4 h-4" /><span className="text-sm">View Chats</span></button>
                  </div>
                );
              })}
            </div>
            
            {selectedClient && (
              <div className="bg-white rounded-xl shadow-md p-6 mt-4">
                <div className="flex justify-between mb-6">
                  <h3 className="text-lg font-semibold">Conversations - {selectedClient.name}</h3>
                  <button onClick={() => setSelectedClient(null)} className="text-gray-500 hover:text-gray-700">Close</button>
                </div>
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
                  <div className="text-center py-8 text-gray-500">No conversations yet</div>
                )}
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