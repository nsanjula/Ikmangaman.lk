import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { authAPI } from '../lib/api';
import { useLocation } from 'react-router-dom';
import MessageFormatter from './MessageFormatter';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  className?: string;
}

const ThinkingAnimation: React.FC = () => (
  <div className="flex items-center space-x-1 p-3">
    <div className="flex space-x-1">
      <div
        className="w-2 h-2 rounded-full animate-bounce"
        style={{
          backgroundColor: 'var(--primary-600)',
          animationDelay: '0ms',
          animationDuration: '1.4s'
        }}
      ></div>
      <div
        className="w-2 h-2 rounded-full animate-bounce"
        style={{
          backgroundColor: 'var(--primary-600)',
          animationDelay: '150ms',
          animationDuration: '1.4s'
        }}
      ></div>
      <div
        className="w-2 h-2 rounded-full animate-bounce"
        style={{
          backgroundColor: 'var(--primary-600)',
          animationDelay: '300ms',
          animationDuration: '1.4s'
        }}
      ></div>
    </div>
  </div>
);

const ChatBot: React.FC<ChatBotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showIntroBubble, setShowIntroBubble] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const closedWhileWaitingRef = useRef(false);
  const { isAuthenticated, logout } = useAuth();
  const { loadingState } = useLoading();
  const location = useLocation();

  // Don't show on landing page, loading screens, or when loading overlay is active
  const shouldShow = isAuthenticated &&
    !loadingState.isLoading &&
    location.pathname !== '/' &&
    !location.pathname.includes('/login') &&
    !location.pathname.includes('/register') &&
    !location.pathname.includes('/compass-loader');

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && !userProfile) {
      authAPI.getUserProfile()
        .then(profile => {
          setUserProfile(profile);
        })
        .catch(error => {
          console.error('Failed to fetch user profile:', error);
        });
    }
  }, [isAuthenticated, userProfile]);

  // Show intro bubble on first visit to recommendations page after login
  useEffect(() => {
    const INTRO_KEY = 'chatbot_intro_seen_session';
    const LEGACY_KEY = 'chatbot_intro_shown';
    const DISMISSED_KEY = 'chatbot_intro_dismissed_session';

    const onRecommendations = location.pathname === '/recommendation';
    const seen = sessionStorage.getItem(INTRO_KEY) === 'true' || sessionStorage.getItem(LEGACY_KEY) === 'true';
    const dismissed = sessionStorage.getItem(DISMISSED_KEY) === 'true';

    if (dismissed) {
      setShowIntroBubble(false);
      return;
    }

    if (!onRecommendations && showIntroBubble) {
      // Never carry the bubble to other pages
      setShowIntroBubble(false);
      return;
    }

    if (isAuthenticated && userProfile && onRecommendations && !seen && !dismissed) {
      setShowIntroBubble(true);
    } else if (seen || dismissed) {
      setShowIntroBubble(false);
    }
  }, [isAuthenticated, userProfile, location.pathname, showIntroBubble]);

  // When chat opens, greet instantly (no fake delay) and clear notification badge
  useEffect(() => {
    if (isOpen) {
      setShowNotification(false);
      const INTRO_KEY = 'chatbot_intro_seen_session';
      sessionStorage.setItem(INTRO_KEY, 'true');
      sessionStorage.setItem('chatbot_intro_shown', 'true'); // keep legacy flag for safety
      sessionStorage.setItem('chatbot_intro_dismissed_session', 'true');
      if (showIntroBubble) setShowIntroBubble(false);

      if (!hasGreeted && userProfile) {
        const greeting: ChatMessage = {
          id: `greeting-${Date.now()}`,
          text: `Hi ${userProfile.firstname}👋, I’m your friendly assistant from ikmangaman.lk`,
          isBot: true,
          timestamp: new Date()
        };
        setMessages([greeting]);
        setHasGreeted(true);
      }
    }
  }, [isOpen, hasGreeted, userProfile, showIntroBubble]);

  // Removed fake welcome delay; greeting handled instantly when opening chat

  // Clear messages on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([]);
      setHasGreeted(false);
      setUserProfile(null);
      setIsOpen(false);
      setShowIntroBubble(false);
      setShowNotification(false);
      closedWhileWaitingRef.current = false;
    }
  }, [isAuthenticated]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const data = await authAPI.sendChatMessage(inputValue);
      const botReply = data['reply: '] || 'Sorry, I could not process your request.';

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: botReply,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      if (!isOpen && closedWhileWaitingRef.current) {
        setShowNotification(true);
        closedWhileWaitingRef.current = false;
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      if (error.message?.includes('Authentication required')) {
        logout();
      }
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: error.message || 'Sorry, I encountered an error. Please try again.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      if (!isOpen && closedWhileWaitingRef.current) {
        setShowNotification(true);
        closedWhileWaitingRef.current = false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!shouldShow) {
    return null;
  }

  // Responsive positioning based on screen size
  const isMobile = windowSize.width <= 768;
  const isVerySmall = windowSize.width <= 480;
  const isLandscape = windowSize.width > windowSize.height;

  const openWithGreeting = () => {
    setIsOpen(true);
    setShowNotification(false);
    if (showIntroBubble) {
      setShowIntroBubble(false);
      sessionStorage.setItem('chatbot_intro_seen_session', 'true');
      sessionStorage.setItem('chatbot_intro_shown', 'true');
      sessionStorage.setItem('chatbot_intro_dismissed_session', 'true');
    }
    if (!hasGreeted && userProfile) {
      const greeting: ChatMessage = {
        id: `greeting-${Date.now()}`,
        text: `Hi ${userProfile.firstname}👋, I’m your friendly assistant from ikmangaman.lk`,
        isBot: true,
        timestamp: new Date()
      };
      setMessages([greeting]);
      setHasGreeted(true);
    }
  };

  return (
    <>
      {/* Floating Chat Icon - Always fixed to viewport using Portal */}
      {!isOpen && createPortal(
        <>
          <button
            onClick={openWithGreeting}
            className="chatbot-floating-button"
            style={{
              position: 'fixed',
              bottom: isMobile ? '16px' : '24px',
              right: isMobile ? '16px' : '24px',
              width: isVerySmall ? '48px' : '56px',
              height: isVerySmall ? '48px' : '56px',
              borderRadius: '50%',
              background: 'var(--primary-600)',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            onFocus={(e) => {
              e.target.style.outline = '4px solid rgba(6, 182, 212, 0.3)';
              e.target.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.target.style.outline = 'none';
            }}
            aria-label="Open TripMate Chat"
          >
            <MessageCircle className={`${isVerySmall ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            {showNotification && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '9999px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  boxShadow: '0 0 0 2px white'
                }}
              >
                1
              </span>
            )}
          </button>

          {showIntroBubble && (
            <div
              onClick={openWithGreeting}
              style={{
                position: 'fixed',
                bottom: isMobile ? '24px' : '32px',
                right: isMobile ? (isVerySmall ? '76px' : '88px') : '96px',
                maxWidth: '280px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '12px 14px',
                zIndex: 9999,
                cursor: 'pointer'
              }}
            >
              <div className="flex items-start gap-2">
                <span style={{ fontSize: '18px' }}>👋</span>
                <p style={{ color: 'var(--text-900)' }}>
                  Hi {userProfile?.firstname}👋, I’m your friendly assistant from ikmangaman.lk
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowIntroBubble(false);
                    sessionStorage.setItem('chatbot_intro_seen_session', 'true');
                    sessionStorage.setItem('chatbot_intro_shown', 'true');
                    sessionStorage.setItem('chatbot_intro_dismissed_session', 'true');
                  }}
                  aria-label="Dismiss intro message"
                  className="ml-2"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-600)',
                    cursor: 'pointer'
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>,
        document.body
      )}

      {/* Chat Popup - Fixed to viewport using Portal */}
      {isOpen && createPortal(
        <div
          className="chatbot-popup"
          style={{
            position: 'fixed',
            bottom: isMobile ? '16px' : '24px',
            right: isMobile ? '16px' : '24px',
            ...(isVerySmall ? {
              // On very small screens, take most of the screen
              left: '16px',
              right: '16px',
              width: 'auto',
              height: 'min(500px, calc(100vh - 100px))'
            } : {
              // Normal responsive behavior
              width: 'min(360px, calc(100vw - 48px))',
              height: 'min(500px, calc(100vh - 48px))'
            }),
            maxWidth: isVerySmall ? 'none' : '360px',
            maxHeight: '500px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 rounded-t-lg border-b"
            style={{
              background: 'var(--primary-600)',
              borderBottomColor: 'var(--border)'
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <MessageCircle className="w-5 h-5" style={{ color: 'var(--primary-600)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-white">TripMate</h3>
                <p className="text-xs text-cyan-100">Your travel assistant</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (isLoading) {
                  closedWhileWaitingRef.current = true;
                }
                setIsOpen(false);
              }}
              className="p-1 hover:bg-cyan-700 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4"
            style={{
              background: 'var(--bg)',
              minHeight: isVerySmall ? '200px' : '300px',
              maxHeight: isVerySmall && !isLandscape ? 'calc(100vh - 200px)' : '400px'
            }}
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`p-3 rounded-2xl text-sm ${
                      message.isBot
                        ? 'rounded-bl-sm'
                        : 'rounded-br-sm'
                    }`}
                    style={{
                      maxWidth: 'min(280px, calc(100% - 20px))',
                      wordWrap: 'break-word',
                      background: message.isBot ? '#E6F6F7' : 'var(--surface)',
                      color: message.isBot ? 'var(--primary-700)' : 'var(--text-900)',
                      border: message.isBot ? 'none' : '1px solid var(--border)'
                    }}
                  >
                    <MessageFormatter text={message.text} isBot={message.isBot} />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl rounded-bl-sm"
                    style={{
                      maxWidth: 'min(280px, calc(100% - 20px))',
                      background: '#E6F6F7',
                      color: 'var(--primary-700)'
                    }}
                  >
                    <ThinkingAnimation />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t" style={{ borderTopColor: 'var(--border)' }}>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask TripMate anything..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-900)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-600)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
                style={{
                  background: 'var(--primary-600)',
                  color: 'white'
                }}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ChatBot;
