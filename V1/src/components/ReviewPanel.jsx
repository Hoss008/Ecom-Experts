import styles from './reviewpanel.module.css';
import productsData from '../data/products.json';

// Reusable row for Cameras, Sensors, and Accessories
const CartItem = ({ item }) => {
  return (
    <div className={styles.cartItem}>
      <div className={styles.itemLeft}>
        {/* If you add image paths to your JSON later, you can map them here */}
        <div className={styles.iconPlaceholder}>
          {item.image ? <img src={item.image} alt={item.title} /> : 'IMG'}
        </div>
        <span className={styles.itemTitle}>{item.title}</span>
      </div>
      
      <div className={styles.itemRight}>
        {item.quantity !== undefined && (
          <div className={styles.qtyControl}>
            <button className={styles.qtyBtn}>-</button>
            <span className={styles.qtyNumber}>{item.quantity}</span>
            <button className={styles.qtyBtn}>+</button>
          </div>
        )}
        
        <div className={styles.pricingCol}>
          {item.oldPrice > 0 && (
            <span className={styles.oldPrice}>${item.oldPrice.toFixed(2)}</span>
          )}
          <span className={item.price === 0 ? styles.freePrice : styles.currentPrice}>
            {item.price === 0 ? "FREE" : `$${item.price.toFixed(2)}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ReviewPanel() {
  // Pulling the initial state directly from your JSON
  const { cart } = productsData.initialState;

  return (
    <aside className={styles.reviewContainer}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.label}>REVIEW</span>
        <h2 className={styles.title}>Your security system</h2>
        <p className={styles.subtitle}>
          Review your personalized protection system designed to keep what matters most safe.
        </p>
      </div>

      {/* Cameras */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>CAMERAS</h4>
        {cart.cameras.map((cam, i) => {
          // Look up the full title from the catalog using the ID
          const catalogItem = productsData.catalog.cameras.find(c => c.id === cam.id);
          return <CartItem key={i} item={{ ...cam, title: catalogItem?.title }} />;
        })}
      </div>

      {/* Sensors */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>SENSORS</h4>
        {cart.sensors.map((sensor, i) => (
          <CartItem key={i} item={sensor} />
        ))}
      </div>

      {/* Accessories */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>ACCESSORIES</h4>
        {cart.accessories.map((acc, i) => (
          <CartItem key={i} item={acc} />
        ))}
      </div>

      {/* Plan */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>PLAN</h4>
        <div className={styles.planRow}>
          <div className={styles.planLeft}>
             <div className={styles.shieldPlaceholder}>🛡️</div>
             <span className={styles.planTitle}><b>Cam</b> Unlimited</span>
          </div>
          <div className={styles.pricingCol}>
            <span className={styles.oldPrice}>${cart.plan.oldPrice}/mo</span>
            <span className={styles.currentPrice}>${cart.plan.price}/mo</span>
          </div>
        </div>
      </div>

      {/* Footer Summary */}
      <div className={styles.summarySection}>
        <div className={styles.shippingRow}>
           <div className={styles.shippingLeft}>
             <span className={styles.truckPlaceholder}>🚚</span>
             <span className={styles.shippingText}>Fast Shipping</span>
           </div>
           <div className={styles.pricingCol}>
             <span className={styles.oldPrice}>$5.99</span>
             <span className={styles.freePrice}>FREE</span>
           </div>
        </div>

        <div className={styles.totalRow}>
          {/* You'll replace this with the actual purple badge SVG from Figma */}
          <div className={styles.guaranteeBadge}>100% Guarantee</div>
          
          <div className={styles.totalsRight}>
            <span className={styles.monthlyBadge}>as low as $19.19/mo</span>
            <div className={styles.totalPrices}>
              <span className={styles.totalOld}>$238.81</span>
              <span className={styles.totalNew}>$187.89</span>
            </div>
          </div>
        </div>

        <p className={styles.savingsText}>Congrats! You're saving $50.92 on your security bundle!</p>
        
        <button className={styles.checkoutBtn}>Checkout</button>
        <a href="#" className={styles.saveLink}>Save my system for later</a>
      </div>
    </aside>
  );
}