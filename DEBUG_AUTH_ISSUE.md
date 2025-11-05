# 🔍 DEBUG GUIDE - Auth Issue Resolution

**Problem:** Non-stop redirect na login stranicu
**Potrošeno:** $20
**Status:** MUST FIX NOW

---

## ⚡ BRZO TESTIRANJE (5 minuta)

### KORAK 1: Provjeri da li backend UOPĆE radi

```bash
# Terminal 1
docker compose logs backend | tail -50
```

**ŠTA TRAŽIŠ:**
- ✅ "Server running on port 3000"
- ✅ "Database connected"
- ❌ Bilo kakva greška

**AKO VIDIŠ GREŠKU:**
- Copy-paste cijeli log i javi mi
- Backend se ne pokreće = nema tokena

---

### KORAK 2: Testiraj Login Endpoint DIREKTNO

```bash
# Terminal 2
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@accounting-bih.com","password":"Admin123!"}' \
  -v
```

**OČEKIVANI OUTPUT:**
```json
{
  "user": {
    "id": "...",
    "email": "admin@accounting-bih.com",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "SUPER_ADMIN"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**AKO DOBIJEŠ:**
- ❌ `Connection refused` → Backend ne radi!
- ❌ `401 Unauthorized` → User ne postoji ili lozinka ne valja
- ❌ `500 Internal Server Error` → Backend crash
- ✅ JSON sa tokenima → Backend radi!

---

### KORAK 3: Testiraj Token Validaciju

```bash
# Sačuvaj token iz KORAK 2 u varijablu
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Paste TVOJ token ovdje!

# Testiraj da li token radi
curl http://localhost:3000/api/v1/companies \
  -H "Authorization: Bearer $TOKEN" \
  -v
```

**OČEKIVANI OUTPUT:**
```json
[
  {
    "id": "...",
    "name": "Demo d.o.o. Banja Luka",
    "taxNumber": "4400000000001",
    ...
  }
]
```

**AKO DOBIJEŠ:**
- ❌ `401 Unauthorized` → Token nije validan!
- ❌ `No token provided` → Token nije proslijeđen
- ✅ JSON array → Token radi perfektno!

---

## 🐛 DIJAGNOSTIKA

### Problem 1: Backend ne radi

**Simptomi:**
- `curl: Connection refused`
- Frontend ne može fetchovati

**Rješenje:**
```bash
# 1. Provjeri Docker status
docker compose ps

# 2. Restart backend
docker compose restart backend

# 3. Vidi logove
docker compose logs -f backend

# 4. Ako ne pomaže, rebuild
docker compose down
docker compose up --build backend
```

---

### Problem 2: User ne postoji u bazi

**Simptomi:**
- Login endpoint vraća `401 Unauthorized`
- Log: "Invalid credentials"

**Rješenje:**
```bash
# 1. Vidi seed log
docker compose logs backend | grep -i seed

# 2. Run seed manually
docker compose exec backend npx tsx apps/backend/prisma/seed.ts

# 3. Provjeri da li user postoji
docker compose exec postgres psql -U accounting_user -d accounting_bih \
  -c "SELECT id, email, role FROM \"User\";"
```

**OČEKIVANO:**
```
                  id                  |            email            |     role
--------------------------------------+-----------------------------+---------------
 xxx-xxx-xxx-xxx                      | admin@accounting-bih.com    | SUPER_ADMIN
```

---

### Problem 3: Token generisan ALI nije validan

**Simptomi:**
- Login radi (dobije token)
- Ali requests sa tokenom vraćaju 401

**Debug:**
```bash
# Dekoduj token online: https://jwt.io

# Ili u Node.js
node -e "console.log(JSON.parse(Buffer.from('eyJhbGc...'.split('.')[1], 'base64').toString()))"
```

**PROVJERI:**
- `exp` (expiration) - Da li je token expired? (15min default)
- `userId` - Da li postoji?
- `role` - Da li je setovan?

**RJEŠENJE AKO JE EXPIRED:**
```typescript
// U docker-compose.yml, promijeni:
JWT_EXPIRES_IN: 24h  # Umjesto 15m
```

---

### Problem 4: CORS Issue

**Simptomi:**
- Browser console: "CORS policy blocked"
- Network tab: Request je cancelled

**Rješenje:**
```bash
# Provjeri CORS u docker-compose.yml
CORS_ORIGIN: http://localhost:5173

# Ili setuj wildcard za dev (SAMO ZA TESTIRANJE!)
CORS_ORIGIN: "*"
```

---

### Problem 5: Frontend ne šalje token

**Debug u Browser:**
```javascript
// F12 → Console
localStorage.getItem('accessToken')  // Da li postoji?
```

**Network Tab:**
- Request Headers → Da li ima `Authorization: Bearer ...`?
- Ako NE → Problem u api-client.ts

**Fix:**
```typescript
// apps/frontend/src/lib/api-client.ts
private setupInterceptors() {
  this.client.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    console.log('🔍 Token:', token ? 'EXISTS' : 'NULL');  // DEBUG
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}
```

---

## 🧪 KOMPLETNA TEST SEKVENCA

Idi REDOM i javi mi gdje FAIL-uje!

### Test 1: Backend Health Check
```bash
curl http://localhost:3000/health
```
**Očekivano:** `{"status":"ok"}`
**Rezultat:** [ ] PASS [ ] FAIL

---

### Test 2: Login Endpoint
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@accounting-bih.com","password":"Admin123!"}'
```
**Očekivano:** JSON sa `accessToken` i `user`
**Rezultat:** [ ] PASS [ ] FAIL

---

### Test 3: Companies Endpoint (bez tokena)
```bash
curl http://localhost:3000/api/v1/companies
```
**Očekivano:** `401 Unauthorized`
**Rezultat:** [ ] PASS [ ] FAIL

---

### Test 4: Companies Endpoint (sa tokenom)
```bash
TOKEN="<paste_token_ovdje>"
curl http://localhost:3000/api/v1/companies \
  -H "Authorization: Bearer $TOKEN"
```
**Očekivano:** JSON array sa companies
**Rezultat:** [ ] PASS [ ] FAIL

---

### Test 5: Frontend Login (browser)
1. Otvori http://localhost:5173
2. Login sa `admin@accounting-bih.com` / `Admin123!`
3. **F12 → Console** → Ima li grešaka?
4. **F12 → Network → Headers** → Request ima li `Authorization`?

**Rezultat:** [ ] PASS [ ] FAIL

---

## 🔧 QUICK FIXES

### Fix 1: Clear EVERYTHING
```bash
# Stop sve
docker compose down -v

# Obriši node_modules
rm -rf node_modules apps/*/node_modules

# Rebuild from scratch
docker compose up --build
```

### Fix 2: Extend Token Expiry
```yaml
# docker-compose.yml - backend env
JWT_EXPIRES_IN: 24h     # Umjesto 15m
```

### Fix 3: Check Password Hash
```bash
# U bazi, provjeri password hash
docker compose exec postgres psql -U accounting_user -d accounting_bih \
  -c "SELECT email, password FROM \"User\" WHERE email='admin@accounting-bih.com';"
```

Hash treba da počinje sa `$2b$` (bcrypt)

---

## 📋 CHECKLIST - Šta provjeriti

- [ ] Docker containers svi running (`docker compose ps`)
- [ ] Backend logs show "Server running"
- [ ] Postgres healthy (`docker compose ps` - status healthy)
- [ ] Seed script completed without errors
- [ ] Login endpoint returns token
- [ ] Token is valid (not expired)
- [ ] Token has correct payload (userId, email, role)
- [ ] Middleware validate token correctly
- [ ] Frontend saves token to localStorage
- [ ] Frontend sends token in Authorization header
- [ ] No CORS errors in browser console

---

## 🆘 JAVI MI REZULTATE

**Uradi sve testove i javi mi:**

1. **Koji test FAILU-je prvi?** (1-5)
2. **Copy-paste TAČAN output** (ne parafrazirati!)
3. **Backend log** (zadnjih 50 linija)

**Sa tim informacijama mogu ODMAH vidjeti gdje je problem!**

---

## 💡 NAJVJEROVATNIJI PROBLEM

**Moj guess:**
1. **Backend se pokreće** ali ima grešku u middleware/jwt
2. **Token se generira** ali ima kratak expiry (15min)
3. **Frontend šalje token** ali backend ga ne validira pravilno

**Za brzu provjeru:**
```bash
# 1. Login i dobij token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@accounting-bih.com","password":"Admin123!"}' \
  | jq -r '.accessToken'

# 2. Paste token online: https://jwt.io
# 3. Vidi payload i expiry
```

---

**IZVRŠSI SVE TESTOVE I JAVI MI GDJE FAIL-UJE!** 🚀
