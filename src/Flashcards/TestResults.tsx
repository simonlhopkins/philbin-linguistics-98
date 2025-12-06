import {
  flashcardSlice,
  ResponseStatus,
  type TestData,
} from "../Redux/flashcardSlice";
import { useAppDispatch } from "../Redux/hooks";

interface Props {
  currentTestData: TestData;
}
export default function TestResults({ currentTestData }: Props) {
  const dispatch = useAppDispatch();

  return (
    <div className="window-body flex-1 flex gap-2 flex-wrap">
      <div className="window">
        <div className="window-body flex-1 flex flex-col gap-2">
          <h3>Results!</h3>
          <table>
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
              Submit and Exit
            </button>
          </div>
        </div>
      </div>
      <img src="/asuka_clapping.gif" alt="" />
    </div>
  );
}
