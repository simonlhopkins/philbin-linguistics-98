export default function DescriptionChallenge() {
  return (
    <div className="window">
      <div className="window-body flex-1 flex flex-col">
        <h1>description challenge</h1>
        <img src="/six_beers.jpg" alt="" className=" max-w-full w-80" />
        <form
          className="field-row-stacked"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            console.log(formData.get("description"));
          }}
        >
          <label htmlFor="description">Additional notes</label>
          <textarea
            className="min-h-8"
            name="description"
            id="description"
            rows={8}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.currentTarget.form?.requestSubmit();
              }
            }}
          ></textarea>
          <button type="submit">submit</button>
        </form>
      </div>
    </div>
  );
}
