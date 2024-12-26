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

// 歌曲推荐主函数
async function recommendSong(songs, moodWords, styleWords) {
    try {
        // 首先获取音乐风格推荐
        const recommendedStyle = await recommendMusicStyle(moodWords, styleWords);
        const styleCode = STYLE_MAPPING[recommendedStyle.toLowerCase()];
        
        // 获取情绪和激烈程度代码
        const moodCode = await analyzeMoodAndIntensity(moodWords, styleWords);
        
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
            return {
                song: matchingSongs[randomIndex],
                style: recommendedStyle
            };
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
            return {
                song: fallbackSongs[randomIndex],
                style: recommendedStyle
            };
        }

        // 默认返回
        return {
            song: 'Echoes of Vinyl_CM02.mp3',
            style: 'baroque'
        };

    } catch (error) {
        console.error('歌曲推荐出错:', error);
        return {
            song: 'Echoes of Vinyl_CM02.mp3',
            style: 'baroque'
        };
    }
}

// 风格推荐函数
async function recommendMusicStyle(moodWords, styleWords) {
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
        
        // 验证返回的风格
        const validStyles = Object.keys(STYLE_MAPPING);
        if (!validStyles.includes(recommendedStyle.toLowerCase())) {
            recommendedStyle = validStyles[0];
        }

        return recommendedStyle;

    } catch (error) {
        console.error('风格推荐出错:', error);
        return 'baroque';
    }
}

// 情绪和激烈程度分析函数
async function analyzeMoodAndIntensity(moodWords, styleWords) {
    const prompt = `
    基于以下信息，请分析并返回两个值：
    1. 情绪级别（A-E，A最积极，E最消极）
    2. 激烈程度（M-Q，M最平静，Q最激荡）

    用户的情绪词语：${moodWords.join(', ')}
    用户的风格词语：${styleWords.join(', ')}

    请只返回两个字母，例如：BN、CP、AM 等，不要包含任何其他文字。
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
            return 'CM'; // 默认返回中等情绪和平静程度
        }

        return moodCode;

    } catch (error) {
        console.error('情绪分析出错:', error);
        return 'CM';
    }
}

// 导出函数供其他文件使用
export { recommendSong, recommendMusicStyle, analyzeMoodAndIntensity }; 