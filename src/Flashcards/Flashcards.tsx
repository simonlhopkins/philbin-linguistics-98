import PublicGoogleSheetsParser from "public-google-sheets-parser";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Study from "./Study.tsx";
import TestComponent from "./TestComponent.tsx";
import { useAppDispatch, useAppSelector } from "../Redux/hooks.ts";
import { flashcardSlice, TestStatus } from "../Redux/flashcardSlice.ts";
import TestResults from "./TestResults.tsx";

export default function Flashcards() {
  // const [selectedMode, setSelectedMode] = useState<MODE>(MODE.STUDY);

  const { loadedCards, currentTestData } = useAppSelector(
    (state) => state.flashcard
  );

  const showStudyUI =
    currentTestData == null ||
    (currentTestData && currentTestData.status == TestStatus.ABANDONED);
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
        .filter((row) => row["phrase/word"] != undefined)
        .map(
          (row, index) =>
            ({
              id: row["id"],
              phrase: row["phrase/word"],
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
        return <TestResults />;
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

enum MODE {
  STUDY = 0,
  TEST = 1,
}
export interface FlashCardData {
  id: number;
  phrase: string;
  meaning: string;
  flavorText: string;
  dateLearned: string;
}

interface GoogleSheetRow {
  "phrase/word": string;
  meaning: string;
  "flavor text": string;
  "date learned": string;
  type: "PHRASE" | "WORD" | string; // adjust as needed
  id: number;
}
