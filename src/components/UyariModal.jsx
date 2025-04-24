import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const UyariModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col items-center gap-4">
                    <FaExclamationTriangle className="w-16 h-16 text-red-500" />
                    <h2 className="text-2xl font-bold text-center text-gray-800">Önemli Uyarı!</h2>
                    <p className="text-center text-gray-600 text-lg">
                        Üye olup giriş yapmayı unutmayın, aksi halde favorilere eklediğiniz hikayeleriniz silinebilir!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UyariModal;