import styles from './extrapanel.module.css';
import waves from '../assets/icon/24/cam/waves.svg';
import shield from '../assets/icon/24/cam/shield.svg';
import extra from '../assets/icon/24/cam/extra.svg';

// Reusable component for a single collapsed step
const CollapsedStep = ({ stepNumber, title, iconPath }) => {
  return (
    <div className={styles.stepWrapper}>
      <span className={styles.stepIndicator}>STEP {stepNumber} OF 4</span>
      
      <div className={styles.stepContent}>
        <div className={styles.stepLeft}>
          {/* We assume you will export the icons to your public folder */}
          <img src={iconPath} alt={`${title} icon`} className={styles.stepIcon} />
          <h2 className={styles.stepTitle}>{title}</h2>
        </div>
        
        {/* Inline SVG for the purple chevron down */}
        <div className={styles.chevron}>
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function RemainingSteps() {
  return (
    <div className={styles.container}>
      <CollapsedStep 
        stepNumber="2" 
        title="Choose your plan" 
        iconPath={shield}
      />
      <CollapsedStep 
        stepNumber="3" 
        title="Choose your sensors" 
        iconPath={waves} 
      />
      <CollapsedStep 
        stepNumber="4" 
        title="Add extra protection" 
        iconPath={extra} 
      />
    </div>
  );
}