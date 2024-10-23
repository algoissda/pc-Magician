export const BuildCard = ({ build, theme, onClick }) => {
  return (
    <article
      key={build.id}
      className="flex h-80 flex-col border p-4 rounded-lg shadow-md bg-gray-50 bg-opacity-40 cursor-pointer"
      onClick={onClick}
    >
      <div className="h-[100%] flex flex-wrap content-between">
        <section className="h-1/3">
          <h4 className="font-semibold">CPU</h4>
          <small className="mt-0 line-clamp-none">{build.CPU}</small>
        </section>
        <section className="h-1/3">
          <h4 className="font-semibold">VGA</h4>
          <small className="mt-0 line-clamp-none">{build.VGA}</small>
        </section>
        <section className="h-1/3">
          <h4 className="font-semibold">RAM</h4>
          <small className="mt-0 line-clamp-none">{build.RAM}</small>
        </section>
      </div>
      <hr
        className="h-[2px] opacity-60"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(to right, #0ea5e9, #3730a3, #c026d3, #e11d48)"
              : "linear-gradient(to right, #a855f7 , #6b21a8 , #3b0764 , #000000)",
        }}
      />
      <footer className="text-right font-bold text-xl ">
        {build.totalPrice.toLocaleString()} 원
      </footer>
    </article>
  );
};
