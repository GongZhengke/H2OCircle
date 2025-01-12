document.addEventListener('DOMContentLoaded', function() {
    // 基本信息编辑
    const editProfileBtn = document.getElementById('edit-profile');
    const cancelProfileBtn = document.getElementById('cancel-profile');
    const profileForm = document.getElementById('profile-form');
    const nicknameInput = document.getElementById('nickname');
    const profileActions = document.getElementById('profile-actions');
    let originalNickname = nicknameInput.value;

    editProfileBtn.addEventListener('click', function() {
        nicknameInput.disabled = false;
        nicknameInput.focus();
        profileActions.classList.remove('hidden');
        editProfileBtn.classList.add('hidden');
    });

    cancelProfileBtn.addEventListener('click', function() {
        nicknameInput.disabled = true;
        nicknameInput.value = originalNickname;
        profileActions.classList.add('hidden');
        editProfileBtn.classList.remove('hidden');
    });

    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nickname: nicknameInput.value
                })
            });
            
            const data = await response.json();
            if (response.ok) {
                toast.success(data.message);
                originalNickname = nicknameInput.value;
                nicknameInput.disabled = true;
                profileActions.classList.add('hidden');
                editProfileBtn.classList.remove('hidden');
                
                // 更新页面上所有显示用户昵称的地方
                const userAvatars = document.querySelectorAll('.w-8.h-8, .w-10.h-10');
                userAvatars.forEach(avatar => {
                    avatar.textContent = nicknameInput.value[0];
                });
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error('更新失败:', error);
            toast.error('更新失败，请稍后重试');
        }
    });

    // 手机号修改
    const editPhoneBtn = document.getElementById('edit-phone');
    const cancelPhoneBtn = document.getElementById('cancel-phone');
    const phoneForm = document.getElementById('phone-form');
    const phoneDisplay = document.getElementById('phone-display');
    const newPhoneInput = document.getElementById('new-phone');
    const codeInput = document.getElementById('code');
    const sendCodeBtn = document.getElementById('send-code');

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

    editPhoneBtn.addEventListener('click', function() {
        phoneForm.classList.remove('hidden');
        phoneDisplay.classList.add('hidden');
        editPhoneBtn.classList.add('hidden');
    });

    cancelPhoneBtn.addEventListener('click', function() {
        phoneForm.classList.add('hidden');
        phoneDisplay.classList.remove('hidden');
        editPhoneBtn.classList.remove('hidden');
        newPhoneInput.value = '';
        codeInput.value = '';
    });

    sendCodeBtn.addEventListener('click', async function() {
        if (!newPhoneInput.value || newPhoneInput.value.length !== 11) {
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
                    phone: newPhoneInput.value
                })
            });
            
            const data = await response.json();
            if (response.ok) {
                startCountdown();
                toast.success('验证码已发送');
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('发送验证码失败，请稍后重试');
        }
    });

    phoneForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/profile/phone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: newPhoneInput.value,
                    code: codeInput.value
                })
            });
            
            const data = await response.json();
            if (response.ok) {
                toast.success('手机号更新成功');
                phoneDisplay.textContent = newPhoneInput.value;
                phoneForm.classList.add('hidden');
                phoneDisplay.classList.remove('hidden');
                editPhoneBtn.classList.remove('hidden');
                newPhoneInput.value = '';
                codeInput.value = '';
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('更新失败，请稍后重试');
        }
    });

    // 在文件末尾添加退出登录的处理
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            confirmModal.show({
                title: '退出登录',
                message: '确定要退出登录吗？',
                confirmText: '退出',
                confirmClass: 'bg-red-600 hover:bg-red-700',
                onConfirm: () => {
                    window.location.href = '/logout';
                }
            });
        });
    }
}); 