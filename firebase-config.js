// firebase-config.js
const firebaseConfig = {
    apiKey: "AIZaSyCj6KmcvgfVxCFTpjsL1GhpEVTMQH6OLAk",
    authDomain: "web-6ef07.firebaseapp.com",
    projectId: "web-6ef07",
    storageBucket: "web-6ef07.firebasestorage.app",
    messagingSenderId: "1028816794584",
    appId: "1:1028816794584:web:792e488366197446d778ad",
    measurementId: "G-TB7WB1E17B"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const analytics = firebase.analytics();
