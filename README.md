# Hamo Pro 🧠

> **Every Therapist Avatar has a Real AI Mind**

AI Therapy Avatar Management Platform for Psychology Therapists

## !! The code was written entirely by AI!!

## Overview

Hamo Pro is a professional application designed for psychology therapists to create and manage AI-powered therapy avatars. Therapists can configure personalized AI instances for each client, share access via QR codes, and monitor therapeutic conversations in real-time.

## Features

### 🤖 AI Avatar Creation
- Create custom AI avatars with specific therapeutic approaches
- Define psychology theory/school of thought
- Set methodology and core principles
- Multiple avatars per therapist account

### 👤 Client Instance Management
- Initialize AI avatar instances for individual clients
- Comprehensive client profiles including:
  - Demographics (name, sex, age)
  - Emotion patterns
  - Personality characteristics
  - Cognitive features and beliefs
  - Therapy goals
  - Therapeutic principles
- Invitation code generation for client connection
- Connection status display (Connected/Pending) with connection date

### 🧠 AI Mind Profile
- View AI-generated psychological profiles for each client
- Personality assessment using Big Five (OCEAN) model:
  - Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- Emotion pattern analysis:
  - Dominant emotions, triggers, coping mechanisms
  - Emotional stability scoring
- Cognition & beliefs tracking:
  - Core beliefs and cognitive distortions
  - Self, world, and future perceptions
- Relationship pattern analysis:
  - Attachment style identification
  - Communication style and conflict resolution patterns
  - Trust level and intimacy comfort scoring
- Confidence score and last updated timestamp

### 📊 Monitoring Dashboard
- Real-time analytics per client:
  - Total chat sessions
  - Average session duration
  - Session frequency patterns
- Detailed conversation viewer:
  - Full transcript access
  - Timestamp information
  - Word-by-word conversation history
  - Searchable and filterable

### 🔐 Authentication System
- User sign up with professional credentials
- Secure sign in/sign out
- Account deletion with confirmation
- Per-user data isolation

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks (useState)

## Installation

### Prerequisites
- Node.js 16+ and npm

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/hamo-pro.git
cd hamo-pro
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:5173`

## Project Structure

```
hamo-pro/
├── public/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── services/
│       └── api.js       # API service for backend integration
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

## Usage Guide

### For Therapists

1. **Create an Account**
   - Sign up with your full name, profession, email, and password
   - Your data is stored separately from other therapists

2. **Create AI Avatars**
   - Navigate to the "AI Avatars" tab
   - Click "Create Avatar"
   - Fill in avatar details:
     - Avatar name (e.g., "Dr. Compassion")
     - Psychology theory (e.g., "Cognitive Behavioral Therapy")
     - Methodology (e.g., "Solution-Focused Brief Therapy")
     - Core principles (e.g., "Empathy, Active Listening")

3. **Initialize Client Instances**
   - Navigate to the "Client Instances" tab
   - Click "Initialize Client"
   - Complete the client profile:
     - Basic demographics
     - Psychological profile
     - Therapy goals
     - Therapeutic principles
   - Assign an AI avatar to the client
   - Generate and share the QR code with your client

4. **Monitor Client Progress**
   - Navigate to the "Clients" tab
   - View session statistics on each client card
   - Check connection status (Connected with date / Pending invitation)
   - Click "AI Mind" to view AI-generated psychological profile
   - Click "View Chats" to see detailed conversation transcripts
   - Track therapeutic progress over time
   - Navigate to "Dashboard" tab for analytics overview

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Building for Production

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

## Security Notes

⚠️ **Important**: This is a prototype application. For production use:

- Implement proper backend authentication (JWT, OAuth)
- Use secure password hashing (bcrypt, argon2)
- Store data in a secure database (PostgreSQL, MongoDB)
- Add HTTPS/SSL encryption
- Implement HIPAA-compliant data handling
- Add role-based access control (RBAC)
- Implement session management and timeouts

## API Integration

Hamo Pro integrates with the Hamo-UME backend API:

- **Base URL**: `https://api.hamo.ai/api`
- **Authentication**: JWT tokens with refresh mechanism
- **Endpoints**:
  - `POST /auth/registerPro` - Register new therapist
  - `POST /auth/loginPro` - Login therapist
  - `POST /auth/refreshPro` - Refresh access token
  - `GET /avatars` - List all avatars
  - `POST /avatars` - Create new avatar
  - `GET /clients` - List all clients
  - `POST /pro/invitation/generate` - Generate invitation code
  - `GET /mind/{user_id}/{avatar_id}` - Get AI Mind profile

## Future Enhancements

- [x] Backend API integration
- [x] AI Mind psychological profiling
- [ ] Real AI integration (OpenAI, Anthropic Claude)
- [ ] End-to-end encryption for conversations
- [ ] Export conversation transcripts
- [ ] Advanced analytics and insights
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Video/audio session support
- [ ] Integration with EHR systems

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Project**: Hamo AI Therapy Platform
- **Email**: chris@hamo.ai
- **GitHub**: https://github.com/chrischengzh/hamo-pro

## Disclaimer

This application is a prototype for demonstration purposes. It is not intended for actual therapeutic use without proper medical oversight, security implementations, and regulatory compliance (HIPAA, GDPR, etc.).

## Support

For questions or support, please open an issue on GitHub.

## Acknowledgments

- Built with React and Vite
- Icons by Lucide
- Styling with Tailwind CSS

---

**Version**: 1.4.7
**Last Updated**: February 2026
**Author**: Chris Cheng