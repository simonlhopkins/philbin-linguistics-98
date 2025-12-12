import { toast } from "sonner";

interface Props {
  errorString: string;
  id: string | number;
}
export default function ErrorToast({ errorString, id }: Props) {
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
          <img
            src="/msg_warning-0.png"
            alt=""
            className="h-6 aspect-square self-center"
          />
          <p>{`Error: ${errorString}`}</p>
        </div>
      </div>
    </div>
  );
}
