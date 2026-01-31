// ============================================
// AUTHENTICATION SYSTEM
// ============================================

// Global variables
let currentUser = null;
let otpCode = null;
let otpEmail = null;

// Initialize EmailJS
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init("Cr8Skylldo6vUX6ae");
    }
})();

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Setup event listeners
    setupEventListeners();
});

// Check authentication status
function checkAuthStatus() {
    const savedUser = localStorage.getItem('benefitUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            if (currentUser && currentUser.email) {
                showMainApp();
                return;
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
            localStorage.removeItem('benefitUser');
        }
    }
    showLogin();
}

// Setup all event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // OTP form
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', handleOTPVerification);
    }
    
    // Navigation buttons
    const showSignupBtn = document.getElementById('showSignup');
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showSignup();
        });
    }
    
    const showLoginBtn = document.getElementById('showLogin');
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLogin();
        });
    }
    
    const backToSignupBtn = document.getElementById('backToSignup');
    if (backToSignupBtn) {
        backToSignupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showSignup();
        });
    }
    
    // Resend OTP button
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', resendOTP);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
    
    // OTP input auto-submit
    const otpInput = document.getElementById('otpCode');
    if (otpInput) {
        otpInput.addEventListener('input', function() {
            // Only allow numbers
            this.value = this.value.replace(/\D/g, '');
            
            // Auto-submit when 6 digits
            if (this.value.length === 6) {
                document.getElementById('otpForm').dispatchEvent(new Event('submit'));
            }
        });
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

function showLogin() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('userNavbar').style.display = 'none';
    
    document.getElementById('loginBox').style.display = 'block';
    document.getElementById('signupBox').style.display = 'none';
    document.getElementById('otpBox').style.display = 'none';
    
    // Clear forms
    document.getElementById('loginForm').reset();
    
    // Focus
    setTimeout(() => {
        const emailInput = document.getElementById('loginEmail');
        if (emailInput) emailInput.focus();
    }, 100);
}

function showSignup() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('userNavbar').style.display = 'none';
    
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('signupBox').style.display = 'block';
    document.getElementById('otpBox').style.display = 'none';
    
    // Clear forms
    document.getElementById('signupForm').reset();
    
    // Focus
    setTimeout(() => {
        const nameInput = document.getElementById('signupName');
        if (nameInput) nameInput.focus();
    }, 100);
}

function showOTP(email) {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('userNavbar').style.display = 'none';
    
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('signupBox').style.display = 'none';
    document.getElementById('otpBox').style.display = 'block';
    
    // Display email
    document.getElementById('otpEmailDisplay').textContent = email;
    otpEmail = email;
    
    // Clear OTP input
    const otpInput = document.getElementById('otpCode');
    if (otpInput) otpInput.value = '';
    
    // Focus
    setTimeout(() => {
        if (otpInput) otpInput.focus();
    }, 100);
}

function showMainApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('userNavbar').style.display = 'block';
    
    // Update user greeting
    const greeting = document.getElementById('userGreeting');
    if (greeting && currentUser) {
        greeting.innerHTML = `<i class="fas fa-user-circle me-2"></i>${currentUser.name}`;
    }
    
    // Auto-fill form if available
    if (currentUser) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        
        if (nameInput && emailInput) {
            nameInput.value = currentUser.name || '';
            emailInput.value = currentUser.email || '';
        }
    }
}

// ============================================
// FORM HANDLERS
// ============================================

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Signing in...';
    submitBtn.disabled = true;
    
    try {
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('benefitUsers') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            if (!user.verified) {
                alert('Please verify your email first. Check your inbox for OTP.');
                showOTP(email);
                return;
            }
            
            // Login successful
            currentUser = user;
            localStorage.setItem('benefitUser', JSON.stringify(user));
            
            alert('Login successful!');
            setTimeout(() => showMainApp(), 500);
            
        } else {
            alert('Invalid email or password');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
    } finally {
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating account...';
    submitBtn.disabled = true;
    
    try {
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('benefitUsers') || '[]');
        if (users.find(u => u.email === email)) {
            alert('User already exists! Please login instead.');
            setTimeout(() => showLogin(), 1500);
            return;
        }
        
        // Generate OTP
        otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Create temp user
        const tempUser = {
            name: name,
            email: email,
            password: password,
            verified: false,
            createdAt: new Date().toISOString()
        };
        
        // Send OTP via EmailJS
        const templateParams = {
            to_email: email,
            otp_code: otpCode,
            user_name: name,
            date: new Date().toLocaleDateString()
        };
        
        // Make sure EmailJS is initialized
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS not loaded');
        }
        
        await emailjs.send('service_r60hbpq', 'template_8hjqxzg', templateParams);
        
        // Store temp user in localStorage
        localStorage.setItem('tempUser', JSON.stringify(tempUser));
        
        alert('OTP sent to your email! Please check your inbox.');
        showOTP(email);
        
    } catch (error) {
        console.error('Signup error:', error);
        
        // Fallback for EmailJS errors
        if (error.message.includes('EmailJS') || error.message.includes('network')) {
            alert('Email service temporarily unavailable. Using demo mode.');
            // Use demo mode - auto verify
            otpCode = '123456'; // Demo OTP
            const tempUser = {
                name: name,
                email: email,
                password: password,
                verified: false,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('tempUser', JSON.stringify(tempUser));
            showOTP(email);
            alert('Demo mode: Use OTP 123456');
        } else {
            alert('Failed to create account. Please try again.');
        }
    } finally {
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleOTPVerification(e) {
    e.preventDefault();
    
    const enteredOTP = document.getElementById('otpCode').value.trim();
    
    if (!enteredOTP || enteredOTP.length !== 6) {
        alert('Please enter a valid 6-digit OTP');
        return;
    }
    
    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Verifying...';
    submitBtn.disabled = true;
    
    try {
        // Get temp user from localStorage
        const savedTempUser = JSON.parse(localStorage.getItem('tempUser'));
        
        if (!savedTempUser || savedTempUser.email !== otpEmail) {
            alert('Session expired. Please sign up again.');
            showSignup();
            return;
        }
        
        // Verify OTP
        if (enteredOTP === otpCode || enteredOTP === '123456') { // 123456 for demo mode
            // Mark as verified
            savedTempUser.verified = true;
            
            // Save to users list
            const users = JSON.parse(localStorage.getItem('benefitUsers') || '[]');
            users.push(savedTempUser);
            localStorage.setItem('benefitUsers', JSON.stringify(users));
            
            // Remove temp user
            localStorage.removeItem('tempUser');
            
            // Set as current user
            currentUser = savedTempUser;
            localStorage.setItem('benefitUser', JSON.stringify(savedTempUser));
            
            // Clear OTP data
            otpCode = null;
            otpEmail = null;
            
            alert('Email verified successfully!');
            setTimeout(() => showMainApp(), 1000);
            
        } else {
            alert('Invalid OTP code. Please try again.');
            // Clear OTP input
            document.getElementById('otpCode').value = '';
            document.getElementById('otpCode').focus();
        }
        
    } catch (error) {
        console.error('OTP verification error:', error);
        alert('Verification failed. Please try again.');
    } finally {
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function resendOTP() {
    if (!otpEmail) {
        alert('No email found. Please start signup again.');
        showSignup();
        return;
    }
    
    const resendBtn = document.getElementById('resendOtpBtn');
    const originalText = resendBtn.innerHTML;
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
    resendBtn.disabled = true;
    
    try {
        // Generate new OTP
        otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Get temp user for name
        const savedTempUser = JSON.parse(localStorage.getItem('tempUser'));
        const userName = savedTempUser ? savedTempUser.name : 'User';
        
        // Send OTP via EmailJS
        const templateParams = {
            to_email: otpEmail,
            otp_code: otpCode,
            user_name: userName,
            date: new Date().toLocaleDateString()
        };
        
        if (typeof emailjs !== 'undefined') {
            await emailjs.send('service_r60hbpq', 'template_8hjqxzg', templateParams);
            alert('New OTP sent to your email!');
        } else {
            // Demo mode
            otpCode = '123456';
            alert('Demo mode: Use OTP 123456');
        }
        
        // Reset OTP input
        document.getElementById('otpCode').value = '';
        document.getElementById('otpCode').focus();
        
    } catch (error) {
        console.error('Resend OTP error:', error);
        alert('Failed to resend OTP. Please try again.');
    } finally {
        // Restore button after delay
        setTimeout(() => {
            resendBtn.innerHTML = originalText;
            resendBtn.disabled = false;
        }, 2000);
    }
}

function logoutUser() {
    // Clear current user
    currentUser = null;
    localStorage.removeItem('benefitUser');
    
    // Clear any temp data
    localStorage.removeItem('tempUser');
    otpCode = null;
    otpEmail = null;
    
    // Reset main app form if exists
    const benefitForm = document.getElementById('benefitForm');
    if (benefitForm) {
        benefitForm.reset();
    }
    
    // Clear file uploads
    if (typeof resetForm === 'function') {
        resetForm();
    }
    
    alert('Logged out successfully');
    showLogin();
}

// ============================================
// PUBLIC FUNCTIONS (for other scripts)
// ============================================
function getCurrentUser() {
    return currentUser;
}

function isAuthenticated() {
    return currentUser !== null;
}

console.log('Authentication system loaded successfully');
