import React, { useState, useEffect } from 'react';
import { MapPin, Star, User, Phone, CheckCircle, XCircle, Clock, CreditCard, QrCode, ChevronRight, LogOut, ArrowRight, Loader2, Bus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getMe, logout } from '../api/auth';
import { getMyRides, listDrivers, createSubscription, getMySubscriptions } from '../api/student';
import { getDestinations } from '../api/destinations';

const StudentDashboard = ({ authCode, onScan, onPay }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [rides, setRides] = useState([]);
    const [nextRide, setNextRide] = useState(null);
    const [rating, setRating] = useState(0);

    // Subscription Flow State
    const [destinations, setDestinations] = useState([]);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [showSubscribeFlow, setShowSubscribeFlow] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [loadingDrivers, setLoadingDrivers] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        const initDashboard = async () => {
            try {
                const user = await getMe();
                setCurrentUser(user);
                await Promise.all([fetchRides(), fetchSubscriptions(), fetchDestinations()]);
            } catch (err) {
                console.error("Auth failed", err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        const fetchSubscriptions = async () => {
            try {
                const subs = await getMySubscriptions();
                setSubscriptions(subs);
                // If user has no active subscription, show subscribe flow
                if (!subs || subs.length === 0) {
                    setShowSubscribeFlow(true);
                }
            } catch (err) { console.error(err); }
        };

        const fetchDestinations = async () => {
            try {
                const dests = await getDestinations();
                setDestinations(dests);
            } catch (err) { console.error(err); }
        };

        initDashboard();
    }, [navigate]);

    const fetchRides = async () => {
        try {
            const data = await getMyRides();
            const upcoming = data.filter(r => new Date(r.date + 'T' + r.pickup_time) >= new Date());
            upcoming.sort((a, b) => new Date(a.date + 'T' + a.pickup_time) - new Date(b.date + 'T' + b.pickup_time));
            setRides(data);
            if (upcoming.length > 0) {
                setNextRide(upcoming[0]);
            }
        } catch (err) { console.error(err); }
    }

    const handleDestinationSelect = async (destination) => {
        setSelectedDestination(destination);
        setLoadingDrivers(true);
        try {
            const drivers = await listDrivers(destination);
            setAvailableDrivers(drivers);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDrivers(false);
        }
    };

    const handleSubscribe = async (driver) => {
        if (!confirm(`هل أنت متأكد من الاشتراك مع الكابتن ${driver.user.first_name || 'سائق'}؟`)) return;

        setSubscribing(true);
        try {
            // Hardcoded location for now as per minimal requirements, in real app use Geolocation API
            const payload = {
                driver_id: driver.id,
                weekdays: [0, 1, 2, 3, 4], // Sun-Thu
                pickup_latitude: 33.3152,
                pickup_longitude: 44.3661
            };
            await createSubscription(payload);
            alert("تم الاشتراك بنجاح!");
            setShowSubscribeFlow(false);
            fetchRides();
        } catch (err) {
            console.error("Subscription Error:", err);
            if (err.response) {
                console.error("Error Response Data:", err.response.data);
                console.error("Error Status:", err.response.status);
                alert(`فشل الاشتراك: ${err.response.data.message || JSON.stringify(err.response.data.errors) || 'خطأ غير معروف'}`);
            } else {
                alert("فشل الاشتراك. حاول مرة أخرى.");
            }
        } finally {
            setSubscribing(false);
        }
    };

    const handleCheckIn = async () => {
        alert("خاصية إرسال إشعار لولي الأمر (تجريبية)");
    };

    const handleRate = (value) => {
        setRating(value);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    // --- SUBSCRIPTION FLOW VIEW ---
    if (showSubscribeFlow && subscriptions.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 font-['Cairo']" dir="rtl">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                    <h1 className="text-xl font-bold text-slate-900 mb-2">مرحباً {currentUser?.first_name}</h1>
                    <p className="text-slate-500">للبدء، يرجى اختيار وجهتك والاشتراك مع سائق.</p>
                </div>

                {!selectedDestination ? (
                    <div className="space-y-4">
                        <h2 className="font-bold text-slate-700">اختر الوجهة</h2>
                        {destinations.map(dest => (
                            <button
                                key={dest.id}
                                onClick={() => handleDestinationSelect(dest.name)}
                                className="w-full p-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                        <MapPin size={20} />
                                    </div>
                                    <span className="font-bold text-slate-800">{dest.name}</span>
                                </div>
                                <ChevronRight className="text-slate-400" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button onClick={() => setSelectedDestination(null)} className="text-sm text-blue-600 font-bold mb-2">تغيير الوجهة</button>
                        <h2 className="font-bold text-slate-700">السائقين المتوفرين</h2>

                        {loadingDrivers ? (
                            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" /></div>
                        ) : availableDrivers.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">لا يوجد سائقين لهذه الوجهة حالياً.</p>
                        ) : (
                            availableDrivers.map(driver => (
                                <div key={driver.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                                            {driver.profile_picture ? (
                                                <img src={driver.profile_picture} alt="Driver" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{driver.user.first_name} {driver.user.last_name}</h3>
                                            <p className="text-xs text-slate-500">{driver.vehicle_model} | {driver.capacity} مقاعد</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl mb-3">
                                        <span className="text-slate-500 text-sm">الاشتراك الشهري</span>
                                        <span className="font-bold text-blue-600">{driver.subscription?.amount ? Number(driver.subscription.amount).toLocaleString() : '---'} د.ع</span>
                                    </div>
                                    <button
                                        onClick={() => handleSubscribe(driver)}
                                        disabled={subscribing}
                                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        {subscribing ? 'جاري الاشتراك...' : 'اشترك الآن'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
                >
                    تسجيل الخروج
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20 font-['Cairo']" dir="rtl">

            <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-6 pt-12 pb-24 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BusIcon size={120} />
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <LogOut size={20} />
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
