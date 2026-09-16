import { 
  calculateFreeBodyPositions, 
  calculateInclinePositions, 
  calculatePulleyPositions,
  calculateInclinePulleyPositions,
  calculateProjectileMotionPositions,
  calculateAngledProjectilePositions,
  calculateAngledLaunchFromHeightPositions,

} from "./physics/physicsPositions";
import {renderFreeBodyDiagram, 
  renderInclinedPlane, 
  renderPulleySystem,
  renderInclinePulleySystem,
  renderProjectileMotion,
  renderAngledProjectile,
  renderAngledLaunchFromHeight,
} from "./physics/physicsRender";

import { getSvgDimensions } from "./geometry/geometryHelpers";
import { useIsMobile } from "../../../../hooks/useIsMobile";

export default function PhysicsVisual({ visual }) {
  const isMobile = useIsMobile();
  const { width, height } = getSvgDimensions(isMobile);

  if (!visual) return null;

  const figure = visual?.figure || {};
  const elements = visual?.elements || [];
  const inclineAngle = visual?.incline_angle || 30;
 // console.log("incline_angle : ", incline_angle)

  let plane = null;
  let content = null;

  if (figure.subtype === "free_body_diagram") {
    plane = calculateFreeBodyPositions({ elements, isMobile });
    content = renderFreeBodyDiagram(plane, isMobile);
}
  else if (figure.subtype === "inclined_plane") {
    plane = calculateInclinePositions({ elements, inclineAngle, isMobile });
    content = renderInclinedPlane(plane,  elements, isMobile);
}
  else if (figure.subtype === "pulley_system") {
  const elements = visual?.elements || [];
  plane = calculatePulleyPositions({ elements, isMobile });
  content = renderPulleySystem(plane, elements, isMobile);
}

else if (figure.subtype === "incline_pulley_system") {
  const elements = visual?.elements || [];
  plane = calculateInclinePulleyPositions({ elements, inclineAngle, isMobile });
  content = renderInclinePulleySystem(plane, elements, isMobile);
}

else if (figure.subtype === "projectile_motion" ) {
  const elements = visual?.elements || [];
 if (figure.feature === "angled_launch_from_height") {
  plane = calculateAngledLaunchFromHeightPositions({ figure, isMobile });
  content = renderAngledLaunchFromHeight(plane, elements, isMobile);
} else if (figure.feature === "angled_launch") {
  plane = calculateAngledProjectilePositions({ figure, isMobile });
  content = renderAngledProjectile(plane, elements, isMobile);
} else {
  plane = calculateProjectileMotionPositions({ figure, isMobile });
  content = renderProjectileMotion(plane, elements, isMobile);
}
}


  if (!content) return null;

  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="flex justify-center w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-xl" role="img" aria-label="Physics diagram">
          {content}
        </svg>
      </div>
    </div>
  );
}