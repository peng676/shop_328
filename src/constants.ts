export type Language = 'zh' | 'en';

export interface Product {
  id: string;
  name: string;
  category: 'AI' | 'Social' | 'Entertainment' | 'Productivity';
  description: {
    zh: string;
    en: string;
  };
  price: number;
  icon: string;
  rating: number;
  popular: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'ChatGPT',
    category: 'AI',
    description: {
      zh: 'OpenAI 开发的智能对话机器人，支持 GPT-4o。',
      en: 'Intelligent chatbot developed by OpenAI, supporting GPT-4o.'
    },
    price: 0,
    icon: 'MessageSquare',
    rating: 4.9,
    popular: true
  },
  {
    id: '2',
    name: 'Gemini',
    category: 'AI',
    description: {
      zh: 'Google 最强大的 AI 模型，集成于各种 Google 服务。',
      en: "Google's most powerful AI model, integrated into various Google services."
    },
    price: 0,
    icon: 'Sparkles',
    rating: 4.8,
    popular: true
  },
  {
    id: '3',
    name: 'Claude',
    category: 'AI',
    description: {
      zh: 'Anthropic 开发的高性能 AI，以长文本处理见长。',
      en: 'High-performance AI developed by Anthropic, known for long-context processing.'
    },
    price: 0,
    icon: 'Brain',
    rating: 4.8,
    popular: true
  },
  {
    id: '4',
    name: 'Grok',
    category: 'AI',
    description: {
      zh: 'xAI 开发的具有幽默感的 AI，实时访问 X 平台数据。',
      en: 'AI with a sense of humor developed by xAI, with real-time access to X platform data.'
    },
    price: 0,
    icon: 'Zap',
    rating: 4.5,
    popular: false
  },
  {
    id: '5',
    name: 'Midjourney',
    category: 'AI',
    description: {
      zh: '顶尖的 AI 绘画工具，生成高质量艺术图像。',
      en: 'Top-tier AI art generation tool, creating high-quality artistic images.'
    },
    price: 0,
    icon: 'Palette',
    rating: 4.9,
    popular: true
  },
  {
    id: '6',
    name: 'Perplexity',
    category: 'AI',
    description: {
      zh: 'AI 驱动的搜索引擎，提供准确的引用和回答。',
      en: 'AI-powered search engine providing accurate citations and answers.'
    },
    price: 0,
    icon: 'Search',
    rating: 4.7,
    popular: false
  },
  {
    id: '7',
    name: 'TikTok(破解版)内含插件',
    category: 'Social',
    description: {
      zh: '全球最受欢迎的短视频社交平台。',
      en: 'The world\'s most popular short-video social platform.'
    },
    price: 9.9,
    icon: 'Video',
    rating: 4.8,
    popular: true
  },
  {
    id: '8',
    name: 'Instagram',
    category: 'Social',
    description: {
      zh: '分享照片和视频的社交媒体巨头。',
      en: 'Social media giant for sharing photos and videos.'
    },
    price: 0,
    icon: 'Instagram',
    rating: 4.7,
    popular: true
  },
  {
    id: '9',
    name: 'WhatsApp',
    category: 'Social',
    description: {
      zh: '全球领先的即时通讯软件，安全加密。',
      en: 'Leading global instant messaging app with secure encryption.'
    },
    price: 0,
    icon: 'MessageCircle',
    rating: 4.6,
    popular: true
  },
  {
    id: '10',
    name: 'Telegram',
    category: 'Social',
    description: {
      zh: '注重隐私和速度的强大通讯工具。',
      en: 'Powerful messaging tool focused on privacy and speed.'
    },
    price: 0,
    icon: 'Send',
    rating: 4.7,
    popular: true
  },
  {
    id: '11',
    name: 'X (Twitter)',
    category: 'Social',
    description: {
      zh: '实时资讯和社交互动的全球平台。',
      en: 'Global platform for real-time news and social interaction.'
    },
    price: 0,
    icon: 'Twitter',
    rating: 4.4,
    popular: false
  },
  {
    id: '12',
    name: 'Discord',
    category: 'Social',
    description: {
      zh: '游戏玩家和社区互动的首选通讯平台。',
      en: 'Preferred communication platform for gamers and community interaction.'
    },
    price: 0,
    icon: 'Hash',
    rating: 4.8,
    popular: false
  },
  {
    id: '13',
    name: 'Netflix',
    category: 'Entertainment',
    description: {
      zh: '全球领先的流媒体服务，拥有海量影视剧。',
      en: 'Leading global streaming service with vast movies and TV shows.'
    },
    price: 0,
    icon: 'Tv',
    rating: 4.9,
    popular: true
  },
  {
    id: '14',
    name: 'Spotify',
    category: 'Entertainment',
    description: {
      zh: '全球最大的正版流媒体音乐服务。',
      en: 'The world\'s largest legal music streaming service.'
    },
    price: 0,
    icon: 'Music',
    rating: 4.8,
    popular: true
  },
  {
    id: '15',
    name: 'YouTube',
    category: 'Entertainment',
    description: {
      zh: '全球最大的视频分享和观看平台。',
      en: 'The world\'s largest video sharing and viewing platform.'
    },
    price: 0,
    icon: 'Youtube',
    rating: 4.9,
    popular: true
  },
  {
    id: '16',
    name: 'Notion',
    category: 'Productivity',
    description: {
      zh: '全能型笔记和协作工具，一站式工作空间。',
      en: 'All-in-one note-taking and collaboration tool, workspace.'
    },
    price: 0,
    icon: 'FileText',
    rating: 4.8,
    popular: false
  },
  {
    id: '17',
    name: 'GitHub',
    category: 'Productivity',
    description: {
      zh: '全球最大的代码托管和协作开发平台。',
      en: 'The world\'s largest code hosting and collaborative development platform.'
    },
    price: 0,
    icon: 'Github',
    rating: 4.9,
    popular: true
  },
  {
    id: '18',
    name: 'Poe',
    category: 'AI',
    description: {
      zh: 'Quora 开发的 AI 聚合平台，一处访问多个模型。',
      en: 'AI aggregator platform by Quora, access multiple models in one place.'
    },
    price: 0,
    icon: 'Layers',
    rating: 4.6,
    popular: false
  },
  {
    id: '19',
    name: 'Jasper',
    category: 'AI',
    description: {
      zh: '专为企业营销设计的 AI 写作助手。',
      en: 'AI writing assistant specifically designed for enterprise marketing.'
    },
    price: 0,
    icon: 'PenTool',
    rating: 4.5,
    popular: false
  },
  {
    id: '20',
    name: 'Facebook',
    category: 'Social',
    description: {
      zh: '连接全球好友和家人的社交网络。',
      en: 'Social network connecting friends and family worldwide.'
    },
    price: 0,
    icon: 'Facebook',
    rating: 4.3,
    popular: false
  },
  {
    id: '21',
    name: 'Grammarly',
    category: 'Productivity',
    description: {
      zh: '全球领先的 AI 写作助手，纠正语法和润色文本。',
      en: 'Leading AI writing assistant for grammar correction and text polishing.'
    },
    price: 0,
    icon: 'Pen',
    rating: 4.9,
    popular: true
  },
  {
    id: '22',
    name: 'DeepL',
    category: 'Productivity',
    description: {
      zh: '公认全世界最准确的 AI 翻译工具。',
      en: 'Recognized as the world\'s most accurate AI translation tool.'
    },
    price: 0,
    icon: 'Languages',
    rating: 4.9,
    popular: true
  },
  {
    id: '23',
    name: 'Microsoft 365',
    category: 'Productivity',
    description: {
      zh: '包含 Word, Excel, PowerPoint 的全套办公软件。',
      en: 'Full office suite including Word, Excel, and PowerPoint.'
    },
    price: 0,
    icon: 'Layout',
    rating: 4.8,
    popular: true
  },
  {
    id: '24',
    name: 'Google Workspace',
    category: 'Productivity',
    description: {
      zh: 'Google 提供的企业级协作和办公工具集。',
      en: 'Enterprise-grade collaboration and productivity tools by Google.'
    },
    price: 0,
    icon: 'Grid',
    rating: 4.7,
    popular: true
  },
  {
    id: '25',
    name: 'Slack',
    category: 'Productivity',
    description: {
      zh: '领先的企业级团队通讯和协作平台。',
      en: 'Leading enterprise team communication and collaboration platform.'
    },
    price: 0,
    icon: 'MessageSquare',
    rating: 4.7,
    popular: false
  },
  {
    id: '26',
    name: 'Zoom',
    category: 'Productivity',
    description: {
      zh: '高清稳定的全球视频会议和远程协作工具。',
      en: 'High-definition stable global video conferencing and remote collaboration tool.'
    },
    price: 0,
    icon: 'Video',
    rating: 4.6,
    popular: false
  },
  {
    id: '27',
    name: 'Quillbot',
    category: 'Productivity',
    description: {
      zh: '强大的 AI 改写和降重工具，提升写作效率。',
      en: 'Powerful AI paraphrasing and rewriting tool to boost writing efficiency.'
    },
    price: 0,
    icon: 'Feather',
    rating: 4.8,
    popular: true
  }
];

export const translations = {
  zh: {
    title: '全球应用商店',
    subtitle: '一站式获取顶尖 AI 与国际社交软件',
    searchPlaceholder: '搜索应用...',
    categories: {
      All: '全部',
      AI: '人工智能',
      Social: '社交媒体',
      Entertainment: '影音娱乐',
      Productivity: '办公协作'
    },
    buyNow: '立即购买',
    free: '免费',
    popular: '热门',
    cart: '购物车',
    footer: '© 2026 全球应用商店. 版权所有.',
    contact: '联系我们',
    about: '关于我们',
    heroTitle: '连接世界，触手可及',
    heroDesc: '为您提供最稳定、最快捷的国际主流软件访问方案。'
  },
  en: {
    title: 'Global App Store',
    subtitle: 'One-stop access to top AI and international social apps',
    searchPlaceholder: 'Search apps...',
    categories: {
      All: 'All',
      AI: 'AI',
      Social: 'Social',
      Entertainment: 'Entertainment',
      Productivity: 'Productivity'
    },
    buyNow: 'Buy Now',
    free: 'Free',
    popular: 'Popular',
    cart: 'Cart',
    footer: '© 2026 Global App Store. All rights reserved.',
    contact: 'Contact Us',
    about: 'About Us',
    heroTitle: 'Connect the World, Within Reach',
    heroDesc: 'Providing you with the most stable and fastest access to international mainstream software.'
  }
};
