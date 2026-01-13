import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HomeScreen } from './screens/HomeScreen';
import { PlayScreen } from './screens/PlayScreen';
import { CaptureScreen } from './screens/CaptureScreen';
import { PokedexScreen } from './screens/PokedexScreen';
import { SettingsScreen } from './screens/SettingsScreen';

function App() {
  // Use basename for GitHub Pages deployment
  const basename = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={basename}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/play" element={<PlayScreen />} />
          <Route path="/capture" element={<CaptureScreen />} />
          <Route path="/pokedex" element={<PokedexScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
