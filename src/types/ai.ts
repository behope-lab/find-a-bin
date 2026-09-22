export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: 'find_bin' | 'view_resident_rule' | 'change_category';
    payload?: string;
  }[];
}

export interface WasteDisposalKnowledge {
  keywords: string[];
  category: string;
  howToDispose: {
    ko: string;
    en: string;
    ja: string;
    zh: string;
  };
  tips: {
    ko: string;
    en: string;
    ja: string;
    zh: string;
  };
}
