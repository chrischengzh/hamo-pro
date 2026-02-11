import React, { useState, useEffect } from 'react';
import { User, Brain, BarChart3, Plus, Ticket, Eye, Clock, MessageSquare, LogOut, Trash2, Download, CheckCircle, Calendar, Sparkles, Send, Star, X, Briefcase, ChevronRight } from 'lucide-react';
import apiService from './services/api';

const HamoPro = () => {
  const APP_VERSION = "1.4.7";

  // Hamo Logo SVG Component (Light theme, no text)
  const HamoLogo = ({ size = 40, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 512 512" className={className}>
      <defs>
        <mask id="hamo-smile-mask">
          <rect x="0" y="0" width="512" height="512" fill="white"/>
          <rect x="226" y="375" width="8" height="80" fill="black"/>
          <rect x="280" y="375" width="8" height="80" fill="black"/>
        </mask>
      </defs>
      {/* H: eyes (dot 1,2) */}
      <circle cx="192" cy="125" r="40" fill="#002D72"/>
      <circle cx="320" cy="125" r="40" fill="#002D72"/>
      {/* A: nose dot */}
      <circle cx="256" cy="205" r="12" fill="#002D72"/>
      {/* H: ear dots (dot 3,4) + A: dash */}
      <circle cx="88" cy="260" r="22" fill="#002D72"/>
      <rect x="130" y="236" width="252" height="48" rx="14" fill="#002D72"/>
      <circle cx="424" cy="260" r="22" fill="#002D72"/>
      {/* M: 2 dashes */}
      <rect x="152" y="318" width="96" height="40" rx="12" fill="#3572C6"/>
      <rect x="264" y="318" width="96" height="40" rx="12" fill="#3572C6"/>
      {/* O: 3-segment smile */}
      <path d="M172,394 Q256,456 340,394 Z" fill="#74B3E8" mask="url(#hamo-smile-mask)"/>
    </svg>
  );

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
  const [conversationsData, setConversationsData] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
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
  const [editingAvatar, setEditingAvatar] = useState(null);
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
  const [clientForm, setClientForm] = useState({
    name: '',
    sex: '',
    age: '',
    avatarId: '',
    // Therapy Goal & Principles
    goals: '',
    therapyPrinciples: '',
    // Personality Traits
    personalityDimension1: '', // 'introverted' or 'extroverted'
    personalityDimension2: '', // 'rational' or 'emotional'
    personalityTraits: [], // Selected traits from the 3 blocks
    // Emotion Patterns
    emotionPattern: '',
    // Cognition & Beliefs
    cognition: '',
    // Relationship Manipulations
    relationshipManipulations: ''
  });

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

  // Open edit mode for an avatar
  const handleEditAvatar = (avatar) => {
    // Check if specialty is custom (not in the predefined list)
    const isCustomSpecialty = !specialtyOptions.includes(avatar.specialty);

    setAvatarForm({
      name: avatar.name || '',
      specialty: isCustomSpecialty ? 'custom' : (avatar.specialty || ''),
      customSpecialty: isCustomSpecialty ? avatar.specialty : '',
      therapeuticApproaches: avatar.therapeuticApproaches || [],
      customApproach: '',
      about: avatar.about || '',
      experienceYears: avatar.experienceYears || 0,
      experienceMonths: avatar.experienceMonths || 0,
    });
    setEditingAvatar(avatar);
    setSelectedAvatar(null);
  };

  // Update an existing avatar
  const handleUpdateAvatar = async () => {
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

    // Call API to update avatar
    const result = await apiService.updateAvatar(editingAvatar.id, {
      name: avatarForm.name,
      specialty: specialty,
      therapeutic_approaches: approaches,
      about: avatarForm.about,
      experience_years: avatarForm.experienceYears,
      experience_months: avatarForm.experienceMonths,
    });

    if (result.success) {
      // Update local state
      setAvatars(avatars.map(a => a.id === editingAvatar.id ? {
        ...a,
        name: avatarForm.name,
        specialty: specialty,
        therapeuticApproaches: approaches,
        about: avatarForm.about,
        experienceYears: avatarForm.experienceYears,
        experienceMonths: avatarForm.experienceMonths,
      } : a));
      console.log('✅ Avatar updated:', editingAvatar.id);
    } else {
      console.warn('⚠️ API failed to update avatar:', result.error);
      // Still update local state for better UX
      setAvatars(avatars.map(a => a.id === editingAvatar.id ? {
        ...a,
        name: avatarForm.name,
        specialty: specialty,
        therapeuticApproaches: approaches,
        about: avatarForm.about,
        experienceYears: avatarForm.experienceYears,
        experienceMonths: avatarForm.experienceMonths,
      } : a));
    }

    // Reset form and close edit mode
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
    setEditingAvatar(null);
  };

  // Get personality traits based on dimension selections
  const getPersonalityTraitOptions = () => {
    const d1 = clientForm.personalityDimension1;
    const d2 = clientForm.personalityDimension2;

    if (d1 === 'introverted' && d2 === 'rational') {
      return {
        orange: ['Respectful', 'Logical / Fact-based', 'Cautious / Prudent'],
        gray: ['Avoidant', 'Passive', 'Disengaged'],
        red: ['Procrastinating', 'Over-deliberating', 'Decision-blocked']
      };
    } else if (d1 === 'introverted' && d2 === 'emotional') {
      return {
        orange: ['Supportive', 'Trusting', 'Cooperative'],
        gray: ['Compliant', 'People-pleasing', 'Self-erasing'],
        red: ['Withdrawn', 'Self-neglecting', 'Emotionally flat']
      };
    } else if (d1 === 'extroverted' && d2 === 'rational') {
      return {
        orange: ['Decisive', 'Controlling', 'Challenge-oriented'],
        gray: ['Domineering', 'Confrontational', 'Impatient'],
        red: ['Aggressive', 'Reckless', 'Hyper-controlling']
      };
    } else if (d1 === 'extroverted' && d2 === 'emotional') {
      return {
        orange: ['Expressive', 'Inspiring', 'Enthusiastic'],
        gray: ['Suspicious', 'Dramatizing', 'Attention-seeking'],
        red: ['Narcissistic', 'Entitled', 'Exploitative']
      };
    }
    return null;
  };

  // Toggle personality trait selection
  const togglePersonalityTrait = (trait) => {
    const currentTraits = clientForm.personalityTraits;
    if (currentTraits.includes(trait)) {
      setClientForm({
        ...clientForm,
        personalityTraits: currentTraits.filter(t => t !== trait)
      });
    } else if (currentTraits.length < 6) {
      setClientForm({
        ...clientForm,
        personalityTraits: [...currentTraits, trait]
      });
    }
  };

  const handleCreateClient = async () => {
    if (clientForm.name && clientForm.avatarId) {
      // Build personality string from selections
      const personalityString = [
        clientForm.personalityDimension1,
        clientForm.personalityDimension2,
        ...clientForm.personalityTraits
      ].filter(Boolean).join(', ');

      // Call API to create AI Mind (client profile)
      const result = await apiService.createMind({
        avatarId: clientForm.avatarId,
        name: clientForm.name,
        sex: clientForm.sex,
        age: clientForm.age,
        emotionPattern: clientForm.emotionPattern,
        personality: personalityString,
        cognition: clientForm.cognition,
        goals: clientForm.goals,
        therapyPrinciples: clientForm.therapyPrinciples,
        relationshipManipulations: clientForm.relationshipManipulations,
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
        // Show error message - DO NOT create fake clients
        alert(`Failed to create AI Mind:\n${result.error}\n\nPlease check:\n1. Backend API is running\n2. Avatar exists and belongs to you\n3. You are logged in as a therapist`);
        console.error('❌ AI Mind creation failed:', result.error);
      }

      setClientForm({
        name: '',
        sex: '',
        age: '',
        avatarId: '',
        goals: '',
        therapyPrinciples: '',
        personalityDimension1: '',
        personalityDimension2: '',
        personalityTraits: [],
        emotionPattern: '',
        cognition: '',
        relationshipManipulations: ''
      });
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
      } else {
        // Show error message to user
        alert(`Failed to generate invitation code:\n${result.error}\n\nPlease check:\n1. Backend API is running\n2. AI Mind exists in database\n3. You are logged in as the correct therapist`);
        console.error('❌ Invitation generation failed:', result.error);
      }
    } catch (error) {
      alert(`Failed to generate invitation code:\n${error.message}\n\nPlease check your connection and try again.`);
      console.error('❌ Failed to generate invitation code:', error);
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
      const result = await apiService.getMind(client.id);
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
  const handleViewChats = async (client) => {
    // Close AI Mind panel if open
    setSelectedMindClient(null);
    setMindData(null);

    setSelectedClient(client);
    setConversationsLoading(true);
    setConversationsData([]);

    try {
      // Fetch sessions for this mind
      const sessionsResult = await apiService.getSessions(client.id);
      if (sessionsResult.success && sessionsResult.sessions.length > 0) {
        // Fetch messages for each session
        const conversationsWithMessages = await Promise.all(
          sessionsResult.sessions.map(async (session) => {
            const messagesResult = await apiService.getSessionMessages(session.id);
            return {
              sessionId: session.id,
              date: new Date(session.started_at || session.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              messages: messagesResult.success ? messagesResult.messages : []
            };
          })
        );
        setConversationsData(conversationsWithMessages);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  // Handle supervision submission for a specific section
  const handleSupervise = async (section) => {
    const feedback = supervisionInputs[section];
    if (!feedback.trim() || !selectedMindClient) return;

    setSupervisionLoading(prev => ({ ...prev, [section]: true }));

    try {
      const result = await apiService.submitSupervision(
        selectedMindClient.id,
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
              <HamoLogo size={72} />
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Hamo Pro</h1>
            <p className="text-center text-gray-500 mb-8 text-sm">Build Avatar Therapists with an AI Mind</p>
            
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
              <HamoLogo size={40} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hamo Pro</h1>
                <p className="text-sm text-gray-500">Build Avatar Therapists with an AI Mind</p>
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

      <div className="max-w-7xl mx-auto px-6 pb-24 pt-4">
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
                  <div className="p-6 pt-0 flex space-x-3">
                    <button
                      onClick={() => handleEditAvatar(selectedAvatar)}
                      className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                    >
                      Edit AI Avatar
                    </button>
                    <button
                      onClick={() => setSelectedAvatar(null)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Avatar Form Modal */}
            {editingAvatar && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-lg font-semibold">Edit AI Avatar</h3>
                      <button
                        onClick={() => {
                          setEditingAvatar(null);
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
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

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
                              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                avatarForm.therapeuticApproaches.includes(opt)
                                  ? 'bg-teal-500 text-white'
                                  : 'bg-white border border-teal-200 text-gray-700 hover:border-teal-400'
                              }`}
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
                          className="w-full px-4 py-2.5 border border-purple-200 rounded-lg bg-white h-24 resize-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all"
                          placeholder="Describe the avatar's expertise and approach..."
                        />
                        <p className={`text-xs mt-1 ${avatarForm.about.length > 250 ? 'text-orange-500' : 'text-gray-400'}`}>
                          {avatarForm.about.length}/280 characters
                        </p>
                      </div>

                      {/* Section 4: Experience - Yellow tint */}
                      <div className="bg-yellow-50/70 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Briefcase className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-yellow-700">Experience</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-yellow-600 mb-1">Years</label>
                            <select
                              value={avatarForm.experienceYears}
                              onChange={(e) => setAvatarForm({ ...avatarForm, experienceYears: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all"
                            >
                              {[...Array(51)].map((_, i) => <option key={i} value={i}>{i} years</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-yellow-600 mb-1">Months</label>
                            <select
                              value={avatarForm.experienceMonths}
                              onChange={(e) => setAvatarForm({ ...avatarForm, experienceMonths: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all"
                            >
                              {[...Array(12)].map((_, i) => <option key={i} value={i}>{i} months</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={handleUpdateAvatar}
                        className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditingAvatar(null);
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
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
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
                <h3 className="text-lg font-semibold mb-4">Initialize AI Mind for the Client</h3>

                {/* Section 1: Basic Information */}
                <div className="bg-blue-50 rounded-xl p-4 mb-4 border-l-4 border-blue-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Basic Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input type="text" value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder="Client name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                      <select value={clientForm.sex} onChange={(e) => setClientForm({ ...clientForm, sex: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <input type="number" value={clientForm.age} onChange={(e) => setClientForm({ ...clientForm, age: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder="Age" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
                      <select value={clientForm.avatarId} onChange={(e) => setClientForm({ ...clientForm, avatarId: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white">
                        <option value="">Select Avatar</option>
                        {avatars.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Therapy Goal & Principles */}
                <div className="bg-teal-50 rounded-xl p-4 mb-4 border-l-4 border-teal-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <Star className="w-5 h-5 text-teal-600" />
                    <h4 className="font-semibold text-teal-800">Therapy Goal & Principles</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Therapy Goals</label>
                      <textarea value={clientForm.goals} onChange={(e) => setClientForm({ ...clientForm, goals: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" rows="2" placeholder="e.g., Reduce anxiety and depression, improve vitality..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Therapy Principles</label>
                      <textarea value={clientForm.therapyPrinciples} onChange={(e) => setClientForm({ ...clientForm, therapyPrinciples: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" rows="2" placeholder="e.g., Be kind, empathy first, less suggestion..." />
                    </div>
                  </div>
                </div>

                {/* Section 3: Personality Traits - Key Section */}
                <div className="bg-purple-50 rounded-xl p-4 mb-4 border-l-4 border-purple-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-800">Personality Traits</h4>
                    <span className="text-xs text-purple-500">(Select dimensions first)</span>
                  </div>

                  {/* Dimension Selection */}
                  <div className="mb-4">
                    {/* Dimension 1: Introverted vs Extroverted */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Social Orientation</label>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setClientForm({ ...clientForm, personalityDimension1: 'introverted', personalityTraits: [] })}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                            clientForm.personalityDimension1 === 'introverted'
                              ? 'border-purple-500 bg-purple-100 text-purple-700 font-medium'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                          }`}
                        >
                          Introverted
                        </button>
                        <button
                          type="button"
                          onClick={() => setClientForm({ ...clientForm, personalityDimension1: 'extroverted', personalityTraits: [] })}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                            clientForm.personalityDimension1 === 'extroverted'
                              ? 'border-purple-500 bg-purple-100 text-purple-700 font-medium'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                          }`}
                        >
                          Extroverted
                        </button>
                      </div>
                    </div>

                    {/* Dimension 2: Rational vs Emotional */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Decision Style</label>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setClientForm({ ...clientForm, personalityDimension2: 'rational', personalityTraits: [] })}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                            clientForm.personalityDimension2 === 'rational'
                              ? 'border-purple-500 bg-purple-100 text-purple-700 font-medium'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                          }`}
                        >
                          Rational
                        </button>
                        <button
                          type="button"
                          onClick={() => setClientForm({ ...clientForm, personalityDimension2: 'emotional', personalityTraits: [] })}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                            clientForm.personalityDimension2 === 'emotional'
                              ? 'border-purple-500 bg-purple-100 text-purple-700 font-medium'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                          }`}
                        >
                          Emotional
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Trait Selection - Only show when both dimensions are selected */}
                  {getPersonalityTraitOptions() && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">Select Traits (1-6)</label>
                        <span className="text-xs text-purple-500">{clientForm.personalityTraits.length}/6 selected</span>
                      </div>

                      {/* Orange Block - Adaptive */}
                      <div className="bg-orange-50 rounded-lg p-3 mb-3">
                        <p className="text-xs text-orange-600 font-medium mb-2">Adaptive Traits</p>
                        <div className="flex flex-wrap gap-2">
                          {getPersonalityTraitOptions().orange.map(trait => (
                            <button
                              key={trait}
                              type="button"
                              onClick={() => togglePersonalityTrait(trait)}
                              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                clientForm.personalityTraits.includes(trait)
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-white border border-orange-300 text-orange-700 hover:bg-orange-100'
                              }`}
                            >
                              {trait}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Gray Block - Maladaptive Mild */}
                      <div className="bg-gray-100 rounded-lg p-3 mb-3">
                        <p className="text-xs text-gray-600 font-medium mb-2">Mild Maladaptive</p>
                        <div className="flex flex-wrap gap-2">
                          {getPersonalityTraitOptions().gray.map(trait => (
                            <button
                              key={trait}
                              type="button"
                              onClick={() => togglePersonalityTrait(trait)}
                              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                clientForm.personalityTraits.includes(trait)
                                  ? 'bg-gray-600 text-white'
                                  : 'bg-white border border-gray-400 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {trait}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Red Block - Maladaptive Severe */}
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-xs text-red-600 font-medium mb-2">Severe Maladaptive</p>
                        <div className="flex flex-wrap gap-2">
                          {getPersonalityTraitOptions().red.map(trait => (
                            <button
                              key={trait}
                              type="button"
                              onClick={() => togglePersonalityTrait(trait)}
                              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                clientForm.personalityTraits.includes(trait)
                                  ? 'bg-red-500 text-white'
                                  : 'bg-white border border-red-300 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {trait}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Emotion Patterns */}
                <div className="bg-yellow-50 rounded-xl p-4 mb-4 border-l-4 border-yellow-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">Emotion Patterns</h4>
                  </div>
                  <textarea
                    value={clientForm.emotionPattern}
                    onChange={(e) => setClientForm({ ...clientForm, emotionPattern: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white"
                    rows="2"
                    placeholder="e.g., Tends toward anxiety in social situations, difficulty expressing anger..."
                  />
                </div>

                {/* Section 5: Cognition & Beliefs */}
                <div className="bg-indigo-50 rounded-xl p-4 mb-4 border-l-4 border-indigo-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold text-indigo-800">Cognition & Beliefs</h4>
                  </div>
                  <textarea
                    value={clientForm.cognition}
                    onChange={(e) => setClientForm({ ...clientForm, cognition: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white"
                    rows="2"
                    placeholder="e.g., 'If I perform well, disaster will come to me', black-and-white thinking..."
                  />
                </div>

                {/* Section 6: Relationship Manipulations */}
                <div className="bg-rose-50 rounded-xl p-4 mb-4 border-l-4 border-rose-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-5 h-5 text-rose-600" />
                    <h4 className="font-semibold text-rose-800">Relationship Manipulations</h4>
                  </div>
                  <textarea
                    value={clientForm.relationshipManipulations}
                    onChange={(e) => setClientForm({ ...clientForm, relationshipManipulations: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white"
                    rows="2"
                    placeholder="e.g., Tends to use guilt to control others, avoids conflict at all costs..."
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button onClick={handleCreateClient} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">Initialize</button>
                  <button onClick={() => setShowClientForm(false)} className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clients.map(c => {
                const avatar = avatars.find(a => a.id === parseInt(c.avatarId) || a.id === c.avatarId);
                const isConnected = c.connectedAt || c.connected_at;
                // Connection date now formatted inline in English
                return (
                  <div key={c.id} className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                    <div className="flex justify-between mb-3">
                      <div><h3 className="font-semibold">{c.name}</h3><p className="text-sm text-gray-500">{c.sex}, {c.age} years</p></div>
                      {isConnected ? (
                        <div className="flex flex-col items-center text-green-500 flex-shrink-0">
                          <Calendar className="w-5 h-5" />
                          <span className="text-xs mt-1">{new Date(isConnected).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="text-xs text-green-600 font-medium">Connected</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateInvitation(c)}
                          disabled={invitationLoading}
                          className="flex flex-col items-center text-blue-500 hover:text-blue-600 disabled:opacity-50 flex-shrink-0"
                        >
                          <Ticket className="w-5 h-5" />
                          <span className="text-xs mt-1">邀请码</span>
                        </button>
                      )}
                    </div>
                    <p className="text-sm mb-2"><span className="font-medium">Avatar:</span> {avatar?.name || '未分配'}</p>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1"><MessageSquare className="w-4 h-4" /><span>{c.sessions} sessions</span></div>
                      <div className="flex items-center space-x-1"><Clock className="w-4 h-4" /><span>{c.avgTime} min avg</span></div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleViewMind(c)} className="flex-1 bg-purple-50 text-purple-600 px-2 sm:px-3 py-2 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 hover:bg-purple-100"><Sparkles className="w-4 h-4 flex-shrink-0" /><span className="text-xs sm:text-sm whitespace-nowrap">AI Mind</span></button>
                      <button onClick={() => handleViewChats(c)} className="flex-1 bg-blue-50 text-blue-600 px-2 sm:px-3 py-2 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 hover:bg-blue-100"><Eye className="w-4 h-4 flex-shrink-0" /><span className="text-xs sm:text-sm whitespace-nowrap">View Chats</span></button>
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
                            {mindData.name?.charAt(0) || selectedMindClient?.name?.charAt(0) || ''}
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
                      {/* Goals & Therapy Principles Section - Moved to top */}
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
                              <h4 className="text-white font-bold text-lg">Goals & Principles</h4>
                              <p className="text-white/90 text-sm mt-1 line-clamp-1">
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
                              <h4 className="text-white font-bold text-lg">Emotion Patterns</h4>
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
                    {conversationsLoading ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p>Loading conversations...</p>
                      </div>
                    ) : conversationsData && conversationsData.length > 0 ? (
                      conversationsData.map((conv, i) => (
                        <div key={i} className="border-l-4 border-blue-500 pl-4 mb-6">
                          <p className="text-sm font-medium text-gray-500 mb-3">{conv.date}</p>
                          {conv.messages && conv.messages.length > 0 ? (
                            conv.messages.map((msg, j) => (
                              <div key={j} className={`p-3 rounded-lg mb-2 ${msg.role === 'user' ? 'bg-gray-100' : 'bg-blue-50'}`}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs font-medium">{msg.role === 'user' ? 'Client' : 'Avatar'}</span>
                                  <span className="text-xs text-gray-400">
                                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </span>
                                </div>
                                <p className="text-sm">{msg.content}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400 italic">No messages in this session</p>
                          )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map(c => (
                  <div key={c.id} className="bg-white rounded-xl shadow-md p-5">
                    <h3 className="font-semibold text-lg mb-4 text-center">{c.name}</h3>
                    <div className="flex justify-around items-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{c.sessions}</p>
                        <p className="text-xs text-gray-500 mt-1">Sessions</p>
                      </div>
                      <div className="w-px h-12 bg-gray-200"></div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{c.avgTime}<span className="text-lg ml-1">min</span></p>
                        <p className="text-xs text-gray-500 mt-1">Avg Time</p>
                      </div>
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

        {/* Version number at the bottom of scrollable content */}
        <div className="text-center py-6">
          <p className="text-xs text-gray-400">Hamo Pro Version {APP_VERSION}</p>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto flex justify-around items-center py-3 pb-6">
          <button
            onClick={() => setActiveTab('avatars')}
            className={`flex flex-col items-center justify-center py-2 px-6 ${activeTab === 'avatars' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <Brain className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">AI Avatars</span>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex flex-col items-center justify-center py-2 px-6 ${activeTab === 'clients' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Clients</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-2 px-6 ${activeTab === 'dashboard' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Dashboard</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default HamoPro;