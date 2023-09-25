import React, { useState } from 'react';
import styles from './Carousel.module.css'; 
import styless from '../page.module.css'

interface CarouselProps {
  children: React.ReactNode[];
  handleSubmit: () => void;
}


const Carousel: React.FC<CarouselProps> = ({ handleSubmit,children }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % children.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + children.length) % children.length);
  };

  return (
    <div>
      {React.Children.map(children, (child, index) => (
        <div className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}>
          {child}
        </div>
      ))}

      {/* Se estiver na primeira página, não mostrar o botão "Anterior" */}
      {currentSlide !== 0 && <button onClick={prevSlide} className={styles.button}>Anterior</button>}

      {/* Se estiver na última página, mostrar o botão "Cadastrar", caso contrário, mostrar "Próximo" */}
      {currentSlide === children.length - 1 ? (
        <button className={styless.submitButton} onClick={handleSubmit}>Cadastrar</button>
      ) : (
        <button onClick={nextSlide} className={styles.button}>Próximo</button>
      )}
    </div>
  );
};

export default Carousel;
