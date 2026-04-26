import "./FalconAnimation.css";
import falconImage from "../assets/flying_falcon.png";

function FalconAnimation() {
  return (
    <div className="falcon-animation">
      <img
        src={falconImage}
        alt="Blue Falcon flying"
        className="falcon-img"
        draggable={false}
      />
    </div>
  );
}

export default FalconAnimation;