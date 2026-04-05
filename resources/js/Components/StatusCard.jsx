import React from 'react';

export default function StatusCard({ title, value, unit, sensorType, statusColor }) {
    // Map status colors to Tailwind classes
    const colorStyles = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        orange: 'bg-orange-50 text-orange-900 border-orange-200',
        red: 'bg-red-50 text-red-900 border-red-200',
    };

    const currentStyle = colorStyles[statusColor] || colorStyles.emerald;

    return (
        <div className={`p-6 rounded-xl border-2 shadow-sm flex flex-col justify-between ${currentStyle}`}>
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg uppercase tracking-wide">{title}</h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                    {sensorType}
                </span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight">{value}</span>
                <span className="text-xl font-medium opacity-80">{unit}</span>
            </div>
        </div>
    );
}