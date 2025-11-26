import "./App.css";
import "98.css";
import Flashcards from "./Flashcards/Flashcards.tsx";
import { Route, Routes, useLocation } from "react-router";
import DescriptionChallenge from "./DescriptionChallenge/DescriptionChallenge.tsx";

function App() {
  let location = useLocation();
  return (
    <>
      <div className="window-body flex-1 flex flex-col">
        <menu role="tablist">
          <li role="tab" aria-selected={location.pathname == "/flashcards"}>
            <a href="/flashcards">Flashcards</a>
          </li>
          <li role="tab" aria-selected={location.pathname == "/writing"}>
            <a href="/writing">Writing</a>
          </li>
          <li role="tab" aria-selected={location.pathname == "/stats"}>
            <a href="/stats">Stats</a>
          </li>
          <li role="tab" aria-selected={location.pathname == "/daily"}>
            <a href="/daily">Daily Game</a>
          </li>
        </menu>
        <div className="window flex-1" role="tabpanel">
          <div className="window-body">
            <Routes>
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/writing" element={<DescriptionChallenge />} />
              <Route path="*" element={<p>not found</p>} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
