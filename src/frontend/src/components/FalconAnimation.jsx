import React from "react";
import "./FalconAnimation.css";
import falconImage from "../assets/flying_falcon.png";

function FalconAnimation() {
  return (
    <div className="falcon-animation">
      <div className="falcon falcon-1">
        <div className="falcon-wing-motion">
          <img src={falconImage} className="falcon-img" alt="Falcon" />
        </div>
      </div>

      <div className="falcon falcon-2">
        <div className="falcon-wing-motion">
          <img src={falconImage} className="falcon-img" alt="Falcon" />
        </div>
      </div>

      <div className="falcon falcon-3">
        <div className="falcon-wing-motion">
          <img src={falconImage} className="falcon-img" alt="Falcon" />
        </div>
      </div>
    </div>
  );
}

export default FalconAnimation;