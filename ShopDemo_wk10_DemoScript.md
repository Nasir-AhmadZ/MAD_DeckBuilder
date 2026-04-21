# ShopDemo_wk10 — Demo Script

---

## Overview

This app is a React Native (Expo) deck-building tool with AI-powered editing. It uses JWT authentication, a MongoDB backend, and the Gemini AI model for deck recommendations.

**Screens in order of demo:** Login → Home → DeckBuild → DeckDetail → AI Editor (on Home)

---

## 1. Authentication

### What to show
Open the app cold. The Login screen appears immediately.

### What to explain

**Login flow:** The user enters email and password. `LoginScreen` calls `authApi.login(email, password)` which POSTs to `/auth/login`. The backend returns a JWT. The app calls `useAuth().login(token)` which saves the token to `expo-secure-store` (encrypted persistent storage), updates context state, and populates the `authToken` singleton so every API call can read it immediately.

**Staying logged in:** `AuthContext` runs a `useEffect` on mount that reads the token from `expo-secure-store`. If one exists it restores it to state. The `loading` flag stays `true` until this check completes — this prevents a flash of the login screen on startup.

**JWT decoding on the client:** The app never makes a separate "get me" API call. Instead it decodes the JWT payload with `atob(token.split('.')[1])`. The backend embeds `{ id: userId }` in the payload, so `HomeScreen` and `DeckBuildScreen` extract `userId` directly from the token.

**Logout:** Tapping "Logout" on HomeScreen calls `useAuth().logout()`, deletes the token from `expo-secure-store`, and sets token to `null` in context. React Navigation detects the null token and automatically swaps back to the Login/Register stack.

**Auth headers:** All authenticated API calls import `getAuthHeaders()` from `authToken.js`, which returns `{ Authorization: 'Bearer <token>' }`. This is spread into every fetch call.

---

## 2. Navigation

### What to show
Log in and point out the screen transitions. Navigate between Home, DeckBuild, and DeckDetail.

### What to explain

The app uses React Navigation's Native Stack Navigator. `App.js` reads `token` from `AuthContext`. When token is `null` it renders the unauthenticated stack (Login, Register). When token exists it renders the authenticated stack (Home, DeckBuild, DeckDetail). Changing the token state automatically swaps the stack with no manual navigation needed.

**ngrok header:** Every API call includes `'ngrok-skip-browser-warning': 'true'` in its headers. The backend is exposed via ngrok for local development. Without this header, ngrok returns an HTML warning page instead of JSON.

---

## 3. HomeScreen

### What to show
After login, HomeScreen displays the user's decks as a scrollable list. Tap a deck to go to DeckDetail. Long-press a deck to select it for the AI editor (it highlights with a gold border).

### What to explain

HomeScreen fetches the user's decks via `deckApi.getDeck(userId)` on mount and again every time the screen comes into focus (via `navigation.addListener('focus', ...)`).

It also registers the device's Expo push token with the backend. The `useNotifications` hook requests permission, fetches the Expo push token using the app's EAS project ID, and sets up the Android notification channel. `HomeScreen` watches `expoPushToken` and on first value calls `authApi.postPushToken(expoPushToken)` — the ref guard (`hasSentPushToken`) ensures this only fires once.

At the bottom of the deck list is the **AI Deck Editor** panel — covered in section 6.

---

## 4. DeckBuildScreen

### What to show
Navigate to DeckBuild via "+ New Deck". Show all three operations: import a card, create a deck, add a card to a deck.

### What to explain

DeckBuildScreen provides three operations managed by the `useDeck(userId)` hook:

1. **Import card** — calls `cardApi.importCard(cardName)` which sends `POST /cards/{cardName}`. The backend fetches the card from the Scryfall API (an external Magic: The Gathering database) and saves it to MongoDB.

2. **Create deck** — calls `deckApi.createDeck(userId, deckName, format)`. Format is either Commander or Standard — this matters for validation rules in the AI editor.

3. **Add card to deck** — calls `deckApi.addCard(userId, deckName, cardName, quantity)`.

`useDeck` manages three separate loading booleans (`importing`, `creatingDeck`, `addingCard`) so each button can show its own spinner independently. It validates inputs and shows Alerts on success/failure, and accepts an `onSuccess` callback to reset form state after a successful operation.

---

## 5. DeckDetailScreen

### What to show
Tap a deck from HomeScreen. Show the card list, tap a card to open its BottomSheet, and tap "Recommendation" to get AI suggestions.

### What to explain

The deck object is passed via `route.params`. On mount, `DeckDetailScreen` checks whether `deck.cards[0].card` is a plain string (an unpopulated MongoDB ID reference) or a full object. If it's a string, it calls `cardApi.getCards()` to fetch all cards and builds a `cardMap` dictionary keyed by `_id`. Each card in the list is resolved via `resolveCard(item)` which handles both shapes — this is because the backend can return decks in either populated or unpopulated form depending on the query.

Simultaneously, `deckApi.priceDeck(userId, deckName)` is called — this sends `POST /deck/price` and the backend sums `price × quantity` for all cards in the deck. The total is shown in the bottom bar.

**Card BottomSheet:** Tapping a card opens a `BottomSheet` showing the card image, type line, oracle text, and price. `BottomSheet` is a reusable component that slides up from the bottom using `react-native-reanimated`. It can be dismissed by swiping down (velocity > 2 or drag > 100px) or tapping the dark backdrop.

**Recommendation:** Tapping "Recommendation" calls `useGen().fetchDeckRecom(userId, deckName)` which sends `POST /gen/recommend`. The backend fetches the deck from MongoDB, builds a prompt listing all cards and oracle text, and sends it to `gemini-2.5-flash`. Gemini returns improvement suggestions as a plain text string, shown in a BottomSheet.

---

## 6. AI Deck Editor (HomeScreen)

### What to show
Back on HomeScreen: long-press a deck to select it (gold border appears). Type a prompt like "make this deck more aggressive". Tap "Apply Changes". While loading a spinner shows. When done, a BottomSheet opens showing what was added (green), removed (red), and skipped with reasons.

### What to explain

**Selecting a deck:** A short tap navigates to DeckDetail as normal. A long-press sets `selectedDeckName` via `onLongPress={() => setSelectedDeckName(item.deckName)}`. The selected deck highlights with a gold border using the `deckCardSelected` style.

**The button guard:** "Apply Changes" is disabled when any of these are true: no deck is selected, the prompt is empty, or a request is already in progress (`loadingAlter`). This prevents invalid or duplicate requests.

**The endpoint — `/gen/recomalter`:** This is different from `/gen/recommend`. `/gen/recommend` returns a plain text string of suggestions and changes nothing. `/gen/recomalter` takes a `userPrompt`, sends the deck and prompt to Gemini, and forces a structured JSON response listing `add`/`remove` actions. The backend then executes those changes against MongoDB and returns `{ summary, applied, skipped, deck }`.

**Forcing structured output from Gemini:** The backend prompt ends with an explicit instruction to respond only with a valid JSON object in an exact schema — no markdown, no explanation. The response is then cleaned of any accidental markdown fences (` ```json ``` `) before `JSON.parse()`. If parsing fails, the endpoint returns a 500 with the raw text.

**Validation rules applied before adding a card:**
- Commander decks allow only one copy of each card — duplicates are skipped.
- Commander decks have a 100-card limit — cards beyond the limit are skipped.
- Standard decks cannot have more than 4 copies of any card.
Anything skipped is included in the `skipped` array with a human-readable reason.

**Auto-importing unknown cards:** If Gemini suggests a card that isn't in the local database, the backend calls Scryfall's `/cards/named?exact=...` API, creates a new Card document (name, manaCost, type, price, oracleText, imageUrl), and proceeds. If Scryfall can't find it either, the card goes to `skipped`.

**After apply:** `applyAlter` stores the result in `alterResult`. A BottomSheet opens showing the summary text, added cards in green, removed cards in red, and skipped cards with reasons. `loadDecks()` is called after so the deck list refreshes automatically.

**The hook layer:** `genApi.recomAlter(body)` sends `POST /gen/recomalter` with `{ userId, deckName, userPrompt }`. `useGen` wraps this with `loadingAlter` (boolean) and `alterResult` (the response object). The `applyAlter(userId, deckName, userPrompt)` function validates inputs, calls the API, and shows an Alert on error.

---

## 7. Backend & Config

**Backend URL:** Configured in `config.js` at the root of the project. The `BASE_URL` constant is imported by all API files.

**Environment variables:** The backend reads `GEMINI_API_KEY` and `MONGO_URI` from a `.env` file via `dotenv`. This file is gitignored. If missing, Gemini calls will return a 500 error. Fix: create `CC-Backend/.env` with both keys and restart the server.

---

## Data Flow Summary

```
User action
  → Screen calls hook function
    → Hook calls API module
      → API module fetches with auth headers + ngrok header
        → Backend processes, optionally calls Gemini / Scryfall / MongoDB
          → Response updates hook state
            → Screen re-renders
```
