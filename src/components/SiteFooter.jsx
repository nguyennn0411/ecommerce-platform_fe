import { Link } from 'react-router-dom'

export default function SiteFooter() {
  return (
    <footer className="sz-footer">
      <div className="sz-footer-inner">
        <div>
          <p className="sz-footer-brand">StepZone</p>
          <p className="sz-footer-desc">
            Nâng tầm streetwear bằng thiết kế chọn lọc và phong cách hiệu năng
            cao.
          </p>
        </div>
        <div className="sz-footer-col">
          <h4>Hỗ trợ</h4>
          <Link to="/products">Liên hệ</Link>
          <Link to="/products">Vận chuyển</Link>
          <Link to="/products">Đổi trả</Link>
        </div>
        <div className="sz-footer-col">
          <h4>Pháp lý</h4>
          <Link to="/products">Chính sách bảo mật</Link>
          <Link to="/products">Điều khoản dịch vụ</Link>
        </div>
      </div>
      <div className="sz-footer-bottom">
        © {new Date().getFullYear()} StepZone. Đã đăng ký bản quyền.
      </div>
    </footer>
  )
}
