// Hamo Pro API Service v1.5.2
// Integrates with Hamo-UME Backend v1.5.2
// Production: https://api.hamo.ai/api
// AWS Deployment with Custom Domain and HTTPS

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.hamo.ai/api';

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
  async registerPro(fullName, profession, email, password, proInviteCode, language = 'en') {
    try {
      console.log('🔵 Registering Pro:', { email, fullName, profession }); // Debug
      const body = { full_name: fullName, profession, email, password, language };
      if (proInviteCode) body.invitation_code = proInviteCode;

      const response = await this.request('/auth/registerPro', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify(body),
      });

      console.log('✅ Registration successful:', response); // Debug

      // PHIPA 6.1.4: Don't auto-login after registration — user must login with MFA
      return {
        success: true,
        user: response.user,
        registeredOnly: true,  // Signal to frontend: show "please login" message
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

  async loginPro(email, password, language = 'en') {
    try {
      const response = await this.request('/auth/loginPro', {
        method: 'POST',
        skipAuth: true,
        headers: { 'X-MFA-Support': 'true' },
        body: JSON.stringify({ email, password, language }),
      });

      // MFA required — return pending state
      if (response.mfa_required) {
        return {
          success: false,
          mfaRequired: true,
          mfaToken: response.mfa_token,
          message: response.message,
        };
      }

      // Direct login — store tokens
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

  async verifyMfa(mfaToken, code, trustDevice = true) {
    try {
      const response = await this.request('/auth/verify-mfa', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          mfa_token: mfaToken,
          code: code,
          trust_device: trustDevice,
        }),
      });

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

  async resendMfa(mfaToken) {
    try {
      const response = await this.request('/auth/resend-mfa', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({ mfa_token: mfaToken, code: '', trust_device: true }),
      });
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, error: error.message };
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

  // Request password reset code
  async requestPasswordReset(email, language = 'en') {
    try {
      const response = await this.request('/auth/requestPasswordReset', {
        method: 'POST',
        body: JSON.stringify({ email, language }),
        skipAuth: true,
      });
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Reset password with code
  async resetPassword(email, code, newPassword) {
    try {
      const response = await this.request('/auth/resetPassword', {
        method: 'POST',
        body: JSON.stringify({ email, code, new_password: newPassword }),
        skipAuth: true,
      });
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // Get current Pro user profile
  async getProProfile() {
    try {
      const response = await this.request('/users/me/pro');
      return { success: true, user: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update Pro profile (name, sex, age, password)
  async updateProProfile(data) {
    try {
      const response = await this.request('/pro/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Pro verification status
  async getVerification() {
    try {
      const response = await this.request('/pro/verification');
      return { success: true, ...response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Submit Pro verification info
  async submitVerification(data) {
    try {
      const response = await this.request('/pro/verification', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return { success: true, ...response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Pro-invite-Pro: generate invite code
  async generateProInvite() {
    try {
      const response = await this.request('/pro/invitation/generate-pro-invite', { method: 'POST' });
      return { success: true, ...response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Pro-invite-Pro: get all invite records
  async getProInvites() {
    try {
      const response = await this.request('/pro/invitation/pro-invites');
      return { success: true, ...response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get avatar creation quota
  async getAvatarQuota() {
    try {
      const response = await this.request('/pro/avatar-quota');
      return { success: true, ...response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Request account-deletion verification code (sent via email)
  async requestDeleteProAccountCode(language = 'en') {
    try {
      await this.request('/pro/account/delete-request', {
        method: 'POST',
        body: JSON.stringify({ language }),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete Pro account after verifying email code
  async deleteProAccount(code) {
    try {
      await this.request('/pro/account', {
        method: 'DELETE',
        body: JSON.stringify({ code }),
      });
      this.clearTokens();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get commission records for the Pro user
  async getCommissions() {
    try {
      const response = await this.request('/pro/commissions');
      return { success: true, ...response };
    } catch (error) {
      return { success: false, error: error.message, commissions: [], total_commission: 0, total_records: 0 };
    }
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
        voice_type: avatarData.voice_type || 'standard_female',
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
          therapeuticApproaches: Array.isArray(response.therapeutic_approaches) ? response.therapeutic_approaches : (response.therapeutic_approaches ? String(response.therapeutic_approaches).split(',').map(s => s.trim()) : []),
          about: response.about,
          experienceYears: response.experience_years,
          experienceMonths: response.experience_months,
          avatarPicture: response.avatar_picture || null,
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
        voice_type: avatarData.voice_type,
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
          therapeuticApproaches: Array.isArray(response.therapeutic_approaches) ? response.therapeutic_approaches : (response.therapeutic_approaches ? String(response.therapeutic_approaches).split(',').map(s => s.trim()) : []),
          about: response.about,
          experienceYears: response.experience_years,
          experienceMonths: response.experience_months,
          avatarPicture: response.avatar_picture || null,
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

  // Toggle avatar public/private visibility
  async updateAvatarVisibility(avatarId, isPublic) {
    try {
      await this.request(`/avatars/${avatarId}`, {
        method: 'PUT',
        body: JSON.stringify({ is_public: isPublic }),
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to update avatar visibility:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Upload avatar picture (multipart/form-data)
  async uploadAvatarPicture(avatarId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const accessToken = this.getAccessToken();
      const response = await fetch(`${this.baseURL}/avatars/${avatarId}/picture`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to upload avatar picture');
      console.log('✅ Avatar picture uploaded:', data);
      return { success: true, url: data.url };
    } catch (error) {
      console.error('❌ Failed to upload avatar picture:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Upload voice sample for voice cloning
  async uploadAvatarVoice(avatarId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const accessToken = this.getAccessToken();
      const response = await fetch(`${this.baseURL}/avatars/${avatarId}/voice`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to clone voice');
      console.log('✅ Voice cloned:', data);
      return { success: true, voiceId: data.voice_id, voiceStatus: data.voice_status };
    } catch (error) {
      console.error('❌ Failed to clone voice:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Delete cloned voice from avatar
  async deleteAvatarVoice(avatarId) {
    try {
      const response = await this.request(`/avatars/${avatarId}/voice`, {
        method: 'DELETE',
      });
      console.log('✅ Voice deleted');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete voice:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Preview cloned voice with sample text
  async previewAvatarVoice(avatarId, text) {
    try {
      const accessToken = this.getAccessToken();
      const response = await fetch(`${this.baseURL}/avatars/${avatarId}/voice/preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text || null }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to preview voice');
      }
      const blob = await response.blob();
      return { success: true, audioBlob: blob };
    } catch (error) {
      console.error('❌ Failed to preview voice:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Preview standard voice (standard_female / standard_male)
  async previewStandardVoice(voiceType, text) {
    try {
      const accessToken = this.getAccessToken();
      const response = await fetch(`${this.baseURL}/voices/preview?voice_type=${voiceType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text || null }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to preview voice');
      }
      const blob = await response.blob();
      return { success: true, audioBlob: blob };
    } catch (error) {
      console.error('❌ Failed to preview standard voice:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Generate TTS audio for a message
  async generateMessageAudio(messageId) {
    try {
      const response = await this.request(`/messages/${messageId}/audio`, {
        method: 'POST',
      });
      return { success: true, audioUrl: response.audio_url, cached: response.cached };
    } catch (error) {
      console.error('❌ Failed to generate audio:', error.message);
      return { success: false, error: error.message };
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
          therapeuticApproaches: (() => {
            const raw = avatar.therapeutic_approaches || avatar.therapeuticApproaches;
            if (Array.isArray(raw)) return raw;
            if (typeof raw === 'string' && raw) return raw.split(',').map(s => s.trim());
            return [];
          })(),
          about: avatar.about,
          experienceYears: avatar.experience_years || avatar.experienceYears,
          experienceMonths: avatar.experience_months || avatar.experienceMonths,
          avatarPicture: avatar.avatar_picture || null,
          likeCount: avatar.like_count || 0,
          understoodCount: avatar.understood_count || 0,
          clientCount: avatar.client_count || 0,
          voiceType: avatar.voice_type || null,
          voiceId: avatar.voice_id || null,
          voiceStatus: avatar.voice_status || null,
          isPublic: avatar.is_public !== false,  // default true for existing avatars without field
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
          profilePicture: client.profile_picture || null,
          lastActive: client.last_active || null,
          totalMiniSessions: client.total_mini_sessions || 0,
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
          dominant_emotions: data.emotion_pattern?.dominant_emotions ? data.emotion_pattern.dominant_emotions.split(',').map(t => t.trim()).filter(Boolean) : [],
          triggers: data.emotion_pattern?.triggers ? data.emotion_pattern.triggers.split(',').map(t => t.trim()).filter(Boolean) : [],
          coping_mechanisms: data.emotion_pattern?.coping_mechanisms ? data.emotion_pattern.coping_mechanisms.split(',').map(t => t.trim()).filter(Boolean) : [],
          description: '',
        },
        cognition_beliefs: {
          core_beliefs: data.cognition_beliefs?.core_beliefs ? data.cognition_beliefs.core_beliefs.split(',').map(t => t.trim()).filter(Boolean) : [],
          cognitive_distortions: data.cognition_beliefs?.cognitive_distortions ? data.cognition_beliefs.cognitive_distortions.split(',').map(t => t.trim()).filter(Boolean) : [],
          thinking_patterns: data.cognition_beliefs?.thinking_patterns ? data.cognition_beliefs.thinking_patterns.split(',').map(t => t.trim()).filter(Boolean) : [],
          self_perception: data.cognition_beliefs?.self_perception || '',
          world_perception: data.cognition_beliefs?.world_perception || '',
          future_perception: data.cognition_beliefs?.future_perception || '',
        },
        relationship_manipulations: {
          attachment_style: data.relationship_manipulations?.attachment_style || 'secure',
          relationship_patterns: data.relationship_manipulations?.relationship_patterns ? data.relationship_manipulations.relationship_patterns.split(',').map(t => t.trim()).filter(Boolean) : [],
          communication_style: data.relationship_manipulations?.communication_style || '',
          conflict_resolution: data.relationship_manipulations?.conflict_resolution || '',
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

  async getBatchInvitation(avatarId) {
    try {
      const response = await this.request(`/pro/invitation/batch/${avatarId}`, { method: 'GET' });
      return response;
    } catch (error) {
      return { found: false };
    }
  }

  async generateBatchInvitation(avatarId, maxUses = 10, expiresDays = 7) {
    try {
      const response = await this.request('/pro/invitation/generate-batch', {
        method: 'POST',
        body: JSON.stringify({ avatar_id: String(avatarId), max_uses: maxUses, expires_days: expiresDays }),
      });
      return { success: true, invitationCode: response.invitation_code, expiresAt: response.expires_at, maxUses: response.max_uses };
    } catch (error) {
      console.error('❌ Failed to generate batch invitation:', error.message);
      return { success: false, error: error.message };
    }
  }

  async updateInvitationSettings(code, settings) {
    try {
      const response = await this.request(`/pro/invitation/${code}/settings`, {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      return { success: true, ...response };
    } catch (error) {
      console.error('❌ Failed to update invitation settings:', error.message);
      return { success: false, error: error.message };
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

  // Update AI Mind data (PUT /api/mind/{mind_id})
  async updateMind(mindId, updateData) {
    try {
      console.log('🔵 Updating AI Mind:', mindId, updateData);
      const response = await this.request(`/mind/${mindId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      console.log('✅ AI Mind updated:', response);
      return { success: true, mind: response };
    } catch (error) {
      console.error('❌ Failed to update AI Mind:', error.message);
      return { success: false, error: error.message };
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

  // Submit per-message supervision note for an avatar message
  async superviseMessage(messageId, text) {
    try {
      console.log('🔵 Supervising message:', messageId);
      const response = await this.request(`/messages/${messageId}/supervise`, {
        method: 'PUT',
        body: JSON.stringify({ text }),
      });

      console.log('✅ Message supervision saved:', response);
      return {
        success: true,
        supervision: response.supervision,
      };
    } catch (error) {
      console.error('❌ Failed to supervise message:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete supervision note from a message
  async deleteSupervision(messageId) {
    try {
      console.log('🔵 Deleting supervision for message:', messageId);
      const response = await this.request(`/messages/${messageId}/supervise`, {
        method: 'DELETE',
      });

      console.log('✅ Supervision deleted:', response);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete supervision:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Supervision Directives (Policy Network)
  async getDirectives(mindId) {
    try {
      const response = await this.request(`/mind/${mindId}/directives`);
      return { success: true, directives: response.directives || [] };
    } catch (error) {
      return { success: false, error: error.message, directives: [] };
    }
  }

  async createDirective(mindId, directiveType, text) {
    try {
      const response = await this.request(`/mind/${mindId}/directives`, {
        method: 'POST',
        body: JSON.stringify({ directive_type: directiveType, text }),
      });
      return { success: true, directive: response.directive };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateDirective(directiveId, directiveType, text) {
    try {
      const response = await this.request(`/directives/${directiveId}`, {
        method: 'PUT',
        body: JSON.stringify({ directive_type: directiveType, text }),
      });
      return { success: true, directive: response.directive };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteDirective(directiveId) {
    try {
      await this.request(`/directives/${directiveId}`, { method: 'DELETE' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get all specialties with i18n names
  async getSpecialties() {
    try {
      const response = await fetch(`${this.baseURL}/specialties`);
      if (!response.ok) throw new Error('Failed to fetch specialties');
      const data = await response.json();
      return { success: true, specialties: data };
    } catch (error) {
      console.error('❌ Failed to fetch specialties:', error.message);
      return { success: false, error: error.message, specialties: [] };
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
          mini_session_id: msg.mini_session_id || null,
          // Support multiple field names: psvs_snapshot, psvs, or snapshot
          psvs_snapshot: msg.psvs_snapshot || msg.psvs || msg.snapshot || null,
          supervision: msg.supervision || null,
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

  // Get mini sessions for a specific session
  async getMiniSessions(sessionId) {
    try {
      const response = await this.request(`/session/${sessionId}/mini-sessions`, {
        method: 'GET',
      });

      const miniSessions = Array.isArray(response) ? response : (response.data || response.mini_sessions || []);

      return {
        success: true,
        miniSessions: miniSessions.map(ms => ({
          id: ms.id,
          sessionId: ms.session_id,
          startedAt: ms.started_at,
          endedAt: ms.ended_at,
          messageCount: ms.message_count || 0,
          isActive: ms.is_active || false,
        })),
      };
    } catch (error) {
      console.error('❌ Failed to fetch mini sessions:', error.message);
      return {
        success: false,
        error: error.message,
        miniSessions: [],
      };
    }
  }

  // Get messages with stress indicators via portal API (includes A/W/E/H/B data)
  async getPortalMessages(mindId) {
    try {
      const response = await fetch(`${this.baseURL}/portal/mind/${mindId}/messages`);
      if (!response.ok) throw new Error('Portal messages not found');
      const data = await response.json();
      return { success: true, sessions: data };
    } catch (error) {
      console.error('❌ Failed to fetch portal messages:', error.message);
      return { success: false, error: error.message, sessions: [] };
    }
  }

  // ── Crisis Alerts ──────────────────────────────────────────

  /**
   * Open an SSE stream to receive real-time crisis alerts.
   * Returns the EventSource instance — caller must call .close() on logout.
   */
  subscribeToCrisisAlerts(onAlert, onConnected, onError) {
    const token = this.getAccessToken()
    if (!token) return null
    const es = new EventSource(`${this.baseURL}/pro/alerts/stream?token=${encodeURIComponent(token)}`)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'connected') {
          onConnected && onConnected()
        } else if (data.type === 'crisis_alert') {
          onAlert && onAlert(data.alert)
        }
      } catch (err) {
        console.error('❌ SSE parse error:', err)
      }
    }
    es.onerror = (err) => {
      console.error('❌ SSE error:', err)
      onError && onError(err)
    }
    return es
  }

  /** Load all crisis alerts on login (for initial unread count). */
  async getCrisisAlerts() {
    try {
      const response = await this.request('/pro/alerts')
      if (!response.ok) throw new Error('Failed to load alerts')
      const data = await response.json()
      return { success: true, alerts: data.alerts || [] }
    } catch (error) {
      console.error('❌ Failed to load crisis alerts:', error.message)
      return { success: false, alerts: [] }
    }
  }

  /** Acknowledge (dismiss) a crisis alert. */
  async acknowledgeCrisisAlert(alertId) {
    try {
      const response = await this.request(`/pro/alerts/${alertId}/acknowledge`, { method: 'POST' })
      if (!response.ok) throw new Error('Failed to acknowledge alert')
      return { success: true }
    } catch (error) {
      console.error('❌ Failed to acknowledge alert:', error.message)
      return { success: false }
    }
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;