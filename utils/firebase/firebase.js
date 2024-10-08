require('dotenv').config();

// Import the functions using CommonJS syntax
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  updateEmail // Add updateEmail import
} = require('firebase/auth');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(firebaseApp);

// Set up Google authentication provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});

// Exported functions
const signInWithGooglePopup = () => signInWithPopup(auth, provider);

const db = getFirestore(firebaseApp);

// Reset password function
const handlePasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return 'Check your email for the password reset link.';
  } catch (error) {
    throw new Error(`Password reset failed: ${error.message}`);
  }
};

// Create user document from authentication
const createUserDocumentFromAuth = async (userAuth, additionalData = {}) => {
  if (!userAuth) return null;

  const userDocRef = doc(db, 'users', userAuth.uid);
  const userSnapShot = await getDoc(userDocRef);

  if (!userSnapShot.exists()) {
    const { displayName, email } = userAuth;
    const createdAt = new Date();

    try {
      await setDoc(userDocRef, {
        displayName,
        email,
        createdAt,
        ...additionalData,
      });
    } catch (error) {
      console.error('Error creating user document', error);
      throw error;
    }
  }

  return userDocRef;
};

// Create user with email and password
const createUserWithEmailAndPasswordCustom = async (email, password) => {
  if (!email || !password) throw new Error('Email and password are required');

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;  // Get the UID of the registered user
  return { uid, user: userCredential.user };  // Return the UID along with the user object
};

// Sign in with email and password
const signInAuthWithEmailAndPassword = async (email, password) => {
  if (!email || !password) throw new Error('Email and password are required');

  return await signInWithEmailAndPassword(auth, email, password);
};

// Function to update user's email
const updateUserEmail = async (uid, newEmail) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user && user.uid === uid) {
    // If user is signed in and matches the provided uid
    try {
      await updateEmail(user, newEmail);
      return 'Email updated successfully';
    } catch (error) {
      throw new Error(`Error updating email: ${error.message}`);
    }
  } else {
    throw new Error('No user is currently signed in or UID mismatch');
  }
};

const sendVerificationEmail = async (user, newEmail) => {
  try {
      // Temporarily update the email
      await updateEmail(user, newEmail);
      
      // Send a verification email to the new address
      await sendEmailVerification(user);
      return 'Verification email sent. Please verify your new email.';
  } catch (error) {
      throw new Error(`Error sending verification email: ${error.message}`);
  }
};



// Export all the needed functions
module.exports = {
  signInWithGooglePopup,
  handlePasswordReset,
  createUserDocumentFromAuth,
  createUserWithEmailAndPasswordCustom,
  signInAuthWithEmailAndPassword,
  updateUserEmail, // Export the new function
  sendVerificationEmail,
  firebaseApp,
  auth,
  db
};
