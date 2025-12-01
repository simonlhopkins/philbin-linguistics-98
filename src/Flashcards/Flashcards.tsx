import PublicGoogleSheetsParser from "public-google-sheets-parser";
import { useEffect } from "react";
import { flashcardSlice, TestStatus } from "../Redux/flashcardSlice.ts";
import { useAppDispatch, useAppSelector } from "../Redux/hooks.ts";
import Study from "./Study.tsx";
import TestComponent from "./Test/TestComponent.tsx";
import TestResults from "./TestResults.tsx";

export default function Flashcards() {
  // const [selectedMode, setSelectedMode] = useState<MODE>(MODE.STUDY);

  const { currentTestData } = useAppSelector((state) => state.flashcard);
  const dispatch = useAppDispatch();

  useEffect(() => {
    RefreshItems();
  }, []);
  function RefreshItems() {
    const options = { useFormat: true };
    const parser = new PublicGoogleSheetsParser(
      "1Sqog1gAuZK7Ca4dDxveq8DH6DdeD2ELoexJGjacI_nk",
      options
    );

    parser.parse().then((data: GoogleSheetRow[]) => {
      const flashcardData = data
        .filter((row) => row["japanese text"] != undefined)
        .map(
          (row, index) =>
            ({
              id: row["id"],
              japaneseText: row["japanese text"],
              meaning: row["meaning"],
              flavorText: row["flavor text"],
              dateLearned: row["date learned"],
            } as FlashCardData)
        )
        .sort((a, b) => a.id - b.id);
      dispatch(flashcardSlice.actions.SetLoadedCards(flashcardData));
    });
  }

  function GetRenderedBody() {
    if (!currentTestData) {
      return <Study onRefreshClicked={RefreshItems} />;
    }
    switch (currentTestData.status) {
      case TestStatus.ABANDONED:
        return <Study onRefreshClicked={RefreshItems} />;
      case TestStatus.FINISHED:
        return <TestResults currentTestData={currentTestData} />;
      case TestStatus.PROGRESS:
        return <TestComponent currentTestData={currentTestData} />;
      default:
        return <Study onRefreshClicked={RefreshItems} />;
    }
  }

  return (
    <div>
      <div className="window-body flex-1 flex flex-col">
        <div className="window">
          <div className="window-body">{GetRenderedBody()}</div>
        </div>
      </div>
    </div>
  );
}

export interface FlashCardData {
  id: number;
  japaneseText: string;
  meaning: string;
  flavorText: string;
  dateLearned: string;
}

interface GoogleSheetRow {
  "japanese text": string;
  meaning: string;
  "flavor text": string;
  "date learned": string;
  type: "PHRASE" | "WORD" | string; // adjust as needed
  id: number;
}
