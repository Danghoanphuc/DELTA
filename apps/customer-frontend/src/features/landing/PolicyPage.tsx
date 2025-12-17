import { Header, Footer } from "./components";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

const SummaryBox = ({ children }: { children: React.ReactNode }) => (
  <div className="my-8 p-6 bg-gradient-to-br from-emerald-50 to-stone-50 border-l-4 border-emerald-600 rounded-r-lg shadow-sm">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        <svg
          className="w-5 h-5 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-stone-700 font-medium leading-relaxed italic">
        {children}
      </p>
    </div>
  </div>
);

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      <section className="pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 italic">
            Bảo mật và Pháp lý.
          </h1>
          <p className="text-stone-500">Cập nhật lần cuối: 20/12/2025.</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-24">
        <Tabs defaultValue="terms" className="w-full">
          <TabsList className="w-full flex justify-center bg-transparent border-b border-stone-300 rounded-none h-auto p-0 mb-12">
            {[
              { label: "Điều khoản dịch vụ", value: "terms" },
              { label: "Chính sách bảo mật", value: "privacy" },
              { label: "Hoàn tiền & Đổi trả", value: "refund" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent px-8 py-4 font-mono text-sm font-bold text-stone-400 uppercase tracking-widest data-[state=active]:border-emerald-800 data-[state=active]:text-stone-900 data-[state=active]:bg-transparent transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent
            value="terms"
            className="bg-white p-12 md:p-16 shadow-sm border border-stone-200"
          >
            <article className="prose prose-stone prose-lg max-w-none font-light">
              <h2 className="font-serif text-4xl text-stone-900 italic mb-6">
                Điều khoản về Tính Độc Bản & Sai Số Tự Nhiên
              </h2>

              <p className="text-stone-600 mb-8">
                Chào mừng bạn đến với Printz. Khi sử dụng dịch vụ của chúng tôi,
                bạn đồng ý tuân thủ các điều khoản dịch vụ được thiết kế để bảo
                vệ tính độc bản và giá trị văn hóa của từng tác phẩm.
              </p>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                1. Định nghĩa "Lỗi" và "Vẻ đẹp"
              </h3>
              <p>Chúng tôi phân biệt rõ ràng giữa hai khái niệm quan trọng:</p>
              <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 my-6">
                <p className="mb-4">
                  <strong className="text-stone-900">
                    Lỗi kỹ thuật (Defect):
                  </strong>
                  Những khiếm khuyết do quá trình sản xuất hoặc vận chuyển gây
                  ra, làm giảm giá trị sử dụng của sản phẩm. Ví dụ:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Nứt vỡ, sứt mẻ nghiêm trọng</li>
                  <li>Logo/khắc chữ bị lem màu, mờ nhòe</li>
                  <li>Sai kích thước so với mô tả</li>
                  <li>Mùi hương không đúng công thức đã duyệt</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-stone-900">
                    Đặc tính tự nhiên (Natural Character):
                  </strong>
                  Những biến thể tự nhiên làm nên tính độc bản của từng tác phẩm
                  thủ công. Ví dụ:
                </p>
                <ul className="list-disc pl-6">
                  <li>
                    Vân men gốm loang lổ không đều (đặc tính của men rạn cổ)
                  </li>
                  <li>Mắt gỗ, thớ gỗ tự nhiên trên sản phẩm gỗ</li>
                  <li>Thớ trầm hương không đồng đều về màu sắc</li>
                  <li>Sai số nhỏ về kích thước (±2-3mm) do làm thủ công</li>
                </ul>
              </div>
              <SummaryBox>
                Khách hàng đồng ý chấp nhận sự khác biệt tự nhiên như một phần
                giá trị của tác phẩm độc bản, không phải là lỗi sản xuất.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                2. Quyền từ chối của Printz
              </h3>
              <p>
                Với vai trò là người giám tuyển (curator), chúng tôi có quyền từ
                chối các yêu cầu in ấn/khắc logo trong những trường hợp sau:
              </p>
              <ul>
                <li>
                  <strong>Logo quá to hoặc vị trí không phù hợp:</strong> Che
                  mất họa tiết gốm cổ, phá vỡ cân bằng thẩm mỹ của sản phẩm.
                </li>
                <li>
                  <strong>Màu sắc không hài hòa:</strong> Logo màu neon trên gốm
                  men cổ, font chữ hiện đại trên sản phẩm truyền thống.
                </li>
                <li>
                  <strong>Nội dung không phù hợp:</strong> Vi phạm văn hóa, tôn
                  giáo, hoặc làm mất giá trị văn hóa của sản phẩm.
                </li>
              </ul>
              <p className="mt-4">
                Trong trường hợp này, chúng tôi sẽ đề xuất phương án thay thế
                (thay đổi kích thước, vị trí, hoặc phương pháp khắc) để đảm bảo
                cả tính thương hiệu lẫn giá trị thẩm mỹ.
              </p>
              <SummaryBox>
                Chúng tôi có quyền từ chối hoặc điều chỉnh yêu cầu khắc logo nếu
                làm mất đi tính thẩm mỹ hoặc giá trị văn hóa của sản phẩm.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                3. Quyền sở hữu trí tuệ
              </h3>
              <p>
                Mọi thiết kế tùy chỉnh (custom design) được tạo ra cho khách
                hàng đều thuộc quyền sở hữu của khách hàng sau khi thanh toán
                đầy đủ. Tuy nhiên:
              </p>
              <ul>
                <li>
                  Printz giữ quyền sử dụng hình ảnh sản phẩm thực tế cho mục
                  đích Portfolio/Marketing trừ khi có thỏa thuận bảo mật (NDA).
                </li>
                <li>
                  Khách hàng chịu trách nhiệm về tính hợp pháp của nội dung
                  thiết kế, bao gồm bản quyền hình ảnh, font chữ và các yếu tố
                  sáng tạo khác.
                </li>
              </ul>
              <SummaryBox>
                Thiết kế là của bạn, nhưng chúng tôi có thể dùng ảnh sản phẩm để
                showcase (trừ khi có NDA).
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                4. Chính sách thanh toán
              </h3>
              <p>
                Thanh toán được thực hiện qua các phương thức: Chuyển khoản ngân
                hàng, Ví điện tử (Momo, ZaloPay), hoặc Thanh toán trực tuyến.
              </p>
              <p>
                Đối với đơn hàng lớn (trên 50 triệu VNĐ), chúng tôi áp dụng lộ
                trình thanh toán:
              </p>
              <ul>
                <li>30% đặt cọc khi xác nhận đơn hàng</li>
                <li>40% khi hoàn thành sản xuất (trước khi giao hàng)</li>
                <li>30% sau khi giao hàng và nghiệm thu</li>
              </ul>
              <SummaryBox>
                Thanh toán linh hoạt theo giai đoạn cho đơn hàng lớn — minh bạch
                và an toàn.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                5. Thời gian sản xuất và giao hàng
              </h3>
              <p>
                Thời gian sản xuất được thông báo cụ thể trong từng đơn hàng,
                phụ thuộc vào độ phức tạp và số lượng:
              </p>
              <ul>
                <li>Sản phẩm có sẵn + khắc logo: 5-7 ngày làm việc</li>
                <li>Sản phẩm custom (thiết kế mới): 15-20 ngày làm việc</li>
                <li>
                  Đơn hàng số lượng lớn (500 sản phẩm): 25-30 ngày làm việc
                </li>
              </ul>
              <p className="mt-4">
                Printz cam kết nỗ lực tối đa để đáp ứng thời hạn, tuy nhiên
                không chịu trách nhiệm về các trường hợp chậm trễ do bất khả
                kháng (thiên tai, dịch bệnh, sự cố vận chuyển quốc tế).
              </p>
              <SummaryBox>
                Chúng tôi cố gắng giao đúng hạn, nhưng không chịu trách nhiệm
                với các sự cố bất khả kháng.
              </SummaryBox>
            </article>
          </TabsContent>

          <TabsContent
            value="privacy"
            className="bg-white p-12 md:p-16 shadow-sm border border-stone-200"
          >
            <article className="prose prose-stone prose-lg max-w-none font-light">
              <h2 className="font-serif text-4xl text-stone-900 italic mb-6">
                Bảo Mật Thông Tin Đối Tác & Người Nhận Quà
              </h2>

              <p className="text-stone-600 mb-8">
                <strong>Printz</strong> (sau đây gọi tắt là "Chúng tôi") hiểu
                rằng danh sách người nhận quà của doanh nghiệp — thường là VIP,
                Sếp lớn, Đối tác chiến lược — là tài sản tối mật và nhạy cảm.
                Chúng tôi cam kết bảo vệ sự riêng tư và thông tin cá nhân của
                Quý Khách hàng, Đối tác và Người nhận quà (sau đây gọi chung là
                "Bạn").
              </p>

              <p>
                Chính sách này giải thích cách thức Printz thu thập, sử dụng,
                lưu trữ và bảo vệ dữ liệu cá nhân của Bạn khi truy cập website
                hoặc sử dụng dịch vụ của chúng tôi, tuân thủ theo Nghị định
                13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân và các quy định pháp
                luật Việt Nam hiện hành.
              </p>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                1. Bảo mật danh sách VIP
              </h3>
              <p>
                Chúng tôi hiểu rằng danh sách người nhận quà (thường là VIP, Sếp
                lớn, Đối tác chiến lược) là tài sản tối mật của doanh nghiệp. Vì
                vậy, Printz cam kết:
              </p>
              <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 my-6">
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <strong>Ký NDA (Thỏa thuận bảo mật):</strong> Đối với các
                    đơn hàng có yêu cầu bảo mật cao, chúng tôi sẵn sàng ký NDA
                    trước khi nhận danh sách người nhận.
                  </li>
                  <li>
                    <strong>Hủy dữ liệu sau dự án:</strong> Ngay sau khi dự án
                    kết thúc và khách hàng xác nhận hoàn tất, chúng tôi sẽ xóa
                    vĩnh viễn danh sách người nhận khỏi hệ thống (trừ thông tin
                    cần thiết cho kế toán theo luật).
                  </li>
                  <li>
                    <strong>Phân quyền truy cập:</strong> Chỉ nhân viên trực
                    tiếp phụ trách dự án mới được truy cập danh sách, không chia
                    sẻ nội bộ hoặc bên thứ ba.
                  </li>
                  <li>
                    <strong>Mã hóa dữ liệu:</strong> Danh sách được lưu trữ trên
                    hệ thống mã hóa SSL/TLS, không lưu trên file Excel hoặc
                    Google Sheets công khai.
                  </li>
                </ul>
              </div>
              <SummaryBox>
                Danh sách VIP của bạn được bảo vệ bằng NDA và hủy ngay sau khi
                dự án kết thúc.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                2. Không sử dụng hình ảnh sản phẩm đã khắc logo
              </h3>
              <p>
                Chúng tôi hiểu rằng sản phẩm đã khắc logo của doanh nghiệp là
                tài sản thương hiệu riêng tư. Vì vậy:
              </p>
              <ul>
                <li>
                  <strong>Không đăng tải công khai:</strong> Chúng tôi sẽ KHÔNG
                  đăng tải hình ảnh sản phẩm đã khắc logo của Quý khách lên
                  Website, Fanpage, hoặc bất kỳ kênh truyền thông nào nếu chưa
                  có sự đồng ý bằng văn bản.
                </li>
                <li>
                  <strong>Sử dụng mẫu trắng (blank sample):</strong> Nếu cần
                  showcase sản phẩm cho mục đích Portfolio, chúng tôi chỉ sử
                  dụng hình ảnh mẫu trắng (chưa khắc logo) hoặc làm mờ logo
                  trong ảnh.
                </li>
                <li>
                  <strong>Xin phép trước khi sử dụng:</strong> Nếu muốn sử dụng
                  hình ảnh sản phẩm thực tế, chúng tôi sẽ gửi email xin phép và
                  chỉ sử dụng sau khi nhận được xác nhận từ khách hàng.
                </li>
              </ul>
              <SummaryBox>
                Hình ảnh sản phẩm đã khắc logo của bạn sẽ không được đăng tải
                công khai nếu chưa có sự đồng ý bằng văn bản.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                3. Phạm vi và Loại dữ liệu thu thập
              </h3>
              <p>
                Chúng tôi thu thập các thông tin cần thiết để cung cấp dịch vụ
                quà tặng doanh nghiệp, bao gồm:
              </p>
              <ul>
                <li>
                  <strong>Thông tin doanh nghiệp:</strong> Tên công ty, mã số
                  thuế, địa chỉ xuất hóa đơn, thông tin người liên hệ.
                </li>
                <li>
                  <strong>Thông tin người nhận quà:</strong> Họ tên, chức danh,
                  số điện thoại, địa chỉ giao hàng (chỉ sử dụng cho mục đích
                  giao nhận).
                </li>
                <li>
                  <strong>Thông tin giao dịch:</strong> Lịch sử đơn hàng, thông
                  tin thanh toán (được xử lý qua cổng thanh toán đối tác, chúng
                  tôi không lưu trữ số thẻ/CVV).
                </li>
                <li>
                  <strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, dữ liệu
                  Cookies, lịch sử truy cập website nhằm cải thiện trải nghiệm
                  người dùng.
                </li>
              </ul>
              <SummaryBox>
                Chúng tôi chỉ thu thập thông tin cần thiết để phục vụ đơn hàng
                và cải thiện trải nghiệm của bạn.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                4. Mục đích xử lý dữ liệu
              </h3>
              <p>
                Dữ liệu của Bạn được xử lý dựa trên sự đồng ý của Bạn hoặc để
                thực hiện hợp đồng, cụ thể cho các mục đích:
              </p>
              <ul>
                <li>
                  <strong>Cung cấp dịch vụ:</strong> Xử lý đơn đặt hàng, khắc
                  logo, thiết kế và quản lý tài khoản trên hệ thống An Nam
                  Curator.
                </li>
                <li>
                  <strong>Vận hành & Giao nhận:</strong> Chia sẻ thông tin cần
                  thiết (Tên, SĐT, Địa chỉ) cho các đơn vị vận chuyển và kho vận
                  để giao hàng hóa đến Bạn.
                </li>
                <li>
                  <strong>Hỗ trợ khách hàng:</strong> Liên hệ xác nhận đơn hàng,
                  gửi báo giá, giải quyết khiếu nại hoặc các vấn đề kỹ thuật.
                </li>
                <li>
                  <strong>Tiếp thị (Marketing):</strong> Gửi thông tin khuyến
                  mãi, cập nhật dịch vụ mới (chỉ khi Bạn đã đăng ký hoặc đồng ý
                  nhận tin). Bạn có quyền từ chối nhận tin này bất cứ lúc nào.
                </li>
                <li>
                  <strong>Tuân thủ pháp luật:</strong> Cung cấp thông tin cho cơ
                  quan nhà nước có thẩm quyền khi có yêu cầu bằng văn bản (Thuế,
                  Công an, Tòa án...).
                </li>
              </ul>
              <SummaryBox>
                Dữ liệu của bạn được dùng để phục vụ đơn hàng, hỗ trợ khách
                hàng, và tuân thủ pháp luật — không bán cho bên thứ ba.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                5. Chia sẻ dữ liệu cho bên thứ ba
              </h3>
              <p>
                Printz cam kết không kinh doanh, bán dữ liệu của Bạn cho bất kỳ
                bên nào. Tuy nhiên, để vận hành dịch vụ, chúng tôi có thể chia
                sẻ dữ liệu giới hạn cho các bên sau:
              </p>
              <ul>
                <li>
                  Các đơn vị cung cấp dịch vụ vận chuyển (Logistics/Shipper) —
                  chỉ chia sẻ thông tin giao nhận (Tên, SĐT, Địa chỉ).
                </li>
                <li>
                  Các cổng thanh toán điện tử/Ngân hàng để xử lý giao dịch —
                  không lưu trữ số thẻ/CVV.
                </li>
                <li>
                  Các đối tác cung cấp hạ tầng máy chủ (Cloud Server) cam kết
                  tuân thủ bảo mật theo tiêu chuẩn quốc tế.
                </li>
              </ul>
              <SummaryBox>
                Không bán dữ liệu — chỉ chia sẻ với đối tác vận chuyển, thanh
                toán và hạ tầng kỹ thuật cần thiết.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                6. Thời gian lưu trữ dữ liệu
              </h3>
              <p>
                Dữ liệu cá nhân sẽ được lưu trữ cho đến khi có yêu cầu hủy bỏ từ
                Bạn hoặc khi mục đích xử lý dữ liệu đã hoàn thành.
              </p>
              <p>
                Đối với các dữ liệu liên quan đến chứng từ kế toán, tài chính,
                hóa đơn: Chúng tôi có nghĩa vụ lưu trữ theo quy định của Luật Kế
                toán (thường là 10 năm) ngay cả khi Bạn yêu cầu xóa tài khoản.
              </p>
              <SummaryBox>
                Dữ liệu được lưu đến khi bạn yêu cầu xóa, trừ chứng từ kế toán
                phải giữ 10 năm theo luật.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                7. Cam kết bảo mật
              </h3>
              <p>
                Printz áp dụng các biện pháp kỹ thuật và an ninh tổ chức phù hợp
                (như mã hóa SSL, tường lửa, kiểm soát truy cập) để bảo vệ dữ
                liệu cá nhân trước các hành vi truy cập trái phép, sử dụng sai
                mục đích hoặc mất mát.
              </p>
              <p>
                <strong>Lưu ý rủi ro:</strong> Mặc dù chúng tôi nỗ lực tối đa,
                không có hệ thống nào trên Internet là an toàn tuyệt đối 100%.
                Printz sẽ không chịu trách nhiệm bồi thường trong các trường hợp
                bất khả kháng (tin tặc tấn công quy mô lớn vượt quá khả năng
                phòng thủ tiêu chuẩn, sự cố đường truyền quốc tế, hoặc do Bạn tự
                lộ mật khẩu).
              </p>
              <SummaryBox>
                Chúng tôi dùng SSL, tường lửa và các biện pháp bảo mật tiêu
                chuẩn — nhưng không hệ thống nào an toàn 100%.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                8. Quyền của Chủ thể dữ liệu (Bạn)
              </h3>
              <p>
                Theo Nghị định 13/2023/NĐ-CP, Bạn có các quyền sau đối với dữ
                liệu cá nhân của mình:
              </p>
              <ul>
                <li>
                  <strong>Quyền được biết:</strong> Biết về hoạt động xử lý dữ
                  liệu của chúng tôi (qua Chính sách này).
                </li>
                <li>
                  <strong>Quyền đồng ý & Rút lại sự đồng ý:</strong> Bạn có
                  quyền đồng ý hoặc rút lại sự đồng ý xử lý dữ liệu bất cứ lúc
                  nào (trừ trường hợp pháp luật quy định khác).
                </li>
                <li>
                  <strong>Quyền truy cập & Chỉnh sửa:</strong> Yêu cầu xem,
                  chỉnh sửa thông tin của mình.
                </li>
                <li>
                  <strong>Quyền xóa dữ liệu:</strong> Yêu cầu xóa dữ liệu khi
                  không còn nhu cầu sử dụng dịch vụ (trừ các dữ liệu bắt buộc
                  lưu trữ theo luật định).
                </li>
                <li>
                  <strong>Quyền khiếu nại:</strong> Khiếu nại nếu nhận thấy dữ
                  liệu bị sử dụng sai mục đích.
                </li>
              </ul>
              <SummaryBox>
                Bạn có quyền xem, sửa, xóa dữ liệu của mình và rút lại sự đồng ý
                bất cứ lúc nào theo Nghị định 13/2023.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                9. Thông tin liên hệ
              </h3>
              <p>
                Để thực hiện các quyền trên hoặc có thắc mắc về chính sách bảo
                mật, vui lòng liên hệ Bộ phận Kiểm soát Dữ liệu của chúng tôi:
              </p>
              <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 mt-6">
                <p className="mb-2">
                  <strong>CÔNG TY TNHH GIẢI PHÁP THƯƠNG HIỆU PRINTZ</strong>
                </p>
                <p className="mb-2">
                  <strong>Địa chỉ trụ sở:</strong> Thửa đất số 4927, Tờ bản đồ
                  số 42, Đường DK6A, Phường Thới Hòa, TP Hồ Chí Minh, Việt Nam
                </p>
                <p className="mb-2">
                  <strong>Hotline:</strong> 0865726848
                </p>
                <p>
                  <strong>Email:</strong> privacy@printz.vn
                </p>
              </div>
            </article>
          </TabsContent>

          <TabsContent
            value="refund"
            className="bg-white p-12 md:p-16 shadow-sm border border-stone-200"
          >
            <article className="prose prose-stone prose-lg max-w-none font-light">
              <h2 className="font-serif text-4xl text-stone-900 italic mb-6">
                Cam Kết Bảo Hiểm Cảm Xúc
              </h2>

              <p className="text-stone-600 mb-8">
                Chúng tôi hiểu rằng mỗi món quà không chỉ là sản phẩm vật chất,
                mà còn mang theo thông điệp và cảm xúc của người tặng. Vì vậy,
                Printz cam kết bảo vệ trải nghiệm của bạn với chính sách hoàn
                tiền và đổi trả minh bạch, công bằng.
              </p>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                1. Bảo hiểm Vỡ/Hỏng — 1 đổi 1 trong 24 giờ
              </h3>
              <p>
                Chúng tôi hiểu rằng sản phẩm thủ công (gốm sứ, gỗ, trầm hương)
                có thể gặp rủi ro trong vận chuyển. Vì vậy:
              </p>
              <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 my-6">
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <strong>Đổi ngay lập tức:</strong> Nếu sản phẩm bị vỡ, nứt,
                    hoặc hư hại do vận chuyển, chúng tôi sẽ đổi 1 sản phẩm mới
                    trong vòng 24 giờ kể từ khi nhận được thông báo.
                  </li>
                  <li>
                    <strong>Kho dự phòng (Buffer Stock):</strong> Đối với các
                    đơn hàng lớn (trên 100 sản phẩm), chúng tôi luôn có kho dự
                    phòng 5-10% để xử lý tình huống này ngay lập tức.
                  </li>
                  <li>
                    <strong>Không cần trả lại sản phẩm lỗi:</strong> Bạn không
                    cần gửi trả sản phẩm bị vỡ (để tránh rủi ro vận chuyển
                    thêm). Chỉ cần gửi hình ảnh/video chứng minh.
                  </li>
                  <li>
                    <strong>Miễn phí vận chuyển:</strong> Sản phẩm đổi mới sẽ
                    được giao miễn phí, ưu tiên giao nhanh (Express) nếu cần
                    gấp.
                  </li>
                </ul>
              </div>
              <SummaryBox>
                Sản phẩm bị vỡ/hỏng do vận chuyển? Đổi ngay trong 24h, không cần
                trả lại sản phẩm lỗi.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                2. Bảo hành Niềm tin — Hoàn tiền 100% nếu không đúng mẫu
              </h3>
              <p>
                Chúng tôi cam kết sản phẩm thực tế phải đúng với mẫu đã duyệt
                (về chất liệu, màu sắc, mùi hương, kích thước). Nếu không:
              </p>
              <ul>
                <li>
                  <strong>Hoàn tiền 100% không thắc mắc:</strong> Nếu sản phẩm
                  thực tế khác biệt đáng kể so với mẫu đã duyệt (ví dụ: gốm men
                  rạn cổ nhưng giao men trơn, trầm hương Khánh Hòa nhưng giao
                  trầm Campuchia), chúng tôi hoàn tiền 100% ngay lập tức.
                </li>
                <li>
                  <strong>Không cần giải thích lý do:</strong> Bạn không cần
                  giải thích chi tiết tại sao không hài lòng. Chỉ cần thông báo
                  "Sản phẩm không đúng mẫu" là đủ.
                </li>
                <li>
                  <strong>Thời gian xử lý:</strong> Hoàn tiền trong vòng 3-5
                  ngày làm việc sau khi xác nhận.
                </li>
              </ul>
              <SummaryBox>
                Sản phẩm không đúng mẫu đã duyệt? Hoàn tiền 100% không thắc mắc.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                3. Quy trình khiếu nại
              </h3>
              <p>
                Để đảm bảo xử lý nhanh chóng, vui lòng thông báo khiếu nại trong
                vòng 48 giờ kể từ khi nhận hàng, kèm theo:
              </p>
              <ul>
                <li>
                  <strong>Hình ảnh/Video:</strong> Chụp rõ sản phẩm lỗi từ nhiều
                  góc độ, hoặc quay video unboxing (nếu có).
                </li>
                <li>
                  <strong>Mã đơn hàng:</strong> Để chúng tôi tra cứu nhanh
                  chóng.
                </li>
                <li>
                  <strong>Mô tả vấn đề:</strong> Ngắn gọn về vấn đề (vỡ, sai
                  màu, sai kích thước, v.v.).
                </li>
              </ul>
              <p className="mt-4">
                <strong>Liên hệ qua:</strong>
              </p>
              <ul>
                <li>Hotline: 0865726848 (24/7)</li>
                <li>Email: support@annamcurator.vn</li>
                <li>Zalo/WhatsApp: 0865726848</li>
              </ul>
              <SummaryBox>
                Khiếu nại trong 48 giờ kèm ảnh/video và mã đơn hàng — xử lý ngay
                trong 24h.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                4. Trường hợp KHÔNG được hoàn tiền/đổi trả
              </h3>
              <p>
                Để đảm bảo công bằng, chúng tôi không chấp nhận hoàn tiền/đổi
                trả trong các trường hợp sau:
              </p>
              <ul>
                <li>
                  <strong>Thay đổi ý định:</strong> Khách hàng đổi ý sau khi đã
                  xác nhận thiết kế và thanh toán (sản phẩm đã sản xuất).
                </li>
                <li>
                  <strong>Đặc tính tự nhiên:</strong> Khiếu nại về vân men gốm
                  loang lổ, mắt gỗ, thớ trầm không đều (đây là đặc tính tự
                  nhiên, không phải lỗi).
                </li>
                <li>
                  <strong>Sản phẩm đã sử dụng:</strong> Sản phẩm đã được sử
                  dụng, làm hỏng, hoặc mất tem bảo hành.
                </li>
                <li>
                  <strong>Quá thời hạn khiếu nại:</strong> Thông báo sau 48 giờ
                  kể từ khi nhận hàng (trừ trường hợp bất khả kháng).
                </li>
              </ul>
              <SummaryBox>
                Không hoàn tiền nếu bạn đổi ý, khiếu nại về đặc tính tự nhiên,
                hoặc sản phẩm đã sử dụng.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                5. Cam kết của chúng tôi
              </h3>
              <p>
                Printz không chỉ bán sản phẩm, mà còn bán niềm tin và trải
                nghiệm. Chúng tôi cam kết:
              </p>
              <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200 my-6">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Xử lý khiếu nại trong vòng 24 giờ</li>
                  <li>Đổi sản phẩm lỗi ngay lập tức, không cần trả lại</li>
                  <li>Hoàn tiền 100% nếu sản phẩm không đúng mẫu</li>
                  <li>Luôn có kho dự phòng cho đơn hàng lớn</li>
                  <li>Hỗ trợ 24/7 qua Hotline/Email/Zalo</li>
                </ul>
              </div>
              <SummaryBox>
                Chúng tôi bảo vệ cảm xúc của bạn — không chỉ là sản phẩm.
              </SummaryBox>
            </article>
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </div>
  );
}
