// Hamo Pro API Service v1.3.4
// Integrates with Hamo-UME Backend v1.3.4
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
        theory: avatarData.theory || '',
        methodology: avatarData.methodology || '',
        principles: avatarData.principles || '',
        description: avatarData.description || '',
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
          theory: response.theory,
          methodology: response.methodology,
          principles: response.principles,
          description: response.description,
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
          theory: avatar.theory,
          methodology: avatar.methodology,
          principles: avatar.principles,
          description: avatar.description,
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

  // Get all clients for the current Pro user
  async getClients() {
    try {
      console.log('🔵 Fetching clients...');
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
          emotionPattern: client.emotion_pattern || client.emotionPattern,
          personality: client.personality,
          cognition: client.cognition,
          goals: client.goals,
          therapyPrinciples: client.therapy_principles || client.therapyPrinciples,
          avatarId: client.avatar_id || client.avatarId,
          connectedAt: client.connected_at || client.connectedAt,
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

  // Generate invitation code for an avatar
  // This code is used to link a Pro's Avatar with a Client
  // Note: client_id is not needed - the invitation code will be used by the client to register
  async generateInvitationCode(avatarId) {
    try {
      const requestBody = {
        avatar_id: String(avatarId),
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
      // Fallback: generate code locally if API not available
      console.warn('API not available, generating code locally:', error.message);
      const code = `HAMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      return {
        success: true,
        invitationCode: code,
        expiresAt: expiresAt,
        fallback: true,
      };
    }
  }

  // Get AI Mind data for a specific user and avatar
  async getMind(userId, avatarId) {
    try {
      console.log('🔵 Fetching AI Mind for user:', userId, 'avatar:', avatarId);
      const response = await this.request(`/mind/${userId}/${avatarId}`, {
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
  async submitSupervision(userId, avatarId, section, feedback) {
    try {
      console.log('🔵 Submitting supervision for section:', section);
      const response = await this.request(`/mind/${userId}/${avatarId}/supervise`, {
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
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;