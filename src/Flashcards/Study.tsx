import clsx from "clsx";
import { useMemo, useState } from "react";
import {
  GetPhraseFromFlashCardData,
  type FlashCardData,
} from "./Flashcards.tsx";
import { SetHelpers } from "../SetHelpers.ts";
import { useAppDispatch, useAppSelector } from "../Redux/hooks.ts";
import { flashcardSlice } from "../Redux/flashcardSlice.ts";

interface Props {
  onRefreshClicked: () => void;
}
export default function Study({ onRefreshClicked }: Props) {
  const [sortDir, setSortDir] = useState<SortDirection>(
    SortDirection.ASCENDING
  );
  const [sortMethod, setSortMethod] = useState<SortMethod | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { selectedCards, loadedCards, currentTestData } = useAppSelector(
    (state) => state.flashcard
  );
  const dispatch = useAppDispatch();

  const sortedFlashCards = useMemo(() => {
    const arr = [...loadedCards];
    const dir = sortDir == SortDirection.ASCENDING ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortMethod) {
        case SortMethod.PHRASE:
          return (
            GetPhraseFromFlashCardData(a).localeCompare(
              GetPhraseFromFlashCardData(b)
            ) * dir
          );

        case SortMethod.MEANING:
          return a.meaning.localeCompare(b.meaning) * dir;

        case SortMethod.Flavor:
          return (a.flavorText || "").localeCompare(b.flavorText || "") * dir;

        case SortMethod.DATE_LEARNED:
          return (
            (new Date(a.dateLearned).getTime() -
              new Date(b.dateLearned).getTime()) *
            dir
          );
        default:
          return 0;
      }
    });

    return arr;
  }, [loadedCards, sortMethod, sortDir]);

  function setSortDirectionAndMaybeChangeDirection(newSortMethod: SortMethod) {
    if (sortMethod == newSortMethod) {
      setSortDir((prev) => prev ^ 1);
    } else {
      setSortDir(SortDirection.ASCENDING);
    }
    setSortMethod(newSortMethod);
  }

  return (
    <div className={"flex gap-2 flex-wrap"}>
      <div className="sunken-panel inline-block h-96 max-w-xl">
        <table className={clsx("interactive")}>
          <thead>
            <tr>
              <th className="!p-0">
                <button
                  className={"w-full text-left"}
                  onClick={() =>
                    setSortDirectionAndMaybeChangeDirection(SortMethod.PHRASE)
                  }
                >
                  Phrase
                </button>
              </th>
              <th className="!p-0">
                <button
                  className={"w-full text-left"}
                  onClick={() =>
                    setSortDirectionAndMaybeChangeDirection(SortMethod.MEANING)
                  }
                >
                  Meaning
                </button>
              </th>
              <th className="!p-0">
                <button
                  className={"w-full text-left"}
                  onClick={() =>
                    setSortDirectionAndMaybeChangeDirection(SortMethod.Flavor)
                  }
                >
                  Flavor Text
                </button>
              </th>
              <th className="!p-0">
                <button
                  className={"w-full text-left"}
                  onClick={() =>
                    setSortDirectionAndMaybeChangeDirection(
                      SortMethod.DATE_LEARNED
                    )
                  }
                >
                  Date Learned
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedFlashCards.map((row, index) => (
              <tr
                key={row.id}
                className={clsx(
                  new Set(selectedCards).has(row.id) && "highlighted",
                  "select-none"
                )}
                // onClick={()=>{
                //     if(selectedItems.has(row.id)){
                //         setSelectedItems(SetHelpers.difference(selectedItems, new Set([row.id])))
                //     }else{
                //         setSelectedItems(SetHelpers.union(selectedItems, new Set([row.id])))
                //     }
                // }}
                onMouseDown={() => {
                  setIsDragging(true);
                  if (new Set(selectedCards).has(row.id)) {
                    dispatch(
                      flashcardSlice.actions.RemoveCardFromSelection(row.id)
                    );
                  } else {
                    dispatch(flashcardSlice.actions.AddCardToSelection(row.id));
                  }
                }}
                onMouseEnter={() => {
                  if (!isDragging) return;

                  dispatch(flashcardSlice.actions.AddCardToSelection(row.id));
                }}
                onMouseUp={() => setIsDragging(false)}
              >
                <td>{GetPhraseFromFlashCardData(row)}</td>
                <td>{row.meaning}</td>
                <td>{row.flavorText}</td>
                <td>{new Date(row.dateLearned).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={"grid grid-cols-1 grid-rows-6 gap-3"}>
        <button
          onClick={() => {
            dispatch(flashcardSlice.actions.SelectAll());
          }}
        >
          Select All
        </button>
        <button
          onClick={() => {
            dispatch(flashcardSlice.actions.ClearSelection());
          }}
        >
          Deselect All
        </button>
        <button
          onClick={() => {
            console.log("todo...");
            dispatch(flashcardSlice.actions.SelectDaily());
          }}
        >
          <img
            src="/man_with_hat.png"
            alt=""
            className="h-4 inline-block mr-2"
          />
          Daily Challenge
        </button>
        <button onClick={onRefreshClicked}>
          <img
            src="/refresh_page.png"
            alt=""
            className="inline-block h-6 mr-2"
          />
          Refresh
        </button>
        <button
          onClick={() => {
            dispatch(
              flashcardSlice.actions.SetTestToCurrentlySelectedCardsAndStart()
            );
          }}
          disabled={selectedCards.length == 0}
        >
          <img
            src="/book_with_question_mark.png"
            alt=""
            className="inline-block h-6 mr-2"
          />
          New Test
        </button>
        <button
          disabled={currentTestData == null}
          onClick={() => {
            dispatch(flashcardSlice.actions.ResumeTest());
          }}
        >
          {`Resume (${
            currentTestData &&
            (
              ((currentTestData.currentStep + 1) /
                currentTestData.testSteps.length) *
              100
            ).toFixed(0)
          }%)`}
        </button>
      </div>
    </div>
  );
}

enum SortMethod {
  PHRASE = 0,
  MEANING = 1,
  Flavor = 2,
  DATE_LEARNED = 3,
}
enum SortDirection {
  ASCENDING = 0,
  DESCENDING = 1,
}
