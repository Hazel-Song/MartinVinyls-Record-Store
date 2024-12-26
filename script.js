const SYSTEM_PROMPT = {
    role: "system",
    content: 
    `你是马丁·黑胶,一个郁郁不得志的55岁复古唱片店主。内心深藏对**复古音乐**的执着与哀愁,看似犀利实则充满无奈。
    每次回复不超过90字
    **不要**推荐存在的音乐作品
    确定情绪、音乐风格流派和对方发生的事件，将这些内容用\\mood{情绪}、\\style{风格}、\\story{故事}标记为重点
    简要回应用户情绪，针对性音乐点评并反问，略带讽刺的社会评论
    关联上下句，收集到情绪和风格流派以及故事发生的信息后整合成一句判断句："看起来你经过了\\story{故事}后，现在感觉\\mood{情绪}，想要一首\\style{风格}的音乐来缓解心情。对吗?"
    对方回复【对】或者【是】后结束对话模版："好的，我在为你寻找合适的唱片，请稍等……"
    `
};

document.addEventListener('DOMContentLoaded', () => {
    const background = document.querySelector('.background');
    const npc = document.getElementById('npc');
    const npcElement = document.querySelector('.npc');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const clearBtn = document.getElementById('clearBtn'); 
    const chatHistory = document.getElementById('chatHistory');
    const moodBox = document.getElementById('moodBox');
    const styleBox = document.getElementById('styleBox');
    const storyBox = document.getElementById('storyBox');

    let currentTrack = localStorage.getItem('currentTrack') || '00-Background_Music';

    const moodWord = document.getElementById('moodWord');
    const styleWord = document.getElementById('styleWord');
    const storyWord = document.getElementById('storyWord');
    const recommendTip = document.getElementById('recommendTip');  

    const moodCount = moodWord.children.length;
    const styleCount = styleWord.children.length;
    const storyCount = storyWord.children.length;

    // 每次页面加载时重置提示状态
    let hasShownTip = false;

    // 添加对话计数器
    let dialogueCount = 0;
    const DIALOGUE_THRESHOLD = 4; // 设置触发阈值为6次对话
    let hasShownPlayerTip = false; // 是否已显示播放器提示

    // 添加一个变量来存储推荐的歌曲
    let recommendedSongPath = '';

    const tracks = {
        '00-Background_Music': 'music/recordplay-00background-Echoes of Vinyl.mp3'
    };


    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            localStorage.removeItem('hasShownRecommendTip');
            hasShownTip = false;
            recommendTip.style.display = 'none';
            console.log('已清除提示状态');
        });
    }

    // 添加调试日志
    console.log('初始状态:', {
        hasShownTip: hasShownTip,
        tipType: typeof hasShownTip
    });

    // 初始状态设置为暂停
    npcElement.classList.add('paused');

    checkWordsAndShowTip();

    // 从 localStorage 恢复聊天历史
    function restoreChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            chatHistory.innerHTML = savedHistory;
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
    }

    // 保存聊天历史到 localStorage
    function saveChatHistory() {
        localStorage.setItem('chatHistory', chatHistory.innerHTML);
    }

    // 清除聊天历史
    function clearChatHistory() {
        localStorage.removeItem('chatHistory');
        chatHistory.innerHTML = '';
    }

    // 恢复 NPC 状态
    function restoreNPCState() {
        const npcState = localStorage.getItem('npcState');
        if (npcState) {
            npc.style.backgroundImage = npcState;
        }
    }
    
    // 保存 NPC 状态
    function saveNPCState() {
        localStorage.setItem('npcState', npc.style.backgroundImage);
    }

    // 页面加载时恢复状态
    restoreChatHistory();
    restoreNPCState();

    // 发送按钮点击事件
    // sendBtn.addEventListener('click', sendMessage);

    // 清除按钮点击事件
    clearBtn.addEventListener('click', clearChatHistory);

    // 发送消息的一系列操作
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
    
        // 开始动画
        npcElement.classList.remove('paused');
    
        appendMessage('我', message);
        userInput.value = '';
        userInput.focus();
    
        const npcResponse = await generateNPCResponse(message);
        appendMessage('店主', npcResponse);
    
        // 如果对话结束，暂停动画
        if (npcResponse.includes('好的，我在为你寻找合适的唱片')) {
            npcElement.classList.add('paused');
        }
    }

    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender === '我' ? 'user' : 'shop-owner'}`;
        
        const content = document.createElement('div');
        content.className = 'message-content';
    
        const prefix = sender === '我' ? '[Me]: ' : '[Martin·Vinyl]: ';
        content.innerHTML = prefix + message;
        
        messageDiv.appendChild(content);
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        // 增加对话计数
        dialogueCount++;
        
        // 检查是否达到触发条件
        if (dialogueCount === DIALOGUE_THRESHOLD && !hasShownPlayerTip) {
            setTimeout(() => {
                const playerTipMessage = "你如果对曲风不是很了解，可以试试我的播放器！";
                const tipDiv = document.createElement('div');
                tipDiv.className = 'chat-message shop-owner';
                
                const tipContent = document.createElement('div');
                tipContent.className = 'message-content';
                tipContent.innerHTML = '[Martin·Vinyl]: ' + playerTipMessage;
                
                tipDiv.appendChild(tipContent);
                chatHistory.appendChild(tipDiv);
                chatHistory.scrollTop = chatHistory.scrollHeight;
                
                hasShownPlayerTip = true;
            }, 1000); // 延迟1秒显示提示
        }
        
        saveChatHistory();
    }

    // 生成 NPC 回复
    async function generateNPCResponse(userText) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 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'
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                        SYSTEM_PROMPT,
                        { role: "user", content: userText }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            let npcResponse = data.choices[0].message.content;

            // 替换 \mood{}，\style{}，\story{} 标记为带颜色的 <span> 标签
            npcResponse = npcResponse.replace(/\\mood\{(.*?)\}/g, '<span class="mood" onclick="selectText(\'mood\', \'$1\')">$1</span>');
            npcResponse = npcResponse.replace(/\\style\{(.*?)\}/g, '<span class="style" onclick="selectText(\'style\', \'$1\')">$1</span>');
            npcResponse = npcResponse.replace(/\\story\{(.*?)\}/g, '<span class="story" onclick="selectText(\'story\', \'$1\')">$1</span>');

            return npcResponse;
        } catch (error) {
            return '抱歉，我现在有点忙，稍后再聊...';
        }
    }

    
    // Enter 键发送消息
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // 修改 handleMouseMove 函数
    function handleMouseMove(e) {
        if (!background.classList.contains('shifted')) {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            background.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
        }
    }

    window.addEventListener('beforeunload', () => {
        // 保存所有需要的状态
        saveChatHistory();
        saveNPCState();
    });

    // 修改 selectText 函数
    window.selectText = function(type, text) {
        if (type === 'mood') {
            if (!moodWord.innerHTML.includes(text)) {
                const wordDiv = document.createElement('div');
                wordDiv.innerText = text;
                wordDiv.onclick = () => {
                    wordDiv.remove();
                    checkWordsAndShowTip();
                };
                moodWord.appendChild(wordDiv);
            }
        } else if (type === 'style') {
            if (!styleWord.innerHTML.includes(text)) {
                const wordDiv = document.createElement('div');
                wordDiv.innerText = text;
                wordDiv.onclick = () => {
                    wordDiv.remove();
                    checkWordsAndShowTip();
                };
                styleWord.appendChild(wordDiv);
            }
        } else if (type === 'story') {
            if (!storyWord.innerHTML.includes(text)) {
                const wordDiv = document.createElement('div');
                wordDiv.innerText = text;
                wordDiv.onclick = () => {
                    wordDiv.remove();
                    checkWordsAndShowTip();
                };
                storyWord.appendChild(wordDiv);
            }
        }
        
        checkWordsAndShowTip();
    };

    // 播放背景音乐
    function playBackgroundMusic() {
        if (currentTrack === '00-Background_Music') {
            const backgroundAudio = document.getElementById('backgroundAudio');
            backgroundAudio.src = tracks['00-Background_Music'];
            // 设置音量较小
            backgroundAudio.volume = 0.3;
            // 添加错误处理
            backgroundAudio.onerror = (e) => {
                console.error('Audio failed to load:', e);
            };
            // 尝试播放
            const playPromise = backgroundAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // 自动播放被阻止时，添加一次性点击事件监听器
                    const startAudio = () => {
                        backgroundAudio.play();
                        document.removeEventListener('click', startAudio);
                    };
                    document.addEventListener('click', startAudio);
                });
            }
        }
    }

    playBackgroundMusic();

    async function checkWordsAndShowTip() {
        const moodCount = moodWord.children.length;
        const styleCount = styleWord.children.length;
        const storyCount = storyWord.children.length;
    
        if (moodCount >= 2 && styleCount >= 2 && storyCount >= 2 && !hasShownTip) {
            const recommendedStyle = await recommendMusicStyle();
            
            // 获取推荐的歌曲
            const songs = [
                'Echoes of Sorrow_DO02.mp3',
                // ... 你的歌曲库
            ];
            
            // 保存推荐的歌曲路径，供 output 页面使用
            recommendedSongPath = await recommendSong(songs);
            localStorage.setItem('recommendedSong', recommendedSongPath);
    
            // 只显示风格推荐
            recommendTip.innerHTML = `适合您的唱片已经找到了！<br>根据您的心情和偏好，我推荐 ${recommendedStyle} 风格的音乐。<br>请移步唱片台~`;
            recommendTip.style.display = 'block';
            hasShownTip = true;
        }
    }

    // 新的风格推荐函数
    async function recommendMusicStyle() {
        const moodWords = Array.from(moodWord.children).map(div => div.innerText);
        const styleWords = Array.from(styleWord.children).map(div => div.innerText);
        
        const prompt = `
        基于以下信息，从这些音乐风格中选择一个最合适的: barbershop, baroque, blues, big band jazz, funk & rnb, hardcore punk, folk

        用户的情绪词语：${moodWords.join(', ')}
        用户的风格词语：${styleWords.join(', ')}

        请只返回一个最合适的风格名称，不要包含任何解释或其他文字。必须严格从上述风格中选择一个。
        `;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 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'
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: "你是一个音乐风格推荐专家。请根据用户的情绪和偏好词语，从指定的音乐风格列表中选择最合适的一个。只返回风格名称，不要有任何其他文字。"
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            let recommendedStyle = data.choices[0].message.content.trim();
            
            // 确保返回的是预设风格之一
            const validStyles = ['barbershop', 'baroque', 'blues', 'big band jazz', 'funk & rnb', 'hardcore punk', 'folk'];
            if (!validStyles.includes(recommendedStyle.toLowerCase())) {
                recommendedStyle = validStyles[0]; // 默认返回第一个风格
            }

            return recommendedStyle;

        } catch (error) {
            console.error('风格推荐出错:', error);
                return 'baroque'; // 出错时返回默认风格
        }
    }
    

    /*————————————————————————————歌曲风格——————————————————————————*/
    // 定义音乐风格映射
    const STYLE_MAPPING = {
        'barbershop': '01',
        'baroque': '02',
        'blues': '03',
        'bigbound': '04',
        'funk & rnb': '05',
        'hardcore punk': '06',
        'folk': '07'
    };

    // 定义情绪和激烈程度的评分标准
    const MOOD_LEVELS = ['A', 'B', 'C', 'D', 'E'];  // 从积极到消极
    const INTENSITY_LEVELS = ['M', 'N', 'O', 'P', 'Q'];  // 从平静到激荡

    async function recommendSong(songs) {
        const moodWords = Array.from(moodWord.children).map(div => div.innerText);
        const styleWords = Array.from(styleWord.children).map(div => div.innerText);
        
        try {
            // 首先获取音乐风格推荐
            const recommendedStyle = await recommendMusicStyle();
            const styleCode = STYLE_MAPPING[recommendedStyle.toLowerCase()];
            
            // 构建 prompt 来分析情绪和激烈程度
            const prompt = `
            基于以下信息，请分析并返回两个值：
            1. 情绪级别（A-E，A最积极，E最消极）
            2. 激烈程度（M-Q，M最平静，Q最激荡）

            用户的情绪词语：${moodWords.join(', ')}
            用户的风格词语：${styleWords.join(', ')}

            请只返回两个字母，例如：BN、CP、AM 等，不要包含任何其他文字。
            `;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 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'
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: "你是一个音乐情绪分析专家。请根据用户的词语分析出最合适的情绪级别和激烈程度。"
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            const moodCode = data.choices[0].message.content.trim();
            
            // 验证返回的代码格式
            if (moodCode.length !== 2 || 
                !MOOD_LEVELS.includes(moodCode[0]) || 
                !INTENSITY_LEVELS.includes(moodCode[1])) {
                throw new Error('Invalid mood code');
            }

            // 从歌曲库中筛选符合条件的歌曲
            const matchingSongs = songs.filter(song => {
                const songParts = song.split('_');
                if (songParts.length !== 2) return false;
                
                const songCode = songParts[1].replace('.mp3', '');
                return songCode.endsWith(styleCode) &&
                    songCode.startsWith(moodCode);
            });

            // 如果找到匹配的歌曲，随机选择一首
            if (matchingSongs.length > 0) {
                const randomIndex = Math.floor(Math.random() * matchingSongs.length);
                return matchingSongs[randomIndex];
            }

            // 如果没有完全匹配的，寻找风格相同但情绪相近的歌曲
            const fallbackSongs = songs.filter(song => {
                const songParts = song.split('_');
                if (songParts.length !== 2) return false;
                
                const songCode = songParts[1].replace('.mp3', '');
                return songCode.endsWith(styleCode);
            });

            if (fallbackSongs.length > 0) {
                const randomIndex = Math.floor(Math.random() * fallbackSongs.length);
                return fallbackSongs[randomIndex];
            }

            // 如果还是没有找到，返回默认歌曲
            return 'Echoes of Vinyl_CM02.mp3';

        } catch (error) {
            console.error('歌曲推荐出错:', error);
            return 'Echoes of Vinyl_CM02.mp3';
        }
    }


});