import { Header, Footer } from "./components";
import { ShieldCheck, Package, Clock, Handshake } from "lucide-react";

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      <section className="pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <Handshake className="w-12 h-12 text-amber-700" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 italic">
            Lời Hứa Của Nhà Giám Tuyển
          </h1>
          <p className="text-stone-600 text-xl mb-3">
            Bảo Hiểm Cảm Xúc & Cam Kết Chất Lượng
          </p>
          <p className="text-stone-500 text-lg italic">
            Vì món quà bạn trao đi là uy tín của bạn
          </p>
          <p className="text-amber-700 text-sm font-medium mt-4">
            (Curatorial Quality Assurance)
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div className="bg-white p-12 md:p-16 shadow-sm border border-stone-200">
          <article className="prose prose-stone prose-lg max-w-none">
            {/* Intro */}
            <div className="bg-gradient-to-r from-amber-50 to-stone-50 border-l-4 border-amber-700 p-8 mb-12">
              <p className="text-stone-700 leading-relaxed mb-0 text-lg">
                Tại <strong>Printz</strong>, chúng tôi hiểu rằng một món quà
                ngoại giao không chỉ là vật phẩm, nó là{" "}
                <strong>Bộ mặt thương hiệu</strong> của Quý doanh nghiệp. Một
                vết nứt nhỏ trên gốm hay một cái tên khắc sai cũng có thể làm
                hỏng mối quan hệ đối tác quý giá.
                <br />
                <br />
                Vì vậy, chúng tôi cung cấp chính sách{" "}
                <span className="text-amber-800 font-bold">
                  "Bảo hiểm Cảm xúc"
                </span>{" "}
                trọn vẹn, chịu trách nhiệm đến cùng với từng tác phẩm xuất
                xưởng.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-6">
                <Package className="w-8 h-8 text-amber-700 flex-shrink-0 mt-1" />
                <h2 className="font-serif text-3xl text-stone-900 italic mb-0">
                  1. Cam Kết Đổi Mới 1-1
                </h2>
              </div>
              <p className="text-stone-500 italic mb-6">(1-for-1 Exchange)</p>

              <p className="text-stone-700 leading-relaxed">
                Chúng tôi thực hiện{" "}
                <span className="text-amber-800 font-bold">
                  Đổi mới ngay lập tức (trong 24h)
                </span>{" "}
                hoặc{" "}
                <span className="text-amber-800 font-bold">Hoàn tiền 100%</span>{" "}
                cho các lỗi thuộc trách nhiệm của Nhà Giám Tuyển, bao gồm:
              </p>

              <div className="bg-gradient-to-br from-amber-50 to-stone-50 p-6 rounded-lg border border-amber-200 my-6">
                <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <span className="text-amber-700">✓</span> Lỗi Vận Chuyển
                </h4>
                <p className="text-stone-600 italic mb-2">(Transit Damage)</p>
                <p className="mb-3">
                  Sản phẩm bị nứt, vỡ, móp méo hộp do va đập trong quá trình
                  giao hàng.
                </p>
                <p className="text-sm text-stone-600 mb-0 italic">
                  <strong>Điều kiện:</strong> Quý khách cung cấp video/hình ảnh
                  mở hộp (Unboxing) ngay khi nhận.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-stone-50 p-6 rounded-lg border border-amber-200 my-6">
                <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <span className="text-amber-700">✓</span> Lỗi Chế Tác Nghiêm
                  Trọng
                </h4>
                <p className="text-stone-600 italic mb-3">(Critical Defects)</p>
                <ul className="mb-0 space-y-2 text-stone-700">
                  <li>
                    Logo doanh nghiệp khắc sai chính tả, sai màu so với mẫu
                    duyệt (Maquette), bị nhòe hoặc mất nét.
                  </li>
                  <li>
                    Sản phẩm có vết nứt gió (với gốm/gỗ) làm ảnh hưởng đến công
                    năng sử dụng.
                  </li>
                  <li>
                    Mùi hương (với Trầm/Nến) bị biến đổi, mốc, hỏng do bảo quản
                    sai từ kho.
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-stone-50 p-6 rounded-lg border border-amber-200 my-6">
                <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <span className="text-amber-700">✓</span> Sai Quy Cách
                </h4>
                <p className="text-stone-600 italic mb-3">
                  (Wrong Specifications)
                </p>
                <p className="mb-0 text-stone-700">
                  Giao sai mẫu mã, sai số lượng hoặc thiếu phụ kiện (thiệp, túi,
                  nơ) so với Hợp đồng.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-6">
                <ShieldCheck className="w-8 h-8 text-stone-600 flex-shrink-0 mt-1" />
                <h2 className="font-serif text-3xl text-stone-900 italic mb-0">
                  2. Những "Sai Số Tự Nhiên" Được Chấp Nhận
                </h2>
              </div>

              <p className="text-stone-700 leading-relaxed mb-6">
                Để đảm bảo tính độc bản của hàng thủ công, Printz xin phép{" "}
                <span className="text-stone-800 font-medium">
                  không bảo hành
                </span>{" "}
                các trường hợp thuộc về{" "}
                <span className="text-amber-800 font-bold italic">
                  "Vẻ đẹp của sự không hoàn hảo"
                </span>{" "}
                (Wabi-sabi):
              </p>

              <div className="bg-stone-50 border-l-4 border-stone-400 p-6 my-6">
                <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <span className="text-stone-500">◆</span> Với Gốm Men Hỏa Biến
                </h4>
                <p className="mb-0 text-stone-700">
                  Sự chênh lệch về độ loang màu, vết chảy của men, hoặc các chấm
                  đen nhỏ (sắt trong đất) trên bề mặt. Đây là đặc tính tự nhiên
                  của nung ở 1.300 độ C.
                </p>
              </div>

              <div className="bg-stone-50 border-l-4 border-stone-400 p-6 my-6">
                <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <span className="text-stone-500">◆</span> Với Gỗ & Trầm Hương
                </h4>
                <p className="mb-0 text-stone-700">
                  Sự khác biệt về vân gỗ, mắt gỗ tự nhiên, hoặc màu sắc đậm/nhạt
                  giữa các thớ gỗ.
                </p>
              </div>

              <div className="bg-stone-50 border-l-4 border-stone-400 p-6 my-6">
                <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <span className="text-stone-500">◆</span> Với Sơn Mài
                </h4>
                <p className="mb-0 text-stone-700">
                  Độ bóng và sắc độ màu có thể chênh lệch 5-10% giữa các lô sản
                  xuất do độ ẩm và thời tiết khi mài.
                </p>
              </div>

              <div className="bg-stone-100 border-l-4 border-stone-500 p-6 my-6">
                <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <span className="text-stone-600">◆</span> Lỗi Chủ Quan
                </h4>
                <ul className="mb-0 space-y-2 text-stone-700">
                  <li>
                    Sản phẩm bị vỡ, hỏng do Quý khách làm rơi, bảo quản sai cách
                    (để nơi ẩm mốc, nắng gắt) sau khi đã nhận bàn giao.
                  </li>
                  <li>
                    Lỗi sai chính tả/nội dung mà Quý khách đã xác nhận{" "}
                    <span className="font-bold">"Duyệt"</span> trên file
                    Maquette cuối cùng.
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-6">
                <Clock className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
                <h2 className="font-serif text-3xl text-stone-900 italic mb-0">
                  3. Quy trình tiếp nhận & Xử lý{" "}
                  <span className="text-emerald-600">(3 Bước nhanh gọn)</span>
                </h2>
              </div>

              <p>
                Chúng tôi tối giản quy trình để không làm mất thời gian của Quý
                khách:
              </p>

              <div className="space-y-6 my-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-900 mb-2">
                      Kiểm hàng & Báo lỗi
                    </h4>
                    <ul className="space-y-2">
                      <li>
                        Quý khách vui lòng kiểm tra hàng{" "}
                        <span className="text-red-600 font-bold">
                          ngay khi nhận
                        </span>
                        .
                      </li>
                      <li>
                        Nếu phát hiện lỗi, hãy quay video/chụp ảnh hiện trạng và
                        gửi cho Chuyên viên tư vấn của Printz, xử lý trong vòng{" "}
                        <span className="text-red-600 font-bold">
                          01 ngày làm việc
                        </span>{" "}
                        kể từ khi nhận hàng.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-900 mb-2">
                      Xác minh{" "}
                      <span className="text-emerald-600">
                        (Trong vòng 4h - 8h)
                      </span>
                    </h4>
                    <ul className="space-y-2">
                      <li>
                        Printz sẽ đối chiếu ảnh sản phẩm lỗi với File duyệt in
                        ban đầu.
                      </li>
                      <li>
                        Nếu lỗi thuộc về Printz: Chúng tôi xác nhận phương án xử
                        lý ngay lập tức.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-900 mb-2">Khắc phục</h4>
                    <div className="space-y-4">
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="font-bold text-emerald-800 mb-2">
                          Phương án 1 (Ưu tiên):
                        </p>
                        <p className="mb-0">
                          Printz tiến hành{" "}
                          <span className="text-red-600 font-bold">
                            IN LẠI CẤP TỐC (Express)
                          </span>{" "}
                          và giao hàng hỏa tốc miễn phí đến tận tay Quý khách.
                        </p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="font-bold text-emerald-800 mb-2">
                          Phương án 2:
                        </p>
                        <p className="mb-0">
                          Nếu Quý khách không còn nhu cầu in lại (do lỡ sự
                          kiện), Printz sẽ{" "}
                          <span className="text-red-600 font-bold">
                            HOÀN TIỀN 100%
                          </span>{" "}
                          giá trị số lượng hàng bị lỗi + Tặng Voucher xin lỗi
                          cho đơn hàng sau.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-6">
                <Clock className="w-8 h-8 text-amber-700 flex-shrink-0 mt-1" />
                <h2 className="font-serif text-3xl text-stone-900 italic mb-0">
                  3. Quy Trình "Phản Ứng Nhanh"
                </h2>
              </div>
              <p className="text-stone-500 italic mb-6">(Rapid Response)</p>

              <p className="text-stone-700 leading-relaxed mb-8">
                Chúng tôi hiểu sự cố quà tặng cần xử lý gấp để kịp giờ sự kiện.
                Quy trình 3 bước thần tốc:
              </p>

              <div className="space-y-6 my-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-900 mb-2">Báo Cáo</h4>
                    <p className="text-stone-500 italic text-sm mb-3">
                      (Report)
                    </p>
                    <ul className="space-y-2 text-stone-700">
                      <li>
                        Quý khách gửi ảnh/video lỗi qua Zalo/Hotline cho Chuyên
                        viên tư vấn riêng.
                      </li>
                      <li>
                        <strong>Thời hạn:</strong> Trong vòng{" "}
                        <span className="text-amber-800 font-bold">24 giờ</span>{" "}
                        kể từ khi nhận hàng.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-900 mb-2">
                      Xác Minh & Phương Án
                    </h4>
                    <p className="text-stone-500 italic text-sm mb-3">
                      (Verify)
                    </p>
                    <ul className="space-y-2 text-stone-700">
                      <li>
                        Chúng tôi xác nhận lỗi trong vòng{" "}
                        <span className="text-amber-800 font-bold">
                          30 phút
                        </span>
                        .
                      </li>
                      <li>Đưa ra phương án: Đổi mới hay Hoàn tiền.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-900 mb-2">Khắc Phục</h4>
                    <p className="text-stone-500 italic text-sm mb-4">
                      (Action)
                    </p>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-amber-50 to-stone-50 p-5 rounded-lg border border-amber-200">
                        <p className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                          <span className="text-amber-700">→</span> Ưu tiên 1
                          (Ship Hỏa tốc)
                        </p>
                        <p className="mb-0 text-stone-700">
                          Gửi ngay sản phẩm mới từ kho dự phòng (Buffer Stock)
                          đến tận tay Quý khách.
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-stone-50 p-5 rounded-lg border border-amber-200">
                        <p className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                          <span className="text-amber-700">→</span> Ưu tiên 2
                          (Hoàn tiền)
                        </p>
                        <p className="mb-0 text-stone-700">
                          Nếu lỡ sự kiện, chúng tôi hoàn tiền{" "}
                          <span className="text-amber-800 font-bold">100%</span>{" "}
                          + Gửi thư xin lỗi & Voucher đền bù thiện chí.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-6">
                <ShieldCheck className="w-8 h-8 text-amber-700 flex-shrink-0 mt-1" />
                <h2 className="font-serif text-3xl text-stone-900 italic mb-0">
                  4. Thời Hạn & Bảo Hành Trọn Đời
                </h2>
              </div>
              <p className="text-stone-500 italic mb-6">(Warranty Period)</p>

              <div className="bg-gradient-to-br from-amber-50 to-stone-50 border-l-4 border-amber-700 p-6 mb-6">
                <h4 className="font-bold text-amber-900 mb-3">
                  Thời hạn khiếu nại:
                </h4>
                <p className="mb-0 text-stone-700">
                  <span className="text-amber-800 font-bold">03 ngày</span> kể
                  từ ngày giao hàng thành công.
                </p>
              </div>

              <div className="bg-gradient-to-br from-stone-800 to-stone-700 p-8 rounded-lg text-white">
                <h4 className="font-bold text-amber-300 mb-4 text-xl">
                  Bảo hành trọn đời (Lifetime Warranty)
                </h4>
                <p className="mb-0 leading-relaxed">
                  Printz bảo hành trọn đời về{" "}
                  <strong className="text-amber-200">
                    Chất liệu nguồn gốc
                  </strong>
                  : Cam kết Gỗ không mối mọt, Men không phai màu, Trầm hương là
                  tự nhiên (không hóa chất).{" "}
                  <span className="text-amber-300 font-bold">
                    Nếu phát hiện hàng giả, đền gấp 10 lần.
                  </span>
                </p>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 p-10 rounded-lg border border-amber-300 text-center mt-12">
              <Handshake className="w-14 h-14 text-amber-700 mx-auto mb-4" />
              <h3 className="font-serif text-3xl text-stone-900 mb-3 italic">
                Cần hỗ trợ khẩn cấp?
              </h3>
              <p className="text-stone-600 mb-6 text-lg">
                Đừng lo lắng, chúng tôi luôn ở đây để đảm bảo trải nghiệm của
                bạn trọn vẹn nhất.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:0865726848"
                  className="inline-flex items-center justify-center px-8 py-4 bg-amber-700 text-white font-medium rounded-lg hover:bg-amber-800 transition-colors shadow-md"
                >
                  Hotline Xử lý Khiếu nại (24/7): 0865 726 848
                </a>
                <a
                  href="mailto:support@printz.vn"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-stone-900 font-medium rounded-lg border-2 border-amber-700 hover:bg-amber-50 transition-colors"
                >
                  Email: support@printz.vn
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
}
