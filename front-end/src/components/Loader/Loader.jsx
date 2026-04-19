import React from 'react';
import styles from './Loader.module.css';

export default function Loader({ fullScreen = false, text = "Loading..." }) {
  if (fullScreen) {
    return (
      <div className={styles.fullScreenOverlay}>
        <div className={styles.loaderContainer}>
          <div className={styles.spinner}></div>
          {text && <p className={styles.loadingText}>{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.inlineWrapper}>
      <div className={styles.spinner}></div>
      {text && <p className={styles.loadingText}>{text}</p>}
    </div>
  );
}