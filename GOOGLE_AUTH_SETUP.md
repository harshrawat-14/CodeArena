# Google Authentication Setup for Online Judge

## Backend Implementation

The backend now includes Google authentication with the following features:

### Authentication Flow

1. **Google Sign-In**: Users authenticate with Google on the frontend
2. **Token Verification**: Frontend sends Google ID token to backend
3. **User Profile Creation**: Backend creates/updates user profile in Firebase Firestore
4. **Custom Token**: Backend returns a custom Firebase token for subsequent requests

### API Endpoints

#### POST `/auth/google`
Authenticates user with Google ID token.

**Request Body:**
```json
{
  "idToken": "google_id_token_from_frontend"
}
```

**Response:**
```json
{
  "message": "Google authentication successful",
  "user": {
    "uid": "user_uid",
    "email": "user@example.com",
    "displayName": "User Name",
    "photoURL": "profile_photo_url",
    "rating": 1200,
    "rank": "Newbie",
    "solvedProblems": 0,
    "totalSubmissions": 0,
    // ... other user data
  },
  "token": "custom_firebase_token",
  "isNewUser": true
}
```

#### PUT `/auth/profile/:uid` (Protected)
Updates user profile information.

**Headers:**
```
Authorization: Bearer <custom_firebase_token>
```

**Request Body:**
```json
{
  "displayName": "New Display Name",
  "bio": "User bio",
  "location": "City, Country",
  "website": "https://example.com",
  "githubUsername": "github_username",
  "linkedinUsername": "linkedin_username"
}
```

#### GET `/auth/profile/:uid`
Gets user profile information (public endpoint).

### Database Structure

Users are stored in the `users` collection with the following structure:

```javascript
{
  uid: "firebase_uid",
  email: "user@example.com",
  displayName: "User Display Name",
  photoURL: "profile_photo_url",
  rating: 1200,
  rank: "Newbie",
  solvedProblems: 0,
  totalSubmissions: 0,
  lastActive: Date,
  joinedDate: Date,
  authProvider: "google",
  emailVerified: true,
  
  // Optional profile fields (editable)
  bio: "User bio",
  location: "City, Country",
  website: "https://example.com",
  githubUsername: "github_username",
  linkedinUsername: "linkedin_username",
  
  // Stats
  stats: {
    easy: 0,
    medium: 0,
    hard: 0,
    contestsParticipated: 0,
    maxRating: 1200,
    globalRank: null
  }
}
```

## Frontend Implementation

### Setup Firebase Configuration

1. Update `frontend/src/auth/googleAuth.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Available Functions

- `signInWithGoogle()` - Sign in with Google popup
- `signOutUser()` - Sign out current user
- `getCurrentUser()` - Get current user from localStorage
- `getAuthToken()` - Get authentication token
- `updateProfile(uid, profileData)` - Update user profile
- `getUserProfile(uid)` - Get user profile

### Using the Authentication Component

```jsx
import GoogleAuthComponent from './components/GoogleAuthComponent';

function App() {
  return (
    <div>
      <GoogleAuthComponent />
    </div>
  );
}
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxx%40your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

## Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication > Sign-in method > Google
4. Add your domain to authorized domains
5. Download service account key for backend
6. Get web app config for frontend

## Features

### User Authentication
- ✅ Google OAuth sign-in
- ✅ Automatic user profile creation
- ✅ Token-based authentication
- ✅ Profile editing after login

### User Profile Management
- ✅ Display name, bio, location
- ✅ Social media links (GitHub, LinkedIn)
- ✅ Website URL
- ✅ Profile photo from Google
- ✅ User stats and rating system

### Security
- ✅ JWT token verification
- ✅ Protected routes
- ✅ User can only edit own profile
- ✅ Token stored securely in localStorage

## Usage Examples

### Sign In
```javascript
try {
  const result = await signInWithGoogle();
  console.log('User:', result.user);
  console.log('Is new user:', result.isNewUser);
} catch (error) {
  console.error('Sign-in failed:', error);
}
```

### Update Profile
```javascript
try {
  const result = await updateProfile(user.uid, {
    displayName: 'New Name',
    bio: 'Updated bio',
    location: 'New Location'
  });
  console.log('Updated user:', result.user);
} catch (error) {
  console.error('Update failed:', error);
}
```

### Make Authenticated API Calls
```javascript
const token = getAuthToken();
const response = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Testing

1. Start the backend server: `npm start` (in backend directory)
2. Start the frontend dev server: `npm run dev` (in frontend directory)
3. Navigate to the frontend URL
4. Click "Sign in with Google"
5. Complete Google authentication
6. Edit your profile information
7. Test the protected endpoints

## Troubleshooting

### Common Issues

1. **CORS Error**: Make sure your frontend URL is added to CORS origins in backend
2. **Token Verification Failed**: Check your Firebase service account configuration
3. **Google Sign-in Popup Blocked**: Ensure popups are allowed in browser
4. **Invalid Token**: Make sure the token is being sent in the Authorization header

### Debug Mode

Add console.log statements in the authentication functions to debug:

```javascript
console.log('ID Token:', idToken);
console.log('Decoded Token:', decodedToken);
console.log('User Data:', userData);
```
