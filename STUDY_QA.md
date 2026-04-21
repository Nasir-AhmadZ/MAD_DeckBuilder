# ShopDemo_wk10 — Study Q&A

---

## Authentication

**Q: How does login work in the app?**
The user enters email and password on `LoginScreen`. It calls `authApi.login(email, password)` which sends a POST to `/auth/login`. The backend returns a JWT token. The app then calls `useAuth().login(token)` which saves the token to `expo-secure-store` (encrypted persistent storage), to context state, and to the `authToken` module so all API calls can use it immediately.

---

**Q: How does the app stay logged in after closing?**
`AuthContext` runs a `useEffect` on mount that reads the token from `expo-secure-store`. If a token exists it restores it to state. The `loading` flag stays `true` until this check completes, preventing a flash of the login screen.

---

**Q: How does logout work?**
The user taps "Logout" on HomeScreen which calls `useAuth().logout()`. This deletes the token from `expo-secure-store` and sets the token in context to `null`. React Navigation detects the null token and automatically switches back to the Login/Register stack.

---

**Q: How do API calls attach the JWT token?**
All authenticated calls import `getAuthHeaders()` from `authToken.js`. This returns `{ Authorization: 'Bearer <token>' }` which is spread into the fetch headers. `authToken.js` is a module-level singleton — it holds the token in a plain variable shared across all API files.

---

**Q: How does the app know the userId without a separate API call?**
It decodes the JWT payload directly on the client using `atob(token.split('.')[1])`. The backend embeds `{ id: userId }` in the JWT payload, so HomeScreen and DeckBuildScreen extract it from the token without any network request.

---

## Navigation

**Q: How does navigation work and how does auth control it?**
The app uses React Navigation's Native Stack Navigator. `App.js` reads `token` from `AuthContext`. If token is null it renders the unauthenticated stack (Login, Register). If token exists it renders the authenticated stack (Home, Inventory, DeckBuild, DeckDetail, ProductBasket). Changing the token state automatically swaps the stack.

---

**Q: How does tapping a push notification navigate the user?**
`App.js` creates a navigation ref and passes it to the NavigationContainer. A `Notifications.addNotificationResponseReceivedListener` listener is set up in a `useEffect`. When the user taps a notification it fires the listener which calls `navigationRef.current.navigate('ProductBasket')`.

---

## Screens

**Q: What does HomeScreen do?**
HomeScreen is the main dashboard. It fetches the user's decks via `deckApi.getDeck(userId)` and displays them as a list. Tapping a deck navigates to DeckDetailScreen passing the deck object as a route param. It also registers the device's Expo push token with the backend via `authApi.postPushToken()`.

---

**Q: What does DeckBuildScreen do?**
It provides three operations: (1) Import a card by name into the database via `cardApi.importCard()`, (2) Create a new deck with a name and format (Commander or Standard) via `deckApi.createDeck()`, (3) Add an existing card to a deck with a quantity via `deckApi.addCard()`. All operations use the `useDeck` hook which handles loading states and alerts.

---

**Q: What does DeckDetailScreen do?**
It shows all cards in a selected deck. It lazy-loads full card objects from `cardApi.getCards()` if the deck only contains card ID strings. Tapping a card opens a BottomSheet with the card image, type, oracle text, and price. The bottom bar shows the deck's total price from `deckApi.priceDeck()`. A "Recommendation" button calls the AI via `useGen().fetchDeckRecom()` and shows Gemini's suggestions in a BottomSheet.

---

**Q: How does DeckDetailScreen resolve card data?**
The `resolveCard()` function checks whether `item.card` is a plain string (an ID) or a populated object. If it's a string, it looks it up in `cardMap` (a local dictionary built from `cardApi.getCards()`). If it's already an object with a `name` field it uses it directly. This handles both API response shapes.

---

**Q: What does InventoryScreen do?**
It is an admin-style product management screen. It uses `useProducts()` to list, create, edit, and delete products. Products can have a name, price, description, and an image captured via the camera. When a new product is created it sends an Expo push notification to users.

---

**Q: What does ProductBasket do?**
It shows the user's shopping basket. Items can be incremented, decremented, or removed entirely using `useBasket()`. It shows each item's price, quantity, and a running total. It currently uses a hardcoded `userId: 'demo-user-1'`.

---

## Hooks

**Q: What is useAuth and where does it come from?**
`useAuth()` is a custom hook that reads from `AuthContext`. It returns `{ token, loading, login, logout }`. Any component that needs to know if the user is logged in or needs to trigger login/logout calls this hook.

---

**Q: What does useDeck do?**
`useDeck(userId)` encapsulates the three deck-building operations: importing cards, creating decks, and adding cards. It manages separate loading booleans (`importing`, `creatingDeck`, `addingCard`), validates inputs, shows Alerts for success/failure, and accepts an `onSuccess` callback to reset form state.

---

**Q: What does useBasket do?**
`useBasket(userId)` fetches and manages the user's basket. It exposes `loadBasket()`, `changeQuantity(item, removeAll)`, and `incrementQuantity(item)`. It computes a `total` by summing `price × quantity` for all items. Loading state is a single `loading` boolean.

---

**Q: What does useProducts do?**
`useProducts()` manages the products list with CRUD operations. It uses two loading flags: `loading` (for fetch and delete) and `posting` (for create and update) so the UI can show different indicators for read vs write operations.

---

**Q: What does useGen do?**
`useGen()` wraps the AI recommendation call. It exposes `fetchDeckRecom(userId, deckName)`, a `loadingRecom` boolean, and `recommendations` (the returned string from Gemini). It validates inputs and shows an Alert on error.

---

**Q: What does useNotifications do?**
It handles Expo push notifications. It requests permission, fetches the Expo push token using the app's EAS project ID, creates an Android notification channel, and configures the foreground notification handler. It also manages an in-app notification list with `addNotification`, `removeNotification`, and `clearNotifications`.

---

## Components

**Q: What is the BottomSheet component and how does it work?**
`BottomSheet` is a reusable modal that slides up from the bottom of the screen. It accepts `visible`, `onDismiss`, and `children` props. It uses `react-native-reanimated` for animations. The user can dismiss it by swiping down (velocity > 2 or drag > 100px) or tapping the dark backdrop. It has a max height of 60% of the screen.

---

**Q: What does the ProductItem component render?**
It renders a single product card with name, price, description, and image. It conditionally shows "Add to Basket", "Edit", and "Delete" buttons based on which callback props are passed. Delete shows a confirmation Alert before calling `onDelete`.

---

**Q: What does ImagePickerButton do?**
It renders a button that opens the device camera via `expo-image-picker`. It requests permissions automatically, captures a photo, and returns it as a base64-encoded data URI (`data:image/jpeg;base64,...`). After a photo is taken the button label changes to "Retake Photo".

---

## API Layer

**Q: Why does every API call include `'ngrok-skip-browser-warning': 'true'` in the headers?**
The backend is exposed via ngrok (a tunnelling tool for local development). ngrok adds a browser warning page for new visitors. Adding this header bypasses that warning so API responses come back as JSON instead of an HTML warning page.

---

**Q: What does cardApi.importCard do?**
It sends `POST /cards/{cardName}` to the backend. The backend fetches the card data from the Scryfall API (an external Magic: The Gathering card database) and saves it to MongoDB. This is how new cards enter the local database.

---

**Q: What does deckApi.priceDeck do?**
It sends `POST /deck/price` with `{ userId, deckName }`. The backend looks up all cards in the deck, sums their prices multiplied by quantity, and returns the total. DeckDetailScreen displays this at the bottom of the screen.

---

**Q: What does genApi.deckRecom do?**
It sends `POST /gen/recommend` with `{ userId, deckName }`. The backend fetches the deck from MongoDB, builds a prompt listing all cards and their oracle text, and sends it to Gemini (`gemini-2.5-flash`). Gemini returns improvement suggestions which are returned as `{ recommendations: string }`.

---

## Backend & Config

**Q: Where is the backend URL configured?**
In `config.js` at the root of ShopDemo_wk10. The value `BASE_URL` is imported by all API files. It defaults to `'https://your-backend.example'` if not set.

---

**Q: Why did the Gemini recommendation fail with a 500 error?**
The backend's `.env` file was missing, so `process.env.GEMINI_API_KEY` was undefined. The backend uses `dotenv` to load environment variables from a `.env` file that is gitignored. The fix is to create `CC-Backend/.env` with `GEMINI_API_KEY=<your_key>` and `MONGO_URI=<your_connection_string>` and restart the server.

---

## State & Data Flow

**Q: Walk through what happens when a user opens DeckDetailScreen.**
1. The deck object is passed via `route.params`
2. `useEffect` checks if `deck.cards[0].card` is a string (unpopulated ID)
3. If yes, `cardApi.getCards()` fetches all cards and builds a `cardMap` dictionary keyed by `_id`
4. Simultaneously `deckApi.priceDeck()` fetches the total price
5. The FlatList renders each card row using `resolveCard()` to get full card data
6. The price bar renders at the bottom once `totalPrice` is set

---

**Q: How does the app send push notifications when a new product is added?**
In `InventoryScreen`, after `useProducts().createProduct()` succeeds, the screen directly calls the Expo push notification API (`https://exp.host/--/api/v2/push/send`) with the user's stored `expoPushToken` and a message. This bypasses the backend — the notification is sent client-to-Expo-to-device.

---

**Q: What is the difference between deckApi.recommendDeck and genApi.deckRecom?**
Both call the same backend endpoint (`/deck/recommend` vs `/gen/recommend` — different routes). `deckApi.recommendDeck` was the original route. `genApi.deckRecom` was added as a dedicated API module for AI features using the `/gen/recommend` route wired to `genController.deckRecom`. The app currently uses `genApi` via the `useGen` hook.

---

## AI Deck Editor (recomAlter)

**Q: What does the `/gen/recomalter` endpoint do differently from `/gen/recommend`?**
`/gen/recommend` returns a plain text string of suggestions — it does not change anything. `/gen/recomalter` takes a natural language `userPrompt`, sends the deck and prompt to Gemini, forces a structured JSON response listing `add`/`remove` actions, then actually executes those changes against MongoDB. It returns `{ summary, applied, skipped, deck }` showing exactly what was changed and what was skipped and why.

---

**Q: How does the backend ensure Gemini returns structured data in recomalter?**
The prompt ends with an explicit instruction telling Gemini to respond only with a valid JSON object in an exact format — no markdown, no explanation. The response is then cleaned of any accidental markdown fences (` ```json ``` `) before being passed to `JSON.parse()`. If parsing fails the endpoint returns a 500 with the raw text.

---

**Q: What validation does the backend apply when adding cards in recomAlter?**
Before adding a card it checks three rules: (1) Commander decks only allow one copy of each card — duplicates are skipped. (2) Commander decks have a 100-card limit — cards are skipped if the deck is full. (3) Standard decks cannot have more than 4 copies of any card — the change is skipped if it would exceed that. Anything skipped is included in the `skipped` array with a reason.

---

**Q: What happens if a card suggested by Gemini doesn't exist in the database?**
The backend tries `Card.findOne({ name })` first. If not found it fetches the card from the Scryfall API (`/cards/named?exact=...`), creates a new Card document from the response (name, manaCost, type, price, oracleText, imageUrl), and then proceeds with adding it to the deck. If Scryfall also can't find it the card is added to `skipped`.

---

**Q: What was added to genApi.js to support recomAlter?**
A new `recomAlter(body)` function was added that sends `POST /gen/recomalter` with `{ userId, deckName, userPrompt }`. It follows the same pattern as `deckRecom` — authenticated headers, ngrok header, throws on non-OK response. It is exported alongside `deckRecom`.

---

**Q: What was added to useGen.js to support recomAlter?**
Two new state values were added: `loadingAlter` (boolean) and `alterResult` (the response object). A new function `applyAlter(userId, deckName, userPrompt)` validates inputs, calls `genApi.recomAlter()`, stores the result in `alterResult`, and shows an Alert on error. These are returned alongside the existing `loadingRecom`, `recommendations`, and `fetchDeckRecom`.

---

**Q: How does the AI Deck Editor work in HomeScreen?**
The user long-presses a deck to select it (it highlights with a gold border). They type a natural language instruction in the text input (e.g. "make this deck more aggressive"). Tapping "Apply Changes" calls `applyAlter(userId, selectedDeckName, alterPrompt)` from `useGen`. While loading a spinner shows. When complete a BottomSheet opens showing the summary, added cards in green, removed cards in red, and any skipped cards with reasons. The deck list then refreshes automatically via `loadDecks()`.

---

**Q: How is a deck selected for the AI editor in HomeScreen?**
A short tap on a deck navigates to `DeckDetailScreen` as normal. A long-press sets `selectedDeckName` to that deck's name via `onLongPress={() => setSelectedDeckName(item.deckName)}`. The selected deck gets a highlighted gold border using the `deckCardSelected` style.

---

**Q: Why is the "Apply Changes" button disabled in some states?**
The button is disabled when any of these are true: no deck is selected (`!selectedDeckName`), the prompt input is empty (`!alterPrompt.trim()`), or a request is already in progress (`loadingAlter`). This prevents invalid or duplicate requests being sent.
