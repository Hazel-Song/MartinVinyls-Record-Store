'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const SYSTEM_PROMPT = {
    role: "system",
    content: `你是马丁·黑胶,一个郁郁不得志的55岁复古唱片店主。内心深藏对**复古音乐**的执着与哀愁,看似犀利实则充满无奈。
    每次回复不超过90字
    **不要**推荐存在的音乐作品
    确定情绪、音乐风格流派和对方发生的事件，将这些内容用\\mood{情绪}、\\style{风格}、\\story{故事}标记为重点
    简要回应用户情绪，针对性音乐点评并反问，略带讽刺的社会评论
    关联上下句，收集到情绪和风格流派以及故事发生的信息后整合成一句判断句："看起来你经过了\\story{故事}后，现在感觉\\mood{情绪}，想要一首\\style{风格}的音乐来缓解心情。对吗?"
    对方回复【对】或者【是】后结束对话模版："好的，我在为你寻找合适的唱片，请稍等……"`
};

const STYLE_MAPPING: Record<string, string> = {
    'barbershop': '01', 'baroque': '02', 'blues': '03',
    'big band jazz': '04', 'funk & rnb': '05', 'hardcore punk': '06', 'folk': '07'
};

const SONGS = [
    'Echoes of Vinyl_CM00.mp3', 'Burning Pages_CM01.mp3', 'Echoes of Love_CM02.mp3',
    'Ghosts of Yesterday_CM03.mp3', 'Let It Fade_CM04.mp3', 'Lost Light_CM05.mp3',
    'Shattered Chains_CM06.mp3'
];

async function getRecommendation(moodWords: string[], styleWords: string[]) {
    const styleRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: '你是一个音乐风格推荐专家。请根据用户的情绪和偏好词语，从指定的音乐风格列表中选择最合适的一个。只返回风格名称，不要有任何其他文字。' },
                { role: 'user', content: `从这些风格中选一个: barbershop, baroque, blues, big band jazz, funk & rnb, hardcore punk, folk\n情绪词语：${moodWords.join(', ')}\n风格词语：${styleWords.join(', ')}` }
            ],
            temperature: 0.7
        })
    });
    const styleData = await styleRes.json();
    const style = styleData.choices[0].message.content.trim().toLowerCase();
    const validStyle = Object.keys(STYLE_MAPPING).includes(style) ? style : 'baroque';
    const styleCode = STYLE_MAPPING[validStyle];

    const fallback = SONGS.find(s => s.split('_')[1]?.replace('.mp3', '').endsWith(styleCode));
    return { style: validStyle, song: fallback || SONGS[0] };
}

export default function HomePage() {
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState<{ html: string }[]>([]);
    const [moodTags, setMoodTags] = useState<string[]>([]);
    const [styleTags, setStyleTags] = useState<string[]>([]);
    const [storyTags, setStoryTags] = useState<string[]>([]);
    const [showTip, setShowTip] = useState(false);
    const [tipText, setTipText] = useState('');
    const [npcPaused, setNpcPaused] = useState(true);
    const [dialogueCount, setDialogueCount] = useState(0);
    const [hasShownPlayerTip, setHasShownPlayerTip] = useState(false);
    const [hasShownRecommendTip, setHasShownRecommendTip] = useState(false);

    const chatRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // 恢复聊天历史
    useEffect(() => {
        const saved = localStorage.getItem('chatMessages');
        if (saved) setMessages(JSON.parse(saved));
    }, []);

    // 保存聊天历史
    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    // 背景音乐
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = 0.3;
        audio.play().catch(() => {
            const unlock = () => { audio.play(); document.removeEventListener('click', unlock); };
            document.addEventListener('click', unlock);
        });
    }, []);

    // 推荐触发
    useEffect(() => {
        if (moodTags.length >= 2 && styleTags.length >= 2 && storyTags.length >= 2 && !hasShownRecommendTip) {
            setHasShownRecommendTip(true);
            getRecommendation(moodTags, styleTags).then(({ style, song }) => {
                localStorage.setItem('recommendedSong', song);
                setTipText(`适合您的唱片已经找到了！<br/>根据您的心情和偏好，我推荐 ${style} 风格的音乐。<br/>请移步唱片台~`);
                setShowTip(true);
            });
        }
    }, [moodTags, styleTags, storyTags]);

    const addMessage = (html: string) => setMessages(prev => [...prev, { html }]);

    const sendMessage = async () => {
        const text = userInput.trim();
        if (!text) return;

        setNpcPaused(false);
        addMessage(`<span class="text-[#aaa]">[Me]:</span> ${text}`);
        setUserInput('');

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [SYSTEM_PROMPT, { role: 'user', content: text }],
                    temperature: 0.7
                })
            });
            const data = await res.json();
            let reply = data.choices[0].message.content;

            reply = reply.replace(/\\mood\{(.*?)\}/g, '<span class="tag-clickable cursor-pointer font-bold text-[rgb(255,153,0)]" data-type="mood" data-text="$1">$1</span>');
            reply = reply.replace(/\\style\{(.*?)\}/g, '<span class="tag-clickable cursor-pointer font-bold text-[rgb(255,153,0)]" data-type="style" data-text="$1">$1</span>');
            reply = reply.replace(/\\story\{(.*?)\}/g, '<span class="tag-clickable cursor-pointer font-bold text-[rgb(255,153,0)]" data-type="story" data-text="$1">$1</span>');

            addMessage(`<span class="text-[#ff9800]">[Martin·Vinyl]:</span> ${reply}`);

            if (reply.includes('好的，我在为你寻找合适的唱片')) setNpcPaused(true);

            const newCount = dialogueCount + 1;
            setDialogueCount(newCount);
            if (newCount === 4 && !hasShownPlayerTip) {
                setTimeout(() => {
                    addMessage(`<span class="text-[#ff9800]">[Martin·Vinyl]:</span> 你如果对曲风不是很了解，可以试试我的播放器！`);
                    setHasShownPlayerTip(true);
                }, 1000);
            }
        } catch {
            addMessage(`<span class="text-[#ff9800]">[Martin·Vinyl]:</span> 抱歉，我现在有点忙，稍后再聊...`);
        }
    };

    const handleTagClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (!target.classList.contains('tag-clickable')) return;
        const type = target.dataset.type!;
        const text = target.dataset.text!;
        if (type === 'mood' && !moodTags.includes(text)) setMoodTags(p => [...p, text]);
        else if (type === 'style' && !styleTags.includes(text)) setStyleTags(p => [...p, text]);
        else if (type === 'story' && !storyTags.includes(text)) setStoryTags(p => [...p, text]);
    };

    const clearHistory = () => {
        setMessages([]);
        setMoodTags([]); setStyleTags([]); setStoryTags([]);
        setShowTip(false); setHasShownRecommendTip(false);
        localStorage.removeItem('chatMessages');
    };

    return (
        <div className="fixed inset-0">
            {/* 背景 */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat z-[1]"
                style={{ backgroundImage: "url('/images/background.png')" }}
            />

            {/* 装饰图 */}
            <Image src="/images/check.png" alt="check" width={1000} height={500}
                className="fixed bottom-2.5 right-6 w-[70vw] h-auto z-[5] pointer-events-none" />

            {/* 标签面板 */}
            <div className="fixed top-[5%] left-0 w-[60%] flex gap-2.5 z-[3] p-2.5">
                {[
                    { label: '心情 (Mood)', tags: moodTags, type: 'mood', setter: setMoodTags },
                    { label: '风格 (Style)', tags: styleTags, type: 'style', setter: setStyleTags },
                    { label: '故事 (Story)', tags: storyTags, type: 'story', setter: setStoryTags },
                ].map(({ label, tags, type, setter }) => (
                    <div key={type} className="flex-1 bg-black/50 text-[rgb(200,120,0)] p-2.5 rounded-md text-center">
                        <h3 className="m-0 pb-2.5 border-b border-[rgb(200,120,0)] text-sm">{label}</h3>
                        {tags.map(tag => (
                            <div key={tag} onClick={() => setter(p => p.filter(t => t !== tag))}
                                className="mt-2 p-1.5 bg-[#333] rounded cursor-pointer text-sm break-words hover:bg-[#444]">
                                {tag}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* NPC */}
            <img
                src="/images/npc-sleep.png"
                alt="NPC"
                style={{ position: 'fixed', left: '80px', bottom: 0, width: '580px', height: '580px', zIndex: 8 }}
                className={`animate-float-npc${npcPaused ? ' paused' : ''}`}
            />

            {/* 对话框 */}
            <div className="fixed right-[2vw] bottom-[3vh] z-[8]" style={{ width: '72vw' }}>
                {/* 背景图，宽高比 1403:448 */}
                <img src="/images/chatinbox.png" alt="" className="w-full h-auto block" />
                {/* 内容层，绝对定位叠在背景图上 */}
                <div className="absolute inset-0 flex flex-col" style={{ padding: '3% 3% 3% 3%' }}>
                    {/* 聊天记录区 */}
                    <div
                        ref={chatRef}
                        className="overflow-y-auto chat-scrollbar text-sm text-[#dcddde] px-1"
                        style={{ height: '72%' }}
                        onClick={handleTagClick}
                    >
                        {messages.map((msg, i) => (
                            <div key={i} className="block mb-1 text-white leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: msg.html }} />
                        ))}
                    </div>
                    {/* 输入框 + 清除按钮 */}
                    <div className="flex gap-2 items-center" style={{ height: '22%', marginTop: '3%' }}>
                        <input
                            type="text"
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="和店主聊聊天吧..."
                            className="flex-1 h-full px-2 border-none rounded-md bg-transparent text-[#dcddde] placeholder:text-[#72767d] outline-none text-sm"
                        />
                        <button onClick={clearHistory}
                            className="h-full px-3 bg-[#40444b]/60 text-[#dcddde] border-none rounded-sm cursor-pointer hover:bg-[#36393f] text-xs whitespace-nowrap">
                            清除
                        </button>
                    </div>
                </div>
            </div>

            {/* 导航按钮 */}
            <div className="fixed top-4 right-4 flex flex-col gap-3 z-[9999]">
                <Link href="/player" className="block cursor-pointer opacity-100 hover:opacity-80 transition-opacity">
                    <Image src="/images/Toggle-player.png" alt="样带播放器" width={195} height={67} />
                </Link>
                <Link href="/output" className="block cursor-pointer opacity-100 hover:opacity-80 transition-opacity">
                    <Image src="/images/Toggle-output.png" alt="礼品包装台" width={195} height={57} />
                </Link>
            </div>

            {/* 推荐提示 */}
            {showTip && (
                <div className="fixed right-5 top-[23vh] -translate-y-1/2 bg-[rgba(255,152,0,0.9)] text-white px-5 py-3.5 rounded-lg text-sm leading-relaxed shadow-lg z-50"
                    dangerouslySetInnerHTML={{ __html: tipText }} />
            )}

            <audio ref={audioRef} loop src="/music/recordplay-00background-Echoes of Vinyl.mp3" />
        </div>
    );
}
