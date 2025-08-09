import { Link } from 'react-router-dom'
import './landing.css'

function LandingPage() {
  return (
    <div className="gradient-bg">
      <section className="landing-hero container-fluid px-0">
        <div className="row align-items-center gy-4 gy-lg-5 gx-0">
          {/* Left: Headline and CTAs */}
          <div className="col-12 col-lg-6 text-center text-lg-start">
            <div className="mb-3">
              <span className="stat-badge">
                <span className="badge text-bg-success">New</span>
                <span>Deliver smarter. Manage stock faster.</span>
              </span>
            </div>
            <h1 className="display-4 hero-title mb-3">
              Got Stock? <span className="text-success">Meet Control.</span>
            </h1>
            <p className="lead hero-subtitle mb-4">
              A multi-tenant platform for companies and shops to streamline inventory, deliveries, and restocks.
            </p>
            {/* Omitted primary CTA row as requested */}
            <div className="d-flex feature-pills flex-wrap mt-3 justify-content-center justify-content-lg-start">
              <span className="feature-pill">Low stock alerts</span>
              <span className="feature-pill">Smart restock</span>
              <span className="feature-pill">Multi-tenant</span>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="col-12 col-lg-6 hero-visual">
            <div className="hero-blob" aria-hidden="true"></div>
            <div className="hero-image-wrapper">
              <img src="/hero-warehouse.svg" alt="Warehouse and stock" className="img-fluid" />
            </div>
          </div>
        </div>
      </section>

      {/* Split CTA cards */}
      <section className="container-fluid px-0 pb-4">
        <div className="row gy-3 gx-0">
          <div className="col-12 col-lg-6">
            <div className="card cta-card p-3 bg-light">
              <div className="row g-3 align-items-center">
                <div className="col-8">
                  <h3 className="h5 mb-1">For Companies</h3>
                  <p className="subtle-muted mb-3">Find, deliver, and monitor stock for all your stores. Approve shop access and manage products.</p>
                  <Link to="/register/company" className="btn btn-success">Join as a company</Link>
                </div>
                <div className="col-4 text-end">
                  <img className="illustration img-fluid" src="https://images.unsplash.com/photo-1598514982147-3e4f8c541a2e?q=80&w=800&auto=format&fit=crop" alt="Company logistics" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card cta-card p-3" style={{ background: '#ffe9e3' }}>
              <div className="row g-3 align-items-center">
                <div className="col-8">
                  <h3 className="h5 mb-1">For Shops</h3>
                  <p className="subtle-muted mb-3">Request access to companies, track stock levels, and send smart restock requests.</p>
                  <Link to="/register/shop" className="btn btn-outline-dark">Join as a shop</Link>
                </div>
                <div className="col-4 text-end">
                  <img className="illustration img-fluid" src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop" alt="Shop shelves" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular categories */}
      <section className="container-fluid px-0 pb-5">
        <h2 className="section-heading h3 text-center mb-4">Popular categories</h2>
        <div className="row gy-3 gy-md-4 gx-0">
          <div className="col-6 col-md-3">
            <div className="card category-card text-center p-3">
              <div className="category-icon">🏬</div>
              <div className="fw-semibold mt-2">Stores</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card category-card text-center p-3">
              <div className="category-icon">📦</div>
              <div className="fw-semibold mt-2">Products</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card category-card text-center p-3">
              <div className="category-icon">🚚</div>
              <div className="fw-semibold mt-2">Deliveries</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card category-card text-center p-3">
              <div className="category-icon">🔔</div>
              <div className="fw-semibold mt-2">Restock Alerts</div>
            </div>
          </div>
        </div>
      </section>

      {/* New Section: How it works */}
      <section className="container-fluid px-0 pb-5">
        <h2 className="section-heading h3 text-center mb-4">How it works</h2>
        <div className="row gy-3 gx-0">
          <div className="col-12 col-md-4">
            <div className="step-card p-3 h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="step-icon me-2">1</div>
                </div>
                <img className="step-illustration" src="https://images.unsplash.com/photo-1581091226825-c6a89e7b35d4?q=80&w=800&auto=format&fit=crop" alt="Account setup" />
              </div>
              <div className="fw-semibold mt-3">Join and set up</div>
              <div className="text-muted">Create a company or shop account, then add stores and products.</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="step-card p-3 h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="step-icon me-2">2</div>
                </div>
                <img className="step-illustration" src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop" alt="Deliveries tracking" />
              </div>
              <div className="fw-semibold mt-3">Deliver and track</div>
              <div className="text-muted">Record deliveries, auto-deduct warehouse stock, and update shop stock.</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="step-card p-3 h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="step-icon me-2">3</div>
                </div>
                <img className="step-illustration" src="https://images.unsplash.com/photo-1506368249639-73a05d6f6488?q=80&w=800&auto=format&fit=crop" alt="Restock automation" />
              </div>
              <div className="fw-semibold mt-3">Restock smarter</div>
              <div className="text-muted">Get low stock alerts and manage restock requests in one place.</div>
            </div>
          </div>
        </div>
      </section>

      {/* New Section: Testimonials */}
      <section className="container-fluid px-0 pb-5">
        <h2 className="section-heading h3 text-center mb-4">What teams say</h2>
        <div className="row gy-3 gx-0">
          <div className="col-12 col-md-6">
            <div className="testimonial-card p-3 h-100">
              <div className="d-flex align-items-center mb-2">
                <img className="avatar me-2" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" alt="Reviewer avatar" />
                <div>
                  <div className="fw-semibold">Alex Morgan</div>
                  <div className="text-muted small">Ops Manager, Regional Retailer</div>
                </div>
              </div>
              <div className="rating mb-2">★★★★★</div>
              <p className="mb-0">“Stocky reduced our stockouts by 40% and gave us real-time visibility.”</p>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="testimonial-card p-3 h-100">
              <div className="d-flex align-items-center mb-2">
                <img className="avatar me-2" src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop" alt="Reviewer avatar" />
                <div>
                  <div className="fw-semibold">Priya Shah</div>
                  <div className="text-muted small">Head of Supply, FMCG Brand</div>
                </div>
              </div>
              <div className="rating mb-2">★★★★★</div>
              <p className="mb-0">“Approvals and deliveries are finally in one hub—our shops love it.”</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage


