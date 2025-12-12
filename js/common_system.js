// 独立系统的LeanCloud初始化
AV.init({
    appId: 'qWTZ0xzNWk9B3bhk3vXGbfPl-gzGzoHsz',
    appKey: 'n1MnTEgdQGWk2jouFA55NF1n',
    serverURL: 'https://qwtz0xzn.lc-cn-n1-shared.com'
});

let currentPage = 'statistics';
let currentUser = null;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

// 检查登录状态
async function checkLoginStatus() {
    try {
        currentUser = AV.User.current();
        
        if (currentUser) {
            console.log('用户已登录:', currentUser.get('username'));
            document.querySelector('.app-container').style.display = 'flex';
            
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (loginModal) {
                loginModal.hide();
            }
            
            initSystem();
            
        } else {
            console.log('用户未登录，显示登录模态框');
            showLoginModal();
        }
    } catch (error) {
        console.error('检查登录状态失败:', error);
        showLoginModal();
    }
}

function showLoginModal() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'), {
        backdrop: 'static',
        keyboard: false
    });
    loginModal.show();
    
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('loginPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
}

async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorElement = document.getElementById('loginError');
    
    if (!username || !password) {
        showError('请输入用户名和密码');
        return;
    }
    
    try {
        const user = await AV.User.logIn(username, password);
        currentUser = user;
        
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        
        initSystem();
        
    } catch (error) {
        console.error('登录失败:', error);
        showError('登录失败: ' + error.message);
    }
}

function showError(message) {
    const errorElement = document.getElementById('loginError');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function initSystem() {
    document.querySelector('.app-container').style.display = 'flex';
    updateUserInfo();
    initDatePickers();
    
    // 导航切换
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            switchPage(targetPage);
        });
    });
    
    // 窗口调整大小事件
    window.addEventListener('resize', function() {
        if (currentPage === 'cert519' && typeof adjustTableContainerHeight === 'function') {
            setTimeout(adjustTableContainerHeight, 100);
        }
    });
    
    // 初始化页面
    switchPage('statistics');
}

function updateUserInfo() {
    if (currentUser) {
        const userData = currentUser.toJSON();
        document.getElementById('userName').textContent = userData.username || '用户';
        
        document.getElementById('logoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

async function logout() {
    try {
        await AV.User.logOut();
        currentUser = null;
        location.reload();
    } catch (error) {
        console.error('登出失败:', error);
    }
}

// 初始化日期选择器
function initDatePickers() {
    // 设置默认日期（近3个月）
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 2);
    
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${year}-${month}`;
    };
    
    // 统计页面日期选择器
    if (document.getElementById('startMonth')) {
        const startMonthPicker = flatpickr('#startMonth', {
            dateFormat: "Y-m",
            altInput: true,
            altFormat: "Y年m月",
            locale: "zh",
            defaultDate: formatDate(startDate),
            allowInput: true
        });
        
        const endMonthPicker = flatpickr('#endMonth', {
            dateFormat: "Y-m",
            altInput: true,
            altFormat: "Y年m月",
            locale: "zh",
            defaultDate: formatDate(endDate),
            allowInput: true
        });
        
        const yearPicker = flatpickr('#statYear', {
            dateFormat: "Y",
            altInput: true,
            altFormat: "Y年",
            locale: "zh",
            defaultDate: endDate.getFullYear().toString(),
            allowInput: true
        });
        
        // 绑定统计方式切换事件
        document.getElementById('statType').addEventListener('change', function() {
            const statType = this.value;
            const monthGroup = document.getElementById('monthGroup');
            const yearGroup = document.getElementById('yearGroup');
            
            if (statType === 'month') {
                monthGroup.style.display = 'block';
                yearGroup.style.display = 'none';
            } else {
                monthGroup.style.display = 'none';
                yearGroup.style.display = 'block';
            }
        });
    }
}

// 页面切换函数
function switchPage(page) {
    // 隐藏所有页面内容
    document.querySelectorAll('.page-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    const targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        
        // 更新导航激活状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });
        
        currentPage = page;
        
        // 初始化页面内容
        setTimeout(() => {
            initializePageContent(page);
            
            // 如果是cert519页面，调整表格高度
            if (page === 'cert519' && typeof adjustTableContainerHeight === 'function') {
                setTimeout(adjustTableContainerHeight, 300);
            }
        }, 100);
    }
}

// 初始化页面内容
function initializePageContent(page) {
    console.log(`初始化 ${page} 页面内容...`);
    
    switch (page) {
        case 'statistics':
            if (typeof initStatisticsPage === 'function') {
                initStatisticsPage();
            }
            break;
            
        case 'cert519':
            if (typeof initCert519Page === 'function') {
                initCert519Page();
            }
            break;
    }
}

// 格式化数字（用于显示）
function formatNumber(num) {
    if (num === 0 || isNaN(num)) return '0.00';
    
    return num.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// 检查表是否存在
async function checkTableExists(className) {
    try {
        const query = new AV.Query(className);
        query.limit(1);
        await query.first();
        return true;
    } catch (error) {
        if (error.code === 101) {
            return false;
        }
        throw error;
    }
}

// 显示消息
function showMessage(message, type = 'info') {
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'error' ? 'alert-danger' : 'alert-info';
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 3秒后自动消失
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 3000);
}

// 导出全局函数
window.switchPage = switchPage;
window.formatNumber = formatNumber;
window.checkTableExists = checkTableExists;
window.showMessage = showMessage;