import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Calendar,
    CreditCard,
    User,
    Navigation,
    CheckCircle2,
    LogOut,
    Loader2,
    PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMe, logout, linkPassenger } from '../api/auth';
import { getUser, getRides, getSubscriptions, updateRideStatus, paySubscription, cancelRide } from '../api/parent';

const ParentDashboard = ({ onPay }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Data state
    const [activeTab, setActiveTab] = useState('tracking');
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [rides, setRides] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [walletAmount, setWalletAmount] = useState(0);

    // Link Child State
    const [showRxLink, setShowRxLink] = useState(false);
    const [uniqueIdInput, setUniqueIdInput] = useState('');

    useEffect(() => {
        const initDashboard = async () => {
            try {
                const user = await getMe();
                setCurrentUser(user);

                if (user.children && user.children.length > 0) {
                    // Fetch details for all children
                    const childrenData = await Promise.all(
                        user.children.map(childId => getUser(childId))
                    );
                    setChildren(childrenData);
                    setSelectedChild(childrenData[0]);
                } else {
                    setChildren([]);
                }
            } catch (err) {
                console.error("Auth failed", err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        initDashboard();
    }, [navigate]);

    // Fetch data when selected child changes
    useEffect(() => {
        if (!selectedChild) return;

        const fetchData = async () => {
            try {
                // Fetch rides
                const ridesData = await getRides(selectedChild.id);
                setRides(ridesData || []);

                // Fetch subscriptions
                const subsData = await getSubscriptions(selectedChild.id);
                setSubscriptions(subsData || []);

                // Calculate wallet amount
                const totalDue = subsData
                    .filter(sub => sub.payment_status === 'PENDING' || sub.payment_status === 'OVERDUE')
                    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
                setWalletAmount(totalDue);

            } catch (err) {
                console.error("Error fetching child data:", err);
            }
        };

        fetchData();
    }, [selectedChild]);

    const handleLinkChild = async (e) => {
        e.preventDefault();
        try {
            await linkPassenger(uniqueIdInput);
            alert("تم ربط الطالب بنجاح!");
            // Refresh
            window.location.reload();
        } catch (err) {
            alert("فشل الربط. تأكد من الرمز.");
        }
    };

    const handleWontAttend = async () => {
        if (!selectedChild) return;
        const today = new Date().toISOString().split('T')[0];
        const todaysRide = rides.find(r => r.date === today && (r.status === 'SCHEDULED' || r.status === 'REASSIGNED'));

        if (todaysRide) {
            if (confirm(`هل أنت متأكد أن ${selectedChild.first_name || selectedChild.username} لن يحضر اليوم؟`)) {
                try {
                    await cancelRide(todaysRide.id);
                    alert('تم تحديث الحالة بنجاح.');
                    // Refresh data
                    const ridesData = await getRides(selectedChild.id);
                    setRides(ridesData);
                } catch (err) {
                    alert('فشل تحديث الحالة.');
                }
            }
        } else {
            alert('لا توجد رحلة مجدولة لهذا اليوم لتحديثها.');
        }
    };

    const handlePayment = async () => {
        const pendingSub = subscriptions.find(sub => sub.payment_status === 'PENDING' || sub.payment_status === 'OVERDUE');
        if (pendingSub) {
            if (confirm(`دفع ${Number(pendingSub.amount).toLocaleString()} د.ع عن اشتراك الفترة ${pendingSub.start_date}؟`)) {
                try {
                    await paySubscription(pendingSub.id);
                    alert('تم الدفع بنجاح!');
                    // Refresh
                    const subsData = await getSubscriptions(selectedChild.id);
                    setSubscriptions(subsData);
                    setWalletAmount(0); // Update/Recalculate
                } catch (err) {
                    alert('فشل الدفع.');
                }
            }
        } else {
            alert("لا توجد مبالغ مستحقة.");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-['Cairo'] pb-20" dir="rtl">

            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">مرحباً، {currentUser?.first_name || currentUser?.username}</h1>
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                            <span>يتابع:</span>
                            {children.length > 0 ? (
                                <select
                                    value={selectedChild?.id || ''}
                                    onChange={(e) => {
                                        const child = children.find(c => c.id === Number(e.target.value));
                                        setSelectedChild(child);
                                    }}
                                    className="mr-2 bg-transparent font-bold text-purple-600 focus:outline-none"
                                >
                                    {children.map(child => (
                                        <option key={child.id} value={child.id}>
                                            {child.first_name ? `${child.first_name} ${child.last_name}` : child.username}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="mr-2 text-red-500">لا يوجد أبناء</span>
                            )}
                            <button onClick={() => setShowRxLink(!showRxLink)} className="mr-2 text-blue-600"><PlusCircle size={16} /></button>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {showRxLink && (
                    <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                        <form onSubmit={handleLinkChild} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="أدخل رمز الطالب (Unique ID)"
                                className="flex-1 p-2 border rounded-lg text-sm"
                                value={uniqueIdInput}
                                onChange={e => setUniqueIdInput(e.target.value)}
                            />
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">ربط</button>
                        </form>
                    </div>
                )}
            </div>

            <div className="max-w-md mx-auto p-4 space-y-6">

                {selectedChild && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2 text-green-600">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">حالة الطالب</span>
                            <span className="text-xs text-green-600 font-bold mt-1">
                                {rides.find(r => r.date === new Date().toISOString().split('T')[0])?.status === 'COMPLETED' ? 'وصل للمدرسة' : 'في الطريق / لم يبدأ'}
                            </span>
                        </div>
                        <button
                            onClick={handleWontAttend}
                            className="p-4 bg-white rounded-2xl shadow-sm border border-red-100 flex flex-col items-center text-center active:scale-95 transition-transform"
                        >
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2 text-red-600">
                                <User className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">لن يحضر اليوم</span>
                            <span className="text-xs text-red-400 mt-1">إبلاغ السائق</span>
                        </button>
                    </div>
                )}

                {activeTab === 'tracking' && (
                    <div className="bg-white rounded-3xl shadow-lg ring-1 ring-slate-900/5 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 flex items-center">
                                <Navigation className="w-5 h-5 ml-2 text-blue-500" />
                                التتبع المباشر (تجريبي)
                            </h3>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">
                                متصل الآن
                            </span>
                        </div>
                        <div className="h-64 bg-slate-200 relative flex items-center justify-center">
                            <div className="absolute inset-0 opacity-20" style={{
                                backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                            }}></div>
                            <div className="text-center relative z-10">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center animate-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center relative z-20 mx-auto">
                                    <span className="text-2xl">🚌</span>
                                </div>
                                <p className="mt-4 font-medium text-slate-600 bg-white/80 backdrop-blur px-3 py-1 rounded-lg shadow-sm">
                                    الموقع
                                </p>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500">حالة الرحلة</span>
                                <span className="font-bold text-slate-900">
                                    {rides.find(r => r.date === new Date().toISOString().split('T')[0])?.status || 'لا يوجد رحلة نشطة'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 flex items-center">
                                <Calendar className="w-5 h-5 ml-2 text-purple-500" />
                                سجل الحضور
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {rides
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .slice(0, 5) // Show last 5 rides
                                .map((ride) => (
                                    <div key={ride.id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full ml-3 ${ride.status !== 'CANCELLED' && ride.status !== 'MISSED' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <div>
                                                <p className="font-bold text-slate-900">{ride.date}</p>
                                                <p className="text-xs text-slate-500">{ride.pickup_time}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${ride.status !== 'CANCELLED' && ride.status !== 'MISSED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {ride.status}
                                        </span>
                                    </div>
                                ))}
                            {rides.length === 0 && (
                                <div className="p-4 text-center text-slate-500">لا يوجد سجل حضور</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'wallet' && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                            <div className="relative z-10">
                                <p className="text-slate-400 text-sm mb-1">المبلغ المستحق</p>
                                <h2 className="text-4xl font-bold mb-6">{walletAmount.toLocaleString()} د.ع</h2>
                                <div className="flex space-x-3 space-x-reverse">
                                    <button
                                        onClick={handlePayment}
                                        className="flex-1 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
                                    >
                                        دفع الآن
                                    </button>
                                    <button className="px-4 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors backdrop-blur-sm">
                                        السجل
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                                <CreditCard className="w-5 h-5 ml-2 text-blue-500" />
                                الاشتراكات
                            </h3>
                            <div className="space-y-3">
                                {subscriptions.map((sub) => (
                                    <div key={sub.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 ml-3">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{sub.start_date} - {sub.end_date}</p>
                                                <p className="text-xs text-slate-500">{sub.payment_status}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-slate-900">{Number(sub.amount).toLocaleString()} د.ع</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-end z-20 pb-8">
                <button
                    onClick={() => setActiveTab('tracking')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'tracking' ? 'text-purple-600' : 'text-slate-400'}`}
                >
                    <MapPin className={`w-6 h-6 ${activeTab === 'tracking' ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-bold">التتبع</span>
                </button>
                <button
                    onClick={() => setActiveTab('attendance')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'attendance' ? 'text-purple-600' : 'text-slate-400'}`}
                >
                    <Calendar className={`w-6 h-6 ${activeTab === 'attendance' ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-bold">الحضور</span>
                </button>
                <button
                    onClick={() => setActiveTab('wallet')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'wallet' ? 'text-purple-600' : 'text-slate-400'}`}
                >
                    <CreditCard className={`w-6 h-6 ${activeTab === 'wallet' ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-bold">المحفظة</span>
                </button>
            </div>
        </div>
    );
};

export default ParentDashboard;
