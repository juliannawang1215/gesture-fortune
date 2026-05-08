const CATEGORIES = {
  health: ['健康', '平安', '病', '康复', '身体', '寿', '疾', '痛', '瘦', '减肥', 'health', 'safe', 'sick', 'body', 'recover'],
  love: ['爱', '感情', '结婚', '姻缘', '男友', '女友', '单身', '桃花', '对象', '另一半', 'love', 'marry', 'boyfriend', 'girlfriend', 'crush'],
  career: ['工作', '事业', '职场', '涨薪', '升职', '发财', '钱', '财', '面试', 'offer', '老板', '业务', '考', '成绩', '上岸', 'career', 'job', 'money', 'rich', 'wealth', 'exam'],
};

const ABSTRACT_PHRASES = {
  health: ['岁岁平安', '百病不侵', '生机盎然', '安康长寿', '松鹤延年', '无疾无忧', '福寿康宁', '身泰心宁'],
  love: ['佳期如梦', '花好月圆', '良缘天定', '情投意合', '白首成约', '天赐良缘', '比翼双飞', '如胶似漆'],
  career: ['步步高升', '前程似锦', '财源广进', '金榜题名', '事业有成', '青云直上', '万事亨通', '功成名就'],
  other: ['心想事成', '万事胜意', '吉星高照', '如愿以偿', '福星高照', '所求皆如愿', '顺遂无虞', '平安喜乐']
};

export function processWish(text: string): { category: 'health' | 'love' | 'career' | 'other', phrase: string } {
  let matchedCategory: 'health' | 'love' | 'career' | 'other' = 'other';
  
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(kw => text.toLowerCase().includes(kw))) {
      matchedCategory = cat as any;
      break;
    }
  }

  // Extract a couple of characters to mix into the phrase for a "personalized" touch,
  // or just use a random poetic phrase.
  const possiblePhrases = ABSTRACT_PHRASES[matchedCategory];
  const phrase = possiblePhrases[Math.floor(Math.random() * possiblePhrases.length)];

  // For a personalized touch, we could take the first valid Chinese character or letter 
  // from their input and prepend it like "[X]·phrase"
  const cleanChars = text.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '');
  let finalPhrase = phrase;
  if (cleanChars.length > 0) {
    const randomChar = cleanChars[Math.floor(Math.random() * cleanChars.length)];
    finalPhrase = `${randomChar}·${phrase}`;
  }

  return { category: matchedCategory, phrase: finalPhrase };
}
