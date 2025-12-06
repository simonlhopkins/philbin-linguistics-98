import { toast } from "sonner";
import TextHelpers from "../TextHelpers";

interface Props {
  japaneseText: string;
  id: string | number;
}
export default function CopyToast({ japaneseText, id }: Props) {
  return (
    <div className="shadow-xl/30">
      <div className="window w-64">
        <div className="title-bar">
          <div className="title-bar-text">Message</div>
          <div className="title-bar-controls">
            <button
              onClick={() => {
                toast.dismiss(id);
              }}
              aria-label="Close"
            ></button>
          </div>
        </div>
        <div className="window-body flex gap-2">
          <img src="/template_empty-2.png" alt="" className="w-6" />
          <p>
            {`${TextHelpers.GetTextAsKanji(japaneseText)} Copied to clipboard`}
          </p>
        </div>
      </div>
    </div>
  );
}
