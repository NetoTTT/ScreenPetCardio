// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD-1Jy98ZHXn6NWy8X3OPYlEg6f9NAIqEE",
    authDomain: "petcardio-9cabf.firebaseapp.com",
    databaseURL: "https://petcardio-9cabf-default-rtdb.firebaseio.com",
    projectId: "petcardio-9cabf",
    storageBucket: "petcardio-9cabf.appspot.com",
    messagingSenderId: "409087895827",
    appId: "1:409087895827:web:aba715782324516f8e52e6",
    measurementId: "G-P0ZM04MDS5",
  };

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o serviço de autenticação
export const auth = getAuth(app);
