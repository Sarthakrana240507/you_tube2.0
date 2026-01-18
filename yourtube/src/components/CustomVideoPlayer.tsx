import React, { useRef, useState } from "react";

interface Props {
  videoSrc: string;
  onNextVideo: () => void;
  onShowComments: () => void;
  onCloseSite: () => void;
}

const CustomVideoPlayer = ({ videoSrc, onNextVideo, onShowComments, onCloseSite }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);
  const [tapCount, setTapCount] = useState(0);

  const handleTap = (e: React.MouseEvent) => {
    const x = e.clientX;
    const width = window.innerWidth;
    const region = x < width * 0.33 ? "left" : x > width * 0.66 ? "right" : "middle";

    // Count taps safely
    setTapCount(prev => prev + 1);

    if (!tapTimeout) {
      const timeout = setTimeout(() => {
        setTapCount(count => {
          // Use the updated tap count value here
          if (count === 1 && region === "middle") {
            videoRef.current?.pause();
          }

          if (count === 2) {
            if (region === "right") videoRef.current!.currentTime += 10;
            if (region === "left") videoRef.current!.currentTime -= 10;
          }

          if (count === 3) {
            if (region === "middle") onNextVideo();
            if (region === "right") onCloseSite();
            if (region === "left") onShowComments();
          }

          return 0; // reset taps
        });

        setTapTimeout(null);
      }, 300);

      setTapTimeout(timeout);
    }
  };

  return (
    <div className="video-container" onClick={handleTap} style={{ width: "100%", height: "100vh", background: "black" }}>
      <video
        ref={videoRef}
        src={videoSrc}
        controls={false}
        autoPlay
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
};

export default CustomVideoPlayer;
