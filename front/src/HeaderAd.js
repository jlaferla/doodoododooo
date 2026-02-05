import React, { useEffect } from 'react';

const HeaderAd = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Adsbygoogle push error:", e);
    }
  }, []);

  return (
    <header className="header-ad">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7613562568712383"
        data-ad-slot="8422564279"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </header>
  );
};

export default HeaderAd;
