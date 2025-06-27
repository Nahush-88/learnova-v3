import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { QuestionInput } from './components/QuestionInput';
import { AnswerDisplay } from './components/AnswerDisplay';
// import { PremiumModal } from './components/PremiumModal'; // <-- Commented out/Removed
import { Spinner } from './components/Spinner';
import { AuthModal } from './components/AuthModal';
import { ExplanationLevel, Subject } from './types';
import { SUBJECTS, EXPLANATION_LEVEL_OPTIONS, FREE_USES_LIMIT, GEMINI_TEXT_MODEL_NAME, GEMINI_MULTIMODAL_MODEL_NAME, getSystemInstructionForLevel /*, PREMIUM_PRICE_INR */ } from './constants'; // PREMIUM_PRICE_INR removed
import { generateText, generateTextAndImage } from './services/geminiService';
import { auth, db } from './firebase';
import { signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [aiAnswer, setAiAnswer] = useState<string>('');
  const [currentExplanationLevel, setCurrentExplanationLevel] = useState<ExplanationLevel>(ExplanationLevel.GENERAL);
  
  const [freeUsesRemaining, setFreeUsesRemaining] = useState<number>(FREE_USES_LIMIT);
  // Set isPremiumUser to true by default or remove it if all features are always free
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(true); // <-- MODIFIED: Set to true
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false); // This will largely be unused
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(SUBJECTS[0] || null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  // Firestore setup and authentication
  useEffect(() => {
    const initializeAuth = async () => {
      const token = (window as any).__initial_auth_token;
      if (token) {
        try {
          await signInWithCustomToken(auth, token);
          console.log('Signed in with custom token from Canvas.');
        } catch (error) {
          console.error('Error signing in with custom token:', error);
        }
      }
      setIsAuthReady(true);
    };

    initializeAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        console.log("User logged in:", user.uid);
        const userDocRef = doc(db, `artifacts/${(window as any).__app_id || 'default-app-id'}/users/${user.uid}/userSettings/data`);
        
        onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // isPremiumUser will always be true now, but we can still store other settings
            setIsPremiumUser(true); // Always true for all features free
            setFreeUsesRemaining(data?.freeUsesRemaining ?? FREE_USES_LIMIT);
          } else {
            setDoc(userDocRef, { isPremiumUser: true, freeUsesRemaining: FREE_USES_LIMIT }, { merge: true }) // <-- MODIFIED: isPremiumUser: true
              .then(() => console.log("Default user settings created."))
              .catch((e) => console.error("Error creating default user settings:", e));
            setIsPremiumUser(true); // Always true for all features free
            setFreeUsesRemaining(FREE_USES_LIMIT);
          }
        }, (error) => {
          console.error("Error fetching user settings:", error);
          setError("Failed to load user settings.");
        });
      } else {
        console.log("User logged out or not authenticated.");
        setCurrentUser(null);
        setIsPremiumUser(true); // Still true for free access to all features
        setFreeUsesRemaining(FREE_USES_LIMIT);
      }
    });

    return () => unsubscribe();
  }, [db, auth]);

  useEffect(() => {
    if (currentUser && isAuthReady) {
      const userDocRef = doc(db, `artifacts/${(window as any).__app_id || 'default-app-id'}/users/${currentUser.uid}/userSettings/data`);
      setDoc(userDocRef, { isPremiumUser, freeUsesRemaining }, { merge: true })
        .catch(e => console.error("Error saving user settings:", e));
    }
  }, [isPremiumUser, freeUsesRemaining, currentUser, isAuthReady, db]);

  const handleQuestionSubmit = useCallback(async () => {
    if (!currentQuestion && !uploadedImageFile) {
      setError("Please enter a question or upload an image.");
      return;
    }

    // Removed premium check for query limit
    // if (!isPremiumUser && freeUsesRemaining <= 0) {
    //   setShowPremiumModal(true);
    //   setError("You've used all your free queries. Upgrade to Premium for unlimited access!");
    //   return;
    // }

    setIsLoading(true);
    setError(null);
    setAiAnswer('');

    const systemInstruction = getSystemInstructionForLevel(currentExplanationLevel);
    let fullPrompt = currentQuestion;
    if (selectedSubject && selectedSubject.id !== 'general') {
        fullPrompt = `Subject: ${selectedSubject.name}. Question: ${currentQuestion}`;
    }

    try {
      let responseText = '';
      if (uploadedImageFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            responseText = await generateTextAndImage(
              fullPrompt, 
              base64Data, 
              uploadedImageFile.type, 
              systemInstruction,
              GEMINI_MULTIMODAL_MODEL_NAME
            );
            setAiAnswer(responseText);
            // Decrement free uses only if a limit is in place and it's not a premium user
            // if (!isPremiumUser) setFreeUsesRemaining(prev => Math.max(0, prev - 1));
          } catch (apiError: any) {
            console.error("Gemini API Error (image processing):", apiError);
            setError(`Failed to get answer from AI. ${apiError.message || 'Please try again.'}`);
          } finally {
            setIsLoading(false);
          }
        };
        reader.onerror = () => {
          setError("Failed to read image file.");
          setIsLoading(false);
        };
        reader.readAsDataURL(uploadedImageFile);
      } else {
        responseText = await generateText(fullPrompt, systemInstruction, GEMINI_TEXT_MODEL_NAME);
        setAiAnswer(responseText);
        // Decrement free uses only if a limit is in place and it's not a premium user
        // if (!isPremiumUser) setFreeUsesRemaining(prev => Math.max(0, prev - 1));
        setIsLoading(false);
      }
    } catch (apiError: any) {
      console.error("Gemini API Error:", apiError);
      setError(`Failed to get answer from AI. ${apiError.message || 'Please try again.'}`);
      setIsLoading(false);
    }
  }, [currentQuestion, uploadedImageFile, currentExplanationLevel, isPremiumUser, freeUsesRemaining, selectedSubject]);

  const handleImageUpload = (file: File | null) => {
    setUploadedImageFile(file);
    if (file) setAiAnswer(''); 
  };

  const handleSpeakAnswer = () => {
    if (!aiAnswer) {
      setError("No answer to read out.");
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(aiAnswer);
      window.speechSynthesis.speak(utterance);
    } else {
      setError("Sorry, your browser does not support text-to-speech.");
    }
  };

  const handleStopSpeakAnswer = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setError("Speech stopped.");
    }
  };

  const handleExportPdf = () => {
    // Removed premium check for PDF export
    // if (!isPremiumUser) {
    //   setShowPremiumModal(true);
    //   setError("PDF Export is a Premium feature. Please upgrade.");
    //   return;
    // }
    if (!aiAnswer) {
      setError("No answer to export.");
      return;
    }
    alert("PDF Export initiated (Premium Feature - Placeholder). The answer content would be converted to PDF here.");
  };
  
  // This function is no longer strictly for 'upgrade' but could be a 'reset' if you re-introduce limits
  const handleUpgradeToPremium = async () => {
    if (currentUser) {
      const userDocRef = doc(db, `artifacts/${(window as any).__app_id || 'default-app-id'}/users/${currentUser.uid}/userSettings/data`);
      await setDoc(userDocRef, { isPremiumUser: true, freeUsesRemaining: FREE_USES_LIMIT }, { merge: true });
      setIsPremiumUser(true); // Ensure premium status is true
      setShowPremiumModal(false); // Close modal
      setFreeUsesRemaining(FREE_USES_LIMIT); // Reset free uses if you decide to re-introduce limits later
      alert(`All features are now available to you!`); // Modified alert message
    } else {
      setError("Please log in to upgrade to Premium."); // This message might need adjustment if no premium exists
      setShowAuthModal(true);
    }
  };

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log("User signed out.");
      setCurrentUser(null);
      setIsPremiumUser(true); // Still true for free access to all features
      setFreeUsesRemaining(FREE_USES_LIMIT);
      setError("You have been signed out.");
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 font-sans">
      <Header 
        onLoginClick={currentUser ? handleLogout : handleLoginClick}
        isPremiumUser={isPremiumUser} // This prop might be redundant if always true
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isLoggedIn={!!currentUser}
      />
      
      <div className="flex flex-1 overflow-hidden pt-16">
        <Sidebar 
          selectedSubject={selectedSubject} 
          onSelectSubject={setSelectedSubject}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto transition-all duration-300 ease-in-out">
          <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6">
            <QuestionInput
              currentQuestion={currentQuestion}
              onQuestionChange={setCurrentQuestion}
              onImageUpload={handleImageUpload}
              onSubmit={handleQuestionSubmit}
              isLoading={isLoading}
              explanationLevels={EXPLANATION_LEVEL_OPTIONS}
              currentExplanationLevel={currentExplanationLevel}
              onExplanationLevelChange={setCurrentExplanationLevel}
              uploadedFileName={uploadedImageFile?.name}
            />

            {isLoading && <Spinner />}
            
            {error && (
              <div className="p-3 sm:p-4 text-sm text-red-700 bg-red-100 rounded-lg shadow" role="alert">
                <span className="font-medium">Error:</span> {error}
                <button onClick={() => setError(null)} className="ml-2 text-sm font-medium text-red-500 hover:text-red-700 float-right">Dismiss</button>
              </div>
            )}

            {aiAnswer && !isLoading && (
              <AnswerDisplay
                answer={aiAnswer}
                onSpeak={handleSpeakAnswer}
                onStopSpeak={handleStopSpeakAnswer}
                isPremiumUser={isPremiumUser} // Pass true if all features are free
                onExportPdf={handleExportPdf}
              />
            )}
            
            {/* Removed the free uses remaining message as all features are now free/unlimited */}
            {/* {!isPremiumUser && (
              <div className="text-center text-sm text-slate-600 mt-4 p-3 bg-slate-200 rounded-lg shadow">
                You have <span className="font-semibold text-brand-dark">{freeUsesRemaining}</span> free queries remaining. 
                <button onClick={() => setShowPremiumModal(true)} className="ml-1 text-brand hover:underline font-medium">Upgrade to Premium</button>
              </div>
            )} */}
             {currentUser && <p className="text-xs text-slate-500 text-center mt-2">Logged in as: {currentUser.email || currentUser.displayName || currentUser.uid}</p>}
          </div>
        </main>
      </div>

      {/* Removed the PremiumModal as it's no longer needed */}
      {/* {showPremiumModal && (
        <PremiumModal
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={handleUpgradeToPremium}
        />
      )} */}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default App;
