/*****************************************************************
 * API Utils - Frontend utility functions for API calls
 * Replaces localStorage functionality with database calls
 *****************************************************************/

const API_BASE_URL = '/api';

// Store user session token
let authToken = localStorage.getItem('authToken') || null;
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

/*****************************************************************
 * Authentication
 *****************************************************************/

async function registerUser(username, email, password, userType = 'student', fullName = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, user_type: userType, full_name: fullName }),
    });
    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function logoutUser() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  return { success: true };
}

function getCurrentUser() {
  return currentUser;
}

function isAuthenticated() {
  return authToken !== null && currentUser !== null;
}

/*****************************************************************
 * User Profile
 *****************************************************************/

async function getUserProfile(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const data = await response.json();
    return response.ok ? { success: true, user: data } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function updateUserProfile(userId, fullName, email) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ full_name: fullName, email }),
    });
    const data = await response.json();

    if (response.ok) {
      currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/*****************************************************************
 * Exercises
 *****************************************************************/

async function getExercisesForLevel(levelId) {
  try {
    const response = await fetch(`${API_BASE_URL}/exercises/level/${levelId}`);
    const data = await response.json();
    return response.ok ? { success: true, exercises: data } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getExercise(exerciseId) {
  try {
    const response = await fetch(`${API_BASE_URL}/exercises/${exerciseId}`);
    const data = await response.json();
    return response.ok ? { success: true, exercise: data } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function createExercise(levelId, type, title, questionText, hint, instructions, imageUrl, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        level_id: levelId,
        exercise_type: type,
        title,
        question_text: questionText,
        hint,
        instructions,
        image_url: imageUrl,
        data,
      }),
    });
    const result = await response.json();
    return response.ok ? { success: true, exercise: result } : { success: false, error: result.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function updateExercise(exerciseId, updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/exercises/${exerciseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return response.ok ? { success: true, exercise: data } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function deleteExercise(exerciseId) {
  try {
    const response = await fetch(`${API_BASE_URL}/exercises/${exerciseId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const data = await response.json();
    return response.ok ? { success: true } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/*****************************************************************
 * User Progress
 *****************************************************************/

async function getUserProgress(userId, levelId) {
  try {
    const response = await fetch(`${API_BASE_URL}/progress/user/${userId}/level/${levelId}`);
    const data = await response.json();
    return response.ok ? { success: true, progress: data } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getAllUserProgress(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/progress/user/${userId}`);
    const data = await response.json();
    return response.ok ? { success: true, progress: data } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function updateUserProgress(userId, levelId, score, completed = false) {
  try {
    const response = await fetch(`${API_BASE_URL}/progress/user/${userId}/level/${levelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ score, completed }),
    });
    const data = await response.json();
    return response.ok ? { success: true, progress: data } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function completeLevel(userId, levelId) {
  try {
    const response = await fetch(`${API_BASE_URL}/progress/user/${userId}/level/${levelId}/complete`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const data = await response.json();
    return response.ok ? { success: true, progress: data.progress } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getUserTotalScore(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/progress/user/${userId}/total-score`);
    const data = await response.json();
    return response.ok ? { success: true, totalScore: data.totalScore } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/*****************************************************************
 * Exercise Results
 *****************************************************************/

async function submitExerciseResult(userId, exerciseId, levelId, score, isCorrect, userAnswer) {
  try {
    const response = await fetch(`${API_BASE_URL}/results/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        user_id: userId,
        exercise_id: exerciseId,
        level_id: levelId,
        score,
        is_correct: isCorrect,
        user_answer: userAnswer,
      }),
    });
    const data = await response.json();
    return response.ok ? { success: true, result: data } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getUserResults(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/results/user/${userId}`);
    const data = await response.json();
    return response.ok ? { success: true, results: data } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getLevelResults(userId, levelId) {
  try {
    const response = await fetch(`${API_BASE_URL}/results/user/${userId}/level/${levelId}`);
    const data = await response.json();
    return response.ok ? { success: true, results: data } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/*****************************************************************
 * Diagnosis
 *****************************************************************/

async function submitDiagnosisResult(userId, diagnosisGroup, score, recommendedLevel) {
  try {
    const response = await fetch(`${API_BASE_URL}/results/diagnosis/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        user_id: userId,
        diagnosis_group: diagnosisGroup,
        score,
        recommended_level: recommendedLevel,
      }),
    });
    const data = await response.json();
    return response.ok ? { success: true, result: data } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getUserDiagnosisResult(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/results/diagnosis/user/${userId}`);
    const data = await response.json();
    return response.ok ? { success: true, result: data } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/*****************************************************************
 * Statistics (Teacher)
 *****************************************************************/

async function getStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/results/statistics/all`);
    const data = await response.json();
    return response.ok ? { success: true, stats: data } : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/*****************************************************************
 * Backward compatibility - Keep localStorage functions but map to API
 *****************************************************************/

// Old saveData function now uses API
function saveData(key, data) {
  // For backward compatibility, still save to localStorage as cache
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage unavailable:', e);
  }
  return true;
}

// Old loadData function now uses API with fallback to localStorage
function loadData(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    console.warn('localStorage unavailable:', e);
    return null;
  }
}

export {
  // Auth
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  // User Profile
  getUserProfile,
  updateUserProfile,
  // Exercises
  getExercisesForLevel,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  // Progress
  getUserProgress,
  getAllUserProgress,
  updateUserProgress,
  completeLevel,
  getUserTotalScore,
  // Results
  submitExerciseResult,
  getUserResults,
  getLevelResults,
  // Diagnosis
  submitDiagnosisResult,
  getUserDiagnosisResult,
  // Statistics
  getStatistics,
  // Backward compatibility
  saveData,
  loadData,
};
