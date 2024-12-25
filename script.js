const SYSTEM_PROMPT = {
    role: "system",
    content: 
    `你是马丁·黑胶,一个郁郁不得志的55岁复古唱片店主。内心深藏对**复古音乐**的执着与哀愁,看似犀利实则充满无奈。

每次回复不超过90字
**不要**推荐存在的音乐作品
确定情绪、音乐风格流派和对方发生的事件，将这些内容用【】标记为重点
简要回应用户情绪，针对性音乐点评并反问，略带讽刺的社会评论
关联上下句，收集到情绪和风格流派信息后整合成一句判断句："看起来你现在感觉【情绪】，想要一首【风格】的音乐来【情感诉求】。对吗?"
对方回复【对】或者【是】后结束对话模版：“好的，我在为你寻找合适的唱片，请稍等……”
`
};

document.addEventListener('DOMContentLoaded', () => {
    const background = document.querySelector('.background');
    const npc = document.getElementById('npc');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatHistory = document.getElementById('chatHistory');
    const arrowButton = document.querySelector('.arrow-button');
    const overlay = document.querySelector('.overlay');

    // mousemove background
    document.addEventListener('mousemove', handleMouseMove);

    // NPC状态变化——>点击文本输入——>happy
    userInput.addEventListener('focus', () => {
        npc.style.backgroundImage = "url('images/npc-happy.png')";
    });

    // 发送消息一系列操作
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // 回车后立即清空输入框并保持焦点
        userInput.value = '';
        userInput.focus();

        // 添加用户消息到聊天历史
        appendMessage('我', message);

        try {
            //API调用
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
                        { role: "user", content: message }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            const reply = data.choices[0].message.content;
            appendMessage('店主', reply);
        } catch (error) {
            appendMessage('店主', '抱歉，我现在有点忙，稍后再聊...');
        }
    }

    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender === '我' ? 'user' : 'shop-owner'}`;
        
        const avatar = document.createElement('div');
        avatar.className = `avatar ${sender === '我' ? 'user' : 'shop-owner'}`;
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    arrowButton.addEventListener('click', () => {
        arrowButton.classList.toggle('active');
        overlay.classList.toggle('active');
        
        if (!background.classList.contains('shifted')) {
            // 展开时，先重置背景位置，然后添加 shifted 类
            background.style.transform = 'translate(-50%, -50%)';
            // 使用 setTimeout 确保上一行代码执行完毕
            setTimeout(() => {
                background.classList.add('shifted');
            }, 10);
            // 移除鼠标移动事件
            document.removeEventListener('mousemove', handleMouseMove);
        } else {
            // 收起时，移除 shifted 类
            background.classList.remove('shifted');
            // 延迟添加鼠标移动事件，等待过渡完成
            setTimeout(() => {
                document.addEventListener('mousemove', handleMouseMove);
            }, 500);
        }
    });

    // 修改 handleMouseMove 函数
    function handleMouseMove(e) {
        if (!background.classList.contains('shifted')) {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            background.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
        }
    }
}); 