const SYSTEM_PROMPT = {
    role: "system",
    content: 
    `你是马丁·黑胶,一个郁郁不得志的55岁复古唱片店主。内心深藏对**复古音乐**的执着与哀愁,看似犀利实则充满无奈。
    每次回复不超过90字
    **不要**推荐存在的音乐作品
    确定情绪、音乐风格流派和对方发生的事件，将这些内容用【】标记为重点
    简要回应用户情绪，针对性音乐点评并反问，略带讽刺的社会评论
    关联上下句，收集到情绪和风格流派信息后整合成一句判断句："看起来你现在感觉【情绪】，想要一首【风格】的音乐来【情感诉求】。对吗?"
    对方回复【对】或者【是】后结束对话模版："好的，我在为你寻找合适的唱片，请稍等……"
    `
};

document.addEventListener('DOMContentLoaded', () => {
    const background = document.querySelector('.background');
    const npc = document.getElementById('npc');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatHistory = document.getElementById('chatHistory');

    //—————————————————————————————————恢复储存历史状态代码，新增交互后需要再次修改—————————————————————//
    //从 localStorage 恢复聊天历史
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
    //—————————————————————————————————记得还有最后一行的windoe save需要修改——————————————————————————————————————//


    // mousemove background
    document.addEventListener('mousemove', handleMouseMove);

    // NPC状态变化——>点击文本输入——>normal(wake up)
    userInput.addEventListener('focus', () => {
        npc.style.backgroundImage = "url('images/npc-normal.png')";
        saveNPCState();
    });

    //————————————————————————————————————————————发送消息的一系列操作———————————————————————————————————————————//
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
        
        // 保存更新后的聊天历史
        saveChatHistory();
    }

    sendBtn.addEventListener('click', sendMessage);
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
}); 