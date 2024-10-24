# Bilietų Rezervavimo Sistema

Šio projekto tikslas yra sukurti internetinę sistemą, skirtą sklandžiam renginių organizavimui ir bilietų pirkimui.

## Projekto pavadinimas:
Renginių Valdymo ir Bilietų Rezervavimo Sistema.

### Sistemos naudotojų rolės:
- **Svečias**: gali peržiūrėti renginius.
- **Vartotojas**: gali peržiūrėti renginius ir pirkti bilietus, peržiūrėti savo bilietų informaciją ir renginio statusą.
- **Organizatorius**: gali kurti renginius, juos redaguoti bei stebėti parduotų bilietų statistiką, valdyti bilietų pardavimus.
- **Administratorius**: turi teisę prižiūrėti renginius ir bilietų pardavimus, juos valdyti.

### Taikomosios srities objektai ir jų hierarchija:
- **Vieta → Renginys → Bilietas**

---

### API Metodai:

#### 1. Vieta:
- **GET** `/api/vieta/{vietaID}` – Grąžina vietos informaciją pagal ID.
- **POST** `/api/vieta` – Sukuria naują vietą.
- **PATCH** `/api/vieta/{vietaID}` – Atnaujina esamą vietą (galima atnaujinti tik kai kuriuos laukus).
- **DELETE** `/api/vieta/{vietaID}` – Pašalina vietą.
- **GET** `/api/vieta` – Grąžina visų vietų sąrašą.

#### 2. Renginys:
- **GET** `/api/vieta/{vietaID}/renginys/{renginysID}` – Grąžina renginio informaciją pagal ID.
- **POST** `/api/vieta/{vietaID}/renginys` – Sukuria naują renginį nurodytoje vietoje.
- **PATCH** `/api/vieta/{vietaID}/renginys/{renginysID}` – Atnaujina esamo renginio informaciją.
- **DELETE** `/api/vieta/{vietaID}/renginys/{renginysID}` – Pašalina renginį.
- **GET** `/api/vieta/{vietaID}/renginys` – Grąžina visų renginių sąrašą nurodytoje vietoje.

#### 3. Bilietas:
- **GET** `/api/vieta/{vietaID}/renginys/{renginysID}/bilietas/{bilietasID}` – Grąžina bilieto informaciją pagal ID.
- **POST** `/api/vieta/{vietaID}/renginys/{renginysID}/bilietas` – Užregistruoti naują bilietą renginiui.
- **PATCH** `/api/vieta/{vietaID}/renginys/{renginysID}/bilietas/{bilietasID}` – Atnaujina esamo bilieto statusą (grąžintas, aktyvus, pasibaigęs).
- **DELETE** `/api/vieta/{vietaID}/renginys/{renginysID}/bilietas/{bilietasID}` – Pašalina bilietą.
- **GET** `/api/vieta/{vietaID}/renginys/{renginysID}/bilietas` – Grąžina visų bilietų sąrašą konkrečiam renginiui.

---

### Projekto funkcijos:
- Šiame projekte įdiegta RESTful API, skirta renginiams, vietoms ir bilietams tvarkyti.
- API sukurta laikantis REST principų, o jos galiniai taškai skirti ištekliams kurti, gauti, atnaujinti ir ištrinti.
- Implementuotos įvykių, vietų ir bilietų CRUD operacijos pasitelkus **PHP Laravel**.
- Sukurta duomenų bazė, pritaikyta API naudojimui.
- Parašyta **OpenAPI specifikacija** kiekvienam API metodui. Specifikacijos pateiktos projekto saugykloje esančiame `.yaml` faile, kurį galima peržiūrėti naudojant tokias priemones kaip **Swagger UI**.
- Užtikrinti tinkami **HTTP būsenos kodai** ir atsakymai.
- Parengta demonstracinė kolekcija pasinaudojus **Postman**, kurioje demonstruojama, kaip veikia 15 API metodų.