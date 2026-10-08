// IMPORTOWANIE MODUŁÓW FIREBASE (CDN ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// KONFIGURACJA FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyC-PD15Nzi0XmanNnvEbWXQP2EPMoR80dg",
  authDomain: "magazyn-git.firebaseapp.com",
  projectId: "magazyn-git",
  storageBucket: "magazyn-git.firebasestorage.app",
  messagingSenderId: "843079023139",
  appId: "1:843079023139:web:ff292d500078b5cde28f96",
  measurementId: "G-F9TBECLXSJ"
};

// Inicjalizacja głównych usług Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// POBRANIE ELEMENTÓW Z HTML
const loginSection = document.getElementById("login-screen");
const appSection = document.getElementById("aplikacja");
const loginForm = document.getElementById("formularz-logowania");
const logoutBtn = document.getElementById("logout-button");

const addItemForm = document.getElementById("add-item-form");
const inventoryList = document.getElementById("inventory-list");

// Zmienna przechowująca przypisaną kolekcję dla zalogowanego użytkownika
let aktywneDruzynaKolekcja = "";

// Zmienne do przechowywania funkcji odłączających nasłuchiwanie bazy na żywo
let unsubscribeAccess = null;
let unsubscribeInventory = null;

// ==========================================
// OBSŁUGA LOGOWANIA I "BEZPIECZEŃSTWA" (AUTH)
// ==========================================

onAuthStateChanged(auth, (user) => {
  if (user) {
    // UŻYTKOWNIK ZALOGOWANY
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");

    // Uruchamiamy sprawdzanie dostępu do drużyny/kolekcji
    SprawdzDostep();
  } else {
    // UŻYTKOWNIK WYLOGOWANY
    loginSection.classList.remove("hidden");
    appSection.classList.add("hidden");

    // Rozłączamy nasłuchiwania w bazie przy wylogowaniu
    if (unsubscribeAccess) unsubscribeAccess();
    if (unsubscribeInventory) unsubscribeInventory();
    
    aktywneDruzynaKolekcja = "";
  }
});

// Obsługa wysłania formularza logowania
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      loginForm.reset();
    })
    .catch((error) => {
      console.error("Szczegóły błędu:", error.message);
    });
});

// Wylogowanie
logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

// ==========================================
// OBSŁUGA WYKRYWANIA DOSTĘPU DO MAGAZYNÓW
// ==========================================

function SprawdzDostep() {
  const userEmail = auth.currentUser?.email;
  const displayDruzyna = document.getElementById("display-druzyna");

  if (!userEmail) {
    if (displayDruzyna) displayDruzyna.innerHTML = "Brak zalogowanego użytkownika";
    return;
  }

  // Zapytanie do kolekcji "access" o wpis dla e-maila zalogowanego użytkownika
  const accessQuery = query(
    collection(db, "access"), 
    where("email", "==", userEmail)
  );

  unsubscribeAccess = onSnapshot(accessQuery, (snapshot) => {
    
    if (snapshot.empty) {
      if (displayDruzyna) displayDruzyna.innerHTML = "Brak dostępu";
      inventoryList.innerHTML = `<tr><td colspan="4" class="text-center">Brak przypisanej bazy do tego konta</td></tr>`;
      
      if (unsubscribeInventory) unsubscribeInventory();
      aktywneDruzynaKolekcja = "";
      return;
    }

    // Odczytujemy nazwę kolekcji przypisanej w dokumentach "access"
    const docData = snapshot.docs[0].data();
    aktywneDruzynaKolekcja = docData.kolekcja;

    // Wyświetlamy nazwę kolekcji w nagłówku
    if (displayDruzyna) {
      displayDruzyna.innerHTML = aktywneDruzynaKolekcja;
    }

    // Ładujemy dane z przypisanej bazy
    sluchajZmianWBazie(aktywneDruzynaKolekcja);
  }, (error) => {
    console.error("Błąd podczas sprawdzania dostępu:", error);
    if (displayDruzyna) displayDruzyna.innerHTML = "Błąd uprawnień";
  });
}

// ==========================================
// OBSŁUGA BAZY DANYCH FIRESTORE
// ==========================================

// A. DODAWANIE NOWEGO PRZEDMIOTU
addItemForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!aktywneDruzynaKolekcja) {
    alert("Błąd: Brak przypisanej bazy magazynowej!");
    return;
  }

  const customId = document.getElementById("item-id").value;
  const name = document.getElementById("item-name").value;
  const unit = document.getElementById("item-unit").value;
  const qty = parseInt(document.getElementById("item-quantity").value, 10);

  try {
    // Dodawanie przedmiotu do dynamicznie wyznaczonej kolekcji
    await addDoc(collection(db, aktywneDruzynaKolekcja), {
      id: customId,
      nazwa: name,
      rodzajPakowania: unit,
      stanLiczbowy: qty
    });

    addItemForm.reset();
  } catch (error) {
    alert("Błąd podczas zapisywania w bazie: " + error.message);
  }
});

// B. ODCZYTYWANIE I OŚWIEŻANIE DANYCH W CZASIE RZECZYWISTYM
function sluchajZmianWBazie(nazwaKolekcji) {
  if (unsubscribeInventory) {
    unsubscribeInventory();
  }

  const kolekcjaRef = collection(db, nazwaKolekcji);

  unsubscribeInventory = onSnapshot(kolekcjaRef, (snapshot) => {
    inventoryList.innerHTML = "";

    if (snapshot.empty) {
      inventoryList.innerHTML = `<tr><td colspan="4" class="text-center">Brak przedmiotów w magazynie</td></tr>`;
      return;
    }

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><strong>${data.id || "-"}</strong></td>
        <td>${data.nazwa || "-"}</td>
        <td>${data.rodzajPakowania || "-"}</td>
        <td>${data.stanLiczbowy ?? 0}</td>
      `;

      inventoryList.appendChild(tr);
    });
  }, (error) => {
    inventoryList.innerHTML = `<tr><td colspan="4" class="text-center">Błąd odczytu bazy: ${nazwaKolekcji}</td></tr>`;
    console.error("Błąd Firestore:", error);
  });
}