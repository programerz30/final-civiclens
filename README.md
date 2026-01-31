# final-civiclens
# Appeal Analyzer

A web app that helps users understand why their benefit applications got rejected and what to fix.

## What it does

Users upload their rejection letters and applications as PDFs. The app analyzes them and gives:
- Main reasons for rejection
- Missing documents list
- Step-by-step fix guide
- Deadline reminders

## Files


project/
├── index.html          # Login page
├── dashboard.html      # Main page after login
├── analyze.html       # Upload & analysis page
├── css/
│   └── style.css      # Styles
├── js/
│   ├── auth.js        # Login logic
│   ├── upload.js      # File handling
│   └── analyze.js     # Analysis logic
└── assets/            # Images, samples


## Quick Start

1. Download the files
2. Open index.html in a browser
3. Login with:
   - Email: demo@example.com
   - Password: demo123

Or use a local server:
bash
python -m http.server 8000
# Open http://localhost:8000


## How to use

1. *Login* with test credentials
2. *Upload* your rejection letter (PDF)
3. *Get analysis* of why it was rejected
4. *See checklist* of what to fix
5. *Download* improvement guide

## Tech used

- HTML, CSS, JavaScript
- Bootstrap 5 for layout
- LocalStorage for user data
- Client-side file handling

## Features

- Drag-and-drop file upload
- Mobile-friendly design
- Simple login system
- Instant analysis (simulated)
- Downloadable checklists
- Application history
- Added OTP Feature

## For the hackathon

- Built in 9 hours
- No backend needed
- All processing is simulated
- Data stays in your browser
- Easy to extend

## If we had more time

We'd add:
- Real PDF text reading
- Email notifications
- More rejection scenarios
- Better user accounts

## Team

Built by Inception for Hackiet

---
*Note*: This is a prototype. Analysis is simulated for demo purposes.
