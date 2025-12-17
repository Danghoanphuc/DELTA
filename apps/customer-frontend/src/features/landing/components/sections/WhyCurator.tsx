export function WhyCurator() {
  return (
    <section className="py-20 px-6 bg-stone-900">
      <div className="max-w-4xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-amber-400 mb-8">
          Tại sao là "Giám tuyển" mà không phải "Bán hàng"?
        </h2>

        {/* Main quote */}
        <blockquote className="mb-8">
          <p className="text-xl md:text-2xl lg:text-3xl text-white font-serif italic leading-relaxed">
            Người bán hàng muốn bán cho bạn{" "}
            <span className="text-amber-400">Mọi Thứ</span> họ có.
            <br />
            Nhà giám tuyển chỉ trao cho bạn{" "}
            <span className="text-emerald-400">Thứ Duy Nhất</span> bạn cần.
          </p>
        </blockquote>

        {/* Explanation */}
        <p className="text-base md:text-lg text-stone-400 font-light max-w-2xl mx-auto leading-relaxed">
          Tại Printz, chúng tôi loại bỏ 99% những thứ "thường thường bậc trung",
          chỉ giữ lại <span className="text-white font-medium">1%</span> những
          tác phẩm có khả năng kể câu chuyện về vị thế của bạn.
        </p>
      </div>
    </section>
  );
}
