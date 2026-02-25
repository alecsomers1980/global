# Everest Motoring: Client Portal & Admin Updates

## Client Registration Fix
- [x] Investigate the sign-up API route or server action handling client registration to identify why new users get assigned the 'affiliate' role instead of 'client'.
- [ ] Update the registration code to assign the correct default role ('client') for client portal sign-ups based on the presence of an affiliate code.
- [x] Connect to Supabase via script or command to manually update the role of `everest@clients.co.za` to `client` (delegated to user).

## Admin Portal: Assign Car to Client
- [ ] Research the existing Admin portal structure (`/admin`) and database schema for clients and inventory/cars.
- [ ] Design the UI/UX for an admin to select a client and a car from inventory to assign them.
- [ ] Plan the database updates required to link a car to a client profile (e.g., a new table or an updated column in `profiles` or `inventory`).
- [ ] Implement the backend logic to handle the assignment.
- [ ] Update the Client Portal so the client can see their assigned car and fill in the necessary finance/buying information.
