// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNMCXgdl5Pd5ugo4KWcEiGEXF3ORgxREk",
  authDomain: "central-transportes-usa.firebaseapp.com",
  projectId: "central-transportes-usa",
  storageBucket: "central-transportes-usa.firebasestorage.app",
  messagingSenderId: "137292588",
  appId: "1:137292588:web:eaae49662b9394f8cfda89",
  measurementId: "G-RRQ6ZXT7VG"
};

// Initialize Firebase if not already initialized
let app;
let analytics;
let firestoreDb;

try {
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
        if (typeof firebase.analytics === 'function') {
            analytics = firebase.analytics();
        }
    } else {
        app = firebase.app();
    }
    
    if (typeof firebase.firestore === 'function') {
        firestoreDb = firebase.firestore();
        
        // Ativar persistência offline para melhor performance e resiliência
        firestoreDb.enablePersistence().catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Persistência offline falhou: abas múltiplas abertas');
            } else if (err.code == 'unimplemented') {
                console.warn('Persistência offline não suportada por este navegador');
            }
        });
    }
} catch (e) {
    console.error("Erro ao inicializar o Firebase:", e);
}
