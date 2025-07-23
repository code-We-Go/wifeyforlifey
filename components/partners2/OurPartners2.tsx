'use client'
import styles from "./styles.module.css";
import React, {useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";
import { wrap } from "@motionone/utils";

// import sweetAndSour from "./partners/Sweet&Sour.jpeg";
// import sky from "./partners/Sky.jpeg";
// import GoogleLogo from "./partners/Google.svg";
// import DockerLogo from "./partners/Docker.svg";
// import SwiftLogo from "./partners/Swift_logo.svg";
// import FirebaseLogo from "./partners/Firebase_Logo.svg";
// import NextJSLogo from "./partners/nextjs-2.svg";
// import AzureLogo from "./partners/azure.svg";
// import OpenAiLogo from "./partners/openAi.svg";
// import SquareLogo from "./partners/square-logo-cropped.svg";
interface ParallaxProps {
  children: string;
  baseVelocity: number;
}

interface ParallaxLogosProps {
  logos: JSX.Element[];
  baseVelocity?: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  /**
   * This is a magic wrapping for the length of the text - you
   * have to replace for wrapping that works for you or dynamically
   * calculate
   */
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    /**
     * This is what changes the direction of the scroll once we
     * switch scrolling directions.
     */
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  /**
   * The number of times to repeat the child text should be dynamically calculated
   * based on the size of the text and viewport. Likewise, the x motion value is
   * currently wrapped between -20 and -45% - this 25% is derived from the fact
   * we have four children (100% / 4). This would also want deriving from the
   * dynamically generated number of children.
   */
  return (
    <div className={styles.parallax}>
      <motion.div className={styles.scroller} style={{ x }}>
        <span>
          <motion.div
            whileHover={{ color: "#000000" }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </span>
        <span>
          <motion.div
            whileHover={{ color: "#000000" }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </span>
        <span>
          <motion.div
            whileHover={{ color: "#000000" }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </span>
        <span>
          <motion.div
            whileHover={{ color: "#FFFFFFFF" }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </span>
      </motion.div>
    </div>
  );
}

const ParallaxLogos: React.FC<ParallaxLogosProps> = ({
  logos,
  baseVelocity = 100
}) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  /**
   * This is a magic wrapping for the length of the text - you
   * have to replace for wrapping that works for you or dynamically
   * calculate
   */
  const x = useTransform(baseX, (v) => `${wrap(0, -25, v)}%`);
  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    /**
     * This is what changes the direction of the scroll once we
     * switch scrolling directions.
     */
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);

  });

  /**
   * The number of times to repeat the child text should be dynamically calculated
   * based on the size of the text and viewport. Likewise, the x motion value is
   * currently wrapped between -20 and -45% - this 25% is derived from the fact
   * we have four children (100% / 4). This would also want deriving from the
   * dynamically generated number of children.
   */
  return (
    <div className={styles.parallax}>
      <motion.div className={`${styles.scroller} ${styles['flex-container']}`} style={{ x }}>
        {[...Array(4)].flatMap((_, i) =>
          logos.map((logo, index) => (
            <span key={`${i}-${index}`}>
              <motion.div
                whileHover={{ color: "#000000" }}
                transition={{ duration: 0.2 }}
              >
                {React.cloneElement(logo, { className: styles['logo-svg'] })}
              </motion.div>
            </span>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default function App() {
  const logos = ["Sweet&Sour.jpeg","Sky.jpeg","Artima.jpeg","Vogacloset.jpeg","Shosh.jpeg","YesStyle.jpeg","Facefull.jpeg"];
  const logos1 = logos.map((logo,index)=> 
    <div key={index} className='relative overflow-hidden w-52 h-52 rounded-full border-4 border-lovely'>
    <Image  fill className=" inline object-cover" src={`/partners/${logo}`} alt="" />
    </div>
    )
  // const logos1: JSX.Element[] = [
  //   <img src="/partners/Sweet&Sour.jpeg" alt="Sweet & Sour" className={styles['logo-svg']} key="sweetAndSour1" />,
  //   <img src="/partners/Sky.jpeg" alt="Sky" className={styles['logo-svg']} key="sky1" />,
  //   <img src="/partners/Sweet&Sour.jpeg" alt="Sweet & Sour" className={styles['logo-svg']} key="sweetAndSour2" />,
  //   <img src="/partners/Sky.jpeg" alt="Sky" className={styles['logo-svg']} key="sky2" />,
  // ];
  const logos2: JSX.Element[] =logos.map((logo,index)=> 
    <div key={index} className='relative overflow-hidden w-52 h-52 rounded-full border-4 border-lovely'>
    <Image  fill className=" inline object-cover" src={`/partners/${logo}`} alt="" />
    </div>
    )
  return (
    <section className="h-[90vh]">
      <ParallaxLogos baseVelocity={-2.5} logos={logos1} />
      <ParallaxLogos baseVelocity={2.5} logos={logos2} />
    </section>
  );
}

