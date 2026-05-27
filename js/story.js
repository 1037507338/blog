// POE2 Story Guide - Interactive Map System

let currentAct = 'act1';
let currentNodeId = null;
let storyData = {};
let progress = {};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllActs();
    loadProgress();
    renderActTabs();
    loadAct(currentAct);
});

// 加载所有章节
async function loadAllActs() {
    const acts = ['act1', 'act2', 'act3', 'act4'];
    for (const act of acts) {
        try {
            const response = await fetch(`data/story/${act}.json`);
            storyData[act] = await response.json();
        } catch (e) {
            console.error(`Failed to load ${act}:`, e);
        }
    }
}

// 加载进度
function loadProgress() {
    const saved = localStorage.getItem('poe2-story-progress');
    if (saved) {
        progress = JSON.parse(saved);
    }
}

// 保存进度
function saveProgress() {
    localStorage.setItem('poe2-story-progress', JSON.stringify(progress));
}

// 渲染章节标签
function renderActTabs() {
    const container = document.getElementById('actTabs');
    const acts = [
        { id: 'act1', name: 'Act 1' },
        { id: 'act2', name: 'Act 2' },
        { id: 'act3', name: 'Act 3' },
        { id: 'act4', name: 'Act 4' }
    ];
    
    container.innerHTML = acts.map(act => `
        <div class="act-tab ${act.id === currentAct ? 'active' : ''}" 
             onclick="switchAct('${act.id}')">${act.name}</div>
    `).join('');
}

// 切换章节
function switchAct(actId) {
    currentAct = actId;
    currentNodeId = null;
    closeDetail();
    renderActTabs();
    loadAct(actId);
}

// 加载章节
function loadAct(actId) {
    const data = storyData[actId];
    if (!data) return;
    
    // 设置地图图片
    const mapImage = document.getElementById('mapImage');
    if (data.maps && data.maps[0]) {
        mapImage.src = data.maps[0].image;
        mapImage.alt = data.maps[0].title;
    }
    
    // 渲染节点
    renderNodes(data.nodes);
    updateProgress();
}

// 渲染节点
function renderNodes(nodes) {
    const wrapper = document.getElementById('mapWrapper');
    
    // 移除旧节点
    wrapper.querySelectorAll('.node-marker').forEach(el => el.remove());
    
    // 添加新节点
    nodes.forEach((node, index) => {
        const marker = document.createElement('div');
        marker.className = 'node-marker';
        marker.id = `node-${node.id}`;
        marker.textContent = index + 1;
        marker.style.left = `${node.x}%`;
        marker.style.top = `${node.y}%`;
        marker.onclick = () => showNodeDetail(node.id);
        
        // 设置状态样式
        const status = getNodeStatus(node.id);
        marker.classList.add(status);
        
        wrapper.appendChild(marker);
    });
}

// 获取节点状态
function getNodeStatus(nodeId) {
    const nodeProgress = progress[currentAct]?.[nodeId];
    if (nodeProgress === 'completed') return 'completed';
    if (nodeProgress === 'current') return 'current';
    return 'pending';
}

// 显示节点详情
function showNodeDetail(nodeId) {
    const data = storyData[currentAct];
    const node = data.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    currentNodeId = nodeId;
    
    // 标记为当前
    document.querySelectorAll('.node-marker').forEach(m => m.classList.remove('active'));
    document.getElementById(`node-${nodeId}`).classList.add('active');
    
    // 填充详情
    document.getElementById('nodeTitle').textContent = node.title;
    document.getElementById('nodeHint').textContent = node.hint || '';
    document.getElementById('nodeDescription').textContent = node.description || '';
    
    // 徽章
    const badgeEl = document.getElementById('nodeBadge');
    if (node.badge) {
        badgeEl.innerHTML = `<span class="badge ${node.badge.type}">${node.badge.text}</span>`;
    } else {
        badgeEl.innerHTML = '';
    }
    
    // 步骤 - 用 div 彻底避免 li 竖排问题
    const stepsEl = document.getElementById('nodeSteps');
    if (node.steps && node.steps.length > 0) {
        stepsEl.innerHTML = node.steps.map(step => `
            <div class="step-item">
                <span class="step-title">${step.title}</span>
                <div class="step-body">${step.body}</div>
            </div>
        `).join('');
    } else {
        stepsEl.innerHTML = '';
    }
    
    // 图片
    const imagesEl = document.getElementById('nodeImages');
    if (node.images && node.images.length > 0) {
        imagesEl.innerHTML = node.images.map(img => `
            <img src="${img.url}" alt="${img.caption || node.title}" 
                 onclick="openModal('${img.url}')" loading="lazy">
        `).join('');
    } else {
        imagesEl.innerHTML = '';
    }
    
    // 导航按钮
    updateNavButtons(node);
    
    // 打开面板
    document.getElementById('detailPanel').classList.add('open');
}

// 更新导航按钮
function updateNavButtons(node) {
    const data = storyData[currentAct];
    const flowOrder = data.flowOrder;
    const currentIndex = flowOrder.indexOf(node.id);
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= flowOrder.length - 1;
}

// 节点导航（点击下一步→跳转+自动标记）
function navigateNode(direction) {
    const data = storyData[currentAct];
    const currentIndex = data.flowOrder.indexOf(currentNodeId);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < data.flowOrder.length) {
        const newNodeId = data.flowOrder[newIndex];
        
        // 自动标记：当前节点已完成，新节点设为当前
        if (!progress[currentAct]) progress[currentAct] = {};
        
        // 清除所有之前的标记
        Object.keys(progress[currentAct]).forEach(key => {
            delete progress[currentAct][key];
        });
        
        // 标记当前节点之前的都完成（包括当前）
        for (let i = 0; i <= currentIndex; i++) {
            progress[currentAct][data.flowOrder[i]] = 'completed';
        }
        
        // 标记新节点为当前
        progress[currentAct][newNodeId] = 'current';
        saveProgress();
        
        showNodeDetail(newNodeId);
        renderNodes(data.nodes);
        updateProgress();
    }
}

// 设置当前节点 - 已移除，逻辑合并到 navigateNode 中

// 更新进度
function updateProgress() {
    const data = storyData[currentAct];
    if (!data) return;
    
    const total = data.flowOrder.length;
    const actProgress = progress[currentAct] || {};
    const completed = Object.values(actProgress).filter(v => v === 'completed').length;
    
    document.getElementById('progressText').textContent = `进度: ${completed}/${total} 节点`;
    document.getElementById('progressFill').style.width = `${(completed / total) * 100}%`;
}

// 关闭详情面板
function closeDetail() {
    document.getElementById('detailPanel').classList.remove('open');
    document.querySelectorAll('.node-marker').forEach(m => m.classList.remove('active'));
}

// 打开图片模态框
function openModal(url) {
    document.getElementById('modalImage').src = url;
    document.getElementById('imageModal').classList.add('open');
}

// 关闭模态框
function closeModal() {
    document.getElementById('imageModal').classList.remove('open');
}

// 主题切换已在 maps.html 内联脚本中处理
