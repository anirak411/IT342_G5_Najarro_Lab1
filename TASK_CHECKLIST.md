# ✅ TradeOff App – Agile Development Checklist (IntelliJ Format)

This TODO list tracks the development of the TradeOff multi-platform application
(Spring Boot Backend + React Web + Android Mobile).

---

## 🟦 EPIC 1: Repository & Project Setup

- [x] Create TradeOff GitHub repository
- [x] Add main folder structure:
    - [x] backend/
    - [x] web/
    - [x] mobile/
    - [x] docs/
- [x] Add .gitignore file
- [x] Remove committed unnecessary files (.idea/, .DS_Store)
- [x] Write README.md (setup + features + tech stack)

---

## 🟦 EPIC 2: User Accounts & Authentication

### Backend
- [x] Create User entity (id, name, email, password)
- [x] Implement registration API
- [x] Implement login API
- [x] Encrypt passwords (Spring Security)
- [x] Validate user input fields

### Web
- [x] Build login page UI
- [x] Build registration page UI
- [x] Show authentication error messages
- [x] Store user session/token

### Mobile
- [x] Create login screen (Kotlin)
- [x] Create registration screen
- [x] Add password visibility toggle
- [x] Implement back button navigation to landing page

---

## 🟦 EPIC 3: Marketplace Posting Feature

### User Stories
- [ ] As a user, I want to post an item so I can trade with others
- [ ] As a user, I want to browse available trade offers

### Backend
- [ ] Create Post entity (title, description, category, images)
- [ ] Link posts to users
- [ ] Implement APIs:
    - [ ] Create post
    - [ ] View all posts
    - [ ] View posts by user
    - [ ] Delete post

### Web
- [ ] Create marketplace feed page
- [ ] Create post upload form
- [ ] Display only user-created posts in profile/dashboard

### Mobile
- [ ] Create marketplace screen
- [ ] Display trade posts in list view
- [ ] Add post creation screen

---

## 🟦 EPIC 4: Trade Request System

### User Stories
- [ ] As a user, I want to request a trade so I can exchange items
- [ ] As a user, I want to accept or decline trade offers

### Backend
- [ ] Create TradeRequest entity (sender, receiver, post, status)
- [ ] Implement APIs:
    - [ ] Send trade request
    - [ ] View incoming requests
    - [ ] Accept request
    - [ ] Decline request

### Web
- [ ] Add trade request button on posts
- [ ] Create trade requests page (pending/accepted/declined)

### Mobile
- [ ] Add trade request feature in post details
- [ ] Create requests inbox screen

---

## 🟦 EPIC 5: Messaging & Chat Feature

### User Stories
- [ ] As a user, I want to chat so I can negotiate trades
- [ ] As a user, I want to see "No messages yet" if chat is empty

### Backend
- [ ] Create Message entity (sender, receiver, content, timestamp)
- [ ] Implement APIs:
    - [ ] Send message
    - [ ] View conversation history

### Web
- [ ] Create chat UI screen
- [ ] Display empty chat state when no messages exist

### Mobile
- [ ] Create messaging screen
- [ ] Display messages in conversation format

---

## 🟦 EPIC 6: User Profile Feature

### User Stories
- [ ] As a user, I want a profile page to manage my account
- [ ] As a user, I want to view my posts and trade activity

### Backend
- [ ] Implement profile API (view/update info)
- [ ] Fetch user-specific posts and trade history

### Web
- [ ] Build profile page UI
- [ ] Show user posts list
- [ ] Show trade request history

### Mobile
- [ ] Create profile screen
- [ ] Display user info + posted items

---

## 🟦 EPIC 7: Dashboard & Navigation

### Web
- [ ] Create dashboard homepage
- [ ] Show marketplace highlights
- [ ] Add navbar + logout

### Mobile
- [ ] Improve dashboard to match web version
- [ ] Ensure smooth navigation between screens
- [ ] Add proper back button behavior

---

## 🟦 EPIC 8: Integration & System Testing

- [ ] Connect React frontend to backend successfully
- [ ] Connect Android app to backend using Retrofit
- [ ] Verify consistent data across platforms
- [ ] Test full workflow:
    - [ ] Register → Login → Post Item → Request Trade → Chat → Accept Trade

---

## 🟦 EPIC 9: Documentation & Final Submission

- [ ] Update README with final project description
- [ ] Add screenshots in docs/ folder
- [ ] Write final SRS-aligned project report
- [ ] Prepare presentation slides/demo
- [ ] Final code cleanup before submission

---

## ✅ Final Submission Checklist

- [ ] Confirm unnecessary files are ignored
- [ ] Push final working version to GitHub
- [ ] Tag release version (optional)
- [ ] Submit repository link to instructor

---

## ✅ Definition of Done

A feature is complete when:

- [ ] Backend API works correctly
- [ ] Feature works on both web and mobile
- [ ] UI shows proper empty/error states
- [ ] Code is committed and pushed
- [ ] Requirement matches the TradeOff SRS
