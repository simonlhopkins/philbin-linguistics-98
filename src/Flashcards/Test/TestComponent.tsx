import "canvas-confetti";
import clsx from "clsx";
import React, { useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Face,
  flashcardSlice,
  ResponseStatus,
  type TestData,
} from "../../Redux/flashcardSlice.ts";
import { useAppDispatch, useAppSelector } from "../../Redux/hooks.ts";
import TextHelpers from "../../TextHelpers.ts";
import MissingCardText from "./MissingCardText.tsx";
import SpeechButton from "./SpeechButton.tsx";
import VocalizeButton from "./VocalizeButton.tsx";
import CopyToast from "../../Toasts/CopyToast.tsx";

interface Props {
  currentTestData: TestData;
}

export default function TestComponent({ currentTestData }: Props) {
  const { loadedCards } = useAppSelector((state) => state.flashcard);
  const dispatch = useAppDispatch();
  if (currentTestData.testSteps.length == 0) {
    return (
      <p>
        Length 0 test???{" "}
        <button
          onClick={() => {
            dispatch(flashcardSlice.actions.ExitTest());
          }}
        >
          Exit Test
        </button>
      </p>
    );
  }
  const currentTestStep =
    currentTestData.testSteps[currentTestData.currentStep];
  const currentFlashCardData = loadedCards.find(
    (card) => card.id == currentTestStep.cardId
  );
  const percentComplete =
    (currentTestData.currentStep + 1) / currentTestData.testSteps.length;

  //helper for whether to animate or not
  const cardIdBeforeClickRef = useRef<number | null>(null);
  //when the selection changes reset your current test
  useEffect(() => {
    //code smell, this needs to go first or else SetCardAsSeen triggers re render.
    cardIdBeforeClickRef.current = currentTestStep.cardId;
    dispatch(flashcardSlice.actions.SetCardAsSeen(currentTestStep.cardId));
  }, [currentTestData.currentStep]);
  return (
    <div className={"flex flex-col gap-2"}>
      <div className="flex flex-row gap-2 flex-wrap max-w-full">
        <div
          className={
            "flex flex-col min-w-full sm:min-w-90 max-w-full gap-2 flex-1"
          }
        >
          <div
            onClick={() => {
              dispatch(flashcardSlice.actions.FlipCard(currentTestStep.cardId));
            }}
            className={clsx(
              "window transform-3d w-full aspect-video max-w-full perspective-midrange flex flex-col",
              currentTestStep.faceShowing ==
                (currentTestData.invertFaces
                  ? Face.ENGLISH_TEXT
                  : Face.JAPANESE_TEXT) && "rotate-y-180",
              cardIdBeforeClickRef.current == currentTestStep.cardId &&
                "transition-transform duration-500"
            )}
          >
            <div
              className={clsx(
                "window-body flex-1 flip-card",
                currentTestStep.responseStatus == ResponseStatus.CORRECT &&
                  "text-green-600",
                currentTestStep.responseStatus == ResponseStatus.INCORRECT &&
                  "text-red-500"
              )}
            >
              {/* Front */}
              <div className="flip-card-side flip-card-front">
                <h2>
                  {currentFlashCardData ? (
                    currentTestData.showKanji ? (
                      GetFurigana(currentFlashCardData.japaneseText)
                    ) : (
                      TextHelpers.GetTextAsKana(
                        currentFlashCardData.japaneseText
                      )
                    )
                  ) : (
                    <MissingCardText cardId={currentTestStep.cardId} />
                  )}
                </h2>
              </div>
              {/* Back */}
              <div className="flip-card-side flip-card-back">
                <h2>
                  {currentFlashCardData ? (
                    currentFlashCardData.meaning
                  ) : (
                    <MissingCardText cardId={currentTestStep.cardId} />
                  )}
                </h2>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-row justify-between">
            <div>
              <button
                disabled={currentFlashCardData == null}
                onClick={() => {
                  dispatch(
                    flashcardSlice.actions.MarkCardAsCorrect(
                      currentTestStep.cardId
                    )
                  );
                  dispatch(flashcardSlice.actions.NextQuestion());
                }}
              >
                <img
                  src="/checkmark.png"
                  alt=""
                  className="h-3 inline-block mr-1"
                />
                correct
              </button>
              <button
                disabled={currentFlashCardData == null}
                onClick={() => {
                  dispatch(
                    flashcardSlice.actions.MarkCardAsIncorrect(
                      currentTestStep.cardId
                    )
                  );
                  dispatch(flashcardSlice.actions.NextQuestion());
                }}
              >
                <img
                  src="/minus.png"
                  alt=""
                  className="h-3 inline-block mr-1"
                />
                incorrect
              </button>
            </div>
            <div>
              <button
                onClick={() => {
                  dispatch(flashcardSlice.actions.PrevQuestion());
                }}
              >
                PREV
              </button>
              {currentTestData.currentStep ==
              currentTestData.testSteps.length - 1 ? (
                <button
                  onClick={() => {
                    dispatch(flashcardSlice.actions.FinishTest());
                  }}
                >
                  FINISH
                </button>
              ) : (
                <button
                  disabled={
                    currentTestStep.responseStatus == ResponseStatus.UNKNOWN
                  }
                  onClick={() => {
                    dispatch(flashcardSlice.actions.NextQuestion());
                  }}
                >
                  NEXT
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            className="flex gap-2 items-center"
            onClick={() => {
              dispatch(flashcardSlice.actions.AbandonTest());
            }}
          >
            <img src="/recycle_bin_full-2.png" alt="" className="my-2 h-6" />
            Abandon Test
          </button>
          <SpeechButton
            onTranscription={function (transcription: string): void {
              dispatch(
                flashcardSlice.actions.SetSpokenAnswer({
                  cardNum: currentTestStep.cardId,
                  answer: transcription,
                })
              );
            }}
            currentResponse={currentTestStep.spokenAnswer}
            disabled={currentFlashCardData == null}
          />
          {currentFlashCardData && (
            <VocalizeButton japaneseText={currentFlashCardData.japaneseText} />
          )}
          <button
            onClick={() => {
              if (currentFlashCardData) {
                navigator.clipboard.writeText(
                  TextHelpers.GetTextAsKanji(currentFlashCardData.japaneseText)
                );
              }
              toast.custom(
                (id) => (
                  <CopyToast
                    japaneseText={currentFlashCardData!.japaneseText}
                    id={id}
                  />
                ),
                {
                  closeButton: true,
                }
              );
            }}
          >
            Copy Japanese Text to clipboard
          </button>
          <div>
            <input
              type="checkbox"
              id="invertFaces"
              checked={currentTestData.invertFaces}
              onChange={(e) => {
                dispatch(
                  flashcardSlice.actions.SetInvertFaces(e.target.checked)
                );
              }}
            />
            <label htmlFor="invertFaces">Invert Faces</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="showKanji"
              checked={currentTestData.showKanji}
              onChange={(e) => {
                dispatch(flashcardSlice.actions.SetShowKanji(e.target.checked));
              }}
            />
            <label htmlFor="showKanji">Show Kanji</label>
          </div>
        </div>
      </div>

      <div className="progress-indicator segmented w-full">
        <span
          className="progress-indicator-bar transition-all duration-500"
          style={{
            width: `${percentComplete * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

function GetFurigana(fullText: string): ReactNode {
  return (
    <ruby>
      {TextHelpers.SplitAll(fullText).map((pairArr, i) => (
        <React.Fragment key={pairArr[0] + i}>
          {pairArr[0]}
          {pairArr.length > 0 && <rt>{pairArr[1]}</rt>}
        </React.Fragment>
      ))}
    </ruby>
  );
}
