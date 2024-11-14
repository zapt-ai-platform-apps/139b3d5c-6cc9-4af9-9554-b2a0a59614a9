import { createSignal, onMount, createEffect, For, Show } from 'solid-js';
import { createEvent, supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { SolidMarkdown } from "solid-markdown";
import { useNavigate } from '@solidjs/router';

function App() {
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [loading, setLoading] = createSignal(false);
  const [namePreferences, setNamePreferences] = createSignal({
    gender: '',
    origin: '',
    meaning: ''
  });
  const [generatedNames, setGeneratedNames] = createSignal([]);
  const [savedNames, setSavedNames] = createSignal([]);
  const navigate = useNavigate();

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
    }
  };

  onMount(checkUserSignedIn);

  createEffect(() => {
    const authListener = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener.data.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const fetchSavedNames = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch('/api/getSavedNames', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setSavedNames(data);
    } else {
      console.error('Error fetching saved names:', response.statusText);
    }
  };

  createEffect(() => {
    if (!user()) return;
    fetchSavedNames();
  });

  const handleGenerateNames = async () => {
    setLoading(true);
    try {
      const prompt = `Suggest 10 unique baby names ${
        namePreferences().gender ? `for a ${namePreferences().gender}` : ''
      }${
        namePreferences().origin ? ` of ${namePreferences().origin} origin` : ''
      }${
        namePreferences().meaning ? ` that mean "${namePreferences().meaning}"` : ''
      }. Provide the names in a JSON array format like: { "names": ["Name1", "Name2", ...] }`;
      const result = await createEvent('chatgpt_request', {
        prompt: prompt,
        response_type: 'json'
      });
      setGeneratedNames(result.names || []);
    } catch (error) {
      console.error('Error generating names:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveName = async (name) => {
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const response = await fetch('/api/saveName', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        setSavedNames([...savedNames(), { name }]);
      } else {
        console.error('Error saving name');
      }
    } catch (error) {
      console.error('Error saving name:', error);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 p-4 text-gray-800">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center h-full">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-center text-blue-600">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                view="magic_link"
                showLinks={false}
                authView="magic_link"
              />
            </div>
          </div>
        }
      >
        <div class="max-w-4xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-blue-600">Name My Child</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="space-y-6">
              <h2 class="text-2xl font-bold text-blue-600">Enter Your Preferences</h2>
              <div class="space-y-4">
                <select
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent box-border"
                  onInput={(e) => setNamePreferences({ ...namePreferences(), gender: e.target.value })}
                  value={namePreferences().gender}
                >
                  <option value="">Select Gender</option>
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                  <option value="unisex">Unisex</option>
                </select>
                <input
                  type="text"
                  placeholder="Origin (e.g., Hebrew, Latin)"
                  value={namePreferences().origin}
                  onInput={(e) => setNamePreferences({ ...namePreferences(), origin: e.target.value })}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent box-border"
                />
                <input
                  type="text"
                  placeholder='Meaning (e.g., "strong", "wisdom")'
                  value={namePreferences().meaning}
                  onInput={(e) => setNamePreferences({ ...namePreferences(), meaning: e.target.value })}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent box-border"
                />
                <button
                  class={`w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleGenerateNames}
                  disabled={loading()}
                >
                  <Show when={loading()}>Generating Names...</Show>
                  <Show when={!loading()}>Generate Names</Show>
                </button>
              </div>
            </div>

            <div class="space-y-6">
              <h2 class="text-2xl font-bold text-blue-600">Generated Names</h2>
              <Show when={generatedNames().length > 0} fallback={<p class="text-gray-600">No names generated yet.</p>}>
                <ul class="space-y-2">
                  <For each={generatedNames()}>
                    {(name) => (
                      <li class="flex justify-between items-center bg-white p-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                        <span>{name}</span>
                        <button
                          class="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-4 rounded-full cursor-pointer"
                          onClick={() => saveName(name)}
                        >
                          Save
                        </button>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </div>
          </div>

          <div class="mt-8">
            <h2 class="text-2xl font-bold mb-4 text-blue-600">My Saved Names</h2>
            <Show when={savedNames().length > 0} fallback={<p class="text-gray-600">You haven't saved any names yet.</p>}>
              <ul class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <For each={savedNames()}>
                  {(item) => (
                    <li class="bg-white p-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                      {item.name}
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default App;