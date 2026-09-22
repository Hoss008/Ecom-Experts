import styles from './StepAccordion.module.css';
import useBundleStore from '../../store/useBundleStore';

/**
 * Reusable accordion step wrapper — used for all 4 steps.
 *
 * @param {Object}    props
 * @param {number}    props.stepNumber    – 1-4
 * @param {string}    props.title         – e.g. "Choose your cameras"
 * @param {string}    props.icon          – path to step icon SVG
 * @param {number}    props.selectedCount – items with qty > 0 in this step
 * @param {string}    [props.nextLabel]   – text for the "Next: …" button
 * @param {function}  [props.onNext]      – called when next button is clicked
 * @param {React.ReactNode} props.children – expanded content
 */
export default function StepAccordion({
  stepNumber,
  title,
  icon,
  selectedCount,
  nextLabel,
  onNext,
  children,
}) {
  const isOpen    = useBundleStore((s) => s.openSteps.includes(stepNumber));
  const toggleStep = useBundleStore((s) => s.toggleStep);

  const handleToggle = () => toggleStep(stepNumber);

  return (
    <div className={`${styles.step} ${isOpen ? styles.stepOpen : styles.stepClosed}`}>
      {/* ── STEP label ── */}
      <span className={styles.stepLabel}>STEP {stepNumber} OF 4</span>

      {/* ── Clickable header row ── */}
      <div
        className={styles.header}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <div className={styles.headerLeft}>
          <img src={icon} alt={`${title} icon`} className={styles.icon} />
          <h2 className={styles.title}>{title}</h2>
        </div>

        <span className={styles.headerRight}>
          {isOpen && (
            <span className={styles.selectedCount}>
              {selectedCount} selected
            </span>
          )}
          <span className={`${styles.chevron} ${isOpen ? styles.chevronUp : ''}`}>
            <svg
              width="14"
              height="8"
              viewBox="0 0 14 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L7 7L13 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </div>

      {/* ── Expanded body ── */}
      {isOpen && (
        <div className={styles.body}>
          {children}

          {nextLabel && onNext && (
            <button
              className={styles.nextBtn}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            >
              {nextLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
