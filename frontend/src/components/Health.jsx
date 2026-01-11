import React, { useState } from 'react';
import { Droplet, Heart, Minus, Plus } from 'lucide-react';

const Health = ({ hydration, onDrink }) => {
    const percentage = Math.min(100, (hydration.count / hydration.target) * 100);

    const handleIncrement = () => {
        if (hydration.count < hydration.target) {
            onDrink();
        }
    };

    const handleDecrement = () => {
        // Optional: implement decrease if needed
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in-up pb-20 md:pb-0">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
                    <Heart className="text-white" size={22} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Health Tracker</h2>
                    <p className="text-sm text-gray-500">Stay hydrated, stay focused</p>
                </div>
            </div>

            {/* Main Card */}
            <div className="flex-1 max-w-2xl mx-auto w-full">
                <div className="bg-[#1A1A1A] rounded-2xl border border-[#333333] shadow-md p-8 card-hover">

                    {/* Hydration Section */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-gray-400 uppercase tracking-wider">Hydration</h3>
                        <div className="flex items-center gap-2 text-gray-500">
                            <Droplet size={14} className="text-white" />
                            <span className="text-xs font-medium">{hydration.target} glasses</span>
                        </div>
                    </div>

                    {/* Glass Visualization */}
                    <div className="flex flex-col items-center justify-center mb-8 py-8">
                        {/* Glass Container */}
                        <div className="relative w-40 h-64 rounded-b-3xl border-4 border-[#333333] overflow-hidden bg-[#0A0A0A]">
                            {/* Water Fill */}
                            <div
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-gray-200 transition-all duration-700 ease-out flex items-center justify-center"
                                style={{ height: `${percentage}%` }}
                            >
                                {/* Water count display */}
                                {hydration.count > 0 && (
                                    <div className="text-black font-bold text-3xl drop-shadow-lg">
                                        {hydration.count}
                                        <span className="text-lg text-black/80">/{hydration.target}</span>
                                    </div>
                                )}

                                {/* Animated waves */}
                                <div className="absolute top-0 left-0 right-0 h-8 opacity-30">
                                    <svg className="w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
                                        <path
                                            d="M0,50 Q300,20 600,50 T1200,50 L1200,100 L0,100 Z"
                                            fill="black"
                                            className="animate-[wave_3s_ease-in-out_infinite]"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Glass shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={handleDecrement}
                            disabled={hydration.count === 0}
                            className="p-4 rounded-full bg-[#2A2A2A] hover:bg-[#333333] text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#2A2A2A]"
                        >
                            <Minus size={20} />
                        </button>

                        <button
                            onClick={handleIncrement}
                            disabled={hydration.count >= hydration.target}
                            className="p-5 rounded-full bg-white hover:bg-gray-100 text-black transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ripple"
                        >
                            <Droplet size={24} fill="currentColor" />
                        </button>

                        <button
                            onClick={handleIncrement}
                            disabled={hydration.count >= hydration.target}
                            className="p-4 rounded-full bg-[#2A2A2A] hover:bg-[#333333] text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#2A2A2A]"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[#333333]">
                            <div className="text-xs text-gray-600 uppercase tracking-wider mb-1 font-medium">Weekly Avg</div>
                            <div className="text-2xl font-bold text-white">
                                0 <span className="text-sm text-gray-500">glasses</span>
                            </div>
                        </div>
                        <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[#333333]">
                            <div className="text-xs text-gray-600 uppercase tracking-wider mb-1 font-medium">Daily Target</div>
                            <div className="text-2xl font-bold text-white">
                                {hydration.target} <span className="text-sm text-gray-500">glasses</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add wave animation */}
            <style>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-50px); }
        }
      `}</style>
        </div>
    );
};

export default Health;
