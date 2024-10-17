![image](https://github.com/user-attachments/assets/c609da8e-444e-4183-b2c4-f16a2c5d0b90)# Biliet-Rezervavimo-Sistema

Šio projekto tikslas yra sukurti internetinę sistemą, skirtą suteikti sklandų renginių organizavimą ir bilietų pirkimą.

Projekto pavadinimas: Renginių Valdymo ir Bilietų Rezervavimo Sistema.

Šio projekto tikslas yra sukurti internetinę sistemą, skirta suteikti sklandų renginių organizavimą ir bilietų pirkimą. Sistemos naudotojų rolės:
•	Svečias: gali peržiūrėti renginius.
•	Vartotojas: gali peržiūrėti renginius ir pirkti bilietus, peržiūrėti savo bilietų informaciją ir renginio statusą.
•	Organizatorius: gali kurti renginius, juos redaguoti bei stebėti parduotų bilietų statistiką, valdyti bilietų pardavimus.
•	Administratorius: turi teisę prižiūrėti renginius ir bilietų pardavimus, juos valdyti.

Taikomosios srities objektai ir jos hierarchija:
•	Vieta → Renginys → Bilietas

API Metodai:
1.	Vieta:
•	GET /api/vieta/{id} – Grąžina vietos informaciją pagal ID.
•	POST /api/vieta – Sukuria naują vietą.
•	PUT /api/vieta/{id} – Atnaujina esamą vietą.
•	DELETE /api/vieta/{id} – Pašalina vietą.
•	GET /api/vietos – Grąžina visų vietų sąrašą.
2.	Renginys:
•	GET /api/renginys/{id} – Grąžina renginio informaciją pagal ID.
•	POST /api/renginys – Sukuria naują renginį.
•	PUT /api/renginys/{id} – Atnaujina esamo renginio informaciją.
•	DELETE /api/renginys/{id} – Pašalina renginį.
•	GET /api/renginiai – Grąžina visų renginių sąrašą.
3.	Bilietas:
•	GET /api/bilietas/{id} – Grąžina bilieto informaciją pagal ID.
•	POST /api/bilietas – Užregistruoti naują bilietą.
•	PUT /api/bilietas/{id} – Atnaujina esamo bilieto statusą (grąžintas, aktyvus, pasibaigęs).
•	DELETE /api/bilietas/{id} – Pašalina bilietą.
•	GET /api/bilietai – Grąžina visų bilietų sąrašą.
Hierarchinis metodas:
•	GET /api/vieta/{id}/renginiai – Grąžina visus konkrečios vietos renginius.


Šiame projekte įdiegta RESTful API, skirta renginiams, vietoms ir bilietams tvarkyti. API sukurta laikantis REST principų, o jos galiniai taškai skirti ištekliams kurti, gauti, atnaujinti ir ištrinti.
•	Implementuotos įvykių, vietų ir bilietų CRUD operacijos pasitelkus PHP Laravel.
•	Sukurta duomenų bazė, kuri yra pritaikyta API naudojimui. 
•	Parašyta OpenAPI specifikacijos kiekvienam API metodui. Specifikacijos pateiktos projekto saugykloje esančiame .yaml faile, kurį galima peržiūrėti naudojant tokias priemones kaip „Swagger UI“.
•	Užtikrintos tinkamos HTTP būsenos kodai ir atsakymai.
•	Parengta demonstracinė kolekcija pasinaudojus „Postman“.
