// ============================================
// CONFIGURATION
// ============================================
const N8N_WEBHOOK_URL = 'https://mohitpillai12346.app.n8n.cloud/webhook/9f091cf5-2629-4342-8b07-41c42601028b';
let uploadedFiles = {
    applicationPdf: null,
    supportingPdf: null
};

// ============================================
// FILE UPLOAD HANDLERS
// ============================================

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

// ============================================
// MAIN FUNCTION: SEND TO N8N (REAL CONNECTION ONLY)
// ============================================
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
        
        // IMPORTANT: Only real connection to n8n
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
        
        // Only display what comes from n8n
        displayResponse(responseText, name, email, issueType);
        
    } catch (error) {
        console.error('Error connecting to n8n:', error);
        showError(`Cannot connect to processing system. Error: ${error.message}`);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// ============================================
// DISPLAY RESPONSE (ONLY FROM N8N)
// ============================================
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
    
    // Process ONLY the n8n response (no demo data)
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
        
        // Display raw text from n8n
        resultDescription.innerHTML = formatText(responseText);
        
        // Simple display for non-JSON responses
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

// ============================================
// ERROR HANDLING (REAL ERRORS ONLY)
// ============================================
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

function resetForm() {
    document.getElementById('benefitForm').reset();
    uploadedFiles = { applicationPdf: null, supportingPdf: null };
    document.getElementById('applicationFileList').innerHTML = '';
    document.getElementById('supportingFileList').innerHTML = '';
    document.getElementById('resultBox').style.display = 'none';
    document.getElementById('errorBox').style.display = 'none';
}

// ============================================
// INITIALIZATION
// ============================================
document.getElementById('benefitForm').addEventListener('submit', function(event) {
    event.preventDefault();
    submitToN8n();
});

// Add Font Awesome if not present
if (!document.querySelector('link[href*="font-awesome"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(link);
}

console.log('Application portal ready - Connecting only to n8n');
console.log('Webhook:', N8N_WEBHOOK_URL);

// Test n8n connection on page load
async function testN8nConnection() {
    try {
        console.log('Testing n8n connection...');
        const testResponse = await fetch(N8N_WEBHOOK_URL, { 
            method: 'HEAD',
            mode: 'no-cors' // Just to test if endpoint exists
        });
        console.log('n8n endpoint reachable');
    } catch (error) {
        console.warn('Cannot reach n8n endpoint. Make sure:');
        console.warn('1. n8n workflow is active (green toggle)');
        console.warn('2. Webhook URL is correct');
    }
}

// Uncomment to test connection on load
// testN8nConnection();