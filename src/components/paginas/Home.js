import React, { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import HomeDesktop from './HomeDesktop';
import HomeMobile from './HomeMobile';

const Home = () => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(window.innerWidth <= 768 || isMobile);
    };

    handleResize(); 
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  console.log('isMobileDevice:', isMobileDevice);

  return isMobileDevice ? <HomeMobile /> : <HomeDesktop />;
};

export default Home;
