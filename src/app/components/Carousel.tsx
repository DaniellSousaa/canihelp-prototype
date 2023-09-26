import React, { useEffect, useState } from 'react';
import styles from './Carousel.module.css'; 
import styless from '../page.module.css'

interface CarouselProps {
  children: React.ReactNode[];
  handleSubmit: () => void;
  isDisabled?: boolean;
  onSlideChange?: (slide: number) => void; 
}

const Carousel: React.FC<CarouselProps> = ({ handleSubmit, isDisabled, onSlideChange,children }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % children.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + children.length) % children.length);
  };

  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentSlide);
    }
  }, [currentSlide]);
  

  return (
    <div>
      {React.Children.map(children, (child, index) => (
        <div className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}>
          {child}
        </div>
      ))}

      {currentSlide !== 0 && <button onClick={prevSlide} className={styles.button}>Anterior</button>}

      {currentSlide === children.length - 1 ? (
        <button className={styless.submitButton} onClick={handleSubmit}>Cadastrar</button>
      ) : (
        <button 
          onClick={nextSlide} 
          className={`${styles.button} ${isDisabled ? styles.buttonDisabled : ''}`} 
          disabled={isDisabled}
        >
            Próximo
        </button>
      )}
    </div>
  );
};

export default Carousel;
