import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMeeting } from '../api';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, LogOut } from 'lucide-react';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toLocalDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}(${['일','월','화','수','목','금','토'][d.getDay()]})`;
}

export default function CreatePage() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') ?? '';

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate('/login', { replace: true });
  };
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'dates'>('info');

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const toggleDate = (dateStr: string) => {
    setSelectedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr].sort()
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || selectedDates.length === 0) return;
    setLoading(true);
    try {
      const meeting = await createMeeting({ title: title.trim(), description: description.trim() || undefined, dates: selectedDates });
      localStorage.setItem('lastMeetingId', meeting.id);
      navigate(`/meeting/${meeting.id}`);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const today = toLocalDateStr(now.getFullYear(), now.getMonth(), now.getDate());
  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex justify-end mb-2">
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
            <LogOut size={13} />
            {userName} · 로그아웃
          </button>
        </div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-3">
            <Calendar className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">약속 만들기</h1>
          <p className="text-gray-500 text-sm mt-1">친구들과 함께할 날짜를 정해보세요</p>
        </div>

        {step === 'info' ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">약속 이름 *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="예) 여름 여행 날짜 정하기"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">설명 (선택)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="약속에 대한 설명을 입력해주세요"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>
            <button
              onClick={() => setStep('dates')}
              disabled={!title.trim()}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              다음 — 날짜 선택
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button onClick={() => setStep('info')} className="flex items-center gap-1 text-gray-500 text-sm">
              <ChevronLeft size={16} /> 이전
            </button>

            <div className="bg-white rounded-2xl shadow-sm p-4">
              {/* 캘린더 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <ChevronLeft size={18} />
                </button>
                <span className="font-semibold text-gray-900">{year}년 {month + 1}월</span>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d, i) => (
                  <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-y-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = toLocalDateStr(year, month, day);
                  const isSelected = selectedDates.includes(dateStr);
                  const isToday = dateStr === today;
                  const isPast = dateStr < today;
                  const dayOfWeek = (firstDay + i) % 7;

                  return (
                    <button
                      key={day}
                      onClick={() => !isPast && toggleDate(dateStr)}
                      disabled={isPast}
                      className={`
                        aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-colors
                        ${isSelected ? 'bg-indigo-600 text-white' : ''}
                        ${!isSelected && isToday ? 'border-2 border-indigo-400 text-indigo-600' : ''}
                        ${!isSelected && !isPast ? 'hover:bg-indigo-50' : ''}
                        ${isPast ? 'text-gray-200 cursor-not-allowed' : ''}
                        ${!isSelected && !isPast && dayOfWeek === 0 ? 'text-red-400' : ''}
                        ${!isSelected && !isPast && dayOfWeek === 6 ? 'text-blue-400' : ''}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 선택된 날짜 */}
            {selectedDates.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">선택된 날짜 {selectedDates.length}개</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map(d => (
                    <span key={d} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-3 py-1.5 rounded-full font-medium">
                      {formatDate(d)}
                      <button onClick={() => toggleDate(d)} className="hover:text-indigo-900">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || selectedDates.length === 0}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {loading ? '만드는 중...' : `약속 만들기 (${selectedDates.length}개 날짜)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}