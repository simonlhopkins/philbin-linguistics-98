import { toast } from "sonner";

interface Props {
  id: string | number;
}
export default function GoodJobToast({ id }: Props) {
  return (
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
      <div className="window-body flex gap-2 items-center justify-center">
        <img src="/misato-good-job.gif" alt="" className="max-w-md" />
      </div>
    </div>
  );
}
