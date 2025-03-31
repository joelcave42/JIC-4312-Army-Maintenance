import React, { useState, useMemo } from "react";
import {useNavigate, useParams} from "react-router-dom";
import "../styles/FaultSubmissionForm.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  changeStatusListener,
  resetInputValues,
} from "../features/globalValues/globalSlice";
import { store } from "../store";
import { toast } from "react-toastify";

const FaultSubmissionForm = ({ isReopenMode }) => {
  const navigate = useNavigate();
  const { faultId } = useParams();
  const { inputValues, username } = useSelector((state) => state.globalValues);
  const dispatch = useDispatch();
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Add console logging to debug username
  console.log('Current username:', username);

  // Define vehicle types with their maintenance procedures
  const vehicleTypes = {
    HMMWV: {
      name: "HMMWV (M998 Series)",
      timelines: {
        semiannual: {
          id: "semiannual",
          name: "Semi-Annual",
          inspectionGroups: [
            {
              title: "HMMWV PMCS NOT COMPLETED. ONLY PARTIALLY FILLED OUT FOR DEMO REASONS. COMPLETE BEFORE USING.",
              items: [
                
              ]
            },
            {
              title: "Pre-Service Checks",
              disclaimers: [
                "PRIOR TO ROAD TEST: Ensure Operator/Crew has performed PMCS listed in TM 9-2320-280-10.",
                "ROAD TEST: Maintenance personnel will be with vehicle operator to assist in perfomring PMCS checks and verify pre-service checks."
              ],
              items: [
                {
                  id: "1_Pre-Service Checks_a",
                  procedure: "Notice if starter engages smoothly and turns the engine at normal cranking speed.",
                  criteria: "Starter inoperative or makes excessive grinding sound."
                },
                {
                  id: "1_Pre-Service Checks_b",
                  procedure: "Listen for unusual noise at idle, at operating speed, and under acceleration. Be alert for excessive vibration and the smell of oil, fuel, and exhaust.",
                  criteria: "Engine knocks, rattles, or smokes excessively."
                },
                {
                  id: "1_Pre-Service Checks_c",
                  procedure: "Check for transmission response to shifting and for smoothness of operation in all gear ranges. Be alert for unusual noises and difficulty in shifting in any speed range. <strong>NOTE:</strong> If desired range cannot be selected, turn engine off, select range, and re-start engine.",
                  criteria: "Transmission shifts improperly, does not shift, or makes excessive noise."
                },
                {
                  id: "1_Pre-Service Checks_d",
                  procedure: "Check for transfer response to shifting and for smoothness of operation in all gear ranges. Be alert for unusual noises and difficulty in shifting in any gear range.",
                  criteria: "Lever inoperable or does not engage in all ranges with engine not running."
                },
                {
                  id: "1_Pre-Service Checks_e",
                  procedure: "Test for response to accelerator feed. Observe for sticking pedal.",
                  criteria: "Pedal sticking or binding."
                },
                {
                  id: "1_Pre-Service Checks_f",
                  procedure: "With vehicle speed approximately 5 mph (8 kph) turn steering wheel to left, then right, to detect hard steering, steering backlash, or shimmy. Vehicle should respond instantly. With vehicle moving on straight, level terrain, lightly hold steering wheel to check for pull and wandering.",
                  criteria: "Steering binds, grabs, wanders, or has excessive freeplay."
                },
                {
                  id: "1_Pre-Service Checks_g",
                  procedure: "Apply brake pedal with steady force. Vehicle should slow and stop without pulling to one side or jerking. Release brake pedal. The brakes should release immediately and without difficulty.",
                  criteria: "Brakes chatter, pull to one side, or inoperative. Brakes will not release."
                },
                {
                  id: "1_Pre-Service Checks_h",
                  procedure: "Bring vehicle to full stop. Engage parking brake while transmission is still in \"D\" (drive) or overdrive for A2 series vehicles. Vehicle should remain stationary.",
                  criteria: "Parking brake doesn't hold vehicle stationary."
                },
                {
                  id: "1_Pre-Service Checks_i",
                  procedure: "Observe vehicle response to road shock. Side sway or continuous bouncing indicates a malfunction.",
                  criteria: null
                },
              ]
            },
            {
              title: "Body",
              disclaimers: [
                "AFTER ROAD TEST"
              ],
              items: [
                {
                  id: "2_Body_a",
                  procedure: "Make sure the vehicle has been cleaned of mud, gravel, etc., from the underbody, outside, and crew compartment area.",
                  criteria: null
                },
                {
                  id: "2_Body_b",
                  procedure: "Thoroughly wash all underbody sheet metal panels and corners. <strong>NOTE:</strong> Lubrcate vehicle in accordance with Lubrication Table.",
                  criteria: null
                },
                {
                  id: "2_Body_c",
                  procedure: "Inspect for loose rivets, cracks, loose or missing bolts and general body damage.",
                  criteria: "Any body damage that would hinder vehicle operation."
                }
              ]
            },
            {
              title: "Fuel System",
              items: [
                {
                  id: "3_Fuel-System_a",
                  procedure: "Inspect fuel filter/water seperator assembly for dents and cracks that could cause leaks.",
                  criteria: "Any class III fuel leak."
                },
                {
                  id: "3_Fuel-System_b",
                  procedure: "Inspect fuel injection pump, nozzle lines, and fittings for leaks and damage.",
                  criteria: "Any class III leak. Any nozzle loose or damaged."
                },
                {
                  id: "3_Fuel-System_c",
                  procedure: "Inspect rear fuel injector nozzle rubber cap for presence and condition.",
                  criteria: "Rubber cap missing or damaged.",
                  image: "/images/3-c.png"
                },
                {
                  id: "3_Fuel-System_d",
                  procedure: "Inspect all fuel lines for loose connections, splits, cracks, and bends that could leak.",
                  criteria: "Any class III leak."
                },
                {
                  id: "3_Fuel-System_e",
                  procedure: "Disconnect leads from each glow plug (paragraph 3-38) and check for resistance between glow plug terminal and ground. Continuity should be present.",
                  criteria: "Continuity is not present."
                },
                {
                  id: "3_Fuel-System_f",
                  procedure: "Check each glow plug for looseness and damage. Tighten each plug to 8-12 lb-ft (11-16 N*m).",
                  criteria: "Glow plugs are loose or damaged."
                },
                {
                  id: "3_Fuel-System_g",
                  procedure: "Check locknut on body mounts. Proper torque 90 lb-ft (122 N*m).",
                  criteria: "Body mounts loose."
                },
                {
                  id: "3_Fuel-System_h",
                  procedure: "Check the fuel tank for propeller shaft rub marks and damage. Ensure straps are properly installed in fuel tank slots. Tighten strap locknuts to 23-27 lb-in. (2.6-3 N*m).",
                  criteria: "Any class III fuel leak or tank strap improperly installed or loose."
                }
              ]
            },
            {
              title: "Engine Accessory Drive and Serpentine Belt",
              items: [
                {
                  id: "4_Engine-Accessory-Drive-and-Serpentine-Belt_a",
                  procedure: "Check for missing, broken, cracked, and frayed drivebelts. Ensure serpentine drivebelt has not moved out of place on pulley.",
                  criteria: "Any drivebelt is missing, broken, frayed, or dry-rotted. Belt fiber has more than one crack 1/8 in. (3.2 mm) in depth or 50% of of belt thickness) or has frays more than 2 in. (51 mm) long. Serpentine belt has moved out of place on pulleys."
                },
                {
                  id: "4_Engine-Accessory-Drive-and-Serpentine-Belt_b",
                  procedure: "(All models except M1123 and \"A2\" vehicles). Check all drivebelts tension using belt tension gauge. Belt tension should be 70 lbs (311 N) minimum. If belt tension is not at least 70 lbs (311 N), adjust drivebelts (paragraph 3-82). Tension should not be greater than 110 lbs (489 N) for new belts; old belts 95 lbs (422 N).",
                  criteria: "Tension below 70 lbs (311 N), or greater than 110 lbs (489 N) new belt and 95 lbs (422 N) old belts."
                },
              ]
            },
            {
              title: "Protective Control Box",
              items: [
                {
                  id: "5_Protective-Control-Box_a",
                  procedure: "Inspect four nuts for security of mounting.",
                  criteria: "Mounting not secure, four nuts loose."
                },
                {
                  id: "5_Protective-Control-Box_b",
                  procedure: "Ensure cannon plugs are securely connected to box.",
                  criteria: null,
                  image: "/images/5-b.png"
                },
              ]
            },
            {
              title: "Cooling System",
              disclaimers: [
                "WARNING: If vehicle has been operating, use extreme care to avoid being burned when removing cooling system radiator cap. Use heavy rags or gloves to protect hands. Turn radiator cap only one-half turn counterclockwise and allow pressure to be released before fully removing cap.",
                "NOTE: Coolant level is correct when coolant recovery tank is full TM 9-2320-28-10).",
                "NOTE: Use MIL-A-46153 in temperatures above 0°F (-18°C) and MIL-A-11755 in termperate below 0°F (-18°C)."
              ],
              items: [
                {
                  id: "6_Cooling-System_a",
                  procedure: "Check coolant condition. Test cooolant to see if draining is necessary (TB 750-651).",
                  criteria: "Coolant condition/testing shows draining is required."
                },
                {
                  id: "6_Cooling-System_b",
                  procedure: "Inspect surge tank, radiator shroud, power steering cooler, oil cooler, all hoses, quick disconnects and fittings for security of mounting, leaks, and deterioration. Inspect and clean as necessary the radiator and oil cooler cores.",
                criteria: "Any class III water leak. Hoses cracked or dry rotted."
                },
              ]
            },
            {
              title: "Air-Intake System",
              disclaimers: [
                "WARNING: If NBC exposure is suspected, all air filter media should be handled by personnel wearing protective equipment. Consult your unit NBC officer or NBC NCO for appropriate handling or disposal instructions.",
              ],
              items: [
                {
                  id: "7_Air-Intake-System_a",
                  procedure: "Inspect and clean air cleaner element and housing (para. 3-13).",
                  criteria: null
                },
                {
                  id: "7_Air-Intake-System_b",
                  procedure: "Check CDR valve oil saturation. Disconnect CDR valve oil fill tube hose from CDR valve and inspect. Some oil accumulation in the CDR valve is acceptable. Correct CDR function is determined by checking vacuum with a water manometer. (para. 3-9a).",
                  criteria: "CDR fails water manometer vacuum test."
                },
                {
                  id: "7_Air-Intake-System_c",
                  procedure: "<strong>CAUTION:</strong> Do not clean CDR valve with solvent. This will damage the diaphgragm inside the CDR valve. Wiping with a rag is the only authorized method of cleaning. Remove and wipe off the CDR valve and hoses with a rag.",
                  criteria: null,
                  image: "/images/7-c.png"
                },
              ]
            },
            {
              title: "60, 100, and 200 Amp Alternators",
              items: [
                {
                  id: "8_60-100-and-200-Amp-Alternators_a",
                  procedure: "Inspect alternator and voltage regulator (200 amp only) for condition, proper installation, and security of mounting.",
                  criteria: "Mounting bolts missing or alternator damaged."
                },
                {
                  id: "8_60-100-and-200-Amp-Alternators_b",
                  procedure: "Inspect electrical wiring for broken strands, frayed, cracked or worn insulation, and loose connections.",
                  criteria: "Wiring frayed, broken, or loose connections."
                },
                {
                  id: "8_60-100-and-200-Amp-Alternators_c",
                  procedure: "Deleted",
                  criteria: null
                },
                {
                  id: "8_60-100-and-200-Amp-Alternators_d",
                  procedure: "Check alternator mounting bolts for security of mounting. Tighten bolts to 40 lb-ft (54 N*m).",
                  criteria: "Any alternator mounting bolt is loose."
                },
              ]
            },
            {
              title: "Accelerator Linkage",
              items: [
                {
                  id: "9_Accelerator-Linkage_a",
                  procedure: "Inspect for bends, excessive play, cracks, and damage that could cause failure.",
                  criteria: "Linkage damaged, bent, or cracked."
                },
              ]
            },
            {
              title: "Suspension and Steering System",
              disclaimers: [
                "NOTE: If access to locknut is a problem, remove geared hub from control arm (para. 6-11).",
              ],
              items: [
                {
                  id: "10_Suspension-and-Steering-System_a",
                  procedure: "Remove wheel and tire assembly (para. 8-3). Check front and rear lower ball joint mounting.For M996, M997, M1042, M1037, M1097, M1123, and \"A1\" and \"A2\" series vehicles, tighten rear lower ball joint to lower control arm locknuts to 60 lb-ft (81 N*m) and front to 35 lb-ft (48 N*m) and ensure cotter pin is present. Tighten ball joint slotted nut to 73 lb-ft (99 N*m) and ensure cotter pin is present.",
                  criteria: "Capscrews or locknuts are finger or hand turnable."
                },
                {
                  id: "10_Suspension-and-Steering-System_b",
                  procedure: "Check front and rear upper ball joint mounting. Tighten upper ball joint to upper control arm locknuts to 21 lb-ft (29 N*m). Tighten upper control arm to control arm bracket locknuts to 260 lb-ft (353 N*m). Tighten ball joint slotted nut to 65 lb-ft (88 N*m) and ensure cotter pin is present.",
                  criteria: "Capscrews or locknuts are finger or hand turnable."
                },
                {
                  id: "10_Suspension-and-Steering-System_c",
                  procedure: "<strong>NOTE:</strong> Do not over lubricate ball joints, one or two shots is adequate. Lubricate front and rear upper ball joints with GAA grease. <strong>NOTE:</strong> Do not lubricate shock absorber bushings, radius rod bushings, stabilizer bar bushing, or suspension arm pivot bushing.",
                  criteria: null
                },
                {
                  id: "10_Suspension-and-Steering-System_d",
                  procedure: "Inspect control arms, control arm bushings, springs, shock absorbers, and bracket for damage.",
                  criteria: "Control arm bent, bushing worn or obvious damage that would hinder operation.",
                  image: "/images/10-d.png"
                },
                {
                  id: "10_Suspension-and-Steering-System_e",
                  procedure: "Inspect steering column U-joints, tie rods or radius rods, pitman arm, center link, and idler arm for breaks, cracks and wear.",
                  criteria: "U-joints, tie rods, pitman arm or idler arm are worn or cracked.",
                  image: "/images/10-e.png"
                },
                {
                  id: "10_Suspension-and-Steering-System_e1",
                  procedure: "Inspect steering column for security of mounting hardware.",
                  criteria: "Steering column is not secure."
                },
                {
                  id: "10_Suspension-and-Steering-System_f",
                  procedure: "Inspect steering gear for mounting security. Tighten mounting bolts to 60 lb-ft (81 N*m).",
                  criteria: "Any mounting bolt missing or unservicable."
                },
                {
                  id: "10_Suspension-and-Steering-System_g",
                  procedure: "Inspect power steering pump, power steering gear, hydraulic control valve, hoses, lines, and fittings for leaks or damage.",
                  criteria: "Any class III leak. Any component damaged."
                },
              ]
            },
            {
              title: "Brake System",
              items: [
                {
                  id: "11_Brake-System_a",
                  procedure: "Inspect master cylinder, hydro-boost, lines, and fittings for leaks and damage.",
                  criteria: "Any leak. Plugged, broken, or damaged lines and fittings.",
                  image: "/images/11-a.png"
                },
                {
                  id: "11_Brake-System_b",
                  procedure: "<strong>CAUTION:</strong> Use MIL-B-46176 Silicone Brake Fluid (BFS), for filling master brake cylinder. Failure to use BFS will cause damage to brake cylinder. Thoroughly clean exterior of master cylinder cover before removing cover (table 2-1). Dirt, water, or grease will contaminate brake fluid causing brake system damage. Do not use screwdriver to remove cover. Damage to bail wire will result. To prevent excessive fluid spillage, ensure that rubber diaphragm is completely seated before installing cover to master cyclinder. <strong>NOTE:</strong> Remove cover from brake master cyclinder by moving bail wire using thumb pressure only. Check master brake cylinder fluid level. Level should be 1/8 inch (3.2mm) from top of master cylinder reservoirs. Fill with BFS as necessary.",
                  criteria: "Level below 1/8 inch (3.2mm) from top of master cylinder reservoir."
                },
                {
                  id: "11_Brake-System_c",
                  procedure: "Inspect service brake pads and rotor disks for wear (para. 7-11).",
                  criteria: "Service brake pads less than 1/8 inch (3.2mm).",
                  image: "/images/11-c.png"
                },
                {
                  id: "11_Brake-System_d",
                  procedure: "Inspect parkibg brake pads and rotor disk for wear (para. 7-3).",
                  criteria: "Parking brake pads less than 1/8 inch (3.2mm).",
                  image: "/images/11-d.png"
                },
                {
                  id: "11_Brake-System_d1",
                  procedure: "Inspect brake calipers and mounting hardware for damage or loose hardware.",
                  criteria: "Brake calipers are damaged or mounting bolts are loose.",
                  image: "/images/11-d1.png"
                },
                {
                  id: "11_Brake-System_e",
                  procedure: "Inspect dual service/park brake pads and rotor for wear (para. 7-21).",
                  criteria: "Brake pads less than 1/8 inch (3.2mm)."
                },
                {
                  id: "11_Brake-System_f",
                  procedure: "Inspect parking brake cable, cable clip, lever, spring, and pushrod/guide pin for binding and loose components.",
                  criteria: "Parking brake binding or vable frayed or broken. Spring or cable clip missing.",
                  image: "/images/11-f.png"
                },
                {
                  id: "11_Brake-System_g",
                  procedure: "On vehicles equipped with a single parking brake assembly mounted between the rear prop shaft and rear differential, lubricate parking brake lever, parking brake cam, parking brake push pins, and parking brake guide pins with WTR. On vehicles equipped with a left and right parking/service brake assembly mounted between the rear axle half-shafts and rear  differential, lubricate the parking brake lever with WTR. The parking/service brake assembly needs no lubrication. ",
                  criteria: null
                },
                {
                  id: "11_Brake-System_h",
                  procedure: "Inspect rear parking brake cables for damage and/or chaffing in the area of the control arm. If cables are damaged, replace cables (paragraph 7-23 or 7-24).",
                  criteria: "Parking brake binding or cable frayed or broken."
                },
                {
                  id: "11_Brake-System_i",
                  procedure: "Inspect for presence of, or damage to, parking brake cable clamps.",
                  criteria: null
                },
              ] 
            },
            {
              title: "Engine and Transmission Mounts",
              items: [
                {
                  id: "12_Engine-and-Transmission-Mounts_a",
                  procedure: "Inspect engine mounts and insulators for loose, worn, and damaged condition.",
                  criteria: "Engine mounts or insulators cracked, damaged, loose, or worn."
                },
                {
                  id: "12_Engine-and-Transmission-Mounts_b",
                  procedure: "Check for loose or missing engine mount capscrews and locknuts. If engine mount capscrews or locknuts are loose or missing, notify DS maintenance.",
                  criteria: "Capscrews or locknuts, loose or missing."
                },
                {
                  id: "12_Engine-and-Transmission-Mounts_c",
                  procedure: "Using 3/4 inch torque adapter (refer to Appendix B, Item 145), tighten two capscrews securing transmission mount to adapter to 65 lb-ft (88 N*m). Tighten two locknuts securing transmission mount to crossmember to 28 lb-ft (38 N*m).",
                  criteria: "Transmission mount loose, cracked, or damaged."
                }
              ]
            },
            {
              title: "Starter",
              items: [
                {
                  id: "13_Starter_a",
                  procedure: "<strong>CAUTION:</strong> Disconnect negative cable. Inspect starter for mounting security. Tighten mounting bolts to 40 lb-ft (54 N*m).",
                  criteria: "Mounting bolt missing or will not torque."
                },
                {
                  id: "13_Starter_b",
                  procedure: "Inspect cables and studs for loose nuts and damage.",
                  criteria: "Stud nut loose."
                }
              ]
            }
          ]
        },
        annual: {
          id: "annual", 
          name: "Annual",
          inspectionGroups: [
            {
              title: "Transmission",
              disclaimers: [
                "Vehicle must be on level ground with parking brake set and wheels chocked before beginning transmission inspection."
              ],
              items: [
                {
                  id: "trans_a",
                  procedure: "Check transmission fluid level and condition",
                  criteria: "Not fully mission capable if: Fluid is dark brown/black or has metallic particles"
                },
                {
                  id: "trans_b",
                  procedure: "Inspect transmission mount for security",
                  criteria: "Not fully mission capable if: Mount is cracked or separated"
                }
              ]
            },
            {
              title: "Suspension",
              disclaimers: [
                "Ensure vehicle is on stable lift or jack stands before performing suspension checks. Never work under a vehicle supported only by a jack."
              ],
              items: [
                {
                  id: "susp_a",
                  procedure: "Check shock absorbers for leaks and mounting",
                  criteria: "Not fully mission capable if: Shocks show signs of leakage or loose mounting"
                },
                {
                  id: "susp_b",
                  procedure: "Inspect leaf springs for cracks or shifted leaves",
                  criteria: "Not fully mission capable if: Springs are cracked or leaves are misaligned more than 1/4 inch"
                }
              ]
            }
          ]
        }
      }
    },
    Bradley: {
      name: "Bradley Fighting Vehicle",
      timelines: {
        semiannual: {
          id: "semiannual",
          name: "Semi-Annual",
          inspectionGroups: [
            {
              title: "Engine and Power",
              disclaimers: [
                "Engine checks must be performed with master power on but engine not running unless specified otherwise."
              ],
              items: [
                {
                  id: "engine_a",
                  procedure: "Check engine oil pressure and temperature gauges",
                  criteria: "Not fully mission capable if: Oil pressure below 10 PSI at idle or temperature above 230°F"
                },
                {
                  id: "engine_b",
                  procedure: "Inspect coolant system for leaks and proper fluid level",
                  criteria: "Not fully mission capable if: Coolant level below minimum or visible leaks present"
                },
                {
                  id: "engine_c",
                  procedure: "Check air intake and filtration system",
                  criteria: "Not fully mission capable if: Air filter restricted or intake seals damaged"
                }
              ]
            },
            {
              title: "Weapons Systems",
              disclaimers: [
                "Ensure all weapons are cleared and made safe before beginning inspection. Follow proper weapons handling procedures at all times."
              ],
              items: [
                {
                  id: "weapons_a",
                  procedure: "Inspect 25mm gun barrel and breach for damage or obstruction",
                  criteria: "Not fully mission capable if: Barrel shows damage or breach mechanism malfunctions"
                },
                {
                  id: "weapons_b",
                  procedure: "Check TOW launcher mounting and electrical connections",
                  criteria: "Not fully mission capable if: Launcher mount loose or electrical connections corroded"
                },
                {
                  id: "weapons_c",
                  procedure: "Test ammunition feed system operation",
                  criteria: "Not fully mission capable if: Feed system jams or fails to cycle properly"
                }
              ]
            }
          ]
        },
        annual: {
          id: "annual",
          name: "Annual",
          inspectionGroups: [
            {
              title: "Track and Mobility",
              disclaimers: [
                "Track inspection requires vehicle to be on level ground. Ensure track tension is checked at multiple points."
              ],
              items: [
                {
                  id: "track_a",
                  procedure: "Check track tension and alignment",
                  criteria: "Not fully mission capable if: Track tension outside specifications or severe misalignment"
                },
                {
                  id: "track_b",
                  procedure: "Inspect drive sprockets and road wheels",
                  criteria: "Not fully mission capable if: Sprocket teeth worn beyond limits or road wheels damaged"
                },
                {
                  id: "track_c",
                  procedure: "Test suspension system operation",
                  criteria: "Not fully mission capable if: Torsion bars broken or shock absorbers inoperative"
                }
              ]
            },
            {
              title: "Turret Systems",
              disclaimers: [
                "Ensure turret area is clear of personnel before conducting power traverse. Maintain communication with turret operator during checks."
              ],
              items: [
                {
                  id: "turret_a",
                  procedure: "Check turret rotation and elevation mechanisms",
                  criteria: "Not fully mission capable if: Turret movement restricted or hydraulic system leaking"
                },
                {
                  id: "turret_b",
                  procedure: "Inspect sight systems and optics",
                  criteria: "Not fully mission capable if: Sights misaligned or optics damaged"
                },
                {
                  id: "turret_c",
                  procedure: "Test turret electrical systems",
                  criteria: "Not fully mission capable if: Power distribution failure or control malfunctions"
                }
              ]
            }
          ]
        }
      }
    }
  };

  // Define specific vehicles of each type
  const vehicleIds = {
    HMMWV: [
      { id: "A50", name: "HMMWV #A50" },
      { id: "B20", name: "HMMWV #B20" },
      { id: "C30", name: "HMMWV #C30" }
    ],
    Bradley: [
      { id: "C14", name: "Bradley #C14" },
      { id: "D05", name: "Bradley #D05" },
      { id: "E22", name: "Bradley #E22" }
    ]
  };

  // State variables
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [showVehicleIdSelection, setShowVehicleIdSelection] = useState(false);
  const [showTimelineSelection, setShowTimelineSelection] = useState(false);
  const [showFaultSelection, setShowFaultSelection] = useState(false);
  const [selectedTimelines, setSelectedTimelines] = useState([]);
  const [selectedFaults, setSelectedFaults] = useState([]);
  const [selectedFaultImages, setSelectedFaultImages] = useState({});

  //useEffect for isReopenMode/faultId here
  React.useEffect(() => {
    if (isReopenMode && faultId) {
      axios
        .get(`http://localhost:3000/api/v1/faults/${faultId}`)
        .then(res => {
          const existingFault = res.data.fault;
          if (!existingFault) {
            toast.error("Fault not found");
            return;
          }
          // Pre-populate your states:
          setSelectedVehicleType(existingFault.vehicleType);
          setSelectedVehicleId(existingFault.vehicleId);
          setSelectedTimelines(existingFault.timelines || []);
          setSelectedFaults(existingFault.issues || []);
  
          // If you want to SKIP the “select vehicle type” screens,
          // jump straight to the final step:
          setShowVehicleIdSelection(true);
          setShowTimelineSelection(true);
          setShowFaultSelection(true);
        })
        .catch(err => {
          console.error(err);
          toast.error("Failed to load fault for editing");
        });
    }
  }, [isReopenMode, faultId]);

  // Combine inspection groups from selected timelines
  const combinedInspectionGroups = useMemo(() => {
    if (!selectedVehicleType || selectedTimelines.length === 0) return [];
    
    return selectedTimelines.reduce((acc, timeline) => {
      const timelineGroups = vehicleTypes[selectedVehicleType].timelines[timeline].inspectionGroups;
      return [...acc, ...timelineGroups];
    }, []);
  }, [selectedVehicleType, selectedTimelines]);

  // Handle vehicle type selection
  const handleVehicleTypeSelect = (vehicleType) => {
    setSelectedVehicleType(vehicleType);
    setSelectedVehicleId("");
  };

  // Handle specific vehicle selection
  const handleVehicleIdSelect = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
  };

  const handleTimelineSelect = (timelineId) => {
    setSelectedTimelines(prev => {
      if (prev.includes(timelineId)) {
        return prev.filter(id => id !== timelineId);
      }
      return [...prev, timelineId];
    });
  };

  const handleNextFromVehicleType = () => {
    if (!selectedVehicleType) {
      toast.error("Please select a vehicle type first");
      return;
    }
    setShowVehicleIdSelection(true);
  };

  const handleNextFromVehicleId = () => {
    if (!selectedVehicleId) {
      toast.error("Please select a specific vehicle first");
      return;
    }
    setShowTimelineSelection(true);
  };

  const handleNextFromTimeline = () => {
    if (selectedTimelines.length === 0) {
      toast.error("Please select at least one maintenance timeline");
      return;
    }
    setShowFaultSelection(true);
  };

  const handleCheckboxChange = (itemId) => {
    setSelectedFaults((prevSelected) => {
      const updated = prevSelected.includes(itemId)
        ? prevSelected.filter((id) => id !== itemId)
        : [...prevSelected, itemId];

      setSelectedFaultImages((prevImages) => {
        const updatedImages = { ...prevImages };
        if (!updated.includes(itemId)) {
          delete updatedImages[itemId];
        }
        return updatedImages;
      });

      return updated;
    });
  };

  const handleImageChange = (e, faultId) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFaultImages((prev) => ({
        ...prev,
        [faultId]: file,
      }));
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      const url = "http://localhost:3000/api/v1/faults";

      const submitPromises = selectedFaults.map(async (faultId) => {
        let faultDetails = null;
        for (const group of combinedInspectionGroups) {
          const matchingItem = group.items.find(item => item.id === faultId);
          if (matchingItem) {
            faultDetails = { ...matchingItem, groupTitle: group.title };
            break;
          }
        }

        if (!faultDetails) return;

        const formData = new FormData();
        formData.append("vehicleType", selectedVehicleType);
        formData.append("vehicleId", selectedVehicleId);
        formData.append("issues[]", faultId);
        formData.append("createdBy", localStorage.getItem("username"));
        selectedTimelines.forEach(t => formData.append("timelines[]", t));
        if (selectedFaultImages[faultId]) {
          formData.append("image", selectedFaultImages[faultId]);
        }

        return axios.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      });

      await Promise.all(submitPromises);

      store.dispatch(changeStatusListener());
      setSelectedFaults([]);
      setSelectedFaultImages({});
      setShowFaultSelection(false);
      setShowTimelineSelection(false);
      setShowVehicleIdSelection(false);
      setSelectedTimelines([]);
      setSelectedVehicleId("");
      setSelectedVehicleType("");
      setShowConfirmation(false);
      toast.success("Fault submissions successful!");
    } catch (error) {
      console.error("Error details:", error);
      toast.error("Error submitting faults: " + error.message);
    }
  };
  

  // Group faults by their inspection group
  const groupedFaults = useMemo(() => {
    if (!selectedVehicleType || selectedFaults.length === 0) return [];
    
    const groups = {};
    combinedInspectionGroups.forEach(group => {
      const groupFaults = group.items.filter(item => selectedFaults.includes(item.id));
      if (groupFaults.length > 0) {
        groups[group.title] = groupFaults;
      }
    });
    return groups;
  }, [selectedVehicleType, selectedFaults, combinedInspectionGroups]);

  const handleBack = () => {
    if (showFaultSelection) {
      setShowFaultSelection(false);
    } else if (showTimelineSelection) {
      setShowTimelineSelection(false);
    } else if (showVehicleIdSelection) {
      setShowVehicleIdSelection(false);
    } else {
      navigate("/home");
    }
  };

  // Find the selected vehicle name
  const getSelectedVehicleName = () => {
    if (!selectedVehicleId || !selectedVehicleType) return "";
    const vehicle = vehicleIds[selectedVehicleType].find(v => v.id === selectedVehicleId);
    return vehicle ? vehicle.name : "";
  };

  return (
    <div className="fault-submission-main">
      <button className="back-button" onClick={handleBack}>
        {showFaultSelection
          ? "Back to Timeline Selection"
          : showTimelineSelection
          ? "Back to Vehicle Selection"
          : showVehicleIdSelection
          ? "Back to Vehicle Type Selection"
          : "Back"}
      </button>
  
      {/* Vehicle Type Selection */}
      {!showVehicleIdSelection && (
        <div className="vehicle-selection">
          <h1 className="vehicle-selection-title">Select Vehicle Type</h1>
          <p className="vehicle-selection-subtitle">
            Choose the vehicle platform you want to perform maintenance on
          </p>
          <div className="vehicle-grid">
            {Object.entries(vehicleTypes)
              .sort(([, a], [, b]) => a.name.localeCompare(b.name))
              .map(([typeKey, type]) => (
                <button
                  key={typeKey}
                  className={`vehicle-button ${
                    selectedVehicleType === typeKey ? "selected" : ""
                  }`}
                  onClick={() => handleVehicleTypeSelect(typeKey)}
                >
                  {type.name}
                </button>
              ))}
          </div>
          <button className="next-button" onClick={handleNextFromVehicleType}>
            Next
          </button>
        </div>
      )}
  
      {/* Specific Vehicle ID Selection */}
      {showVehicleIdSelection && !showTimelineSelection && (
        <div className="vehicle-selection">
          <h1 className="vehicle-selection-title">Select Specific Vehicle</h1>
          <p className="vehicle-selection-subtitle">
            Choose the specific {vehicleTypes[selectedVehicleType].name} you want to perform maintenance on
          </p>
          <div className="vehicle-grid">
            {vehicleIds[selectedVehicleType]?.map((vehicle) => (
              <button
                key={vehicle.id}
                className={`vehicle-button ${
                  selectedVehicleId === vehicle.id ? "selected" : ""
                }`}
                onClick={() => handleVehicleIdSelect(vehicle.id)}
              >
                {vehicle.name}
              </button>
            ))}
          </div>
          <button className="next-button" onClick={handleNextFromVehicleId}>
            Next
          </button>
        </div>
      )}
  
      {/* Timeline Selection */}
      {showTimelineSelection && !showFaultSelection && (
        <div className="timeline-selection">
          <h1 className="form-title">Select Maintenance Timeline(s)</h1>
          <p className="timeline-selection-title">
            Select one or more timelines to perform maintenance on
          </p>
          <div className="timeline-grid">
            {Object.values(vehicleTypes[selectedVehicleType]?.timelines || {}).map(
              (timeline) => (
                <button
                  key={timeline.id}
                  className={`timeline-button ${
                    selectedTimelines.includes(timeline.id) ? "selected" : ""
                  }`}
                  onClick={() => handleTimelineSelect(timeline.id)}
                >
                  {timeline.name}
                </button>
              )
            )}
          </div>
          <div className="selected-timelines">
            Selected:{" "}
            {selectedTimelines
              .map(
                (t) => vehicleTypes[selectedVehicleType]?.timelines[t]?.name
              )
              .join(", ")}
          </div>
          <button className="next-button" onClick={handleNextFromTimeline}>
            Start PMCS
          </button>
        </div>
      )}
  
      {/* Fault Selection Form */}
      {showFaultSelection && (
        <form className="fault-submission-form" onSubmit={handleSubmit}>
          <div className="vehicle-id-box">
            <div>
              Vehicle Type:{" "}
              {vehicleTypes[selectedVehicleType]?.name || "Unknown Vehicle Type"}
            </div>
            <div>Vehicle ID: {getSelectedVehicleName()}</div>
            <div className="timeline-info">
              Maintenance:{" "}
              {selectedTimelines
                .map(
                  (t) =>
                    vehicleTypes[selectedVehicleType]?.timelines[t]?.name
                )
                .join(" + ")}
            </div>
          </div>
          <h1 className="form-title">PMCS Walkthrough</h1>
          <div className="fault-selection-container">
            <div className="inspection-groups">
              {combinedInspectionGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="inspection-group">
                  <h3 className="group-title">{group.title}</h3>
                  {group.disclaimers && group.disclaimers.map((disclaimer, index) => (
                    <div key={index} className="group-disclaimer">{disclaimer}</div>
                  ))}
                  {group.items.map((item) => (
                    <div key={item.id} className="inspection-item">
                      <label className="item-label">
                        <input
                          type="checkbox"
                          checked={selectedFaults.includes(item.id)}
                          onChange={() => handleCheckboxChange(item.id)}
                        />
                        <span dangerouslySetInnerHTML={{ __html: item.procedure }} />
                      </label>
                      {item.criteria && (
                        <div className="criteria">
                          <span className="criteria-label">NOT FULLY MISSION CAPABLE IF: </span>
                          {item.criteria}
                        </div>
                      )}
                      {selectedFaults.includes(item.id) && (
                        <div className="image-upload">
                          <label>
                            Upload Image (optional):
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, item.id)}
                            />
                          </label>
                          {selectedFaultImages[item.id] && (
                            <div className="selected-image-preview">
                              <img
                                src={URL.createObjectURL(selectedFaultImages[item.id])}
                                alt="Preview"
                                className="image-thumb"
                              />
                              <div className="image-controls">
                                <span>{selectedFaultImages[item.id].name}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedFaultImages((prev) => {
                                      const updated = { ...prev };
                                      delete updated[item.id];
                                      return updated;
                                    })
                                  }
                                >
                                  Remove Image
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="form-submit">Verify and Submit</button>
        </form>
      )}
  
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h2 className="modal-title">Confirm PMCS Submission</h2>
            <div className="modal-content">
              <div className="modal-vehicle-info">
                <div className="vehicle-type">
                  {vehicleTypes[selectedVehicleType]?.name ||
                    "Unknown Vehicle Type"}
                </div>
                <div className="vehicle-name">{getSelectedVehicleName()}</div>
                <div>
                  Maintenance:{" "}
                  {selectedTimelines
                    .map(
                      (t) =>
                        vehicleTypes[selectedVehicleType]?.timelines[t]?.name
                    )
                    .join(" + ")}
                </div>
                <div>Total Issues: {selectedFaults.length}</div>
                <div className="modal-username">
                  Submitted by: {username || "Not logged in"}
                </div>
              </div>
  
              <div className="modal-faults">
                {Object.entries(groupedFaults).map(([groupTitle, faults]) => (
                  <div key={groupTitle} className="modal-fault-group">
                    <h3 className="modal-fault-group-title">{groupTitle}</h3>
                    {faults.map((fault) => (
                      <div key={fault.id} className="modal-fault-item">
                        <div className="procedure" dangerouslySetInnerHTML={{ __html: fault.procedure }} />
                        {fault.criteria && (
                          <div className="criteria">
                            <span className="criteria-label">NOT FULLY MISSION CAPABLE IF: </span>
                            {fault.criteria}
                          </div>
                        )}
                        {selectedFaultImages[fault.id] && (
                          <div className="modal-image-preview">
                            <img
                              src={URL.createObjectURL(selectedFaultImages[fault.id])}
                              alt="Uploaded preview"
                              className="image-thumb"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
  
              <div className="modal-buttons">
                <button
                  className="modal-button modal-cancel"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className="modal-button modal-confirm"
                  onClick={handleConfirmSubmit}
                >
                  Confirm Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );  
};  

export default FaultSubmissionForm;