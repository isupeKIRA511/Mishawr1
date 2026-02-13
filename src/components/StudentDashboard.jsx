import React, { useState, useEffect } from 'react';
import { MapPin, Star, User, Phone, CheckCircle, XCircle, Clock, CreditCard, QrCode, ChevronRight, LogOut, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { login, getMe } from '../api/auth';
import { getMyRides } from '../api/student';

const StudentDashboard = ({ userData, authCode, onBack, onScan, onPay }) => {
    const [view, setView] = useState('login'); // login or dashboard
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(0);

    const [currentUser, setCurrentUser] = useState(null);
    const [rides, setRides] = useState([]);
    const [nextRide, setNextRide] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(username, password);
            const user = await getMe();
            setCurrentUser(user);
            setView('dashboard');
        } catch (err) {
            console.error(err);
            setError('فشل تسجيل الدخول. تأكد من المعلومات.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'dashboard' && currentUser) {
            fetchRides();
        }
    }, [view, currentUser]);

    const fetchRides = async () => {
        try {
            const data = await getMyRides();
            // Filter future rides
            const upcoming = data.filter(r => new Date(r.date + 'T' + r.pickup_time) >= new Date());
            // Sort by date/time
            upcoming.sort((a, b) => new Date(a.date + 'T' + a.pickup_time) - new Date(b.date + 'T' + b.pickup_time));

            setRides(data);
            if (upcoming.length > 0) {
                setNextRide(upcoming[0]);
            }
        } catch (err) {
            console.error(err);
        }
    }


    const handleCheckIn = async () => {
        // Implement real check-in if API supports it.
        // For now, since API doc doesn't specify, maybe just a toast or "notify-parent" logic if backend supported it.
        // Or update ride status if allowed? Passenger usually doesn't update status to picked-up, Driver does.
        // Let's keep the user's simulation logic but warn if it fails.
        alert("خاصية إرسال إشعار لولي الأمر (تجريبية)");
    };

    const handleRate = (value) => {
        setRating(value);
    };

    if (view === 'login') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-['Cairo']" dir="rtl">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-blue-600 p-8 text-center">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">تسجيل دخول الطالب</h2>
                        <p className="text-blue-100">أدخل بيانات الحساب للمتابعة</p>
                    </div>

                    <form onSubmit={handleLogin} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-center text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">اسم المستخدم</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all duration-300 flex items-center justify-center ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                            {!loading && <ArrowRight className="mr-2 w-5 h-5" />}
                        </button>

                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full py-2 text-slate-400 text-sm hover:text-slate-600 transition-colors"
                        >
                            العودة للشاشة الرئيسية
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Dashboard View
    return (
        <div className="min-h-screen bg-slate-50 relative pb-20 font-['Cairo']" dir="rtl">

            <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-6 pt-12 pb-24 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BusIcon size={120} />
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white">
                        <User size={32} />
                    </div>
                    <div className="text-white">
                        <p className="text-blue-100 text-sm font-medium">أهلاً،</p>
                        <h1 className="text-2xl font-bold">{currentUser?.first_name || currentUser?.username || 'طالب'}</h1>
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-16 relative z-20 space-y-6">

                {nextRide ? (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                        {nextRide.driver_details?.profile_picture ? (
                                            <img src={nextRide.driver_details.profile_picture} alt="Driver" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{nextRide.driver_details?.user?.first_name || 'سائق الخط'}</h3>
                                    <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full mt-1 w-fit">
                                        <Clock size={12} />
                                        <span>{nextRide.pickup_time}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
                                <Phone size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500 text-sm border-t border-slate-50 pt-3">
                            <MapPin size={16} className="text-slate-400" />
                            <span>{nextRide.destination_details?.name || 'وجهة غير محددة'}</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center py-8">
                        <p className="text-slate-500">لا توجد رحلات قادمة.</p>
                    </div>
                )}


                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={onScan}
                        className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-600 to-gray-700 p-4 rounded-2xl shadow-lg border border-transparent hover:shadow-xl transition-all active:scale-95"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <QrCode size={20} />
                        </div>
                        <span className="text-xs font-bold text-white">سجل حضورك QR</span>
                    </button>

                    <button
                        onClick={handleCheckIn}
                        className="flex flex-col items-center justify-center gap-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-red-500 hover:shadow-md transition-all"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">إعلام ولي الأمر</span>
                    </button>

                    <button className="flex flex-col items-center justify-center gap-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-green-500 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <MapPin size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">الرحلة</span>
                    </button>
                </div>

                {authCode && (
                    <div className="mt-2 text-center">
                        <span className="text-[10px] text-slate-300 font-mono">CODE: {authCode.slice(-6)}</span>
                    </div>
                )}
            </div>


            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mx-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700 text-sm">قيم رحلتك الأخيرة</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleRate(star)}
                                className="focus:outline-none transition-transform active:scale-90"
                            >
                                <Star
                                    size={24}
                                    className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <textarea
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    placeholder="اكتب ملاحظاتك للسائق..."
                ></textarea>

                <button
                    onClick={() => {
                        if (rating === 0) alert('يرجى اختيار التقييم أولاً');
                        else alert('تم إرسال التقييم');
                    }}
                    className="w-full mt-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold"
                >
                    إرسال التقييم
                </button>
            </div>
        </div>
    );
};

const BusIcon = ({ size = 24, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M8 6v6" />
        <path d="M15 6v6" />
        <path d="M2 12h19.6" />
        <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
        <circle cx="7" cy="18" r="2" />
        <path d="M9 18h5" />
        <circle cx="16" cy="18" r="2" />
    </svg>
);

export default StudentDashboard;
