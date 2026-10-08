# 🏕️ Harcerski System Magazynowy

Prosta i lekka aplikacja internetowa do zarządzania ekwipunkiem harcerskim w czasie rzeczywistym. System umożliwia logowanie użytkowników, dynamiczne przydzielanie dostępu do konkretnego magazynu oraz bieżące podglądanie i dodawanie stanu sprzętowego.

---

## ⚠️ Nota Prawna i Prawa Autorskie

- **Niezależność projektu:** Projekt jest inicjatywą w pełni niezależną i **nie jest w żaden sposób powiązany, oficjalnie wspierany ani afiliowany z Związkiem Harcerstwa Polskiego (ZHP)** ani żadną inną organizacją harcerską.
- **Autorstwo i Redystrybucja:** W przypadku jakiejkolwiek redystrybucji kodu, tworzenia forków, modyfikacji lub projektów pochodnych opartych na tym kodzie, **proszę o obowiązkowe zachowanie informacji o oryginalnym autorze**.

---

## 🚀 Funkcje

- **Autoryzacja użytkowników:** Logowanie za pomocą Firebase Authentication (e-mail i hasło).
- **Dynamiczny dostęp (Kolekcja `access`):** Po zalogowaniu system automatycznie sprawdza adres e-mail i przypisuje użytkownikowi odpowiednią bazę magazynową.
- **Aktualizacja w czasie rzeczywistym:** Wykorzystanie funkcji `onSnapshot` z Firestore sprawia, że wszystkie zmiany w bazie są natychmiast widoczne na stronie bez konieczności odświeżania.
- **Dodawanie sprzętu:** Formularz pozwalający na dodawanie nowych przedmiotów wraz z unikalnym ID, nazwą, rodzajem pakowania oraz stanem liczbowym.
- **Responsywny interfejs:** Układ dostosowany do urządzeń mobilnych oraz komputerów stacjonarnych.

---

## 🛠️ Technologie

- **Frontend:** HTML, CSS, JavaScript
- **Backend / Baza danych:** Firebase
- **Firebase Authentication** – obsługa kont użytkowników
- **Cloud Firestore** – baza danych w czasie rzeczywistym
