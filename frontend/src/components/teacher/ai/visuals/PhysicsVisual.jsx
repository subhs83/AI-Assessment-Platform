import {renderOpticsDefs} from "./physics/rayOptics/rayOpticsHelpers"
import { getSvgDimensions } from "./geometry/geometryHelpers";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import {detectPointChargeVariant, detectTwoChargeVariant, detectFieldLinesBetweenVariant} from "./physics/emf/emfHelpers"
import { 
  calculateFreeBodyPositions, calculateInclinePositions,  calculatePulleyPositions, calculateInclinePulleyPositions, 
  calculateProjectileMotionPositions, calculateAngledProjectilePositions, calculateAngledLaunchFromHeightPositions,
} from "./physics/physicsPositions";
import {
  renderFreeBodyDiagram, renderInclinedPlane, renderPulleySystem,renderInclinePulleySystem,
  renderProjectileMotion, renderAngledProjectile, renderAngledLaunchFromHeight,
} from "./physics/physicsRender";

import {
  calculateWavePositions, calculateStandingWavePositions, calculateLongitudinalWavePositions, 
  calculateFixedStringHarmonicPositions, calculateWaveSuperpositionPositions, calculateDopplerEffectPositions,
} from "./physics/soundWave/soundWavePositions"
import { 
  renderTransverseWave, renderStandingWave,renderLongitudinalWave, 
  renderFixedStringHarmonic, renderWaveSuperposition, renderDopplerEffect,
} from "./physics/soundWave/soundWaveRender"

import {
  calculateCircuitPositions,calculateParallelCircuitPositions, calculateBridgeCircuitPositions,
  calculateCombinationCircuitPositions, calculateJunctionPositions, calculateTwoSourceCombinationPositions,
  calculateMeterBridgePositions,
} from "./physics/circuits/circuitsPosition";
import {
  renderCircuitSystem, renderParallelCircuitSystem, renderBridgeCircuitSystem, 
  renderCombinationCircuitSystem, renderJunctionCurrents, renderTwoSourceCombinationSystem,
  renderMeterBridge
} from "./physics/circuits/circuitsRender";

import {
  calculateConvexLensPositions,calculateConcaveMirrorPositions,calculateRefractionPositions,
  calculateTIRPositions, calculateConcaveLensPositions, calculateConvexMirrorPositions
} from "./physics/rayOptics/rayOpticsPositions"
import {
  renderConvexLensSystem, renderConcaveMirrorSystem,renderRefractionSystem,
  renderTIRSystem, renderConcaveLensSystem, renderConvexMirrorSystem
} from "./physics/rayOptics/rayOpticsRender"

import {
  calculatePointChargePositions, calculateTwoChargePositions, calculatePlatePositions,
  calculateFieldAtPointPositions,calculateAxisPositionsChargeLayout, calculateBarMagnetPositions,
  calculateCurrentWirePositions, calculateCurrentLoopPositions,calculateSolenoidPositions, 
  calculateMovingChargePositions, calculateWireForcePositions

} from "./physics/emf/emfPositions"
import {
  renderPointChargeField, renderTwoChargeField, renderPlateField,renderFieldAtPoint,
  renderAxisPositionsCharges, renderBarMagnetField, renderCurrentWireField, renderCurrentLoopField,
  renderSolenoidField, renderMovingChargeForce, renderWireForceField
} from "./physics/emf/emfRender"


export default function PhysicsVisual({ visual }) {
  const isMobile = useIsMobile();
  const { width, height } = getSvgDimensions(isMobile);

  if (!visual) return null;

  const figure = visual?.figure || {};
  const elements = visual?.elements || [];
  const relationships = visual?.relationships || []
  const inclineAngle = visual?.incline_angle || 30;
  const launch_height = visual?.launch_height || 20
  const launch_angle = visual?.launch_angle || 45
  const launch_velocity = visual?.launch_velocity || 20
  const amplitude = visual?.amplitude || 3;
  const wavelength  = visual?.wavelength || 8;
  const numCycles = visual?.num_cycles || 2;
  const stringLength = visual?.string_length
  const harmonicNumber = visual?.harmonic_number
  const hasJunctionRelationship = relationships.some((r) => r.type === "current_conservation_at_node");
  const hasNullRelationship = relationships.some((r) => r.type === "is_connected_to_jockey");
 //console.log("hasJunctionRelationship : ", hasJunctionRelationship)
 //console.log("hasJunctionRelationship : ", hasJunctionRelationship)

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
  plane = calculatePulleyPositions({ elements, isMobile });
  content = renderPulleySystem(plane, elements, isMobile);
}

else if (figure.subtype === "incline_pulley_system") {
  plane = calculateInclinePulleyPositions({ elements, inclineAngle, isMobile });
  content = renderInclinePulleySystem(plane, elements, isMobile);
}

else if (figure.subtype === "projectile_motion" ) {
 if (figure.feature === "angled_launch_from_height") {
  plane = calculateAngledLaunchFromHeightPositions({ launch_angle, launch_velocity, launch_height , isMobile });
  content = renderAngledLaunchFromHeight(plane, elements, isMobile);
} else if (figure.feature === "angled_launch") {
  plane = calculateAngledProjectilePositions({ launch_angle, launch_velocity, isMobile });
  content = renderAngledProjectile(plane, elements, isMobile);
} else {
  plane = calculateProjectileMotionPositions({ launch_height,launch_velocity, isMobile });
  content = renderProjectileMotion(plane, elements, isMobile);
}
}


//SOUND WAVE

else if (figure.subtype === "wave_transverse") {
  plane = calculateWavePositions({amplitude, wavelength, numCycles, isMobile,});
  content = renderTransverseWave(plane, elements, isMobile);
}

else if (figure.subtype === "standing_wave") {
  if(figure.feature === "harmonic_on_fixed_string"){
  plane = calculateFixedStringHarmonicPositions({ stringLength, harmonicNumber, isMobile });
  content = renderFixedStringHarmonic(plane, elements, isMobile);
  }
  else if (figure.feature === "nodes_antinodes"){
  plane = calculateStandingWavePositions({ wavelength, numCycles, isMobile });
  content = renderStandingWave(plane, elements, isMobile);
}
}

else if (figure.subtype === "wave_longitudinal") {
  if(figure.feature === "compressions_rarefactions"){
  plane = calculateLongitudinalWavePositions({ wavelength, numCycles, isMobile });
  content = renderLongitudinalWave(plane, elements, isMobile);
  }
  else if (figure.feature === "doppler_effect") {
  const elements = visual?.elements || [];
  plane = calculateDopplerEffectPositions({ elements, isMobile });
  content = renderDopplerEffect(plane, isMobile);
}
}

else if (figure.subtype === "wave_superposition") {
  plane = calculateWaveSuperpositionPositions({
    wave1Amplitude: visual?.wave_1_amplitude,
    wave1Wavelength: visual?.wave_1_wavelength,
    wave1Phase: visual?.wave_1_phase,
    wave2Amplitude: visual?.wave_2_amplitude,
    wave2Wavelength: visual?.wave_2_wavelength,
    wave2Phase: visual?.wave_2_phase,
    numCycles,
    isMobile,
  });
  content = renderWaveSuperposition(plane, elements, isMobile);
}

//CIRCUITS
if (hasJunctionRelationship) {
  plane = calculateJunctionPositions({ elements, relationships, isMobile });
  content = renderJunctionCurrents(plane, isMobile);
}
else if (figure.subtype === "circuit_series") {
  plane = calculateCircuitPositions({ elements, relationships, isMobile });
  content = renderCircuitSystem(plane, elements, relationships, isMobile);
}
else if (figure.subtype === "circuit_parallel") {
  plane = calculateParallelCircuitPositions({ elements, relationships, isMobile });
  content = renderParallelCircuitSystem(plane, elements, relationships, isMobile);
}
else if (figure.subtype === "circuit_bridge") {
  if (hasNullRelationship){
  plane = calculateMeterBridgePositions({ elements, isMobile });
  content = renderMeterBridge(plane, isMobile);
  }
  else{
  plane = calculateBridgeCircuitPositions({ elements, relationships, isMobile });
  content = renderBridgeCircuitSystem(plane, elements, relationships, isMobile);
  }
}

else if (figure.subtype === "circuit_combination") {
  function isTwoSourceCombination(relationships) {
  const seriesRels = relationships.filter((r) => r.type === "connected_by_wire" && r.order === "series" && r.branch);
  return seriesRels.length >= 2;
}
  if (isTwoSourceCombination(relationships)) {
    plane = calculateTwoSourceCombinationPositions({ elements, relationships, isMobile });
    content = renderTwoSourceCombinationSystem(plane, elements, isMobile);
  } else {
    plane = calculateCombinationCircuitPositions({ elements, relationships, isMobile });
    content = renderCombinationCircuitSystem(plane, elements, relationships, isMobile);
  }
}

else if (figure.subtype === "circuit_kirchhoff_junction") {
  plane = calculateJunctionPositions({ elements, relationships, isMobile });
  content = renderJunctionCurrents(plane, isMobile);
}

else if (figure.subtype === "circuit_meter_bridge" ) {
  plane = calculateMeterBridgePositions({ elements, isMobile });
  content = renderMeterBridge(plane, isMobile);
}

//RAY OPTICS

else if (figure.subtype === "ray_diagram_lens" ){
  if( figure.feature === "convex") {
  plane = calculateConvexLensPositions({ elements, relationships, isMobile });
  content = renderConvexLensSystem(plane, elements, isMobile);
  }
  else if( figure.feature === "concave") {
  plane = calculateConcaveLensPositions({ elements, relationships, isMobile });
  content = renderConcaveLensSystem(plane, elements, isMobile);
  }
}
 
else if (figure.subtype === "ray_diagram_mirror" ){
  if( figure.feature === "concave") {
  plane = calculateConcaveMirrorPositions({ elements, relationships, isMobile });
  content = renderConcaveMirrorSystem(plane, elements, isMobile);
  }
  else if( figure.feature === "convex") {
   plane = calculateConvexMirrorPositions({ elements, relationships, isMobile });
   content = renderConvexMirrorSystem(plane, elements, isMobile);
  }
}
// else if (figure.subtype === "ray_diagram_mirror" && figure.feature === "concave") { ... }
else if (figure.subtype === "refraction") {
  plane = calculateRefractionPositions({ elements, relationships, isMobile });
  content = renderRefractionSystem(plane, elements, isMobile);
}
else if (figure.subtype === "total_internal_reflection") {
  plane = calculateTIRPositions({ elements, relationships, isMobile });
  content = renderTIRSystem(plane, elements, isMobile);
}
 

else if (figure.subtype === "electric_field" && figure.feature === "point_charge") {
  const variant = detectPointChargeVariant(elements);
  if (variant === "field_at_point") {
    plane = calculateFieldAtPointPositions({ elements, isMobile });
    content = renderFieldAtPoint(plane, isMobile);
  } else {
    plane = calculatePointChargePositions({ elements, isMobile });
    content = renderPointChargeField(plane, isMobile);
  }
} else if (figure.subtype === "electric_field" && figure.feature === "two_point_charges") {
  const variant = detectTwoChargeVariant(elements);
  if (variant === "axis_positions") {
    plane = calculateAxisPositionsChargeLayout({ elements, isMobile });
    content = renderAxisPositionsCharges(plane, isMobile);
  } else {
    plane = calculateTwoChargePositions({ elements, isMobile });
    content = renderTwoChargeField(plane, isMobile);
  }
} else if (figure.subtype === "electric_field" && figure.feature === "field_lines_between_charges") {
  const variant = detectFieldLinesBetweenVariant(elements);
  if (variant === "plates") {
    plane = calculatePlatePositions({ elements, isMobile });
    content = renderPlateField(plane, isMobile);
  } else {
    plane = calculateTwoChargePositions({ elements, isMobile });
    content = renderTwoChargeField(plane, isMobile);
  }
}

else if (figure.subtype === "magnetic_field"){
    if( figure.feature === "bar_magnet") {
    plane = calculateBarMagnetPositions({ elements, isMobile });
    content = renderBarMagnetField(plane, isMobile);
  }
  else if (figure.feature === "current_carrying_wire") {
    plane = calculateCurrentWirePositions({ elements, isMobile });
    content = renderCurrentWireField(plane, isMobile);
  } else if (figure.feature === "current_carrying_loop") {
    plane = calculateCurrentLoopPositions({ elements, isMobile });
    content = renderCurrentLoopField(plane, isMobile);
  }
  else if (figure.feature === "solenoid") {
  plane = calculateSolenoidPositions({ elements, isMobile });
  content = renderSolenoidField(plane, isMobile);
} else if (figure.feature === "force_on_moving_charge") {
  plane = calculateMovingChargePositions({ elements, isMobile });
  content = renderMovingChargeForce(plane, isMobile);
} else if (figure.feature === "force_on_current_carrying_wire") {
  plane = calculateWireForcePositions({ elements, isMobile });
  content = renderWireForceField(plane, isMobile);
}
}




  if (!content) return null;

  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="flex justify-center w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-xl" role="img" aria-label="Physics diagram">
          
          {renderOpticsDefs()}
          {content}
        </svg>
      </div>
    </div>
  );
}