import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HomeScreen } from './screens/HomeScreen';
import { PlayScreen } from './screens/PlayScreen';
import { CaptureScreen } from './screens/CaptureScreen';
import { PokedexScreen } from './screens/PokedexScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { BattleHubScreen } from './screens/BattleHubScreen';
import { BattleSelectScreen } from './screens/BattleSelectScreen';
import { BattleFightScreen } from './screens/BattleFightScreen';
import { LegendaryBattleScreen } from './screens/LegendaryBattleScreen';

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
          <Route path="/battle" element={<BattleHubScreen />} />
          <Route path="/battle/select" element={<BattleSelectScreen />} />
          <Route path="/battle/fight" element={<BattleFightScreen />} />
          <Route path="/battle/legendary/:bossId" element={<LegendaryBattleScreen />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
