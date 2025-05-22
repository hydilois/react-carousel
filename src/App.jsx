import Slider from './components/Slider/Slider';

import './App.css';

function App() {
  const sliderItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="flex-container">
          <Slider
            spaceBetween={16}
            slidesPerView={4}
            slidesPerGroup={4}
            loop={true}
            autoPlay={true}
            autoPlayInterval={4000}
            breakpoints={{
              320: {
                slidesPerView: 1,
                slidesPerGroup: 1,
              },
              1366: {
                slidesPerView: 4,
                slidesPerGroup: 4,
                spaceBetween: 18,
              },
            }}
          >
            {sliderItems.map((item, index) => (
                <div className="item" key={index}>{item}</div>
            ))}
          </Slider>
    </div>
  );
}

export default App;
