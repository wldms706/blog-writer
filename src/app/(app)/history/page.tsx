'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllHistory, deleteHistory, updateBlogUrl, type HistoryItem } from '@/lib/storage';
import { BUSINESS_CATEGORIES } from '@/data/constants';
import { createClient } from '@/lib/supabase/client';

const countCharsWithoutSpaces = (text: string) => text.replace(/\s/g, '').length;

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blogUrlInput, setBlogUrlInput] = useState('');
  const [blogUrlSubmitting, setBlogUrlSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const history = await getAllHistory(user.id);
        setItems(history);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteHistory(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBlogUrlSubmit = async (id: string) => {
    if (!blogUrlInput.trim()) return;
    setBlogUrlSubmitting(true);
    const success = await updateBlogUrl(id, blogUrlInput.trim());
    setBlogUrlSubmitting(false);
    if (success) {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, blogUrl: blogUrlInput.trim(), blogUrlSubmittedAt: new Date().toISOString(), naverRank: null, rankCheckedAt: null } : item));
      setBlogUrlInput('');
    }
  };

  const selected = items.find((i) => i.id === selectedId);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
        <p className="mt-3 text-sm text-slate-500">불러오는 중...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-900">아직 생성된 글이 없습니다</p>
        <p className="mt-1 text-xs text-slate-500">글을 생성하면 자동으로 저장됩니다</p>
        <Link
          href="/write"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          글 작성하기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">히스토리</h2>
        <span className="text-xs text-slate-500">{items.length}개의 글</span>
      </div>

      {!selected ? (
        <div className="space-y-3">
          {items.map((item) => {
            const biz = BUSINESS_CATEGORIES.find((b) => b.id === item.businessCategory);
            const date = new Date(item.createdAt);
            const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

            return (
              <div
                key={item.id}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm"
                onClick={() => setSelectedId(item.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {item.keyword}
                      </span>
                      {biz && (
                        <span className="text-xs text-slate-500">
                          {biz.icon} {biz.name}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {item.content.slice(0, 100)}...
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{dateStr}</span>
                      <span>{countCharsWithoutSpaces(item.content).toLocaleString()}자</span>
                      {item.blogUrl ? (
                        item.naverRank !== null ? (
                          item.naverRank > 0 ? (
                            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">
                              네이버 {item.naverRank}위
                            </span>
                          ) : (
                            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                              100위 밖
                            </span>
                          )
                        ) : (
                          <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-medium text-yellow-600">
                            순위 확인 중
                          </span>
                        )
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">링크 미제출</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="ml-3 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedId(null)}
            className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </button>

          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {selected.keyword}
              </span>
              <span className="text-xs text-slate-400">
                {countCharsWithoutSpaces(selected.content).toLocaleString()}자
              </span>
            </div>
            <button
              onClick={() => handleCopy(selected.content)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {copied ? '복사됨' : '복사하기'}
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {selected.content}
            </div>
          </div>

          {/* 블로그 링크 */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            {selected.blogUrl ? (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-slate-500">블로그 링크:</span>
                <a href={selected.blogUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 truncate hover:underline">
                  {selected.blogUrl}
                </a>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500 mb-2">블로그에 올렸나요? 링크를 남겨주세요</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={blogUrlInput}
                    onChange={(e) => setBlogUrlInput(e.target.value)}
                    placeholder="https://blog.naver.com/..."
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleBlogUrlSubmit(selected.id)}
                    disabled={!blogUrlInput.trim() || blogUrlSubmitting}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {blogUrlSubmitting ? '제출 중...' : '제출'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* 네이버 검색 순위 */}
          {selected.blogUrl && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-xs font-medium text-slate-700">네이버 검색 순위</span>
              </div>

              {selected.naverRank !== null ? (
                <div>
                  {selected.naverRank > 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-600">{selected.naverRank}위</span>
                      <span className="text-xs text-slate-500">
                        &quot;{selected.keyword}&quot; 검색 결과
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm font-medium text-orange-600">100위 내에 없습니다</span>
                      <p className="mt-1 text-xs text-slate-400">
                        블로그 지수와 글 품질에 따라 순위가 변동될 수 있습니다
                      </p>
                    </div>
                  )}
                  {selected.rankCheckedAt && (
                    <p className="mt-2 text-[11px] text-slate-400">
                      확인: {new Date(selected.rankCheckedAt).toLocaleString('ko-KR')}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-yellow-400" />
                    <span className="text-sm text-slate-600">순위 확인 대기 중</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    블로그 링크 제출 후 약 7시간 뒤에 자동으로 확인됩니다
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
