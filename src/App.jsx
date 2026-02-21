import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Brain, Settings, Plus, Ticket, Eye, EyeOff, Clock, MessageSquare, LogOut, Trash2, Download, CheckCircle, Calendar, Sparkles, Send, Star, X, Briefcase, ChevronRight, ChevronDown, ChevronUp, Globe, Upload, RefreshCw, ArrowDown, Edit3, Save } from 'lucide-react';
import apiService from './services/api';
import { translations } from './i18n/translations';

const HamoPro = () => {
  const APP_VERSION = "1.5.18";

  // Language state - default to browser language or English
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('hamo_pro_language');
    if (saved) return saved;
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('zh') ? 'zh' : 'en';
  });

  // Translation helper function
  const t = useCallback((key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  }, [language]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('hamo_pro_language', language);
  }, [language]);

  // Language toggle component
  const LanguageToggle = ({ className = "" }) => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Globe className="w-4 h-4 text-gray-500" />
      <div className="flex bg-gray-100 rounded-lg p-0.5">
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            language === 'en'
              ? 'bg-white text-blue-600 shadow-sm font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('zh')}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            language === 'zh'
              ? 'bg-white text-blue-600 shadow-sm font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          中文
        </button>
      </div>
    </div>
  );

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
    { value: 'mental_health_professional', label: t('mentalHealthProfessional') },
    { value: 'astrologer', label: t('astrologer'), disabled: true },
  ];

  // Helper function to get profession label
  const getProfessionLabel = (value) => {
    const option = professionOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const [specialtiesMap, setSpecialtiesMap] = useState([]); // From GET /api/specialties

  // Avatar form options - use backend specialties if available, with local fallback
  const getSpecialtyOptions = useCallback(() => {
    if (specialtiesMap.length > 0) {
      return specialtiesMap.map(s => ({
        value: s.id,
        label: language === 'zh' ? s.zh : s.en,
      }));
    }
    // Fallback to local translations
    return [
      { value: 'depression_anxiety', label: t('depressionAnxiety') },
      { value: 'npd_personality', label: t('npdPersonality') },
      { value: 'family_couples', label: t('familyCouples') },
      { value: 'child_adolescent', label: t('childAdolescent') },
      { value: 'stress_burnout', label: t('stressBurnout') },
      { value: 'ptsd_trauma', label: t('ptsdTrauma') },
      { value: 'substance_abuse', label: t('substanceAbuse') },
      { value: 'ocd_anxiety', label: t('ocdAnxiety') }
    ];
  }, [specialtiesMap, language, t]);

  const getTherapeuticApproachOptions = useCallback(() => [
    { value: 'cbt', label: t('cbt') },
    { value: 'dbt', label: t('dbt') },
    { value: 'family_systems', label: t('familySystems') },
    { value: 'play_therapy', label: t('playTherapy') },
    { value: 'mindfulness', label: t('mindfulness') },
    { value: 'trauma_focused', label: t('traumaFocused') },
    { value: 'addiction_recovery', label: t('addictionRecovery') },
    { value: 'act', label: t('act') }
  ], [t]);

  // Helper function to get translated specialty label from value (ID or legacy name)
  const getSpecialtyLabel = useCallback((value) => {
    if (!value) return '';
    // First try backend specialties map
    if (specialtiesMap.length > 0) {
      const match = specialtiesMap.find(s => s.id === value);
      if (match) return language === 'zh' ? match.zh : match.en;
    }
    // Fallback to local options
    const options = getSpecialtyOptions();
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value; // Return original value if not found (for custom or legacy)
  }, [specialtiesMap, language, getSpecialtyOptions]);

  // Helper function to get translated therapeutic approach label from value
  const getApproachLabel = useCallback((value) => {
    if (!value) return '';
    const options = getTherapeuticApproachOptions();
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value; // Return original value if not found (for custom or legacy)
  }, [getTherapeuticApproachOptions]);

  // Legacy options for backward compatibility
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
  const [profileForm, setProfileForm] = useState({ full_name: '', sex: '', age: '', currentPassword: '', newPassword: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
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
  const [currentPsvs, setCurrentPsvs] = useState(null); // Track current PSVS indicators for status bar
  const [psvsTrajectory, setPsvsTrajectory] = useState([]); // Full PSVS trajectory history for chart
  const [messageRefs, setMessageRefs] = useState({}); // Store refs for each message
  const chatScrollRef = useRef(null); // Ref for the scrollable chat container
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false); // Auto-refresh toggle (default off)
  const [hasNewMessages, setHasNewMessages] = useState(false); // Show "new messages" indicator
  const lastMessageCountRef = useRef(0); // Track message count for detecting new messages
  const [showStressDetail, setShowStressDetail] = useState(false); // Toggle stress detail panel
  const [stressIndicatorsData, setStressIndicatorsData] = useState(null); // A/W/E/H/B from portal API
  const [expandedMiniSessions, setExpandedMiniSessions] = useState(new Set()); // Track which mini sessions are expanded
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
  const [mindEditMode, setMindEditMode] = useState(false); // Toggle edit mode for AI Mind
  const [mindEditData, setMindEditData] = useState(null); // Editable copy of mind data
  const [mindSaving, setMindSaving] = useState(false);
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
    emotion_pattern: { dominant_emotions: '', triggers: '', coping_mechanisms: '' },
    // Cognition & Beliefs
    cognition_beliefs: { core_beliefs: '', cognitive_distortions: '', thinking_patterns: '', self_perception: '', world_perception: '', future_perception: '' },
    // Relationship Manipulations
    relationship_manipulations: { attachment_style: '', relationship_patterns: '', communication_style: '', conflict_resolution: '' }
  });

  // Load avatars and clients from backend
  const loadUserData = async () => {
    console.log('🔵 Loading user data...');

    // Load avatars, clients, and specialties in parallel
    const [avatarsResult, clientsResult, specialtiesResult] = await Promise.all([
      apiService.getAvatars(),
      apiService.getClients(),
      apiService.getSpecialties(),
    ]);

    if (avatarsResult.success) {
      setAvatars(avatarsResult.avatars);
      console.log('✅ Loaded avatars:', avatarsResult.avatars.length);
    }

    if (clientsResult.success) {
      setClients(clientsResult.clients);
      console.log('✅ Loaded clients:', clientsResult.clients.length);
    }

    if (specialtiesResult.success && specialtiesResult.specialties.length > 0) {
      setSpecialtiesMap(specialtiesResult.specialties);
      console.log('✅ Loaded specialties:', specialtiesResult.specialties.length);
    }
  };

  // Check authentication on mount and load data
  useEffect(() => {
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        setIsAuthenticated(true);
        // Fetch current user profile
        const profileResult = await apiService.getProProfile();
        if (profileResult.success) {
          setCurrentUser(profileResult.user);
        }
        // Load user data after confirming authentication
        await loadUserData();
      }
    };
    checkAuth();
  }, []);

  // Sync profileForm when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm(prev => ({
        ...prev,
        full_name: currentUser.full_name || currentUser.fullName || '',
        sex: currentUser.sex || '',
        age: currentUser.age || '',
        currentPassword: '',
        newPassword: '',
      }));
    }
  }, [currentUser]);

  // Refresh data function for conversations and PSVS
  const refreshConversationsData = useCallback(async (isPolling = false) => {
    if (!selectedClient) return;

    try {
      // Fetch updated PSVS
      const psvsResult = await apiService.getPsvsProfile(selectedClient.id);
      if (psvsResult.success && psvsResult.psvs?.current_position) {
        const pos = psvsResult.psvs.current_position;
        setCurrentPsvs(prev => ({
          stress_level: pos.stress_level,
          energy_state: pos.energy_state,
          distance_from_center: pos.distance_from_center || pos.distance,
          messageId: prev?.messageId || null // Preserve messageId if set
        }));
        // Update trajectory history for chart
        if (psvsResult.psvs.recent_trajectory) {
          setPsvsTrajectory(psvsResult.psvs.recent_trajectory);
        }
      }

      // Fetch updated sessions
      const sessionsResult = await apiService.getSessions(selectedClient.id);
      if (sessionsResult.success && sessionsResult.sessions.length > 0) {
        const conversationsWithMessages = await Promise.all(
          sessionsResult.sessions.map(async (session) => {
            const proVisible = session.pro_visible !== false;
            let messages = [];
            let miniSessions = [];
            if (proVisible) {
              const [messagesResult, miniSessionsResult] = await Promise.all([
                apiService.getSessionMessages(session.id),
                apiService.getMiniSessions(session.id)
              ]);
              messages = messagesResult.success ? messagesResult.messages : [];
              miniSessions = miniSessionsResult.success ? miniSessionsResult.miniSessions : [];
            }

            miniSessions.sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));

            const miniSessionGroups = [];
            if (miniSessions.length > 0) {
              for (const ms of miniSessions) {
                const msMessages = messages.filter(m => m.mini_session_id === ms.id);
                const userMsgCount = msMessages.filter(m => m.role === 'user').length;
                miniSessionGroups.push({
                  miniSessionId: ms.id,
                  startedAt: ms.startedAt,
                  endedAt: ms.endedAt,
                  isActive: ms.isActive,
                  messageCount: userMsgCount,
                  messages: msMessages,
                });
              }
              const orphanMsgs = messages.filter(m => !m.mini_session_id);
              if (orphanMsgs.length > 0) {
                miniSessionGroups.unshift({
                  miniSessionId: '__orphan__',
                  startedAt: session.started_at || session.created_at,
                  endedAt: null,
                  isActive: false,
                  messageCount: orphanMsgs.filter(m => m.role === 'user').length,
                  messages: orphanMsgs,
                });
              }
            } else {
              if (messages.length > 0) {
                miniSessionGroups.push({
                  miniSessionId: '__legacy__',
                  startedAt: session.started_at || session.created_at,
                  endedAt: null,
                  isActive: false,
                  messageCount: messages.filter(m => m.role === 'user').length,
                  messages: messages,
                });
              }
            }

            return {
              sessionId: session.id,
              date: new Date(session.started_at || session.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              messages,
              miniSessionGroups,
              proVisible
            };
          })
        );

        // Count total messages
        const newMessageCount = conversationsWithMessages.reduce((total, conv) => total + (conv.messages?.length || 0), 0);

        // If this is a polling refresh and message count increased, show new message indicator
        if (isPolling && newMessageCount > lastMessageCountRef.current && lastMessageCountRef.current > 0) {
          setHasNewMessages(true);
          // Auto-expand the latest mini session when new messages arrive
          for (const conv of conversationsWithMessages) {
            if (conv.miniSessionGroups && conv.miniSessionGroups.length > 0 && conv.proVisible !== false) {
              const lastGroup = conv.miniSessionGroups[conv.miniSessionGroups.length - 1];
              setExpandedMiniSessions(prev => new Set([...prev, lastGroup.miniSessionId]));
            }
          }
        }

        // Update the message count reference
        lastMessageCountRef.current = newMessageCount;

        setConversationsData(conversationsWithMessages);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [selectedClient]);

  // Initial load when dialog opens
  useEffect(() => {
    if (selectedClient) {
      // Reset states when opening dialog
      lastMessageCountRef.current = 0;
      setHasNewMessages(false);
      setAutoRefreshEnabled(false); // Default to off
      refreshConversationsData(false);
    }
  }, [selectedClient, refreshConversationsData]);

  // Auto-refresh polling (only when enabled)
  useEffect(() => {
    if (!selectedClient || !autoRefreshEnabled) return;

    // Set up polling interval (every 3 seconds)
    const intervalId = setInterval(() => refreshConversationsData(true), 3000);

    // Cleanup on unmount or when disabled
    return () => clearInterval(intervalId);
  }, [selectedClient, autoRefreshEnabled, refreshConversationsData]);

  // Scroll to bottom and clear new message indicator
  const scrollToLatestMessage = useCallback(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      setHasNewMessages(false);
    }
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

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMessage('');
    try {
      const data = {};
      if (profileForm.full_name) data.full_name = profileForm.full_name;
      if (profileForm.sex) data.sex = profileForm.sex;
      if (profileForm.age) data.age = parseInt(profileForm.age);
      if (profileForm.newPassword) {
        data.current_password = profileForm.currentPassword;
        data.new_password = profileForm.newPassword;
      }
      const result = await apiService.updateProProfile(data);
      if (result.success) {
        setCurrentUser(prev => ({ ...prev, ...result.user }));
        setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        setProfileMessage('success');
        setTimeout(() => setProfileMessage(''), 3000);
      } else {
        setProfileMessage(result.error || 'Failed to save');
      }
    } catch (error) {
      setProfileMessage('Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
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
    // Check both new ID-format values and legacy English name values
    const knownSpecialtyIds = getSpecialtyOptions().map(opt => opt.value);
    const isCustomSpecialty = avatar.specialty && !knownSpecialtyIds.includes(avatar.specialty) && !specialtyOptions.includes(avatar.specialty);

    setAvatarForm({
      name: avatar.name || '',
      specialty: isCustomSpecialty ? 'custom' : (avatar.specialty || ''),
      customSpecialty: isCustomSpecialty ? avatar.specialty : '',
      therapeuticApproaches: Array.isArray(avatar.therapeuticApproaches)
        ? avatar.therapeuticApproaches
        : (avatar.therapeuticApproaches ? String(avatar.therapeuticApproaches).split(',').map(s => s.trim()) : []),
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

  // Translate a personality trait ID to display label
  const translateTrait = (traitId) => {
    const key = `trait_${traitId}`;
    return t(key) || traitId;
  };

  // Parse primary_traits array to extract dimensions and trait selections
  const parsePrimaryTraits = (primaryTraits) => {
    const DIMENSION1_VALUES = ['introverted', 'extroverted'];
    const DIMENSION2_VALUES = ['rational', 'emotional'];
    let dimension1 = '';
    let dimension2 = '';
    const traits = [];
    for (const item of (primaryTraits || [])) {
      if (DIMENSION1_VALUES.includes(item)) {
        dimension1 = item;
      } else if (DIMENSION2_VALUES.includes(item)) {
        dimension2 = item;
      } else {
        traits.push(item);
      }
    }
    return { dimension1, dimension2, traits };
  };

  // Get personality traits based on dimension selections
  const getPersonalityTraitOptions = (d1Override, d2Override) => {
    const d1 = d1Override !== undefined ? d1Override : clientForm.personalityDimension1;
    const d2 = d2Override !== undefined ? d2Override : clientForm.personalityDimension2;

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

  // Toggle personality trait selection in edit mode
  const toggleEditPersonalityTrait = (trait) => {
    const currentTraits = mindEditData?.personality?.personalityTraits || [];
    if (currentTraits.includes(trait)) {
      setMindEditData(prev => ({
        ...prev,
        personality: { ...prev.personality, personalityTraits: currentTraits.filter(t => t !== trait) }
      }));
    } else if (currentTraits.length < 6) {
      setMindEditData(prev => ({
        ...prev,
        personality: { ...prev.personality, personalityTraits: [...currentTraits, trait] }
      }));
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
        personality: personalityString,
        goals: clientForm.goals,
        therapyPrinciples: clientForm.therapyPrinciples,
        emotion_pattern: clientForm.emotion_pattern,
        cognition_beliefs: clientForm.cognition_beliefs,
        relationship_manipulations: clientForm.relationship_manipulations,
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
        emotion_pattern: { dominant_emotions: '', triggers: '', coping_mechanisms: '' },
        cognition_beliefs: { core_beliefs: '', cognitive_distortions: '', thinking_patterns: '', self_perception: '', world_perception: '', future_perception: '' },
        relationship_manipulations: { attachment_style: '', relationship_patterns: '', communication_style: '', conflict_resolution: '' }
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
        // Sync client card with fresh backend data (name/sex/age may have been updated by Discover user)
        setClients(prev => prev.map(c =>
          c.id === client.id
            ? { ...c, name: result.mind.name || c.name, sex: result.mind.sex ?? c.sex, age: result.mind.age ?? c.age }
            : c
        ));
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

  // Enter AI Mind edit mode
  const enterMindEditMode = () => {
    if (!mindData) return;
    setMindEditData({
      goals: mindData.goals || '',
      therapy_principles: mindData.therapy_principles || '',
      personality: (() => {
        const parsed = parsePrimaryTraits(mindData.personality?.primary_traits);
        return {
          primary_traits: mindData.personality?.primary_traits || [],
          description: mindData.personality?.description || '',
          personalityDimension1: parsed.dimension1,
          personalityDimension2: parsed.dimension2,
          personalityTraits: parsed.traits,
        };
      })(),
      emotion_pattern: {
        dominant_emotions: mindData.emotion_pattern?.dominant_emotions || [],
        triggers: mindData.emotion_pattern?.triggers || [],
        coping_mechanisms: mindData.emotion_pattern?.coping_mechanisms || [],
        description: mindData.emotion_pattern?.description || '',
      },
      cognition_beliefs: {
        core_beliefs: mindData.cognition_beliefs?.core_beliefs || [],
        cognitive_distortions: mindData.cognition_beliefs?.cognitive_distortions || [],
        thinking_patterns: mindData.cognition_beliefs?.thinking_patterns || [],
        self_perception: mindData.cognition_beliefs?.self_perception || '',
        world_perception: mindData.cognition_beliefs?.world_perception || '',
        future_perception: mindData.cognition_beliefs?.future_perception || '',
      },
      relationship_manipulations: {
        attachment_style: mindData.relationship_manipulations?.attachment_style || '',
        relationship_patterns: mindData.relationship_manipulations?.relationship_patterns || [],
        communication_style: mindData.relationship_manipulations?.communication_style || '',
        conflict_resolution: mindData.relationship_manipulations?.conflict_resolution || '',
      },
    });
    setMindEditMode(true);
  };

  // Save AI Mind edits
  const saveMindEdits = async () => {
    if (!selectedMindClient || !mindEditData) return;
    setMindSaving(true);
    try {
      // Reconstruct primary_traits from dimension + trait selections
      const saveData = {
        ...mindEditData,
        personality: {
          primary_traits: [
            mindEditData.personality?.personalityDimension1,
            mindEditData.personality?.personalityDimension2,
            ...(mindEditData.personality?.personalityTraits || [])
          ].filter(Boolean),
          description: mindEditData.personality?.description || '',
        }
      };
      const result = await apiService.updateMind(selectedMindClient.id, saveData);
      if (result.success) {
        setMindData(result.mind);
        setMindEditMode(false);
        setMindEditData(null);
      } else {
        alert(result.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save AI Mind:', error);
      alert('Failed to save');
    } finally {
      setMindSaving(false);
    }
  };

  // Helper: update array field in mindEditData (comma-separated input)
  const updateMindEditArray = (section, field, value) => {
    const arr = value.split(',').map(s => s.trim()).filter(Boolean);
    setMindEditData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: arr }
    }));
  };

  // Helper: update string field in mindEditData
  const updateMindEditString = (section, field, value) => {
    if (section) {
      setMindEditData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setMindEditData(prev => ({ ...prev, [field]: value }));
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
    setCurrentPsvs(null);
    setPsvsTrajectory([]);
    setExpandedMiniSessions(new Set());

    try {
      // Fetch sessions, PSVS profile, and portal messages (for A/W/E/H/B) in parallel
      const [sessionsResult, psvsResult, portalResult] = await Promise.all([
        apiService.getSessions(client.id),
        apiService.getPsvsProfile(client.id),
        apiService.getPortalMessages(client.id)
      ]);

      // Extract last A/W/E/H/B indicators from portal messages
      if (portalResult.success && portalResult.sessions) {
        let lastIndicators = null;
        const sessions = Array.isArray(portalResult.sessions) ? portalResult.sessions : [];
        for (const session of sessions) {
          const userMsgs = (session.messages || []).filter(m => m.role === 'user' && m.stress_indicators);
          if (userMsgs.length > 0) {
            lastIndicators = userMsgs[userMsgs.length - 1].stress_indicators;
          }
        }
        setStressIndicatorsData(lastIndicators);
      }

      // Set PSVS from the dedicated API (always available regardless of pro_visible)
      if (psvsResult.success && psvsResult.psvs?.current_position) {
        const pos = psvsResult.psvs.current_position;
        setCurrentPsvs({
          stress_level: pos.stress_level,
          energy_state: pos.energy_state,
          distance_from_center: pos.distance_from_center || pos.distance,
          messageId: null
        });
        // Store trajectory history for chart
        if (psvsResult.psvs.recent_trajectory) {
          setPsvsTrajectory(psvsResult.psvs.recent_trajectory);
        }
      }

      if (sessionsResult.success && sessionsResult.sessions.length > 0) {
        // Fetch messages and mini sessions for each session
        const conversationsWithMessages = await Promise.all(
          sessionsResult.sessions.map(async (session) => {
            const proVisible = session.pro_visible !== false;
            let messages = [];
            let miniSessions = [];
            if (proVisible) {
              const [messagesResult, miniSessionsResult] = await Promise.all([
                apiService.getSessionMessages(session.id),
                apiService.getMiniSessions(session.id)
              ]);
              messages = messagesResult.success ? messagesResult.messages : [];
              miniSessions = miniSessionsResult.success ? miniSessionsResult.miniSessions : [];
            }

            // Sort mini sessions by startedAt (oldest first)
            miniSessions.sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));

            // Group messages by mini_session_id
            const miniSessionGroups = [];
            if (miniSessions.length > 0) {
              for (const ms of miniSessions) {
                const msMessages = messages.filter(m => m.mini_session_id === ms.id);
                const userMsgCount = msMessages.filter(m => m.role === 'user').length;
                miniSessionGroups.push({
                  miniSessionId: ms.id,
                  startedAt: ms.startedAt,
                  endedAt: ms.endedAt,
                  isActive: ms.isActive,
                  messageCount: userMsgCount,
                  messages: msMessages,
                });
              }
              // Also collect orphan messages (no mini_session_id) — older messages before mini session feature
              const orphanMsgs = messages.filter(m => !m.mini_session_id);
              if (orphanMsgs.length > 0) {
                miniSessionGroups.unshift({
                  miniSessionId: '__orphan__',
                  startedAt: session.started_at || session.created_at,
                  endedAt: null,
                  isActive: false,
                  messageCount: orphanMsgs.filter(m => m.role === 'user').length,
                  messages: orphanMsgs,
                });
              }
            } else {
              // No mini sessions — show all messages as one group (legacy)
              if (messages.length > 0) {
                miniSessionGroups.push({
                  miniSessionId: '__legacy__',
                  startedAt: session.started_at || session.created_at,
                  endedAt: null,
                  isActive: false,
                  messageCount: messages.filter(m => m.role === 'user').length,
                  messages: messages,
                });
              }
            }

            return {
              sessionId: session.id,
              date: new Date(session.started_at || session.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              messages,
              miniSessionGroups,
              proVisible
            };
          })
        );
        setConversationsData(conversationsWithMessages);

        // Auto-expand only the latest mini session
        let latestMiniSessionId = null;
        for (const conv of conversationsWithMessages) {
          if (conv.miniSessionGroups && conv.miniSessionGroups.length > 0 && conv.proVisible !== false) {
            const lastGroup = conv.miniSessionGroups[conv.miniSessionGroups.length - 1];
            latestMiniSessionId = lastGroup.miniSessionId;
          }
        }
        if (latestMiniSessionId) {
          setExpandedMiniSessions(new Set([latestMiniSessionId]));
        }

        // Find the latest CLIENT message for PSVS highlighting
        let latestClientMessage = null;
        let latestTimestamp = 0;
        for (const conv of conversationsWithMessages) {
          if (conv.messages && conv.messages.length > 0 && conv.proVisible !== false) {
            for (const msg of conv.messages) {
              if (msg.role === 'user') {
                const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0;
                if (msgTime >= latestTimestamp) {
                  latestTimestamp = msgTime;
                  latestClientMessage = msg;
                }
              }
            }
          }
        }

        if (latestClientMessage) {
          const latestMsgId = String(latestClientMessage.id);
          // Only update messageId for highlighting, keep stress_level from PSVS API (current_position)
          // Message psvs_snapshot may be stale if Pro updated AI Mind after the message was sent
          setCurrentPsvs(prev => prev ? { ...prev, messageId: latestMsgId } : null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  // Toggle mini session expand/collapse and update PSVS status
  const toggleMiniSession = (miniSessionId, messages) => {
    setExpandedMiniSessions(prev => {
      const next = new Set(prev);
      if (next.has(miniSessionId)) {
        next.delete(miniSessionId);
      } else {
        next.add(miniSessionId);
        // When expanding, update PSVS to this mini session's last user message
        const userMsgs = (messages || []).filter(m => m.role === 'user');
        if (userMsgs.length > 0) {
          const lastUserMsg = userMsgs[userMsgs.length - 1];
          if (lastUserMsg.psvs_snapshot) {
            setCurrentPsvs({ ...lastUserMsg.psvs_snapshot, messageId: lastUserMsg.id });
          }
        }
      }
      return next;
    });
  };

  // Flag to skip scroll handler during initial auto-scroll
  const isInitialScrollRef = useRef(false);

  // Handle scroll to update PSVS based on visible messages
  // Only triggers on USER manual scroll, not on initial auto-scroll
  const handleChatScroll = useCallback(() => {
    // Skip if this is the initial auto-scroll
    if (isInitialScrollRef.current) {
      return;
    }

    if (!chatScrollRef.current) return;

    const container = chatScrollRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerHeight = containerRect.height;

    // Find all CLIENT message elements with data-psvs attribute (role="user")
    // Only update PSVS when scrolling to Client messages, not Avatar messages
    const messageElements = container.querySelectorAll('[data-psvs][data-role="user"]');

    let topVisibleMessage = null;
    let minDistance = Infinity;

    messageElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top - containerTop;

      // Check if element is visible in the container (at least partially)
      if (elementTop >= -rect.height && elementTop <= containerHeight) {
        // Find the message closest to the top of the visible area
        const distance = Math.abs(elementTop);
        if (distance < minDistance) {
          minDistance = distance;
          topVisibleMessage = el;
        }
      }
    });

    if (topVisibleMessage) {
      const psvsData = topVisibleMessage.getAttribute('data-psvs');
      const messageId = topVisibleMessage.getAttribute('data-message-id');
      if (psvsData) {
        try {
          const psvs = JSON.parse(psvsData);
          setCurrentPsvs({ ...psvs, messageId });
        } catch (e) {
          console.error('Failed to parse PSVS data:', e);
        }
      }
    }
  }, []);

  // Track if we've already scrolled for this dialog open
  const hasScrolledRef = useRef(false);

  // Reset scroll flag when dialog closes
  useEffect(() => {
    if (!selectedClient) {
      hasScrolledRef.current = false;
      isInitialScrollRef.current = false;
    }
  }, [selectedClient]);

  // Auto-scroll to bottom only on FIRST load when dialog opens
  // After that, user can scroll freely without being interrupted by polling updates
  useEffect(() => {
    if (selectedClient && !conversationsLoading && conversationsData.length > 0 && !hasScrolledRef.current) {
      // Mark that we've done the initial scroll
      hasScrolledRef.current = true;
      // Set flag to prevent scroll handler from overriding our PSVS selection
      isInitialScrollRef.current = true;
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
        // Clear the flag after scroll completes, allowing future manual scrolls to work
        setTimeout(() => {
          isInitialScrollRef.current = false;
        }, 200);
      }, 100);
    }
  }, [selectedClient, conversationsLoading, conversationsData]);

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
            {/* Language Toggle */}
            <div className="flex justify-end mb-4">
              <LanguageToggle />
            </div>

            <div className="flex items-center justify-center mb-6">
              <HamoLogo size={72} />
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">{t('appName')}</h1>
            <p className="text-center text-gray-500 mb-8 text-sm">{t('tagline')}</p>

            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                className={`flex-1 py-2 rounded-lg font-medium ${authMode === 'signin' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {t('signIn')}
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                className={`flex-1 py-2 rounded-lg font-medium ${authMode === 'signup' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {t('signUp')}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')}</label>
                    <input
                      type="text"
                      value={authForm.fullName}
                      onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('namePlaceholder')}
                      disabled={authLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('profession')}</label>
                    <select
                      value={authForm.profession}
                      onChange={(e) => setAuthForm({ ...authForm, profession: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      disabled={authLoading}
                    >
                      <option value="">{t('selectProfession')}</option>
                      {professionOptions.map(opt => (
                        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                          {opt.label}{opt.disabled ? ` (${t('comingSoon')})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('emailPlaceholder')}
                  disabled={authLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
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
                {authLoading ? (language === 'zh' ? '处理中...' : 'Processing...') : (authMode === 'signin' ? t('signIn') : t('createAccount'))}
              </button>
            </div>

            <div className="text-center mt-6 text-xs text-gray-400">
              {t('version')} {APP_VERSION}
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
                <h1 className="text-2xl font-bold text-gray-900">{t('appName')}</h1>
                <p className="text-sm text-gray-500">{t('tagline')}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm font-medium"><span>{currentUser?.full_name || currentUser?.fullName}</span></div>
              <p className="text-xs text-gray-500">{getProfessionLabel(currentUser?.profession)}</p>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">{t('deleteConfirmTitle')}</h3>
            <p className="text-gray-600 mb-6">{t('deleteConfirmMessage')}</p>
            <div className="flex space-x-3">
              <button onClick={handleDeleteAccount} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg">{t('confirmDelete')}</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-200 px-4 py-2 rounded-lg">{t('cancel')}</button>
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
                <h3 className="text-xl font-bold text-gray-900 mb-1">{t('invitationCode')}</h3>
                <p className="text-sm text-blue-500 mb-6">Hamo Pro</p>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-3xl font-bold font-mono text-gray-900 tracking-wider">{invitationCode}</p>
                </div>

                <div className="flex items-center justify-center space-x-2 text-orange-500 mb-6">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('expiresIn')}</span>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">{language === 'zh' ? '来访者' : 'Client'}</p>
                    <p className="font-semibold text-gray-900">{showInvitationCard.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">AI Avatar</p>
                    <p className="font-semibold text-gray-900">
                      {avatars.find(a => String(a.id) === String(showInvitationCard.avatarId) || String(a.id) === String(showInvitationCard.avatar_id))?.name || (language === 'zh' ? '未知' : 'Unknown')}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-6">{language === 'zh' ? '下载 Hamo Client App 连接' : 'Download Hamo Client App to connect'}</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveInvitationCard}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('save')}</span>
                </button>
                <button
                  onClick={() => setShowInvitationCard(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300"
                >
                  {t('done')}
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
              <h2 className="text-xl font-semibold">{t('avatarTherapists')}</h2>
              <button onClick={() => setShowAvatarForm(!showAvatarForm)} className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg"><Plus className="w-5 h-5" /><span>{t('createAvatar')}</span></button>
            </div>
            {showAvatarForm && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-5">{t('createAvatar')}</h3>

                <div className="space-y-4">
                  {/* Section 1: Basic Identity - Blue tint */}
                  <div className="bg-blue-50/70 rounded-xl p-4 space-y-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-blue-700">{t('basicInfo')}</span>
                    </div>

                    {/* Avatar Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('avatarName')} <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={avatarForm.name}
                        onChange={(e) => setAvatarForm({ ...avatarForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                        placeholder={language === 'zh' ? '例如：陈医生' : 'e.g., Dr. Emily Chen'}
                      />
                    </div>

                    {/* Specialty */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('specialty')} <span className="text-red-500">*</span></label>
                      <select
                        value={avatarForm.specialty}
                        onChange={(e) => setAvatarForm({ ...avatarForm, specialty: e.target.value })}
                        className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                      >
                        <option value="">{t('selectSpecialty')}</option>
                        {getSpecialtyOptions().map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        <option value="custom">{language === 'zh' ? '其他（自定义）' : 'Other (Custom)'}</option>
                      </select>
                      {avatarForm.specialty === 'custom' && (
                        <input
                          type="text"
                          value={avatarForm.customSpecialty}
                          onChange={(e) => setAvatarForm({ ...avatarForm, customSpecialty: e.target.value })}
                          className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-white mt-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                          placeholder={language === 'zh' ? '输入自定义专业领域' : 'Enter custom specialty'}
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
                      <span className="text-sm font-semibold text-teal-700">{t('therapeuticApproaches')}</span>
                      <span className="text-xs text-teal-500 ml-1">{language === 'zh' ? '（选择1-3项）' : '(Select 1-3)'}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {getTherapeuticApproachOptions().map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            if (avatarForm.therapeuticApproaches.includes(opt.value)) {
                              setAvatarForm({ ...avatarForm, therapeuticApproaches: avatarForm.therapeuticApproaches.filter(a => a !== opt.value) });
                            } else if (avatarForm.therapeuticApproaches.length < 3) {
                              setAvatarForm({ ...avatarForm, therapeuticApproaches: [...avatarForm.therapeuticApproaches, opt.value] });
                            }
                          }}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all ${avatarForm.therapeuticApproaches.includes(opt.value) ? 'bg-teal-500 text-white border-teal-500 shadow-sm' : 'bg-white text-gray-600 border-teal-200 hover:border-teal-400 hover:bg-teal-50'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={avatarForm.customApproach}
                      onChange={(e) => setAvatarForm({ ...avatarForm, customApproach: e.target.value })}
                      className="w-full px-4 py-2.5 border border-teal-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition-all"
                      placeholder={language === 'zh' ? '或添加自定义方法' : 'Or add custom approach'}
                    />
                  </div>

                  {/* Section 3: About - Purple tint */}
                  <div className="bg-purple-50/70 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-purple-700">{t('about')}</span>
                    </div>

                    <textarea
                      value={avatarForm.about}
                      onChange={(e) => setAvatarForm({ ...avatarForm, about: e.target.value.slice(0, 280) })}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all resize-none"
                      rows="3"
                      placeholder={language === 'zh' ? '描述形象的专业知识和方法...' : "Describe the avatar's expertise and approach..."}
                    />
                    <p className="text-xs text-purple-400 mt-1.5">{avatarForm.about.length}/280 {language === 'zh' ? '字符' : 'characters'}</p>
                  </div>

                  {/* Section 4: Experience - Amber tint */}
                  <div className="bg-amber-50/70 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <Briefcase className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-amber-700">{t('experience')}</span>
                    </div>

                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <label className="block text-xs text-amber-600 mb-1">{t('years')}</label>
                        <select
                          value={avatarForm.experienceYears}
                          onChange={(e) => setAvatarForm({ ...avatarForm, experienceYears: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-amber-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all"
                        >
                          {[...Array(51)].map((_, i) => <option key={i} value={i}>{i} {language === 'zh' ? '年' : (i === 1 ? 'year' : 'years')}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-amber-600 mb-1">{t('months')}</label>
                        <select
                          value={avatarForm.experienceMonths}
                          onChange={(e) => setAvatarForm({ ...avatarForm, experienceMonths: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-amber-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all"
                        >
                          {[...Array(12)].map((_, i) => <option key={i} value={i}>{i} {language === 'zh' ? '月' : (i === 1 ? 'month' : 'months')}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-100">
                  <button onClick={handleCreateAvatar} className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2.5 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition-all shadow-sm">{t('createAvatar')}</button>
                  <button onClick={() => setShowAvatarForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-all">{t('cancel')}</button>
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
                          <p className="text-sm text-blue-600">{getSpecialtyLabel(a.specialty) || a.specialty || a.theory}</p>
                        </div>
                        {/* Rating placeholder - can be removed if not needed */}
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">5.0</span>
                        </div>
                      </div>

                      {/* Therapeutic Approaches */}
                      {a.therapeuticApproaches && a.therapeuticApproaches.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">{a.therapeuticApproaches.map(ap => getApproachLabel(ap)).join(' • ')}</p>
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
                      <p className="text-blue-100 mt-1">{getSpecialtyLabel(selectedAvatar.specialty) || selectedAvatar.specialty || selectedAvatar.theory}</p>

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
                        <h4 className="text-sm font-medium text-gray-500 mb-2">{t('therapeuticApproaches')}</h4>
                        <p className="text-gray-800">{selectedAvatar.therapeuticApproaches.map(ap => getApproachLabel(ap)).join(' • ')}</p>
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
                      <h3 className="text-lg font-semibold">{t('editAvatar')}</h3>
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
                          <span className="text-sm font-semibold text-blue-700">{t('basicInfo')}</span>
                        </div>

                        {/* Avatar Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('avatarName')} <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={avatarForm.name}
                            onChange={(e) => setAvatarForm({ ...avatarForm, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                            placeholder={language === 'zh' ? '例如：陈医生' : 'e.g., Dr. Emily Chen'}
                          />
                        </div>

                        {/* Specialty */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('specialty')} <span className="text-red-500">*</span></label>
                          <select
                            value={avatarForm.specialty}
                            onChange={(e) => setAvatarForm({ ...avatarForm, specialty: e.target.value })}
                            className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                          >
                            <option value="">{t('selectSpecialty')}</option>
                            {getSpecialtyOptions().map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            <option value="custom">{language === 'zh' ? '其他（自定义）' : 'Other (Custom)'}</option>
                          </select>
                          {avatarForm.specialty === 'custom' && (
                            <input
                              type="text"
                              value={avatarForm.customSpecialty}
                              onChange={(e) => setAvatarForm({ ...avatarForm, customSpecialty: e.target.value })}
                              className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-white mt-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                              placeholder={language === 'zh' ? '输入自定义专业领域' : 'Enter custom specialty'}
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
                          <span className="text-sm font-semibold text-teal-700">{t('therapeuticApproaches')}</span>
                          <span className="text-xs text-teal-500 ml-1">{language === 'zh' ? '（选择1-3项）' : '(Select 1-3)'}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {getTherapeuticApproachOptions().map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                if (avatarForm.therapeuticApproaches.includes(opt.value)) {
                                  setAvatarForm({ ...avatarForm, therapeuticApproaches: avatarForm.therapeuticApproaches.filter(a => a !== opt.value) });
                                } else if (avatarForm.therapeuticApproaches.length < 3) {
                                  setAvatarForm({ ...avatarForm, therapeuticApproaches: [...avatarForm.therapeuticApproaches, opt.value] });
                                }
                              }}
                              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                avatarForm.therapeuticApproaches.includes(opt.value)
                                  ? 'bg-teal-500 text-white'
                                  : 'bg-white border border-teal-200 text-gray-700 hover:border-teal-400'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        <input
                          type="text"
                          value={avatarForm.customApproach}
                          onChange={(e) => setAvatarForm({ ...avatarForm, customApproach: e.target.value })}
                          className="w-full px-4 py-2.5 border border-teal-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition-all"
                          placeholder={language === 'zh' ? '或添加自定义方法' : 'Or add custom approach'}
                        />
                      </div>

                      {/* Section 3: About - Purple tint */}
                      <div className="bg-purple-50/70 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-purple-700">{t('about')}</span>
                        </div>

                        <textarea
                          value={avatarForm.about}
                          onChange={(e) => setAvatarForm({ ...avatarForm, about: e.target.value.slice(0, 280) })}
                          className="w-full px-4 py-2.5 border border-purple-200 rounded-lg bg-white h-24 resize-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all"
                          placeholder={language === 'zh' ? '描述形象的专业知识和方法...' : "Describe the avatar's expertise and approach..."}
                        />
                        <p className={`text-xs mt-1 ${avatarForm.about.length > 250 ? 'text-orange-500' : 'text-gray-400'}`}>
                          {avatarForm.about.length}/280 {language === 'zh' ? '字符' : 'characters'}
                        </p>
                      </div>

                      {/* Section 4: Experience - Yellow tint */}
                      <div className="bg-yellow-50/70 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Briefcase className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-yellow-700">{t('experience')}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-yellow-600 mb-1">{t('years')}</label>
                            <select
                              value={avatarForm.experienceYears}
                              onChange={(e) => setAvatarForm({ ...avatarForm, experienceYears: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all"
                            >
                              {[...Array(51)].map((_, i) => <option key={i} value={i}>{i} {language === 'zh' ? '年' : 'years'}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-yellow-600 mb-1">{t('months')}</label>
                            <select
                              value={avatarForm.experienceMonths}
                              onChange={(e) => setAvatarForm({ ...avatarForm, experienceMonths: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all"
                            >
                              {[...Array(12)].map((_, i) => <option key={i} value={i}>{i} {language === 'zh' ? '月' : 'months'}</option>)}
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
                        {t('save')}
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
                        {t('cancel')}
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
              <h2 className="text-xl font-semibold">{t('clientInstances')}</h2>
              <button onClick={() => setShowClientForm(!showClientForm)} disabled={!avatars.length} className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"><Plus className="w-5 h-5" /><span>{t('inviteClient')}</span></button>
            </div>
            {!avatars.length && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">{language === 'zh' ? '请先创建一个虚拟形象' : 'Create an avatar first'}</div>}
            {showClientForm && avatars.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4">{t('initializeAiMind')}</h3>

                {/* Section 1: Basic Information */}
                <div className="bg-blue-50 rounded-xl p-4 mb-4 border-l-4 border-blue-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">{t('basicInfo')}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('clientName')}</label>
                      <input type="text" value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={language === 'zh' ? '来访者姓名' : 'Client name'} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('sex')}</label>
                      <select value={clientForm.sex} onChange={(e) => setClientForm({ ...clientForm, sex: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white">
                        <option value="">{language === 'zh' ? '请选择' : 'Select'}</option>
                        <option value="male">{t('male')}</option>
                        <option value="female">{t('female')}</option>
                        <option value="other">{t('other')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('age')}</label>
                      <input type="number" value={clientForm.age} onChange={(e) => setClientForm({ ...clientForm, age: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('age')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('selectAvatar')}</label>
                      <select value={clientForm.avatarId} onChange={(e) => setClientForm({ ...clientForm, avatarId: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white">
                        <option value="">{t('selectAvatarPlaceholder')}</option>
                        {avatars.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Therapy Goal & Principles */}
                <div className="bg-teal-50 rounded-xl p-4 mb-4 border-l-4 border-teal-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <Star className="w-5 h-5 text-teal-600" />
                    <h4 className="font-semibold text-teal-800">{t('goalsAndPrinciples')}</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('therapyGoals')}</label>
                      <textarea value={clientForm.goals} onChange={(e) => setClientForm({ ...clientForm, goals: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" rows="2" placeholder={t('therapyGoalsPlaceholder')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('therapyPrinciples')}</label>
                      <textarea value={clientForm.therapyPrinciples} onChange={(e) => setClientForm({ ...clientForm, therapyPrinciples: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" rows="2" placeholder={t('therapyPrinciplesPlaceholder')} />
                    </div>
                  </div>
                </div>

                {/* Section 3: Personality Traits - Key Section */}
                <div className="bg-purple-50 rounded-xl p-4 mb-4 border-l-4 border-purple-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-800">{t('personalityTraits')}</h4>
                    <span className="text-xs text-purple-500">({t('selectDimensions')})</span>
                  </div>

                  {/* Dimension Selection */}
                  <div className="mb-4">
                    {/* Dimension 1: Introverted vs Extroverted */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('socialOrientation')}</label>
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
                          {t('introverted')}
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
                          {t('extroverted')}
                        </button>
                      </div>
                    </div>

                    {/* Dimension 2: Rational vs Emotional */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('decisionStyle')}</label>
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
                          {t('rational')}
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
                          {t('emotional')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Trait Selection - Only show when both dimensions are selected */}
                  {getPersonalityTraitOptions() && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">{t('selectTraits')}</label>
                        <span className="text-xs text-purple-500">{clientForm.personalityTraits.length}/6 {t('selected')}</span>
                      </div>

                      {/* Orange Block - Adaptive */}
                      <div className="bg-orange-50 rounded-lg p-3 mb-3">
                        <p className="text-xs text-orange-600 font-medium mb-2">{t('adaptiveTraits')}</p>
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
                              {translateTrait(trait)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Gray Block - Maladaptive Mild */}
                      <div className="bg-gray-100 rounded-lg p-3 mb-3">
                        <p className="text-xs text-gray-600 font-medium mb-2">{t('mildMaladaptive')}</p>
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
                              {translateTrait(trait)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Red Block - Maladaptive Severe */}
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-xs text-red-600 font-medium mb-2">{t('severeMaladaptive')}</p>
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
                              {translateTrait(trait)}
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
                    <h4 className="font-semibold text-yellow-800">{t('emotionPatterns')}</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('dominantEmotionsLabel')}</label>
                      <input type="text" value={clientForm.emotion_pattern.dominant_emotions} onChange={(e) => setClientForm({ ...clientForm, emotion_pattern: { ...clientForm.emotion_pattern, dominant_emotions: e.target.value } })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('emotionPatternsPlaceholder')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('triggersLabel')}</label>
                      <input type="text" value={clientForm.emotion_pattern.triggers} onChange={(e) => setClientForm({ ...clientForm, emotion_pattern: { ...clientForm.emotion_pattern, triggers: e.target.value } })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('triggersPlaceholder')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('copingMechanismsLabel')}</label>
                      <input type="text" value={clientForm.emotion_pattern.coping_mechanisms} onChange={(e) => setClientForm({ ...clientForm, emotion_pattern: { ...clientForm.emotion_pattern, coping_mechanisms: e.target.value } })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('copingMechanismsPlaceholder')} />
                    </div>
                  </div>
                </div>

                {/* Section 5: Cognition & Beliefs */}
                <div className="bg-indigo-50 rounded-xl p-4 mb-4 border-l-4 border-indigo-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold text-indigo-800">{t('cognitionBeliefs')}</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('corebeliefsLabel')}</label>
                      <input type="text" value={clientForm.cognition_beliefs.core_beliefs} onChange={(e) => setClientForm({ ...clientForm, cognition_beliefs: { ...clientForm.cognition_beliefs, core_beliefs: e.target.value } })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('cognitionPlaceholder')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('cognitiveDistortionsLabel')}</label>
                      <input type="text" value={clientForm.cognition_beliefs.cognitive_distortions} onChange={(e) => setClientForm({ ...clientForm, cognition_beliefs: { ...clientForm.cognition_beliefs, cognitive_distortions: e.target.value } })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('cognitiveDistortionsPlaceholder')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('thinkingPatternsLabel')}</label>
                      <input type="text" value={clientForm.cognition_beliefs.thinking_patterns} onChange={(e) => setClientForm({ ...clientForm, cognition_beliefs: { ...clientForm.cognition_beliefs, thinking_patterns: e.target.value } })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('thinkingPatternsPlaceholder')} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('selfPerception')}</label>
                        <input type="text" value={clientForm.cognition_beliefs.self_perception} onChange={(e) => setClientForm({ ...clientForm, cognition_beliefs: { ...clientForm.cognition_beliefs, self_perception: e.target.value } })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('selfPerceptionPlaceholder')} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('worldPerception')}</label>
                        <input type="text" value={clientForm.cognition_beliefs.world_perception} onChange={(e) => setClientForm({ ...clientForm, cognition_beliefs: { ...clientForm.cognition_beliefs, world_perception: e.target.value } })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('worldPerceptionPlaceholder')} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('futurePerception')}</label>
                        <input type="text" value={clientForm.cognition_beliefs.future_perception} onChange={(e) => setClientForm({ ...clientForm, cognition_beliefs: { ...clientForm.cognition_beliefs, future_perception: e.target.value } })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('futurePerceptionPlaceholder')} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 6: Relationship Manipulations */}
                <div className="bg-rose-50 rounded-xl p-4 mb-4 border-l-4 border-rose-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-5 h-5 text-rose-600" />
                    <h4 className="font-semibold text-rose-800">{t('relationshipManipulations')}</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('attachmentStyle')}</label>
                      <select value={clientForm.relationship_manipulations.attachment_style} onChange={(e) => setClientForm({ ...clientForm, relationship_manipulations: { ...clientForm.relationship_manipulations, attachment_style: e.target.value } })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white">
                        <option value="">--</option>
                        <option value="secure">{t('attachmentSecure')}</option>
                        <option value="anxious">{t('attachmentAnxious')}</option>
                        <option value="avoidant">{t('attachmentAvoidant')}</option>
                        <option value="disorganized">{t('attachmentDisorganized')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('relationshipPatternsLabel')}</label>
                      <input type="text" value={clientForm.relationship_manipulations.relationship_patterns} onChange={(e) => setClientForm({ ...clientForm, relationship_manipulations: { ...clientForm.relationship_manipulations, relationship_patterns: e.target.value } })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('relationshipPlaceholder')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('communicationStyle')}</label>
                      <input type="text" value={clientForm.relationship_manipulations.communication_style} onChange={(e) => setClientForm({ ...clientForm, relationship_manipulations: { ...clientForm.relationship_manipulations, communication_style: e.target.value } })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('communicationStylePlaceholder')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('conflictResolution')}</label>
                      <input type="text" value={clientForm.relationship_manipulations.conflict_resolution} onChange={(e) => setClientForm({ ...clientForm, relationship_manipulations: { ...clientForm.relationship_manipulations, conflict_resolution: e.target.value } })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('conflictResolutionPlaceholder')} />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button onClick={handleCreateClient} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">{t('initializeMind')}</button>
                  <button onClick={() => setShowClientForm(false)} className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">{t('cancel')}</button>
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
                      <div><h3 className="font-semibold">{c.name}</h3><p className="text-sm text-gray-500">{c.sex ? (t(c.sex) || c.sex) : ''}{c.sex && c.age ? ', ' : ''}{c.age ? `${c.age} ${language === 'zh' ? '岁' : 'years'}` : ''}</p></div>
                      {isConnected ? (
                        <div className="flex flex-col items-center text-green-500 flex-shrink-0">
                          <Calendar className="w-5 h-5" />
                          <span className="text-xs mt-1">{new Date(isConnected).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="text-xs text-green-600 font-medium">{t('connected')}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateInvitation(c)}
                          disabled={invitationLoading}
                          className="flex flex-col items-center text-blue-500 hover:text-blue-600 disabled:opacity-50 flex-shrink-0"
                        >
                          <Ticket className="w-5 h-5" />
                          <span className="text-xs mt-1">{t('invitationCode')}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-sm mb-2"><span className="font-medium">Avatar:</span> {avatar?.name || (language === 'zh' ? '未分配' : 'Not assigned')}</p>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1"><MessageSquare className="w-4 h-4" /><span>{c.sessions} {t('sessions')}</span></div>
                      <div className="flex items-center space-x-1"><Clock className="w-4 h-4" /><span>{c.avgTime} {t('avgTime')}</span></div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleViewMind(c)} className="flex-1 bg-purple-50 text-purple-600 px-2 sm:px-3 py-2 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 hover:bg-purple-100"><Sparkles className="w-4 h-4 flex-shrink-0" /><span className="text-xs sm:text-sm whitespace-nowrap">{t('aiMind')}</span></button>
                      <button onClick={() => handleViewChats(c)} className="flex-1 bg-blue-50 text-blue-600 px-2 sm:px-3 py-2 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 hover:bg-blue-100"><Eye className="w-4 h-4 flex-shrink-0" /><span className="text-xs sm:text-sm whitespace-nowrap">{t('chatsStatus')}</span></button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {selectedMindClient && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4" onClick={() => { setSelectedMindClient(null); setMindData(null); setExpandedMindSection(null); setMindEditMode(false); setMindEditData(null); }}>
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
                          <span>{t('aiMind')}</span>
                        </h3>
                        <p className="text-purple-100 text-sm">{t('psychologicalProfile')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {mindData && !mindData.error && (
                        mindEditMode ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); saveMindEdits(); }}
                            disabled={mindSaving}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            <Save className="w-4 h-4" />
                            <span>{mindSaving ? '...' : t('save')}</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); enterMindEditMode(); }}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>{t('edit')}</span>
                          </button>
                        )
                      )}
                      <button
                        onClick={() => { setSelectedMindClient(null); setMindData(null); setMindEditMode(false); setMindEditData(null); }}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {mindLoading ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p>{language === 'zh' ? '加载 AI Mind 数据中...' : 'Loading AI Mind data...'}</p>
                  </div>
                ) : mindData?.error ? (
                  <div className="text-center py-12 text-red-500">{mindData.error}</div>
                ) : mindData ? (
                  <div className="p-6 space-y-5">
                    {mindEditMode ? (
                      /* ===== EDIT MODE: Init-form-style layout ===== */
                      <div className="space-y-4">
                        {/* Basic Info (read-only) */}
                        <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-400">
                          <div className="flex items-center space-x-2 mb-3">
                            <User className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-800">{t('basicInfo')}</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('clientName')}</label>
                              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">{mindData.name || selectedMindClient.name}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('sex')}</label>
                              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">{t(mindData.sex) || mindData.sex || '-'}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('age')}</label>
                              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">{mindData.age || '-'}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('selectAvatar')}</label>
                              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">{mindData.avatar_name || '-'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Goals & Principles */}
                        <div className="bg-teal-50 rounded-xl p-4 border-l-4 border-teal-400">
                          <div className="flex items-center space-x-2 mb-3">
                            <Star className="w-5 h-5 text-teal-600" />
                            <h4 className="font-semibold text-teal-800">{t('goalsAndPrinciples')}</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('therapyGoals')}</label>
                              <textarea value={mindEditData?.goals || ''} onChange={(e) => updateMindEditString(null, 'goals', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" rows="2" placeholder={t('therapyGoalsPlaceholder')} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('therapyPrinciples')}</label>
                              <textarea value={mindEditData?.therapy_principles || ''} onChange={(e) => updateMindEditString(null, 'therapy_principles', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" rows="2" placeholder={t('therapyPrinciplesPlaceholder')} />
                            </div>
                          </div>
                        </div>

                        {/* Personality Traits */}
                        <div className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-400">
                          <div className="flex items-center space-x-2 mb-3">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-purple-800">{t('mindPersonalityTraits')}</h4>
                            <span className="text-xs text-purple-500">({t('selectDimensions')})</span>
                          </div>

                          {/* Dimension 1: Social Orientation */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('socialOrientation')}</label>
                            <div className="flex space-x-3">
                              <button type="button" onClick={() => setMindEditData(prev => ({ ...prev, personality: { ...prev.personality, personalityDimension1: 'introverted', personalityTraits: [] } }))} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${mindEditData?.personality?.personalityDimension1 === 'introverted' ? 'border-purple-500 bg-purple-100 text-purple-700 font-medium' : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'}`}>
                                {t('introverted')}
                              </button>
                              <button type="button" onClick={() => setMindEditData(prev => ({ ...prev, personality: { ...prev.personality, personalityDimension1: 'extroverted', personalityTraits: [] } }))} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${mindEditData?.personality?.personalityDimension1 === 'extroverted' ? 'border-purple-500 bg-purple-100 text-purple-700 font-medium' : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'}`}>
                                {t('extroverted')}
                              </button>
                            </div>
                          </div>

                          {/* Dimension 2: Decision Style */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('decisionStyle')}</label>
                            <div className="flex space-x-3">
                              <button type="button" onClick={() => setMindEditData(prev => ({ ...prev, personality: { ...prev.personality, personalityDimension2: 'rational', personalityTraits: [] } }))} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${mindEditData?.personality?.personalityDimension2 === 'rational' ? 'border-purple-500 bg-purple-100 text-purple-700 font-medium' : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'}`}>
                                {t('rational')}
                              </button>
                              <button type="button" onClick={() => setMindEditData(prev => ({ ...prev, personality: { ...prev.personality, personalityDimension2: 'emotional', personalityTraits: [] } }))} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${mindEditData?.personality?.personalityDimension2 === 'emotional' ? 'border-purple-500 bg-purple-100 text-purple-700 font-medium' : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'}`}>
                                {t('emotional')}
                              </button>
                            </div>
                          </div>

                          {/* Trait Selection - Only show when both dimensions selected */}
                          {(() => {
                            const traitOptions = getPersonalityTraitOptions(mindEditData?.personality?.personalityDimension1, mindEditData?.personality?.personalityDimension2);
                            if (!traitOptions) return null;
                            const selectedTraits = mindEditData?.personality?.personalityTraits || [];
                            return (
                              <div className="mt-4 pt-4 border-t border-purple-200">
                                <div className="flex items-center justify-between mb-3">
                                  <label className="text-sm font-medium text-gray-700">{t('selectTraits')}</label>
                                  <span className="text-xs text-purple-500">{selectedTraits.length}/6 {t('selected')}</span>
                                </div>
                                {/* Adaptive Traits */}
                                <div className="bg-orange-50 rounded-lg p-3 mb-3">
                                  <p className="text-xs text-orange-600 font-medium mb-2">{t('adaptiveTraits')}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {traitOptions.orange.map(trait => (
                                      <button key={trait} type="button" onClick={() => toggleEditPersonalityTrait(trait)} className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedTraits.includes(trait) ? 'bg-orange-500 text-white' : 'bg-white border border-orange-300 text-orange-700 hover:bg-orange-100'}`}>
                                        {translateTrait(trait)}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                {/* Mild Maladaptive */}
                                <div className="bg-gray-100 rounded-lg p-3 mb-3">
                                  <p className="text-xs text-gray-600 font-medium mb-2">{t('mildMaladaptive')}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {traitOptions.gray.map(trait => (
                                      <button key={trait} type="button" onClick={() => toggleEditPersonalityTrait(trait)} className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedTraits.includes(trait) ? 'bg-gray-600 text-white' : 'bg-white border border-gray-400 text-gray-700 hover:bg-gray-200'}`}>
                                        {translateTrait(trait)}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                {/* Severe Maladaptive */}
                                <div className="bg-red-50 rounded-lg p-3">
                                  <p className="text-xs text-red-600 font-medium mb-2">{t('severeMaladaptive')}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {traitOptions.red.map(trait => (
                                      <button key={trait} type="button" onClick={() => toggleEditPersonalityTrait(trait)} className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedTraits.includes(trait) ? 'bg-red-500 text-white' : 'bg-white border border-red-300 text-red-700 hover:bg-red-100'}`}>
                                        {translateTrait(trait)}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                        </div>

                        {/* Emotion Patterns */}
                        <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-400">
                          <div className="flex items-center space-x-2 mb-3">
                            <Sparkles className="w-5 h-5 text-yellow-600" />
                            <h4 className="font-semibold text-yellow-800">{t('mindEmotionPatterns')}</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('dominantEmotionsLabel')}</label>
                              <input type="text" value={(mindEditData?.emotion_pattern?.dominant_emotions || []).join(', ')} onChange={(e) => updateMindEditArray('emotion_pattern', 'dominant_emotions', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('emotionPatternsPlaceholder')} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('triggersLabel')}</label>
                              <input type="text" value={(mindEditData?.emotion_pattern?.triggers || []).join(', ')} onChange={(e) => updateMindEditArray('emotion_pattern', 'triggers', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('triggersPlaceholder')} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('copingMechanismsLabel')}</label>
                              <input type="text" value={(mindEditData?.emotion_pattern?.coping_mechanisms || []).join(', ')} onChange={(e) => updateMindEditArray('emotion_pattern', 'coping_mechanisms', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('copingMechanismsPlaceholder')} />
                            </div>
                          </div>
                        </div>

                        {/* Cognition & Beliefs */}
                        <div className="bg-indigo-50 rounded-xl p-4 border-l-4 border-indigo-400">
                          <div className="flex items-center space-x-2 mb-3">
                            <Brain className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-semibold text-indigo-800">{t('mindCognitionBeliefs')}</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('corebeliefsLabel')}</label>
                              <input type="text" value={(mindEditData?.cognition_beliefs?.core_beliefs || []).join(', ')} onChange={(e) => updateMindEditArray('cognition_beliefs', 'core_beliefs', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('cognitionPlaceholder')} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cognitiveDistortionsLabel')}</label>
                              <input type="text" value={(mindEditData?.cognition_beliefs?.cognitive_distortions || []).join(', ')} onChange={(e) => updateMindEditArray('cognition_beliefs', 'cognitive_distortions', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('cognitiveDistortionsPlaceholder')} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('thinkingPatternsLabel')}</label>
                              <input type="text" value={(mindEditData?.cognition_beliefs?.thinking_patterns || []).join(', ')} onChange={(e) => updateMindEditArray('cognition_beliefs', 'thinking_patterns', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('thinkingPatternsPlaceholder')} />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('selfPerception')}</label>
                                <input type="text" value={mindEditData?.cognition_beliefs?.self_perception || ''} onChange={(e) => updateMindEditString('cognition_beliefs', 'self_perception', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('selfPerceptionPlaceholder')} />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('worldPerception')}</label>
                                <input type="text" value={mindEditData?.cognition_beliefs?.world_perception || ''} onChange={(e) => updateMindEditString('cognition_beliefs', 'world_perception', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('worldPerceptionPlaceholder')} />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('futurePerception')}</label>
                                <input type="text" value={mindEditData?.cognition_beliefs?.future_perception || ''} onChange={(e) => updateMindEditString('cognition_beliefs', 'future_perception', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('futurePerceptionPlaceholder')} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Relationship Patterns */}
                        <div className="bg-rose-50 rounded-xl p-4 border-l-4 border-rose-400">
                          <div className="flex items-center space-x-2 mb-3">
                            <User className="w-5 h-5 text-rose-600" />
                            <h4 className="font-semibold text-rose-800">{t('mindRelationshipPatterns')}</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('attachmentStyle')}</label>
                              <select value={mindEditData?.relationship_manipulations?.attachment_style || ''} onChange={(e) => updateMindEditString('relationship_manipulations', 'attachment_style', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white">
                                <option value="">--</option>
                                <option value="secure">{t('attachmentSecure')}</option>
                                <option value="anxious">{t('attachmentAnxious')}</option>
                                <option value="avoidant">{t('attachmentAvoidant')}</option>
                                <option value="disorganized">{t('attachmentDisorganized')}</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('relationshipPatternsLabel')}</label>
                              <input type="text" value={(mindEditData?.relationship_manipulations?.relationship_patterns || []).join(', ')} onChange={(e) => updateMindEditArray('relationship_manipulations', 'relationship_patterns', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('relationshipPlaceholder')} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('communicationStyle')}</label>
                              <input type="text" value={mindEditData?.relationship_manipulations?.communication_style || ''} onChange={(e) => updateMindEditString('relationship_manipulations', 'communication_style', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('communicationStylePlaceholder')} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('conflictResolution')}</label>
                              <input type="text" value={mindEditData?.relationship_manipulations?.conflict_resolution || ''} onChange={(e) => updateMindEditString('relationship_manipulations', 'conflict_resolution', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white" placeholder={t('conflictResolutionPlaceholder')} />
                            </div>
                          </div>
                        </div>

                        {/* Save / Cancel buttons */}
                        <div className="flex space-x-3 pt-2">
                          <button onClick={saveMindEdits} disabled={mindSaving} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">{mindSaving ? t('saving') : t('save')}</button>
                          <button onClick={() => { setMindEditMode(false); setMindEditData(null); }} className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">{t('cancel')}</button>
                        </div>
                      </div>
                    ) : (
                      /* ===== READ MODE: Collapsible card layout ===== */
                      <>
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
                              {mindData.sex && <span className="capitalize">{t(mindData.sex) || mindData.sex}</span>}
                              {mindData.age && <span>• {mindData.age} {language === 'zh' ? '岁' : 'years old'}</span>}
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
                                <span>{mindData.sessions} {t('sessions')}</span>
                              </span>
                            )}
                            {mindData.avg_time !== undefined && (
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{mindData.avg_time} {t('avgTime')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Mind Sections */}
                    <div className="space-y-3">
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
                              <h4 className="text-white font-bold text-lg">{t('goalsAndPrinciples')}</h4>
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
                                      <span className="text-xs font-medium text-green-700 uppercase tracking-wide">{t('therapyGoals')}</span>
                                      <p className="text-sm text-gray-700 mt-2">{mindData.goals}</p>
                                    </div>
                                  )}
                                  {mindData.therapy_principles && (
                                    <div className="bg-green-50 rounded-lg p-3">
                                      <span className="text-xs font-medium text-green-700 uppercase tracking-wide">{t('therapyPrinciples')}</span>
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
                              <h4 className="text-white font-bold text-lg">{t('mindPersonalityTraits')}</h4>
                              {mindData.personality?.primary_traits?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {mindData.personality.primary_traits.slice(0, 3).map((trait, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-white/20 text-white/90 rounded-full text-xs border border-white/30">
                                      {translateTrait(trait)}
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
                                <>
                                  {mindData.personality?.primary_traits?.length > 0 && (
                                    <div className="mb-4">
                                      <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">{t('allTraits')}</span>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {mindData.personality.primary_traits.map((trait, idx) => (
                                          <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">{translateTrait(trait)}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {mindData.personality?.description && (
                                    <p className="text-sm text-gray-600 bg-purple-50 rounded-lg p-3 italic mb-4">"{mindData.personality.description}"</p>
                                  )}
                                </>
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
                              <h4 className="text-white font-bold text-lg">{t('mindEmotionPatterns')}</h4>
                              {mindData.emotion_pattern?.dominant_emotions?.length > 0 && (
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
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    {mindData.emotion_pattern?.dominant_emotions?.length > 0 && (
                                      <div className="bg-emerald-50 rounded-lg p-3">
                                        <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">{t('dominantEmotions')}</span>
                                        <div className="flex flex-wrap gap-1 mt-2">{mindData.emotion_pattern.dominant_emotions.map((emotion, idx) => (<span key={idx} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">{emotion}</span>))}</div>
                                      </div>
                                    )}
                                    {mindData.emotion_pattern?.triggers?.length > 0 && (
                                      <div className="bg-amber-50 rounded-lg p-3">
                                        <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">{t('triggers')}</span>
                                        <div className="flex flex-wrap gap-1 mt-2">{mindData.emotion_pattern.triggers.map((trigger, idx) => (<span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">{trigger}</span>))}</div>
                                      </div>
                                    )}
                                    {mindData.emotion_pattern?.coping_mechanisms?.length > 0 && (
                                      <div className="bg-green-50 rounded-lg p-3">
                                        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">{t('copingMechanisms')}</span>
                                        <div className="flex flex-wrap gap-1 mt-2">{mindData.emotion_pattern.coping_mechanisms.map((mechanism, idx) => (<span key={idx} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{mechanism}</span>))}</div>
                                      </div>
                                    )}
                                  </div>
                                  {mindData.emotion_pattern?.description && (<p className="text-sm text-gray-600 bg-emerald-50 rounded-lg p-3 italic mb-4">"{mindData.emotion_pattern.description}"</p>)}
                                </>
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
                              <h4 className="text-white font-bold text-lg">{t('mindCognitionBeliefs')}</h4>
                              {mindData.cognition_beliefs?.core_beliefs?.length > 0 && (
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
                                <>
                                  <div className="space-y-3 mb-4">
                                    {mindData.cognition_beliefs?.core_beliefs?.length > 0 && (
                                      <div className="bg-amber-50 rounded-lg p-3">
                                        <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">{t('coreBeliefs')}</span>
                                        <div className="mt-2 space-y-1">{mindData.cognition_beliefs.core_beliefs.map((belief, idx) => (<div key={idx} className="flex items-start space-x-2"><span className="text-amber-500 mt-1">•</span><span className="text-sm text-gray-700">{belief}</span></div>))}</div>
                                      </div>
                                    )}
                                    {mindData.cognition_beliefs?.cognitive_distortions?.length > 0 && (
                                      <div className="bg-red-50 rounded-lg p-3">
                                        <span className="text-xs font-medium text-red-600 uppercase tracking-wide">{t('cognitiveDistortions')}</span>
                                        <div className="flex flex-wrap gap-2 mt-2">{mindData.cognition_beliefs.cognitive_distortions.map((d, idx) => (<span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">{d}</span>))}</div>
                                      </div>
                                    )}
                                    {mindData.cognition_beliefs?.thinking_patterns?.length > 0 && (
                                      <div className="bg-amber-50 rounded-lg p-3">
                                        <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">{t('thinkingPatterns')}</span>
                                        <div className="flex flex-wrap gap-2 mt-2">{mindData.cognition_beliefs.thinking_patterns.map((p, idx) => (<span key={idx} className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">{p}</span>))}</div>
                                      </div>
                                    )}
                                  </div>
                                  {(mindData.cognition_beliefs?.self_perception || mindData.cognition_beliefs?.world_perception || mindData.cognition_beliefs?.future_perception) && (
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                      {mindData.cognition_beliefs.self_perception && (<div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">{t('selfPerception')}</div><div className="text-sm text-gray-700">{mindData.cognition_beliefs.self_perception}</div></div>)}
                                      {mindData.cognition_beliefs.world_perception && (<div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">{t('worldPerception')}</div><div className="text-sm text-gray-700">{mindData.cognition_beliefs.world_perception}</div></div>)}
                                      {mindData.cognition_beliefs.future_perception && (<div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">{t('futurePerception')}</div><div className="text-sm text-gray-700">{mindData.cognition_beliefs.future_perception}</div></div>)}
                                    </div>
                                  )}
                                </>
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
                              <h4 className="text-white font-bold text-lg">{t('mindRelationshipPatterns')}</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {mindData.relationship_manipulations?.attachment_style && (
                                  <span className="px-2 py-0.5 bg-white/20 text-white/90 rounded-full text-xs border border-white/30 capitalize">
                                    {t(`attachment${mindData.relationship_manipulations.attachment_style.charAt(0).toUpperCase() + mindData.relationship_manipulations.attachment_style.slice(1)}`) || mindData.relationship_manipulations.attachment_style}
                                  </span>
                                )}
                                {mindData.relationship_manipulations?.relationship_patterns?.slice(0, 2).map((pattern, idx) => (
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
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {mindData.relationship_manipulations?.attachment_style && (
                                      <div className="bg-blue-50 rounded-lg p-3">
                                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">{t('attachmentStyle')}</span>
                                        <div className="mt-1"><span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-semibold capitalize">{t(`attachment${mindData.relationship_manipulations.attachment_style.charAt(0).toUpperCase() + mindData.relationship_manipulations.attachment_style.slice(1)}`) || mindData.relationship_manipulations.attachment_style}</span></div>
                                      </div>
                                    )}
                                    {mindData.relationship_manipulations?.communication_style && (
                                      <div className="bg-blue-50 rounded-lg p-3">
                                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">{t('communicationStyle')}</span>
                                        <div className="text-sm text-gray-700 mt-1">{mindData.relationship_manipulations.communication_style}</div>
                                      </div>
                                    )}
                                  </div>
                                  {mindData.relationship_manipulations?.relationship_patterns?.length > 0 && (
                                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">{t('mindRelationshipPatterns')}</span>
                                      <div className="flex flex-wrap gap-2 mt-2">{mindData.relationship_manipulations.relationship_patterns.map((pattern, idx) => (<span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{pattern}</span>))}</div>
                                    </div>
                                  )}
                                  {mindData.relationship_manipulations?.conflict_resolution && (
                                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">{t('conflictResolution')}</span>
                                      <div className="text-sm text-gray-700 mt-1">{mindData.relationship_manipulations.conflict_resolution}</div>
                                    </div>
                                  )}
                                </>
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
                            <span>{t('connectedOn')}: {new Date(mindData.connected_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </span>
                        )}
                        {mindData.created_at && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{t('createdOn')}: {new Date(mindData.created_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">{t('noAiMindData')}</div>
                )}
                </div>
              </div>
            )}

            {selectedClient && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4" onClick={() => { setSelectedClient(null); setCurrentPsvs(null); }}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{t('chatsStatus')}</h3>
                          <p className="text-blue-100 text-sm">{selectedClient.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Auto-refresh toggle button */}
                        <button
                          onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                          className={`p-1.5 rounded-full transition-colors ${
                            autoRefreshEnabled
                              ? 'bg-white/30 text-white'
                              : 'text-white/60 hover:text-white hover:bg-white/20'
                          }`}
                          title={autoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                        >
                          <RefreshCw className={`w-4 h-4 ${autoRefreshEnabled ? 'animate-spin' : ''}`} style={autoRefreshEnabled ? { animationDuration: '3s' } : {}} />
                        </button>
                        <button
                          onClick={() => { setSelectedClient(null); setCurrentPsvs(null); }}
                          className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PSVS Status Bar - Clickable to expand detail */}
                  <div
                    className={`border-b px-4 py-3 cursor-pointer transition-colors ${
                      showStressDetail ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setShowStressDetail(!showStressDetail)}
                  >
                    <div className="flex justify-between items-center">
                      {/* Stress Level */}
                      <div className="flex-1 text-center">
                        <p className="text-xs text-gray-500 mb-1">{t('stressLevel')}</p>
                        <div className="flex items-center justify-center space-x-1">
                          <span className={`text-lg font-bold ${
                            currentPsvs?.stress_level >= 7 ? 'text-red-500' :
                            currentPsvs?.stress_level >= 4 ? 'text-yellow-500' :
                            currentPsvs?.stress_level !== undefined ? 'text-green-500' : 'text-gray-300'
                          }`}>
                            {currentPsvs?.stress_level !== undefined ? currentPsvs.stress_level.toFixed(1) : '--'}
                          </span>
                          <span className="text-xs text-gray-400">/10</span>
                        </div>
                      </div>

                      <div className="w-px h-10 bg-gray-200"></div>

                      {/* Energy State */}
                      <div className="flex-1 text-center">
                        <p className="text-xs text-gray-500 mb-1">{t('energyState')}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          currentPsvs?.energy_state === 'neurotic' ? 'bg-red-100 text-red-700' :
                          currentPsvs?.energy_state === 'negative' ? 'bg-yellow-100 text-yellow-700' :
                          currentPsvs?.energy_state === 'positive' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {currentPsvs?.energy_state ? (
                            <>
                              <span className={`w-2 h-2 rounded-full mr-1 ${
                                currentPsvs.energy_state === 'neurotic' ? 'bg-red-500' :
                                currentPsvs.energy_state === 'negative' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}></span>
                              {currentPsvs.energy_state === 'positive' ? t('positive') :
                               currentPsvs.energy_state === 'negative' ? t('negative') :
                               currentPsvs.energy_state === 'neurotic' ? t('neurotic') :
                               currentPsvs.energy_state.charAt(0).toUpperCase() + currentPsvs.energy_state.slice(1)}
                            </>
                          ) : '--'}
                        </span>
                      </div>

                      {/* Expand chevron */}
                      <div className="pl-2 text-gray-400">
                        {showStressDetail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Stress Detail Panel - Expandable */}
                  {showStressDetail && (() => {
                    // Use PSVS trajectory from API (consistent with Portal)
                    // Fallback to message psvs_snapshots if trajectory not available
                    let stressDataPoints = [];
                    if (psvsTrajectory && psvsTrajectory.length > 0) {
                      stressDataPoints = psvsTrajectory.map(t => ({
                        stress: t.stress_level,
                        energy: t.energy_state,
                        timestamp: t.timestamp,
                      }));
                    } else if (conversationsData && conversationsData.length > 0) {
                      conversationsData.forEach(conv => {
                        if (conv.messages) {
                          conv.messages.forEach(msg => {
                            if (msg.role === 'user' && msg.psvs_snapshot && msg.psvs_snapshot.stress_level !== undefined) {
                              stressDataPoints.push({
                                stress: msg.psvs_snapshot.stress_level,
                                energy: msg.psvs_snapshot.energy_state,
                                timestamp: msg.timestamp,
                              });
                            }
                          });
                        }
                      });
                    }

                    // Get last 50 data points for chart
                    const chartData = stressDataPoints.slice(-50);
                    const latestPoint = stressDataPoints[stressDataPoints.length - 1];

                    // Calculate stats
                    const stressValues = chartData.map(d => d.stress);
                    const peakStress = stressValues.length > 0 ? Math.max(...stressValues) : 0;
                    const minStressVal = stressValues.length > 0 ? Math.min(...stressValues) : 0;
                    const avgStress = stressValues.length > 0 ? stressValues.reduce((a, b) => a + b, 0) / stressValues.length : 0;

                    // SVG chart dimensions
                    const svgW = 340, svgH = 140, padL = 30, padR = 10, padT = 15, padB = 25;
                    const plotW = svgW - padL - padR, plotH = svgH - padT - padB;

                    // Build SVG path for stress line
                    const getX = (i) => padL + (chartData.length > 1 ? (i / (chartData.length - 1)) * plotW : plotW / 2);
                    const getY = (val) => padT + plotH - (val / 10) * plotH;

                    const linePath = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(i).toFixed(1)},${getY(d.stress).toFixed(1)}`).join(' ');

                    // Color for each dot
                    const dotColor = (val) => val >= 7 ? '#ef4444' : val >= 4 ? '#f59e0b' : '#22c55e';

                    // A/W/E/H/B indicator config - use data from portal API (stressIndicatorsData)
                    const ind = stressIndicatorsData || {};
                    const indicators = [
                      { key: 'A', label: t('agency'), letter: 'A', color: '#10b981', effect: `\u2193 ${t('reducesStress')}`, val: ind.A },
                      { key: 'W', label: t('withdrawal'), letter: 'W', color: '#ef4444', effect: `\u2191 ${t('raisesStress')}`, val: ind.W },
                      { key: 'E', label: t('extremity'), letter: 'E', color: '#f97316', effect: `\u2191\u2191 ${t('raisesStress')}`, val: ind.E },
                      { key: 'H', label: t('hostility'), letter: 'H', color: '#dc2626', effect: `\u2191\u2191\u2191 ${t('stronglyRaises')}`, val: ind.H },
                      { key: 'B', label: t('boundary'), letter: 'B', color: '#06b6d4', effect: `\u2193\u2193 ${t('reducesStress')}`, val: ind.B },
                    ];

                    const hasAWEHB = stressIndicatorsData !== null;

                    return (
                      <div className="bg-white border-b px-4 py-3 max-h-[50vh] overflow-y-auto">
                        {/* Stress Level History Chart */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-gray-700 uppercase">{t('stressLevelHistory')}</h4>
                            <div className="flex items-center space-x-3 text-[10px]">
                              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>&lt;4 {t('positive')}</span>
                              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>4-7 {t('negative')}</span>
                              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>&gt;7 {t('neurotic')}</span>
                            </div>
                          </div>

                          {chartData.length > 0 ? (
                            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: '160px' }}>
                              {/* Background zones */}
                              <rect x={padL} y={padT} width={plotW} height={plotH * 0.3} fill="#fef2f2" opacity="0.5" />
                              <rect x={padL} y={padT + plotH * 0.3} width={plotW} height={plotH * 0.3} fill="#fefce8" opacity="0.5" />
                              <rect x={padL} y={padT + plotH * 0.6} width={plotW} height={plotH * 0.4} fill="#f0fdf4" opacity="0.5" />

                              {/* Grid lines */}
                              <line x1={padL} y1={getY(10)} x2={padL + plotW} y2={getY(10)} stroke="#e5e7eb" strokeWidth="0.5" />
                              <line x1={padL} y1={getY(7)} x2={padL + plotW} y2={getY(7)} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="4,3" opacity="0.5" />
                              <line x1={padL} y1={getY(4)} x2={padL + plotW} y2={getY(4)} stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="4,3" opacity="0.5" />
                              <line x1={padL} y1={getY(0)} x2={padL + plotW} y2={getY(0)} stroke="#e5e7eb" strokeWidth="0.5" />

                              {/* Y axis labels */}
                              <text x={padL - 4} y={getY(10) + 3} textAnchor="end" fontSize="8" fill="#9ca3af">10</text>
                              <text x={padL - 4} y={getY(7) + 3} textAnchor="end" fontSize="8" fill="#ef4444">7</text>
                              <text x={padL - 4} y={getY(4) + 3} textAnchor="end" fontSize="8" fill="#3b82f6">4</text>
                              <text x={padL - 4} y={getY(0) + 3} textAnchor="end" fontSize="8" fill="#9ca3af">0</text>

                              {/* Line path */}
                              <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="1.5" />

                              {/* Data dots */}
                              {chartData.map((d, i) => (
                                <circle key={i} cx={getX(i)} cy={getY(d.stress)} r="2.5" fill={dotColor(d.stress)} stroke="white" strokeWidth="0.5" />
                              ))}

                              {/* X axis labels */}
                              <text x={padL} y={svgH - 4} fontSize="8" fill="#9ca3af">{`\u2190 ${t('earlier')}`}</text>
                              <text x={padL + plotW / 2} y={svgH - 4} textAnchor="middle" fontSize="8" fill="#9ca3af">
                                {chartData.length} {language === 'zh' ? '条消息' : 'messages'}
                              </text>
                              <text x={padL + plotW} y={svgH - 4} textAnchor="end" fontSize="8" fill="#9ca3af">{`${t('latest')} \u2192`}</text>
                            </svg>
                          ) : (
                            <div className="text-center py-4 text-gray-400 text-sm">
                              {language === 'zh' ? '暂无压力数据' : 'No stress data available'}
                            </div>
                          )}

                          {/* Stats row */}
                          {chartData.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-2">
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-gray-500">{t('dataPoints')}</p>
                                <p className="text-sm font-bold text-gray-700">{chartData.length}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-gray-500">{t('peakStress')}</p>
                                <p className="text-sm font-bold text-red-500">{peakStress.toFixed(1)}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-gray-500">{t('minStress')}</p>
                                <p className="text-sm font-bold text-green-500">{minStressVal.toFixed(1)}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-gray-500">{t('average')}</p>
                                <p className="text-sm font-bold text-blue-500">{avgStress.toFixed(1)}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Stress Indicators (A/W/E/H/B) */}
                        <div className="border-t pt-3">
                          <h4 className="text-xs font-bold text-gray-700 uppercase mb-1">{t('stressIndicators')}</h4>
                          <p className="text-[10px] text-gray-400 mb-3">
                            {hasAWEHB
                              ? `${t('fromLatestMsg')} — Gemini AI (0-3)`
                              : (language === 'zh' ? '暂无指标数据 — 发送新消息后显示' : 'No indicator data yet — send a new message to see scores')}
                          </p>

                          <div className="space-y-2.5">
                            {indicators.map(item => {
                              const val = item.val ?? 0;
                              const pct = Math.min((val / 3) * 100, 100);
                              const isPositive = item.key === 'A' || item.key === 'B';
                              return (
                                <div key={item.key} className="flex items-center gap-2">
                                  <span className="text-xs font-bold w-4" style={{ color: item.color }}>{item.letter}</span>
                                  <span className="text-xs text-gray-500 w-20 truncate">{item.label}</span>
                                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{ width: `${pct}%`, backgroundColor: val === 0 ? '#d1d5db' : item.color }}
                                    />
                                  </div>
                                  <span className="w-8 text-right font-mono text-xs font-semibold"
                                    style={{ color: val === 0 ? '#9ca3af' : item.color }}>
                                    {val.toFixed(1)}
                                  </span>
                                  <span className={`text-[10px] w-16 truncate ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {item.effect}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Tap to close hint */}
                        <p className="text-[10px] text-gray-400 text-center mt-3 cursor-pointer" onClick={() => setShowStressDetail(false)}>
                          {t('tapToClose')}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Content wrapper with new message indicator */}
                  <div className="relative">
                    <div
                      ref={chatScrollRef}
                      onScroll={handleChatScroll}
                      className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
                    >
                    {conversationsLoading ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p>{t('loadingConversations')}</p>
                      </div>
                    ) : conversationsData && conversationsData.length > 0 ? (
                      conversationsData.map((conv, i) => (
                        <div key={i} className="mb-4">
                          {conv.proVisible === false ? (
                            <div className="border-l-4 border-gray-300 pl-4 mb-4">
                              <p className="text-sm font-medium text-gray-500 mb-3">{conv.date}</p>
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                                <EyeOff size={16} className="text-gray-400 flex-shrink-0" />
                                <p className="text-sm text-gray-400 italic">{t('hiddenFromPro')}</p>
                              </div>
                            </div>
                          ) : conv.miniSessionGroups && conv.miniSessionGroups.length > 0 ? (
                            conv.miniSessionGroups.map((group, gi) => {
                              const isExpanded = expandedMiniSessions.has(group.miniSessionId);
                              const isLatest = gi === conv.miniSessionGroups.length - 1;
                              const msTime = (() => {
                                if (!group.startedAt) return null;
                                const ts = String(group.startedAt);
                                // Ensure UTC 'Z' suffix for correct timezone conversion
                                const d = new Date(ts.endsWith('Z') ? ts : ts + 'Z');
                                return isNaN(d.getTime()) ? new Date(ts) : d;
                              })();
                              const timeLabel = msTime && !isNaN(msTime.getTime())
                                ? `${msTime.getMonth() + 1}${language === 'zh' ? '月' : '/'}${msTime.getDate()}${language === 'zh' ? '日 ' : ' '}${String(msTime.getHours()).padStart(2, '0')}:${String(msTime.getMinutes()).padStart(2, '0')}`
                                : '';

                              return (
                                <div key={group.miniSessionId} className="mb-2">
                                  {/* Mini session collapsed header */}
                                  {!isExpanded ? (
                                    <div
                                      className="flex items-center justify-center cursor-pointer hover:bg-gray-50 py-2 transition-colors group"
                                      onClick={() => toggleMiniSession(group.miniSessionId, group.messages)}
                                    >
                                      <div className="flex-1 border-t border-gray-200"></div>
                                      <div className="flex items-center space-x-2 px-4">
                                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
                                        <span className="text-xs text-gray-400 group-hover:text-blue-500 whitespace-nowrap">
                                          {timeLabel} · {group.messageCount} {t('miniSessionMessages')}
                                        </span>
                                        {group.isActive && (
                                          <span className="text-xs text-green-500 font-medium">{t('miniSessionActive')}</span>
                                        )}
                                      </div>
                                      <div className="flex-1 border-t border-gray-200"></div>
                                    </div>
                                  ) : (
                                    <>
                                      {/* Expanded mini session header */}
                                      <div
                                        className="flex items-center justify-center cursor-pointer hover:bg-blue-50 py-2 transition-colors group"
                                        onClick={() => toggleMiniSession(group.miniSessionId, group.messages)}
                                      >
                                        <div className="flex-1 border-t border-blue-200"></div>
                                        <div className="flex items-center space-x-2 px-4">
                                          <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                                          <span className="text-xs text-blue-500 font-medium whitespace-nowrap">
                                            {timeLabel} · {group.messageCount} {t('miniSessionMessages')}
                                          </span>
                                          {group.isActive && (
                                            <span className="text-xs text-green-500 font-medium">{t('miniSessionActive')}</span>
                                          )}
                                        </div>
                                        <div className="flex-1 border-t border-blue-200"></div>
                                      </div>

                                      {/* Expanded messages */}
                                      <div className="border-l-4 border-blue-500 pl-4 mt-1 mb-2">
                                        {group.messages && group.messages.length > 0 ? (
                                          group.messages.map((msg, j) => (
                                            <div
                                              key={j}
                                              data-psvs={msg.psvs_snapshot ? JSON.stringify(msg.psvs_snapshot) : null}
                                              data-message-id={msg.id}
                                              data-role={msg.role}
                                              className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${msg.role === 'user' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-blue-50 hover:bg-blue-100'} ${String(currentPsvs?.messageId) === String(msg.id) ? 'ring-2 ring-blue-400' : ''}`}
                                              onClick={() => msg.role === 'user' && msg.psvs_snapshot && setCurrentPsvs({ ...msg.psvs_snapshot, messageId: msg.id })}
                                            >
                                              <div className="flex justify-between mb-1">
                                                <span className="text-xs font-medium">{msg.role === 'user' ? selectedClient.name : (avatars.find(a => String(a.id) === String(selectedClient.avatarId))?.name || 'Avatar')}</span>
                                                <div className="flex items-center space-x-2">
                                                  {msg.psvs_snapshot && (
                                                    <span className={`w-2 h-2 rounded-full ${
                                                      msg.psvs_snapshot.energy_state === 'neurotic' ? 'bg-red-500' :
                                                      msg.psvs_snapshot.energy_state === 'negative' ? 'bg-yellow-500' :
                                                      'bg-green-500'
                                                    }`} title={`Stress: ${msg.psvs_snapshot.stress_level?.toFixed(1)}`}></span>
                                                  )}
                                                  <span className="text-xs text-gray-400">
                                                    {msg.timestamp ? new Date(msg.timestamp.endsWith('Z') ? msg.timestamp : msg.timestamp + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                                                  </span>
                                                </div>
                                              </div>
                                              <p className="text-sm">{msg.content}</p>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-sm text-gray-400 italic">{t('noMessagesInSession')}</p>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="border-l-4 border-gray-300 pl-4">
                              <p className="text-sm font-medium text-gray-500 mb-3">{conv.date}</p>
                              <p className="text-sm text-gray-400 italic">{t('noMessagesInSession')}</p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">{t('noConversationsYet')}</div>
                    )}
                    </div>

                    {/* New messages indicator */}
                    {hasNewMessages && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                        <button
                          onClick={scrollToLatestMessage}
                          className="pointer-events-auto bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors animate-bounce"
                        >
                          <ArrowDown className="w-4 h-4" />
                          <span className="text-sm font-medium">{language === 'zh' ? '新消息' : 'New Messages'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('settings')}</h2>
              <LanguageToggle />
            </div>

            {/* Profile Settings */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('profileSettings')}</h3>

              <div className="space-y-4">
                {/* Nickname */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('nickname')}</label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={t('nickname')}
                  />
                </div>

                {/* Sex */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('sex')}</label>
                  <select
                    value={profileForm.sex}
                    onChange={(e) => setProfileForm({ ...profileForm, sex: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">{t('sex')}</option>
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('age')}</label>
                  <input
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={t('age')}
                    min="1"
                    max="150"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                  <input
                    type="email"
                    defaultValue={currentUser?.email || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    disabled
                  />
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('currentPassword')}</label>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPassword')}</label>
                  <input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                {/* Success/Error Message */}
                {profileMessage && (
                  <p className={`text-sm text-center ${profileMessage === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {profileMessage === 'success' ? (language === 'zh' ? '保存成功' : 'Saved successfully') : profileMessage}
                  </p>
                )}

                {/* Save Changes Button */}
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50">
                  {t('saveChanges')}
                </button>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
              {/* Log Out */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('signOut')}</span>
              </button>

              {/* Delete Account */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span>{t('deleteAccount')}</span>
              </button>
            </div>

            {/* Contributors Section */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">{t('contributors')}</h3>
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
          <p className="text-xs text-gray-400">{t('version')} {APP_VERSION}</p>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto flex items-center py-3 pb-6">
          <button
            onClick={() => setActiveTab('avatars')}
            className={`flex-1 flex flex-col items-center justify-center py-2 ${activeTab === 'avatars' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <Brain className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">{t('aiAvatars')}</span>
          </button>
          <button
            onClick={() => { setActiveTab('clients'); loadUserData(); }}
            className={`flex-1 flex flex-col items-center justify-center py-2 ${activeTab === 'clients' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">{t('clients')}</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex flex-col items-center justify-center py-2 ${activeTab === 'settings' ? 'text-purple-500' : 'text-gray-400'}`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">{t('settings')}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default HamoPro;