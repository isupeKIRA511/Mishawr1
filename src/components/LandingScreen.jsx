import React, { useState, useEffect } from 'react';
import { User, Bus, ChevronLeft, Users, MapPin, Shield, Briefcase, ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingScreen = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 0,
            type: 'hero',
            title: "تطبيق خطوطي.. رفيقك في كل مشوار",
            slogan: "ناخذك خط وبسلامة تامة.. وين ما تريد.",
            buttonText: "ابدأ الرحلة الآن",
            icon: <Bus className="w-16 h-16 text-blue-600" />,
            color: "bg-blue-50"
        },
        {
            id: 1,
            type: 'info',
            title: "خطك القريب.. بضغطة زر!",
            description: "لا تشيل هم المسافة. حدد موقعك ووجهتك (مدرستك أو جامعتك)، واحنا بنطلع لك أقرب السائقين المتوفرين في منطقتك وبأفضل الأسعار.",
            motivation: "مسارك صار أسهل وأذكى.",
            icon: <MapPin className="w-12 h-12 text-green-600" />,
            color: "bg-green-50"
        },
        {
            id: 2,
            type: 'info',
            title: "راحة بالك.. أولويتنا.",
            description: "تابع رحلة أبنائك لحظة بلحظة. إشعارات فورية عند الوصول، وتتبع مباشر للموقع لضمان السلامة والالتزام بالوقت.",
            motivation: "أولادكم بأمان من باب البيت لباب المدرسة.",
            icon: <Shield className="w-12 h-12 text-purple-600" />,
            color: "bg-purple-50"
        },
        {
            id: 3,
            type: 'info',
            title: "رتب جدولك وزيد دخلك.",
            description: "انضم لشبكة سائقينا، وحدد منطقتك والطلاب القريبين منك. وفر وقتك وبنزينك مع نظام توزيع الرحلات الذكي.",
            motivation: "كن أنت القائد في منطقتك.",
            icon: <Briefcase className="w-12 h-12 text-orange-600" />,
            color: "bg-orange-50"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const handleStart = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-['Cairo'] relative overflow-hidden">
            {/* Slider Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
                <div className={`p-6 rounded-full ${slides[currentSlide].color} mb-8 transition-colors duration-500 animate-in fade-in zoom-in duration-300`}>
                    {slides[currentSlide].icon}
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-4 transition-all duration-300 leading-relaxed">
                    {slides[currentSlide].title}
                </h1>

                {slides[currentSlide].type === 'hero' ? (
                    <div className="space-y-8 w-full max-w-xs animate-in slide-in-from-bottom duration-500 delay-100">
                        <p className="text-xl text-slate-600 font-medium">
                            {slides[currentSlide].slogan}
                        </p>
                        <button
                            onClick={handleStart}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>{slides[currentSlide].buttonText}</span>
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                    </div>
                ) : (
                    <div className="space-y-6 max-w-sm animate-in slide-in-from-bottom duration-500 delay-100">
                        <p className="text-slate-500 leading-relaxed text-lg">
                            {slides[currentSlide].description}
                        </p>
                        <p className="text-blue-600 font-bold bg-blue-50 py-2 px-4 rounded-lg inline-block">
                            {slides[currentSlide].motivation}
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation & Dots */}
            <div className="p-8 flex items-center justify-between bg-white z-10">
                <button
                    onClick={() => handleStart()}
                    className={`text-sm font-bold text-slate-400 hover:text-slate-600 ${currentSlide === 0 ? 'invisible' : ''}`}
                >
                    تخطي
                </button>

                <div className="flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                    className="w-10 h-10 rounded-full bg-slate-50 text-slate-900 flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default LandingScreen;
