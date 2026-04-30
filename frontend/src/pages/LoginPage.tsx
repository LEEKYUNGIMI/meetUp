import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function LoginPage() {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const handleSubmit = () => {
    if (!name.trim()) return;
    localStorage.setItem('userName', name.trim());
    const redirect = params.get('redirect') || '/';
    navigate(redirect, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <Calendar className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">밋업</h1>
          <p className="text-gray-500 text-sm mt-1">이름을 입력하고 시작하세요</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">이름</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="이름을 입력해주세요"
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
