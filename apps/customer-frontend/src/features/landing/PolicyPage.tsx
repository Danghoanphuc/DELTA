import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
              { label: "Chính sách hoàn tiền", value: "refund" },
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
              <h3 className="font-serif text-3xl text-stone-900 italic">
                1. Điều khoản chung
              </h3>
              <p>
                Chào mừng bạn đến với Printz. Khi sử dụng dịch vụ hạ tầng in ấn
                của chúng tôi, bạn đồng ý tuân thủ các điều khoản dịch vụ nghiêm
                ngặt nhằm đảm bảo quyền lợi cho cả hai bên.
              </p>
              <SummaryBox>
                Sử dụng dịch vụ Printz đồng nghĩa với việc bạn chấp nhận toàn bộ
                điều khoản này.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-8">
                2. Quyền sở hữu trí tuệ
              </h3>
              <p>
                Mọi thiết kế được tạo ra trên nền tảng Printz đều thuộc quyền sở
                hữu của khách hàng (sau khi thanh toán). Tuy nhiên, Printz giữ
                quyền sử dụng hình ảnh sản phẩm thực tế cho mục đích Portfolio
                trừ khi có yêu cầu bảo mật (NDA).
              </p>
              <SummaryBox>
                Thiết kế là của bạn, nhưng chúng tôi có thể dùng ảnh sản phẩm để
                showcase (trừ khi có NDA).
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-8">
                3. Trách nhiệm của khách hàng
              </h3>
              <p>
                Khách hàng chịu trách nhiệm về tính hợp pháp của nội dung thiết
                kế, bao gồm bản quyền hình ảnh, font chữ và các yếu tố sáng tạo
                khác. Printz không chịu trách nhiệm pháp lý nếu khách hàng vi
                phạm bản quyền của bên thứ ba.
              </p>
              <SummaryBox>
                Bạn chịu trách nhiệm về bản quyền thiết kế của mình — đảm bảo
                mọi thứ đều hợp pháp.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-8">
                4. Chính sách thanh toán
              </h3>
              <p>
                Thanh toán được thực hiện qua các phương thức: Chuyển khoản ngân
                hàng, Ví điện tử, hoặc Thanh toán trực tuyến. Đơn hàng chỉ được
                xử lý sau khi nhận được xác nhận thanh toán đầy đủ.
              </p>
              <SummaryBox>
                Thanh toán trước, sản xuất sau — đơn giản và minh bạch.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-8">
                5. Thời gian giao hàng
              </h3>
              <p>
                Thời gian sản xuất và giao hàng được thông báo cụ thể trong từng
                đơn hàng. Printz cam kết nỗ lực tối đa để đáp ứng thời hạn, tuy
                nhiên không chịu trách nhiệm về các trường hợp chậm trễ do bất
                khả kháng (thiên tai, dịch bệnh, sự cố vận chuyển).
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
                Chính sách bảo mật và xử lý dữ liệu cá nhân/tổ chức
              </h2>

              <p className="text-stone-600 mb-8">
                <strong>
                  CÔNG TY TNHH GIẢI PHÁP THƯƠNG HIỆU PRINTZ (PRINTZ SOLUTIONS
                  COMPANY LIMITED)
                </strong>{" "}
                (sau đây gọi tắt là "Printz", "Chúng tôi") cam kết bảo vệ sự
                riêng tư và thông tin cá nhân của Quý Khách hàng, Đối tác và
                Người dùng (sau đây gọi chung là "Bạn").
              </p>

              <p>
                Chính sách này giải thích cách thức Printz thu thập, sử dụng,
                lưu trữ và bảo vệ dữ liệu cá nhân của Bạn khi truy cập website
                hoặc sử dụng dịch vụ của chúng tôi, tuân thủ theo Nghị định
                13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân và các quy định pháp
                luật Việt Nam hiện hành.
              </p>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                1. Phạm vi và Loại dữ liệu thu thập
              </h3>
              <p>
                Chúng tôi thu thập các thông tin cần thiết để cung cấp dịch vụ
                Web-to-Print và thương mại điện tử, bao gồm nhưng không giới
                hạn:
              </p>
              <ul>
                <li>
                  <strong>Thông tin định danh:</strong> Họ và tên, chức danh,
                  tên công ty/tổ chức.
                </li>
                <li>
                  <strong>Thông tin liên lạc:</strong> Số điện thoại, địa chỉ
                  email, địa chỉ giao nhận hàng hóa, địa chỉ xuất hóa đơn.
                </li>
                <li>
                  <strong>Thông tin giao dịch:</strong> Lịch sử mua hàng, thông
                  tin thanh toán (được xử lý qua cổng thanh toán đối tác, chúng
                  tôi không lưu trữ trực tiếp số thẻ/CVV), mã số thuế.
                </li>
                <li>
                  <strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, dữ liệu
                  Cookies, lịch sử truy cập website nhằm cải thiện trải nghiệm
                  người dùng và an ninh hệ thống.
                </li>
              </ul>
              <SummaryBox>
                Chúng tôi chỉ thu thập thông tin cần thiết để phục vụ đơn hàng
                và cải thiện trải nghiệm của bạn.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                2. Mục đích xử lý dữ liệu
              </h3>
              <p>
                Dữ liệu của Bạn được xử lý dựa trên sự đồng ý của Bạn hoặc để
                thực hiện hợp đồng, cụ thể cho các mục đích:
              </p>
              <ul>
                <li>
                  <strong>Cung cấp dịch vụ:</strong> Xử lý đơn đặt hàng, in ấn,
                  thiết kế và quản lý tài khoản trên hệ thống Printz.
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
                3. Chia sẻ dữ liệu cho bên thứ ba
              </h3>
              <p>
                Printz cam kết không kinh doanh, bán dữ liệu của Bạn cho bất kỳ
                bên nào. Tuy nhiên, để vận hành dịch vụ, chúng tôi có thể chia
                sẻ dữ liệu giới hạn cho các bên sau:
              </p>
              <ul>
                <li>
                  Các đơn vị cung cấp dịch vụ vận chuyển (Logistics/Shipper).
                </li>
                <li>
                  Các cổng thanh toán điện tử/Ngân hàng để xử lý giao dịch.
                </li>
                <li>
                  Các đối tác cung cấp hạ tầng máy chủ (Cloud Server) và phần
                  mềm quản lý doanh nghiệp cam kết tuân thủ bảo mật.
                </li>
              </ul>
              <SummaryBox>
                Không bán dữ liệu — chỉ chia sẻ với đối tác vận chuyển, thanh
                toán và hạ tầng kỹ thuật cần thiết.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                4. Thời gian lưu trữ dữ liệu
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
                5. Cam kết bảo mật
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
                6. Quyền của Chủ thể dữ liệu (Bạn)
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
                7. Thông tin liên hệ
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
              <h3 className="font-serif text-3xl text-stone-900 italic">
                1. Chính sách hoàn tiền
              </h3>
              <p>
                Do tính chất đặc thù của sản phẩm in ấn theo yêu cầu
                (custom-made), Printz không chấp nhận hoàn tiền sau khi đơn hàng
                đã được sản xuất, trừ các trường hợp sau:
              </p>
              <ul>
                <li>
                  Sản phẩm bị lỗi kỹ thuật do nhà sản xuất (in sai màu, in lỗi,
                  chất lượng không đạt).
                </li>
                <li>
                  Sản phẩm giao không đúng với mô tả đã được xác nhận trong đơn
                  hàng.
                </li>
                <li>
                  Sản phẩm bị hư hỏng trong quá trình vận chuyển (cần có hình
                  ảnh chứng minh).
                </li>
              </ul>
              <SummaryBox>
                Sản phẩm custom không hoàn tiền, trừ khi lỗi do nhà sản xuất
                hoặc vận chuyển.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-8">
                2. Quy trình khiếu nại
              </h3>
              <p>
                Khách hàng cần thông báo khiếu nại trong vòng 48 giờ kể từ khi
                nhận hàng, kèm theo:
              </p>
              <ul>
                <li>Hình ảnh/video sản phẩm lỗi.</li>
                <li>Mã đơn hàng và thông tin liên hệ.</li>
                <li>Mô tả chi tiết vấn đề.</li>
              </ul>
              <SummaryBox>
                Khiếu nại trong 48 giờ kèm ảnh/video chứng minh và thông tin đơn
                hàng.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-8">
                3. Giải pháp xử lý
              </h3>
              <p>Sau khi xác minh khiếu nại hợp lệ, Printz sẽ:</p>
              <ul>
                <li>In lại sản phẩm miễn phí (nếu lỗi do nhà sản xuất).</li>
                <li>
                  Hoàn tiền 100% giá trị đơn hàng (nếu không thể sản xuất lại).
                </li>
                <li>
                  Bồi thường theo thỏa thuận (nếu gây thiệt hại nghiêm trọng).
                </li>
              </ul>
              <SummaryBox>
                In lại miễn phí hoặc hoàn tiền 100% nếu lỗi được xác minh.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-8">
                4. Trường hợp không được hoàn tiền
              </h3>
              <ul>
                <li>
                  Khách hàng thay đổi ý định sau khi đã xác nhận thiết kế và
                  thanh toán.
                </li>
                <li>
                  Lỗi do file thiết kế của khách hàng cung cấp (độ phân giải
                  thấp, màu sắc không chuẩn).
                </li>
                <li>
                  Sản phẩm đã được sử dụng hoặc làm hỏng sau khi nhận hàng.
                </li>
              </ul>
              <SummaryBox>
                Không hoàn tiền nếu bạn đổi ý, lỗi file thiết kế của bạn, hoặc
                sản phẩm đã sử dụng.
              </SummaryBox>
            </article>
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </div>
  );
}
