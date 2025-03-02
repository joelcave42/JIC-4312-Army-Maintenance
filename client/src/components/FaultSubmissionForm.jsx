import React, { useState, useMemo } from "react";
import {useNavigate} from "react-router-dom";
import "../styles/FaultSubmissionForm.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  changeStatusListener,
  resetInputValues,
} from "../features/globalValues/globalSlice";
import { store } from "../store";
import { toast } from "react-toastify";

const FaultSubmissionForm = () => {
  const navigate = useNavigate();
  const { inputValues } = useSelector((state) => state.globalValues);
  const dispatch = useDispatch();

  // Vehicle-specific maintenance checklists with timelines
  const vehicleData = {
    A50: {
      id: "123456789", // represents vehicle serial number, which will be used to identify the vehicle
      name: "HMMWV A50", //vehicle type with the current bumper number (or other easily identifiable feature)
      timelines: {
        semiannual: {
          id: "semiannual",
          name: "Semi-Annual",
          inspectionGroups: [
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
                  criteria: "Rubber cap missing or damaged."
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
                  criteria: null
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
                  criteria: null
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
                  procedure: "---",
                  criteria: "---"
                },
              ]
            },
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
    C14: {
      id: "C14",
      name: "Bradley C14",
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

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [showTimelineSelection, setShowTimelineSelection] = useState(false);
  const [showFaultSelection, setShowFaultSelection] = useState(false);
  const [selectedTimelines, setSelectedTimelines] = useState([]);
  const [selectedFaults, setSelectedFaults] = useState([]);

  // Combine inspection groups from selected timelines
  const combinedInspectionGroups = useMemo(() => {
    if (!selectedVehicle || selectedTimelines.length === 0) return [];
    
    return selectedTimelines.reduce((acc, timeline) => {
      const timelineGroups = vehicleData[selectedVehicle].timelines[timeline].inspectionGroups;
      return [...acc, ...timelineGroups];
    }, []);
  }, [selectedVehicle, selectedTimelines]);

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicle(vehicleId);
    setSelectedTimelines([]);
    setShowFaultSelection(false);
  };

  const handleTimelineSelect = (timelineId) => {
    setSelectedTimelines(prev => {
      if (prev.includes(timelineId)) {
        return prev.filter(id => id !== timelineId);
      }
      return [...prev, timelineId];
    });
  };

  const handleNextFromVehicle = () => {
    if (!selectedVehicle) {
      toast.error("Please select a vehicle first");
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
    setSelectedFaults((prevSelected) =>
      prevSelected.includes(itemId)
        ? prevSelected.filter((id) => id !== itemId)
        : [...prevSelected, itemId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = "http://localhost:3000/api/v1/faults";
    const faultData = {
      vehicleId: selectedVehicle,
      timelines: selectedTimelines,
      issues: selectedFaults,
    };

    try {
      await axios.post(url, faultData);
      store.dispatch(changeStatusListener());
      setSelectedFaults([]);
      setShowFaultSelection(false);
      setShowTimelineSelection(false);
      setSelectedTimelines([]);
      setSelectedVehicle("");
      toast.success("Fault submission successful!");
    } catch (error) {
      toast.error("Error submitting faults: " + error.message);
    }
  };

  const handleBack = () => {
    if (showFaultSelection) {
      setShowFaultSelection(false);
    } else if (showTimelineSelection) {
      setShowTimelineSelection(false);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="fault-submission-main">
      <button className="back-button" onClick={handleBack}>
        {showFaultSelection ? "Back to Timeline Selection" : 
         showTimelineSelection ? "Back to Vehicle Selection" : "Back"}
      </button>
      
      {!showTimelineSelection && (
        <div className="vehicle-selection">
          <h1 className="form-title">Select Vehicle</h1>
          <div className="vehicle-grid">
            {Object.entries(vehicleData).map(([vehicleKey, vehicle]) => (
              <button
                key={vehicleKey}
                className={`vehicle-button ${selectedVehicle === vehicleKey ? 'selected' : ''}`}
                onClick={() => handleVehicleSelect(vehicleKey)}
              >
                {vehicle.name}
              </button>
            ))}
          </div>
          <button 
            className="next-button"
            onClick={handleNextFromVehicle}
          >
            Next
          </button>
        </div>
      )}
      {showTimelineSelection && !showFaultSelection && (
        <div className="timeline-selection">
          <h1 className="form-title">Select Maintenance Timeline(s)</h1>
          <div className="timeline-grid">
            {Object.values(vehicleData[selectedVehicle].timelines).map((timeline) => (
              <button
                key={timeline.id}
                className={`timeline-button ${selectedTimelines.includes(timeline.id) ? 'selected' : ''}`}
                onClick={() => handleTimelineSelect(timeline.id)}
              >
                {timeline.name}
              </button>
            ))}
          </div>
          <div className="selected-timelines">
            Selected: {selectedTimelines.map(t => vehicleData[selectedVehicle].timelines[t].name).join(", ")}
          </div>
          <button 
            className="next-button"
            onClick={handleNextFromTimeline}
          >
            Start Maintenance Check
          </button>
        </div>
      )}
      {showFaultSelection && (
        <form className="fault-submission-form" onSubmit={handleSubmit}>
          <div className="vehicle-id-box">
            <div>Vehicle: {vehicleData[selectedVehicle].name}</div>
            <div className="timeline-info">
              Maintenance: {selectedTimelines.map(t => vehicleData[selectedVehicle].timelines[t].name).join(" + ")}
            </div>
          </div>
          <h1 className="form-title">PMCS Walkthrough</h1>
          <div className="fault-selection-container">
            <div className="inspection-groups">
              {combinedInspectionGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="inspection-group">
                  <h3 className="group-title">{group.title}</h3>
                  {group.disclaimers && group.disclaimers.map((disclaimer, index) => (
                    <div key={index} className="group-disclaimer">
                      {disclaimer}
                    </div>
                  ))}
                  {group.items.map((item, itemIndex) => (
                    <div key={item.id} className="inspection-item">
                      <label className="item-label">
                        <div className="item-header">
                          <input
                            type="checkbox"
                            checked={selectedFaults.includes(item.id)}
                            onChange={() => handleCheckboxChange(item.id)}
                          />
                          <span className="item-letter">{String.fromCharCode(97 + itemIndex)}.</span>
                        </div>
                        <div className="item-content">
                          <div className="procedure" dangerouslySetInnerHTML={{ __html: item.procedure }}></div>
                          {item.criteria && (
                            <div className="criteria">
                              <span className="criteria-label">Not fully mission capable if: </span>
                              {item.criteria.replace("Not fully mission capable if: ", "")}
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="form-submit">
            Verify and Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default FaultSubmissionForm;
