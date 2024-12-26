/*
 * @Author: yaoxiwen 1056360852@qq.com
 * @Date: 2024-12-27 01:35:56
 * @LastEditors: yaoxiwen 1056360852@qq.com
 * @LastEditTime: 2024-12-27 07:18:21
 * @FilePath: \MartinVinyls-Record-Store-main\audio.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
document.addEventListener('DOMContentLoaded', () => {
    const backgroundAudio = document.getElementById('backgroundAudio');
    console.log('Audio element:', backgroundAudio);

    // 修改文件路径，确保使用正确的路径分隔符和空格处理
    if (window.location.pathname.includes('output.html')) {
        // 使用 URL 编码处理文件名中的空格
        const audioPath = 'final songs/Silent Whisper of the Pines_BM07.mp3'.replace(/ /g, '%20');
        backgroundAudio.src = audioPath;
        console.log('Audio path:', audioPath);
        
        // 添加多个音频源以提高兼容性
        backgroundAudio.innerHTML = `
            <source src="${audioPath}" type="audio/mpeg">
            <source src="${audioPath}" type="audio/mp3">
        `;
    } else {
        backgroundAudio.src = 'music/recordplay-00background-Echoes of Vinyl.mp3';
    }
    
    backgroundAudio.volume = 0.3;
    
    // 改进错误处理
    backgroundAudio.onerror = (e) => {
        console.error('Audio error:', {
            error: e,
            src: backgroundAudio.src,
            networkState: backgroundAudio.networkState,
            readyState: backgroundAudio.readyState
        });
    };

    backgroundAudio.oncanplay = () => {
        console.log('Audio ready to play');
    };
    
    // 尝试播放
    const playPromise = backgroundAudio.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('Audio playing');
            })
            .catch(error => {
                console.log('Playback prevented:', error);
                // 添加点击事件监听器来播放音频
                const startAudio = () => {
                    backgroundAudio.play()
                        .then(() => {
                            console.log('Audio started on click');
                            document.removeEventListener('click', startAudio);
                        })
                        .catch(err => {
                            console.error('Play on click failed:', err);
                            // 如果还是失败，尝试重新加载音频
                            backgroundAudio.load();
                        });
                };
                document.addEventListener('click', startAudio);
            });
    }
}); 