# 🧪 DETALJNE TESTING INSTRUKCIJE

## 🚀 PRE TESTIRANJA - SVJEŽE OKRUŽENJE

```bash
# 1. Pull latest changes
git pull origin claude/accounting-software-bih-rs-011CUpYD3pkDWjEs7u7W45on

# 2. Stop sve i obriši stare podatke
docker-compose down -v

# 3. Rebuild i pokreni
docker-compose up --build
```

**SAČEKAJ 2-3 MINUTE** da backend pokrene migracije i seed-uje bazu!

---

## 📋 PREGLED TESTIRANJA

### ✅ Trebam testirati:
1. Login stranica
2. Dashboard stranica
3. Companies CRUD (Create, Read, Update, Delete)
4. Chart of Accounts CRUD
5. Partners CRUD
6. Navigation između stranica
7. Automatski API tests

---

## 1️⃣ TEST LOGIN STRANICE

**URL:** http://localhost:5173

### Šta testirati:
- [ ] Stranica se učitava
- [ ] Vidim login formu
- [ ] Default credentials su popunjeni

### Test Case 1: Uspješan login
```
Email: admin@accounting-bih.com
Password: Admin123!
```
**Očekivani rezultat:** Redirect na /dashboard

### Test Case 2: Pogrešan password
```
Email: admin@accounting-bih.com
Password: wrong_password
```
**Očekivani rezultat:** Error poruka "Login failed"

---

## 2️⃣ TEST DASHBOARD STRANICE

**URL:** http://localhost:5173/dashboard

### Šta testirati:
- [ ] Stranica se učitava
- [ ] Vidim "Dashboard" naslov
- [ ] Vidim 3 kartice sa statistikom:
  - Companies: 2
  - Backend Status: Connected
  - Active Users: 1
- [ ] Vidim listu dostupnih modula

---

## 3️⃣ TEST COMPANIES STRANICE

**URL:** http://localhost:5173/companies

### Šta testirati:
- [ ] Stranica se učitava
- [ ] Vidim "Companies" naslov
- [ ] Vidim 2 kompanije u tabeli:
  - Demo d.o.o. Banja Luka (RS)
  - Demo d.o.o. Sarajevo (FBiH)

### Test Case 1: CREATE company
1. Klikni **+ Create Company**
2. Modal se otvara
3. Popuni:
   - Name: Test Company
   - Tax ID: 4400000999999
   - Registration Number: 1234567890
   - Legal Entity: RS
   - Email: test@test.com
   - Phone: +387 51 111 222
4. Klikni **Save**

**Očekivani rezultat:**
- Modal se zatvara
- Toast notification: "Company created successfully!"
- Nova kompanija se pojavljuje u tabeli

### Test Case 2: EDIT company
1. Klikni **Edit** na "Test Company"
2. Modal se otvara sa popunjenim podacima
3. Promijeni Name na "Test Company (Updated)"
4. Klikni **Save**

**Očekivani rezultat:**
- Modal se zatvara
- Toast notification: "Company updated successfully!"
- Ime kompanije je promijenjeno u tabeli

### Test Case 3: DELETE company
1. Klikni **Delete** na "Test Company (Updated)"
2. Confirm dialog se pojavljuje
3. Klikni **OK**

**Očekivani rezultat:**
- Toast notification: "Company deleted successfully!"
- Kompanija nestaje iz tabele

---

## 4️⃣ TEST CHART OF ACCOUNTS STRANICE

**URL:** http://localhost:5173/accounts

### Šta testirati:
- [ ] Stranica se učitava
- [ ] Vidim "Chart of Accounts" naslov
- [ ] Vidim company selector dropdown
- [ ] Selektujem "Demo d.o.o. Banja Luka"
- [ ] Vidim ~11 accounts u tabeli:
  - 100000 - AKTIVA
  - 101000 - Gotovina
  - 101100 - Gotovina u blagajni
  - ... itd

### Test Case 1: CREATE account
1. Odaberi kompaniju
2. Klikni **+ Create Account**
3. Modal se otvara
4. Popuni:
   - Code: 999001 (6 digits!)
   - Name: Test Account
   - Name (English): Test Account EN
   - Type: ASSET
5. Klikni **Save**

**Očekivani rezultat:**
- Modal se zatvara
- Toast notification: "Account created!"
- Novi account se pojavljuje u tabeli

### Test Case 2: DELETE account
1. Klikni **Delete** na "999001 - Test Account"
2. Confirm dialog
3. Klikni **OK**

**Očekivani rezultat:**
- Toast notification: "Account deleted!"
- Account nestaje iz tabele

---

## 5️⃣ TEST PARTNERS STRANICE

**URL:** http://localhost:5173/partners

### Šta testirati:
- [ ] Stranica se učitava
- [ ] Vidim "Partners" naslov
- [ ] Vidim company selector
- [ ] Vidim filter dropdown (All/Customers/Suppliers)
- [ ] Selektujem kompaniju
- [ ] Vidim 4 partnera:
  - Kupac jedan d.o.o. (CUSTOMER)
  - Kupac dva d.o.o. (CUSTOMER)
  - Dobavljač jedan d.o.o. (SUPPLIER)
  - Partner univerzalni d.o.o. (BOTH)

### Test Case 1: FILTER partners
1. Odaberi "Customers" iz filtera

**Očekivani rezultat:**
- Vidim samo 2 kupca (+ 1 BOTH)

2. Odaberi "Suppliers" iz filtera

**Očekivani rezultat:**
- Vidim samo 1 dobavljača (+ 1 BOTH)

### Test Case 2: CREATE partner
1. Klikni **+ Create Partner**
2. Popuni:
   - Name: Test Partner
   - Tax ID: 4400000888888
   - Type: CUSTOMER
   - Email: test@partner.com
   - Phone: +387 51 222 333
   - Address: Test Adresa 1
   - City: Banja Luka
3. Klikni **Save**

**Očekivani rezultat:**
- Toast notification: "Partner created!"
- Novi partner u tabeli

### Test Case 3: EDIT partner
1. Klikni **Edit** na "Test Partner"
2. Promijeni Name na "Test Partner (Updated)"
3. Klikni **Save**

**Očekivani rezultat:**
- Toast notification: "Partner updated!"
- Ime promijenjeno

### Test Case 4: DELETE partner
1. Klikni **Delete** na "Test Partner (Updated)"
2. Confirm
3. OK

**Očekivani rezultat:**
- Toast notification: "Partner deleted!"
- Nestaje iz tabele

---

## 6️⃣ TEST NAVIGATION

### Šta testirati:
- [ ] Klikni na **Dashboard** - stranica se učitava
- [ ] Klikni na **Companies** - stranica se učitava
- [ ] Klikni na **Chart of Accounts** - stranica se učitava
- [ ] Klikni na **Partners** - stranica se učitava
- [ ] Klikni na **Employees** - vidi "Coming soon..."
- [ ] Klikni na **Payroll** - vidi "Coming soon..."
- [ ] Klikni na **Cost Centers** - vidi "Coming soon..."
- [ ] Klikni na **Reports** - vidi "Coming soon..."

### Test Case: Browser back/forward
1. Navigate: Dashboard → Companies → Accounts
2. Klikni browser **Back** button
3. Klikni browser **Forward** button

**Očekivani rezultat:**
- Stranice se učitavaju ispravno
- Nema grešaka u console-u

---

## 7️⃣ AUTOMATSKI API TESTS

**URL:** http://localhost:5173/test

### Šta testirati:
1. Klikni **🧪 Run Tests** u sidebaru
2. Stranica se učitava
3. Klikni **Run All Tests** button
4. Gledaj kako testovi prolaze

**Očekivani rezultat:**
Svi testovi trebaju biti ✅ zeleni:
- [ ] GET /companies
- [ ] GET /companies/:id
- [ ] GET /accounts
- [ ] GET /partners
- [ ] POST /partners (create)
- [ ] PUT /partners/:id (update)
- [ ] DELETE /partners/:id
- [ ] POST /accounts (create)
- [ ] DELETE /accounts/:id
- [ ] POST /companies (create)
- [ ] DELETE /companies/:id

**Ako neki test FAIL-a:**
- Provjeri browser console (F12)
- Provjeri backend logs: `docker-compose logs -f backend`
- Provjeri network tab u dev tools

---

## 8️⃣ TEST LOGOUT

### Šta testirati:
1. Klikni **Logout** u top-right corner

**Očekivani rezultat:**
- Redirect na /login
- localStorage je clear-ovan
- Ako pokušam direct URL (npr. /dashboard) - redirect na /login

---

## ❌ GREŠKE KOJE MOGU SE DESITI

### Problem: Prazna stranica nakon klika na link

**Debug:**
1. Otvori browser Console (F12)
2. Provjeri da li ima JavaScript errors
3. Provjeri Network tab - da li API request fail-uje

**Rješenje:**
```bash
# Check backend logs
docker-compose logs -f backend

# Restart frontend
docker-compose restart frontend
```

### Problem: "Cannot find module" greška

**Rješenje:**
```bash
cd apps/frontend
rm -rf node_modules
npm install
```

### Problem: API endpoints ne rade

**Debug:**
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test companies endpoint (trebaju auth token)
curl http://localhost:3000/api/v1/companies \
  -H "Authorization: Bearer <token>"
```

**Rješenje:**
```bash
# Restart backend
docker-compose restart backend

# Check logs
docker-compose logs -f backend
```

---

## ✅ CHECKLIST - PRIJE NEGO KAŽEM "RADI"

- [ ] Login radi
- [ ] Dashboard se učitava i prikazuje podatke
- [ ] Companies CRUD (Create, Read, Update, Delete) - SVE 4 operacije rade
- [ ] Chart of Accounts CRUD (Create, Read, Delete) - radi
- [ ] Partners CRUD (Create, Read, Update, Delete, Filter) - SVE radi
- [ ] Navigation između svih stranica radi
- [ ] Browser back/forward button radi
- [ ] Logout radi
- [ ] Automatski testovi SVIH prolaze (zeleno ✅)
- [ ] Nema JavaScript errors u console-u
- [ ] Toast notifications rade za sve akcije
- [ ] Loading states rade (spinners, disabled buttons)
- [ ] Modal forms se otvaraju i zatvaraju ispravno
- [ ] Form validation radi (required fields)
- [ ] Tabele prikazuju podatke ispravno

---

## 🎯 FINALNI TEST

Nakon što prođeš sve gore navedeno:

1. **Logout**
2. **Zatvori browser tab**
3. **Otvori novi tab:** http://localhost:5173
4. **Login ponovo**
5. **Ponovi 3-4 random testa iz liste**

Ako sve još uvijek radi - **ONDA ZAISTA RADI!** ✅

---

**Javi rezultate testiranja!** 🚀
