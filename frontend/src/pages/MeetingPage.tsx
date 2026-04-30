import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMeeting, addParticipant } from '../api';
import type { Meeting } from '../types';
import { Share2, Check, Users, Plus, LogOut, Pencil } from 'lucide-react';

const PALETTE = [
  '#f87171', '#60a5fa', '#34d399', '#fbbf24',
  '#a78bfa', '#f472b6', '#2dd4bf', '#fb923c',
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    month: d.getMonth() + 1,
    day: d.getDate(),
    dow: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
    isSun: d.getDay() === 0,
    isSat: d.getDay() === 6,
  };
}

export default function MeetingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') ?? '';

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'vote' | 'result'>('vote');

  useEffect(() => {
    if (!id) return;
    getMeeting(id).then(m => {
      setMeeting(m);
      setLoading(false);
      const alreadyVoted = m.participants.some(p => p.name === userName);
      if (alreadyVoted) {
        setSubmitted(true);
        setView('result');
      }
    });
  }, [id, userName]);

  const toggleDate = (dateId: number) => {
    setSelectedIds(prev =>
      prev.includes(dateId) ? prev.filter(d => d !== dateId) : [...prev, dateId]
    );
  };

  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const updated = await addParticipant(id, { name: userName, availableDateIds: selectedIds });
      setMeeting(updated);
      setSubmitted(true);
      setView('result');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    if (!meeting) return;
    const mine = meeting.participants.find(p => p.name === userName);
    setSelectedIds(mine?.availableDateIds ?? []);
    setSubmitted(false);
    setView('vote');
  };

  const handleShare = () => {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewMeeting = () => {
    localStorage.removeItem('lastMeetingId');
    navigate('/create');
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate('/login', { replace: true });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-gray-500 text-sm">불러오는 중...</p>
      </div>
    </div>
  );

  if (!meeting) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">약속을 찾을 수 없습니다.</p>
    </div>
  );

  const participantColors = Object.fromEntries(
    meeting.participants.map((p, i) => [p.name, PALETTE[i % PALETTE.length]])
  );
  const myColor = participantColors[userName] ?? '#6366f1';

  const maxCount = Math.max(...meeting.dates.map(d => d.count), 1);
  const bestDates = meeting.dates.filter(d => d.count === maxCount && d.count > 0);

  const monthGroups = meeting.dates.reduce((acc, d) => {
    const ym = d.date.substring(0, 7);
    if (!acc[ym]) acc[ym] = [];
    acc[ym].push(d);
    return acc;
  }, {} as Record<string, typeof meeting.dates>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-md mx-auto px-4 py-6">

        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-3">
              <h1 className="text-xl font-bold text-gray-900">{meeting.title}</h1>
              {meeting.description && <p className="text-gray-500 text-sm mt-1">{meeting.description}</p>}
            </div>
            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl font-medium transition-colors shrink-0 ${
                copied ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? '복사됨!' : '공유'}
            </button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Users size={12} />
              <span>{meeting.participants.length}명 참여</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleNewMeeting} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                <Plus size={12} />
                새 약속 만들기
              </button>
              <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                <LogOut size={12} />
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          <button
            onClick={() => setView('vote')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'vote' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'}`}
          >
            투표하기
          </button>
          <button
            onClick={() => setView('result')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'result' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'}`}
          >
            결과 보기
          </button>
        </div>

        {/* 투표 탭 */}
        {view === 'vote' && (
          <div className="space-y-4">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <Check className="text-green-500 mx-auto mb-2" size={32} />
                <p className="font-semibold text-green-800">투표가 완료됐어요!</p>
                <p className="text-sm text-green-600 mt-1">결과 탭에서 확인해보세요</p>
                <button onClick={handleEdit} className="mt-3 flex items-center gap-1.5 text-sm text-green-700 hover:text-green-900 mx-auto font-medium">
                  <Pencil size={13} />
                  투표 수정하기
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: myColor }}>
                    {userName.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{userName}</span>
                  <span className="text-sm text-gray-400">님으로 투표합니다</span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    가능한 날짜를 모두 선택해주세요
                    {selectedIds.length > 0 && <span className="text-indigo-600 ml-1">({selectedIds.length}개 선택)</span>}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {meeting.dates.map(d => {
                      const { month, day, dow, isSun, isSat } = formatDate(d.date);
                      const isSelected = selectedIds.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          onClick={() => toggleDate(d.id)}
                          className={`py-3 rounded-xl text-center transition-colors border-2 ${
                            isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-100 hover:border-indigo-300'
                          }`}
                        >
                          <div className={`text-xs font-medium ${isSelected ? 'text-indigo-200' : isSun ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-gray-400'}`}>
                            {month}/{day}
                          </div>
                          <div className={`text-sm font-bold ${isSelected ? 'text-white' : isSun ? 'text-red-500' : isSat ? 'text-blue-500' : 'text-gray-700'}`}>
                            {dow}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                >
                  {submitting ? '제출 중...' : '투표 완료'}
                </button>
              </>
            )}
          </div>
        )}

        {/* 결과 탭 */}
        {view === 'result' && (
          <div className="space-y-4">
            {/* 가장 많이 되는 날 */}
            {bestDates.length > 0 && meeting.participants.length > 0 && (
              <div className="bg-indigo-600 rounded-2xl p-5 text-white">
                <p className="text-indigo-200 text-xs font-medium mb-2">가장 많이 되는 날</p>
                <div className="flex flex-wrap gap-2">
                  {bestDates.map(d => {
                    const { month, day, dow } = formatDate(d.date);
                    return (
                      <span key={d.id} className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                        {month}/{day}({dow}) · {d.count}명
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 참여자 범례 */}
            {meeting.participants.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">참여자</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {meeting.participants.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                      <span className={`text-xs ${p.name === userName ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                        {p.name}{p.name === userName ? ' (나)' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 캘린더 */}
            {Object.entries(monthGroups).map(([ym, dates]) => {
              const [y, m] = ym.split('-').map(Number);
              const firstDay = new Date(y, m - 1, 1).getDay();
              const daysInMonth = new Date(y, m, 0).getDate();
              const dateMap = new Map(dates.map(d => [parseInt(d.date.split('-')[2]), d]));

              return (
                <div key={ym} className="bg-white rounded-2xl shadow-sm p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-3">{y}년 {m}월</p>
                  <div className="grid grid-cols-7 mb-1">
                    {['일','월','화','수','목','금','토'].map((label, i) => (
                      <div key={label} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateInfo = dateMap.get(day);
                      const col = (firstDay + i) % 7;
                      const voters = dateInfo
                        ? meeting.participants.filter(p => p.availableDateIds.includes(dateInfo.id))
                        : [];
                      const isBest = dateInfo ? dateInfo.count === maxCount && dateInfo.count > 0 : false;

                      return (
                        <div key={day} className={`flex flex-col items-center py-1 rounded-lg min-h-[40px] ${dateInfo ? (isBest ? 'bg-indigo-50' : 'bg-gray-50') : ''}`}>
                          <span className={`text-xs font-medium mb-0.5 ${
                            !dateInfo
                              ? (col === 0 ? 'text-red-200' : col === 6 ? 'text-blue-200' : 'text-gray-200')
                              : isBest ? 'text-indigo-700 font-bold'
                              : (col === 0 ? 'text-red-500' : col === 6 ? 'text-blue-500' : 'text-gray-700')
                          }`}>
                            {day}
                          </span>
                          {voters.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-0.5 px-0.5">
                              {voters.map(p => (
                                <div
                                  key={p.id}
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: participantColors[p.name] }}
                                  title={p.name}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {meeting.participants.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                아직 투표한 사람이 없어요.<br />링크를 공유해보세요!
              </div>
            )}

            {/* 결과 탭에서도 투표 수정 가능 */}
            {submitted && (
              <button
                onClick={handleEdit}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 py-2"
              >
                <Pencil size={13} />
                내 투표 수정하기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
