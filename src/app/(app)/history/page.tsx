'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllHistory, deleteHistory, type HistoryItem } from '@/lib/storage';
import { BUSINESS_CATEGORIES } from '@/data/constants';

const countCharsWithoutSpaces = (text: string) => text.replace(/\s/g, '').length;

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setItems(getAllHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteHistory(id);
    setItems(getAllHistory());
    if (selectedId === id) setSelectedId(null);
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selected = items.find((i) => i.id === selectedId);

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
          href="/"
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
        </div>
      )}
    </div>
  );
}
