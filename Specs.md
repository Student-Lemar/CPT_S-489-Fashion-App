# Smart Wardrobe App — Requirements Analysis (Mid Deliverable)

**Course:** Web Application Development
**Deliverable:** Requirements Analysis (PDF)
**Version:** 1.0
**Date:** March 4, 2026

**Team Members:**
- Lemar Joe Encio
- Aden Athar
- Jaeger Nelson
- Abdur Muhammad Islam

---

## 1. Project Overview

### 1.1 Project Description

The Smart Wardrobe App is a web application that allows users to upload images of their clothing items and store them in a personal digital wardrobe. The system extracts key visual attributes (especially dominant colors) and uses basic color theory to generate outfit recommendations. Users can save outfits and post them to inspiration boards similar to Instagram/Pinterest. The platform supports both private and public content depending on user role, and includes an admin portal for managing users and moderating content.

### 1.2 Project Goals

- Help users organize their real-life clothing into a digital wardrobe
- Automatically extract color data from uploaded clothing images
- Generate outfit recommendations using color theory and category compatibility
- Allow users to save outfits and reuse them later
- Enable boards for outfit inspiration, including private and public boards for creator users based on account permissions
- Provide admin tools to manage users, content moderation, and system oversight

### 1.3 Out of Scope (for this deliverable)

- Non-functional requirements (performance, security details, SLAs)
- Technical architecture and database schemas
- Full implementation (this deliverable focuses on requirements + mockups)

---

## 2. User Roles & Authentication Hierarchy

### 2.1 Primary Role — Guest User

Guest Users are visitors who access the Smart Wardrobe App without logging into an account. Guests can browse public content and explore creator profiles but cannot perform actions that modify system data.

**Guest Users can:**
- View public outfit posts
- Browse creator inspiration boards
- View creator profiles
- Explore the public feed

**Guest Users cannot:**
- Upload clothing items
- Generate outfits
- Save outfits
- Follow creators
- Access wardrobe management features
- Access creator dashboards
- Access admin tools or moderation features

> If a guest attempts to access restricted functionality, the system redirects the user to the Login page.

### 2.2 Secondary Role — Creator User

Creator Users are authenticated users with elevated content-sharing privileges. They have all capabilities available to authenticated wardrobe users, plus public-facing content features intended for users who want to showcase outfits and build an audience.

**Creator Users can:**
- Upload, manage, and organize wardrobe items
- Generate and save outfits
- Create boards and share outfit content
- Follow other creators and engage with public content
- Create both private and public boards
- Maintain a public creator profile
- Post outfits publicly
- Access a creator dashboard
- Gain followers from other users
- May receive higher wardrobe upload limits based on platform policies

**Creator Users cannot:**
- Access admin-only dashboards
- Suspend users
- Moderate reported content
- Access system-wide analytics reserved for admins

### 2.3 Admin Role — Admin

Admins are privileged users responsible for managing the platform, moderating content, and overseeing application activity. Admins have visibility into all user-facing areas of the application and may perform administrative actions through a non-technical admin portal.

**Admins can:**
- View and manage user accounts
- Suspend or reactivate users
- Review reported posts and boards
- Hide or remove inappropriate public content
- View moderation reports
- Access platform analytics and oversight tools
- Review creator and user activity when needed for moderation or support

**Admin actions must be recorded in an audit trail including:**
- Admin ID
- Action performed
- Target user or content item
- Timestamp

---

## 3. Global Business Rules

| ID | Rule |
|----|------|
| BR-01 | Guests may browse public content but must authenticate before performing actions such as uploading items, generating outfits, saving outfits, or posting content. |
| BR-02 | Only authenticated Creator users may upload wardrobe items. |
| BR-03 | Wardrobe items must include at minimum: image, category, and item name. |
| BR-04 | Outfit generation requires compatible clothing categories (for example: Top + Bottom). |
| BR-05 | If color extraction fails, the item is saved but marked "Needs Review." |
| BR-06 | Creator users may create either private or public boards. |
| BR-07 | A user cannot follow themselves. |
| BR-08 | Admin actions must be logged with admin ID, action, and timestamp. |
| BR-09 | Public content can be removed or hidden by admins if it violates platform policies. |
| BR-10 | If a guest attempts to access restricted functionality, the system redirects the user to the Login page. |

---

## 4. Functional Requirements (Use Cases)

All use cases follow the required template: Use Case ID, Name, Actor, Description, Preconditions, Postconditions, Main Flow, Alternative Flows, Exception Flows, Business Rules/Special Requirements.

---

### UC-001 — Register Account

| Field | Detail |
|-------|--------|
| **Actor** | Guest |
| **Description** | A guest creates a new account to access authenticated features of the platform. |
| **Pre-conditions** | Guest is not logged in. |
| **Post-conditions (Success)** | Account created successfully; user is redirected to the Login page. |
| **Post-conditions (Failure)** | No account created; error message displayed. |

**Main Flow:**
1. Guest navigates to the Register page.
2. System displays the registration form.
3. Guest enters display name, username, and password.
4. Guest submits the form.
5. System validates the inputs.
6. System creates a new Creator user account.
7. System displays confirmation and redirects the user to the Login page.

**Alternative Flows:**
- A1: Guest registers using an external authentication provider (future extension).

**Exception Flows:**
- E1: Username already registered → system displays "Username already in use."
- E2: Password does not meet minimum requirements → system displays password rules.

**Business Rules / Special Requirements:**
- Usernames must be unique.
- Passwords must meet minimum length requirements.

---

### UC-002 — Login

| Field | Detail |
|-------|--------|
| **Actor** | Creator / Admin |
| **Description** | A registered user logs into the system and is routed to the appropriate dashboard. |
| **Pre-conditions** | User account exists and is active. |
| **Post-conditions (Success)** | User session created and user redirected to appropriate dashboard. |
| **Post-conditions (Failure)** | No session created; error message displayed. |

**Main Flow:**
1. User navigates to the Login page.
2. User enters username and password.
3. User clicks Login.
4. System validates credentials.
5. System creates user session.
6. System redirects user to the appropriate dashboard:
   - Creator → Creator Dashboard
   - Admin → Admin Dashboard

**Alternative Flows:**
- A1: User selects "Remember me" to extend session duration.

**Exception Flows:**
- E1: Invalid credentials → error message "Incorrect username or password."
- E2: Suspended account → error message "Account suspended. Contact support."

**Business Rules / Special Requirements:**
- System may rate-limit repeated failed login attempts.

---

### UC-003 — Upload Clothing Item

| Field | Detail |
|-------|--------|
| **Actor** | Creator User |
| **Description** | User uploads a clothing image and saves the item to their wardrobe. |
| **Pre-conditions** | User is logged in. |
| **Post-conditions (Success)** | Item saved; color extraction attempted; item visible in wardrobe. |
| **Post-conditions (Failure)** | Item not saved; error shown. |

**Main Flow:**
1. User clicks "Add Item."
2. System displays upload form (image, name, category, optional tags).
3. User selects image and enters required details.
4. User submits form.
5. System validates required fields and file constraints.
6. System saves item.
7. System extracts dominant colors (background task).
8. System displays item detail page with extracted colors (or "Needs Review").

**Alternative Flows:**
- A1: User skips tags; system stores item with default tags empty.

**Exception Flows:**
- E1: Unsupported file type/oversized file → show upload rules.
- E2: Upload limit reached → show limit message + suggestion to upgrade to Creator.

**Business Rules / Special Requirements:**
- Must include image + category + name.
- Upload limits may vary based on account type or platform policies.

---

### UC-004 — Edit Clothing Item

| Field | Detail |
|-------|--------|
| **Actor** | Creator User |
| **Description** | User edits item details (name/category/tags/colors). |
| **Pre-conditions** | Logged in; item exists; user owns item. |
| **Post-conditions (Success)** | Updated item saved. |
| **Post-conditions (Failure)** | Item unchanged; error shown. |

**Main Flow:**
1. User opens item detail page.
2. User clicks Edit.
3. User updates fields.
4. User clicks Save.
5. System validates and saves changes.

**Alternative Flows:**
- A1: User selects "Reset colors to auto-detected."

**Exception Flows:**
- E1: Missing required field → highlight field + message.
- E2: Unauthorized user attempts edit → access denied.

**Business Rules / Special Requirements:**
- Only owner can edit item.

---

### UC-005 — Delete Clothing Item

| Field | Detail |
|-------|--------|
| **Actor** | Creator User |
| **Description** | User deletes an item from their wardrobe. |
| **Pre-conditions** | Logged in; item exists; user owns item. |
| **Post-conditions (Success)** | Item removed; linked outfits updated. |
| **Post-conditions (Failure)** | Item remains; error shown. |

**Main Flow:**
1. User opens item detail page.
2. User clicks Delete.
3. System displays confirmation dialog.
4. User confirms.
5. System deletes item and updates dependent outfits.

**Alternative Flows:**
- A1: User cancels deletion.

**Exception Flows:**
- E1: Item appears in saved outfits → system removes it and marks outfits "Needs Update."

**Business Rules / Special Requirements:**
- Deletion requires confirmation.

---

### UC-006 — View Wardrobe & Filter Items

| Field | Detail |
|-------|--------|
| **Actor** | Creator User |
| **Description** | User browses wardrobe items and filters by category/color/tags. |
| **Pre-conditions** | Logged in. |
| **Post-conditions** | Filtered results displayed. |

**Main Flow:**
1. User opens Wardrobe page.
2. System displays item grid.
3. User selects filters.
4. System updates grid results.

**Alternative Flows:**
- A1: User uses search by keyword.

**Exception Flows:**
- E1: No results → show empty state + "Clear Filters."

**Business Rules / Special Requirements:**
- Filters combine logically (AND) unless otherwise specified.

---

### UC-007 — Generate Outfit Recommendation

| Field | Detail |
|-------|--------|
| **Actor** | Creator User |
| **Description** | User requests outfit suggestions generated from wardrobe items. |
| **Pre-conditions** | Logged in; sufficient items exist. |
| **Post-conditions (Success)** | Outfit suggestions displayed. |
| **Post-conditions (Failure)** | No suggestions; user guidance shown. |

**Main Flow:**
1. User clicks Generate Outfit.
2. System displays optional constraints (occasion, colors, categories).
3. User submits constraints or skips.
4. System selects compatible items and generates outfits.
5. System displays suggestions and basic rationale (e.g., complementary colors).

**Alternative Flows:**
- A1: "Surprise me" with no constraints.

**Exception Flows:**
- E1: Not enough items → system explains missing categories.
- E2: Color data missing → suggest fixing "Needs Review" items.

**Business Rules / Special Requirements:**
- Must include at least Top + Bottom for a valid outfit suggestion.

---

### UC-008 — Save Outfit

| Field | Detail |
|-------|--------|
| **Actor** | Creator User |
| **Description** | User saves an outfit (generated or manual). |
| **Pre-conditions** | Logged in; outfit meets minimum requirements. |
| **Post-conditions (Success)** | Outfit saved and appears in Saved Outfits. |
| **Post-conditions (Failure)** | Outfit not saved; error shown. |

**Main Flow:**
1. User views outfit suggestion.
2. User clicks Save Outfit.
3. User enters name and optional notes.
4. System validates and saves outfit.

**Alternative Flows:**
- A1: Save from Outfit Builder view.

**Exception Flows:**
- E1: Outfit missing required items → validation error.

**Business Rules / Special Requirements:**
- Outfit name required.

---

### UC-009 — Create Board

| Field | Detail |
|-------|--------|
| **Actor** | Creator User |
| **Description** | User creates an inspiration board. |
| **Pre-conditions** | Logged in. |
| **Post-conditions (Success)** | Board created. |
| **Post-conditions (Failure)** | Board not created. |

**Main Flow:**
1. User clicks Create Board.
2. User enters board name and description.
3. User selects visibility:
   - Private
   - Public
4. User submits.
5. System creates board and opens board detail page.

**Alternative Flows:**
- A1: Creator defaults visibility to Public (optional default).

**Exception Flows:**
- E1: User attempts to create a public board without proper privileges → system blocks the action and displays an explanation.

**Business Rules / Special Requirements:**
- Visibility is role-based (BR-06).

---

### UC-010 — Post Outfit to Board

| Field | Detail |
|-------|--------|
| **Actor** | Creator User |
| **Description** | User posts a saved outfit to a board with a caption. |
| **Pre-conditions** | Logged in; outfit exists; board exists. |
| **Post-conditions (Success)** | Post appears on board. |
| **Post-conditions (Failure)** | No post created. |

**Main Flow:**
1. User selects a saved outfit.
2. Clicks Post to Board.
3. Selects a target board.
4. Adds caption/tags.
5. Clicks Publish.
6. System creates post and displays updated board.

**Alternative Flows:**
- A1: Post directly while viewing outfit details.

**Exception Flows:**
- E1: Board not found/deleted → show error and refresh list.

**Business Rules / Special Requirements:**
- Caption max length enforced.

---

### UC-011 — Follow Creator

| Field | Detail |
|-------|--------|
| **Actor** | Creator User |
| **Description** | User follows a creator to see their public content. |
| **Pre-conditions** | Logged in; target is Creator; content is public. |
| **Post-conditions (Success)** | Follow relationship saved. |
| **Post-conditions (Failure)** | Not following. |

**Main Flow:**
1. User opens Creator profile page.
2. Clicks Follow.
3. System updates follow state and confirms.

**Alternative Flows:**
- A1: Unfollow using same button.

**Exception Flows:**
- E1: User attempts to follow self → blocked.
- E2: Creator account suspended → cannot follow.

**Business Rules / Special Requirements:**
- Cannot follow self (BR-07).

---

### UC-012 — View Feed (Public Boards/Posts)

| Field | Detail |
|-------|--------|
| **Actor** | Guest / Creator User |
| **Description** | User browses public creator posts in a feed. |
| **Pre-conditions** | User is either a guest browsing public content or a logged-in creator user. |
| **Post-conditions** | Feed displayed. |

**Main Flow:**
1. User opens Feed page.
2. System displays public posts (followed creators prioritized).
3. User selects a post to view details.

**Alternative Flows:**
- A1: Filter feed by tags/color/occasion.

**Exception Flows:**
- E1: Network/server error → show retry message.

**Business Rules / Special Requirements:**
- Sorting rule may prioritize followed creators.

---

### UC-013 — Admin: Manage Users (Suspend/Reactivate/Role View)

| Field | Detail |
|-------|--------|
| **Actor** | Admin |
| **Description** | Admin manages user accounts and role-based access. |
| **Pre-conditions** | Admin is logged in. |
| **Post-conditions (Success)** | User status updated; audit log written. |
| **Post-conditions (Failure)** | No changes saved. |

**Main Flow:**
1. Admin opens Admin Dashboard.
2. Navigates to User Management.
3. Searches/selects a user.
4. Views user details (role, status, reports).
5. Selects action: Suspend or Reactivate.
6. System applies action and logs it.

**Alternative Flows:**
- A1: Bulk actions (optional future scope).

**Exception Flows:**
- E1: Attempt to suspend another admin → blocked or requires super-admin.

**Business Rules / Special Requirements:**
- Admin actions must be auditable (BR-08).

---

### UC-014 — Admin: Moderate Content (Remove/Hide Posts/Boards)

| Field | Detail |
|-------|--------|
| **Actor** | Admin |
| **Description** | Admin reviews reported content and removes or hides inappropriate posts. |
| **Pre-conditions** | Admin logged in; content exists. |
| **Post-conditions (Success)** | Content hidden/removed; log updated. |
| **Post-conditions (Failure)** | Content unchanged. |

**Main Flow:**
1. Admin opens Moderation Queue.
2. Selects a reported post/board.
3. Reviews content and report reason(s).
4. Takes action: Remove, Hide, Warn user, or No Action.
5. System updates content visibility and logs action.

**Alternative Flows:**
- A1: "Hide pending review" for urgent cases.

**Exception Flows:**
- E1: Content already removed → show info and refresh queue.

**Business Rules / Special Requirements:**
- Removed content must not appear in public feed (BR-09).

---

### UC-015 — Manage Account Settings

| Field | Detail |
|-------|--------|
| **Actor** | Creator User |
| **Description** | Users manage their account settings, including updating their profile information and password. |
| **Pre-conditions** | User is logged into the system; user account exists and is active. |
| **Post-conditions (Success)** | Updated account information is saved; new settings are reflected immediately in the user profile. |
| **Post-conditions (Failure)** | No changes are saved; error message is displayed. |

**Main Flow:**
1. User navigates to the Account Settings page.
2. System displays editable account information fields.
3. User updates one or more fields such as:
   - 3.1 Display name
   - 3.2 Password
   - 3.3 Profile description (creator only)
4. User clicks Save Changes.
5. System validates all updated fields.
6. System updates the user account information in the system.
7. System displays confirmation that the account settings were updated successfully.

**Alternative Flows:**
- A1: User changes password
  - Trigger: User chooses to change their password.
  - 3a. User selects Change Password.
  - 3b. User enters current password.
  - 3c. User enters new password.
  - 3d. System validates password requirements.
  - 3e. Flow continues to step 5 of the main flow.

**Exception Flows:**
- E1: Incorrect current password — system displays "Current password is incorrect."
- E2: Password does not meet requirements — system displays password requirement message.

---

## 5. Screens & Use Case ↔ Screen Mapping

### 5.1 Screen List (18 Screens Total)

| ID | Screen |
|----|--------|
| S-01 | Landing / Home |
| S-02 | Register |
| S-03 | Login |
| S-04 | Creator Dashboard |
| S-05 | Wardrobe (Grid + Filters) |
| S-06 | Add Item (Upload) |
| S-07 | Item Detail / Edit |
| S-08 | Outfit Generator (Constraints + Results) |
| S-09 | Outfit Detail (Save + Post) |
| S-10 | Saved Outfits List |
| S-11 | Create Board |
| S-12 | Board Detail (Posts Grid) |
| S-13 | Feed (Public Content) |
| S-14 | Creator Profile (Follow Button) |
| S-15 | Account Settings |
| S-16 | Admin Dashboard |
| S-17 | Admin User Management |
| S-18 | Admin Moderation Queue |

### 5.2 Use Case ↔ Screen Mapping (Bidirectional)

The following mapping shows how each use case is implemented through the application's user interface screens. This mapping ensures traceability between system requirements and the implemented interface.

#### Use Case → Screen Mapping

| Use Case | Screens |
|----------|---------|
| UC-001 Register Account | S-02 Register, S-03 Login |
| UC-002 Login | S-03 Login, S-04 Creator Dashboard, S-16 Admin Dashboard |
| UC-003 Upload Clothing Item | S-06 Add Item, S-05 Wardrobe, S-07 Item Detail |
| UC-004 Edit Clothing Item | S-07 Item Detail |
| UC-005 Delete Clothing Item | S-07 Item Detail, S-05 Wardrobe |
| UC-006 View Wardrobe & Filter Items | S-05 Wardrobe |
| UC-007 Generate Outfit Recommendation | S-08 Outfit Generator, S-09 Outfit Detail |
| UC-008 Save Outfit | S-09 Outfit Detail, S-10 Saved Outfits |
| UC-009 Create Board | S-11 Create Board, S-12 Board Detail |
| UC-010 Post Outfit to Board | S-09 Outfit Detail, S-12 Board Detail |
| UC-011 Follow Creator | S-14 Creator Profile, S-13 Feed |
| UC-012 View Feed | S-13 Feed |
| UC-013 Admin Manage Users | S-16 Admin Dashboard, S-17 Admin User Management |
| UC-014 Admin Moderate Content | S-16 Admin Dashboard, S-18 Admin Moderation Queue |
| UC-015 Manage Account Settings | S-15 Account Settings |

#### Screen → Use Case Mapping

| Screen | Use Cases |
|--------|-----------|
| S-01 Landing / Home | UC-012 |
| S-02 Register | UC-001 |
| S-03 Login | UC-001, UC-002 |
| S-04 Creator Dashboard | UC-002 |
| S-05 Wardrobe | UC-003, UC-005, UC-006 |
| S-06 Add Item | UC-003 |
| S-07 Item Detail / Edit | UC-004, UC-005 |
| S-08 Outfit Generator | UC-007 |
| S-09 Outfit Detail | UC-007, UC-008, UC-010 |
| S-10 Saved Outfits | UC-008 |
| S-11 Create Board | UC-009 |
| S-12 Board Detail | UC-009, UC-010 |
| S-13 Feed | UC-011, UC-012 |
| S-14 Creator Profile | UC-011 |
| S-15 Account Settings | UC-015 |
| S-16 Admin Dashboard | UC-013, UC-014 |
| S-17 Admin User Management | UC-013 |
| S-18 Admin Moderation Queue | UC-014 |

---

> **Note — DELETE BEFORE SUBMISSION:** Page assignments by team member:
>
> | Screen | Assigned To |
> |--------|-------------|
> | S-01 Landing / Home | Lein |
> | S-02 Register | Lein |
> | S-03 Login | Lein |
> | S-04 Creator Dashboard | Jaeger |
> | S-05 Wardrobe (Grid + Filters) | Abdur |
> | S-06 Add Item (Upload) | Abdur |
> | S-07 Item Detail / Edit | Abdur |
> | S-08 Outfit Generator (Constraints + Results) | Abdur |
> | S-09 Outfit Detail (Save + Post) | Lein |
> | S-10 Saved Outfits List | Jaeger |
> | S-11 Create Board | Jaeger |
> | S-12 Board Detail (Posts Grid) | Jaeger |
> | S-13 Feed (Public Content) | Lein |
> | S-14 Creator Profile (Follow Button) | Lein |
> | S-15 Account Settings | Lein |
> | S-16 Admin Dashboard | Aden |
> | S-17 Admin User Management | Aden |
> | S-18 Admin Moderation Queue | Aden |
