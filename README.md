# Name My Child

An app to suggest names for your child and allows you to store your preferred ones.

## User Journeys

### 1. Sign In with ZAPT

- **Step 1**: User opens the app and is presented with a "Sign in with ZAPT" prompt.
- **Step 2**: User clicks on one of the social login options (Google, Facebook, Apple) or uses Magic Link to sign in.
- **Step 3**: Upon successful authentication, the user is redirected to the home page.

### 2. Enter Name Preferences

- **Step 1**: On the home page, the user sees a form to enter their preferences:
  - Select Gender (Boy, Girl, Unisex)
  - Enter Origin (e.g., Hebrew, Latin)
  - Enter Meaning (e.g., "strong", "wisdom")
- **Step 2**: User fills in any or all of the fields based on their preferences.
- **Step 3**: User clicks the "Generate Names" button.

### 3. Generate Name Suggestions

- **Step 1**: Upon clicking "Generate Names", the app shows a loading state indicating that names are being generated.
- **Step 2**: The app sends a request to the backend to generate name suggestions based on the provided preferences.
- **Step 3**: Generated names are displayed in a list on the right side of the screen.

### 4. Save Preferred Names

- **Step 1**: Next to each generated name, there is a "Save" button.
- **Step 2**: User clicks on the "Save" button for any names they like.
- **Step 3**: The selected names are added to the user's saved names list stored in the database.

### 5. View Saved Names

- **Step 1**: User scrolls down to the "My Saved Names" section.
- **Step 2**: User sees a grid of all the names they have saved.
- **Step 3**: User can review their saved names at any time by logging back into the app.

### 6. Sign Out

- **Step 1**: User clicks on the "Sign Out" button located at the top right corner of the home page.
- **Step 2**: User is signed out and redirected back to the login page.

## External API Services Used

- **ZAPT**: Used for event handling and integrating backend services.
- **Supabase Auth**: Used for user authentication.
- **OpenAI (via ZAPT events)**: Used to generate baby name suggestions based on user preferences.