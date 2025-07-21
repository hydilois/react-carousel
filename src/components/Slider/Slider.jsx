import { useRef, useState, useEffect, Children } from "react";

import useInView from "../../hooks/useInView";
import useWindowDimensions from "../../hooks/useWindowDimensions";

import styles from "./Slider.module.css";

const Slider = ({
  slidesPerView: initialSliderPerView,
  spaceBetween: initialSpaceBetween,
  slidesPerGroup: initialSliderPerGroup,
  loop,
  breakpoints,
  items,
  children,
  autoPlay = false,
  autoPlayInterval = 2000,
  rows = 1,
}) => {
  const [slidesPerView, setSlidesPerView] = useState(initialSliderPerView);
  const [slidesPerGroup, setSlidesPerGroup] = useState(initialSliderPerGroup);
  const [spaceBetween, setSpaceBetween] = useState(initialSpaceBetween);
  const [activeSlideIndex, setActiveSlideIndex] = useState(
    loop ? slidesPerView : 0
  );
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [sliderItemWidth, setSliderItemWidth] = useState(0);
  const sliderContainerRef = useRef(null);

  const { width: deviceWidth } = useWindowDimensions();

  const { inView: lastSliderItemInView, ref: lastSliderItemRef } = useInView({
    root: sliderContainerRef.current,
    threshold: 0.95,
  });

  const { inView: firstSliderItemInView, ref: firstSliderItemRef } = useInView({
    root: sliderContainerRef.current,
    threshold: 1.0,
  });

  items = items || Children.toArray(children);

  useEffect(() => {
    if (sliderContainerRef.current) {
      const sliderContainerWidth = sliderContainerRef.current.offsetWidth;

      const elements = sliderContainerRef.current.querySelectorAll('.slider-item');

      elements.forEach(el => {
        const sliderItemWidth = Math.ceil((sliderContainerWidth / slidesPerView) - spaceBetween);
        
        el.style.width = sliderItemWidth + 'px';

        Array.from(el.children).forEach(div => {
          div.style.width = sliderItemWidth + 'px';
        });

        setSliderItemWidth(sliderItemWidth);
      });
    }
    
  }, [slidesPerView, spaceBetween]);

  useEffect(() => {
    setTimeout(() => {
      setTransitionEnabled(true);
    }, 100);
  }, [firstSliderItemRef]);

  useEffect(() => {
    if (breakpoints) {
      Object.keys(breakpoints).forEach((breakpoint) => {
        if (Number(breakpoint) && deviceWidth >= Number(breakpoint)) {
          setSlidesPerView(
            (prev) => breakpoints[breakpoint].slidesPerView || prev
          );
          setSlidesPerGroup(
            (prev) => breakpoints[breakpoint].slidesPerGroup || prev
          );
          setSpaceBetween(
            (prev) => breakpoints[breakpoint].spaceBetween || prev
          );
          if(loop) {
            setActiveSlideIndex((prev) => breakpoints[breakpoint].slidesPerView || prev);
          }
        }
      });
    }
  }, [deviceWidth, breakpoints, loop]);

  useEffect(() => {
    let intervalID;
    if (loop && autoPlay) {
      intervalID = setInterval(() => {
        if (
          activeSlideIndex === slidesPerGroup ||
          activeSlideIndex === items.length
        ) {
          setTransitionEnabled(true);
        }
        setActiveSlideIndex((prevIndex) => prevIndex + slidesPerGroup);
      }, autoPlayInterval);
    }
    return () => {
      if (intervalID) {
        clearInterval(intervalID);
      }
    };
  }, [
    loop,
    slidesPerGroup,
    activeSlideIndex,
    items.length,
    autoPlay,
    autoPlayInterval,
  ]);

  const sliderButtonHandler = (direction) => {
    if (
      activeSlideIndex === slidesPerGroup ||
      activeSlideIndex === items.length
    ) {
      setTransitionEnabled(true);
    }
    if (direction === "forward") {
      if (loop || (!loop && !lastSliderItemInView && activeSlideIndex < (items.length - slidesPerGroup))) {
        setActiveSlideIndex((prevIndex) => {
          if((items.length - prevIndex) < slidesPerGroup && items.length - prevIndex != 0) {
            return items.length;
          }
          return prevIndex + slidesPerGroup;
        });
      }
    } else if (direction === "backward") {
      if (loop || (!loop && !firstSliderItemInView && activeSlideIndex > 0)) {
        setActiveSlideIndex((prevIndex) => {
          if(prevIndex < slidesPerGroup) {
            return 0;
          }
          return prevIndex - slidesPerGroup;
        });
      }
    }
  };

  const handleTransitionEnd = () => {
    if (loop) {
      if (activeSlideIndex > items.length) {
        setTransitionEnabled(false);
        setActiveSlideIndex(slidesPerGroup);
      } else if (activeSlideIndex === 0) {
        setTransitionEnabled(false);
        setActiveSlideIndex(items.length);
      }
    }
  };

  const sliderItems = loop
    ? [
        ...items.slice(-slidesPerView),
        ...items,
        ...items.slice(0, slidesPerView),
      ]
    : items;

  const sliderItemsByRow = [];
  if (rows > 1) {
    const itemsPerRow = Math.ceil(sliderItems.length / rows);
    for (let i = 0; i < rows; i++) {
      sliderItemsByRow.push(
        sliderItems.slice(i * itemsPerRow, (i + 1) * itemsPerRow)
      );
    }
  } else {
    sliderItemsByRow.push(sliderItems);
  }

  const setSliderItemRef = (index, sliderItemsArray) => {
    if (loop && index === 0) {
      return firstSliderItemRef;
    }
    if (!loop) {
      if (index === 0) {
        return firstSliderItemRef;
      }
      if (index === sliderItemsArray.length - 1) {
        return lastSliderItemRef;
      }
    }
    return null;
  };

  return (
    <div className={styles.slider}>
      <div className={styles.slidesContainer} ref={sliderContainerRef}>
        <div
          onTransitionEnd={handleTransitionEnd}
          className={rows > 1 ? styles.slidesGrid : ""}
          style={{
            display: rows > 1 ? "grid" : "flex",
            flexDirection: rows > 1 ? "unset" : "column",
            gridTemplateColumns: rows > 1 ? `repeat(${slidesPerView}, 1fr)` : "unset",
            transition: !transitionEnabled ? "none" : "all 0.5s ease-in-out",
            transform: `translateX(${
              (sliderItemWidth + spaceBetween) * activeSlideIndex * -1
            }px)`,
            marginBottom: "3px",
            "--slider-item-width": `${sliderItemWidth}px`,
            "--space-between": `${spaceBetween}px`,
          }}
        >
          {sliderItems.map((item, index, array) => {
            return (
              <div
                className="slider-item"
                key={index}
                ref={setSliderItemRef(index, array)}
                data-slide-index={
                  !loop
                    ? index
                    : index < slidesPerView
                    ? array.length - 2 * slidesPerView - slidesPerView + index
                    : index > array.length - slidesPerView - 1
                    ? index - items.length - slidesPerView
                    : index - slidesPerView
                }
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>
      <button
        className={`${styles.slideButton} ${styles.slideButtonPrev}`}
        onClick={() => sliderButtonHandler("backward")}
      >
        <span
          className={`material-symbols-outlined ${styles.slideButtonIcon}`}
          style={{ letterSpacing: "4px" }}
        >
          arrow_back_ios_new
        </span>
      </button>
      <button
        className={`${styles.slideButton} ${styles.slideButtonNext}`}
        onClick={() => sliderButtonHandler("forward")}
      >
        <span className={`material-symbols-outlined ${styles.slideButtonIcon}`}>
          arrow_forward_ios
        </span>
      </button>
    </div>
  );
};

export default Slider;
