// dichiarazione delle costanti
const clientId = '44c4440fb34d431ba0be32109daa2bc7';
const clientSecret = 'd324197320de458695f989a477b6b3f7';
const redirectUri = 'file:///C:/Users/cyber/Desktop/prova%20spotify/index.html';
const authEndpoint = 'https://accounts.spotify.com/authorize';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';

// dichiarazione delle variabili
let accessToken = '';

// funzione per ottenere l'access token
function getAccessToken() {
  // verifico se ho già l'access token
  if (accessToken) {
    return accessToken;
  }

  // se non ho l'access token, lo richiedo all'API di Spotify
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) {
    // se non ho il codice, reindirizzo l'utente alla pagina di autorizzazione di Spotify
    window.location.href = `${authEndpoint}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user-read-private`;
    return;
  }

  // se ho il codice, lo invio all'API di Spotify per ottenere l'access token
  return fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`
  })
  .then(response => response.json())
  .then(data => {
    accessToken = data.access_token;
    return accessToken;
  })
  .catch(error => console.error(error));
}

// funzione per ottenere i dati dell'utente
async function getUserData() {
  const token = await getAccessToken();
  return fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .catch(error => console.error(error));
}

// esempio di utilizzo delle funzioni
getUserData().then(data => console.log(data));

// Define the UI controller
const UICtrl = {
    resultsList: document.getElementById('results-list'),
  };
  
  // Define the API controller
  const APICtrl = {
    searchPlaylists: async function(token, trackName) {
      // Encode the track name for use in the API request
      const encodedTrackName = encodeURIComponent(trackName);
      // Make a GET request to the Spotify API to search for playlists containing the specified track
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodedTrackName}&type=playlist&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Parse the response as JSON
      const data = await response.json();
      // Return the playlists found in the response
      return data.playlists.items;
    },
  };
  
  // Define the app controller
  const AppCtrl = {
    searchPlaylists: async function() {
      // Get the access token
      const token = UICtrl.getStoredToken().token;
      // Get the track name input field value
      const trackName = document.getElementById('track-name-input').value;
      // Search for playlists containing the specified track
      const playlists = await APICtrl.searchPlaylists(token, trackName);
      // Clear the previous results from the UI
      UICtrl.clearResults();
      // Display the playlists found in the UI
      playlists.forEach(playlist => {
        const li = document.createElement('li');
        li.textContent = playlist.name;
        UICtrl.resultsList.appendChild(li);
      });
    },
  };
  
  // Add event listener to the search button
  document.getElementById('search-button').addEventListener('click', AppCtrl.searchPlaylists);