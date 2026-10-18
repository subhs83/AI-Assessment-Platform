"""Educational question prompts. Public function signatures are unchanged.

EDITING GUIDE (Python comments are not sent to the model):
1 GENERAL_RULES: language-independent question quality and LaTeX rules.
2 SHARED_VISUAL_RULES: rules shared by all figure families.
3A-3E and 5A-5C: rules belonging to ONE family only.
4 VISUAL_TAXONOMY: supported names; coordinate renderer support before adding.
6 VISUAL_EXAMPLES: examples; these do not set the question count.
7 OUTPUT_CONTRACT: response shape/serialization, in one place.
8 BUILDERS: request language, difficulty, Bloom level, count and source.

Static prompts use raw strings: write {single JSON braces}, not doubled braces.
Write JSON LaTeX as two backslashes in source; raw strings preserve them.
All declared families are retained. A declared contract does not implement its renderer.
"""

BLOOMS_PROMPTS = {
    "remember": (
        "Generate questions that primarily test remembering "
        "facts, definitions, terms, and basic recall."
    ),
    "understand": (
        "Generate questions that primarily test understanding, "
        "explanation, interpretation, and comprehension."
    ),
    "apply": (
        "Generate questions that primarily test applying "
        "knowledge to practical situations and problem solving."
    ),
    "analyze": (
        "Generate questions that primarily test analysis, "
        "comparison, classification, reasoning, and relationships."
    ),
    "evaluate": (
        "Generate questions that primarily test evaluation, "
        "judgment, critical thinking, and decision making."
    ),
    "mixed": (
        "Generate a balanced mix of Remember, Understand, "
        "Apply, Analyze, and Evaluate questions."
    ),
}

# 1. GLOBAL: add rules shared by every subject here. Do not repeat them below.
GENERAL_RULES = r'''
# GENERAL QUESTION RULES
- Use the requested language for student-facing text; keep JSON keys, IDs and enum values unchanged.
- Follow the source topic and requested difficulty/Bloom level. Supply enough given information for each question to be solvable.
- Each question has four distinct plausible options and exactly one correct answer, labelled A, B, C or D.
- Give a brief final explanation supporting the correct option; a concise calculation is allowed. Exclude drafts, self-corrections and planning commentary.
- Questions are independent. Vary contexts and values where suitable; reuse a figure structure when the topic requires it.
- Keep field names, internal IDs, relationship names and placement tokens out of student-facing text.
- Verify that the wording, visible givens, construction, answer and explanation agree. Do not rely on students measuring a schematic drawing.
- When figure.subtype is "semicircle", arc_length measures only the curved boundary; perimeter includes the curved boundary and diameter.
- semicircle: include one circle, its centre, and a diameter segment with forms_segment and is_diameter_of. Supply the given measurement
  on the diameter or on an explicitly linked radius segment. Render the upper half by default, with the diameter horizontal.

# MATHEMATICS AND JSON STRINGS
- Use $...$ for mathematical notation; use LaTeX for fractions, powers and subscripts.
- Escape each LaTeX backslash once for JSON. Example JSON string: "$\\frac{1}{2}$".
- Use valid JSON string escapes: line breaks inside strings are written as \n; quotes as \".
'''.strip()


# 2. SHARED VISUAL RULES: only instructions applying across visual families.
SHARED_VISUAL_RULES = r'''
# SHARED VISUAL RULES
- Set visual_required true when solving or interpreting the question requires the diagram. Otherwise use false, visual_type null and omit visual.
- Include figure.type, figure.subtype and a supported feature where applicable. Follow only that family's contract and relevant example.
- Payloads are semantic; do not output SVG, HTML, CSS or pixel layout. Real mathematical coordinates and numeric construction data are allowed where the contract requires them.
- Include the structure and givens needed for the question. Omit solution-only annotations and redundant intermediate measurements.
- Display labels may contain escaped LaTeX. Unknown display quantities omit value and use a symbol; never label the solved answer.
- Coordinates, bounds, vector components and numeric construction fields are JSON numbers. Geometry segment values may also be numeric strings or a number with a short unit; no LaTeX expressions in those values.
- Angles use degrees in numeric fields. Labels may show a given angle or an unknown symbol, never a verdict or correction. Convert radians to degrees for construction fields only.
- Required construction data may encode hidden geometry; do not expose it as a solved label. Include all givens or stated equalities needed to solve without inspecting hidden fields.
'''.strip()


# 3A. GEOMETRY: add planar/coordinate-specific rules here.
GEOMETRY_RULES = r'''
# PLANAR AND COORDINATE GEOMETRY
- Include a segment when named in the question or necessary to construct the figure. Do not add labels for derivable intermediate segments.
- Every radius segment needs forms_segment with its endpoint point IDs as well as is_radius_of. A segment ID alone is not an endpoint specification.
- For questions comparing chords, include both chords, their points, forms_chord relationships, and any referenced perpendicular-distance constructions.
- coordinate_geometry: every point has numeric x and y. figure.bounds contains x_min, x_max, y_min, y_max and encloses all points with margin.
- Reflection/translation include original and image points. Use reflects_over with axis (x-axis, y-axis or a line ID), or translated_by with numeric vector [dx, dy]; elements contains the original point and target is the image point.
'''.strip()


# 3B. SOLIDS: roles, supported shapes and open-face semantics.
SOLID_RULES = r'''
SOLID GEOMETRY RULES:
- Use right circular cylinders/cones, right triangular prisms, and regular square pyramids.
- Include one solid element and dimension elements linked by "dimension_of". Each dimension has a "role", display "label", and numeric "value" only when given. Put units in "unit".
- Supported dimension roles:
  cube: side
  cuboid: length, width, height
  cylinder: radius OR diameter, height
  cone: radius OR diameter, height, slant_height
  sphere/hemisphere: radius OR diameter
  triangular_prism: base_side_a, base_side_b, base_side_c, base_altitude, prism_length
  square_pyramid: base_side, height, slant_height
- For triangular_prism, base_altitude is perpendicular to base_side_a.
  Volume needs base_side_a, base_altitude, and prism_length. Surface area also needs all three base-side lengths.
- Cone slant_height is apex-to-rim; pyramid slant_height is apex-to-midpoint of a base edge, not a lateral edge.
- Give enough data for the requested quantity. Keep dimensions geometrically consistent; omit solution-only dimensions.
- curved_surface_area applies to cylinder, cone, sphere, hemisphere;
  lateral_surface_area applies to cube, cuboid, prism, pyramid. Total area includes all boundary surfaces, including a hemisphere's  circular base.
- Closed solids are the default. Only cylinder/cuboid support open containers in this phase: figure.open_faces may contain "top", "bottom", or both. State omitted faces explicitly in question_text. For cuboids, these are the length × width faces.
- Renderer controls projection, hidden edges, and label placement.
'''.strip()


# 3C. TABLES / CHARTS: add data-display rules here.
DATA_RULES = r'''
# DATA TABLES
Write numeric ranges as "45 - 50". Use inequalities such as "$150 \\le h < 155$" only to clarify shared class boundaries. Never write "150 - <155".
'''.strip()


# 3D. PHYSICS: retain renderer-specific conventions in this section.
PHYSICS_RULES = r'''
# PHYSICS
- Include forces/components relevant to the stated question or required to depict its setup; omit annotations used only in the solution.
- Vector angles are counterclockwise from right: right 0, up 90, left 180, down 270; normalize to [0, 360).
- inclined_plane slopes downward to the right. At incline_angle theta: normal = 90-theta, downslope = 360-theta, upslope = 180-theta, gravity = 270. Friction opposes motion or impending motion. These directions apply only to forces along that slope.
- Include an angle element when the incline angle is given; if unknown, use a symbolic angle label without value while retaining incline_angle for construction.
- pulley_system has two hanging masses (side left/right). incline_pulley_system has side on_incline/hanging and incline_angle; follow its own example's orientation.
- projectile_motion: include peak_point only when the question asks about the apex or maximum height.
- Wave amplitude and wavelength construction fields must match the stated scenario. For node/antinode identification, do not highlight or name the queried answer position; any teaching labels must avoid answer-option positions.
- ray_diagram_lens/ray_diagram_mirror: forms_image_of.show_image is false whenever the completed image would reveal the requested property; otherwise true. A calculation question is not automatically exempt.
- Set object_arrow.show_distance_label false when its distance is the unknown.
- For human_eye defect identification, do not name the defect or state the focus location in question_text; let the diagram supply that evidence.
'''.strip()


# 3E. CHEMISTRY: keep atom-position roles scoped to their subtype.
CHEMISTRY_RULES = r'''
# CHEMISTRY POSITION ROLES
- lewis_structure/molecular_2d: linear atoms use x_position left/center/right.
- A central atom with three substituents uses side top_left/top_right/bottom_center; the inverted arrangement uses x_position top for the upper atom and side bottom_left/bottom_right below.
- Four substituents use side top_left/top_right/bottom_left/bottom_right. Do not invent numeric positions or new role names.
- molecular_geometry uses position_role as shown in its dedicated examples, not the Lewis/molecular_2d position fields.
'''.strip()


# 4. TAXONOMY: add supported type/subtype/feature names here, not global rules.
VISUAL_TAXONOMY = r'''
1. MATHEMATICS & COORDINATE GEOMETRY TAXONOMY
- "type": "triangle"            -> "subtype": "equilateral" | "isosceles" | "scalene" | "right" | "general"
                                   "feature": "none" | "parallel_segment" | "altitude" | "median" | "angle_bisector" | "incircle" | "excircle" | "exterior_angle" | "circumcenter" | "cevian_concurrency" | "transversal"
- "type": "trapezoid"           -> "subtype": "isosceles" | "scalene" | "right"
                                   "feature": "none" | "median" | "diagonals" | "diagonal_proportionality" | "incircle"
- "type": "parallelogram"       -> "subtype": "general" | "rectangle" | "rhombus" | "square"
                                   "feature": "none" | "diagonals" | "altitude" | "inscribed_circle"
- "type": "quadrilateral"       -> "subtype": "general" | "kite" | "cyclic" | "dart"
                                   "feature": "none" | "diagonals" | "diagonal_area_split" | "axis_of_symmetry" | "inscribed_in_circle" | "exterior_angle"
- "type": "polygon"             -> "subtype": "regular_n_gon" | "irregular_n_gon" | "star_polygon"
                                   "feature": "none" | "diagonals" | "inscribed_circle" | "circumscribed_circle"
- "type": "circle"              -> "subtype": "standard" | "concentric" | "intersecting"
                                   "feature": "none" | "sector" | "segment" | "inscribed_polygon" | "central_inscribed_angle" | "chord_properties" |
                                              "tangent_properties" | "tangent_chord_angle" | "intersecting_chords" | "secant_secant" | "tangent_secant"
- "type": "circle"              ->"subtype": "semicircle"
                                  "feature": "area" | "arc_length" | "perimeter"
- "type": "coordinate_geometry" -> "subtype": "cartesian_plane" | "distance_formula_segment" | "midpoint_segment" | "slope_line" |
                                              "transformation_reflection" | "transformation_translation" | "unit_circle"
                                  "feature": "none" | "grid_lines" | "vector_arrow" | "angle_indicator" | "angle_position"
- "type": "solid_geometry"      -> "subtype": "cube" | "cuboid" | "cylinder" | "cone" | "sphere" | "hemisphere" | "triangular_prism" | "square_pyramid"
                                    "feature": "volume" | "total_surface_area" | "lateral_surface_area" | "curved_surface_area"   
- "type": "symmetry"            -> "subtype": "line_symmetry"
                                   "feature": "count_lines" | "identify_line" | "check_line"    
- "type": "symmetry"            -> "subtype": "reflection"
                                    "feature": "identify_image" | "find_reflected_point" | "distance_from_mirror"  
- "type": "symmetry"            -> "subtype": "rotational_symmetry"
                                    "feature": "count_order" | "smallest_angle" | "check_rotation"        
- "type": "mapping_diagram"     -> "subtype": "two_sets"
                                    "feature": "identify_function" | "find_domain" | "find_range" | "find_codomain" |
                                                "classify_function" | "identify_ordered_pairs"                                         
For "type": "graph",            -> "subtype": "function_graph":
                                    "feature": "identify_function" | "read_value" | "amplitude" |
                                              "period" | "phase_shift" | "vertical_shift" |
                                              "domain" | "range"
COMPOSITE PERIMETER AND AREA
- "type": "composite_geometry"  -> "subtype": "joined_rectangles" | "rectangular_cutouts" | "partitioned_rectangle" | "unit_square_region" |
                                                "crossing_paths" | "boundary_path" |  "rectangle_semicircle"
                                    "feature": "area" | "perimeter" | "remaining_area" | "missing_length" | "missing_area"
                                                
 2. SET THEORY & DATA TAXONOMY
- "type": "venn_diagram"    -> "subtype": "2_set" | "3_set" | "disjoint" | "subset"
- "type": "graph"           -> "subtype": "line_graph" | "bar_graph" | "coordinate_graph" | "function_graph" | "number_line"
- "type": "graph",          -> "subtype": "function_graph":
                               "feature": "identify_function" | "read_value" | "amplitude" |
                                "period" | "phase_shift" | "vertical_shift"
- "type": "chart"           -> "subtype": "pie" | "donut"
- "type": "table"           -> "subtype": "data_matrix" | "frequency_table"

 3. PHYSICS TAXONOMY
- "type": "physics"
  -> "subtype": "free_body_diagram" | "inclined_plane" | "pulley_system" | "incline_pulley_system" | "projectile_motion"
     "feature": "none" | "multiple_forces" | "friction" | "tension" | "net_force" | "horizontal_launch" | "angled_launch" | "angled_launch_from_height"

  -> "subtype": "circuit_series" | "circuit_parallel"
      "feature": "none" | "resistors" | "battery_and_switch" | "ammeter_voltmeter"
                | "bulb" | "power_dissipation" | "voltage_divider"
                | "short_circuit" | "open_circuit_fault"
                | "charging" | "discharging" 
                | "energizing" | "de_energizing"

  -> "subtype": "circuit_bridge"
     "feature": "none" | "resistors" | "battery_and_switch" | "ammeter_voltmeter" | "open_circuit_fault"

  -> "subtype": "circuit_combination"
     "feature": "none" | "resistors" | "battery_and_switch" | "ammeter_voltmeter" | "charging" | "discharging" | "energizing" | "de_energizing"

  -> "subtype": "circuit_meter_bridge"
     "feature": "none" | "null_point" 
  --------------------------------------------------
  PHYSICS TAXONOMY ADDITION: KIRCHHOFF'S JUNCTION RULE
  --------------------------------------------------
  -> "subtype": "circuit_kirchhoff_junction"
    "feature": "none" | "current_conservation"

  --------------------------------------------------
  4. ELECTRIC & MAGNETIC FIELDS
  --------------------------------------------------
-> "subtype": "electric_field"
   "feature": "point_charge" | "two_point_charges" | "field_lines_between_charges"

-> "subtype": "magnetic_field"
   "feature": "bar_magnet" | "current_carrying_wire" | "current_carrying_loop" | "solenoid" | "force_on_moving_charge" | "force_on_current_carrying_wire"

  --------------------------------------------------
  5. LIGHT, LENS & MIRROR
  --------------------------------------------------
  -> "subtype": "ray_diagram_lens" | "ray_diagram_mirror" | "refraction" | "total_internal_reflection"
     "feature": "none" | "convex" | "concave" | "plane" | "image_formation"

  -> "subtype": "reflection" | "ray_diagram_mirror" | "prism" | "human_eye" | "optical_instrument"
     "feature": "plane"                                   (reflection, ray_diagram_mirror)
              | "deviation" | "dispersion"                (prism)
              | "structure" | "myopia" | "hypermetropia"  (human_eye)
              | "simple_microscope" | "compound_microscope" | "astronomical_telescope"  (optical_instrument)
  --------------------------------------------------
  6. SOUND & WAVE
  --------------------------------------------------
  -> "subtype": "wave_transverse" | "wave_longitudinal" | "standing_wave" | "wave_superposition"
     "feature": "none" | "amplitude_wavelength" | "nodes_antinodes" | "doppler_effect" | "harmonic_on_fixed_string" | "compressions_rarefactions" | "constructive_interference"


7. CHEMISTRY TAXONOMY
- "type": "chemistry"
  -> "subtype": "lewis_structure" | "molecular_2d"
     "feature": "none" | "single_double_triple_bonds" | "lone_pairs" | "resonance_structures" | "formal_charge"

  -> "subtype": "molecular_geometry"
     "feature": "none" | "vsepr_shape" | "bond_angle" | "polarity"

  -> "subtype": "skeletal_formula"
     "feature": "none" | "functional_groups" | "isomers" | "ring_structures"

  -> "subtype": "atomic_structure"
     "feature": "none" | "bohr_model"

  -> "subtype": "reaction_diagram"
     "feature": "none" | "energy_profile" | "activation_energy" | "exothermic_endothermic"

  -> "subtype": "titration_setup"
     "feature": "none" | "titration_curve" | "equivalence_point" | "indicator_color_change"

  -> "subtype": "galvanic_cell"
     "feature": "none" | "electron_flow" | "salt_bridge" | "half_reactions"

  -> "subtype": "ph_scale"
     "feature": "none" | "acid_base_strength" | "buffer_region"
'''.strip()


# 5A. FRACTIONS: dedicated contract; no elements/relationships.
FRACTION_RULES = r'''
FRACTION MODELS — EQUAL-AREA SHADING

- "type": "fraction_model"
- "subtype": "rectangle" | "square" | "bar" | "circle" |
             "oval" | "triangle" | "regular_polygon" |
             "heart" | "star"
- "feature": "shaded_parts"

SUPPORTED PARTITION PATTERNS:

- rectangle / square: "grid"
  Required: "rows", "columns".
  Each must be an integer from 1 to 6.
  Total parts = rows * columns, between 2 and 24.

- bar: "equal_strips"
  Required: "parts", an integer from 2 to 12.

- circle / oval: "equal_sectors"
  Required: "parts", an integer from 2 to 12.
  Oval sectors must be an affine transformation of equal circle sectors, preserving equal area.

- triangle: "equal_base_triangles"
  Required: "parts", an integer from 2 to 12.
  Divide one base into equal-length intervals and connect each division to the opposite vertex. All parts have equal area.

- regular_polygon: "center_triangles"
  Required: figure.sides, an integer from 5 to 8.
  Partition.parts must equal figure.sides.
  Connect the centre to every vertex to create equal-area triangles.

- heart / star: "mirror_halves"
  Required: "parts": 2 and "axis": "vertical".
  Use a vertically symmetric shape divided into two equal-area halves.
  For star, figure.star_points must be 5.
  Do not generate other heart/star partitions in this phase.

  FRACTION MODEL RULES:

1. Use a fraction model only when the question requires the student
   to inspect the shading or partition.

2. Every partition must have equal area. Equal widths or equal angles
   alone do not guarantee equal area for arbitrary shapes.

3. Use only the supported subtype/pattern combinations above.
   Do not invent shapes, patterns, coordinates, or partition methods.

4. Return a top-level "partition" object inside "visual".
   Return "shaded_parts" as an array of unique zero-based integers.

5. Every shaded index must be between 0 and total_parts - 1.
   For grids, total_parts = rows * columns.
   For other supported patterns, total_parts = partition.parts.

6. Index parts using these conventions:
   - grid: row-major, starting at the top-left.
   - equal_strips: left to right.
   - equal_sectors: clockwise, starting from the upward radius.
   - equal_base_triangles: left to right along the horizontal base,
     with the opposite vertex above the base.
   - center_triangles: clockwise; part 0 is between the top vertex
     and the next clockwise vertex.
   - mirror_halves: 0 = left half, 1 = right half.

7. Use 1 to total_parts - 1 shaded parts for ordinary proper-fraction
   questions. Use zero or all shaded parts only when the source
   explicitly covers zero or one whole.

8. The mathematical fraction shown is:
   number_of_shaded_parts / total_parts.
   If asking for simplest form, ensure only one answer option matches.
   Never include multiple equivalent fractions as separate options
   unless the question explicitly distinguishes their form.

9. Do not put the fraction answer, percentage, shaded-part count,
   or a solved expression in a visual label.
   Shading and partition boundaries provide the information students
   are intended to count.


10. Fraction models use their dedicated payload below.
    They do not require "elements" or "relationships".
    Do not add empty arrays for those fields.
'''.strip()


# 5B. COMPOSITES ONLY: add rectangle joins, overlaps, cutouts and paths here.
COMPOSITE_RULES = r'''
- rectangle_semicircle supports only "area" and "perimeter".
The following fields, relationships, and rules apply ONLY when
figure.type is "composite_geometry".
All other figure types retain their existing payload contracts.

ELEMENTS:
- rectangle: id, type, label, length, width.
  length is horizontal extent; width is vertical extent.
  Both are positive numeric dimensions of the complete rectangle.
- dimension: id, type, role, label, optional numeric value, unit.
  role: "length" | "width" | "area" | "path_width".
  "path_width" is used only for boundary_path.
  Every dimension must be linked using dimension_of.
  Given dimensions include value; unknown dimensions omit value
  and use symbolic labels.
- unit_cell: id, type, row, column.
  row/column are nonnegative integer grid indices, not pixel positions.

RELATIONSHIPS:
- joins_edge: elements [rectangle_to_place], target rectangle,
  side "top" | "bottom" | "left" | "right",
  alignment "start" | "center" | "end",
  optional offset (default 0), optional overlap_depth (default 0).
  Top/bottom alignment is left-to-right; left/right is top-to-bottom.
  Offset is additional to alignment, positive rightward/downward in the common unit; omit it for a centred or edge-aligned placement.
  With overlap_depth 0, rectangles touch edge-to-edge.
  Positive overlap_depth moves the placed rectangle into the target,
  perpendicular to the selected side, in the common unit.
  It must not exceed either rectangle's extent in that direction.
- inside: elements [inner_rectangle], target outer_rectangle,
  placement "center" | "top_left" | "top_center" | "top_right" |
  "bottom_left" | "bottom_center" | "bottom_right" |
  "left_center" | "right_center".
- subtracts_from: elements [cutout_rectangle], target outer_rectangle.
- partitions: elements [all_partition_rectangles], target outer_rectangle.
- dimension_of: elements [dimension_ids], target rectangle.
  Each dimension ID links to exactly one rectangle; repeated measurements use separate IDs.
- crosses_inside: elements [horizontal_path, vertical_path],
  target park_rectangle, placement "center".
- surrounds: elements [derived_rectangle], target park_rectangle,
  placement "inside" | "outside", positive numeric path_width.
  For inside, derived_rectangle is the remaining lawn boundary;
  for outside, it is the outer boundary including the path.
  Its length/width may be omitted and are derived from the park
  dimensions by subtracting/adding twice path_width.
  Link the path_width dimension to derived_rectangle.

RULES:
- Infer construction from the teacher's ordinary-language request. Teachers need not supply technical fields or relationship names.
- Use one common length unit and consistent construction dimensions.
- Distinguish a complete piece's dimensions from the overall shape's dimensions and from the exposed portion of an overlapping piece.
  Link each measurement to a rectangle having that exact measured extent.
- Renderer constructs the layout from rectangle dimensions and relationships. Display only dimensions linked by dimension_of;
  never automatically print construction values or solved answers.

- joined_rectangles: use one anchor rectangle; every other rectangle
  joins an already placed rectangle. Shared edge length must be positive.
  Use overlap_depth only for intended overlaps; omitted means no overlap.
  Every positive-area overlap must be explicitly described by its join.
  Covers L/T/U/C, stepped, and offset shapes without letter-specific subtypes.
- rectangular_cutouts: position each cutout with inside and remove it
  with subtracts_from. Cutouts must fit and must not overlap.
  Corner/side placements touch the selected outer boundaries;
  center placement leaves an interior opening (a frame, not a C-shape).
- partitioned_rectangle: first rectangle is the outer boundary.
  Remaining rectangles tile it without gaps or overlaps.
  Use inside to anchor one partition, zero-overlap joins_edge for others,
  and partitions to identify the complete subdivision.
- unit_square_region: cells must be unique and edge-connected.
  figure.cell_size is positive; figure.unit gives the length unit.
- crossing_paths: one horizontal strip spans the park's length;
  one vertical strip spans its width. Both are centred inside the park.
  Count their intersection only once.
- boundary_path: one uniform rectangular path inside or outside the park.
  For an inside path, twice path_width must be less than both park sides.

- Joined-region area is the area of the union: count every occupied
  region once. Sum rectangle areas only when interiors do not overlap.
- Perimeter follows the exposed boundary; exclude internal joins and
  edges hidden within overlaps. For non-overlapping edge joins,
  subtract twice every shared-edge length from summed perimeters.
- Cutout perimeter includes hole boundaries unless the question asks
  only for the outer boundary.
- Partition lines do not contribute to outer perimeter.
- Path questions must identify whether the requested measurement
  belongs to the path, park, remaining lawn, or outer boundary.
- Construction values may be supplied for layout even when unknown
  to students. Unknown display dimensions omit value.

- Never expose internal IDs, field names, relationship names, or
  placement tokens in question text, options, or explanations.
- The visible outline must match the named shape. If equal arms are needed, label both or explicitly state their equality in question_text.

RECTANGLE–SEMICIRCLE:
- rectangle: existing length/width contract.
- semicircle: id, type, label. Its diameter is derived from its attachment.
- attaches_to: elements [semicircle_id], target rectangle_id,
  side "top" | "bottom" | "left" | "right",
  placement "outside" | "inside".
- Diameter spans the full selected side: top/bottom use rectangle.length;
  left/right use rectangle.width. Outside adds area; inside removes area.
- Allow one outside semicircle, two outside semicircles on opposite sides,
  or one inside semicircle. An inside semicircle's radius must be less
  than the rectangle's depth perpendicular to the selected side.
- dimension_of may target a semicircle with role "radius" or "diameter".
  Numeric values must match the derived geometry.
- Display only explicitly supplied dimension labels.
- Perimeter excludes each attachment diameter and includes its curved arc.
  Question text must distinguish perimeter from curved-boundary length.
'''.strip()


# 5C. PARALLEL LINES ONLY: never put composite rectangle rules here.
PARALLEL_LINES_RULES = r'''
# PARALLEL LINES AND TRANSVERSALS

- type: "parallel_lines"
- subtype: "single_transversal" | "double_transversal"
- feature: "find_angle"
- orientation_deg: optional number from 0 to 179, default 0.

  Rotate the complete construction counterclockwise:
  0 = horizontal parallel lines, 90 = vertical, others = slanted.
  Vary orientation across questions; display labels remain upright.

Payload:
- parallel_lines: 2–3 objects with unique id and label.
- transversals: 1 for single_transversal, 2 for double_transversal.
  Each has unique id, label, direction ("rising_right" |
  "falling_right"), and numeric inclination_deg from 30 to 75.
- angle_marks: each has unique id, parallel_line_id, transversal_id,
  position ("upper_left" | "upper_right" | "lower_left" |
  "lower_right"), label, and boolean is_unknown.
  Known angles include numeric value in degrees; unknowns omit value.

Rules:
- Build in a horizontal reference frame, then rotate by orientation_deg. parallel_lines order is top to bottom; transversals order is left
  to right. Angle positions refer to this frame BEFORE rotation.
- inclination_deg is the acute angle to the reference parallel lines.
- rising_right: upper_right/lower_left = inclination_deg; upper_left/lower_right = 180 - inclination_deg.
- falling_right: upper_left/lower_right = inclination_deg; upper_right/lower_left = 180 - inclination_deg.
- Two transversals must share direction and inclination. question_text must explicitly state both transversals are parallel.
- question_text must state the main lines are parallel and clearly identify the given and queried angles.
- Include at least one known angle and exactly one unknown.
- Use declared IDs; do not duplicate angle positions at an intersection.
- Do not label solved answers or automatically display inclination_deg.
- No coordinates, elements, or relationships; renderer controls layout.
'''.strip()

# 5D. SYMMETRY: shared contracts and subtype-specific rules.
SYMMETRY_RULES = r"""
SYMMETRY — SHARED ELEMENT CONTRACTS

These rules apply only when figure.type is "symmetry".
All other figure types retain their existing contracts.

ELEMENTS:
- point: id, type, optional label, numeric x, y.
- polygon: id, type, optional label.
- circle: id, type, optional label, positive radius.
- ellipse: id, type, optional label, positive radius_x, radius_y.
- line: id, type, label.

RELATIONSHIPS:
- forms_polygon: elements [ordered boundary point IDs], target polygon.
  Vertices follow the boundary without self-intersections.
- is_center_of: elements [point ID], target circle or ellipse.
- forms_line: elements [two distinct point IDs], target line.

SHARED RULES:
- Coordinates are construction units, with x increasing rightward and
  y upward; never SVG pixels. Preserve proportions using one uniform scale.
- Construction points are not drawn or labelled unless label is nonempty.

LINE SYMMETRY:
The following rules apply only when figure.subtype is "line_symmetry".

Additional relationship:
- candidate_axis: elements [line IDs], target shape.
  These are proposed lines, not assertions that they are symmetry axes.

RULES:
- Use one target shape per visual.
- candidate_axis: elements [line IDs], target shape.
  These are proposed lines, not assertions that they are symmetry axes.
- Polygon coordinates must produce exactly the symmetry stated in
  the answer. Do not assume symmetry from a shape's name.
- Circles and ellipses use is_center_of; ellipse axes align with x/y.
- count_lines: show the shape without candidate lines.
- identify_line: show labelled candidate lines; exactly one must be
  a symmetry axis. Options refer to their visible labels.
- check_line: show one labelled candidate line. Use four distinct
  text options with exactly one correct assessment/reason.
- Judge symmetry of the shape's outline. Point labels and candidate
  lines are annotations and do not count as part of the shape.
- Construction points are not drawn or labelled unless label is nonempty.
- Do not display all correct axes or completed reflections as hints.
- A circle has infinitely many symmetry lines. A noncircular ellipse has two.

REFLECTION:
Applies only when figure.subtype is "reflection".
Reuse point, polygon, line, forms_polygon, and forms_line.

Additional relationships:
- mirror_axis: elements [line ID], target original point or polygon.
- candidate_image: elements [four candidate polygon IDs], target original polygon.

Rules:
- Use exactly one mirror line, linked to the original by mirror_axis.
  Reflection preserves size and shape. Corresponding points have equal
  perpendicular distances on opposite sides; points on the mirror stay fixed.

- identify_image:
  Use show_grid: false and omit figure.bounds.
  Place one original polygon strictly on one side of the mirror.
  For mirror endpoints A,B, let d=B-A. For each vertex P, calculate
  H=A+d*((P-A)·d)/(d·d), then its reflection P'=2H-P.
  Use the calculated polygon as one candidate. Construct three incorrect
  candidates with visibly different orientations or outlines, all strictly
  on the opposite side without touching the mirror.
  Every pair of candidates must remain different after translation is
  removed. Different labels, IDs, or vertex ordering do not create uniqueness.
  Link all four candidates using candidate_image. Options must reference
  their visible labels. Verify exactly one is the true reflection and
  correct_answer identifies it. Do not highlight the correct candidate.

- find_reflected_point:
  Show the original point on a labelled Cartesian grid with show_grid: true.
  State the mirror line unambiguously in question_text.
  Do not include the answer point. If bounds are supplied, they must contain
  the original and the reflected location, without drawing the reflected point.

- distance_from_mirror:
  State the given perpendicular distance and unit in question_text.
  Distinguish distance from the mirror from distance between point and image.

- Without a grid, construction coordinates are not displayed measurements.
  Never require students to measure the schematic.
- Use text options. Do not show solved images or construction guides unless
  explicitly part of the question.

 ROTATIONAL SYMMETRY:
  These rules apply only when figure.subtype is "rotational_symmetry".
  Reuse the shared point, polygon, circle, ellipse, forms_polygon,
  and is_center_of contracts.

Additional relationship:
- rotation_center: elements [point_id], target shape_id.
  This point defines the centre about which rotation is tested.

Rules:
- Show one target shape and exactly one rotation_center relationship.
  The centre point must have a visible label, such as O.
- Vary suitable shapes across questions: triangles, quadrilaterals,
  regular or irregular polygons, simple concave polygons and ellipses.
  Their actual geometry must support the stated answer.
- Judge only the shape's outline; ignore labels and centre markers.
- count_order: ask how many times the shape coincides with itself
  during one full turn. Include the final 360-degree position once.
- smallest_angle: ask for the smallest positive rotation that maps
  the shape onto itself. For finite order n, this is 360/n degrees;
  order 1 gives 360 degrees.
- check_rotation: put the given angle in figure.rotation_deg as a
  number strictly between 0 and 360, and state it in question_text.
  Use four distinct assessment/reason options, exactly one correct.
- Do not display rotated copies, symmetry guides, the solved order,
  or the solved angle.
- A circle about its centre has infinite rotational order and no
  smallest positive rotation angle; exclude it from smallest_angle.
- Construction coordinates are not visible measurements. Do not
  require students to measure the schematic.
""".strip()

#5f Relations and Functions: mappings between two finite sets.
MAPPING_RULES = r"""
MAPPING DIAGRAMS
These rules apply only when figure.type is "mapping_diagram".

ELEMENTS:
- set: id, type, label.
- member: id, type, label.
  Labels are the student-visible values; LaTeX is allowed.

RELATIONSHIPS:
- belongs_to: elements [member_ids], target set_id.
- maps_to: elements [source_member_id], target destination_member_id.

RULES:
- Use exactly two nonempty sets. figure.source_set and
  figure.target_set reference their IDs; display source on the left.
- Each member belongs to exactly one set. Member labels within each
  set must be distinct; equal values may appear in both sets.
- Every arrow runs from a source member to a target member.
  Do not repeat the same ordered pair. Include at least one arrow.
- Vary set sizes, values and arrow arrangements where appropriate.
  Use 2–6 members per set to keep diagrams readable on mobile.
- A function assigns exactly one target to every source member.
  For identify_function, examples may be functions or non-functions:
  a source with no arrow or multiple distinct targets makes it
  a non-function. Shared targets alone do not.
- find_domain: ask for the domain of the displayed relation:
  source members with outgoing arrows. Do not confuse it with the
  entire source set when some members have no outgoing arrow.
- find_codomain: the entire declared target set.
- find_range: only target members receiving arrows.
- classify_function: use a valid function. One-one means distinct
  source members have distinct images; onto means every target
  member receives an arrow. Many-one means some source members
  share an image; into means not onto.
- Classification options must be mutually exclusive, for example:
  one-one into, one-one onto, many-one into, many-one onto.
- identify_ordered_pairs: options describe the displayed arrows as
  ordered pairs, with source value first.
- Make the question depend on reading the diagram. Do not repeat
  the complete mapping in question_text or label the classification,
  range, or other requested answer on the figure.
- Use four distinct text options with exactly one correct answer.
  Do not treat reordered versions of the same set as different options.
- The renderer chooses positions and arrow paths; do not supply
  coordinates, SVG, or layout instructions.
""".strip()

# Trigonometry: unit-circle diagrams on Cartesian axes.
TRIGONOMETRY_RULES = r"""
UNIT CIRCLE
These rules apply only when figure.type is "coordinate_geometry"
and figure.subtype is "unit_circle".
Use feature "angle_position".

ELEMENTS:
- point: id, type, optional label, numeric x, y.
- circle: id, type, optional label, radius: 1.
- segment: id, type, optional label.
- angle: id, type, optional label, optional numeric value.

RELATIONSHIPS:
- is_center_of: elements [centre_point_id], target circle_id.
- forms_segment: elements [centre_point_id, terminal_point_id],
  target segment_id.
- is_radius_of: elements [segment_id], target circle_id.
- marks_rotation: elements [angle_id], target segment_id.

RULES:
- Include one circle centred at O=(0,0), one terminal point P,
  and the radius OP. Use labelled Cartesian axes with equal scales.
- figure.angle_deg is the signed construction angle measured from
  the positive x-axis: positive anticlockwise, negative clockwise.
  For this phase use -360 < angle_deg < 360; omit angle_deg = 0.
- P has coordinates (cos(theta), sin(theta)). Supply numeric
  coordinates accurate to at least six decimal places when needed.
- Include exactly one angle linked by marks_rotation.
  If the angle is given, supply its value in degrees and a display
  label in the units used by the question. If unknown, omit value
  and use a symbolic label such as theta.
- figure.angle_deg controls construction only; never automatically
  display it or convert it into a solved label.
- Point labels identify points, not their hidden coordinates.
  Show coordinates in question_text only when they are given.
- Make the question depend on interpreting the terminal side,
  quadrant, axis position, or unit-circle coordinates.
- Exact numerical answers require enough stated givens; do not
  ask students to measure or estimate an unlabelled angle.
- Do not add coordinate projections or labels that reveal a
  requested sine, cosine, quadrant or angle.
- Vary quadrants and rotation direction where appropriate.
  Use four mathematically distinct options.

  TRIGONOMETRIC FUNCTION GRAPHS
These rules apply when figure.type is "graph",
figure.subtype is "function_graph", and function_curve elements
use "sin", "cos" or "tan".
Existing number_line, bar_graph and line_graph contracts are unchanged.

FIGURE:
- bounds: numeric x_min, x_max, y_min, y_max.
  Require x_min < x_max and y_min < y_max; include zero on both axes.
- angle_unit: "radians".
- x_tick_pi: positive number; x-axis tick spacing is this value times pi.
- y_tick_step: positive numeric y-axis tick spacing.
- show_grid: boolean, default false.

ELEMENTS:
- axis: id, type, orientation "horizontal" | "vertical", label.
- function_curve: id, type, optional label,
  function "sin" | "cos" | "tan",
  numeric a, b, h, k.
  The curve is y = a * function(b * (x - h)) + k.
  Require a != 0 and b > 0. All x-values and h are in radians.

RELATIONSHIPS:
- plotted_on: elements [function_curve_ids], target axis_id.
  Link every curve once to the horizontal axis and once to the vertical axis.

RULES:
- Include exactly two axes and one or two curves.
  Use axis labels x and y; indicate radians on the horizontal axis.
- Use numeric construction parameters, never expression strings,
  JavaScript, SVG paths or sampled point arrays.
- Renderer samples each function and separates tangent branches at
  x = h + (pi/2 + n*pi)/b. Never connect across an asymptote.
- Sine/cosine amplitude is abs(a), period is 2*pi/b, and midline is y=k.
  Tangent has period pi/b and no amplitude; do not use feature
  "amplitude" with tangent.
- Bounds must show the information needed to answer:
  include complete extrema for amplitude and at least one full
  period for period questions. Keep the plotted interval compact.
- Tick spacing must expose the required values without crowding.
  Use radians and suitable pi fractions on the x-axis.
- The graph must carry information needed to answer. Do not repeat
  its full equation or the requested parameter in question_text.
- Curve labels are empty for a single curve or neutral names such
  as f and g when comparing curves. Do not reveal equations or answers.
- read_value: choose an x-value with a finite, clearly readable
  result; never ask for a finite tangent value at an asymptote.
- phase_shift: state the reference function and constrain the shift
  to a specified interval of one period so the answer is unique.
- identify_function: options must represent distinct functions,
  not equivalent forms of the same function.
- Use four distinct options and a concise explanation consistent
  with the actual plotted function.

  INVERSE TRIGONOMETRIC FUNCTION GRAPHS
These rules apply when figure.type is "graph",
figure.subtype is "function_graph", and function_curve elements
use "asin", "acos" or "atan".

Reuse the axis, function_curve and plotted_on contracts.
Use one curve per visual in this phase.
Supported features: identify_function, read_value, domain, range.

FIGURE:
- angle_unit: "radians"; inverse-function output is in radians.
- bounds: numeric x_min, x_max, y_min, y_max, with positive
  ranges and zero included on both axes.
- x_tick_step: positive numeric x-axis spacing.
- y_tick_pi: positive number; y-axis spacing is this value times pi.
- Omit x_tick_pi and y_tick_step for inverse graphs.
- show_grid: boolean, default false.

CURVE:
- function: "asin" | "acos" | "atan".
- Keep a: 1, b: 1, h: 0, k: 0 for standard principal branches.
- label: ""; never display the equation when it reveals the answer.

RULES:
- asin: domain [-1,1], range [-pi/2,pi/2], increasing.
- acos: domain [-1,1], range [0,pi], decreasing.
- atan: domain all real numbers, range (-pi/2,pi/2), increasing.
- asin/acos: show the complete curve, including closed endpoints.
  Bounds must extend beyond x=-1 and x=1 and leave vertical margin.
  Never extend these curves outside their mathematical domains.
- atan: show both horizontal asymptotes y=±pi/2, with vertical
  margin beyond them. The curve never touches these asymptotes.
  Show continuation arrows at the visible curve ends; plot-window
  boundaries are not domain endpoints.
- Axis labels are x and y (radians).
- Domain/range questions must distinguish included endpoints
  from limiting values that are never attained.
- read_value: use a clearly readable standard point and suitable
  tick spacing; do not require estimating an exact irrational value.
- The graph must supply information needed for the question.
  Do not state its equation or requested domain/range in question_text.
- Inverse functions are not reciprocals: asin means arcsin,
  not cosecant. Use unambiguous mathematical notation in options.
- Use four mathematically distinct options with one correct answer.
""".strip()

# 6. EXAMPLES: add valid JSON payload patterns here. Raw strings use SINGLE braces and JSON-escaped LaTeX.
VISUAL_EXAMPLES = r'''
# VISUAL PAYLOAD EXAMPLES
These are reusable payload patterns, not extra questions to generate. Select only relevant patterns and adapt their givens. Visibility flags must follow the question's intent.

--- fraction_model / square / shaded_parts ---
"visual": {
  "figure": {"type": "fraction_model", "subtype": "square", "feature": "shaded_parts"},
  "partition": {"pattern": "grid", "rows": 2, "columns": 2},
  "shaded_parts": [ 0, 2, 3 ]
}

--- fraction_model / rectangle / shaded_parts ---
"visual": {
  "figure": {"type": "fraction_model", "subtype": "rectangle", "feature": "shaded_parts"},
  "partition": {"pattern": "grid", "rows": 2, "columns": 3},
  "shaded_parts": [ 0, 1, 3, 4 ]
}

--- fraction_model / bar / shaded_parts ---
"visual": {
  "figure": {"type": "fraction_model", "subtype": "bar", "feature": "shaded_parts"},
  "partition": {"pattern": "equal_strips", "parts": 5},
  "shaded_parts": [ 0, 1 ]
}

--- fraction_model / circle / shaded_parts ---
"visual": {
  "figure": {"type": "fraction_model", "subtype": "circle", "feature": "shaded_parts"},
  "partition": {"pattern": "equal_sectors", "parts": 8},
  "shaded_parts": [ 0, 1, 2 ]
}

--- fraction_model / oval / shaded_parts ---
"visual": {
  "figure": {"type": "fraction_model", "subtype": "oval", "feature": "shaded_parts"},
  "partition": {"pattern": "equal_sectors", "parts": 4},
  "shaded_parts": [ 1, 2 ]
}

--- fraction_model / triangle / shaded_parts ---
"visual": {
  "figure": {"type": "fraction_model", "subtype": "triangle", "feature": "shaded_parts"},
  "partition": {"pattern": "equal_base_triangles", "parts": 3},
  "shaded_parts": [ 0, 2 ]
}

--- fraction_model / regular_polygon / shaded_parts ---
"visual": {
  "figure": {"type": "fraction_model", "subtype": "regular_polygon", "feature": "shaded_parts", "sides": 6},
  "partition": {"pattern": "center_triangles", "parts": 6},
  "shaded_parts": [ 0, 2, 4 ]
}

--- fraction_model / heart / shaded_parts ---
"visual": {
  "figure": {"type": "fraction_model", "subtype": "heart", "feature": "shaded_parts"},
  "partition": {"pattern": "mirror_halves", "parts": 2, "axis": "vertical"},
  "shaded_parts": [ 0 ]
}

--- fraction_model / star / shaded_parts ---
"visual": {
  "figure": {"type": "fraction_model", "subtype": "star", "feature": "shaded_parts", "star_points": 5},
  "partition": {"pattern": "mirror_halves", "parts": 2, "axis": "vertical"},
  "shaded_parts": [ 1 ]
}

--- parallel_lines / single_transversal / find_angle ---
"visual": {
  "figure": {"type": "parallel_lines", "subtype": "single_transversal", "feature": "find_angle", "orientation_deg": 25},
  "parallel_lines": [
    {"id": "l1", "label": "l"},
    {"id": "l2", "label": "m"}
  ],
  "transversals": [
    {"id": "t1", "label": "t", "direction": "rising_right", "inclination_deg": 60}
  ],
  "angle_marks": [
    {"id": "a1", "parallel_line_id": "l1", "transversal_id": "t1", "position": "lower_right", "label": "", "is_unknown": false, "value": 120},
    {"id": "a2", "parallel_line_id": "l2", "transversal_id": "t1", "position": "upper_right", "label": "x", "is_unknown": true}
  ]
}

--- parallel_lines / double_transversal / find_angle ---
"visual": {
  "figure": {"type": "parallel_lines", "subtype": "double_transversal", "feature": "find_angle", "orientation_deg": 90},
  "parallel_lines": [
    {"id": "l1", "label": "l"},
    {"id": "l2", "label": "m"},
    {"id": "l3", "label": "n"}
  ],
  "transversals": [
    {"id": "t1", "label": "p", "direction": "falling_right", "inclination_deg": 50},
    {"id": "t2", "label": "q", "direction": "falling_right", "inclination_deg": 50}
  ],
  "angle_marks": [
    {"id": "a1", "parallel_line_id": "l1", "transversal_id": "t1", "position": "upper_right", "label": "", "is_unknown": false, "value": 130},
    {"id": "a2", "parallel_line_id": "l3", "transversal_id": "t2", "position": "lower_right", "label": "x", "is_unknown": true}
  ]
}

--- triangle / scalene / parallel_segment ---
"visual": {
  "figure": {"type": "triangle", "subtype": "scalene", "feature": "parallel_segment"},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "point_d", "type": "point", "label": "D"},
    {"id": "point_e", "type": "point", "label": "E"},
    {"id": "segment_ad", "type": "segment", "label": "AD", "value": "4"},
    {"id": "segment_db", "type": "segment", "label": "DB", "value": "6"},
    {"id": "segment_ae", "type": "segment", "label": "AE", "value": "5"},
    {"id": "segment_ec", "type": "segment", "label": "EC"},
    {"id": "line_de", "type": "line", "label": "DE"},
    {"id": "line_bc", "type": "line", "label": "BC"}
  ],
  "relationships": [
    {"type": "forms_segment", "elements": ["point_a", "point_d"], "target": "segment_ad"},
    {"type": "forms_segment", "elements": ["point_d", "point_b"], "target": "segment_db"},
    {"type": "forms_segment", "elements": ["point_a", "point_e"], "target": "segment_ae"},
    {"type": "forms_segment", "elements": ["point_e", "point_c"], "target": "segment_ec"},
    {"type": "parallel_to", "elements": ["line_de", "line_bc"]},
    {"type": "is_on_segment", "elements": ["point_d"], "target": "segment_ab"},
    {"type": "is_on_segment", "elements": ["point_e"], "target": "segment_ac"}
  ]
}

--- triangle / scalene / circumcenter ---
"visual": {
  "figure": {"type": "triangle", "subtype": "scalene", "feature": "circumcenter"},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "point_o", "type": "point", "label": "O"},
    {"id": "line_l1", "type": "line", "label": "l_1"},
    {"id": "line_l2", "type": "line", "label": "l_2"},
    {"id": "line_l3", "type": "line", "label": "l_3"},
    {"id": "circle_c1", "type": "circle", "label": "Circumcircle"}
  ],
  "relationships": [
    {"type": "forms_triangle", "elements": ["point_a", "point_b", "point_c"], "target": "triangle_abc"},
    {"type": "is_perpendicular_bisector_of", "elements": ["line_l1"], "target": "segment_bc"},
    {"type": "is_perpendicular_bisector_of", "elements": ["line_l2"], "target": "segment_ac"},
    {"type": "is_perpendicular_bisector_of", "elements": ["line_l3"], "target": "segment_ab"},
    {"type": "intersect_at", "elements": ["line_l1", "line_l2", "line_l3"], "target": "point_o"},
    {"type": "is_center_of", "elements": ["point_o"], "target": "circle_c1"},
    {"type": "passes_through", "elements": ["circle_c1"], "target": ["point_a", "point_b", "point_c"]}
  ]
}

--- trapezoid / isosceles / diagonals ---
"visual": {
  "figure": {"type": "trapezoid", "subtype": "isosceles", "feature": "diagonals"},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "point_d", "type": "point", "label": "D"},
    {"id": "segment_ac", "type": "segment", "label": "AC"},
    {"id": "segment_bd", "type": "segment", "label": "BD"}
  ],
  "relationships": [
    {"type": "forms_trapezoid", "elements": ["point_a", "point_b", "point_c", "point_d"], "target": "trapezoid_abcd"},
    {"type": "parallel_to", "elements": ["segment_ab", "segment_dc"]},
    {"type": "forms_segment", "elements": ["point_a", "point_c"], "target": "segment_ac"},
    {"type": "forms_segment", "elements": ["point_b", "point_d"], "target": "segment_bd"},
    {"type": "equal_length", "elements": ["segment_ac", "segment_bd"]}
  ]
}

--- trapezoid / scalene / diagonal_proportionality ---
"visual": {
  "figure": {"type": "trapezoid", "subtype": "scalene", "feature": "diagonal_proportionality"},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "point_d", "type": "point", "label": "D"},
    {"id": "point_p", "type": "point", "label": "P"},
    {"id": "segment_ap", "type": "segment", "label": "AP", "value": "6"},
    {"id": "segment_pc", "type": "segment", "label": "PC", "value": "9"}
  ],
  "relationships": [
    {"type": "forms_trapezoid", "elements": ["point_a", "point_b", "point_c", "point_d"], "target": "trapezoid_abcd"},
    {"type": "parallel_to", "elements": ["segment_ab", "segment_dc"]},
    {"type": "intersect_at", "elements": ["segment_ac", "segment_bd"], "target": "point_p"},
    {"type": "forms_segment", "elements": ["point_a", "point_p"], "target": "segment_ap"},
    {"type": "forms_segment", "elements": ["point_p", "point_c"], "target": "segment_pc"}
  ]
}

--- parallelogram / general / diagonals ---
"visual": {
  "figure": {"type": "parallelogram", "subtype": "general", "feature": "diagonals"},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "point_d", "type": "point", "label": "D"},
    {"id": "point_o", "type": "point", "label": "O"},
    {"id": "segment_ac", "type": "segment", "label": "AC"},
    {"id": "segment_bd", "type": "segment", "label": "BD"}
  ],
  "relationships": [
    {"type": "forms_parallelogram", "elements": ["point_a", "point_b", "point_c", "point_d"], "target": "parallelogram_abcd"},
    {"type": "parallel_to", "elements": ["segment_ab", "segment_dc"]},
    {"type": "parallel_to", "elements": ["segment_ad", "segment_bc"]},
    {"type": "forms_segment", "elements": ["point_a", "point_c"], "target": "segment_ac"},
    {"type": "forms_segment", "elements": ["point_b", "point_d"], "target": "segment_bd"},
    {"type": "intersect_at", "elements": ["segment_ac", "segment_bd"], "target": "point_o"},
    {"type": "bisects", "elements": ["point_o"], "target": ["segment_ac", "segment_bd"]}
  ]
}

--- parallelogram / rhombus / diagonals ---
"visual": {
  "figure": {"type": "parallelogram", "subtype": "rhombus", "feature": "diagonals"},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "point_d", "type": "point", "label": "D"},
    {"id": "point_o", "type": "point", "label": "O"},
    {"id": "angle_aob", "type": "angle", "label": "$90^\\circ$", "value": "90"}
  ],
  "relationships": [
    {"type": "forms_parallelogram", "elements": ["point_a", "point_b", "point_c", "point_d"], "target": "parallelogram_abcd"},
    {"type": "parallel_to", "elements": ["segment_ab", "segment_dc"]},
    {"type": "parallel_to", "elements": ["segment_ad", "segment_bc"]},
    {"type": "equal_length", "elements": ["segment_ab", "segment_bc", "segment_cd", "segment_da"]},
    {"type": "intersect_at", "elements": ["segment_ac", "segment_bd"], "target": "point_o"},
    {"type": "forms_angle", "elements": ["point_a", "point_o", "point_b"], "target": "angle_aob"},
    {"type": "is_perpendicular_to", "elements": ["segment_ac", "segment_bd"]}
  ]
}

--- quadrilateral / kite / axis_of_symmetry ---
"visual": {
  "figure": {"type": "quadrilateral", "subtype": "kite", "feature": "axis_of_symmetry"},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "point_d", "type": "point", "label": "D"},
    {"id": "point_e", "type": "point", "label": "E"}
  ],
  "relationships": [
    {"type": "forms_quadrilateral", "elements": ["point_a", "point_b", "point_c", "point_d"], "target": "quadrilateral_abcd"},
    {"type": "equal_length", "elements": ["segment_ab", "segment_ad"]},
    {"type": "equal_length", "elements": ["segment_cb", "segment_cd"]},
    {"type": "intersect_at", "elements": ["segment_ac", "segment_bd"], "target": "point_e"},
    {"type": "is_perpendicular_to", "elements": ["segment_ac", "segment_bd"]},
    {"type": "bisects", "elements": ["point_e"], "target": ["segment_bd"]}
  ]
}

--- quadrilateral / cyclic / inscribed_in_circle ---
"visual": {
  "figure": {"type": "quadrilateral", "subtype": "cyclic", "feature": "inscribed_in_circle"},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "point_d", "type": "point", "label": "D"},
    {"id": "circle_c1", "type": "circle", "label": ""},
    {"id": "angle_abc", "type": "angle", "label": "$110^\\circ$", "value": "110"},
    {"id": "angle_adc", "type": "angle", "label": "$x$"}
  ],
  "relationships": [
    {"type": "forms_quadrilateral", "elements": ["point_a", "point_b", "point_c", "point_d"], "target": "quadrilateral_abcd"},
    {"type": "passes_through", "elements": ["circle_c1"], "target": ["point_a", "point_b", "point_c", "point_d"]},
    {"type": "forms_angle", "elements": ["point_a", "point_b", "point_c"], "target": "angle_abc"},
    {"type": "forms_angle", "elements": ["point_a", "point_d", "point_c"], "target": "angle_adc"},
    {"type": "opposite_angles_supplementary", "elements": ["angle_abc", "angle_adc"]}
  ]
}

--- circle / standard / none ---
"visual": {
  "figure": {"type": "circle", "subtype": "standard", "feature": "none"},
  "elements": [
    {"id": "point_o", "type": "point", "label": "O"},
    {"id": "point_r", "type": "point", "label": "R"},
    {"id": "segment_or", "type": "segment", "label": "Radius", "value": "30 cm"},
    {"id": "circle_c1", "type": "circle", "label": ""}
  ],
  "relationships": [
    {"type": "is_center_of", "elements": ["point_o"], "target": "circle_c1"},
    {"type": "forms_segment", "elements": ["point_o", "point_r"], "target": "segment_or"},
    {"type": "is_radius_of", "elements": ["segment_or"], "target": "circle_c1"},
    {"type": "is_on_circumference", "elements": ["point_r"], "target": "circle_c1"}
  ]
}

--- circle / standard / chord_properties ---
"visual": {
  "figure": {"type": "circle", "subtype": "standard", "feature": "chord_properties"},
  "elements": [
    {"id": "point_o", "type": "point", "label": "O"},
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_m", "type": "point", "label": "M"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "point_d", "type": "point", "label": "D"},
    {"id": "point_n", "type": "point", "label": "N"},
    {"id": "segment_ab", "type": "segment", "label": "AB"},
    {"id": "segment_cd", "type": "segment", "label": "CD"},
    {"id": "segment_ob", "type": "segment", "label": "Radius OB", "value": "13 cm"},
    {"id": "segment_om", "type": "segment", "label": "Distance OM", "value": "5 cm"},
    {"id": "segment_on", "type": "segment", "label": "Distance ON"},
    {"id": "circle_c1", "type": "circle", "label": ""}
  ],
  "relationships": [
    {"type": "is_center_of", "elements": ["point_o"], "target": "circle_c1"},
    {"type": "forms_chord", "elements": ["point_a", "point_b"], "target": "segment_ab"},
    {"type": "forms_chord", "elements": ["point_c", "point_d"], "target": "segment_cd"},
    {"type": "is_on_segment", "elements": ["point_m"], "target": "segment_ab"},
    {"type": "is_on_segment", "elements": ["point_n"], "target": "segment_cd"},
    {"type": "is_perpendicular_to", "elements": ["segment_om", "segment_ab"]},
    {"type": "is_perpendicular_to", "elements": ["segment_on", "segment_cd"]},
    {"type": "is_radius_of", "elements": ["segment_ob"], "target": "circle_c1"},
    {"type": "equal_length", "elements": ["segment_ab", "segment_cd"]},
    {"type": "forms_segment", "elements": ["point_o", "point_b"], "target": "segment_ob"},
    {"type": "forms_segment", "elements": ["point_o", "point_m"], "target": "segment_om"},
    {"type": "forms_segment", "elements": ["point_o", "point_n"], "target": "segment_on"}
  ]
}

--- circle / standard / central_inscribed_angle ---
"visual": {
  "figure": {"type": "circle", "subtype": "standard", "feature": "central_inscribed_angle"},
  "elements": [
    {"id": "point_o", "type": "point", "label": "O"},
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "circle_c1", "type": "circle", "label": ""},
    {"id": "angle_aob", "type": "angle", "label": "$80^\\circ$", "value": "80"},
    {"id": "angle_acb", "type": "angle", "label": "$x$"}
  ],
  "relationships": [
    {"type": "is_center_of", "elements": ["point_o"], "target": "circle_c1"},
    {"type": "passes_through", "elements": ["circle_c1"], "target": ["point_a", "point_b", "point_c"]},
    {"type": "forms_angle", "elements": ["point_a", "point_o", "point_b"], "target": "angle_aob"},
    {"type": "forms_angle", "elements": ["point_a", "point_c", "point_b"], "target": "angle_acb"},
    {"type": "subtends_same_arc", "elements": ["angle_aob", "angle_acb"], "target": "arc_ab"},
    {"type": "inscribed_angle_half_central", "elements": ["angle_acb", "angle_aob"]}
  ]
}

--- circle / standard / tangent_properties ---
"visual": {
  "figure": {"type": "circle", "subtype": "standard", "feature": "tangent_properties"},
  "elements": [
    {"id": "point_o", "type": "point", "label": "O"},
    {"id": "point_p", "type": "point", "label": "P"},
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "circle_c1", "type": "circle", "label": ""},
    {"id": "segment_pa", "type": "segment", "label": "PA", "value": "12"},
    {"id": "segment_pb", "type": "segment", "label": "PB"},
    {"id": "angle_oap", "type": "angle", "label": "$90^\\circ$", "value": "90"}
  ],
  "relationships": [
    {"type": "is_center_of", "elements": ["point_o"], "target": "circle_c1"},
    {"type": "passes_through", "elements": ["circle_c1"], "target": ["point_a", "point_b"]},
    {"type": "is_tangent_to", "elements": ["segment_pa"], "target": "circle_c1", "at_point": "point_a"},
    {"type": "is_tangent_to", "elements": ["segment_pb"], "target": "circle_c1", "at_point": "point_b"},
    {"type": "forms_segment", "elements": ["point_p", "point_a"], "target": "segment_pa"},
    {"type": "forms_segment", "elements": ["point_p", "point_b"], "target": "segment_pb"},
    {"type": "forms_angle", "elements": ["point_o", "point_a", "point_p"], "target": "angle_oap"},
    {"type": "equal_length", "elements": ["segment_pa", "segment_pb"]}
  ]
}

--- circle / intersecting / intersecting_chords ---
"visual": {
  "figure": {"type": "circle", "subtype": "intersecting", "feature": "intersecting_chords"},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "point_d", "type": "point", "label": "D"},
    {"id": "point_e", "type": "point", "label": "E"},
    {"id": "circle_c1", "type": "circle", "label": ""},
    {"id": "segment_ae", "type": "segment", "label": "AE", "value": "6"},
    {"id": "segment_eb", "type": "segment", "label": "EB", "value": "4"},
    {"id": "segment_ce", "type": "segment", "label": "CE", "value": "3"},
    {"id": "segment_ed", "type": "segment", "label": "ED"}
  ],
  "relationships": [
    {"type": "passes_through", "elements": ["circle_c1"], "target": ["point_a", "point_b", "point_c", "point_d"]},
    {"type": "forms_segment", "elements": ["point_a", "point_e"], "target": "segment_ae"},
    {"type": "forms_segment", "elements": ["point_e", "point_b"], "target": "segment_eb"},
    {"type": "forms_segment", "elements": ["point_c", "point_e"], "target": "segment_ce"},
    {"type": "forms_segment", "elements": ["point_e", "point_d"], "target": "segment_ed"},
    {"type": "intersect_at", "elements": ["segment_ab", "segment_cd"], "target": "point_e"},
    {"type": "intersecting_chords_product_equal", "elements": ["segment_ae", "segment_eb", "segment_ce", "segment_ed"]}
  ]
}

--- circle / semicircle / area ---
"visual": {
  "figure": {"type": "circle", "subtype": "semicircle", "feature": "area"},
  "elements": [
    {"id": "point_o", "type": "point", "label": "O"},
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "circle_c1", "type": "circle", "label": ""},
    {"id": "segment_ab", "type": "segment", "label": "AB"},
    {"id": "segment_oa", "type": "segment", "label": "OA", "value": "7 cm"}
  ],
  "relationships": [
    {"type": "is_center_of", "elements": ["point_o"], "target": "circle_c1"},
    {"type": "forms_segment", "elements": ["point_a", "point_b"], "target": "segment_ab"},
    {"type": "is_diameter_of", "elements": ["segment_ab"], "target": "circle_c1"},
    {"type": "forms_segment", "elements": ["point_o", "point_a"], "target": "segment_oa"},
    {"type": "is_radius_of", "elements": ["segment_oa"], "target": "circle_c1"},
    {"type": "is_on_circumference", "elements": ["point_a", "point_b"], "target": "circle_c1"}
  ]
}

--- circle / semicircle / arc_length ---
"visual": {
  "figure": {"type": "circle", "subtype": "semicircle", "feature": "arc_length"},
  "elements": [
    {"id": "point_o", "type": "point", "label": "O"},
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "circle_c1", "type": "circle", "label": ""},
    {"id": "segment_ab", "type": "segment", "label": "AB", "value": "14 cm"}
  ],
  "relationships": [
    {"type": "is_center_of", "elements": ["point_o"], "target": "circle_c1"},
    {"type": "forms_segment", "elements": ["point_a", "point_b"], "target": "segment_ab"},
    {"type": "is_diameter_of", "elements": ["segment_ab"], "target": "circle_c1"},
    {"type": "is_on_circumference", "elements": ["point_a", "point_b"], "target": "circle_c1"}
  ]
}

--- polygon / regular_n_gon / circumscribed_circle ---
"visual": {
  "figure": {"type": "polygon", "subtype": "regular_n_gon", "feature": "circumscribed_circle"},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "point_d", "type": "point", "label": "D"},
    {"id": "point_e", "type": "point", "label": "E"},
    {"id": "point_o", "type": "point", "label": "O"},
    {"id": "circle_c1", "type": "circle", "label": ""},
    {"id": "segment_oa", "type": "segment", "label": "Radius OA", "value": "6 cm"}
  ],
  "relationships": [
    {"type": "forms_polygon", "elements": ["point_a", "point_b", "point_c", "point_d", "point_e"], "target": "polygon_abcde", "polygon_type": "regular", "properties": {"sides": 5}},
    {"type": "is_center_of", "elements": ["point_o"], "target": "circle_c1"},
    {"type": "passes_through", "elements": ["circle_c1"], "target": ["point_a", "point_b", "point_c", "point_d", "point_e"]},
    {"type": "forms_segment", "elements": ["point_o", "point_a"], "target": "segment_oa"},
    {"type": "is_radius_of", "elements": ["segment_oa"], "target": "circle_c1"}
  ]
}

--- polygon / regular_n_gon / diagonals ---
"visual": {
  "figure": {"type": "polygon", "subtype": "regular_n_gon", "feature": "diagonals"},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "point_d", "type": "point", "label": "D"},
    {"id": "point_e", "type": "point", "label": "E"},
    {"id": "point_f", "type": "point", "label": "F"},
    {"id": "segment_ad", "type": "segment", "label": "AD"},
    {"id": "segment_be", "type": "segment", "label": "BE"}
  ],
  "relationships": [
    {"type": "forms_polygon", "elements": ["point_a", "point_b", "point_c", "point_d", "point_e", "point_f"], "target": "polygon_abcdef", "polygon_type": "regular", "properties": {"sides": 6}},
    {"type": "forms_segment", "elements": ["point_a", "point_d"], "target": "segment_ad"},
    {"type": "forms_segment", "elements": ["point_b", "point_e"], "target": "segment_be"},
    {"type": "is_diagonal_of", "elements": ["segment_ad"], "target": "polygon_abcdef"},
    {"type": "is_diagonal_of", "elements": ["segment_be"], "target": "polygon_abcdef"}
  ]
}

--- polygon / regular_n_gon / inscribed_circle ---
"visual": {
  "figure": {"type": "polygon", "subtype": "regular_n_gon", "feature": "inscribed_circle"},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A"},
    {"id": "point_b", "type": "point", "label": "B"},
    {"id": "point_c", "type": "point", "label": "C"},
    {"id": "point_d", "type": "point", "label": "D"},
    {"id": "point_e", "type": "point", "label": "E"},
    {"id": "point_f", "type": "point", "label": "F"},
    {"id": "point_o", "type": "point", "label": "O"},
    {"id": "circle_c1", "type": "circle", "label": ""},
    {"id": "segment_om", "type": "segment", "label": "Apothem"}
  ],
  "relationships": [
    {"type": "forms_polygon", "elements": ["point_a", "point_b", "point_c", "point_d", "point_e", "point_f"], "target": "polygon_abcdef", "polygon_type": "regular", "properties": {"sides": 6}},
    {"type": "is_center_of", "elements": ["point_o"], "target": "circle_c1"},
    {"type": "is_tangent_to", "elements": ["circle_c1"], "target": "polygon_abcdef"},
    {"type": "is_apothem_of", "elements": ["segment_om"], "target": "polygon_abcdef"}
  ]
}

--- coordinate_geometry / cartesian_plane / grid_lines ---
"visual": {
  "figure": {"type": "coordinate_geometry", "subtype": "cartesian_plane", "feature": "grid_lines", "bounds": {"x_min": -6, "x_max": 6, "y_min": -6, "y_max": 6}},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A", "x": -4, "y": 3},
    {"id": "point_b", "type": "point", "label": "B", "x": 2, "y": -5}
  ],
  "relationships": []
}

--- coordinate_geometry / distance_formula_segment / grid_lines ---
"visual": {
  "figure": {"type": "coordinate_geometry", "subtype": "distance_formula_segment", "feature": "grid_lines", "bounds": {"x_min": -2, "x_max": 10, "y_min": -2, "y_max": 10}},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A", "x": 2, "y": 3},
    {"id": "point_b", "type": "point", "label": "B", "x": 7, "y": 9},
    {"id": "segment_ab", "type": "segment", "label": "AB"}
  ],
  "relationships": [
    {"type": "forms_segment", "elements": ["point_a", "point_b"], "target": "segment_ab"}
  ]
}

--- coordinate_geometry / midpoint_segment / grid_lines ---
"visual": {
  "figure": {"type": "coordinate_geometry", "subtype": "midpoint_segment", "feature": "grid_lines", "bounds": {"x_min": -2, "x_max": 8, "y_min": -2, "y_max": 8}},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A", "x": 1, "y": 2},
    {"id": "point_b", "type": "point", "label": "B", "x": 6, "y": 6},
    {"id": "point_m", "type": "point", "label": "M", "x": 3.5, "y": 4},
    {"id": "segment_ab", "type": "segment", "label": "AB"}
  ],
  "relationships": [
    {"type": "forms_segment", "elements": ["point_a", "point_b"], "target": "segment_ab"},
    {"type": "is_midpoint_of", "elements": ["point_m"], "target": "segment_ab"}
  ]
}

--- coordinate_geometry / transformation_translation / vector_arrow ---
"visual": {
  "figure": {"type": "coordinate_geometry", "subtype": "transformation_translation", "feature": "vector_arrow", "bounds": {"x_min": -6, "x_max": 6, "y_min": -6, "y_max": 6}},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A", "x": -3, "y": 1},
    {"id": "point_a_prime", "type": "point", "label": "A'", "x": 1, "y": -2}
  ],
  "relationships": [
    {"type": "translated_by", "elements": ["point_a"], "target": "point_a_prime", "vector": [4, -3]}
  ]
}
--- coordinate_geometry / unit_circle / angle_position ---
"visual": {
  "figure": {
    "type": "coordinate_geometry",
    "subtype": "unit_circle",
    "feature": "angle_position",
    "angle_deg": 240
  },
  "elements": [
    {"id": "point_o", "type": "point", "label": "O", "x": 0, "y": 0},
    {"id": "point_p", "type": "point", "label": "P", "x": -0.5, "y": -0.866025404},
    {"id": "circle_unit", "type": "circle", "radius": 1},
    {"id": "segment_op", "type": "segment", "label": ""},
    {"id": "angle_rotation", "type": "angle", "label": "$240^\\circ$", "value": 240}
  ],
  "relationships": [
    {"type": "is_center_of", "elements": ["point_o"], "target": "circle_unit"},
    {"type": "forms_segment", "elements": ["point_o", "point_p"], "target": "segment_op"},
    {"type": "is_radius_of", "elements": ["segment_op"], "target": "circle_unit"},
    {"type": "marks_rotation", "elements": ["angle_rotation"], "target": "segment_op"}
  ]
}

--- coordinate_geometry / unit_circle / angle_position ---
"visual": {
  "figure": {
    "type": "coordinate_geometry",
    "subtype": "unit_circle",
    "feature": "angle_position",
    "angle_deg": -60
  },
  "elements": [
    {"id": "point_o", "type": "point", "label": "O", "x": 0, "y": 0},
    {"id": "point_p", "type": "point", "label": "P", "x": 0.5, "y": -0.866025404},
    {"id": "circle_unit", "type": "circle", "radius": 1},
    {"id": "segment_op", "type": "segment", "label": ""},
    {"id": "angle_rotation", "type": "angle", "label": "$-60^\\circ$", "value": -60}
  ],
  "relationships": [
    {"type": "is_center_of", "elements": ["point_o"], "target": "circle_unit"},
    {"type": "forms_segment", "elements": ["point_o", "point_p"], "target": "segment_op"},
    {"type": "is_radius_of", "elements": ["segment_op"], "target": "circle_unit"},
    {"type": "marks_rotation", "elements": ["angle_rotation"], "target": "segment_op"}
  ]
}

--- coordinate_geometry / unit_circle / angle_position ---
"visual": {
  "figure": {
    "type": "coordinate_geometry",
    "subtype": "unit_circle",
    "feature": "angle_position",
    "angle_deg": 120
  },
  "elements": [
    {"id": "point_o", "type": "point", "label": "O", "x": 0, "y": 0},
    {"id": "point_p", "type": "point", "label": "P", "x": -0.5, "y": 0.866025404},
    {"id": "circle_unit", "type": "circle", "radius": 1},
    {"id": "segment_op", "type": "segment", "label": ""},
    {"id": "angle_rotation", "type": "angle", "label": "$\\theta$"}
  ],
  "relationships": [
    {"type": "is_center_of", "elements": ["point_o"], "target": "circle_unit"},
    {"type": "forms_segment", "elements": ["point_o", "point_p"], "target": "segment_op"},
    {"type": "is_radius_of", "elements": ["segment_op"], "target": "circle_unit"},
    {"type": "marks_rotation", "elements": ["angle_rotation"], "target": "segment_op"}
  ]
}

--- solid_geometry / cube / total_surface_area ---
"visual": {
  "figure": {"type": "solid_geometry", "subtype": "cube", "feature": "total_surface_area"},
  "elements": [
    {"id": "solid_1", "type": "solid", "label": ""},
    {"id": "dim_side", "type": "dimension", "role": "side", "label": "$a = 5$ cm", "value": 5, "unit": "cm"}
  ],
  "relationships": [
    {"type": "dimension_of", "elements": ["dim_side"], "target": "solid_1"}
  ]
}

--- solid_geometry / cuboid / volume ---
"visual": {
  "figure": {"type": "solid_geometry", "subtype": "cuboid", "feature": "volume"},
  "elements": [
    {"id": "solid_1", "type": "solid", "label": ""},
    {"id": "dim_l", "type": "dimension", "role": "length", "label": "$l = 8$ cm", "value": 8, "unit": "cm"},
    {"id": "dim_w", "type": "dimension", "role": "width", "label": "$w = 4$ cm", "value": 4, "unit": "cm"},
    {"id": "dim_h", "type": "dimension", "role": "height", "label": "$h = 3$ cm", "value": 3, "unit": "cm"}
  ],
  "relationships": [
    {"type": "dimension_of", "elements": ["dim_l", "dim_w", "dim_h"], "target": "solid_1"}
  ]
}

--- solid_geometry / cylinder / curved_surface_area ---
"visual": {
  "figure": {"type": "solid_geometry", "subtype": "cylinder", "feature": "curved_surface_area"},
  "elements": [
    {"id": "solid_1", "type": "solid", "label": ""},
    {"id": "dim_r", "type": "dimension", "role": "radius", "label": "$r = 3$ cm", "value": 3, "unit": "cm"},
    {"id": "dim_h", "type": "dimension", "role": "height", "label": "$h = 7$ cm", "value": 7, "unit": "cm"}
  ],
  "relationships": [
    {"type": "dimension_of", "elements": ["dim_r", "dim_h"], "target": "solid_1"}
  ]
}

--- solid_geometry / cone / total_surface_area ---
"visual": {
  "figure": {"type": "solid_geometry", "subtype": "cone", "feature": "total_surface_area"},
  "elements": [
    {"id": "solid_1", "type": "solid", "label": ""},
    {"id": "dim_r", "type": "dimension", "role": "radius", "label": "$r = 3$ cm", "value": 3, "unit": "cm"},
    {"id": "dim_s", "type": "dimension", "role": "slant_height", "label": "$s = 5$ cm", "value": 5, "unit": "cm"}
  ],
  "relationships": [
    {"type": "dimension_of", "elements": ["dim_r", "dim_s"], "target": "solid_1"}
  ]
}

--- solid_geometry / sphere / total_surface_area ---
"visual": {
  "figure": {"type": "solid_geometry", "subtype": "sphere", "feature": "total_surface_area"},
  "elements": [
    {"id": "solid_1", "type": "solid", "label": ""},
    {"id": "dim_r", "type": "dimension", "role": "radius", "label": "$r = 6$ cm", "value": 6, "unit": "cm"}
  ],
  "relationships": [
    {"type": "dimension_of", "elements": ["dim_r"], "target": "solid_1"}
  ]
}

--- solid_geometry / hemisphere / curved_surface_area ---
"visual": {
  "figure": {"type": "solid_geometry", "subtype": "hemisphere", "feature": "curved_surface_area"},
  "elements": [
    {"id": "solid_1", "type": "solid", "label": ""},
    {"id": "dim_d", "type": "dimension", "role": "diameter", "label": "$d = 10$ cm", "value": 10, "unit": "cm"}
  ],
  "relationships": [
    {"type": "dimension_of", "elements": ["dim_d"], "target": "solid_1"}
  ]
}

--- solid_geometry / triangular_prism / total_surface_area ---
"visual": {
  "figure": {"type": "solid_geometry", "subtype": "triangular_prism", "feature": "total_surface_area"},
  "elements": [
    {"id": "solid_1", "type": "solid", "label": ""},
    {"id": "dim_a", "type": "dimension", "role": "base_side_a", "label": "$a = 6$ cm", "value": 6, "unit": "cm"},
    {"id": "dim_b", "type": "dimension", "role": "base_side_b", "label": "$b = 5$ cm", "value": 5, "unit": "cm"},
    {"id": "dim_c", "type": "dimension", "role": "base_side_c", "label": "$c = 5$ cm", "value": 5, "unit": "cm"},
    {"id": "dim_alt", "type": "dimension", "role": "base_altitude", "label": "$h_b = 4$ cm", "value": 4, "unit": "cm"},
    {"id": "dim_len", "type": "dimension", "role": "prism_length", "label": "$L = 10$ cm", "value": 10, "unit": "cm"}
  ],
  "relationships": [
    {"type": "dimension_of", "elements": ["dim_a", "dim_b", "dim_c", "dim_alt", "dim_len"], "target": "solid_1"}
  ]
}

--- solid_geometry / square_pyramid / volume ---
"visual": {
  "figure": {"type": "solid_geometry", "subtype": "square_pyramid", "feature": "volume"},
  "elements": [
    {"id": "solid_1", "type": "solid", "label": ""},
    {"id": "dim_a", "type": "dimension", "role": "base_side", "label": "$a = 6$ cm", "value": 6, "unit": "cm"},
    {"id": "dim_h", "type": "dimension", "role": "height", "label": "$h = 4$ cm", "value": 4, "unit": "cm"}
  ],
  "relationships": [
    {"type": "dimension_of", "elements": ["dim_a", "dim_h"], "target": "solid_1"}
  ]
}

--- venn_diagram / 2_set ---
"visual": {
  "figure": {"type": "venn_diagram", "subtype": "2_set"},
  "title": "Favorite Subjects Survey",
  "sets": [
    {"id": "set_a", "label": "Math"},
    {"id": "set_b", "label": "Science"}
  ],
  "regions": [
    {"in": ["set_a"], "value": 15},
    {"in": ["set_b"], "value": 12},
    {"in": ["set_a", "set_b"], "value": 8},
    {"in": [], "value": 5}
  ]
}

--- venn_diagram / 3_set ---
"visual": {
  "figure": {"type": "venn_diagram", "subtype": "3_set"},
  "title": "Sports Participation",
  "sets": [
    {"id": "set_a", "label": "Soccer"},
    {"id": "set_b", "label": "Basketball"},
    {"id": "set_c", "label": "Tennis"}
  ],
  "regions": [
    {"in": ["set_a"], "value": 10},
    {"in": ["set_b"], "value": 8},
    {"in": ["set_c"], "value": 6},
    {"in": ["set_a", "set_b"], "value": 4},
    {"in": ["set_a", "set_c"], "value": 3},
    {"in": ["set_b", "set_c"], "value": 2},
    {"in": ["set_a", "set_b", "set_c"], "value": 1},
    {"in": [], "value": 5}
  ]
}

--- venn_diagram / disjoint ---
"visual": {
  "figure": {"type": "venn_diagram", "subtype": "disjoint"},
  "title": "Students Taking French or German",
  "sets": [
    {"id": "set_a", "label": "French"},
    {"id": "set_b", "label": "German"}
  ],
  "regions": [
    {"in": ["set_a"], "value": 20},
    {"in": ["set_b"], "value": 18}
  ]
}

--- venn_diagram / subset ---
"visual": {
  "figure": {"type": "venn_diagram", "subtype": "subset"},
  "title": "Animals: Mammals within Vertebrates",
  "sets": [
    {"id": "set_a", "label": "Vertebrates"},
    {"id": "set_b", "label": "Mammals"}
  ],
  "regions": [
    {"in": ["set_b"], "value": 12},
    {"in": ["set_a"], "value": 30}
  ]
}

--- chart / pie ---
"visual": {
  "figure": {"type": "chart", "subtype": "pie"},
  "title": "Expense Distribution",
  "elements": [
    {"id": "s1", "type": "slice", "label": "Rent", "value": 40, "unit": "%"},
    {"id": "s2", "type": "slice", "label": "Food", "value": 30, "unit": "%"},
    {"id": "s3", "type": "slice", "label": "Savings", "value": 30, "unit": "%"}
  ],
  "relationships": [
    {"type": "sum_total", "value": 100}
  ]
}

--- table / data_matrix ---
"visual": {
  "figure": {"type": "table", "subtype": "data_matrix"},
  "title": "Kinematics Trial Data",
  "headers": [
    "Trial",
    "Time (s)",
    "Velocity (m/s)"
  ],
  "rows": [
    ["1", "2.0", "10.0"],
    ["2", "4.0", "20.0"],
    ["3", "6.0", "30.0"]
  ]
}

--- graph / number_line ---
"visual": {
  "figure": {"type": "graph", "subtype": "number_line", "bounds": {"min": -5, "max": 10}},
  "elements": [
    {"id": "point_a", "type": "point", "label": "A", "x": 3},
    {"id": "point_b", "type": "point", "label": "B", "x": -2}
  ],
  "relationships": []
}

--- graph / number_line ---
"visual": {
  "figure": {"type": "graph", "subtype": "number_line", "bounds": {"min": -5, "max": 10}},
  "elements": [
    {"id": "point_a", "type": "point", "label": "", "x": 3, "closed": false}
  ],
  "relationships": [
    {"type": "shades_ray", "elements": ["point_a"], "direction": "right"}
  ]
}

--- graph / bar_graph ---
"visual": {
  "figure": {"type": "graph", "subtype": "bar_graph"},
  "title": "Monthly Rainfall",
  "x_axis_label": "Month",
  "y_axis_label": "Rainfall (mm)",
  "categories": [
    {"label": "Jan", "value": 45},
    {"label": "Feb", "value": 60},
    {"label": "Mar", "value": 30},
    {"label": "Apr", "value": 80}
  ]
}

--- graph / line_graph ---
"visual": {
  "figure": {"type": "graph", "subtype": "line_graph"},
  "title": "Temperature Over the Week",
  "x_axis_label": "Day",
  "y_axis_label": "Temperature (°C)",
  "series": [
    {"label": "Temperature", "data": [{"label": "Mon", "value": 18}, {"label": "Tue", "value": 21}, {"label": "Wed", "value": 19}, {"label": "Thu", "value": 23}, {"label": "Fri", "value": 25}]}
  ]
}

--- graph / line_graph ---
"visual": {
  "figure": {"type": "graph", "subtype": "line_graph"},
  "title": "Temperature Comparison: City A vs City B",
  "x_axis_label": "Day",
  "y_axis_label": "Temperature (°C)",
  "series": [
    {"label": "City A", "data": [{"label": "Mon", "value": 18}, {"label": "Tue", "value": 21}, {"label": "Wed", "value": 19}, {"label": "Thu", "value": 23}, {"label": "Fri", "value": 25}]},
    {"label": "City B", "data": [{"label": "Mon", "value": 22}, {"label": "Tue", "value": 24}, {"label": "Wed", "value": 20}, {"label": "Thu", "value": 19}, {"label": "Fri", "value": 27}]}
  ]
}
--- graph / function_graph / amplitude ---
"visual": {
  "figure": {
    "type": "graph",
    "subtype": "function_graph",
    "feature": "amplitude",
    "angle_unit": "radians",
    "bounds": {
      "x_min": -3.141592654,
      "x_max": 3.141592654,
      "y_min": -3,
      "y_max": 3
    },
    "x_tick_pi": 0.5,
    "y_tick_step": 1,
    "show_grid": false
  },
  "elements": [
    {"id": "axis_x", "type": "axis", "orientation": "horizontal", "label": "$x$ (radians)"},
    {"id": "axis_y", "type": "axis", "orientation": "vertical", "label": "$y$"},
    {"id": "curve_1", "type": "function_curve", "label": "", "function": "sin", "a": 2, "b": 1, "h": 0, "k": 0}
  ],
  "relationships": [
    {"type": "plotted_on", "elements": ["curve_1"], "target": "axis_x"},
    {"type": "plotted_on", "elements": ["curve_1"], "target": "axis_y"}
  ]
}

--- graph / function_graph / period ---
"visual": {
  "figure": {
    "type": "graph",
    "subtype": "function_graph",
    "feature": "period",
    "angle_unit": "radians",
    "bounds": {
      "x_min": -3.141592654,
      "x_max": 3.141592654,
      "y_min": -2,
      "y_max": 2
    },
    "x_tick_pi": 0.5,
    "y_tick_step": 1,
    "show_grid": false
  },
  "elements": [
    {"id": "axis_x", "type": "axis", "orientation": "horizontal", "label": "$x$ (radians)"},
    {"id": "axis_y", "type": "axis", "orientation": "vertical", "label": "$y$"},
    {"id": "curve_1", "type": "function_curve", "label": "", "function": "cos", "a": 1, "b": 2, "h": 0, "k": 0}
  ],
  "relationships": [
    {"type": "plotted_on", "elements": ["curve_1"], "target": "axis_x"},
    {"type": "plotted_on", "elements": ["curve_1"], "target": "axis_y"}
  ]
}

--- graph / function_graph / identify_function ---
"visual": {
  "figure": {
    "type": "graph",
    "subtype": "function_graph",
    "feature": "identify_function",
    "angle_unit": "radians",
    "bounds": {
      "x_min": -3.141592654,
      "x_max": 3.141592654,
      "y_min": -3,
      "y_max": 3
    },
    "x_tick_pi": 0.5,
    "y_tick_step": 1,
    "show_grid": false
  },
  "elements": [
    {"id": "axis_x", "type": "axis", "orientation": "horizontal", "label": "$x$ (radians)"},
    {"id": "axis_y", "type": "axis", "orientation": "vertical", "label": "$y$"},
    {"id": "curve_1", "type": "function_curve", "label": "", "function": "tan", "a": 1, "b": 1, "h": 0, "k": 0}
  ],
  "relationships": [
    {"type": "plotted_on", "elements": ["curve_1"], "target": "axis_x"},
    {"type": "plotted_on", "elements": ["curve_1"], "target": "axis_y"}
  ]
}

--- graph / function_graph / identify_function ---
"visual": {
  "figure": {
    "type": "graph",
    "subtype": "function_graph",
    "feature": "identify_function",
    "angle_unit": "radians",
    "bounds": {
      "x_min": -1.5,
      "x_max": 1.5,
      "y_min": -2,
      "y_max": 2
    },
    "x_tick_step": 0.5,
    "y_tick_pi": 0.25,
    "show_grid": false
  },
  "elements": [
    {"id": "axis_x", "type": "axis", "orientation": "horizontal", "label": "$x$"},
    {"id": "axis_y", "type": "axis", "orientation": "vertical", "label": "$y$ (radians)"},
    {"id": "curve_1", "type": "function_curve", "label": "", "function": "asin", "a": 1, "b": 1, "h": 0, "k": 0}
  ],
  "relationships": [
    {"type": "plotted_on", "elements": ["curve_1"], "target": "axis_x"},
    {"type": "plotted_on", "elements": ["curve_1"], "target": "axis_y"}
  ]
}

--- graph / function_graph / range ---
"visual": {
  "figure": {
    "type": "graph",
    "subtype": "function_graph",
    "feature": "range",
    "angle_unit": "radians",
    "bounds": {
      "x_min": -1.5,
      "x_max": 1.5,
      "y_min": -0.5,
      "y_max": 3.6
    },
    "x_tick_step": 0.5,
    "y_tick_pi": 0.5,
    "show_grid": false
  },
  "elements": [
    {"id": "axis_x", "type": "axis", "orientation": "horizontal", "label": "$x$"},
    {"id": "axis_y", "type": "axis", "orientation": "vertical", "label": "$y$ (radians)"},
    {"id": "curve_1", "type": "function_curve", "label": "", "function": "acos", "a": 1, "b": 1, "h": 0, "k": 0}
  ],
  "relationships": [
    {"type": "plotted_on", "elements": ["curve_1"], "target": "axis_x"},
    {"type": "plotted_on", "elements": ["curve_1"], "target": "axis_y"}
  ]
}

--- graph / function_graph / range ---
"visual": {
  "figure": {
    "type": "graph",
    "subtype": "function_graph",
    "feature": "range",
    "angle_unit": "radians",
    "bounds": {
      "x_min": -4,
      "x_max": 4,
      "y_min": -2,
      "y_max": 2
    },
    "x_tick_step": 1,
    "y_tick_pi": 0.25,
    "show_grid": false
  },
  "elements": [
    {"id": "axis_x", "type": "axis", "orientation": "horizontal", "label": "$x$"},
    {"id": "axis_y", "type": "axis", "orientation": "vertical", "label": "$y$ (radians)"},
    {"id": "curve_1", "type": "function_curve", "label": "", "function": "atan", "a": 1, "b": 1, "h": 0, "k": 0}
  ],
  "relationships": [
    {"type": "plotted_on", "elements": ["curve_1"], "target": "axis_x"},
    {"type": "plotted_on", "elements": ["curve_1"], "target": "axis_y"}
  ]
}

--- composite_geometry / joined_rectangles / area ---
"visual": {
  "figure": {"type": "composite_geometry", "subtype": "joined_rectangles", "feature": "area"},
  "elements": [
    {"id": "rect_a", "type": "rectangle", "label": "A", "length": 8, "width": 3},
    {"id": "rect_b", "type": "rectangle", "label": "B", "length": 3, "width": 4},
    {"id": "dim_al", "type": "dimension", "role": "length", "label": "8 m", "value": 8, "unit": "m"},
    {"id": "dim_aw", "type": "dimension", "role": "width", "label": "3 m", "value": 3, "unit": "m"},
    {"id": "dim_bl", "type": "dimension", "role": "length", "label": "3 m", "value": 3, "unit": "m"},
    {"id": "dim_bw", "type": "dimension", "role": "width", "label": "4 m", "value": 4, "unit": "m"}
  ],
  "relationships": [
    {"type": "joins_edge", "elements": ["rect_b"], "target": "rect_a", "side": "top", "alignment": "start"},
    {"type": "dimension_of", "elements": ["dim_al", "dim_aw"], "target": "rect_a"},
    {"type": "dimension_of", "elements": ["dim_bl", "dim_bw"], "target": "rect_b"}
  ]
}

--- composite_geometry / joined_rectangles / area ---
"visual": {
  "figure": {"type": "composite_geometry", "subtype": "joined_rectangles", "feature": "area"},
  "elements": [
    {"id": "rect_a", "type": "rectangle", "label": "", "length": 12, "width": 5},
    {"id": "rect_b", "type": "rectangle", "label": "", "length": 4, "width": 10},
    {"id": "dim_al", "type": "dimension", "role": "length", "label": "12 cm", "value": 12, "unit": "cm"},
    {"id": "dim_aw", "type": "dimension", "role": "width", "label": "5 cm", "value": 5, "unit": "cm"},
    {"id": "dim_bl", "type": "dimension", "role": "length", "label": "4 cm", "value": 4, "unit": "cm"},
    {"id": "dim_bw", "type": "dimension", "role": "width", "label": "10 cm", "value": 10, "unit": "cm"}
  ],
  "relationships": [
    {"type": "joins_edge", "elements": ["rect_b"], "target": "rect_a", "side": "top", "alignment": "start", "overlap_depth": 5},
    {"type": "dimension_of", "elements": ["dim_al", "dim_aw"], "target": "rect_a"},
    {"type": "dimension_of", "elements": ["dim_bl", "dim_bw"], "target": "rect_b"}
  ]
}

--- composite_geometry / rectangular_cutouts / remaining_area ---
"visual": {
  "figure": {"type": "composite_geometry", "subtype": "rectangular_cutouts", "feature": "remaining_area"},
  "elements": [
    {"id": "outer", "type": "rectangle", "label": "", "length": 10, "width": 8},
    {"id": "cutout", "type": "rectangle", "label": "", "length": 4, "width": 3},
    {"id": "dim_l", "type": "dimension", "role": "length", "label": "10 cm", "value": 10, "unit": "cm"},
    {"id": "dim_w", "type": "dimension", "role": "width", "label": "8 cm", "value": 8, "unit": "cm"},
    {"id": "dim_cl", "type": "dimension", "role": "length", "label": "4 cm", "value": 4, "unit": "cm"},
    {"id": "dim_cw", "type": "dimension", "role": "width", "label": "3 cm", "value": 3, "unit": "cm"}
  ],
  "relationships": [
    {"type": "inside", "elements": ["cutout"], "target": "outer", "placement": "top_right"},
    {"type": "subtracts_from", "elements": ["cutout"], "target": "outer"},
    {"type": "dimension_of", "elements": ["dim_l", "dim_w"], "target": "outer"},
    {"type": "dimension_of", "elements": ["dim_cl", "dim_cw"], "target": "cutout"}
  ]
}

--- composite_geometry / partitioned_rectangle / missing_area ---
"visual": {
  "figure": {"type": "composite_geometry", "subtype": "partitioned_rectangle", "feature": "missing_area"},
  "elements": [
    {"id": "outer", "type": "rectangle", "label": "", "length": 9, "width": 7},
    {"id": "rect_a", "type": "rectangle", "label": "A", "length": 3, "width": 4},
    {"id": "rect_b", "type": "rectangle", "label": "B", "length": 6, "width": 4},
    {"id": "rect_c", "type": "rectangle", "label": "C", "length": 3, "width": 3},
    {"id": "rect_d", "type": "rectangle", "label": "D", "length": 6, "width": 3},
    {"id": "area_a", "type": "dimension", "role": "area", "label": "$12$ square units", "value": 12, "unit": "square units"},
    {"id": "area_b", "type": "dimension", "role": "area", "label": "$24$ square units", "value": 24, "unit": "square units"},
    {"id": "area_c", "type": "dimension", "role": "area", "label": "$9$ square units", "value": 9, "unit": "square units"},
    {"id": "area_d", "type": "dimension", "role": "area", "label": "$x$ square units", "unit": "square units"}
  ],
  "relationships": [
    {"type": "inside", "elements": ["rect_a"], "target": "outer", "placement": "top_left"},
    {"type": "joins_edge", "elements": ["rect_b"], "target": "rect_a", "side": "right", "alignment": "start"},
    {"type": "joins_edge", "elements": ["rect_c"], "target": "rect_a", "side": "bottom", "alignment": "start"},
    {"type": "joins_edge", "elements": ["rect_d"], "target": "rect_c", "side": "right", "alignment": "start"},
    {"type": "partitions", "elements": ["rect_a", "rect_b", "rect_c", "rect_d"], "target": "outer"},
    {"type": "dimension_of", "elements": ["area_a"], "target": "rect_a"},
    {"type": "dimension_of", "elements": ["area_b"], "target": "rect_b"},
    {"type": "dimension_of", "elements": ["area_c"], "target": "rect_c"},
    {"type": "dimension_of", "elements": ["area_d"], "target": "rect_d"}
  ]
}

--- composite_geometry / unit_square_region / perimeter ---
"visual": {
  "figure": {"type": "composite_geometry", "subtype": "unit_square_region", "feature": "perimeter", "cell_size": 1, "unit": "cm"},
  "elements": [
    {"id": "cell_1", "type": "unit_cell", "row": 0, "column": 0},
    {"id": "cell_2", "type": "unit_cell", "row": 1, "column": 0},
    {"id": "cell_3", "type": "unit_cell", "row": 2, "column": 0},
    {"id": "cell_4", "type": "unit_cell", "row": 2, "column": 1},
    {"id": "cell_5", "type": "unit_cell", "row": 2, "column": 2}
  ],
  "relationships": []
}

--- composite_geometry / crossing_paths / area ---
"visual": {
  "figure": {"type": "composite_geometry", "subtype": "crossing_paths", "feature": "area"},
  "elements": [
    {"id": "park", "type": "rectangle", "label": "Park", "length": 20, "width": 12},
    {"id": "path_h", "type": "rectangle", "label": "", "length": 20, "width": 2},
    {"id": "path_v", "type": "rectangle", "label": "", "length": 3, "width": 12},
    {"id": "dim_l", "type": "dimension", "role": "length", "label": "20 m", "value": 20, "unit": "m"},
    {"id": "dim_w", "type": "dimension", "role": "width", "label": "12 m", "value": 12, "unit": "m"},
    {"id": "dim_hpath", "type": "dimension", "role": "width", "label": "2 m", "value": 2, "unit": "m"},
    {"id": "dim_vpath", "type": "dimension", "role": "length", "label": "3 m", "value": 3, "unit": "m"}
  ],
  "relationships": [
    {"type": "crosses_inside", "elements": ["path_h", "path_v"], "target": "park", "placement": "center"},
    {"type": "dimension_of", "elements": ["dim_l", "dim_w"], "target": "park"},
    {"type": "dimension_of", "elements": ["dim_hpath"], "target": "path_h"},
    {"type": "dimension_of", "elements": ["dim_vpath"], "target": "path_v"}
  ]
}

--- composite_geometry / boundary_path / area ---
"visual": {
  "figure": {"type": "composite_geometry", "subtype": "boundary_path", "feature": "area"},
  "elements": [
    {"id": "park", "type": "rectangle", "label": "Park", "length": 20, "width": 12},
    {"id": "path", "type": "rectangle", "label": "Outer Boundary"},
    {"id": "dim_l", "type": "dimension", "role": "length", "label": "20 m", "value": 20, "unit": "m"},
    {"id": "dim_w", "type": "dimension", "role": "width", "label": "12 m", "value": 12, "unit": "m"},
    {"id": "dim_path_w", "type": "dimension", "role": "path_width", "label": "2 m", "value": 2, "unit": "m"}
  ],
  "relationships": [
    {"type": "surrounds", "elements": ["path"], "target": "park", "placement": "outside", "path_width": 2},
    {"type": "dimension_of", "elements": ["dim_l", "dim_w"], "target": "park"},
    {"type": "dimension_of", "elements": ["dim_path_w"], "target": "path"}
  ]
}

--- composite_geometry / rectangle_semicircle / area ---
"visual": {
  "figure": {"type": "composite_geometry", "subtype": "rectangle_semicircle", "feature": "area"},
  "elements": [
    {"id": "rect", "type": "rectangle", "label": "", "length": 12, "width": 8},
    {"id": "semi", "type": "semicircle", "label": ""},
    {"id": "dim_l", "type": "dimension", "role": "length", "label": "12 cm", "value": 12, "unit": "cm"},
    {"id": "dim_w", "type": "dimension", "role": "width", "label": "8 cm", "value": 8, "unit": "cm"}
  ],
  "relationships": [
    {"type": "attaches_to", "elements": ["semi"], "target": "rect", "side": "right", "placement": "outside"},
    {"type": "dimension_of", "elements": ["dim_l", "dim_w"], "target": "rect"}
  ]
}

--- composite_geometry / rectangle_semicircle / perimeter ---
"visual": {
  "figure": {"type": "composite_geometry", "subtype": "rectangle_semicircle", "feature": "perimeter"},
  "elements": [
    {"id": "rect", "type": "rectangle", "label": "", "length": 20, "width": 14},
    {"id": "semi_left", "type": "semicircle", "label": ""},
    {"id": "semi_right", "type": "semicircle", "label": ""},
    {"id": "dim_l", "type": "dimension", "role": "length", "label": "20 m", "value": 20, "unit": "m"},
    {"id": "dim_d", "type": "dimension", "role": "diameter", "label": "14 m", "value": 14, "unit": "m"}
  ],
  "relationships": [
    {"type": "attaches_to", "elements": ["semi_left"], "target": "rect", "side": "left", "placement": "outside"},
    {"type": "attaches_to", "elements": ["semi_right"], "target": "rect", "side": "right", "placement": "outside"},
    {"type": "dimension_of", "elements": ["dim_l"], "target": "rect"},
    {"type": "dimension_of", "elements": ["dim_d"], "target": "semi_left"}
  ]
}

--- composite_geometry / rectangle_semicircle / area ---
"visual": {
  "figure": {"type": "composite_geometry", "subtype": "rectangle_semicircle", "feature": "area"},
  "elements": [
    {"id": "rect", "type": "rectangle", "label": "", "length": 14, "width": 10},
    {"id": "notch", "type": "semicircle", "label": ""},
    {"id": "dim_l", "type": "dimension", "role": "length", "label": "14 cm", "value": 14, "unit": "cm"},
    {"id": "dim_w", "type": "dimension", "role": "width", "label": "10 cm", "value": 10, "unit": "cm"}
  ],
  "relationships": [
    {"type": "attaches_to", "elements": ["notch"], "target": "rect", "side": "top", "placement": "inside"},
    {"type": "dimension_of", "elements": ["dim_l", "dim_w"], "target": "rect"}
  ]
}

--- symmetry / line_symmetry / count_lines ---
"visual": {
  "figure": {"type": "symmetry", "subtype": "line_symmetry", "feature": "count_lines"},
  "elements": [
    {"id": "point_a", "type": "point", "x": -4, "y": -2},
    {"id": "point_b", "type": "point", "x": 4, "y": -2},
    {"id": "point_c", "type": "point", "x": 4, "y": 2},
    {"id": "point_d", "type": "point", "x": -4, "y": 2},
    {"id": "shape_1", "type": "polygon", "label": ""}
  ],
  "relationships": [
    {"type": "forms_polygon", "elements": ["point_a", "point_b", "point_c", "point_d"], "target": "shape_1"}
  ]
}

--- symmetry / line_symmetry / identify_line ---
"visual": {
  "figure": {"type": "symmetry", "subtype": "line_symmetry", "feature": "identify_line"},
  "elements": [
    {"id": "point_a", "type": "point", "x": -3, "y": 0},
    {"id": "point_b", "type": "point", "x": 3, "y": 0},
    {"id": "point_c", "type": "point", "x": 0, "y": 4},
    {"id": "shape_1", "type": "polygon", "label": ""},
    {"id": "p1", "type": "point", "x": 0, "y": -1},
    {"id": "p2", "type": "point", "x": 0, "y": 5},
    {"id": "p3", "type": "point", "x": -4, "y": 1},
    {"id": "p4", "type": "point", "x": 4, "y": 1},
    {"id": "p5", "type": "point", "x": -4, "y": -1},
    {"id": "p6", "type": "point", "x": 4, "y": 3},
    {"id": "p7", "type": "point", "x": -4, "y": 3},
    {"id": "p8", "type": "point", "x": 4, "y": -1},
    {"id": "line_1", "type": "line", "label": "L1"},
    {"id": "line_2", "type": "line", "label": "L2"},
    {"id": "line_3", "type": "line", "label": "L3"},
    {"id": "line_4", "type": "line", "label": "L4"}
  ],
  "relationships": [
    {"type": "forms_polygon", "elements": ["point_a", "point_b", "point_c"], "target": "shape_1"},
    {"type": "forms_line", "elements": ["p1", "p2"], "target": "line_1"},
    {"type": "forms_line", "elements": ["p3", "p4"], "target": "line_2"},
    {"type": "forms_line", "elements": ["p5", "p6"], "target": "line_3"},
    {"type": "forms_line", "elements": ["p7", "p8"], "target": "line_4"},
    {"type": "candidate_axis", "elements": ["line_1", "line_2", "line_3", "line_4"], "target": "shape_1"}
  ]
}

--- symmetry / reflection / identify_image ---
"visual": {
  "figure": {"type": "symmetry", "subtype": "reflection", "feature": "identify_image", "show_grid": false},
  "elements": [
    {"id": "p1", "type": "point", "x": -4, "y": 0},
    {"id": "p2", "type": "point", "x": -1, "y": 0},
    {"id": "p3", "type": "point", "x": -3, "y": 2},
    {"id": "original", "type": "polygon", "label": "P"},

    {"id": "m1", "type": "point", "x": 0, "y": -2},
    {"id": "m2", "type": "point", "x": 0, "y": 4},
    {"id": "mirror", "type": "line", "label": "L"},

    {"id": "a1", "type": "point", "x": 4, "y": 0},
    {"id": "a2", "type": "point", "x": 1, "y": 0},
    {"id": "a3", "type": "point", "x": 3, "y": 2},
    {"id": "image_a", "type": "polygon", "label": "A"},

    {"id": "b1", "type": "point", "x": 4, "y": 2},
    {"id": "b2", "type": "point", "x": 1, "y": 2},
    {"id": "b3", "type": "point", "x": 3, "y": 0},
    {"id": "image_b", "type": "polygon", "label": "B"},

    {"id": "c1", "type": "point", "x": 4, "y": 2},
    {"id": "c2", "type": "point", "x": 1, "y": 2},
    {"id": "c3", "type": "point", "x": 2, "y": 0},
    {"id": "image_c", "type": "polygon", "label": "C"},

    {"id": "d1", "type": "point", "x": 1, "y": 0},
    {"id": "d2", "type": "point", "x": 4, "y": 0},
    {"id": "d3", "type": "point", "x": 2, "y": 2},
    {"id": "image_d", "type": "polygon", "label": "D"}
  ],
  "relationships": [
    {"type": "forms_polygon", "elements": ["p1", "p2", "p3"], "target": "original"},
    {"type": "forms_line", "elements": ["m1", "m2"], "target": "mirror"},
    {"type": "mirror_axis", "elements": ["mirror"], "target": "original"},
    {"type": "forms_polygon", "elements": ["a1", "a2", "a3"], "target": "image_a"},
    {"type": "forms_polygon", "elements": ["b1", "b2", "b3"], "target": "image_b"},
    {"type": "forms_polygon", "elements": ["c1", "c2", "c3"], "target": "image_c"},
    {"type": "forms_polygon", "elements": ["d1", "d2", "d3"], "target": "image_d"},
    {"type": "candidate_image", "elements": ["image_a", "image_b", "image_c", "image_d"], "target": "original"}
  ]
}

--- symmetry / line_symmetry / check_line ---
"visual": {
  "figure": {"type": "symmetry", "subtype": "line_symmetry", "feature": "check_line"},
  "elements": [
    {"id": "point_a", "type": "point", "x": -4, "y": -2},
    {"id": "point_b", "type": "point", "x": 4, "y": -2},
    {"id": "point_c", "type": "point", "x": 4, "y": 2},
    {"id": "point_d", "type": "point", "x": -4, "y": 2},
    {"id": "shape_1", "type": "polygon", "label": ""},
    {"id": "line_1", "type": "line", "label": "L"}
  ],
  "relationships": [
    {"type": "forms_polygon", "elements": ["point_a", "point_b", "point_c", "point_d"], "target": "shape_1"},
    {"type": "forms_line", "elements": ["point_a", "point_c"], "target": "line_1"},
    {"type": "candidate_axis", "elements": ["line_1"], "target": "shape_1"}
  ]
}

--- SYMMETRY: REFLECTION — FIND REFLECTED POINT ---
"visual": {{
  "figure": {{
    "type": "symmetry",
    "subtype": "reflection",
    "feature": "find_reflected_point",
    "show_grid": true
  }},
  "elements": [
    {{ "id": "point_p", "type": "point", "label": "P", "x": 3, "y": 2 }},
    {{ "id": "axis_a", "type": "point", "x": 0, "y": -4 }},
    {{ "id": "axis_b", "type": "point", "x": 0, "y": 4 }},
    {{ "id": "mirror", "type": "line", "label": "L" }}
  ],
  "relationships": [
    {{ "type": "forms_line", "elements": ["axis_a", "axis_b"], "target": "mirror" }},
    {{ "type": "mirror_axis", "elements": ["mirror"], "target": "point_p" }}
  ]
}}

--- symmetry / rotational_symmetry / count_order ---
"visual": {
  "figure": {
    "type": "symmetry",
    "subtype": "rotational_symmetry",
    "feature": "count_order"
  },
  "elements": [
    {"id": "p1", "type": "point", "x": -4, "y": -2},
    {"id": "p2", "type": "point", "x": 4, "y": -2},
    {"id": "p3", "type": "point", "x": 4, "y": 2},
    {"id": "p4", "type": "point", "x": -4, "y": 2},
    {"id": "center", "type": "point", "label": "O", "x": 0, "y": 0},
    {"id": "shape_1", "type": "polygon", "label": ""}
  ],
  "relationships": [
    {"type": "forms_polygon", "elements": ["p1", "p2", "p3", "p4"], "target": "shape_1"},
    {"type": "rotation_center", "elements": ["center"], "target": "shape_1"}
  ]
}

--- symmetry / rotational_symmetry / smallest_angle ---
"visual": {
  "figure": {
    "type": "symmetry",
    "subtype": "rotational_symmetry",
    "feature": "smallest_angle"
  },
  "elements": [
    {"id": "p1", "type": "point", "x": -1, "y": 3},
    {"id": "p2", "type": "point", "x": 1, "y": 3},
    {"id": "p3", "type": "point", "x": 1, "y": 1},
    {"id": "p4", "type": "point", "x": 3, "y": 1},
    {"id": "p5", "type": "point", "x": 3, "y": -1},
    {"id": "p6", "type": "point", "x": 1, "y": -1},
    {"id": "p7", "type": "point", "x": 1, "y": -3},
    {"id": "p8", "type": "point", "x": -1, "y": -3},
    {"id": "p9", "type": "point", "x": -1, "y": -1},
    {"id": "p10", "type": "point", "x": -3, "y": -1},
    {"id": "p11", "type": "point", "x": -3, "y": 1},
    {"id": "p12", "type": "point", "x": -1, "y": 1},
    {"id": "center", "type": "point", "label": "O", "x": 0, "y": 0},
    {"id": "shape_1", "type": "polygon", "label": ""}
  ],
  "relationships": [
    {
      "type": "forms_polygon",
      "elements": ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10", "p11", "p12"],
      "target": "shape_1"
    },
    {"type": "rotation_center", "elements": ["center"], "target": "shape_1"}
  ]
}

--- symmetry / rotational_symmetry / check_rotation ---
"visual": {
  "figure": {
    "type": "symmetry",
    "subtype": "rotational_symmetry",
    "feature": "check_rotation",
    "rotation_deg": 90
  },
  "elements": [
    {"id": "center", "type": "point", "label": "O", "x": 0, "y": 0},
    {"id": "shape_1", "type": "ellipse", "label": "", "radius_x": 4, "radius_y": 2}
  ],
  "relationships": [
    {"type": "is_center_of", "elements": ["center"], "target": "shape_1"},
    {"type": "rotation_center", "elements": ["center"], "target": "shape_1"}
  ]
}

--- mapping_diagram / two_sets / classify_function ---
"visual": {
  "figure": {
    "type": "mapping_diagram",
    "subtype": "two_sets",
    "feature": "classify_function",
    "source_set": "set_a",
    "target_set": "set_b"
  },
  "elements": [
    {"id": "set_a", "type": "set", "label": "A"},
    {"id": "set_b", "type": "set", "label": "B"},
    {"id": "a1", "type": "member", "label": "$1$"},
    {"id": "a2", "type": "member", "label": "$2$"},
    {"id": "a3", "type": "member", "label": "$3$"},
    {"id": "b1", "type": "member", "label": "$4$"},
    {"id": "b2", "type": "member", "label": "$5$"}
  ],
  "relationships": [
    {"type": "belongs_to", "elements": ["a1", "a2", "a3"], "target": "set_a"},
    {"type": "belongs_to", "elements": ["b1", "b2"], "target": "set_b"},
    {"type": "maps_to", "elements": ["a1"], "target": "b1"},
    {"type": "maps_to", "elements": ["a2"], "target": "b1"},
    {"type": "maps_to", "elements": ["a3"], "target": "b2"}
  ]
}

--- mapping_diagram / two_sets / identify_function ---
"visual": {
  "figure": {
    "type": "mapping_diagram",
    "subtype": "two_sets",
    "feature": "identify_function",
    "source_set": "set_a",
    "target_set": "set_b"
  },
  "elements": [
    {"id": "set_a", "type": "set", "label": "A"},
    {"id": "set_b", "type": "set", "label": "B"},
    {"id": "a1", "type": "member", "label": "$1$"},
    {"id": "a2", "type": "member", "label": "$2$"},
    {"id": "b1", "type": "member", "label": "$a$"},
    {"id": "b2", "type": "member", "label": "$b$"},
    {"id": "b3", "type": "member", "label": "$c$"}
  ],
  "relationships": [
    {"type": "belongs_to", "elements": ["a1", "a2"], "target": "set_a"},
    {"type": "belongs_to", "elements": ["b1", "b2", "b3"], "target": "set_b"},
    {"type": "maps_to", "elements": ["a1"], "target": "b1"},
    {"type": "maps_to", "elements": ["a1"], "target": "b2"},
    {"type": "maps_to", "elements": ["a2"], "target": "b3"}
  ]
}
--- mapping_diagram / two_sets / find_range ---
"visual": {
  "figure": {
    "type": "mapping_diagram",
    "subtype": "two_sets",
    "feature": "find_range",
    "source_set": "set_a",
    "target_set": "set_b"
  },
  "elements": [
    {"id": "set_a", "type": "set", "label": "A"},
    {"id": "set_b", "type": "set", "label": "B"},
    {"id": "a1", "type": "member", "label": "$-1$"},
    {"id": "a2", "type": "member", "label": "$0$"},
    {"id": "a3", "type": "member", "label": "$1$"},
    {"id": "b1", "type": "member", "label": "$2$"},
    {"id": "b2", "type": "member", "label": "$4$"},
    {"id": "b3", "type": "member", "label": "$6$"},
    {"id": "b4", "type": "member", "label": "$8$"}
  ],
  "relationships": [
    {"type": "belongs_to", "elements": ["a1", "a2", "a3"], "target": "set_a"},
    {"type": "belongs_to", "elements": ["b1", "b2", "b3", "b4"], "target": "set_b"},
    {"type": "maps_to", "elements": ["a1"], "target": "b1"},
    {"type": "maps_to", "elements": ["a2"], "target": "b3"},
    {"type": "maps_to", "elements": ["a3"], "target": "b1"}
  ]
}



--- physics / free_body_diagram / multiple_forces ---
"visual": {
  "figure": {"type": "physics", "subtype": "free_body_diagram", "feature": "multiple_forces"},
  "elements": [
    {"id": "object", "type": "shape", "shape": "box", "label": "Box"},
    {"id": "force_gravity", "type": "vector", "label": "Fg = 50 N", "angle": 270, "length": "medium"},
    {"id": "force_normal", "type": "vector", "label": "N = 50 N", "angle": 90, "length": "medium"},
    {"id": "force_applied", "type": "vector", "label": "F = 20 N", "angle": 0, "length": "short"},
    {"id": "force_friction", "type": "vector", "label": "f = 8 N", "angle": 180, "length": "short"}
  ],
  "relationships": [
    {"type": "acts_on", "elements": ["force_gravity", "force_normal", "force_applied", "force_friction"], "target": "object"}
  ]
}

--- physics / inclined_plane / net_force ---
"visual": {
  "figure": {"type": "physics", "subtype": "inclined_plane", "feature": "net_force"},
  "incline_angle": 30,
  "elements": [
    {"id": "object", "label": "Block", "shape": "box", "type": "shape"},
    {"id": "force_gravity", "label": "Fg = 98 N", "angle": 270, "length": "medium", "type": "vector"},
    {"id": "force_normal", "label": "N", "angle": 60, "length": "medium", "type": "vector"},
    {"id": "force_gravity_parallel", "label": "Fg,∥", "angle": 330, "length": "short", "type": "vector", "dashed": true},
    {"id": "force_gravity_perpendicular", "label": "Fg,⊥", "angle": 240, "length": "short", "type": "vector", "dashed": true}
  ],
  "relationships": [
    {"type": "acts_on", "elements": ["force_gravity", "force_normal"], "target": "object"},
    {"type": "component_of", "elements": ["force_gravity_parallel", "force_gravity_perpendicular"], "target": "force_gravity"}
  ]
}

--- physics / pulley_system / tension ---
"visual": {
  "figure": {"type": "physics", "subtype": "pulley_system", "feature": "tension"},
  "elements": [
    {"id": "pulley_1", "type": "pulley", "x_position": "center"},
    {"id": "object_a", "label": "5 kg", "shape": "box", "type": "shape", "side": "left"},
    {"id": "object_b", "label": "8 kg", "shape": "box", "type": "shape", "side": "right"},
    {"id": "tension_a", "label": "T", "length": "medium", "type": "vector", "attached_to": "object_a", "angle": 90},
    {"id": "tension_b", "label": "T", "length": "medium", "type": "vector", "attached_to": "object_b", "angle": 90},
    {"id": "gravity_a", "label": "Fg = 49 N", "length": "medium", "type": "vector", "attached_to": "object_a", "angle": 270},
    {"id": "gravity_b", "label": "Fg = 78.4 N", "length": "medium", "type": "vector", "attached_to": "object_b", "angle": 270}
  ],
  "relationships": [
    {"type": "connected_by_rope", "elements": ["object_a", "object_b"], "target": "pulley_1"},
    {"type": "acts_on", "elements": ["tension_a", "gravity_a"], "target": "object_a"},
    {"type": "acts_on", "elements": ["tension_b", "gravity_b"], "target": "object_b"}
  ]
}

--- physics / incline_pulley_system / tension ---
"visual": {
  "figure": {"type": "physics", "subtype": "incline_pulley_system", "feature": "tension"},
  "incline_angle": 30,
  "elements": [
    {"id": "pulley_1", "type": "pulley"},
    {"id": "object_a", "label": "$m_1 = 10\\text{ kg}$", "shape": "box", "side": "on_incline", "type": "shape"},
    {"id": "object_b", "label": "$m_2 = 10\\text{ kg}$", "shape": "box", "side": "hanging", "type": "shape"},
    {"angle": 30, "attached_to": "object_a", "id": "tension_a", "label": "T", "length": "medium", "type": "vector"},
    {"angle": 270, "attached_to": "object_a", "id": "force_gravity_a", "label": "$m_1g$", "length": "medium", "type": "vector"},
    {"angle": 120, "attached_to": "object_a", "id": "force_normal_a", "label": "$N_1$", "length": "medium", "type": "vector"},
    {"angle": 90, "attached_to": "object_b", "id": "tension_b", "label": "T", "length": "medium", "type": "vector"},
    {"angle": 270, "attached_to": "object_b", "id": "force_gravity_b", "label": "$m_2g$", "length": "medium", "type": "vector"}
  ],
  "relationships": [
    {"elements": ["object_a", "object_b"], "target": "pulley_1", "type": "connected_by_rope"},
    {"elements": ["tension_a", "force_gravity_a", "force_normal_a"], "target": "object_a", "type": "acts_on"},
    {"elements": ["tension_b", "force_gravity_b"], "target": "object_b", "type": "acts_on"}
  ]
}

--- physics / projectile_motion / horizontal_launch ---
"visual": {
  "figure": {"type": "physics", "subtype": "projectile_motion", "feature": "horizontal_launch"},
  "launch_height": 20,
  "launch_velocity": 15,
  "elements": [
    {"id": "launch_point", "type": "point", "label": ""},
    {"id": "landing_point", "type": "point", "label": ""},
    {"angle": 0, "attached_to": "launch_point", "id": "velocity_initial", "label": "$v_0 = 15\\text{ m/s}$", "length": "medium", "type": "vector"}
  ],
  "relationships": [
    {"elements": ["launch_point", "landing_point"], "type": "trajectory_path"}
  ]
}

--- physics / projectile_motion / angled_launch ---
"visual": {
  "figure": {"type": "physics", "subtype": "projectile_motion", "feature": "angled_launch"},
  "launch_angle": 30,
  "launch_velocity": 25,
  "elements": [
    {"id": "launch_point", "label": "", "type": "point"},
    {"id": "landing_point", "label": "", "type": "point"},
    {"angle": 30, "attached_to": "launch_point", "id": "velocity_initial", "label": "$v_0 = 25\\text{ m/s}$", "length": "medium", "type": "vector"}
  ],
  "relationships": [
    {"elements": ["launch_point", "landing_point"], "type": "trajectory_path"}
  ]
}

--- physics / projectile_motion / angled_launch_from_height ---
"visual": {
  "figure": {"type": "physics", "subtype": "projectile_motion", "feature": "angled_launch_from_height"},
  "launch_angle": 40,
  "launch_velocity": 25,
  "launch_height": 30,
  "elements": [
    {"id": "launch_point", "label": "", "type": "point"},
    {"id": "landing_point", "label": "", "type": "point"},
    {"angle": 40, "attached_to": "launch_point", "id": "velocity_initial", "label": "$v_0 = 25\\text{ m/s}$", "length": "medium", "type": "vector"}
  ],
  "relationships": [
    {"elements": ["launch_point", "landing_point"], "type": "trajectory_path"}
  ]
}

--- physics / wave_transverse / amplitude_wavelength ---
"visual": {
  "figure": {"type": "physics", "subtype": "wave_transverse", "feature": "amplitude_wavelength"},
  "amplitude": 3,
  "wavelength": 8,
  "num_cycles": 2,
  "elements": [
    {"id": "wave_1", "type": "wave"},
    {"id": "amplitude_marker", "type": "measurement", "label": "$A = 3\\text{ cm}$"},
    {"id": "wavelength_marker", "type": "measurement", "label": "$\\lambda = 8\\text{ cm}$"}
  ],
  "relationships": [
    {"elements": ["amplitude_marker"], "target": "wave_1", "type": "measures_amplitude_of"},
    {"elements": ["wavelength_marker"], "target": "wave_1", "type": "measures_wavelength_of"}
  ]
}

--- physics / standing_wave / nodes_antinodes ---
"visual": {
  "figure": {"type": "physics", "subtype": "standing_wave", "feature": "nodes_antinodes"},
  "wavelength": 8,
  "num_cycles": 2,
  "elements": [
    {"id": "wave_1", "type": "wave"},
    {"id": "node_marker", "type": "measurement", "label": "Node"},
    {"id": "antinode_marker", "type": "measurement", "label": "Antinode"}
  ],
  "relationships": [
    {"elements": ["node_marker"], "target": "wave_1", "type": "marks_nodes_of"},
    {"elements": ["antinode_marker"], "target": "wave_1", "type": "marks_antinodes_of"}
  ]
}

--- physics / wave_longitudinal / compressions_rarefactions ---
"visual": {
  "figure": {"type": "physics", "subtype": "wave_longitudinal", "feature": "compressions_rarefactions"},
  "wavelength": 8,
  "num_cycles": 2,
  "elements": [
    {"id": "wave_1", "type": "wave"},
    {"id": "compression_marker", "type": "measurement", "label": "Compression"},
    {"id": "rarefaction_marker", "type": "measurement", "label": "Rarefaction"}
  ],
  "relationships": [
    {"elements": ["compression_marker"], "target": "wave_1", "type": "marks_compression_of"},
    {"elements": ["rarefaction_marker"], "target": "wave_1", "type": "marks_rarefaction_of"}
  ]
}

--- physics / standing_wave / harmonic_on_fixed_string ---
"visual": {
  "figure": {"type": "physics", "subtype": "standing_wave", "feature": "harmonic_on_fixed_string"},
  "string_length": 2,
  "harmonic_number": 3,
  "elements": [
    {"id": "wave_1", "type": "wave"},
    {"id": "fixed_end_left", "type": "point", "x_position": 0},
    {"id": "fixed_end_right", "type": "point", "x_position": 2}
  ],
  "relationships": [
    {"elements": ["fixed_end_left", "fixed_end_right"], "target": "wave_1", "type": "fixes_endpoints_of"}
  ]
}

--- physics / wave_superposition / constructive_interference ---
"visual": {
  "figure": {"type": "physics", "subtype": "wave_superposition", "feature": "constructive_interference"},
  "wave_1_amplitude": 2,
  "wave_1_wavelength": 8,
  "wave_1_phase": 0,
  "wave_2_amplitude": 2,
  "wave_2_wavelength": 8,
  "wave_2_phase": 0,
  "num_cycles": 2,
  "elements": [
    {"id": "wave_1", "type": "wave"},
    {"id": "wave_2", "type": "wave"},
    {"id": "resultant_wave", "type": "wave"}
  ],
  "relationships": [
    {"elements": ["wave_1", "wave_2"], "target": "resultant_wave", "type": "superposes_to"}
  ]
}

--- physics / wave_longitudinal / doppler_effect ---
"visual": {
  "figure": {"type": "physics", "subtype": "wave_longitudinal", "feature": "doppler_effect"},
  "source_speed": 20,
  "wave_speed": 340,
  "wavelength_at_rest": 2,
  "elements": [
    {"id": "source", "type": "point", "x_position": 10},
    {"id": "wavefront_1", "type": "circle", "emitted_at_x": 0, "radius": 8},
    {"id": "wavefront_2", "type": "circle", "emitted_at_x": 2.5, "radius": 6},
    {"id": "wavefront_3", "type": "circle", "emitted_at_x": 5, "radius": 4},
    {"id": "wavefront_4", "type": "circle", "emitted_at_x": 7.5, "radius": 2}
  ],
  "relationships": [
    {"elements": ["wavefront_1", "wavefront_2", "wavefront_3", "wavefront_4"], "target": "source", "type": "emitted_by"}
  ]
}

--- physics / circuit_series / resistors ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_series", "feature": "resistors"},
  "elements": [
    {"id": "battery_1", "label": "9V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R1 = 10Ω", "type": "resistor", "x_position": "top"},
    {"id": "resistor_2", "label": "R2 = 20Ω", "type": "resistor", "x_position": "right"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "resistor_1", "resistor_2"], "order": "series", "loop_closed": true}
  ]
}

--- physics / circuit_series / battery_and_switch ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_series", "feature": "battery_and_switch"},
  "elements": [
    {"id": "battery_1", "label": "12V", "type": "battery", "x_position": "left"},
    {"id": "switch_1", "label": "S1", "type": "switch", "state": "closed", "x_position": "top"},
    {"id": "resistor_1", "label": "R1 = 15Ω", "type": "resistor", "x_position": "right"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "switch_1", "resistor_1"], "order": "series", "loop_closed": true}
  ]
}

--- physics / circuit_series / bulb ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_series", "feature": "bulb"},
  "elements": [
    {"id": "battery_1", "label": "9V", "type": "battery", "x_position": "left"},
    {"id": "switch_1", "label": "S1", "type": "switch", "state": "closed", "x_position": "top"},
    {"id": "bulb_1", "label": "L1", "type": "bulb", "x_position": "right", "isLit": true}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "switch_1", "bulb_1"], "order": "series", "loop_closed": true}
  ]
}

--- physics / circuit_series / power_dissipation ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_series", "feature": "power_dissipation"},
  "elements": [
    {"id": "battery_1", "label": "20V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R1 = 5Ω", "type": "resistor", "x_position": "top"},
    {"id": "resistor_2", "label": "R2 = 15Ω", "type": "resistor", "x_position": "right"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "resistor_1", "resistor_2"], "order": "series", "loop_closed": true}
  ]
}

--- physics / circuit_series / open_circuit_fault ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_series", "feature": "open_circuit_fault"},
  "elements": [
    {"id": "battery_1", "label": "9V", "type": "battery", "x_position": "left"},
    {"id": "break_1", "label": "", "type": "open_break", "x_position": "top"},
    {"id": "resistor_1", "label": "R1 = 10Ω", "type": "resistor", "x_position": "right"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "break_1", "resistor_1"], "order": "series", "loop_closed": false}
  ]
}

--- physics / circuit_series / voltage_divider ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_series", "feature": "voltage_divider"},
  "elements": [
    {"id": "battery_1", "label": "10V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R1 = 4Ω", "type": "resistor", "x_position": "top"},
    {"id": "resistor_2", "label": "R2 = 6Ω", "type": "resistor", "x_position": "right"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "resistor_1", "resistor_2"], "order": "series", "loop_closed": true}
  ]
}

--- physics / circuit_series / short_circuit ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_series", "feature": "short_circuit"},
  "elements": [
    {"id": "battery_1", "label": "12V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R1 = 5Ω", "type": "resistor", "x_position": "top"},
    {"id": "resistor_2", "label": "R2 = 10Ω", "type": "resistor", "x_position": "right"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "resistor_1", "resistor_2"], "order": "series", "loop_closed": true},
    {"type": "shorts", "elements": ["short_1"], "target": "resistor_2"}
  ]
}

--- physics / circuit_series / charging ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_series", "feature": "charging"},
  "elements": [
    {"id": "battery_1", "label": "12V", "type": "battery", "x_position": "left"},
    {"id": "switch_1", "label": "S1", "type": "switch", "state": "closed", "x_position": "top"},
    {"id": "resistor_1", "label": "R = 5kΩ", "type": "resistor", "x_position": "right"},
    {"id": "capacitor_1", "label": "C = 100μF", "type": "capacitor", "x_position": "bottom"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "switch_1", "resistor_1", "capacitor_1"], "order": "series", "loop_closed": true}
  ]
}

--- physics / circuit_parallel / resistors ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_parallel", "feature": "resistors"},
  "elements": [
    {"id": "battery_1", "label": "12V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R1 = 12Ω", "type": "resistor", "x_position": "right", "side": "top"},
    {"id": "resistor_2", "label": "R2 = 6Ω", "type": "resistor", "x_position": "right", "side": "bottom"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1"], "order": "series"},
    {"type": "connected_by_wire", "elements": ["resistor_1", "resistor_2"], "order": "parallel_branch", "shares_nodes": true}
  ]
}

--- physics / circuit_parallel / battery_and_switch ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_parallel", "feature": "battery_and_switch"},
  "elements": [
    {"id": "battery_1", "label": "12V", "type": "battery", "x_position": "left"},
    {"id": "switch_1", "label": "S1", "type": "switch", "state": "closed", "x_position": "left"},
    {"id": "resistor_1", "label": "R1 = 10Ω", "type": "resistor", "x_position": "right", "side": "top"},
    {"id": "resistor_2", "label": "R2 = 20Ω", "type": "resistor", "x_position": "right", "side": "bottom"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "switch_1"], "order": "series"},
    {"type": "connected_by_wire", "elements": ["resistor_1", "resistor_2"], "order": "parallel_branch", "shares_nodes": true}
  ]
}

--- physics / circuit_parallel / bulb ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_parallel", "feature": "bulb"},
  "elements": [
    {"id": "battery_1", "label": "12V", "type": "battery", "x_position": "left"},
    {"id": "bulb_1", "label": "L1", "type": "bulb", "x_position": "right", "side": "top", "isLit": true},
    {"id": "bulb_2", "label": "L2", "type": "bulb", "x_position": "right", "side": "bottom", "isLit": false}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1"], "order": "series"},
    {"type": "connected_by_wire", "elements": ["bulb_1", "bulb_2"], "order": "parallel_branch", "shares_nodes": true}
  ]
}

--- physics / circuit_parallel / ammeter_voltmeter ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_parallel", "feature": "ammeter_voltmeter"},
  "elements": [
    {"id": "battery_1", "label": "12V", "type": "battery", "x_position": "left"},
    {"id": "ammeter_1", "label": "A", "type": "ammeter", "x_position": "top"},
    {"id": "resistor_1", "label": "R1 = 15Ω", "type": "resistor", "x_position": "right", "side": "top"},
    {"id": "resistor_2", "label": "R2 = 30Ω", "type": "resistor", "x_position": "right", "side": "bottom"},
    {"id": "voltmeter_1", "label": "V", "type": "voltmeter", "x_position": "far_right"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "ammeter_1"], "order": "series"},
    {"type": "connected_by_wire", "elements": ["resistor_1", "resistor_2"], "order": "parallel_branch", "shares_nodes": true},
    {"type": "measures_current", "elements": ["ammeter_1"], "target": "battery_1"},
    {"type": "measures_voltage", "elements": ["voltmeter_1"], "target": "resistor_1"}
  ]
}

--- physics / circuit_parallel / power_dissipation ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_parallel", "feature": "power_dissipation"},
  "elements": [
    {"id": "battery_1", "label": "24V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R1 = 8Ω", "type": "resistor", "x_position": "right", "side": "top"},
    {"id": "resistor_2", "label": "R2 = 12Ω", "type": "resistor", "x_position": "right", "side": "bottom"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1"], "order": "series"},
    {"type": "connected_by_wire", "elements": ["resistor_1", "resistor_2"], "order": "parallel_branch", "shares_nodes": true}
  ]
}

--- physics / circuit_parallel / open_circuit_fault ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_parallel", "feature": "open_circuit_fault"},
  "elements": [
    {"id": "battery_1", "label": "12V", "type": "battery", "x_position": "left"},
    {"id": "break_1", "label": "", "type": "open_break", "x_position": "right", "side": "top"},
    {"id": "resistor_1", "label": "R1 = 15Ω", "type": "resistor", "x_position": "right", "side": "bottom"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1"], "order": "series"},
    {"type": "connected_by_wire", "elements": ["break_1", "resistor_1"], "order": "parallel_branch", "shares_nodes": true}
  ]
}

--- physics / circuit_parallel / short_circuit ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_parallel", "feature": "short_circuit"},
  "elements": [
    {"id": "battery_1", "label": "12V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R1 = 10Ω", "type": "resistor", "x_position": "right", "side": "top"},
    {"id": "resistor_2", "label": "R2 = 20Ω", "type": "resistor", "x_position": "right", "side": "bottom"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1"], "order": "series"},
    {"type": "connected_by_wire", "elements": ["resistor_1", "resistor_2"], "order": "parallel_branch", "shares_nodes": true},
    {"type": "shorts", "elements": ["short_1"], "target": "resistor_1"}
  ]
}

--- physics / circuit_parallel / charging ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_parallel", "feature": "charging"},
  "elements": [
    {"id": "battery_1", "label": "10V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R = 1kΩ", "type": "resistor", "x_position": "right", "side": "top"},
    {"id": "capacitor_1", "label": "C = 200μF", "type": "capacitor", "x_position": "right", "side": "bottom"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1"], "order": "series"},
    {"type": "connected_by_wire", "elements": ["resistor_1", "capacitor_1"], "order": "parallel_branch", "shares_nodes": true}
  ]
}

--- physics / circuit_series / energizing ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_series", "feature": "energizing"},
  "elements": [
    {"id": "battery_1", "label": "V", "type": "battery", "x_position": "left"},
    {"id": "switch_1", "label": "S", "type": "switch", "state": "open", "x_position": "top"},
    {"id": "resistor_1", "label": "R", "type": "resistor", "x_position": "right"},
    {"id": "inductor_1", "label": "L", "type": "inductor", "x_position": "bottom"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "switch_1", "resistor_1", "inductor_1"], "order": "series", "loop_closed": false}
  ]
}

--- physics / circuit_series / de_energizing ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_series", "feature": "de_energizing"},
  "elements": [
    {"id": "inductor_1", "label": "L", "is_energized": true, "type": "inductor", "x_position": "left"},
    {"id": "resistor_1", "label": "R", "type": "resistor", "x_position": "right"},
    {"id": "switch_1", "label": "S", "type": "switch", "state": "closed", "x_position": "top"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["inductor_1", "switch_1", "resistor_1"], "order": "series", "loop_closed": true}
  ]
}

--- physics / circuit_parallel / energizing ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_parallel", "feature": "energizing"},
  "elements": [
    {"id": "battery_1", "label": "V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R", "type": "resistor", "x_position": "right", "side": "top"},
    {"id": "inductor_1", "label": "L", "type": "inductor", "x_position": "right", "side": "bottom"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1"], "order": "series"},
    {"type": "connected_by_wire", "elements": ["resistor_1", "inductor_1"], "order": "parallel_branch", "shares_nodes": true}
  ]
}

--- physics / circuit_parallel / de_energizing ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_parallel", "feature": "de_energizing"},
  "elements": [
    {"id": "inductor_1", "label": "L", "is_energized": true, "type": "inductor", "x_position": "left"},
    {"id": "switch_1", "label": "S", "type": "switch", "state": "closed", "x_position": "top"},
    {"id": "resistor_1", "label": "R1", "type": "resistor", "x_position": "right", "side": "top"},
    {"id": "resistor_2", "label": "R2", "type": "resistor", "x_position": "right", "side": "bottom"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["inductor_1", "switch_1"], "order": "series"},
    {"type": "connected_by_wire", "elements": ["resistor_1", "resistor_2"], "order": "parallel_branch", "shares_nodes": true}
  ]
}

--- physics / circuit_series / energizing ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_series", "feature": "energizing"},
  "elements": [
    {"id": "battery_1", "label": "V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R = 20 Ω", "type": "resistor", "x_position": "top"},
    {"id": "inductor_1", "label": "L = 4 H", "type": "inductor", "x_position": "right"},
    {"id": "switch_1", "label": "S", "type": "switch", "state": "closed", "x_position": "bottom"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "resistor_1", "inductor_1", "switch_1"], "order": "series", "loop_closed": true}
  ]
}

--- physics / circuit_combination / energizing ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_combination", "feature": "energizing"},
  "elements": [
    {"id": "battery_1", "label": "V", "type": "battery", "x_position": "left"},
    {"id": "switch_1", "label": "S", "type": "switch", "state": "closed", "x_position": "top"},
    {"id": "resistor_1", "label": "R1", "type": "resistor", "x_position": "top"},
    {"id": "node_1", "type": "node", "x_position": "right"},
    {"id": "resistor_2", "label": "R2", "side": "top", "type": "resistor"},
    {"id": "inductor_1", "label": "L", "side": "bottom", "type": "inductor"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "switch_1", "resistor_1", "node_1"], "order": "series", "loop_closed": true},
    {"anchorId": "node_1", "elements": ["resistor_2", "inductor_1"], "order": "parallel_sub_branch", "type": "connected_by_wire"}
  ]
}

--- physics / circuit_combination / de_energizing ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_combination", "feature": "de_energizing"},
  "elements": [
    {"id": "battery_1", "label": "V", "type": "battery", "x_position": "left"},
    {"id": "switch_1", "label": "S", "type": "switch", "state": "open", "x_position": "top"},
    {"id": "resistor_1", "label": "R1", "type": "resistor", "x_position": "top"},
    {"id": "node_1", "type": "node", "x_position": "right"},
    {"id": "resistor_2", "label": "R2", "side": "top", "type": "resistor"},
    {"id": "inductor_1", "label": "L", "is_energized": true, "side": "bottom", "type": "inductor"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "switch_1", "resistor_1", "node_1"], "order": "series", "loop_closed": false},
    {"anchorId": "node_1", "elements": ["resistor_2", "inductor_1"], "order": "parallel_sub_branch", "type": "connected_by_wire"}
  ]
}

--- physics / circuit_bridge / resistors ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_bridge", "feature": "resistors"},
  "elements": [
    {"id": "battery_1", "label": "6V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R1 = 10Ω", "type": "resistor", "x_position": "top", "side": "left"},
    {"id": "resistor_2", "label": "R2 = 20Ω", "type": "resistor", "x_position": "top", "side": "right"},
    {"id": "resistor_3", "label": "R3 = 15Ω", "type": "resistor", "x_position": "bottom", "side": "left"},
    {"id": "resistor_4", "label": "R4 = 25Ω", "type": "resistor", "x_position": "bottom", "side": "right"},
    {"id": "galvanometer_1", "label": "G", "type": "galvanometer", "x_position": "center"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "resistor_1", "resistor_3"], "order": "series", "branch": "left"},
    {"type": "connected_by_wire", "elements": ["battery_1", "resistor_2", "resistor_4"], "order": "series", "branch": "right"},
    {"type": "bridges", "elements": ["galvanometer_1"], "between": ["resistor_1", "resistor_2"]}
  ]
}

--- physics / circuit_bridge / battery_and_switch ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_bridge", "feature": "battery_and_switch"},
  "elements": [
    {"id": "battery_1", "label": "V", "type": "battery", "x_position": "left"},
    {"id": "switch_1", "label": "S", "type": "switch", "state": "closed", "x_position": "bottom", "side": "left"},
    {"id": "resistor_1", "label": "R1", "type": "resistor", "x_position": "top", "side": "left"},
    {"id": "resistor_2", "label": "R2", "type": "resistor", "x_position": "top", "side": "right"},
    {"id": "resistor_3", "label": "R3", "type": "resistor", "x_position": "bottom", "side": "left"},
    {"id": "resistor_4", "label": "R4", "type": "resistor", "x_position": "bottom", "side": "right"},
    {"id": "galvanometer_1", "label": "G", "type": "galvanometer", "x_position": "center"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "switch_1"], "order": "series"},
    {"type": "connected_by_wire", "elements": ["resistor_1", "resistor_3"], "order": "series", "branch": "left"},
    {"type": "connected_by_wire", "elements": ["resistor_2", "resistor_4"], "order": "series", "branch": "right"},
    {"type": "bridges", "elements": ["galvanometer_1"], "between": ["resistor_1", "resistor_2"]}
  ]
}

--- physics / circuit_bridge / ammeter_voltmeter ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_bridge", "feature": "ammeter_voltmeter"},
  "elements": [
    {"id": "battery_1", "label": "V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R1", "type": "resistor", "x_position": "top", "side": "left"},
    {"id": "resistor_2", "label": "R2", "type": "resistor", "x_position": "top", "side": "right"},
    {"id": "resistor_3", "label": "R3", "type": "resistor", "x_position": "bottom", "side": "left"},
    {"id": "resistor_4", "label": "R4", "type": "resistor", "x_position": "bottom", "side": "right"},
    {"id": "galvanometer_1", "label": "G", "type": "galvanometer", "x_position": "center"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "resistor_1", "resistor_3"], "order": "series", "branch": "left"},
    {"type": "connected_by_wire", "elements": ["battery_1", "resistor_2", "resistor_4"], "order": "series", "branch": "right"},
    {"type": "bridges", "elements": ["galvanometer_1"], "between": ["resistor_1", "resistor_2"]}
  ]
}

--- physics / circuit_bridge / open_circuit_fault ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_bridge", "feature": "open_circuit_fault"},
  "elements": [
    {"id": "battery_1", "label": "V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R1", "type": "resistor", "x_position": "top", "side": "left", "broken": true},
    {"id": "resistor_2", "label": "R2", "type": "resistor", "x_position": "top", "side": "right"},
    {"id": "resistor_3", "label": "R3", "type": "resistor", "x_position": "bottom", "side": "left"},
    {"id": "resistor_4", "label": "R4", "type": "resistor", "x_position": "bottom", "side": "right"},
    {"id": "galvanometer_1", "label": "G", "type": "galvanometer", "x_position": "center"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "resistor_1", "resistor_3"], "order": "series", "branch": "left"},
    {"type": "connected_by_wire", "elements": ["battery_1", "resistor_2", "resistor_4"], "order": "series", "branch": "right"},
    {"type": "bridges", "elements": ["galvanometer_1"], "between": ["resistor_1", "resistor_2"]}
  ]
}

--- physics / circuit_combination / resistors ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_combination", "feature": "resistors"},
  "elements": [
    {"id": "battery_1", "label": "12V", "type": "battery", "x_position": "left"},
    {"id": "resistor_1", "label": "R1 = 4Ω", "type": "resistor", "x_position": "top"},
    {"id": "node_1", "type": "node", "x_position": "right"},
    {"id": "resistor_2", "label": "R2 = 6Ω", "type": "resistor"},
    {"id": "resistor_3", "label": "R3 = 12Ω", "type": "resistor"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1", "resistor_1", "node_1"], "order": "series", "loop_closed": true},
    {"type": "connected_by_wire", "elements": ["resistor_2", "resistor_3"], "order": "parallel_sub_branch", "anchorId": "node_1"}
  ]
}

--- physics / circuit_kirchhoff_junction / current_conservation ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_kirchhoff_junction", "feature": "current_conservation"},
  "elements": [
    {"id": "node_j", "label": "Junction", "type": "node", "x_position": "center"},
    {"id": "current_i1", "label": "$I_1 = 5\\text{ A}$", "type": "vector", "attached_to": "node_j", "angle": 180, "length": "medium"},
    {"id": "current_i2", "label": "$I_2 = 2\\text{ A}$", "type": "vector", "attached_to": "node_j", "angle": 45, "length": "short"},
    {"id": "current_i3", "label": "$I_3$", "type": "vector", "attached_to": "node_j", "angle": 315, "length": "short"}
  ],
  "relationships": [
    {"type": "current_conservation_at_node", "elements": ["node_j"], "incoming": ["current_i1"], "outgoing": ["current_i2", "current_i3"]}
  ]
}

--- physics / circuit_meter_bridge / null_point ---
"visual": {
  "figure": {"type": "physics", "subtype": "circuit_meter_bridge", "feature": "null_point"},
  "elements": [
    {"id": "battery_1", "label": "V", "type": "battery", "x_position": "bottom"},
    {"id": "resistor_r", "label": "R = ?", "type": "resistor", "side": "left", "x_position": "top"},
    {"id": "resistor_s", "label": "S = 5Ω", "type": "resistor", "side": "right", "x_position": "top"},
    {"id": "galvanometer_1", "label": "G", "type": "galvanometer", "x_position": "center"},
    {"id": "meter_wire", "label": "100 cm", "type": "wire", "length": 100, "x_position": "bottom"},
    {"id": "null_point", "label": "40 cm", "type": "point", "x_position": "mid_left"}
  ],
  "relationships": [
    {"type": "connected_by_wire", "elements": ["battery_1"], "order": "series"},
    {"type": "connected_by_wire", "elements": ["resistor_r", "resistor_s"], "order": "parallel_branch", "shares_nodes": true},
    {"type": "bridges", "elements": ["galvanometer_1"], "between": ["resistor_r", "meter_wire"]},
    {"type": "is_connected_to_jockey", "elements": ["galvanometer_1"], "target": "null_point"}
  ]
}

--- physics / ray_diagram_lens / convex ---
"visual": {
  "figure": {"type": "physics", "subtype": "ray_diagram_lens", "feature": "convex"},
  "elements": [
    {"id": "lens_1", "label": "Convex Lens", "type": "lens", "focal_length": 10},
    {"id": "object_1", "label": "Object", "type": "object_arrow", "height": 5, "distance_from_lens": 25, "side": "left"},
    {"id": "F1", "label": "F", "type": "focal_point", "side": "left"},
    {"id": "F2", "label": "F", "type": "focal_point", "side": "right"},
    {"id": "2F1", "label": "2F", "type": "focal_point", "side": "left", "show": false},
    {"id": "2F2", "label": "2F", "type": "focal_point", "side": "right", "show": false}
  ],
  "relationships": [
    {"type": "forms_image_of", "elements": ["object_1"], "via": "lens_1", "show_image": true},
    {"type": "ray_construction", "rays": ["parallel_to_axis", "through_center", "through_focal_point"], "elements": ["object_1", "lens_1"]}
  ]
}

--- physics / ray_diagram_mirror / concave ---
"visual": {
  "figure": {"type": "physics", "subtype": "ray_diagram_mirror", "feature": "concave"},
  "elements": [
    {"id": "mirror_1", "label": "Concave Mirror", "type": "mirror", "focal_length": 10},
    {"id": "object_1", "label": "Object", "type": "object_arrow", "height": 5, "distance_from_mirror": 30, "side": "left"},
    {"id": "F1", "label": "F", "type": "focal_point", "side": "left"},
    {"id": "C1", "label": "C", "type": "center_of_curvature", "side": "left"}
  ],
  "relationships": [
    {"type": "forms_image_of", "elements": ["object_1"], "via": "mirror_1", "show_image": true},
    {"type": "ray_construction", "rays": ["parallel_to_axis", "through_center_of_curvature", "through_focal_point"], "elements": ["object_1", "mirror_1"]}
  ]
}

--- physics / refraction / plane ---
"visual": {
  "figure": {"type": "physics", "subtype": "refraction", "feature": "plane"},
  "elements": [
    {"id": "medium_1", "label": "Air (n=1.0)", "type": "medium", "index": 1.0, "side": "top"},
    {"id": "medium_2", "label": "Glass (n=1.5)", "type": "medium", "index": 1.5, "side": "bottom"},
    {"id": "incident_ray_1", "label": "Incident Ray", "type": "ray", "angle": 40, "role": "incident"},
    {"id": "normal_1", "label": "Normal", "type": "normal_line"}
  ],
  "relationships": [
    {"type": "refracts_at_boundary", "elements": ["incident_ray_1"], "between": ["medium_1", "medium_2"]},
    {"type": "boundary_shape", "value": "single"}
  ]
}

--- physics / refraction / plane ---
"visual": {
  "figure": {"type": "physics", "subtype": "refraction", "feature": "plane"},
  "elements": [
    {"id": "medium_1", "label": "Air (n=1.0)", "type": "medium", "index": 1.0, "side": "outer"},
    {"id": "medium_2", "label": "Glass (n=1.5)", "type": "medium", "index": 1.5, "side": "inner"},
    {"id": "incident_ray_1", "label": "Incident Ray", "type": "ray", "angle": 35, "role": "incident"},
    {"id": "normal_1", "label": "Normal", "type": "normal_line"}
  ],
  "relationships": [
    {"type": "refracts_at_boundary", "elements": ["incident_ray_1"], "between": ["medium_1", "medium_2"]},
    {"type": "boundary_shape", "value": "slab", "thickness": 5}
  ]
}

--- physics / total_internal_reflection / none ---
"visual": {
  "figure": {"type": "physics", "subtype": "total_internal_reflection", "feature": "none"},
  "elements": [
    {"id": "medium_1", "label": "Glass (n=1.5)", "type": "medium", "index": 1.5, "side": "bottom"},
    {"id": "medium_2", "label": "Air (n=1.0)", "type": "medium", "index": 1.0, "side": "top"},
    {"id": "incident_ray_1", "label": "Incident Ray", "type": "ray", "angle": 50, "role": "incident"}
  ],
  "relationships": [
    {"type": "reflects_or_refracts_at_boundary", "elements": ["incident_ray_1"], "between": ["medium_1", "medium_2"], "show_partial_reflection": true}
  ]
}

--- physics / reflection / plane ---
"visual": {
  "figure": {"type": "physics", "subtype": "reflection", "feature": "plane"},
  "elements": [
    {"id": "mirror_1", "label": "Plane Mirror", "type": "mirror"},
    {"id": "normal_1", "label": "Normal", "type": "normal_line"},
    {"id": "incident_ray_1", "label": "Incident Ray", "type": "ray", "role": "incident", "angle": 35},
    {"id": "reflected_ray_1", "label": "Reflected Ray", "type": "ray", "role": "reflected"},
    {"id": "angle_i", "label": "$\\theta_i = 35^\\circ$", "type": "angle", "start_element": "incident_ray_1", "end_element": "normal_1", "value": "35"},
    {"id": "angle_r", "label": "$\\theta_r$", "type": "angle", "start_element": "reflected_ray_1", "end_element": "normal_1"}
  ],
  "relationships": [
    {"type": "reflects_at_boundary", "elements": ["incident_ray_1", "reflected_ray_1"], "via": "mirror_1", "show_reflected_ray": true}
  ]
}

--- physics / ray_diagram_mirror / plane ---
"visual": {
  "figure": {"type": "physics", "subtype": "ray_diagram_mirror", "feature": "plane"},
  "elements": [
    {"id": "mirror_1", "label": "Plane Mirror", "type": "mirror"},
    {"id": "object_1", "label": "Object", "type": "object_arrow", "height": 4, "distance_from_mirror": 6, "side": "left"}
  ],
  "relationships": [
    {"type": "forms_image_of", "elements": ["object_1"], "via": "mirror_1", "show_image": true},
    {"type": "ray_construction", "style": "standard", "elements": ["object_1", "mirror_1"], "rays": ["perpendicular_to_mirror", "oblique_to_mirror"]}
  ]
}

--- physics / prism / deviation ---
"visual": {
  "figure": {"type": "physics", "subtype": "prism", "feature": "deviation"},
  "elements": [
    {"id": "prism_1", "label": "Glass Prism ($n=1.5$)", "type": "prism", "index": 1.5, "apex_angle": 60},
    {"id": "incident_ray_1", "label": "Incident Ray", "type": "ray", "role": "incident", "angle": 40},
    {"id": "angle_A", "label": "$A = 60^\\circ$", "type": "angle", "at": "apex", "value": "60"}
  ],
  "relationships": [
    {"type": "refracts_through", "elements": ["incident_ray_1"], "via": "prism_1", "condition": "general", "show_emergent_ray": true, "show_deviation": false}
  ]
}

--- physics / prism / dispersion ---
"visual": {
  "figure": {"type": "physics", "subtype": "prism", "feature": "dispersion"},
  "elements": [
    {"id": "prism_1", "label": "Glass Prism", "type": "prism", "apex_angle": 60},
    {"id": "incident_ray_1", "label": "White Light", "type": "ray", "role": "incident", "color": "white", "angle": 45},
    {"id": "screen_1", "label": "Screen", "type": "screen"}
  ],
  "relationships": [
    {"type": "disperses", "elements": ["incident_ray_1"], "via": "prism_1", "show_spectrum": true, "label_colors": true}
  ]
}

--- physics / human_eye / structure ---
"visual": {
  "figure": {"type": "physics", "subtype": "human_eye", "feature": "structure"},
  "elements": [
    {"id": "part_1", "part": "cornea", "label": "A", "type": "eye_part"},
    {"id": "part_2", "part": "iris", "label": "B", "type": "eye_part"},
    {"id": "part_3", "part": "retina", "label": "C", "type": "eye_part"}
  ],
  "relationships": [
    {"type": "labels_parts", "elements": ["part_1", "part_2", "part_3"], "show_labels": true}
  ]
}

--- physics / human_eye / myopia ---
"visual": {
  "figure": {"type": "physics", "subtype": "human_eye", "feature": "myopia"},
  "elements": [
    {"id": "eye_1", "label": "Eye", "type": "eye"},
    {"id": "object_1", "label": "Distant Object", "type": "object_arrow", "side": "left", "distance_label": "$100\\text{ cm}$"},
    {"id": "retina_1", "label": "Retina", "type": "retina"},
    {"id": "corrective_lens_1", "label": "Concave Lens", "type": "lens", "shape": "concave", "role": "corrective"}
  ],
  "relationships": [
    {"type": "forms_image_of", "elements": ["object_1"], "via": "eye_1", "show_image": true},
    {"type": "corrected_by", "elements": ["eye_1", "corrective_lens_1"], "show_correction": false}
  ]
}

--- physics / optical_instrument / simple_microscope ---
"visual": {
  "figure": {"type": "physics", "subtype": "optical_instrument", "feature": "simple_microscope"},
  "elements": [
    {"id": "lens_1", "label": "Convex Lens", "type": "lens", "focal_length": 5},
    {"id": "object_1", "label": "Object", "type": "object_arrow", "height": 2, "distance_from_lens": 4, "side": "left"},
    {"id": "F1", "label": "F", "type": "focal_point", "side": "left"},
    {"id": "eye_1", "label": "Eye", "type": "observer", "side": "right"}
  ],
  "relationships": [
    {"type": "forms_image_of", "elements": ["object_1"], "via": "lens_1", "show_image": true},
    {"type": "ray_construction", "style": "standard", "elements": ["object_1", "lens_1"], "rays": ["parallel_to_axis", "through_center"]}
  ]
}

--- physics / optical_instrument / compound_microscope ---
"visual": {
  "figure": {"type": "physics", "subtype": "optical_instrument", "feature": "compound_microscope"},
  "elements": [
    {"id": "objective_1", "label": "Objective", "type": "lens", "role": "objective", "focal_length": 1},
    {"id": "eyepiece_1", "label": "Eyepiece", "type": "lens", "role": "eyepiece", "focal_length": 5},
    {"id": "object_1", "label": "Object", "type": "object_arrow", "height": 1, "distance_from_lens": 1.5, "side": "left"}
  ],
  "relationships": [
    {"type": "lens_separation", "elements": ["objective_1", "eyepiece_1"], "distance": 12},
    {"type": "forms_image_of", "elements": ["object_1"], "via": "objective_1", "result_id": "image_1", "show_image": true},
    {"type": "forms_image_of", "elements": ["image_1"], "via": "eyepiece_1", "result_id": "image_2", "show_image": true}
  ]
}

--- physics / optical_instrument / astronomical_telescope ---
"visual": {
  "figure": {"type": "physics", "subtype": "optical_instrument", "feature": "astronomical_telescope"},
  "elements": [
    {"id": "objective_1", "label": "Objective", "type": "lens", "role": "objective", "focal_length": 100},
    {"id": "eyepiece_1", "label": "Eyepiece", "type": "lens", "role": "eyepiece", "focal_length": 5},
    {"id": "source_1", "label": "Distant Object", "type": "distant_source"}
  ],
  "relationships": [
    {"type": "lens_separation", "elements": ["objective_1", "eyepiece_1"], "distance": 105},
    {"type": "adjustment", "elements": ["eyepiece_1"], "value": "normal"},
    {"type": "forms_image_of", "elements": ["source_1"], "via": "objective_1", "result_id": "image_1", "show_image": true},
    {"type": "forms_image_of", "elements": ["image_1"], "via": "eyepiece_1", "result_id": "image_2", "show_image": true}
  ]
}

--- physics / electric_field / point_charge ---
"visual": {
  "figure": {"type": "physics", "subtype": "electric_field", "feature": "point_charge"},
  "elements": [
    {"id": "charge_1", "label": "Q", "type": "charge", "charge_type": "negative"}
  ],
  "relationships": []
}

--- physics / electric_field / point_charge ---
"visual": {
  "figure": {"type": "physics", "subtype": "electric_field", "feature": "point_charge"},
  "elements": [
    {"id": "charge_q1", "label": "$Q_1 = +5.0 \\times 10^{-6}\\text{ C}$", "type": "point_charge", "charge_type": "positive", "value": 5e-06, "x_position": 0, "y_position": 0},
    {"id": "point_p", "label": "P", "type": "point", "x_position": 0.3, "y_position": 0},
    {"id": "electric_field_vector", "label": "$E$", "type": "vector", "attached_to": "point_p", "angle": 0, "length": "medium"},
    {"id": "segment_r", "label": "$r = 0.30\\text{ m}$", "type": "segment", "value": 0.3}
  ],
  "relationships": [
    {"type": "field_due_to_charge", "elements": ["electric_field_vector"], "source_charge": "charge_q1", "at_point": "point_p"},
    {"type": "forms_segment", "elements": ["charge_q1", "point_p"], "target": "segment_r"}
  ]
}

--- physics / electric_field / two_point_charges ---
"visual": {
  "figure": {"type": "physics", "subtype": "electric_field", "feature": "two_point_charges"},
  "elements": [
    {"id": "charge_a", "label": "$Q_1$", "type": "point_charge", "charge_type": "positive"},
    {"id": "charge_b", "label": "$Q_2$", "type": "point_charge", "charge_type": "negative"}
  ],
  "relationships": [
    {"type": "field_lines_between_charges", "elements": ["charge_a", "charge_b"], "direction": "from_a_to_b"}
  ]
}

--- physics / electric_field / two_point_charges ---
"visual": {
  "figure": {"type": "physics", "subtype": "electric_field", "feature": "two_point_charges"},
  "elements": [
    {"id": "charge_q1", "label": "$Q_1 = +2\\text{ nC}$", "type": "point_charge", "charge_type": "positive", "value": 2e-09, "x_position": 0, "y_position": 0},
    {"id": "charge_q2", "label": "$Q_2 = -4\\text{ nC}$", "type": "point_charge", "charge_type": "negative", "value": -4e-09, "x_position": 3, "y_position": 0},
    {"id": "axis_x", "label": "x-axis", "type": "axis", "orientation": "horizontal", "min": -2, "max": 5}
  ],
  "relationships": []
}

--- physics / electric_field / field_lines_between_charges ---
"visual": {
  "figure": {"type": "physics", "subtype": "electric_field", "feature": "field_lines_between_charges"},
  "elements": [
    {"id": "charge_q1", "label": "$Q_1$", "type": "point_charge", "charge_type": "positive", "relative_magnitude": "stronger"},
    {"id": "charge_q2", "label": "$Q_2$", "type": "point_charge", "charge_type": "negative", "relative_magnitude": "weaker"}
  ],
  "relationships": [
    {"type": "shows_field_lines_between", "elements": ["charge_q1", "charge_q2"]},
    {"type": "magnitude_comparison", "elements": ["charge_q1", "charge_q2"], "relationship": "greater_than"}
  ]
}

--- physics / electric_field / field_lines_between_charges ---
"visual": {
  "figure": {"type": "physics", "subtype": "electric_field", "feature": "field_lines_between_charges"},
  "elements": [
    {"id": "plate_pos", "label": "+", "type": "plate", "charge_type": "positive", "side": "top"},
    {"id": "plate_neg", "label": "-", "type": "plate", "charge_type": "negative", "side": "bottom"}
  ],
  "relationships": [
    {"type": "creates_uniform_field", "elements": ["plate_pos", "plate_neg"], "direction": "down"}
  ]
}

--- physics / magnetic_field / bar_magnet ---
"visual": {
  "figure": {"type": "physics", "subtype": "magnetic_field", "feature": "bar_magnet"},
  "elements": [
    {"id": "magnet_1", "label": "Bar Magnet", "type": "bar_magnet", "pole_orientation": "horizontal"}
  ],
  "relationships": [
    {"elements": ["magnet_1"], "type": "shows_field_lines"}
  ]
}

--- physics / magnetic_field / current_carrying_wire ---
"visual": {
  "figure": {"type": "physics", "subtype": "magnetic_field", "feature": "current_carrying_wire"},
  "elements": [
    {"id": "wire_1", "label": "I", "type": "current_wire", "orientation": "vertical", "current_direction": "up"}
  ],
  "relationships": [
    {"elements": ["wire_1"], "type": "shows_field_lines"}
  ]
}

--- physics / magnetic_field / solenoid ---
"visual": {
  "figure": {"type": "physics", "subtype": "magnetic_field", "feature": "solenoid"},
  "elements": [
    {"id": "solenoid_1", "label": "Solenoid", "type": "solenoid", "orientation": "horizontal", "current_direction": "counterclockwise", "turns": 6}
  ],
  "relationships": [
    {"elements": ["solenoid_1"], "type": "shows_field_lines"}
  ]
}

--- physics / magnetic_field / force_on_moving_charge ---
"visual": {
  "figure": {"type": "physics", "subtype": "magnetic_field", "feature": "force_on_moving_charge"},
  "elements": [
    {"id": "charge_1", "label": "$q$", "type": "moving_charge", "charge_type": "positive"},
    {"id": "velocity_vector", "label": "$v$", "type": "vector", "attached_to": "charge_1", "angle": 0, "length": "medium"},
    {"id": "field_indicator", "label": "$B$", "type": "field_into_page", "region": "background"}
  ],
  "relationships": [
    {"elements": ["charge_1", "velocity_vector"], "type": "moves_with_velocity"},
    {"elements": ["charge_1"], "target": "field_indicator", "type": "moves_through_field"}
  ]
}

--- physics / magnetic_field / force_on_current_carrying_wire ---
"visual": {
  "figure": {"type": "physics", "subtype": "magnetic_field", "feature": "force_on_current_carrying_wire"},
  "elements": [
    {"id": "wire_1", "label": "I", "type": "current_wire", "orientation": "horizontal", "current_direction": "right"},
    {"id": "field_indicator", "label": "$B$", "type": "field_into_page", "region": "background"}
  ],
  "relationships": [
    {"elements": ["wire_1"], "target": "field_indicator", "type": "carries_current_through_field"}
  ]
}

--- chemistry / lewis_structure / none ---
"visual": {
  "figure": {"type": "chemistry", "subtype": "lewis_structure", "feature": "none"},
  "elements": [
    {"id": "atom_o", "type": "atom", "element": "O", "label": "O", "x_position": "center"},
    {"id": "atom_h1", "type": "atom", "element": "H", "label": "H", "x_position": "left"},
    {"id": "atom_h2", "type": "atom", "element": "H", "label": "H", "x_position": "right"},
    {"id": "bond_o_h1", "type": "bond", "bond_order": 1, "between": ["atom_o", "atom_h1"]},
    {"id": "bond_o_h2", "type": "bond", "bond_order": 1, "between": ["atom_o", "atom_h2"]},
    {"id": "lone_pairs_o", "type": "lone_pairs", "on_atom": "atom_o", "count": 2}
  ],
  "relationships": []
}

--- chemistry / molecular_2d / formal_charge ---
"visual": {
  "figure": {"type": "chemistry", "subtype": "molecular_2d", "feature": "formal_charge"},
  "elements": [
    {"id": "atom_n", "label": "N", "type": "atom", "x_position": "center"},
    {"id": "atom_h1", "label": "H", "type": "atom", "side": "top_left"},
    {"id": "atom_h2", "label": "H", "type": "atom", "side": "top_right"},
    {"id": "atom_h3", "label": "H", "type": "atom", "side": "bottom_left"},
    {"id": "atom_h4", "label": "H", "type": "atom", "side": "bottom_right"}
  ],
  "relationships": [
    {"bond_type": "single", "elements": ["atom_n", "atom_h1"], "type": "forms_bond"},
    {"bond_type": "single", "elements": ["atom_n", "atom_h2"], "type": "forms_bond"},
    {"bond_type": "single", "elements": ["atom_n", "atom_h3"], "type": "forms_bond"},
    {"bond_type": "single", "elements": ["atom_n", "atom_h4"], "type": "forms_bond"},
    {"formal_charge": 1, "elements": ["atom_n"], "type": "has_formal_charge"}
  ]
}

--- chemistry / molecular_2d / resonance_structures ---
"visual": {
  "figure": {"type": "chemistry", "subtype": "molecular_2d", "feature": "resonance_structures"},
  "elements": [
    {"id": "s1_atom_o1", "label": "O", "type": "atom", "x_position": "left", "structure_group": 1},
    {"id": "s1_atom_o2", "label": "O", "type": "atom", "x_position": "center", "structure_group": 1},
    {"id": "s1_atom_o3", "label": "O", "type": "atom", "x_position": "right", "structure_group": 1},
    {"id": "s2_atom_o1", "label": "O", "type": "atom", "x_position": "left", "structure_group": 2},
    {"id": "s2_atom_o2", "label": "O", "type": "atom", "x_position": "center", "structure_group": 2},
    {"id": "s2_atom_o3", "label": "O", "type": "atom", "x_position": "right", "structure_group": 2}
  ],
  "relationships": [
    {"bond_type": "double", "elements": ["s1_atom_o1", "s1_atom_o2"], "type": "forms_bond"},
    {"bond_type": "single", "elements": ["s1_atom_o2", "s1_atom_o3"], "type": "forms_bond"},
    {"count": 2, "elements": ["s1_atom_o1"], "type": "has_lone_pairs"},
    {"count": 3, "elements": ["s1_atom_o3"], "type": "has_lone_pairs"},
    {"formal_charge": -1, "elements": ["s1_atom_o3"], "type": "has_formal_charge"},
    {"bond_type": "single", "elements": ["s2_atom_o1", "s2_atom_o2"], "type": "forms_bond"},
    {"bond_type": "double", "elements": ["s2_atom_o2", "s2_atom_o3"], "type": "forms_bond"},
    {"count": 3, "elements": ["s2_atom_o1"], "type": "has_lone_pairs"},
    {"count": 2, "elements": ["s2_atom_o3"], "type": "has_lone_pairs"},
    {"formal_charge": -1, "elements": ["s2_atom_o1"], "type": "has_formal_charge"},
    {"elements": [1, 2], "type": "resonance_between"}
  ],
  "overall_charge": -1
}

--- chemistry / molecular_geometry / vsepr_shape ---
"visual": {
  "figure": {"type": "chemistry", "subtype": "molecular_geometry", "feature": "vsepr_shape", "electron_geometry": "tetrahedral"},
  "elements": [
    {"id": "atom_n", "label": "N", "type": "atom", "position_role": "center"},
    {"id": "atom_h1", "label": "H", "type": "atom", "position_role": "plane_left"},
    {"id": "atom_h2", "label": "H", "type": "atom", "position_role": "plane_right"},
    {"id": "atom_h3", "label": "H", "type": "atom", "position_role": "wedge"},
    {"id": "lone_pair_n", "type": "lone_pair", "on_atom": "atom_n", "position_role": "dash"}
  ],
  "relationships": [
    {"bond_type": "single", "elements": ["atom_n", "atom_h1"], "type": "forms_bond"},
    {"bond_type": "single", "elements": ["atom_n", "atom_h2"], "type": "forms_bond"},
    {"bond_type": "single", "elements": ["atom_n", "atom_h3"], "type": "forms_bond"}
  ]
}

--- chemistry / molecular_geometry / bond_angle ---
"visual": {
  "figure": {"type": "chemistry", "subtype": "molecular_geometry", "feature": "bond_angle", "electron_geometry": "trigonal_planar"},
  "elements": [
    {"id": "atom_c", "label": "C", "position_role": "center", "type": "atom"},
    {"id": "atom_o1", "label": "O", "position_role": "top", "type": "atom"},
    {"id": "atom_o2", "label": "O", "position_role": "bottom_left", "type": "atom"},
    {"id": "atom_h", "label": "H", "position_role": "bottom_right", "type": "atom"}
  ],
  "relationships": [
    {"bond_type": "double", "elements": ["atom_c", "atom_o1"], "type": "forms_bond"},
    {"bond_type": "single", "elements": ["atom_c", "atom_o2"], "type": "forms_bond"},
    {"bond_type": "single", "elements": ["atom_c", "atom_h"], "type": "forms_bond"},
    {"id": "angle_marker", "elements": ["atom_o2", "atom_c", "atom_h"], "type": "marks_bond_angle"}
  ]
}

Optics contract notes:
- Lens/mirror object distance and focal_length determine the case; do not pre-classify it.
- boundary_shape.value slab uses thickness in the common unit; the exiting ray returns to the outer medium.
- Prism condition: general or minimum_deviation; the latter may omit ray angle. label_colors false when identifying colours by deviation.
- Eye part names: cornea, aqueous_humour, iris, pupil, lens, ciliary_muscles, vitreous_humour, retina, optic_nerve, sclera, blind_spot, fovea.
- Eye focus is derived from feature and show_correction; distance_label is present only when given.
- In compound instruments, result_id chains the objective image to the eyepiece; object distance is from the objective.
- Telescope adjustment: normal (separation fo+fe) or near_point.
'''.strip()


# 7. OUTPUT: JSON envelope/serialization rules live only here.
OUTPUT_CONTRACT = r'''
# OUTPUT CONTRACT
Return one valid JSON object with a data array containing exactly the requested number of questions. No Markdown fences, comments, trailing text or extra questions.
Each question has question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, visual_required and visual_type. Add visual only when visual_required is true.
visual_type mapping by figure.type:
- geometry: triangle, trapezoid, parallelogram, quadrilateral, circle, polygon, coordinate_geometry, fraction_model, parallel_lines, solid_geometry, composite_geometry, symmetry, mapping_diagram
- data_table: table
- chart: chart
- graph: graph
- venn_diagram: venn_diagram
- physics: physics
- chemistry: chemistry
For nonvisual questions, visual_type is null.
Example envelope containing one nonvisual question:
{"data":[{"question_text":"What is $2+3$?","option_a":"4","option_b":"5","option_c":"6","option_d":"7","correct_answer":"B","explanation":"$2+3=5$.","visual_required":false,"visual_type":null}]}
'''.strip()


# 8. BUILDERS: request-specific values only; do not duplicate static rules here.
def build_analysis_prompt(content, language):
    return f"""Analyze the following educational content in {language}.
Use any supplied headings, tables, figures and equations.
Return concise structured notes covering topics, keywords, definitions,
processes, relationships, examples, formulas and important numerical facts.
Preserve meaning rather than copying sentences.

Content:
{content}
"""


def build_question_prompt(
    *,
    content: str,
    language: str,
    difficulty: str,
    blooms_level: str,
    question_count: int,
) -> str:
    """Place shared instructions before request-specific content."""

    blooms_instruction = BLOOMS_PROMPTS.get(
        blooms_level.strip().lower(),
        BLOOMS_PROMPTS["mixed"],
    )

    # FIXED PREFIX: identical across requests using this prompt version.
    shared_prompt = "\n\n".join((
        "You are an expert educational assessment question generator.",
        GENERAL_RULES,
        SHARED_VISUAL_RULES,
        VISUAL_TAXONOMY,
        GEOMETRY_RULES,
        SOLID_RULES,
        DATA_RULES,
        PHYSICS_RULES,
        CHEMISTRY_RULES,
        FRACTION_RULES,
        COMPOSITE_RULES,
        SYMMETRY_RULES,
        MAPPING_RULES,
        TRIGONOMETRY_RULES,
        PARALLEL_LINES_RULES,
        VISUAL_EXAMPLES,
        OUTPUT_CONTRACT,
    ))

    # VARIABLE SUFFIX: teacher settings and source belong last.
    request = (
        "# CURRENT REQUEST\n"
        f"LANGUAGE: {language}\n"
        f"DIFFICULTY: {difficulty}\n"
        f"BLOOM LEVEL: {blooms_level}\n"
        f"{blooms_instruction}\n"
        f"QUESTION COUNT: {question_count}"
    )

    return "\n\n".join((
        shared_prompt,
        request,
        "# SOURCE CONTENT\n" + (content or ""),
    ))
