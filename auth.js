// auth.js
// EmailJS Configuration
(function() {
    emailjs.init("Cr8Skylldo6vUX6ae");
})();

// Global state
let currentUser = null;
let otpVerificationCode = null;
let otpEmail = null;

// DOM Elements
const authForms = {
    login: document.getElementById('loginForm'),
    signup: document.getElementById('signupForm'),
    otp: document.getElementById('otpForm')
};

// Check if user is logged in
function checkAuthState() {
    const user = JSON.parse(localStorage.getItem('benefitUser'));
    if (user) {
        currentUser = user;
        updateUIForLoggedInUser();
    } else {
        showLoginPage();
    }
}

// Login Function
async function loginUser(email, password) {
    try {
        // For demo purposes - in production, use Firebase Auth
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            if (!user.emailVerified) {
                alert('Please verify your email first. Check your inbox for OTP.');
                return false;
            }
            
            currentUser = user;
            localStorage.setItem('benefitUser', JSON.stringify(user));
            updateUIForLoggedInUser();
            return true;
        } else {
            alert('Invalid email or password');
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
        return false;
    }
}

// Signup Function
async function signupUser(name, email, password) {
    try {
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            alert('User already exists. Please login instead.');
            return false;
        }
        
        // Store user temporarily
        otpEmail = email;
        const tempUser = {
            name: name,
            email: email,
            password: password,
            emailVerified: false,
            createdAt: new Date().toISOString()
        };
        
        // Generate OTP
        otpVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Send OTP via EmailJS
        const templateParams = {
            to_email: email,
            otp_code: otpVerificationCode,
            user_name: name
        };
        
        await emailjs.send('service_r60hbpq', 'template_8hjqxzg', templateParams);
        
        // Store temporary user in localStorage
        localStorage.setItem('tempUser', JSON.stringify(tempUser));
        
        // Show OTP verification form
        showOTPForm();
        document.getElementById('otpEmail').textContent = email;
        
        return true;
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
        return false;
    }
}

// Verify OTP
function verifyOTP(otp) {
    if (otp === otpVerificationCode) {
        // Get temporary user
        const tempUser = JSON.parse(localStorage.getItem('tempUser'));
        if (tempUser && tempUser.email === otpEmail) {
            // Mark email as verified
            tempUser.emailVerified = true;
            
            // Save to users list
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            users.push(tempUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Remove temporary data
            localStorage.removeItem('tempUser');
            
            // Set as current user
            currentUser = tempUser;
            localStorage.setItem('benefitUser', JSON.stringify(tempUser));
            
            // Update UI
            updateUIForLoggedInUser();
            
            // Clear OTP data
            otpVerificationCode = null;
            otpEmail = null;
            
            return true;
        }
    }
    
    alert('Invalid OTP. Please try again.');
    return false;
}

// Resend OTP
async function resendOTP() {
    if (!otpEmail) return;
    
    try {
        otpVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        const tempUser = JSON.parse(localStorage.getItem('tempUser'));
        const templateParams = {
            to_email: otpEmail,
            otp_code: otpVerificationCode,
            user_name: tempUser?.name || 'User'
        };
        
        await emailjs.send('service_r60hbpq', 'template_8hjqxzg', templateParams);
        alert('New OTP sent to your email.');
    } catch (error) {
        console.error('Resend OTP error:', error);
        alert('Failed to resend OTP. Please try again.');
    }
}

// Logout Function
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('benefitUser');
    showLoginPage();
}

// UI Functions
function updateUIForLoggedInUser() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('userGreeting').textContent = `Welcome, ${currentUser.name}`;
}

function showLoginPage() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('signupSection').style.display = 'none';
    document.getElementById('otpSection').style.display = 'none';
}

function showSignupPage() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('signupSection').style.display = 'block';
    document.getElementById('otpSection').style.display = 'none';
}

function showOTPForm() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('signupSection').style.display = 'none';
    document.getElementById('otpSection').style.display = 'block';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state
    checkAuthState();
    
    // Login form submission
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            loginUser(email, password);
        });
    }
    
    // Signup form submission
    if (document.getElementById('signupForm')) {
        document.getElementById('signupForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters long!');
                return;
            }
            
            signupUser(name, email, password);
        });
    }
    
    // OTP form submission
    if (document.getElementById('otpForm')) {
        document.getElementById('otpForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const otp = document.getElementById('otpInput').value;
            if (otp.length === 6) {
                verifyOTP(otp);
            } else {
                alert('Please enter a 6-digit OTP');
            }
        });
    }
    
    // Navigation buttons
    const showSignupBtn = document.getElementById('showSignup');
    const showLoginBtn = document.getElementById('showLogin');
    const backToSignupBtn = document.getElementById('backToSignup');
    
    if (showSignupBtn) showSignupBtn.addEventListener('click', showSignupPage);
    if (showLoginBtn) showLoginBtn.addEventListener('click', showLoginPage);
    if (backToSignupBtn) backToSignupBtn.addEventListener('click', showSignupPage);
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
    
    // Resend OTP button
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    if (resendOtpBtn) resendOtpBtn.addEventListener('click', resendOTP);
});

// Export functions for use in other files
window.authFunctions = {
    loginUser,
    signupUser,
    logoutUser,
    verifyOTP,
    checkAuthState,
    getCurrentUser: () => currentUser
};
