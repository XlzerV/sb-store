export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="container py-20 max-w-4xl mx-auto">
      <div className="text-center mb-14">
        <h1 className="text-display-sm text-text mb-3">About SB-Store</h1>
        <div className="w-16 h-1 bg-secondary rounded-full mx-auto" />
      </div>

      <div className="card p-8 md:p-10 space-y-8">
        <p className="text-body-lg text-text-muted leading-relaxed">
          SB-Store is Algeria&apos;s premier destination for premium T-shirts and streetwear. 
          We are passionate about bringing you high-quality fashion that combines comfort, 
          style, and affordability.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-bg-muted rounded-2xl p-6 md:p-8">
            <h2 className="text-heading-md text-text mb-4">Our Mission</h2>
            <p className="text-body-sm text-text-muted leading-relaxed">
              To provide Algerians with access to premium quality T-shirts at affordable prices, 
              with free delivery across all 58 wilayas of Algeria.
            </p>
          </div>
          <div className="bg-bg-muted rounded-2xl p-6 md:p-8">
            <h2 className="text-heading-md text-text mb-4">Why Choose Us</h2>
            <ul className="space-y-2.5 text-body-sm text-text-muted">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-secondary/10 rounded-full flex items-center justify-center text-secondary text-xs shrink-0">&#10003;</span>
                Premium quality materials
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-secondary/10 rounded-full flex items-center justify-center text-secondary text-xs shrink-0">&#10003;</span>
                Free delivery nationwide
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-secondary/10 rounded-full flex items-center justify-center text-secondary text-xs shrink-0">&#10003;</span>
                Cash on delivery
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-secondary/10 rounded-full flex items-center justify-center text-secondary text-xs shrink-0">&#10003;</span>
                Easy returns
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-secondary/10 rounded-full flex items-center justify-center text-secondary text-xs shrink-0">&#10003;</span>
                Authentic products
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-border">
          <h2 className="text-heading-md text-text mb-3">We Cover All Algeria</h2>
          <p className="text-body-sm text-text-muted max-w-lg mx-auto">
            From Algiers to Tamanrasset, Oran to T&eacute;bessa, we deliver to every corner of Algeria.
          </p>
        </div>
      </div>
    </div>
  );
}
