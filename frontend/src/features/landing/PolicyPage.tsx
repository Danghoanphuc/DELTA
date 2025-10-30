import { Card } from "@/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Shield,
  FileText,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function PolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDcsMTUxLDIzNCwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="mb-6">
              <span className="block">Chính sách &</span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Điều khoản
              </span>
            </h1>
            <p className="text-xl text-slate-600">
              Cam kết bảo vệ quyền lợi và đảm bảo trải nghiệm tốt nhất cho khách
              hàng
            </p>
          </div>
        </div>
      </section>

      {/* Policy Tabs */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="privacy" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-12 h-auto p-2 bg-slate-100 rounded-2xl">
              <TabsTrigger
                value="privacy"
                className="py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Shield className="w-5 h-5 mr-2" />
                Bảo mật
              </TabsTrigger>
              <TabsTrigger
                value="terms"
                className="py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
              >
                <FileText className="w-5 h-5 mr-2" />
                Điều khoản
              </TabsTrigger>
              <TabsTrigger
                value="return"
                className="py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-red-600 data-[state=active]:text-white"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Đổi trả
              </TabsTrigger>
            </TabsList>

            {/* Privacy Policy */}
            <TabsContent value="privacy" className="space-y-8">
              <div>
                <h2 className="mb-6">Chính sách Bảo mật Thông tin</h2>
                <p className="text-slate-600 mb-8">
                  Tại Printz.vn, chúng tôi cam kết bảo vệ thông tin cá nhân của
                  khách hàng. Chính sách này giải thích cách chúng tôi thu thập,
                  sử dụng và bảo vệ dữ liệu của bạn.
                </p>

                {/* Article 1 */}
                <Card className="p-8 mb-6 border-2 border-transparent hover:border-purple-200 transition-colors">
                  <h3 className="mb-4">Điều 1: Thông tin chúng tôi thu thập</h3>
                  <div className="space-y-3 text-slate-600 mb-6">
                    <p>
                      <strong>1.1.</strong> Thông tin cá nhân: Họ tên, địa chỉ
                      email, số điện thoại, địa chỉ giao hàng.
                    </p>
                    <p>
                      <strong>1.2.</strong> Thông tin đơn hàng: Sản phẩm đặt
                      mua, số lượng, giá trị, lịch sử giao dịch.
                    </p>
                    <p>
                      <strong>1.3.</strong> Thông tin kỹ thuật: Địa chỉ IP, loại
                      trình duyệt, thời gian truy cập, cookies.
                    </p>
                    <p>
                      <strong>1.4.</strong> Thông tin thanh toán: Được xử lý an
                      toàn qua các cổng thanh toán bên thứ ba, chúng tôi không
                      lưu trữ thông tin thẻ tín dụng đầy đủ.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-blue-900 mb-2">Tóm tắt Điều 1</h5>
                        <p className="text-blue-800">
                          Chúng tôi chỉ thu thập thông tin cần thiết để xử lý
                          đơn hàng và cải thiện dịch vụ. Thông tin thanh toán
                          được bảo mật tuyệt đối thông qua đối tác uy tín.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Article 2 */}
                <Card className="p-8 mb-6 border-2 border-transparent hover:border-purple-200 transition-colors">
                  <h3 className="mb-4">Điều 2: Mục đích sử dụng thông tin</h3>
                  <div className="space-y-3 text-slate-600 mb-6">
                    <p>
                      <strong>2.1.</strong> Xử lý và giao hàng: Sử dụng thông
                      tin để xác nhận, xử lý đơn hàng và giao hàng cho bạn.
                    </p>
                    <p>
                      <strong>2.2.</strong> Hỗ trợ khách hàng: Liên hệ giải đáp
                      thắc mắc, xử lý khiếu nại và cung cấp dịch vụ chăm sóc.
                    </p>
                    <p>
                      <strong>2.3.</strong> Cải thiện dịch vụ: Phân tích hành vi
                      người dùng để tối ưu trải nghiệm và phát triển tính năng
                      mới.
                    </p>
                    <p>
                      <strong>2.4.</strong> Marketing (nếu đồng ý): Gửi thông
                      tin khuyến mãi, sản phẩm mới. Bạn có thể từ chối bất cứ
                      lúc nào.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-purple-900 mb-2">Tóm tắt Điều 2</h5>
                        <p className="text-purple-800">
                          Thông tin của bạn chỉ được sử dụng để phục vụ đơn
                          hàng, hỗ trợ khách hàng và cải thiện dịch vụ. Mọi hoạt
                          động marketing đều có sự đồng ý của bạn.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Article 3 */}
                <Card className="p-8 mb-6 border-2 border-transparent hover:border-purple-200 transition-colors">
                  <h3 className="mb-4">Điều 3: Bảo mật và chia sẻ thông tin</h3>
                  <div className="space-y-3 text-slate-600 mb-6">
                    <p>
                      <strong>3.1.</strong> Bảo mật: Sử dụng SSL encryption,
                      firewall và các biện pháp kỹ thuật tiên tiến để bảo vệ dữ
                      liệu.
                    </p>
                    <p>
                      <strong>3.2.</strong> Đối tác cần thiết: Chia sẻ thông tin
                      với nhà in, đơn vị vận chuyển để thực hiện đơn hàng.
                    </p>
                    <p>
                      <strong>3.3.</strong> Tuân thủ pháp luật: Cung cấp thông
                      tin khi có yêu cầu từ cơ quan có thẩm quyền.
                    </p>
                    <p>
                      <strong>3.4.</strong> Không bán thông tin: Chúng tôi cam
                      kết không bán hoặc cho thuê thông tin cá nhân cho bên thứ
                      ba.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-green-900 mb-2">Tóm tắt Điều 3</h5>
                        <p className="text-green-800">
                          Thông tin được bảo mật bằng công nghệ hàng đầu và chỉ
                          chia sẻ khi cần thiết để phục vụ đơn hàng. Printz.vn
                          cam kết không bao giờ bán thông tin khách hàng.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Article 4 */}
                <Card className="p-8 border-2 border-transparent hover:border-purple-200 transition-colors">
                  <h3 className="mb-4">Điều 4: Quyền của khách hàng</h3>
                  <div className="space-y-3 text-slate-600 mb-6">
                    <p>
                      <strong>4.1.</strong> Quyền truy cập: Yêu cầu xem thông
                      tin cá nhân chúng tôi lưu trữ về bạn.
                    </p>
                    <p>
                      <strong>4.2.</strong> Quyền chỉnh sửa: Cập nhật hoặc sửa
                      đổi thông tin cá nhân không chính xác.
                    </p>
                    <p>
                      <strong>4.3.</strong> Quyền xóa: Yêu cầu xóa thông tin cá
                      nhân (trừ thông tin cần giữ theo quy định pháp luật).
                    </p>
                    <p>
                      <strong>4.4.</strong> Quyền từ chối: Từ chối nhận email
                      marketing hoặc xử lý dữ liệu cho mục đích không cần thiết.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-orange-900 mb-2">Tóm tắt Điều 4</h5>
                        <p className="text-orange-800">
                          Bạn có toàn quyền kiểm soát thông tin cá nhân: truy
                          cập, chỉnh sửa, xóa hoặc từ chối sử dụng. Liên hệ
                          support@printz.vn để thực hiện quyền của bạn.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Terms of Service */}
            <TabsContent value="terms" className="space-y-8">
              <div>
                <h2 className="mb-6">Điều khoản Sử dụng Dịch vụ</h2>
                <p className="text-slate-600 mb-8">
                  Khi sử dụng dịch vụ của Printz.vn, bạn đồng ý tuân thủ các
                  điều khoản sau đây.
                </p>

                {/* Article 1 */}
                <Card className="p-8 mb-6 border-2 border-transparent hover:border-purple-200 transition-colors">
                  <h3 className="mb-4">Điều 1: Tài khoản người dùng</h3>
                  <div className="space-y-3 text-slate-600 mb-6">
                    <p>
                      <strong>1.1.</strong> Đăng ký: Bạn cần cung cấp thông tin
                      chính xác, đầy đủ khi đăng ký tài khoản.
                    </p>
                    <p>
                      <strong>1.2.</strong> Bảo mật tài khoản: Bạn có trách
                      nhiệm bảo vệ mật khẩu và thông tin đăng nhập.
                    </p>
                    <p>
                      <strong>1.3.</strong> Hoạt động tài khoản: Mọi hoạt động
                      từ tài khoản của bạn là trách nhiệm của bạn.
                    </p>
                    <p>
                      <strong>1.4.</strong> Khóa tài khoản: Chúng tôi có quyền
                      khóa tài khoản vi phạm điều khoản mà không cần báo trước.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-blue-900 mb-2">Tóm tắt Điều 1</h5>
                        <p className="text-blue-800">
                          Người dùng chịu trách nhiệm về tài khoản của mình, bao
                          gồm bảo mật thông tin đăng nhập và các hoạt động phát
                          sinh từ tài khoản.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Article 2 */}
                <Card className="p-8 mb-6 border-2 border-transparent hover:border-purple-200 transition-colors">
                  <h3 className="mb-4">
                    Điều 2: Quy định về thiết kế và nội dung
                  </h3>
                  <div className="space-y-3 text-slate-600 mb-6">
                    <p>
                      <strong>2.1.</strong> Bản quyền: Bạn phải đảm bảo có quyền
                      sử dụng mọi nội dung, hình ảnh trong thiết kế.
                    </p>
                    <p>
                      <strong>2.2.</strong> Nội dung cấm: Không được in ấn nội
                      dung vi phạm pháp luật, phản động, khiêu dâm, xúc phạm.
                    </p>
                    <p>
                      <strong>2.3.</strong> Kiểm duyệt: Printz.vn có quyền từ
                      chối in ấn các thiết kế vi phạm quy định.
                    </p>
                    <p>
                      <strong>2.4.</strong> Trách nhiệm: Khách hàng chịu trách
                      nhiệm pháp lý về nội dung thiết kế của mình.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-purple-900 mb-2">Tóm tắt Điều 2</h5>
                        <p className="text-purple-800">
                          Khách hàng phải đảm bảo nội dung thiết kế hợp pháp, có
                          bản quyền và không vi phạm quy định của pháp luật.
                          Printz.vn có quyền từ chối các đơn hàng vi phạm.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Article 3 */}
                <Card className="p-8 mb-6 border-2 border-transparent hover:border-purple-200 transition-colors">
                  <h3 className="mb-4">Điều 3: Đặt hàng và thanh toán</h3>
                  <div className="space-y-3 text-slate-600 mb-6">
                    <p>
                      <strong>3.1.</strong> Xác nhận đơn hàng: Đơn hàng chỉ được
                      xác nhận sau khi thanh toán thành công.
                    </p>
                    <p>
                      <strong>3.2.</strong> Giá cả: Giá hiển thị đã bao gồm VAT.
                      Phí vận chuyển tính riêng tùy địa điểm.
                    </p>
                    <p>
                      <strong>3.3.</strong> Hủy đơn: Có thể hủy miễn phí trong
                      24h, sau đó tùy thuộc vào tình trạng sản xuất.
                    </p>
                    <p>
                      <strong>3.4.</strong> Hoàn tiền: Xử lý trong 7-14 ngày làm
                      việc kể từ khi xác nhận hủy đơn hợp lệ.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-green-900 mb-2">Tóm tắt Điều 3</h5>
                        <p className="text-green-800">
                          Đơn hàng được xác nhận sau thanh toán. Khách hàng có
                          thể hủy đơn trong 24h đầu miễn phí, hoàn tiền được xử
                          lý trong 7-14 ngày làm việc.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Article 4 */}
                <Card className="p-8 border-2 border-transparent hover:border-purple-200 transition-colors">
                  <h3 className="mb-4">Điều 4: Trách nhiệm và giới hạn</h3>
                  <div className="space-y-3 text-slate-600 mb-6">
                    <p>
                      <strong>4.1.</strong> Chất lượng: Chúng tôi cam kết cung
                      cấp sản phẩm đúng mô tả và chất lượng đã thỏa thuận.
                    </p>
                    <p>
                      <strong>4.2.</strong> Độ lệch màu: Có thể có độ lệch màu
                      nhỏ (±5%) do đặc thù kỹ thuật in ấn.
                    </p>
                    <p>
                      <strong>4.3.</strong> Lỗi khách hàng: Không chịu trách
                      nhiệm về lỗi thiết kế từ phía khách hàng đã được xác nhận.
                    </p>
                    <p>
                      <strong>4.4.</strong> Bất khả kháng: Không chịu trách
                      nhiệm về sự chậm trễ do thiên tai, dịch bệnh, chiến tranh.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-orange-900 mb-2">Tóm tắt Điều 4</h5>
                        <p className="text-orange-800">
                          Printz.vn cam kết chất lượng sản phẩm nhưng có giới
                          hạn trách nhiệm về độ lệch màu kỹ thuật, lỗi thiết kế
                          từ khách hàng và các yếu tố bất khả kháng.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Return Policy */}
            <TabsContent value="return" className="space-y-8">
              <div>
                <h2 className="mb-6">Chính sách Đổi trả & Hoàn tiền</h2>
                <p className="text-slate-600 mb-8">
                  Printz.vn cam kết đảm bảo quyền lợi khách hàng với chính sách
                  đổi trả minh bạch và công bằng.
                </p>

                {/* Article 1 */}
                <Card className="p-8 mb-6 border-2 border-transparent hover:border-purple-200 transition-colors">
                  <h3 className="mb-4">Điều 1: Điều kiện đổi trả</h3>
                  <div className="space-y-3 text-slate-600 mb-6">
                    <p>
                      <strong>1.1.</strong> Thời hạn: Trong vòng 7 ngày kể từ
                      khi nhận hàng.
                    </p>
                    <p>
                      <strong>1.2.</strong> Sản phẩm lỗi: Do nhà in (in sai mẫu,
                      in lỗi, chất lượng kém).
                    </p>
                    <p>
                      <strong>1.3.</strong> Giao sai: Sản phẩm giao không đúng
                      như đơn hàng (số lượng, loại sản phẩm).
                    </p>
                    <p>
                      <strong>1.4.</strong> Hư hỏng vận chuyển: Sản phẩm bị hỏng
                      trong quá trình giao hàng (có ảnh chứng minh).
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-blue-900 mb-2">Tóm tắt Điều 1</h5>
                        <p className="text-blue-800">
                          Khách hàng có 7 ngày để đổi trả sản phẩm nếu có lỗi từ
                          nhà in, giao sai hoặc hư hỏng trong quá trình vận
                          chuyển.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Article 2 */}
                <Card className="p-8 mb-6 border-2 border-transparent hover:border-purple-200 transition-colors">
                  <h3 className="mb-4">
                    Điều 2: Trường hợp không áp dụng đổi trả
                  </h3>
                  <div className="space-y-3 text-slate-600 mb-6">
                    <p>
                      <strong>2.1.</strong> Lỗi thiết kế: Khách hàng đã xác nhận
                      file thiết kế có lỗi trước khi in.
                    </p>
                    <p>
                      <strong>2.2.</strong> Sản phẩm đặc biệt: Sản phẩm được in
                      theo yêu cầu riêng, không thể tái sử dụng.
                    </p>
                    <p>
                      <strong>2.3.</strong> Đã sử dụng: Sản phẩm đã qua sử dụng
                      hoặc có dấu hiệu đã mở seal bảo vệ.
                    </p>
                    <p>
                      <strong>2.4.</strong> Quá thời hạn: Yêu cầu đổi trả sau 7
                      ngày kể từ ngày nhận hàng.
                    </p>
                    <p>
                      <strong>2.5.</strong> Thay đổi ý định: Khách hàng đơn
                      thuần muốn đổi mẫu hoặc không còn nhu cầu.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-red-900 mb-2">Tóm tắt Điều 2</h5>
                        <p className="text-red-800">
                          Không áp dụng đổi trả cho lỗi do khách hàng, sản phẩm
                          đặc biệt, sản phẩm đã sử dụng, quá hạn hoặc thay đổi ý
                          định mua hàng.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Article 3 */}
                <Card className="p-8 mb-6 border-2 border-transparent hover:border-purple-200 transition-colors">
                  <h3 className="mb-4">Điều 3: Quy trình đổi trả</h3>
                  <div className="space-y-3 text-slate-600 mb-6">
                    <p>
                      <strong>3.1.</strong> Liên hệ: Gọi hotline 1900 xxxx hoặc
                      email support@printz.vn trong vòng 24h kể từ khi nhận
                      hàng.
                    </p>
                    <p>
                      <strong>3.2.</strong> Cung cấp thông tin: Mã đơn hàng, ảnh
                      chụp sản phẩm lỗi (toàn bộ và chi tiết lỗi).
                    </p>
                    <p>
                      <strong>3.3.</strong> Xác nhận: Bộ phận chăm sóc khách
                      hàng kiểm tra và xác nhận yêu cầu trong 24-48h.
                    </p>
                    <p>
                      <strong>3.4.</strong> Thu hồi & đổi mới: Nếu được chấp
                      nhận, chúng tôi sẽ thu hồi sản phẩm lỗi và gửi sản phẩm
                      mới hoặc hoàn tiền.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-purple-900 mb-2">Tóm tắt Điều 3</h5>
                        <p className="text-purple-800">
                          Quy trình đổi trả đơn giản: liên hệ trong 24h → cung
                          cấp ảnh chứng minh → xác nhận trong 48h → thu hồi và
                          đổi mới/hoàn tiền.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Article 4 */}
                <Card className="p-8 border-2 border-transparent hover:border-purple-200 transition-colors">
                  <h3 className="mb-4">Điều 4: Chính sách hoàn tiền</h3>
                  <div className="space-y-3 text-slate-600 mb-6">
                    <p>
                      <strong>4.1.</strong> Hoàn tiền toàn bộ: Nếu lỗi từ
                      Printz.vn hoặc nhà in, hoàn 100% giá trị đơn hàng.
                    </p>
                    <p>
                      <strong>4.2.</strong> Hoàn tiền một phần: Nếu chỉ một phần
                      sản phẩm bị lỗi, hoàn tiền theo tỷ lệ tương ứng.
                    </p>
                    <p>
                      <strong>4.3.</strong> Phương thức: Hoàn tiền qua tài khoản
                      ngân hàng hoặc ví điện tử đã thanh toán.
                    </p>
                    <p>
                      <strong>4.4.</strong> Thời gian: 7-14 ngày làm việc kể từ
                      khi xác nhận hoàn tiền (tùy ngân hàng).
                    </p>
                    <p>
                      <strong>4.5.</strong> Lựa chọn khác: Khách hàng có thể
                      chọn nhận credit vào tài khoản Printz.vn để sử dụng cho
                      đơn hàng tiếp theo.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-green-900 mb-2">Tóm tắt Điều 4</h5>
                        <p className="text-green-800">
                          Hoàn tiền toàn bộ hoặc một phần tùy mức độ lỗi, được
                          xử lý trong 7-14 ngày làm việc qua phương thức thanh
                          toán ban đầu hoặc credit tài khoản.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-6 text-white">Còn thắc mắc về chính sách?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Đội ngũ hỗ trợ của chúng tôi sẵn sàng giải đáp mọi câu hỏi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/lien-he" className="inline-block">
              <button className="bg-white text-purple-600 hover:bg-blue-50 px-8 py-4 rounded-full transition-colors">
                Liên hệ hỗ trợ
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
