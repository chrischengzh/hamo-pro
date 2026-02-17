// Hamo Pro API Service v1.5.2
// Integrates with Hamo-UME Backend v1.5.2
// Production: https://api.hamo.ai/api
// AWS Deployment with Custom Domain and HTTPS

const API_BASE_URL = 'https://api.hamo.ai/api';

// Token Management
const TOKEN_KEY = 'hamo_pro_access_token';
const REFRESH_TOKEN_KEY = 'hamo_pro_refresh_token';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get stored tokens
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  // Store tokens
  setTokens(accessToken, refreshToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  // Clear tokens
  clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  // Make HTTP request with auto token refresh
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const accessToken = this.getAccessToken();

    console.log('🔵 API Request:', url); // Debug log

    // Add authorization header if token exists
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      console.log('🔵 Request options:', { method: options.method, headers }); // Debug log
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('🔵 Response status:', response.status); // Debug log

      // Handle 401 - Token expired
      if (response.status === 401 && !options.skipAuth) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry original request with new token
          return this.request(endpoint, options);
        } else {
          // Refresh failed, clear tokens and throw error
          this.clearTokens();
          throw new Error('Session expired. Please login again.');
        }
      }

      // Parse response
      const data = await response.json();
      console.log('🔵 Response data:', data); // Debug log

      if (!response.ok) {
        // Handle FastAPI validation errors (detail is an array)
        let errorMessage = 'Request failed';
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
          console.error('🔴 Validation errors:', data.detail);
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        }
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('🔴 API Request Error:', error);
      throw error;
    }
  }

  // Auth APIs
  async registerPro(fullName, profession, email, password) {
    try {
      console.log('🔵 Registering Pro:', { email, fullName, profession }); // Debug
      
      const response = await this.request('/auth/registerPro', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          full_name: fullName,
          profession: profession,
          email: email,
          password: password,
        }),
      });

      console.log('✅ Registration successful:', response); // Debug

      // Store tokens
      if (response.access_token) {
        this.setTokens(response.access_token, response.refresh_token);
      }

      return {
        success: true,
        user: response.user,
        accessToken: response.access_token,
      };
    } catch (error) {
      console.error('❌ Registration failed:', error); // Debug
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async loginPro(email, password) {
    try {
      const response = await this.request('/auth/loginPro', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      // Store tokens
      if (response.access_token) {
        this.setTokens(response.access_token, response.refresh_token);
      }

      return {
        success: true,
        user: response.user,
        accessToken: response.access_token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await this.request('/auth/refreshPro', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (response.access_token) {
        this.setTokens(response.access_token, response.refresh_token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async logout() {
    this.clearTokens();
    return { success: true };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // Create a new avatar for the Pro user
  // Returns the avatar with backend-generated ID
  async createAvatar(avatarData) {
    try {
      const requestBody = {
        name: avatarData.name,
        specialty: avatarData.specialty || '',
        therapeutic_approaches: avatarData.therapeutic_approaches || [],
        about: avatarData.about || '',
        experience_years: avatarData.experience_years || 0,
        experience_months: avatarData.experience_months || 0,
        specializations: avatarData.specializations || [],
      };
      console.log('🔵 Creating avatar with:', requestBody);

      const response = await this.request('/avatars', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      console.log('✅ Avatar created:', response);

      return {
        success: true,
        avatar: {
          id: response.id,
          name: response.name,
          specialty: response.specialty,
          therapeuticApproaches: response.therapeutic_approaches,
          about: response.about,
          experienceYears: response.experience_years,
          experienceMonths: response.experience_months,
          specializations: response.specializations,
        },
      };
    } catch (error) {
      console.error('❌ Failed to create avatar:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Update an existing avatar
  async updateAvatar(avatarId, avatarData) {
    try {
      const requestBody = {
        name: avatarData.name,
        specialty: avatarData.specialty || '',
        therapeutic_approaches: avatarData.therapeutic_approaches || [],
        about: avatarData.about || '',
        experience_years: avatarData.experience_years || 0,
        experience_months: avatarData.experience_months || 0,
      };
      console.log('🔵 Updating avatar:', avatarId, requestBody);

      const response = await this.request(`/avatars/${avatarId}`, {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      console.log('✅ Avatar updated:', response);

      return {
        success: true,
        avatar: {
          id: response.id,
          name: response.name,
          specialty: response.specialty,
          therapeuticApproaches: response.therapeutic_approaches,
          about: response.about,
          experienceYears: response.experience_years,
          experienceMonths: response.experience_months,
        },
      };
    } catch (error) {
      console.error('❌ Failed to update avatar:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get all avatars for the current Pro user
  async getAvatars() {
    try {
      console.log('🔵 Fetching avatars...');
      const response = await this.request('/avatars', {
        method: 'GET',
      });

      console.log('✅ Avatars fetched:', response);

      // Handle both array response and object with data property
      const avatars = Array.isArray(response) ? response : (response.data || []);

      return {
        success: true,
        avatars: avatars.map(avatar => ({
          id: avatar.id,
          name: avatar.name,
          specialty: avatar.specialty,
          therapeuticApproaches: avatar.therapeutic_approaches || avatar.therapeuticApproaches,
          about: avatar.about,
          experienceYears: avatar.experience_years || avatar.experienceYears,
          experienceMonths: avatar.experience_months || avatar.experienceMonths,
          specializations: avatar.specializations,
          // Legacy fields for backward compatibility
          theory: avatar.theory,
          methodology: avatar.methodology,
          principles: avatar.principles,
        })),
      };
    } catch (error) {
      console.error('❌ Failed to fetch avatars:', error.message);
      return {
        success: false,
        error: error.message,
        avatars: [],
      };
    }
  }

  // Get all clients (AI Minds) for the current Pro user
  // Returns both connected and pending (not yet bound) clients
  async getClients() {
    try {
      console.log('🔵 Fetching clients (AI Minds)...');
      const response = await this.request('/clients', {
        method: 'GET',
      });

      console.log('✅ Clients fetched:', response);

      // Handle both array response and object with data property
      const clients = Array.isArray(response) ? response : (response.data || []);

      return {
        success: true,
        clients: clients.map(client => ({
          id: client.id,
          name: client.name || client.nickname,
          sex: client.sex || client.gender,
          age: client.age,
          avatarId: client.avatar_id || client.avatarId,
          connectedAt: client.connected_at || client.connectedAt,
          userId: client.user_id || client.userId,
          sessions: client.sessions || 0,
          avgTime: client.avg_time || client.avgTime || 0,
          conversations: client.conversations || [],
        })),
      };
    } catch (error) {
      console.error('❌ Failed to fetch clients:', error.message);
      return {
        success: false,
        error: error.message,
        clients: [],
      };
    }
  }

  // Create AI Mind (client profile) for an avatar
  // This is called when Pro initializes a client
  async createMind(data) {
    try {
      const requestBody = {
        avatar_id: String(data.avatarId),
        name: data.name,
        sex: data.sex || '',
        age: data.age ? parseInt(data.age) : null,
        personality: {
          primary_traits: data.personality ? data.personality.split(',').map(t => t.trim()) : [],
          description: data.personality || '',
        },
        emotion_pattern: {
          dominant_emotions: [],
          triggers: data.emotionPattern ? data.emotionPattern.split(',').map(t => t.trim()) : [],
          coping_mechanisms: [],
          description: data.emotionPattern || '',
        },
        cognition_beliefs: {
          core_beliefs: data.cognition ? data.cognition.split(',').map(t => t.trim()) : [],
          cognitive_distortions: [],
          thinking_patterns: [],
          self_perception: '',
          world_perception: '',
          future_perception: '',
        },
        relationship_manipulations: {
          attachment_style: 'secure',
          relationship_patterns: [],
          communication_style: '',
          conflict_resolution: '',
        },
        goals: data.goals || '',
        therapy_principles: data.therapyPrinciples || '',
      };
      console.log('🔵 Creating AI Mind with:', requestBody);

      const response = await this.request('/mind', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      console.log('✅ AI Mind created:', response);

      return {
        success: true,
        mind: response,
      };
    } catch (error) {
      console.error('❌ Failed to create AI Mind:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Generate invitation code for an AI Mind
  // This code is used to link a Client with a specific AI Mind
  async generateInvitationCode(mindId) {
    try {
      const requestBody = {
        mind_id: String(mindId),
      };
      console.log('🔵 Generating invitation code with:', requestBody);

      const response = await this.request('/pro/invitation/generate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      return {
        success: true,
        invitationCode: response.invitation_code,
        expiresAt: response.expires_at,
      };
    } catch (error) {
      // ⚠️ API FAILED - DO NOT generate fake codes that don't exist in database
      console.error('❌ Failed to generate invitation code:', error.message);
      console.error('❌ THIS IS A REAL ERROR - The backend API is failing');

      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get AI Mind data by mind ID
  async getMind(mindId) {
    try {
      console.log('🔵 Fetching AI Mind:', mindId);
      const response = await this.request(`/mind/${mindId}`, {
        method: 'GET',
      });

      console.log('✅ AI Mind fetched:', response);

      return {
        success: true,
        mind: response,
      };
    } catch (error) {
      console.error('❌ Failed to fetch AI Mind:', error.message);
      return {
        success: false,
        error: error.message,
        mind: null,
      };
    }
  }

  // Submit supervision feedback for a specific AI Mind section
  async submitSupervision(mindId, section, feedback) {
    try {
      console.log('🔵 Submitting supervision for mind:', mindId, 'section:', section);
      const response = await this.request(`/mind/${mindId}/supervise`, {
        method: 'POST',
        body: JSON.stringify({
          section: section,
          feedback: feedback,
        }),
      });

      console.log('✅ Supervision submitted:', response);

      return {
        success: true,
        response: response,
      };
    } catch (error) {
      console.error('❌ Failed to submit supervision:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get PSVS profile for a specific mind
  async getPsvsProfile(mindId) {
    try {
      console.log('🔵 Fetching PSVS profile for mind:', mindId);
      const response = await this.request(`/mind/${mindId}/psvs`, {
        method: 'GET',
      });

      console.log('✅ PSVS profile fetched:', response);

      return {
        success: true,
        psvs: response,
      };
    } catch (error) {
      console.error('❌ Failed to fetch PSVS profile:', error.message);
      return {
        success: false,
        error: error.message,
        psvs: null,
      };
    }
  }

  // Get all sessions for a specific mind
  async getSessions(mindId) {
    try {
      console.log('🔵 Fetching sessions for mind:', mindId);
      const response = await this.request(`/session/mind/${mindId}`, {
        method: 'GET',
      });

      console.log('✅ Sessions fetched:', response);

      // Handle both array response and object with data property
      const sessions = Array.isArray(response) ? response : (response.data || response.sessions || []);

      return {
        success: true,
        sessions: sessions,
      };
    } catch (error) {
      console.error('❌ Failed to fetch sessions:', error.message);
      return {
        success: false,
        error: error.message,
        sessions: [],
      };
    }
  }

  // Get messages for a specific session
  async getSessionMessages(sessionId) {
    try {
      console.log('🔵 Fetching messages for session:', sessionId);
      const response = await this.request(`/session/${sessionId}/messages`, {
        method: 'GET',
      });

      console.log('✅ Messages fetched:', response);

      // Debug: Log raw message structure to check PSVS field names and timestamp
      // Check both array format and object format
      const sampleMsg = Array.isArray(response) ? response[0] : (response?.messages?.[0] || response?.data?.[0]);
      if (sampleMsg) {
        console.log('🔍 Sample message structure:', Object.keys(sampleMsg));
        console.log('🔍 Sample message data:', sampleMsg);
        console.log('🕐 Timestamp check:', {
          raw: sampleMsg.timestamp,
          parsed: new Date(sampleMsg.timestamp).toString(),
          local: new Date(sampleMsg.timestamp).toLocaleTimeString(),
        });
      }

      // Handle multiple response formats:
      // 1. Array of messages directly
      // 2. Object with data property containing array
      // 3. Object with messages property containing array (new format from hamo-ume)
      let messages = [];
      if (Array.isArray(response)) {
        messages = response;
      } else if (response?.data && Array.isArray(response.data)) {
        messages = response.data;
      } else if (response?.messages && Array.isArray(response.messages)) {
        messages = response.messages;
      }

      return {
        success: true,
        messages: messages.map(msg => ({
          id: msg.id || msg.message_id,  // Support both id and message_id
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          // Support multiple field names: psvs_snapshot, psvs, or snapshot
          psvs_snapshot: msg.psvs_snapshot || msg.psvs || msg.snapshot || null,
        })),
      };
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error.message);
      return {
        success: false,
        error: error.message,
        messages: [],
      };
    }
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;