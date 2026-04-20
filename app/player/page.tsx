'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const TRACKS = [
    { id: '00-Background_Music', image: '/images/recordplay-00Background.png', audio: '/music/recordplay-00background-Echoes of Vinyl.mp3' },
    { id: '01-Barbershop', image: '/images/recordplay-01Barbershop.png', audio: '/music/recordplay-01Burning Pages-Barbershop2.mp3' },
    { id: '02-Baroque', image: '/images/recordplay-02Baroque.png', audio: '/music/recordplay-02Echoes of Love-Baroque&violin.mp3' },
    { id: '03-Blues', image: '/images/recordplay-03Blues.png', audio: '/music/recordplay-03Ghosts of Yesterday-Blues.mp3' },
    { id: '04-Big_Band_Jazz', image: '/images/recordplay-04BigBandJazz.png', audio: '/music/recordplay-04Let It Fade-BigBandJazz.mp3' },
    { id: '05-Funk&RnB', image: '/images/recordplay-05FunkRnB.png', audio: '/music/recordplay-05Lost Light-Funk+R&B.mp3' },
    { id: '06-Hardcore_Punk', image: '/images/recordplay-06HardcorePunk.png', audio: '/music/recordplay-06Shattered Chains-hardcore punk.mp3' },
];

export default function PlayerPage() {
    const [currentTrack, setCurrentTrack] = useState('00-Background_Music');
    const [isPlaying, setIsPlaying] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const wavesRef = useRef<any[]>([]);
    const animationSpeedRef = useRef(1);

    useEffect(() => {
        const saved = localStorage.getItem('currentTrack');
        if (saved) setCurrentTrack(saved);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d')!;
        canvas.width = Math.floor(window.innerWidth * 0.75);
        canvas.height = 600;

        // 初始化 3 个波浪
        wavesRef.current = Array.from({ length: 3 }, (_, i) => ({
            frequency: 0.02 + i * 0.01,
            amplitude: 20 + i * 10,
            offset: 0,
            speed: 0.05 + i * 0.02,
            color: `rgba(255, 152, 0, ${0.9 - i * 0.1})`,
            baseAmplitude: 20 + i * 10,
        }));

        const drawWave = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            wavesRef.current.forEach(wave => {
                ctx.beginPath();
                ctx.moveTo(0, canvas.height / 2);

                if (isPlaying) {
                    wave.amplitude += (Math.random() - 0.5) * 4;
                    wave.amplitude = Math.max(20, Math.min(wave.amplitude, 60));
                } else {
                    wave.amplitude = Math.max(1, Math.min(wave.amplitude, 3));
                }

                for (let x = 0; x < canvas.width; x++) {
                    const y = Math.sin(x * wave.frequency + wave.offset) * wave.amplitude;
                    ctx.lineTo(x, canvas.height / 2 + y);
                }

                ctx.strokeStyle = wave.color;
                ctx.lineWidth = 2;
                ctx.stroke();

                wave.offset += wave.speed * animationSpeedRef.current;
            });

            requestAnimationFrame(drawWave);
        };

        drawWave();
    }, [isPlaying]);

    const playTrack = (trackId: string) => {
        const track = TRACKS.find(t => t.id === trackId);
        if (!track || !audioRef.current) return;

        setCurrentTrack(trackId);
        localStorage.setItem('currentTrack', trackId);

        audioRef.current.src = track.audio;
        audioRef.current.play();
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onPlay = () => {
            setIsPlaying(true);
            animationSpeedRef.current = 3;
            wavesRef.current.forEach(w => { w.baseAmplitude = w.amplitude; });
        };

        const onPause = () => {
            setIsPlaying(false);
            animationSpeedRef.current = 0.1;
            wavesRef.current.forEach(w => { w.amplitude = w.baseAmplitude * 0.02; });
        };

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
        };
    }, []);

    useEffect(() => {
        playTrack(currentTrack);
    }, []);

    const track = TRACKS.find(t => t.id === currentTrack);

    return (
        <div className="fixed inset-0 overflow-hidden">
            {/* 背景 */}
            <div className="fixed w-full h-screen bg-cover bg-center z-[1]"
                style={{ backgroundImage: "url('/images/background-blur.png')" }} />

            {/* Canvas 波浪 */}
            <canvas ref={canvasRef} className="fixed right-0 top-1/2 -translate-y-1/2 opacity-60 z-[2] w-[75vw] h-[400px]" />

            {/* 播放器容器 */}
            <div className="fixed w-full h-screen flex items-center z-[2]">
                {/* 左侧曲目列表 */}
                <div className="w-[25vw] h-screen bg-cover bg-no-repeat relative opacity-80"
                    style={{ backgroundImage: "url('/images/blacklayer.png')" }}>
                    <div className="absolute top-1/2 -translate-y-1/2 w-full px-5 box-border">
                        {TRACKS.map(t => (
                            <div
                                key={t.id}
                                onClick={() => playTrack(t.id)}
                                className={`flex items-center justify-end p-2.5 my-2.5 cursor-pointer text-white text-[1.2em] group ${currentTrack === t.id ? 'text-[#ff9800]' : ''}`}
                            >
                                <span className={`mr-2.5 whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-300 ${currentTrack === t.id ? 'text-[#ff9800]' : 'group-hover:text-[#ff9800]'}`}>
                                    {t.id}
                                </span>
                                <Image src="/images/playbutton.png" alt="播放" width={20} height={20}
                                    className="hidden group-hover:block h-[1em] w-auto" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 右侧唱片机 */}
                <div className="flex-1 flex justify-center items-center relative">
                    <Image src="/images/recordplayer-basic.png" alt="唱片机" width={800} height={600}
                        className="w-[60%] h-auto" />
                    {track && (
                        <Image src={track.image} alt="播放效果" width={800} height={600}
                            className="absolute top-0 left-[19.4%] w-[60%] h-auto scale-[0.96]" />
                    )}
                    <audio ref={audioRef} />
                </div>
            </div>

            {/* 导航按钮 */}
            <div className="fixed top-5 right-0 flex flex-col gap-2.5 z-[9999] scale-[0.4] origin-top-right">
                <Link href="/" className="block cursor-pointer opacity-100 hover:opacity-80 transition-opacity">
                    <Image src="/images/Toggle-chat.png" alt="返回主页" width={300} height={150} />
                </Link>
            </div>
        </div>
    );
}
