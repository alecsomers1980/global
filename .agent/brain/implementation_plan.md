# Everest Motoring: Admin Car Assignment Feature

## Goal Description
Add a new feature in the Everest Admin portal allowing administrators to explicitly assign an available vehicle from inventory to a registered client. This assignment will populate the client's Dashboard (Client Portal) with the vehicle tracking and finance forms.

## Proposed Changes

### Everest Motoring Application
#### [NEW] `src/app/admin/assign/page.js`
1.  **Data Fetching:**
    *   Fetch all users from `profiles` where `role = 'client'`.
    *   Fetch all vehicles from `cars` where `status = 'available'`.
2.  **UI Construction:** Create a dedicated "Assign Vehicle" page containing a list of clients and an "Add New Client" section.
    *   **Client Searchable List:** Instead of a simple dropdown, build a searchable data table (similar to `TradeInsTable` or `LeadsTable`) where the admin can search for existing clients by name or phone/email.
    *   **Vehicle Dropdown:** Once a client is selected, provide a dropdown to select an available vehicle.
    *   **Add Client Functionality:** Include a form to add a new client (Name, Surname, Email, Phone).

#### [NEW] `src/app/admin/assign/AssignClientUI.jsx`
1.  **Client Component:** This will hold the interactive state for searching clients, selecting a vehicle, and the "Add New Client" form.
2.  **WhatsApp Integration:** When adding a new client, include an option to send a WhatsApp message containing a specialized registration link pre-filled with their details (`/auth/register-client?first_name=X&last_name=Y&email=Z&phone=W`).
3.  **Action Handlers:** Connect the UI buttons to the server actions.

#### [NEW] `src/app/admin/assign/actions.js`
1.  **Server Action (`assignCarAction`):** Handle the form submission for assigning a car.
    *   Insert a new row into the `leads` table, mapping the selected `client_id` and `car_id`, populating the client's name and details automatically, and setting the status to `'finance_pending'`.
    *   Trigger `revalidatePath` to update the Leads and Portal data caches.
2.  **Server Action (`inviteNewClientAction`):** (Optional, if we want to send invite emails from the server). The admin can invite the user utilizing Supabase's `auth.admin.inviteUserByEmail`, or simply rely on the WhatsApp link. Let's stick to the WhatsApp pre-filled link for immediate client interaction as requested, as the existing invite works similarly.

#### [MODIFY] [layout.js](file:///c:/Users/info/OneDrive/Documents/Antigravity/everest-motoring/src/app/admin/layout.js)
1.  **Navigation Links:** Add a new link `<a href="/admin/assign">Assign Vehicle</a>` into the top navigation bar next to "Car Inquiries".

## Verification Plan

### Automated Tests
*   Run the Next.js dev server. No build errors should occur.

### Manual Verification
*   Log in as an admin and navigate to the new "Assign Vehicle" page.
*   Search for the `everest@clients.co.za` test user.
*   Assign an available vehicle to the test user.
*   Log in as the test user and verify that their Portal clearly displays the assigned vehicle and requests them to upload their finance documents.
*   Test the "Add Client" feature to ensure the WhatsApp link generates correctly with pre-filled parameters.
