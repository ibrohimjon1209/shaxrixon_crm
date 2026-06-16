import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, LockKey, Eye, EyeSlash } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { formatPhoneNumber, cleanPhoneNumber } from '../utils/phoneFormat';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: '+998',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanPhone = cleanPhoneNumber(formData.phone);
    const newErrors = {};
    if (!formData.phone || formData.phone === '+998') {
      newErrors.phone = 'Telefon raqamni kiriting';
    } else if (cleanPhone.length < 13) {
      newErrors.phone = 'Telefon raqam to\'liq emas';
    }

    if (!formData.password) {
      newErrors.password = 'Parolni kiriting';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await login({
        phone: cleanPhone,
        password: formData.password
      });
      navigate('/');
    } catch (error) {
      console.error('Login error full:', error.response?.data);
      
      // Serverdan kelgan xabarni olish (Django default xabarlari uchun)
      const serverError = error.response?.data;
      let errorMessage = 'Noto\'g\'ri telefon raqam yoki parol';
      
      if (serverError) {
        if (typeof serverError === 'string') errorMessage = serverError;
        else if (serverError.detail) errorMessage = serverError.detail;
        else if (serverError.non_field_errors) errorMessage = serverError.non_field_errors[0];
        else if (serverError.phone) errorMessage = `Telefon: ${serverError.phone[0]}`;
        else if (serverError.password) errorMessage = `Parol: ${serverError.password[0]}`;
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed local formatPhoneNumber as we use the utility one

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-white relative overflow-hidden">
      {/* Decorative blurred shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-slate-200 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-200 rounded-full blur-3xl opacity-30 translate-x-1/3 translate-y-1/3" />
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-12">
        <div className="w-full max-w-sm mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            {/* Logo */}
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">B</span>
            </div>
            
            {/* App name */}
            <h1 className="text-3xl font-bold text-slate-900 mb-2">BiCRM</h1>
            
            {/* Tagline */}
            <p className="text-sm text-slate-600">Biznesingizni oson va tez boshqaring</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Phone Input */}
            <div>
              <div className={`relative transition-all duration-300 ${errors.phone ? 'transform scale-105' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className={`w-5 h-5 ${errors.phone ? 'text-indigo-500' : 'text-slate-400'} transition-colors`} />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setFormData(prev => ({ ...prev, phone: formatted }));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  placeholder="+998 XX XXX XX XX"
                  className={`block w-full pl-12 pr-4 py-3.5 bg-white border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                    errors.phone 
                      ? 'border-indigo-500 focus:ring-indigo-500' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-indigo-600">{errors.phone}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className={`relative transition-all duration-300 ${errors.password ? 'transform scale-105' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockKey className={`w-5 h-5 ${errors.password ? 'text-indigo-500' : 'text-slate-400'} transition-colors`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Parol"
                  className={`block w-full pl-12 pr-12 py-3.5 bg-white border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                    errors.password 
                      ? 'border-indigo-500 focus:ring-indigo-500' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeSlash className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-indigo-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-slate-600">Eslab qolish</span>
              </label>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <p className="text-sm text-indigo-600">{errors.general}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kirish...
                </div>
              ) : (
                'Kirish'
              )}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
};

export default Login;
