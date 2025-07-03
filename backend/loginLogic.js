const { auth, db } = require('./firebaseConfigAdmin');

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Update user profile (for editing profile after authentication)
const updateUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const { displayName, bio, location, website, githubUsername, linkedinUsername } = req.body;
    
    // Verify that the authenticated user can only update their own profile
    if (req.user.uid !== uid) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {
      lastActive: new Date()
    };

    // Only update fields that are provided
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (githubUsername !== undefined) updateData.githubUsername = githubUsername;
    if (linkedinUsername !== undefined) updateData.linkedinUsername = linkedinUsername;

    await userRef.update(updateData);
    
    // Get updated user data
    const updatedDoc = await userRef.get();
    const userData = updatedDoc.data();
    
    res.status(200).json({
      message: 'User profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      user: userDoc.data()
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

const saveSubmission = async (req, res) => {
  try {
    const { uid, problemId, language, code, status, executionTime, memory } = req.body;
    
    if (!uid || !code) {
      return res.status(400).json({ error: 'UID and code are required' });
    }

    const submissionData = {
      uid,
      problemId: problemId || 'practice',
      language,
      code,
      status: status || 'submitted',
      executionTime: executionTime || null,
      memory: memory || null,
      timestamp: new Date(),
      submissionId: require('uuid').v4()
    };

    // Save to submissions collection
    await db.collection('submissions').add(submissionData);
    
    // Update user stats
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const newTotalSubmissions = (userData.totalSubmissions || 0) + 1;
      
      await userRef.update({
        totalSubmissions: newTotalSubmissions,
        lastActive: new Date()
      });
    }
    
    res.status(200).json({
      message: 'Submission saved successfully',
      submissionId: submissionData.submissionId
    });
  } catch (error) {
    console.error('Save submission error:', error);
    res.status(500).json({ error: 'Failed to save submission' });
  }
};

// Get user submissions
const getUserSubmissions = async (req, res) => {
  try {
    const { uid } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const submissionsRef = db.collection('submissions')
      .where('uid', '==', uid)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));
    
    const snapshot = await submissionsRef.get();
    const submissions = [];
    
    snapshot.forEach(doc => {
      submissions.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      });
    });
    
    res.status(200).json({
      submissions,
      total: submissions.length
    });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ error: 'Failed to get user submissions' });
  }
};

// Update user rating and stats
const updateUserStats = async (req, res) => {
  try {
    const { uid, rating, rank, problemSolved, difficulty } = req.body;
    
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    const stats = userData.stats || { easy: 0, medium: 0, hard: 0 };
    
    const updateData = {
      lastActive: new Date()
    };
    
    if (rating !== undefined) {
      updateData.rating = rating;
      updateData.rank = rank || userData.rank;
      updateData.stats = {
        ...stats,
        maxRating: Math.max(rating, stats.maxRating || rating)
      };
    }
    
    if (problemSolved && difficulty) {
      updateData.solvedProblems = (userData.solvedProblems || 0) + 1;
      updateData.stats = {
        ...updateData.stats || stats,
        [difficulty]: (stats[difficulty] || 0) + 1
      };
    }
    
    await userRef.update(updateData);
    
    res.status(200).json({
      message: 'User stats updated successfully'
    });
  } catch (error) {
    console.error('Update user stats error:', error);
    res.status(500).json({ error: 'Failed to update user stats' });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const usersRef = db.collection('users')
      .orderBy('rating', 'desc')
      .limit(parseInt(limit));
    
    const snapshot = await usersRef.get();
    const leaderboard = [];
    
    snapshot.forEach((doc, index) => {
      const userData = doc.data();
      leaderboard.push({
        rank: index + 1,
        uid: userData.uid,
        displayName: userData.displayName,
        rating: userData.rating,
        rank: userData.rank,
        solvedProblems: userData.solvedProblems || 0,
        photoURL: userData.photoURL
      });
    });
    
    res.status(200).json({
      leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

// Google Authentication handler
const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify the Google ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture, email_verified } = decodedToken;

    if (!email_verified) {
      return res.status(400).json({ error: 'Email not verified' });
    }

    // Check if user exists in database
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    let userData;
    
    if (!userDoc.exists) {
      // Create new user profile
      userData = {
        uid,
        email,
        displayName: name || email.split('@')[0],
        photoURL: picture || null,
        rating: 1200,
        rank: 'Newbie',
        solvedProblems: 0,
        totalSubmissions: 0,
        lastActive: new Date(),
        joinedDate: new Date(),
        authProvider: 'google',
        emailVerified: email_verified,
        stats: {
          easy: 0,
          medium: 0,
          hard: 0,
          contestsParticipated: 0,
          maxRating: 1200,
          globalRank: null
        }
      };
      
      await userRef.set(userData);
    } else {
      // Update existing user's last active time
      userData = userDoc.data();
      await userRef.update({
        lastActive: new Date(),
        photoURL: picture || userData.photoURL,
        displayName: name || userData.displayName
      });
      
      // Get updated user data
      const updatedDoc = await userRef.get();
      userData = updatedDoc.data();
    }

    // Generate custom token for the user
    const customToken = await auth.createCustomToken(uid);

    res.status(200).json({
      message: 'Google authentication successful',
      user: userData,
      token: customToken,
      isNewUser: !userDoc.exists
    });

  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ 
      error: 'Google authentication failed',
      details: error.message 
    });
  }
};

module.exports = {
  googleAuth,
  verifyToken,
  updateUserProfile,
  getUserProfile,
  saveSubmission,
  getUserSubmissions,
  updateUserStats,
  getLeaderboard
};
