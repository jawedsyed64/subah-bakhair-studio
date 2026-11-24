// Message moods, offline library and AI generation
import { api } from './store.js';

export const MOODS = [
  { id: 'inspirational', en: 'Inspirational', ur: 'حوصلہ افزا', icon: '🌅' },
  { id: 'romantic', en: 'Romantic', ur: 'محبت بھرے', icon: '🌹' },
  { id: 'funny', en: 'Funny', ur: 'مزاحیہ', icon: '😄' },
  { id: 'spiritual', en: 'Spiritual', ur: 'اسلامی و روحانی', icon: '🕌' },
  { id: 'friendship', en: 'Friendship', ur: 'دوستی', icon: '🤝' },
  { id: 'family', en: 'Family', ur: 'خاندان', icon: '🏡' },
  { id: 'motivational', en: 'Motivational', ur: 'مثبت سوچ اور کامیابی', icon: '🚀' },
  { id: 'poetry', en: 'Poetry', ur: 'اردو شاعری', icon: '🪶' },
  { id: 'gratitude', en: 'Gratitude', ur: 'شکرگزاری', icon: '🤲' },
  { id: 'peace', en: 'Peace & Happiness', ur: 'سکون اور خوشی', icon: '🕊️' }
];

export const LENGTHS = [
  { id: 'short', en: 'Short', ur: 'مختصر', hint: 'one or two lines' },
  { id: 'medium', en: 'Medium', ur: 'درمیانہ', hint: 'three to four lines' },
  { id: 'long', en: 'Long', ur: 'طویل', hint: 'a more expressive greeting of five to seven lines' }
];

export const RECIPIENTS = [
  { id: 'everyone', en: 'Everyone', ur: 'سب کے لیے' },
  { id: 'family', en: 'Family', ur: 'گھر والے' },
  { id: 'parents', en: 'Parents', ur: 'والدین' },
  { id: 'spouse', en: 'Spouse / Loved one', ur: 'شریکِ حیات' },
  { id: 'friend', en: 'Friend', ur: 'دوست' },
  { id: 'children', en: 'Children', ur: 'بچے' },
  { id: 'colleagues', en: 'Colleagues', ur: 'ساتھی' }
];

// Hand-written offline library (used when no Claude API key is set or there is no internet)
export const OFFLINE = {
  inspirational: [
    'صبح بخیر!\nہر نئی صبح ایک نیا موقع لے کر آتی ہے۔\nکل کی فکر چھوڑیے اور آج کو بہترین بنائیے۔',
    'صبح بخیر!\nسورج کی پہلی کرن کی طرح آپ کا دن بھی روشن ہو،\nاور ہر قدم پر کامیابی آپ کا ساتھ دے۔',
    'صبح بخیر!\nحوصلہ رکھیے، اندھیری رات کے بعد ہی اُجالا ہوتا ہے۔'
  ],
  romantic: [
    'صبح بخیر میری جان!\nآنکھ کھلتے ہی سب سے پہلا خیال آپ کا آیا،\nاور دن خود بخود خوبصورت ہو گیا۔',
    'صبح بخیر!\nیہ صبح کی ٹھنڈی ہوا آپ کو میرا سلام پہنچائے،\nاور آپ کے چہرے پر مسکراہٹ لے آئے۔',
    'صبح بخیر!\nپھولوں سے زیادہ مہکتی رہے آپ کی ہر صبح۔'
  ],
  funny: [
    'صبح بخیر!\nاُٹھ جائیے جناب، چائے ٹھنڈی ہو رہی ہے\nاور الارم بھی آپ سے ناراض ہو چکا ہے! 😄',
    'صبح بخیر!\nبس پانچ منٹ اور… یہ کہتے کہتے کہیں دوپہر نہ ہو جائے! ☕',
    'صبح بخیر!\nآج کا مشورہ: مسکرائیے، کیونکہ تکیہ آپ کے ساتھ دفتر نہیں جائے گا۔ 😉'
  ],
  spiritual: [
    'صبح بخیر!\nالحمدللہ، اللہ نے ہمیں ایک اور خوبصورت صبح عطا فرمائی۔\nاللہ آپ کا دن خیر و برکت سے بھر دے۔ آمین',
    'السلام علیکم، صبح بخیر!\nاللہ تعالیٰ آپ کے رزق میں برکت، دل میں سکون\nاور گھر میں خوشیاں عطا فرمائے۔',
    'صبح بخیر!\nدن کا آغاز بسم اللہ سے کیجیے،\nان شاء اللہ ہر کام آسان ہو جائے گا۔'
  ],
  friendship: [
    'صبح بخیر دوست!\nسچے دوست صبح کی دھوپ کی طرح ہوتے ہیں،\nجو زندگی کو گرمی اور روشنی دیتے ہیں۔',
    'صبح بخیر!\nآپ جیسا دوست ملنا اللہ کا خاص تحفہ ہے۔\nآپ کا دن خوشیوں سے بھرا رہے۔',
    'صبح بخیر یار!\nدوستی کی یہ مہک ہمیشہ یوں ہی تازہ رہے۔'
  ],
  family: [
    'صبح بخیر میرے پیارو!\nآپ سب کی مسکراہٹ ہی میرے گھر کی رونق ہے۔\nاللہ ہمارے گھر کو ہمیشہ آباد رکھے۔',
    'صبح بخیر!\nامی ابو کی دعاؤں کے سائے میں\nآپ کا ہر دن روشن اور مبارک ہو۔',
    'صبح بخیر!\nخاندان کا ساتھ ہو تو ہر صبح عید جیسی لگتی ہے۔'
  ],
  motivational: [
    'صبح بخیر!\nکامیابی اُنہی کے قدم چومتی ہے جو ہمت نہیں ہارتے۔\nآج ایک قدم اور آگے بڑھیے۔',
    'صبح بخیر!\nمثبت سوچ سے دن کا آغاز کیجیے،\nآپ کی محنت ضرور رنگ لائے گی۔',
    'صبح بخیر!\nچھوٹی چھوٹی کوششیں ہی بڑی منزلوں تک پہنچاتی ہیں۔'
  ],
  poetry: [
    'صبح بخیر\nکرنوں نے آ کے کھڑکی پہ دستک جو دی،\nپھولوں نے مسکرا کے کہا: صبح ہو گئی',
    'صبح بخیر\nشبنم کے موتی، پھولوں کی خوشبو،\nسب کچھ ہے آج آپ کے نام',
    'صبح بخیر\nروشن ہو آپ کی ہر صبح سورج کی طرح،\nمہکے آپ کا ہر دن گلاب کی طرح'
  ],
  gratitude: [
    'صبح بخیر!\nشکر ہے اُس رب کا جس نے ایک نیا دن،\nنئی سانسیں اور نئی اُمیدیں عطا کیں۔',
    'صبح بخیر!\nآج کا دن شکر سے شروع کیجیے،\nشکر کرنے والوں کی خوشیاں کبھی کم نہیں ہوتیں۔',
    'صبح بخیر!\nآپ میری زندگی میں ہیں، اس نعمت پر دل سے شکر گزار ہوں۔'
  ],
  peace: [
    'صبح بخیر!\nدل میں سکون، لبوں پر مسکراہٹ\nاور آنکھوں میں اُمید لیے نئے دن کا استقبال کیجیے۔',
    'صبح بخیر!\nخدا کرے آج کا دن آپ کے لیے\nسکون، خوشی اور اطمینان کا پیغام لائے۔',
    'صبح بخیر!\nپرندوں کی چہچہاہٹ کی طرح خوشیاں بکھیرتا رہے آپ کا دن۔'
  ]
};

const SYSTEM = `You are an expert Urdu writer who composes beautiful Good Morning (صبح بخیر) greeting messages for greeting pictures.
Rules:
- Write in proper Urdu script only (never Roman Urdu), natural, fluent and grammatically correct.
- Write exactly ONE message. Output only the message text itself: no title, no quotation marks, no explanation, no English, no numbering, no alternatives.
- Include the words "صبح بخیر" prominently, normally on the first line.
- Put each line on its own line, so the message lays out well on a picture. Keep lines short (about 4–9 words).
- The message must be warm, elegant, respectful and suitable for sharing with family and friends.
- For poetry, write your own original verses; do not quote existing poets.
- For Islamic/spiritual messages, use simple well-known phrases and prayers (e.g. الحمدللہ، ان شاء اللہ، آمین). Never quote or attribute a Quran verse or hadith.
- An emoji or two is fine for funny or friendly messages; otherwise avoid emojis.`;

export function buildPrompt({ mood, length, recipient, instruction, avoid }) {
  const m = MOODS.find(x => x.id === mood) || MOODS[0];
  const l = LENGTHS.find(x => x.id === length) || LENGTHS[1];
  const r = RECIPIENTS.find(x => x.id === recipient) || RECIPIENTS[0];
  let p = `Write one ${m.en} (${m.ur}) Good Morning message in Urdu.\nRecipient: ${r.en} (${r.ur}).\nLength: ${l.en} – ${l.hint}.`;
  if (instruction && instruction.trim()) p += `\nExtra instruction from the user: ${instruction.trim()}`;
  if (avoid && avoid.length) p += `\nDo not repeat or closely imitate these recent messages:\n- ${avoid.slice(0, 8).map(s => s.replace(/\n/g, ' / ')).join('\n- ')}`;
  p += `\nRandom seed for variety: ${Math.floor(Math.random() * 100000)}`;
  return p;
}

function cleanOutput(text) {
  return text
    .replace(/^["'“”«»]+|["'“”«»]+$/g, '')
    .split('\n').map(s => s.trim()).filter((s, i, a) => s || (i > 0 && a[i - 1])).join('\n')
    .trim();
}

function offlinePick(mood, length, avoid) {
  let list = OFFLINE[mood] || OFFLINE.inspirational;
  const lineCount = s => s.split('\n').length;
  let filtered = list.filter(s => length === 'short' ? lineCount(s) <= 2 : length === 'long' ? lineCount(s) >= 3 : true);
  if (!filtered.length) filtered = list;
  const fresh = filtered.filter(s => !(avoid || []).includes(s));
  const pool = fresh.length ? fresh : filtered;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Generate ONE message. Uses Claude when a key is configured; otherwise the offline library.
 * Returns { text, source: 'claude' | 'offline', note? }
 */
export async function generateMessage(opts, settings) {
  const avoid = opts.avoid || [];
  if (api.isElectron) {
    const status = await api.secretsStatus();
    if (status.claude) {
      const res = await api.aiMessage({ system: SYSTEM, prompt: buildPrompt(opts), model: settings.claudeModel });
      if (res.ok && res.text) return { text: cleanOutput(res.text), source: 'claude' };
      return { text: offlinePick(opts.mood, opts.length, avoid), source: 'offline', note: 'Claude request failed: ' + (res.error || 'unknown error') + ' – showing a message from the offline library instead.' };
    }
  }
  return { text: offlinePick(opts.mood, opts.length, avoid), source: 'offline', note: 'Offline library message. Add your Claude API key in Settings for fresh AI-written messages.' };
}

/** Split a message into a title ("صبح بخیر…") and body, for automatic placement */
export function splitTitle(text) {
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  if (lines.length > 1 && lines[0].includes('صبح بخیر') && lines[0].length <= 32) {
    return { title: lines[0], body: lines.slice(1).join('\n') };
  }
  return { title: 'صبح بخیر', body: text.replace(/^صبح بخیر[!،۔\s]*/, '').trim() || text };
}
