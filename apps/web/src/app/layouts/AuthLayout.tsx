import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <div className="brand-mark">DollyVault</div>
        <Outlet />
      </section>
      <section className="auth-art" aria-hidden="true">
        <div className="soft-product-card">
          <div className="placeholder-doll" />
          <strong>把每一只宝贝都好好收藏</strong>
          <span>图鉴、库存、估值和分享海报，轻轻松松放进一个小金库。</span>
        </div>
      </section>
    </main>
  );
}
