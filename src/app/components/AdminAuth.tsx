import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from './AuthContext';
import { getAdminAccounts, addAdminAccount, updateAdminAccount } from '../utils/storage';
import { AdminAccount } from '../utils/types';

interface AdminAuthProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

type AuthMode = 'select' | 'login' | 'register' | 'forgot';

export const AdminAuth: React.FC<AdminAuthProps> = ({ onBack, onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('select');
  const { login } = useAuth();

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register state
  const [regUsername, setRegUsername] = useState('');
  const [regGmail, setRegGmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regCodeSent, setRegCodeSent] = useState(false);
  const [regVerificationCode, setRegVerificationCode] = useState('');
  const [regSentCode, setRegSentCode] = useState(0);

  // Forgot password state
  const [forgotGmail, setForgotGmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername || !loginPassword) {
      setLoginError('Please enter both username and password');
      return;
    }

    const success = login(loginUsername, loginPassword);
    if (success) {
      onLoginSuccess();
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regUsername || !regGmail || !regPassword || !regConfirmPassword) {
      setRegError('Please fill in all fields');
      return;
    }

    if (!regGmail.includes('@')) {
      setRegError('Please enter a valid email address');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match');
      return;
    }

    const accounts = getAdminAccounts();
    const existingUsername = accounts.find(a => a.username === regUsername);
    const existingEmail = accounts.find(a => a.gmail === regGmail);

    if (existingUsername) {
      setRegError('Username already exists');
      return;
    }

    if (existingEmail) {
      setRegError('Email already registered');
      return;
    }

    // Send verification code to server
    try {
      const res = await fetch("https://attendance-api-naza.onrender.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: regGmail })
      });

      const data = await res.json();
      setRegSentCode(data.code);
      setRegCodeSent(true);
      setRegSuccess(`Verification code sent to ${regGmail}!`);
    } catch (error) {
      // Fallback for demo purposes if server is not running
      const demoCode = Math.floor(1000 + Math.random() * 9000);
      setRegSentCode(demoCode);
      setRegCodeSent(true);
      setRegSuccess(`Verification code sent! (Demo code: ${demoCode})`);
    }
  };

  const handleVerifyRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (parseInt(regVerificationCode) != regSentCode) {
      setRegError('Invalid verification code');
      return;
    }

    // Save account after verification
    addAdminAccount({
      username: regUsername,
      gmail: regGmail,
      password: regPassword
    });

    setRegSuccess('Account created successfully! You can now login.');
    setTimeout(() => {
      setMode('login');
      setRegUsername('');
      setRegGmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegVerificationCode('');
      setRegCodeSent(false);
      setRegSuccess('');
    }, 2000);
  };

  const handleSendCode = async () => {
    setForgotError('');

    if (!forgotGmail) {
      setForgotError('Please enter your email');
      return;
    }

    const accounts = getAdminAccounts();
    const account = accounts.find(a => a.gmail == forgotGmail);

    if (!account) {
      setForgotError('Email not found');
      return;
    }

    // Send verification code to server
    try {
      const res = await fetch("https://attendance-api-naza.onrender.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: forgotGmail })
      });

      const data = await res.json();
      setSentCode(data.code.toString());
      setCodeSent(true);
      alert(`Verification code sent to ${forgotGmail}!`);
    } catch (error) {
      // Fallback for demo purposes if server is not running
      const code = Math.floor(1000 + Math.random() * 9000);
      setSentCode(code.toString());
      setCodeSent(true);
      alert(`Verification code (for demo): ${code}`);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (verificationCode != sentCode) {
      setForgotError('Invalid verification code');
      return;
    }

    if (!newUsername && !newPassword) {
      setForgotError('Please enter new username or password');
      return;
    }

    const accounts = getAdminAccounts();
    const account = accounts.find(a => a.gmail === forgotGmail);

    if (account) {
      const updates: Partial<AdminAccount> = {};
      if (newUsername) updates.username = newUsername;
      if (newPassword) updates.password = newPassword;

      updateAdminAccount(account.account_id, updates);

      setForgotSuccess('Account updated successfully! You can now login.');
      setTimeout(() => {
        setMode('login');
        setForgotGmail('');
        setVerificationCode('');
        setSentCode('');
        setCodeSent(false);
        setNewUsername('');
        setNewPassword('');
        setForgotSuccess('');
      }, 2000);
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-white hover:text-green-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg">Back</span>
          </button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Admin Access</h1>
            <p className="text-xl text-green-50">Choose an option to continue</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setMode('login')}
              className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
            >
              <h2 className="text-2xl font-bold text-gray-800">Login</h2>
              <p className="text-gray-600 mt-2">Access your admin account</p>
            </button>

            <button
              onClick={() => setMode('register')}
              className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
            >
              <h2 className="text-2xl font-bold text-gray-800">Register</h2>
              <p className="text-gray-600 mt-2">Create a new admin account</p>
            </button>

            <button
              onClick={() => setMode('forgot')}
              className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
            >
              <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
              <p className="text-gray-600 mt-2">Reset your credentials</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setMode('select')}
            className="mb-8 flex items-center gap-2 text-white hover:text-green-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg">Back</span>
          </button>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setMode('select')}
            className="mb-8 flex items-center gap-2 text-white hover:text-green-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg">Back</span>
          </button>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Register</h2>

            {!regCodeSent ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                      placeholder="Choose a username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={regGmail}
                      onChange={(e) => setRegGmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                      placeholder="Choose a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {regError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    {regSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Send Verification Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyRegistration} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={regVerificationCode}
                    onChange={(e) => setRegVerificationCode(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-center text-2xl tracking-widest"
                    placeholder="Enter code"
                    maxLength={6}
                  />
                </div>

                {regError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    {regSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Verify & Register
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRegCodeSent(false);
                    setRegVerificationCode('');
                    setRegError('');
                  }}
                  className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Back
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Forgot Password
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => setMode('select')}
          className="mb-8 flex items-center gap-2 text-white hover:text-green-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-lg">Back</span>
        </button>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Reset Credentials</h2>

          {!codeSent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={forgotGmail}
                    onChange={(e) => setForgotGmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {forgotError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {forgotError}
                </div>
              )}

              <button
                onClick={handleSendCode}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Send Verification Code
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="Enter 6-digit code"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">New Username (optional)</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">New Password (optional)</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="Leave blank to keep current"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {forgotError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {forgotError}
                </div>
              )}

              {forgotSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  {forgotSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Reset Credentials
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
