# DhaxalBook Mobile

Flutter app-kan wuxuu la jaanqaadayaa backend-ka iyo features-ka React frontend-ka:

- Login iyo register
- User home, books, search, filters, favorites
- Post detail oo leh PDF open iyo audio playback
- Settings screen oo leh profile edit, change password, dark mode, notifications, iyo playback options
- Admin dashboard
- Admin create, edit, delete posts oo leh image/pdf/audio upload

## Sida loo ordo

1. Backend-ka ka shid root-ka project-ka:

```bash
npm run dev
```

2. Flutter app-ka gal:

```bash
cd flutter_app
flutter create .
flutter pub get
flutter run
```

## API URL notes

- Android emulator: `http://10.0.2.2:8000/api`
- Flutter Web / iOS simulator: `http://127.0.0.1:8000/api`
- Real device: isticmaal IP-ga laptop-kaaga, tusaale `http://192.168.1.20:8000/api`

Haddii aad rabto inaad si toos ah u override-gareyso:

```bash
flutter run --dart-define=API_BASE_URL=http://127.0.0.1:8000/api
```

## Auth notes

Backend-ka hadda wuxuu aqbalayaa cookie ama `Bearer token`, sidaas darteed Flutter admin actions way shaqeynayaan.

## Favorites note

Frontend-ka hadda wuxuu leeyahay "My Book" UI, laakiin backend-ku ma laha favorites endpoints. Flutter app-ku sidaas darteed wuxuu favorites-ka ugu kaydiyaa local storage user kasta.
