// ============================================
// EMAILJS CONFIGURATION - WITH YOUR KEYS!
// ============================================

// EmailJS Configuration - USING YOUR PROVIDED KEYS
const EMAILJS_CONFIG = {
    SERVICE_ID: "service_r60hbpq",      // Your Service ID
    TEMPLATE_ID: "template_8hjqxzg",    // Your Template ID
    PUBLIC_KEY: "Cr8Skylldo6vUX6ae"     // Your Public Key from image
};

// Initialize EmailJS
(function() {
    if (EMAILJS_CONFIG.PUBLIC_KEY) {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        console.log("✅ EmailJS initialized with Public Key:", EMAILJS_CONFIG.PUBLIC_KEY);
    } else {
        console.warn("⚠️ EmailJS Public Key not configured");
    }
})();

// ============================================
// AUTHENTICATION SYSTEM WITH OTP
// ============================================

// User storage
const users = JSON.parse(localStorage.getItem('benefit_users') || '{}');
let currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');

// OTP variables
let otpCode = null;
let otpExpiry = null;
let pendingUser = null;
let otpTimer = null;

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Benefit Portal Loading...');
    console.log('EmailJS Config:', EMAILJS_CONFIG);
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Setup auth event listeners
    setupAuthEvents();
    
    // Setup OTP input handling
    setupOTPInputs();
    
    // Clear any pending OTP sessions
    localStorage.removeItem('pending_otp');
});

// Check authentication status
function checkAuthStatus() {
    if (currentUser) {
        showMainApp();
        autoFillUserData(currentUser);
    } else {
        showLogin();
    }
}

// Setup auth event listeners
function setupAuthEvents() {
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
}

// Show login form
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

// Show signup form
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

// Show OTP verification
function showOTP(email) {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('userNavbar').style.display = 'none';
    
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('signupBox').style.display = 'none';
    document.getElementById('otpBox').style.display = 'block';
    
    // Display email
    document.getElementById('otpEmailDisplay').textContent = email;
    
    // Clear OTP input
    document.getElementById('otpCode').value = '';
    
    // Start OTP timer
    startOTPTimer();
    
    // Focus on OTP input
    setTimeout(() => {
        const otpInput = document.getElementById('otpCode');
        if (otpInput) otpInput.focus();
    }, 100);
}

// Show main application
function showMainApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('userNavbar').style.display = 'block';
    
    // Update user greeting
    const greeting = document.getElementById('userGreeting');
    if (greeting && currentUser) {
        greeting.innerHTML = `<i class="fas fa-user-circle me-2"></i>${currentUser.name}`;
    }
    
    // Auto-fill form
    if (currentUser) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        
        if (nameInput && emailInput) {
            nameInput.value = currentUser.name || '';
            emailInput.value = currentUser.email || '';
        }
    }
}

// Handle login
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

// Handle signup
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
        
        await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);
        
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

// Setup OTP inputs
function setupOTPInputs() {
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
        
        otpInput.addEventListener('keydown', function(e) {
            // Allow backspace, delete, tab, etc.
            if ([8, 9, 13, 27, 46].includes(e.keyCode) || 
                (e.keyCode >= 37 && e.keyCode <= 40)) {
                return;
            }
            
            // Allow numbers
            if ((e.keyCode >= 48 && e.keyCode <= 57) || 
                (e.keyCode >= 96 && e.keyCode <= 105)) {
                return;
            }
            
            e.preventDefault();
        });
    }
}

// Handle OTP verification
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

// Start OTP timer
function startOTPTimer() {
    clearInterval(otpTimer);
    
    const timerElement = document.getElementById('otpTimer');
    const resendElement = document.getElementById('resendOtpText');
    
    // Show timer, hide resend
    if (timerElement) timerElement.style.display = 'block';
    if (resendElement) resendElement.style.display = 'none';
    
    let timeLeft = 120; // 2 minutes in seconds
    
    otpTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        if (timerElement) {
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(otpTimer);
            if (timerElement) timerElement.style.display = 'none';
            if (resendElement) resendElement.style.display = 'block';
        }
    }, 1000);
}

// Resend OTP
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
            await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);
            alert('New OTP sent to your email!');
        } else {
            // Demo mode
            otpCode = '123456';
            alert('Demo mode: Use OTP 123456');
        }
        
        // Reset OTP input
        document.getElementById('otpCode').value = '';
        document.getElementById('otpCode').focus();
        
        // Restart timer
        startOTPTimer();
        
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

// Logout user
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

// Auto-fill user data in form
function autoFillUserData(user) {
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    
    if (nameField && !nameField.value) {
        nameField.value = user.name || '';
    }
    if (emailField && !emailField.value) {
        emailField.value = user.email || '';
    }
}

// ============================================
// ORIGINAL APPLICATION CODE (UNCHANGED)
// ============================================

const N8N_WEBHOOK_URL = 'https://mohitpillai12346.app.n8n.cloud/webhook/9f091cf5-2629-4342-8b07-41c42601028b';
let uploadedFiles = {
    applicationPdf: null,
    supportingPdf: null
};

// Handle Application PDF upload
document.getElementById('applicationPdf').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File too large. Maximum 5MB.');
            return;
        }
        
        uploadedFiles.applicationPdf = file;
        displayFile('applicationFileList', file, 'application');
    }
});

// Handle Supporting PDF upload
document.getElementById('supportingPdf').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File too large. Maximum 5MB.');
            return;
        }
        
        uploadedFiles.supportingPdf = file;
        displayFile('supportingFileList', file, 'supporting');
    }
});

// Display uploaded file
function displayFile(containerId, file, type) {
    const container = document.getElementById(containerId);
    const fileSize = (file.size / (1024 * 1024)).toFixed(2);
    
    container.innerHTML = `
        <div class="file-item">
            <i class="fas fa-file-pdf text-danger me-2"></i>
            <span>${file.name} (${fileSize} MB)</span>
            <button type="button" class="btn btn-sm btn-link text-danger ms-2" onclick="removeFile('${type}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

// Remove file
function removeFile(type) {
    if (type === 'application') {
        uploadedFiles.applicationPdf = null;
        document.getElementById('applicationPdf').value = '';
        document.getElementById('applicationFileList').innerHTML = '';
    } else {
        uploadedFiles.supportingPdf = null;
        document.getElementById('supportingPdf').value = '';
        document.getElementById('supportingFileList').innerHTML = '';
    }
}

// MAIN FUNCTION: SEND TO N8N
async function submitToN8n() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const issueType = document.getElementById('issueType').value;
    
    if (!name || !email || !issueType) {
        alert('Please fill all required fields');
        return;
    }
    
    if (!uploadedFiles.applicationPdf) {
        alert('Please upload the Application Form PDF');
        return;
    }
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('resultBox').style.display = 'none';
    document.getElementById('errorBox').style.display = 'none';
    
    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('issueType', issueType);
        formData.append('applicationPdf', uploadedFiles.applicationPdf);
        
        if (uploadedFiles.supportingPdf) {
            formData.append('supportingPdf', uploadedFiles.supportingPdf);
        }
        
        console.log('Sending to n8n...');
        
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('n8n error response:', errorText);
            throw new Error(`Server returned error: ${response.status}`);
        }
        
        const responseText = await response.text();
        console.log('n8n response:', responseText);
        
        displayResponse(responseText, name, email, issueType);
        
    } catch (error) {
        console.error('Error connecting to n8n:', error);
        showError(`Cannot connect to processing system. Error: ${error.message}`);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// DISPLAY RESPONSE
function displayResponse(responseText, name, email, issueType) {
    const resultBox = document.getElementById('resultBox');
    const resultHeader = document.getElementById('resultHeader');
    const resultTitle = document.getElementById('resultTitle');
    const resultDescription = document.getElementById('resultDescription');
    const applicantInfo = document.getElementById('applicantInfo');
    const documentsInfo = document.getElementById('documentsInfo');
    const applicationId = document.getElementById('applicationId');
    
    // Generate ID
    const appId = 'APP-' + Date.now().toString().slice(-6);
    applicationId.textContent = `Reference: ${appId}`;
    
    // Set basic info
    applicantInfo.innerHTML = `
        <strong>Name:</strong> ${name}<br>
        <strong>Email:</strong> ${email}<br>
        <strong>Assistance Type:</strong> ${issueType}
    `;
    
    // Set documents info
    let docsHtml = `✓ Application Form: ${uploadedFiles.applicationPdf.name}`;
    if (uploadedFiles.supportingPdf) {
        docsHtml += `<br>✓ Supporting Document: ${uploadedFiles.supportingPdf.name}`;
    }
    documentsInfo.innerHTML = docsHtml;
    
    // Process ONLY the n8n response
    resultHeader.className = 'card-header bg-light';
    resultTitle.innerHTML = 'Application Analysis';
    resultTitle.className = 'h3 text-dark';
    
    // Try JSON first
    try {
        const data = JSON.parse(responseText);
        
        // Get explanation from n8n response
        let explanation = '';
        if (data.explanation) {
            explanation = data.explanation;
        } else if (data.message) {
            explanation = data.message;
        } else if (data.text) {
            explanation = data.text;
        } else if (data.reason) {
            explanation = data.reason;
        } else {
            // If no clear explanation field, show the whole JSON
            explanation = JSON.stringify(data, null, 2);
        }
        
        // Display explanation from n8n
        resultDescription.innerHTML = formatText(explanation);
        
        // Display factors from n8n
        const factorsList = document.getElementById('factorsList');
        if (data.factors && Array.isArray(data.factors)) {
            factorsList.innerHTML = data.factors.map(factor => `
                <div class="list-group-item">
                    <strong>${factor.name || 'Factor'}:</strong> ${factor.description || ''}
                </div>
            `).join('');
        } else {
            factorsList.innerHTML = `
                <div class="list-group-item">
                    <em>Analysis complete</em>
                </div>
            `;
        }
        
        // Display next steps from n8n
        const nextSteps = document.getElementById('nextSteps');
        if (data.nextSteps && Array.isArray(data.nextSteps)) {
            nextSteps.innerHTML = data.nextSteps.map(step => `
                <li class="list-group-item">${step}</li>
            `).join('');
        } else {
            nextSteps.innerHTML = `
                <li class="list-group-item">Await official communication</li>
            `;
        }
        
    } catch (e) {
        // If not JSON, display as plain text from n8n
        console.log('Displaying n8n response as plain text');
        
        resultDescription.innerHTML = formatText(responseText);
        
        document.getElementById('factorsList').innerHTML = `
            <div class="list-group-item">
                <em>Response received</em>
            </div>
        `;
        
        document.getElementById('nextSteps').innerHTML = `
            <li class="list-group-item">Review the explanation above</li>
        `;
    }
    
    // Show result
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth' });
}

// Simple text formatting
function formatText(text) {
    if (!text) return '<p class="text-muted">No response from processing system.</p>';
    
    return text
        .replace(/\\n/g, '\n')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// ERROR HANDLING
function showError(message) {
    const errorBox = document.getElementById('errorBox');
    errorBox.innerHTML = `
        <div class="alert alert-danger">
            <h6><i class="fas fa-exclamation-triangle me-2"></i>System Error</h6>
            <p>${message}</p>
            <p class="mb-0 small">Check if n8n workflow is active and accepts multipart/form-data.</p>
        </div>
    `;
    errorBox.style.display = 'block';
}

// Reset form
function resetForm() {
    document.getElementById('benefitForm').reset();
    uploadedFiles = { applicationPdf: null, supportingPdf: null };
    document.getElementById('applicationFileList').innerHTML = '';
    document.getElementById('supportingFileList').innerHTML = '';
    document.getElementById('resultBox').style.display = 'none';
    document.getElementById('errorBox').style.display = 'none';
}

// Form submission handler
document.getElementById('benefitForm').addEventListener('submit', function(event) {
    event.preventDefault();
    submitToN8n();
});

// ============================================
// INITIALIZATION MESSAGE
// ============================================
console.log('Benefit Portal initialized');
console.log('N8N Webhook URL:', N8N_WEBHOOK_URL);
console.log('✅ EmailJS Service ID:', EMAILJS_CONFIG.SERVICE_ID);
console.log('✅ EmailJS Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
console.log('✅ EmailJS Public Key configured');

// Test n8n connection on page load
async function testN8nConnection() {
    try {
        console.log('Testing n8n connection...');
        const testResponse = await fetch(N8N_WEBHOOK_URL, { 
            method: 'HEAD',
            mode: 'no-cors'
        });
        console.log('✅ n8n endpoint reachable');
    } catch (error) {
        console.warn('⚠️ Cannot reach n8n endpoint. Make sure:');
        console.warn('1. n8n workflow is active (green toggle)');
        console.warn('2. Webhook URL is correct');
    }
}

// Uncomment to test connection on load
// testN8nConnection();
