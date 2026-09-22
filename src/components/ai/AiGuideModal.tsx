import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Globe, ArrowRight } from 'lucide-react';
import type { SupportedLanguage, ChatMessage } from '../../types/ai';
import { AiGuideService } from '../../services/aiGuideService';
import type { WasteCategory } from '../../types/bin';

interface AiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (category: WasteCategory | 'all') => void;
  initialQuery?: string;
}

const FAQ_CHIPS = [
  { label: '남은 음료가 든 컵은 어떻게 버리나요?', query: '남은 음료가 든 컵은 어떻게 버리나요?' },
  { label: '서촌 주변에서 쓰레기를 어디에 내놓아야 하나요?', query: '서촌 주변에서 쓰레기를 어디에 내놓아야 하나요?' },
  { label: '서촌 수거 시간대가 언제인가요?', query: '서촌 수거 시간대가 언제인가요?' },
  { label: '주말 쓰레기 배출 과태료', query: '주말에 쓰레기를 배출하면 과태료가 나오나요?' },
];

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export const AiGuideModal: React.FC<AiGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  initialQuery,
}) => {
  const [lang, setLang] = useState<SupportedLanguage>('ko');
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: '안녕하세요! 안국·서촌 스마트 쓰레기 배출 도우미 AI입니다. 🥤 남은 음료 컵 분리수거, 탕후루 꼬치, 거주자 요일별 배출 시간 등 무엇이든 물어보세요!',
      timestamp: '방금 전',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialHandledRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (initialQuery && initialHandledRef.current !== initialQuery) {
        initialHandledRef.current = initialQuery;
        handleSendMessage(initialQuery);
      }
    } else {
      initialHandledRef.current = null;
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const response = await AiGuideService.askAiGuide(trimmed, lang);

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: response.recommendedCategory
          ? [
              {
                label: `지도에서 ${response.recommendedCategory === 'disposable' ? '일회용 컵/퇴수함' : '해당 휴지통'} 찾기`,
                actionType: 'find_bin',
                payload: response.recommendedCategory,
              },
            ]
          : undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: '죄송합니다. 답변을 생성하는 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
          timestamp: '방금 전',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCategoryAction = (payload?: string) => {
    if (payload && onSelectCategory) {
      const cat = payload as WasteCategory;
      onSelectCategory(cat);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-[28px] sm:rounded-3xl w-full max-w-lg shadow-2xl flex flex-col h-[82vh] sm:h-[600px] max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drawer Handle Indicator */}
        <div className="sm:hidden w-full flex justify-center pt-2.5 pb-1 bg-slate-950/80">
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                다국어 배출 안내 AI 가이드
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  종로구 실시간 규정
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">안국·삼청·북촌·서촌 지역 맞춤형</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs text-slate-200 px-1 py-1 focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FAQ Suggestion Chips */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/60 overflow-x-auto flex items-center space-x-2 scrollbar-none">
          <span className="text-[11px] text-indigo-400 font-medium flex-shrink-0 flex items-center">
            자주 묻는 질문:
          </span>
          {FAQ_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.query)}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-700/60 hover:border-indigo-500/40 whitespace-nowrap transition-all flex items-center gap-1 shadow-sm"
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-900/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-600/20'
                      : 'bg-slate-800/90 text-slate-200 rounded-tl-none border border-slate-700/70 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Action Button inside AI Message */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleCategoryAction(action.payload)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
                        >
                          <span>{action.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1 ${
                      isUser ? 'text-brand-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-brand-700/50 border border-brand-500/40 flex items-center justify-center text-brand-200 flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
              <div className="w-6 h-6 rounded-lg bg-indigo-600/30 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              </div>
              <span>AI가 종로구 배출 규정을 확인하고 있습니다...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputQuery);
          }}
          className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="궁금한 배출 품목을 입력하세요 (예: 커피 컵, 탕후루)..."
            className="flex-1 bg-slate-800/90 text-slate-200 placeholder-slate-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white transition-all shadow-md shadow-brand-600/20 flex-shrink-0"
            aria-label="전송"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
