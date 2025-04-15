// SidebarAd.js
import React, { useEffect } from 'react';

const SidebarAd = ({ adSlot, width = "160px", height = "600px" }) => {
  useEffect(() => {
    try {
      // Trigger the ad display
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Adsbygoogle push error:", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: width, height: height }}
      data-ad-client="ca-pub-7613562568712383"  // Replace with your publisher ID
      data-ad-slot={adSlot}                   // Passed as a prop
      data-ad-format="vertical"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default SidebarAd;
