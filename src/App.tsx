import "./App.css";
import "98.css";
import Flashcards from "./Flashcards/Flashcards.tsx";
import { Route, Routes, useLocation } from "react-router";
import DescriptionChallenge from "./DescriptionChallenge/DescriptionChallenge.tsx";
import Home from "./Home.tsx";

function App() {
  let location = useLocation();
  return (
    <>
      <div className="window-body flex-1 flex flex-col w-4xl max-w-full">
        <a href="/">
          <img src="/links_to_firey_sites.gif" alt="" className="mb-2 w-full" />
        </a>
        <menu role="tablist">
          <li role="tab" aria-selected={location.pathname == "/"}>
            <a href="/">Home</a>
          </li>
          <li role="tab" aria-selected={location.pathname == "/flashcards"}>
            <a href="/flashcards">
              <img
                src="/directory_closed-3.png"
                alt=""
                className="h-5 inline-block mr-2"
              />
              Flashcards
            </a>
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
              <Route index element={<Home />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/writing" element={<p>coming soon</p>} />
              <Route path="/stats" element={<p>coming soon</p>} />
              <Route path="/daily" element={<p>coming soon</p>} />
              <Route path="*" element={<p>not found</p>} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
