import React from 'react';
import { useCurrentUser } from '../hooks/useAuth';
import { UserCircle, Phone, ShieldCheck, SignOut, CalendarBlank, IdentificationCard } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-32 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#6366f1] to-[#4338ca] px-5 md:px-8 pt-10 pb-20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute top-16 -right-6 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
        
        <div className="max-w-3xl mx-auto relative z-10 flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold">Profil</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 -mt-12 relative z-10 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 md:gap-12">
          
          {/* Main Profile Info (Left on Desktop) */}
          <div className="flex flex-col items-center justify-center text-center md:w-1/3 shrink-0">
            <div className="w-28 h-28 rounded-full flex items-center justify-center mb-4 shadow-[0_0_0_4px_rgba(99,102,241,0.1)] overflow-hidden bg-white p-1">
              <img src="/shaxrixon_balon_logo.png" className="w-full h-full object-cover rounded-full" alt="Logo" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{currentUser?.full_name || 'Foydalanuvchi'}</h2>
            <p className="text-slate-500 mt-1 uppercase text-sm font-semibold tracking-wider">
              {currentUser?.is_staff ? 'Admin' : 'Xodim'}
            </p>
            
            <button
              onClick={handleLogout}
              className="w-full mt-8 flex items-center justify-center gap-2 bg-red-50 text-red-500 py-3.5 rounded-xl font-bold hover:bg-red-100 transition-colors shadow-sm"
            >
              <SignOut className="w-5 h-5" />
              Tizimdan chiqish
            </button>
          </div>

          {/* Details (Right on Desktop) */}
          <div className="flex-1 space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Shaxsiy ma'lumotlar</h3>
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                  <IdentificationCard className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">ID Raqam</span>
              </div>
              <span className="text-sm font-bold text-slate-800">#{currentUser?.id || '-'}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#6366f1]">
                  <UserCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">To'liq ism</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{currentUser?.full_name || 'Kiritilmagan'}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-500">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">Telefon raqam</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{currentUser?.phone || 'Kiritilmagan'}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-orange-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">Tizimdagi rol</span>
              </div>
              <span className="text-sm font-bold text-slate-800 uppercase">{currentUser?.is_staff ? 'Admin' : 'Oddiy xodim'}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-500">
                  <CalendarBlank className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">Ro'yxatdan o'tgan</span>
              </div>
              <span className="text-sm font-bold text-slate-800 text-right">
                {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleString('uz-UZ', {
                  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                }) : 'Kiritilmagan'}
              </span>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
