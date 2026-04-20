'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function OutputPage() {
    const [currentTime, setCurrentTime] = useState('');
    const audioRef = useRef<HTMLAudioElement>(null);

    // 实时时间
    useEffect(() => {
        const update = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleString('zh-CN', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }).replace(/\//g, '-'));
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, []);

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

    return (
        <div className="fixed inset-0 overflow-hidden">
            {/* 背景 */}
            <div className="fixed w-full h-screen bg-cover bg-center z-[1]"
                style={{ backgroundImage: "url('/images/background-items.png')" }} />

            {/* Canvas 波浪占位（output 页无播放器，仅装饰） */}

            {/* 浮动封面 */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] text-center z-[3] animate-float-image">
                <Image src="/images/sample_hardcore1.png" alt="样品图片" width={600} height={600}
                    className="w-[60%] h-auto mx-auto" />
            </div>

            {/* 底部文字 */}
            <div className="fixed bottom-[50px] left-1/2 -translate-x-1/2 text-left text-white z-[10]">
                <h1 className="text-[2.5em] m-0">Silent Whisper of the Pines_BM07</h1>
                <h2 className="text-[1.67em] my-1.5">Martin Vinyl's Record Store</h2>
                <h2 className="text-[1.67em] my-1.5">Creatived_By_Suno&amp;ComfyUI</h2>
            </div>

            {/* 左下角信息 */}
            <div className="fixed bottom-5 left-5 text-white z-[10] text-[0.8em]">
                <p className="my-1.5">Style_</p>
                <p className="my-1.5">{currentTime}</p>
            </div>

            {/* 导航按钮 */}
            <div className="fixed top-5 right-0 flex flex-col gap-2.5 z-[9999] scale-[0.4] origin-top-right">
                <Link href="/" className="block cursor-pointer opacity-100 hover:opacity-80 transition-opacity">
                    <Image src="/images/Toggle-chat.png" alt="返回主页" width={300} height={150} />
                </Link>
                <Link href="/player" className="block cursor-pointer opacity-100 hover:opacity-80 transition-opacity">
                    <Image src="/images/Toggle-player.png" alt="样带播放器" width={300} height={150} />
                </Link>
            </div>

            <audio ref={audioRef} loop src="/music/recordplay-00background-Echoes of Vinyl.mp3" />
        </div>
    );
}
