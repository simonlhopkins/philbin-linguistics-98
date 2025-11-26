import { flashcardSlice, ResponseStatus } from "../Redux/flashcardSlice";
import { useAppDispatch, useAppSelector } from "../Redux/hooks";

export default function TestResults() {
  const { currentTestData } = useAppSelector((state) => state.flashcard);
  const dispatch = useAppDispatch();
  if (!currentTestData) {
    return <p>no test data</p>;
  }
  return (
    <div className="window-body flex-1 flex flex-col max-w-80">
      <div className="window">
        <div className="window-body flex-1 flex flex-col gap-2">
          <h1>Results!</h1>
          <table className="interactive">
            <tbody>
              <tr>
                <td>Correct</td>
                <td>
                  {
                    currentTestData.testSteps.filter(
                      (step) => step.responseStatus == ResponseStatus.CORRECT
                    ).length
                  }
                </td>
              </tr>
              <tr>
                <td>Incorrect</td>
                <td>
                  {
                    currentTestData.testSteps.filter(
                      (step) => step.responseStatus == ResponseStatus.INCORRECT
                    ).length
                  }
                </td>
              </tr>
              <tr>
                <td>Unknown</td>
                <td>
                  {
                    currentTestData.testSteps.filter(
                      (step) => step.responseStatus == ResponseStatus.UNKNOWN
                    ).length
                  }
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex flex-row gap-2">
            <button
              onClick={() => {
                dispatch(
                  flashcardSlice.actions.RestartCurrentTestWithOnlyIncorrect()
                );
              }}
              disabled={
                !currentTestData.testSteps.some(
                  (step) => step.responseStatus == ResponseStatus.INCORRECT
                )
              }
            >
              Test Incorrect Again
            </button>
            <button
              onClick={() => {
                dispatch(flashcardSlice.actions.RestartCurrentTest());
              }}
            >
              Test Again
            </button>
            <button
              onClick={() => {
                dispatch(flashcardSlice.actions.ExitTest());
              }}
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
