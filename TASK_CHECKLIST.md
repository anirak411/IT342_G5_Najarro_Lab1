# TradeOff: IT342 Project Checklist

Status snapshot date: 2026-02-27
Scope: Spring Boot backend + React web + Android mobile

## EPIC 1: Repository and Project Setup
- [x] Create TradeOff GitHub repository
- [x] Add main folder structure (`backend/`, `web/`, `mobile/`, `docs/`)
- [x] Add `.gitignore` file
- [x] Remove unnecessary files from version control (`.idea/`, `.DS_Store`)
- [x] Write README with setup and tech stack

## EPIC 2: User Accounts and Authentication

Backend
- [x] Create `User` entity (`id`, `fullName`, `displayName`, `email`, `password`)
- [x] Implement registration API
- [x] Implement login API
- [x] Encrypt passwords with bcrypt
- [x] Validate duplicate email/display name
- [ ] Implement JWT access/refresh tokens
- [x] Implement logout endpoint

Web
- [x] Build login page UI
- [x] Build registration page UI
- [x] Show authentication error messages
- [x] Store user session locally

Mobile
- [x] Create login screen
- [x] Create registration screen
- [ ] Add password visibility toggle
- [x] Implement back navigation to landing screen

## EPIC 3: Marketplace Posting Feature

User Stories
- [x] As a user, I can post an item for trade/sale
- [x] As a user, I can browse available listings

Backend
- [x] Create item entity (`title`, `description`, `price`, `category`, `condition`, `location`, image URLs, seller data)
- [x] Link listings to owner (`sellerEmail` / `sellerName`)
- [x] Create listing API
- [x] View all listings API
- [x] View listing by ID API
- [x] Update listing API with ownership check
- [x] Delete listing API with ownership check
- [x] Add dedicated "view listings by user" endpoint
- [x] Add dedicated backend search endpoint

Web
- [x] Create marketplace feed page
- [x] Create listing upload form
- [x] Show user-owned listings in profile/my-items pages
- [x] Add client-side search/filter/sort

Mobile
- [x] Create marketplace screen
- [x] Display listings in list/grid view
- [x] Add listing creation screen/dialog
- [x] Add listing edit/delete from owner flow

## EPIC 4: Trade Request System

User Stories
- [ ] As a user, I can request a trade
- [ ] As a user, I can accept or decline trade offers

Backend
- [ ] Create `TradeRequest` entity (`sender`, `receiver`, `post`, `status`)
- [ ] Implement send request API
- [ ] Implement incoming requests API
- [ ] Implement accept request API
- [ ] Implement decline request API

Web
- [ ] Add trade request button on listing pages
- [ ] Create trade requests page (pending/accepted/declined)

Mobile
- [ ] Add trade request feature in item details
- [ ] Create requests inbox screen

## EPIC 5: Messaging and Chat Feature

User Stories
- [x] As a user, I can chat with other users
- [x] As a user, I can see an empty chat state

Backend
- [x] Create `ChatMessage` entity (`senderEmail`, `receiverEmail`, `content`, `createdAt`)
- [x] Implement send message API
- [x] Implement conversation history API

Web
- [x] Create floating chat UI
- [x] Display empty chat/conversation states

Mobile
- [x] Create messaging screen/dialog
- [x] Display messages in conversation format

## EPIC 6: User Profile Feature

User Stories
- [x] As a user, I have a profile page
- [ ] As a user, I can view full trade activity history

Backend
- [x] Implement profile view API (`/api/users/me`)
- [x] Implement profile media update API (`/api/users/media`)
- [ ] Add profile update API for all editable fields
- [ ] Add user trade history API

Web
- [x] Build profile page UI
- [x] Show user listings
- [ ] Show trade request/transaction history

Mobile
- [x] Create profile section
- [x] Display user info and listing count
- [x] Display user-owned listings in dashboard tab

## EPIC 7: Dashboard and Navigation

Web
- [x] Create dashboard home
- [x] Show marketplace highlights/listings
- [x] Add sidebar/navigation and logout

Mobile
- [x] Build dashboard tabs (marketplace, my listings, profile, settings)
- [x] Ensure navigation between screens/tabs works
- [x] Add back navigation for auth screens

## EPIC 8: Integration and System Testing
- [x] Connect React frontend to backend
- [x] Connect Android app to backend with Retrofit
- [ ] Verify consistent data across platforms with formal test cases
- [ ] Test full workflow: Register -> Login -> Post Item -> Request Trade -> Chat -> Accept Trade

## EPIC 9: Documentation and Final Submission
- [x] Add screenshots to `docs/`
- [x] Create requirements compliance report (`docs/REQUIREMENTS_COMPLIANCE_REPORT.md`)
- [x] Update README to final marketplace description and run instructions
- [ ] Write final SRS/SDD-aligned report version
- [ ] Prepare presentation slides/demo
- [ ] Final code cleanup before submission

## Final Submission Checklist
- [ ] Confirm unnecessary files are ignored
- [ ] Push final working version to GitHub
- [ ] Tag release version (optional)
- [ ] Submit repository link to instructor

## Definition of Done
A requirement is complete when:
- [ ] Backend API behavior matches documented contract
- [ ] Feature works on both web and mobile (if in scope)
- [ ] UI includes loading, empty, and error states
- [ ] Security/access controls are implemented where required
- [ ] Requirement is traceable in SRS/SDD and checklist
