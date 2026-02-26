import React, { useState, useMemo } from 'react';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheck,
  HiCheck,
  HiX,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import AccountLayout from '../../components/account/AccountLayout';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Profile change detection
  const profileChanged = useMemo(() => {
    return (
      profileData.name !== (user?.name || '') ||
      profileData.email !== (user?.email || '') ||
      profileData.phone !== (user?.phone || '')
    );
  }, [profileData, user]);

  // Password strength
  const passwordStrength = useMemo(() => {
    const password = passwordData.newPassword;
    if (!password) return { score: 0, label: '', color: '', checks: {} };

    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const passed = Object.values(checks).filter(Boolean).length;

    let label = '';
    let color = '';

    if (passed <= 1) { label = 'Very Weak'; color = 'bg-red-500'; }
    else if (passed === 2) { label = 'Weak'; color = 'bg-orange-500'; }
    else if (passed === 3) { label = 'Fair'; color = 'bg-yellow-500'; }
    else if (passed === 4) { label = 'Good'; color = 'bg-blue-500'; }
    else { label = 'Strong'; color = 'bg-green-500'; }

    return { score: passed, label, color, checks };
  }, [passwordData.newPassword]);

  // Handle Profile Update
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setProfileSuccess(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!profileData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setProfileLoading(true);

    try {
      const result = await updateProfile({
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim(),
      });

      if (result.success) {
        toast.success('Profile updated successfully! ✨');
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!passwordData.newPassword) {
      toast.error('New password is required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setPasswordLoading(true);

    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmNewPassword
      );

      if (result.success) {
        toast.success('Password changed successfully! 🔒');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmNewPassword(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const PasswordCheckItem = ({ passed, label }) => (
    <div className="flex items-center gap-2">
      {passed ? (
        <HiCheck className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <HiX className="w-3.5 h-3.5 text-gray-300" />
      )}
      <span className={`text-xs font-body ${passed ? 'text-green-600' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );

  return (
    <AccountLayout title="Profile Settings">
      <div className="space-y-8 animate-fade-in">
        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-luxe overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-heading text-xl font-bold text-primary">
              Personal Information
            </h2>
            <p className="text-sm text-gray-500 font-body mt-1">
              Update your personal details
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="label-luxe">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiOutlineUser className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="input-luxe pl-11"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="label-luxe">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiOutlineMail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="input-luxe pl-11"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="label-luxe">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiOutlinePhone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="input-luxe pl-11"
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
              </div>

              {/* Member Since */}
              <div>
                <label className="label-luxe">Member Since</label>
                <div className="input-luxe bg-gray-50 cursor-not-allowed text-gray-500">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex items-center gap-4">
              <button
                type="submit"
                disabled={profileLoading || !profileChanged}
                className={`btn-primary py-3 px-8 rounded-lg flex items-center gap-2 text-sm ${
                  !profileChanged ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {profileLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : profileSuccess ? (
                  <>
                    <HiOutlineCheck className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>

              {profileChanged && (
                <button
                  type="button"
                  onClick={() =>
                    setProfileData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                    })
                  }
                  className="text-sm text-gray-500 hover:text-dark font-body transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-luxe overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-heading text-xl font-bold text-primary">
              Change Password
            </h2>
            <p className="text-sm text-gray-500 font-body mt-1">
              Update your password to keep your account secure
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="p-6">
            <div className="max-w-lg space-y-5">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="label-luxe">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiOutlineLockClosed className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="input-luxe pl-11 pr-11"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-secondary transition-colors"
                  >
                    {showCurrentPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="label-luxe">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiOutlineLockClosed className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="input-luxe pl-11 pr-11"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-secondary transition-colors"
                  >
                    {showNewPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength */}
                {passwordData.newPassword && (
                  <div className="mt-3 animate-fade-in">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength.score
                              ? passwordStrength.color
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-body font-medium mb-2 ${
                      passwordStrength.score <= 2 ? 'text-red-500' :
                      passwordStrength.score <= 3 ? 'text-yellow-600' :
                      'text-green-500'
                    }`}>
                      {passwordStrength.label}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      <PasswordCheckItem passed={passwordStrength.checks.minLength} label="8+ characters" />
                      <PasswordCheckItem passed={passwordStrength.checks.hasUpperCase} label="Uppercase (A-Z)" />
                      <PasswordCheckItem passed={passwordStrength.checks.hasLowerCase} label="Lowercase (a-z)" />
                      <PasswordCheckItem passed={passwordStrength.checks.hasNumbers} label="Number (0-9)" />
                      <PasswordCheckItem passed={passwordStrength.checks.hasSpecial} label="Special (!@#$)" />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmNewPassword" className="label-luxe">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiOutlineLockClosed className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className={`input-luxe pl-11 pr-11 ${
                      passwordData.confirmNewPassword && passwordData.newPassword !== passwordData.confirmNewPassword
                        ? 'border-sale focus:border-sale focus:ring-red-200'
                        : passwordData.confirmNewPassword && passwordData.newPassword === passwordData.confirmNewPassword
                        ? 'border-green-400 focus:border-green-400 focus:ring-green-200'
                        : ''
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-secondary transition-colors"
                  >
                    {showConfirmNewPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordData.confirmNewPassword && passwordData.newPassword !== passwordData.confirmNewPassword && (
                  <p className="text-xs text-sale mt-1 font-body flex items-center gap-1">
                    <HiX className="w-3.5 h-3.5" /> Passwords do not match
                  </p>
                )}
                {passwordData.confirmNewPassword && passwordData.newPassword === passwordData.confirmNewPassword && (
                  <p className="text-xs text-green-500 mt-1 font-body flex items-center gap-1">
                    <HiCheck className="w-3.5 h-3.5" /> Passwords match
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={
                  passwordLoading ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmNewPassword ||
                  passwordData.newPassword !== passwordData.confirmNewPassword
                }
                className="btn-primary py-3 px-8 rounded-lg flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Updating Password...
                  </>
                ) : (
                  <>
                    <HiOutlineLockClosed className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-luxe overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-heading text-xl font-bold text-primary">
              Account Information
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 font-body uppercase tracking-wider mb-1">
                  Account Type
                </p>
                <p className="font-body font-semibold text-primary capitalize">
                  {user?.role === 'admin' ? '👑 Administrator' : '👤 Customer'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 font-body uppercase tracking-wider mb-1">
                  Account Status
                </p>
                <p className="font-body font-semibold text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Active
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 font-body uppercase tracking-wider mb-1">
                  Last Login
                </p>
                <p className="font-body font-semibold text-primary">
                  {user?.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 font-body uppercase tracking-wider mb-1">
                  Saved Addresses
                </p>
                <p className="font-body font-semibold text-primary">
                  {user?.addresses?.length || 0} address{user?.addresses?.length !== 1 ? 'es' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
};

export default Profile;