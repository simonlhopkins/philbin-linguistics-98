interface Props {
  cardId: number;
}

export default function MissingCardText({ cardId }: Props) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <img src="/msg_warning-0.png" alt="" className="h-8" />
      <p>Missing Card [{cardId}]</p>
    </div>
  );
}
