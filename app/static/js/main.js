document.addEventListener('DOMContentLoaded', function() {
    // 登录页面的逻辑
    if (document.getElementById('login-form')) {
        const loginForm = document.getElementById('login-form');
        const sendCodeBtn = document.getElementById('send-code');
        const phoneInput = document.getElementById('phone');
        const codeInput = document.getElementById('code');
        
        let countdown = 60;
        let timer = null;
        
        function startCountdown() {
            sendCodeBtn.disabled = true;
            timer = setInterval(() => {
                countdown--;
                sendCodeBtn.textContent = `${countdown}秒后重试`;
                if (countdown <= 0) {
                    clearInterval(timer);
                    sendCodeBtn.disabled = false;
                    sendCodeBtn.textContent = '获取验证码';
                    countdown = 60;
                }
            }, 1000);
        }
        
        sendCodeBtn.addEventListener('click', async function() {
            if (!phoneInput.value || phoneInput.value.length !== 11) {
                toast.error('请输入有效的手机号');
                return;
            }
            
            try {
                const response = await fetch('/api/send-code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phone: phoneInput.value
                    })
                });
                
                const data = await response.json();
                if (response.ok) {
                    startCountdown();
                } else {
                    alert(data.error);
                }
            } catch (error) {
                alert('发送验证码失败，请稍后重试');
            }
        });
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phone: phoneInput.value,
                        code: codeInput.value
                    })
                });
                
                const data = await response.json();
                if (response.ok) {
                    window.location.href = '/index';  // 登录成功后跳转
                } else {
                    alert(data.error);
                }
            } catch (error) {
                alert('登录失败，请稍后重试');
            }
        });
    }

    // 主页面的逻辑
    if (document.getElementById('post-form')) {
        const postForm = document.getElementById('post-form');
        const postContent = postForm.querySelector('textarea');
        const charCount = postForm.querySelector('.char-count');
        const postList = document.querySelector('.space-y-4');  // 帖子列表容器

        postContent.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = `${count}/140`;
            if (count > 140) {
                charCount.style.color = '#ef4444';
            } else {
                charCount.style.color = 'var(--text-secondary)';
            }
        });
        
        postForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!postContent.value.trim()) {
                toast.error('请输入内容');
                return;
            }
            
            try {
                const response = await fetch('/api/post', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: postContent.value
                    })
                });
                
                const data = await response.json();
                if (response.ok) {
                    // 创建新帖子元素
                    const newPost = document.createElement('div');
                    newPost.className = 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden post-item';
                    
                    // 获取当前用户信息
                    const userAvatar = document.querySelector('header .w-10.h-10').textContent.trim();
                    const userNickname = document.querySelector('header .font-medium').textContent.trim();
                    
                    // 获取当前时间
                    const now = new Date();
                    const timestamp = now.toLocaleDateString('zh-CN') + ' ' + 
                        now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                    
                    newPost.innerHTML = `
                        <div class="p-4">
                            <!-- 作者信息 -->
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                    ${userAvatar}
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-medium text-gray-900">${userNickname}</span>
                                    <span class="text-sm text-gray-500">${timestamp}</span>
                                </div>
                            </div>

                            <!-- 帖子内容 -->
                            <div class="mt-3 text-gray-800">
                                <div class="flex justify-between items-start">
                                    <div>${postContent.value}</div>
                                    <button class="delete-post-btn ml-2 text-gray-400 hover:text-red-500 transition-colors" 
                                        data-post-id="${data.post_id}">
                                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <!-- 操作按钮 -->
                            <div class="flex items-center space-x-6 mt-4 pt-3 border-t border-gray-100">
                                <button class="action-btn like-btn flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
                                    data-post-id="${data.post_id}" data-liked="false">
                                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                                    </svg>
                                    <span>0</span>
                                </button>
                                <button class="action-btn comment-btn flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
                                    data-post-id="${data.post_id}">
                                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                    <span>0</span>
                                </button>
                                <button class="action-btn favorite-btn flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
                                    data-post-id="${data.post_id}" data-favorited="false">
                                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                                    </svg>
                                </button>
                            </div>

                            <!-- 评论区 -->
                            <div class="comment-section mt-4" id="comments-${data.post_id}">
                                <div class="space-y-3 comment-list"></div>
                                <div class="comment-form hidden mt-3">
                                    <!-- 评论输入框内容 -->
                                    <div class="flex items-start space-x-3">
                                        <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                            ${userAvatar}
                                        </div>
                                        <div class="flex-1">
                                            <textarea class="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="写下你的评论..." rows="3"></textarea>
                                            <div class="flex justify-end space-x-2 mt-2">
                                                <button type="button" class="cancel-comment px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">
                                                    取消
                                                </button>
                                                <button type="button" class="submit-comment px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                                    发表评论
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    // 将新帖子插入到列表顶部
                    postList.insertBefore(newPost, postList.firstChild);
                    
                    // 清空输入框和字数统计
                    postContent.value = '';
                    charCount.textContent = '0/140';
                    
                    // 为新帖子添加事件监听器
                    attachEventListeners(newPost);
                    
                    // 显示积分奖励提示
                    if (data.points_earned > 0) {
                        toast.success(`获得${data.points_earned}积分奖励`, '发布成功');
                    }
                    
                    // 更新用户积分显示
                    const pointsElement = document.querySelector('header .text-gray-500');
                    pointsElement.textContent = `积分: ${data.total_points}`;
                } else {
                    toast.error(data.error);
                }
            } catch (error) {
                toast.error('发布失败，请稍后重试');
            }
        });

        // 为所有现有帖子添加事件监听器
        initializePostActions();
    }
});

// 初始化所有帖子的交互功能
function initializePostActions() {
    // 处理点赞按钮
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', handleLike);
    });

    // 处理评论按钮
    document.querySelectorAll('.comment-btn').forEach(button => {
        button.addEventListener('click', handleCommentClick);
    });

    // 处理收藏按钮
    document.querySelectorAll('.favorite-btn').forEach(button => {
        button.addEventListener('click', handleFavorite);
    });

    // 处理删除帖子按钮
    document.querySelectorAll('.delete-post-btn').forEach(button => {
        button.addEventListener('click', handlePostDelete);
    });

    // 处理删除评论按钮
    document.querySelectorAll('.delete-comment-btn').forEach(button => {
        button.addEventListener('click', handleCommentDelete);
    });

    // 处理评论表单
    document.querySelectorAll('.comment-form').forEach(form => {
        initializeCommentForm(form);
    });
}

// 点赞处理函数
async function handleLike() {
    const postId = this.dataset.postId;
    try {
        const response = await fetch(`/api/like/${postId}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        if (response.ok) {
            this.dataset.liked = data.liked;
            const likeIcon = this.querySelector('svg');
            const likeCount = this.querySelector('span');
            
            if (data.liked) {
                likeIcon.style.fill = 'currentColor';
                this.classList.add('text-blue-600');
            } else {
                likeIcon.style.fill = 'none';
                this.classList.remove('text-blue-600');
            }
            
            likeCount.textContent = data.likes_count;
            
            if (data.points_earned > 0) {
                toast.success(`获得${data.points_earned}积分奖励`, '点赞成功');
            }
        } else {
            toast.error(data.error);
        }
    } catch (error) {
        toast.error('操作失败，请稍后重试');
    }
}

// 评论按钮点击处理函数
function handleCommentClick() {
    const commentForm = this.closest('.post-item').querySelector('.comment-form');
    commentForm.classList.toggle('hidden');
}

// 收藏处理函数
async function handleFavorite() {
    const postId = this.dataset.postId;
    try {
        const response = await fetch(`/api/favorite/${postId}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        if (response.ok) {
            this.dataset.favorited = data.favorited;
            const favoriteIcon = this.querySelector('svg');
            
            if (data.favorited) {
                favoriteIcon.style.fill = 'currentColor';
                this.classList.add('text-blue-600');
            } else {
                favoriteIcon.style.fill = 'none';
                this.classList.remove('text-blue-600');
            }
            
            if (data.points_earned > 0) {
                toast.success(`获得${data.points_earned}积分奖励`, '收藏成功');
            }
        } else {
            toast.error(data.error);
        }
    } catch (error) {
        toast.error('操作失败，请稍后重试');
    }
}

// 删除帖子处理函数
function handlePostDelete() {
    const postId = this.dataset.postId;
    const postElement = this.closest('.post-item');
    
    confirmModal.show({
        title: '删除帖子',
        message: '确定要删除这条帖子吗？删除后将无法恢复。',
        onConfirm: async () => {
            try {
                const response = await fetch(`/api/post/${postId}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                if (response.ok) {
                    toast.success('帖子已删除');
                    postElement.remove();
                } else {
                    toast.error(data.error);
                }
            } catch (error) {
                toast.error('删除失败，请稍后重试');
            }
        }
    });
}

// 删除评论处理函数
function handleCommentDelete() {
    const commentId = this.dataset.commentId;
    const commentElement = this.closest('.flex.items-start.space-x-3');
    const postItem = this.closest('.post-item');
    const commentCount = postItem.querySelector('.comment-btn span');
    
    confirmModal.show({
        title: '删除评论',
        message: '确定要删除这条评论吗？删除后将无法恢复。',
        onConfirm: async () => {
            try {
                const response = await fetch(`/api/comment/${commentId}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                if (response.ok) {
                    toast.success('评论已删除');
                    commentCount.textContent = parseInt(commentCount.textContent) - 1;
                    commentElement.remove();
                } else {
                    toast.error(data.error);
                }
            } catch (error) {
                toast.error('删除失败，请稍后重试');
            }
        }
    });
}

// 修改 initializeCommentForm 函数
function initializeCommentForm(form) {
    const cancelBtn = form.querySelector('.cancel-comment');
    const submitBtn = form.querySelector('.submit-comment');
    const textarea = form.querySelector('textarea');
    const postId = form.closest('.post-item').querySelector('.comment-btn').dataset.postId;

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            form.classList.add('hidden');
            textarea.value = '';
        });
    }

    if (submitBtn && textarea) {
        submitBtn.addEventListener('click', async () => {
            if (!textarea.value.trim()) {
                toast.error('请输入评论内容');
                return;
            }

            try {
                const response = await fetch(`/api/comment/${postId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: textarea.value
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    const commentList = form.closest('.post-item').querySelector('.comment-list');
                    const newComment = createCommentElement(data);
                    commentList.insertBefore(newComment, commentList.firstChild);
                    
                    // 更新评论计数
                    const commentBtn = form.closest('.post-item').querySelector('.comment-btn span');
                    commentBtn.textContent = parseInt(commentBtn.textContent) + 1;
                    
                    // 清空输入框并隐藏评论表单
                    textarea.value = '';
                    form.classList.add('hidden');
                    
                    if (data.points_earned > 0) {
                        toast.success(`获得${data.points_earned}积分奖励`, '评论成功');
                    }
                } else {
                    toast.error(data.error);
                }
            } catch (error) {
                toast.error('评论失败，请稍后重试');
            }
        });
    }
}

// 在添加新帖子时调用此函数
function attachEventListeners(postElement) {
    const likeBtn = postElement.querySelector('.like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', handleLike);
    }

    const commentBtn = postElement.querySelector('.comment-btn');
    if (commentBtn) {
        commentBtn.addEventListener('click', handleCommentClick);
    }

    const favoriteBtn = postElement.querySelector('.favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', handleFavorite);
    }

    const deleteBtn = postElement.querySelector('.delete-post-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handlePostDelete);
    }

    const commentForm = postElement.querySelector('.comment-form');
    if (commentForm) {
        initializeCommentForm(commentForm);
    }
}

// 辅助函数：创建评论元素
function createCommentElement(data) {
    const newComment = document.createElement('div');
    newComment.className = 'flex items-start space-x-3';
    newComment.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
            ${data.nickname[0]}
        </div>
        <div class="flex-1 bg-gray-50 rounded-lg p-3">
            <div class="flex items-center justify-between">
                <span class="font-medium text-gray-900">${data.nickname}</span>
                <span class="text-sm text-gray-500">${data.timestamp}</span>
            </div>
            <p class="text-gray-800 mt-1">${data.content}</p>
        </div>
    `;
    return newComment;
}

// 处理加载更多评论按钮
document.querySelectorAll('.load-more-comments').forEach(button => {
    button.addEventListener('click', async function() {
        const postId = this.dataset.postId;
        const page = parseInt(this.dataset.page);
        const loadingText = this.textContent;
        
        try {
            // 显示加载状态
            this.textContent = '加载中...';
            this.disabled = true;
            
            const response = await fetch(`/api/comments/${postId}?page=${page}`);
            const data = await response.json();
            
            if (response.ok) {
                const commentSection = this.closest('.comment-section');
                const commentList = commentSection.querySelector('.comment-list');
                const collapseButton = commentSection.querySelector('.collapse-comments');
                
                if (data.comments && data.comments.length > 0) {
                    // 创建一个新的div来包含这一页的评论
                    const pageCommentsDiv = document.createElement('div');
                    pageCommentsDiv.className = 'page-comments space-y-3';
                    pageCommentsDiv.dataset.page = page;
                    
                    data.comments.forEach(comment => {
                        const newComment = document.createElement('div');
                        newComment.className = 'flex items-start space-x-3';
                        newComment.innerHTML = `
                            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                ${comment.author_avatar}
                            </div>
                            <div class="flex-1 bg-gray-50 rounded-lg p-3">
                                <div class="flex items-center justify-between">
                                    <span class="font-medium text-gray-900">${comment.nickname}</span>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-sm text-gray-500">${comment.timestamp}</span>
                                        ${comment.is_author ? `
                                            <button class="delete-comment-btn text-gray-400 hover:text-red-500 transition-colors" 
                                                data-comment-id="${comment.id}">
                                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                </svg>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                                <p class="text-gray-800 mt-1">${comment.content}</p>
                            </div>
                        `;
                        pageCommentsDiv.appendChild(newComment);
                    });
                    
                    commentList.appendChild(pageCommentsDiv);
                    
                    // 更新页码
                    this.dataset.page = page + 1;
                    
                    // 显示收起按钮
                    collapseButton.classList.remove('hidden');
                    
                    // 更新加载更多按钮状态
                    if (data.remaining_count > 0) {
                        // 还有更多评论，更新按钮文本
                        this.textContent = `加载更多评论 (还有${data.remaining_count}条)`;
                        this.classList.remove('hidden'); // 确保按钮可见
                    } else {
                        // 没有更多评论了，隐藏按钮
                        this.classList.add('hidden');
                    }
                } else {
                    // 如果这一页没有评论，隐藏加载更多按钮
                    this.classList.add('hidden');
                }
            } else {
                alert(data.error || '加载评论失败');
            }
        } catch (error) {
            console.error('加载评论失败:', error);
            alert('加载评论失败，请稍后重试');
        } finally {
            this.disabled = false;
        }
    });
});

// 处理收起评论按钮
document.querySelectorAll('.collapse-comments').forEach(button => {
    button.addEventListener('click', function() {
        const commentSection = this.closest('.comment-section');
        const commentList = commentSection.querySelector('.comment-list');
        const loadMoreButton = commentSection.querySelector('.load-more-comments');
        
        // 移除所有加载的额外评论页
        commentList.querySelectorAll('.page-comments').forEach(pageDiv => {
            pageDiv.remove();
        });
        
        // 重置加载更多按钮
        loadMoreButton.dataset.page = '2';
        loadMoreButton.textContent = `加载更多评论 (还有${loadMoreButton.dataset.remaining}条)`;
        loadMoreButton.classList.remove('hidden');
        
        // 隐藏收起按钮
        this.classList.add('hidden');
        
        // 滚动到评论区顶部
        commentSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// 处理删除评论
document.querySelectorAll('.delete-comment-btn').forEach(button => {
    button.addEventListener('click', function() {
        const commentId = this.dataset.commentId;
        const commentElement = this.closest('.flex.items-start.space-x-3');
        const postItem = this.closest('.post-item');
        const commentCount = postItem.querySelector('.comment-btn span');
        
        confirmModal.show({
            title: '删除评论',
            message: '确定要删除这条评论吗？删除后将无法恢复。',
            onConfirm: async () => {
                try {
                    const response = await fetch(`/api/comment/${commentId}`, {
                        method: 'DELETE'
                    });
                    
                    const data = await response.json();
                    if (response.ok) {
                        toast.success('评论已删除');
                        commentCount.textContent = parseInt(commentCount.textContent) - 1;
                        commentElement.remove();
                    } else {
                        toast.error(data.error);
                    }
                } catch (error) {
                    toast.error('删除失败，请稍后重试');
                }
            }
        });
    });
});

// 处理加载更多帖子
const loadMoreBtn = document.getElementById('load-more-posts');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async function() {
        const page = parseInt(this.dataset.page);
        const loadingText = this.textContent;
        
        try {
            // 显示加载状态
            this.textContent = '加载中...';
            this.disabled = true;
            
            const response = await fetch(`/api/posts?page=${page}`);
            const data = await response.json();
            
            if (response.ok) {
                const postList = document.querySelector('.space-y-4');
                
                // 添加新帖子
                data.posts.forEach(post => {
                    const newPost = createPostElement(post);
                    postList.appendChild(newPost);
                    attachEventListeners(newPost);
                });
                
                // 更新页码
                this.dataset.page = page + 1;
                
                // 如果没有更多帖子，隐藏加载按钮
                if (!data.has_next) {
                    this.closest('#load-more-container').remove();
                } else {
                    this.textContent = loadingText;
                    this.disabled = false;
                }
            } else {
                toast.error('加载失败，请稍后重试');
            }
        } catch (error) {
            toast.error('加载失败，请稍后重试');
        } finally {
            if (this.parentElement) {  // 确保按钮还存在
                this.textContent = loadingText;
                this.disabled = false;
            }
        }
    });
}

// 创建帖子元素的函数
function createPostElement(post) {
    const newPost = document.createElement('div');
    newPost.className = 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden post-item';
    newPost.dataset.postId = post.id;
    
    newPost.innerHTML = `
        <div class="p-4">
            <!-- 作者信息 -->
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    ${post.author.avatar}
                </div>
                <div class="flex flex-col">
                    <span class="font-medium text-gray-900">${post.author.nickname}</span>
                    <span class="text-sm text-gray-500">${post.timestamp}</span>
                </div>
            </div>

            <!-- 帖子内容 -->
            <div class="mt-3 text-gray-800">
                <div class="flex justify-between items-start">
                    <div>${post.content}</div>
                    ${post.is_author ? `
                        <button class="delete-post-btn ml-2 text-gray-400 hover:text-red-500 transition-colors" 
                            data-post-id="${post.id}">
                            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center space-x-6 mt-4 pt-3 border-t border-gray-100">
                <button class="action-btn like-btn flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
                    data-post-id="${post.id}"
                    data-liked="${post.is_liked}">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="${post.is_liked ? 'currentColor' : 'none'}" 
                        stroke="currentColor" stroke-width="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                    <span>${post.likes_count}</span>
                </button>
                <button class="action-btn comment-btn flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
                    data-post-id="${post.id}">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    <span>${post.comments_count}</span>
                </button>
                <button class="action-btn favorite-btn flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
                    data-post-id="${post.id}"
                    data-favorited="${post.is_favorited}">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="${post.is_favorited ? 'currentColor' : 'none'}" 
                        stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            </div>

            <!-- 评论区 -->
            <div class="comment-section mt-4" id="comments-${post.id}">
                <div class="space-y-3 comment-list">
                    ${post.comments.map(comment => `
                        <div class="flex items-start space-x-3">
                            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                ${comment.author_avatar}
                            </div>
                            <div class="flex-1 bg-gray-50 rounded-lg p-3">
                                <div class="flex items-center justify-between">
                                    <span class="font-medium text-gray-900">${comment.nickname}</span>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-sm text-gray-500">${comment.timestamp}</span>
                                        ${comment.is_author ? `
                                            <button class="delete-comment-btn text-gray-400 hover:text-red-500 transition-colors" 
                                                data-comment-id="${comment.id}">
                                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                </svg>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                                <p class="text-gray-800 mt-1">${comment.content}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${post.remaining_comments > 0 ? `
                    <div class="comment-actions mt-3 flex flex-col gap-2">
                        <button type="button" 
                            class="load-more-comments text-blue-600 hover:underline w-full text-center py-2 hover:bg-blue-50 rounded-lg transition-colors" 
                            data-post-id="${post.id}" 
                            data-page="2"
                            data-remaining="${post.remaining_comments}"
                        >
                            加载更多评论 (还有${post.remaining_comments}条)
                        </button>
                        <button type="button"
                            class="collapse-comments hidden text-gray-500 hover:text-gray-700 w-full text-center py-2 hover:bg-gray-50 rounded-lg transition-colors"
                            data-post-id="${post.id}"
                        >
                            收起评论
                        </button>
                    </div>
                ` : ''}
                
                <!-- 评论输入框 -->
                <div class="comment-form hidden mt-3">
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                            ${document.querySelector('header .w-10.h-10').textContent.trim()}
                        </div>
                        <div class="flex-1">
                            <textarea 
                                class="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="写下你的评论..."
                                rows="3"
                            ></textarea>
                            <div class="flex justify-end space-x-2 mt-2">
                                <button type="button" class="cancel-comment px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">
                                    取消
                                </button>
                                <button type="button" class="submit-comment px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    发表评论
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return newPost;
} 