'use client';

import { useState } from 'react';

interface TaskFile {
  name: string;
  size: number;
}

interface TaskState {
  checked: boolean;
  files: TaskFile[];
  note: string;
  link: string;
}

const WEEKS = [
  {
    id: 'week1',
    badge: 'WEEK 1',
    title: '릴스 기획 & 촬영',
    date: '3월 11일 ~ 17일',
    tasks: [
      { id: 'w1-t1', label: '릴스 기획', hasUpload: true, hasNote: true, notePlaceholder: '기획 내용을 간단히 적어주세요 (콘셉트, 참고 영상 등)', uploadLabel: '기획 자료 업로드', accept: 'image/*,video/*,.pdf,.doc,.docx' },
      { id: 'w1-t2', label: '릴스에 들어갈 장면 촬영하기', hasUpload: true, hasNote: false, uploadLabel: '촬영 영상/사진 업로드', accept: 'image/*,video/*' },
      { id: 'w1-t3', label: '대본 뽑기', hasUpload: true, hasNote: false, uploadLabel: '대본 파일 업로드', accept: '.pdf,.doc,.docx,.txt,image/*' },
      { id: 'w1-t4', label: '매일 블로그 글쓰기', hasUpload: false, hasNote: true, hasLink: true, notePlaceholder: '작성한 블로그 글 목록 또는 메모', linkPlaceholder: '블로그 글 링크를 붙여넣어 주세요' },
    ],
  },
  {
    id: 'week2',
    badge: 'WEEK 2',
    title: '편집 & 광고 세팅',
    date: '3월 18일 ~ 24일',
    tasks: [
      { id: 'w2-t1', label: '릴스 편집', hasUpload: true, hasNote: false, uploadLabel: '편집 완료 영상 업로드', accept: 'video/*' },
      { id: 'w2-t2', label: '매일 블로그 글쓰기', hasUpload: false, hasNote: true, hasLink: true, notePlaceholder: '작성한 블로그 글 목록 또는 메모', linkPlaceholder: '블로그 글 링크를 붙여넣어 주세요' },
      { id: 'w2-t3', label: '네이버 플레이스 점검', hasUpload: true, hasNote: true, notePlaceholder: '점검 내용을 간단히 적어주세요', uploadLabel: '점검 캡처/자료 업로드', accept: 'image/*,.pdf' },
      { id: 'w2-t4', label: '랜딩 페이지 작성', hasUpload: true, hasNote: false, hasLink: true, linkPlaceholder: '랜딩 페이지 URL을 붙여넣어 주세요', uploadLabel: '랜딩 페이지 캡처/파일 업로드', accept: 'image/*,.pdf' },
      { id: 'w2-t5', label: '메타광고 셋팅', hasUpload: true, hasNote: true, notePlaceholder: '광고 셋팅 내용 메모 (타겟, 예산, 소재 등)', uploadLabel: '광고 셋팅 캡처/자료 업로드', accept: 'image/*,.pdf' },
    ],
  },
];

export default function AssignmentPage() {
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [tasks, setTasks] = useState<Record<string, TaskState>>(() => {
    const initial: Record<string, TaskState> = {};
    WEEKS.forEach(week => {
      week.tasks.forEach(task => {
        initial[task.id] = { checked: false, files: [], note: '', link: '' };
      });
    });
    return initial;
  });
  const [submitted, setSubmitted] = useState(false);

  const updateTask = (taskId: string, updates: Partial<TaskState>) => {
    setTasks(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], ...updates },
    }));
  };

  const handleFileChange = (taskId: string, fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).map(f => ({ name: f.name, size: f.size }));
    updateTask(taskId, { files: [...tasks[taskId].files, ...newFiles] });
  };

  const removeFile = (taskId: string, index: number) => {
    const updated = tasks[taskId].files.filter((_, i) => i !== index);
    updateTask(taskId, { files: updated });
  };

  const totalTasks = WEEKS.reduce((sum, w) => sum + w.tasks.length, 0);
  const checkedCount = Object.values(tasks).filter(t => t.checked).length;

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-[#3B5CFF] flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-black mb-2">과제가 제출되었습니다</h2>
        <p className="text-gray-400 text-sm mb-1">{name}님 | {business || '업종 미입력'}</p>
        <p className="text-[#3B5CFF] font-bold text-sm">완료 항목: {checkedCount} / {totalTasks}</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-8 rounded-full bg-black text-white px-8 py-3 text-sm font-bold hover:bg-gray-800 transition-colors"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-black">과제 업로드</h1>
        <p className="mt-2 text-sm text-gray-400">주차별 과제를 확인하고, 완료한 항목을 체크 후 파일을 업로드해주세요.</p>
      </div>

      {/* 기본 정보 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">이름</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="홍길동"
            className="input-elegant"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">업종</label>
          <input
            type="text"
            value={business}
            onChange={e => setBusiness(e.target.value)}
            placeholder="예: 카페, 네일샵"
            className="input-elegant"
          />
        </div>
      </div>

      {/* 진행률 */}
      <div className="rounded-2xl bg-black p-4 text-white flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/50">진행률</div>
          <div className="mt-1 text-lg font-black">{checkedCount} / {totalTasks} 완료</div>
        </div>
        <div className="w-24 h-24 relative">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#3B5CFF"
              strokeWidth="3"
              strokeDasharray={`${(checkedCount / totalTasks) * 100}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-black">
            {totalTasks > 0 ? Math.round((checkedCount / totalTasks) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Weeks */}
      {WEEKS.map(week => (
        <div key={week.id} className="rounded-2xl border-2 border-gray-100 overflow-hidden">
          {/* Week Header */}
          <div className="bg-black text-white p-6">
            <span className="text-xs font-bold uppercase tracking-[3px] text-[#3B5CFF]">{week.badge}</span>
            <h2 className="text-xl font-black mt-1">{week.title}</h2>
            <p className="text-sm text-white/50 mt-1">{week.date}</p>
          </div>

          {/* Tasks */}
          <div className="divide-y divide-gray-100">
            {week.tasks.map(task => {
              const state = tasks[task.id];
              return (
                <div key={task.id} className="p-5 sm:p-6">
                  {/* Checkbox + Label */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={state.checked}
                      onChange={e => updateTask(task.id, { checked: e.target.checked })}
                      className="w-5 h-5 rounded accent-[#3B5CFF] cursor-pointer"
                    />
                    <span className={`text-base font-bold transition-all ${state.checked ? 'line-through text-gray-300' : 'text-black group-hover:text-[#3B5CFF]'}`}>
                      {task.label}
                    </span>
                    {state.checked && (
                      <span className="inline-flex items-center rounded-full bg-[#3B5CFF] px-2.5 py-0.5 text-[11px] font-bold text-white">
                        완료
                      </span>
                    )}
                  </label>

                  {/* Link Input */}
                  {task.hasLink && (
                    <div className="mt-3 ml-8">
                      <input
                        type="url"
                        value={state.link}
                        onChange={e => updateTask(task.id, { link: e.target.value })}
                        placeholder={task.linkPlaceholder}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 text-sm outline-none focus:border-[#3B5CFF] transition-colors"
                      />
                    </div>
                  )}

                  {/* Note */}
                  {task.hasNote && (
                    <div className="mt-3 ml-8">
                      <textarea
                        value={state.note}
                        onChange={e => updateTask(task.id, { note: e.target.value })}
                        placeholder={task.notePlaceholder}
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 text-sm outline-none focus:border-[#3B5CFF] transition-colors resize-y min-h-[60px]"
                      />
                    </div>
                  )}

                  {/* File Upload */}
                  {task.hasUpload && (
                    <div className="mt-3 ml-8">
                      <label className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 p-4 cursor-pointer hover:border-[#3B5CFF] hover:bg-[#3B5CFF]/5 transition-all">
                        <input
                          type="file"
                          multiple
                          accept={task.accept}
                          onChange={e => handleFileChange(task.id, e.target.files)}
                          className="hidden"
                        />
                        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs text-gray-400">
                          <strong className="text-[#3B5CFF]">{task.uploadLabel}</strong>
                        </span>
                      </label>

                      {/* File Tags */}
                      {state.files.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {state.files.map((file, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-[#3B5CFF]/10 text-[#3B5CFF] px-3 py-1 text-xs font-medium">
                              {file.name}
                              <button
                                onClick={() => removeFile(task.id, i)}
                                className="hover:text-red-500 transition-colors"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Submit */}
      <div className="text-center pt-4 pb-8">
        <button
          onClick={handleSubmit}
          className="btn-primary text-base px-12"
        >
          과제 제출하기
        </button>
      </div>
    </div>
  );
}
