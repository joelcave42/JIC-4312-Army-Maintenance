import React, { useState } from "react";
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
  const navigate = useNavigate()
  const { inputValues } = useSelector((state) => state.globalValues);
  const dispatch = useDispatch();

  const faultGroups = [
    {
      title: "Tires and Wheels",
      faults: [
        "Flat tire",
        "Low tire pressure",
        "Cracked wheel rim",
        "Loose or missing lug nuts",
        "Excessive tire wear or uneven tread wear",
        "Damaged tire sidewall (cuts, bulges, or cracks)",
      ],
    },
    {
      title: "Engine and Transmission",
      faults: [
        "Low oil level",
        "Oil leakage",
        "Low coolant level",
        "Coolant leakage",
        "Dirty or clogged air filter",
        "Engine overheating",
        "Transmission fluid leakage",
        "Difficulty shifting gears",
      ],
    },
    {
      title: "Electrical System",
      faults: [
        "Dead battery",
        "Corroded battery terminals",
        "Faulty alternator",
        "Non-functional headlights or taillights",
        "Broken or missing fuses",
        "Non-functional dashboard indicators or gauges",
      ],
    },
    {
      title: "Brakes",
      faults: [
        "Low brake fluid level",
        "Worn brake pads",
        "Squeaking or grinding noises when braking",
        "Brake fluid leakage",
        "Inconsistent brake pedal pressure",
        "Excessive travel in the brake pedal",
      ],
    },
    {
      title: "Steering and Suspension",
      faults: [
        "Loose or damaged steering linkage",
        "Excessive play in the steering wheel",
        "Damaged or leaking shock absorbers",
        "Broken or damaged leaf springs",
        "Uneven vehicle height (indicates suspension issues)",
      ],
    },
    {
      title: "Body and Chassis",
      faults: [
        "Cracked or damaged windshield",
        "Loose or missing bolts on the body panels",
        "Rust or corrosion on the chassis",
        "Bent or damaged frame components",
        "Doors not closing properly",
      ],
    },
    {
      title: "Fuel System",
      faults: [
        "Low fuel level",
        "Fuel leakage",
        "Clogged fuel filter",
        "Difficulty starting due to fuel delivery issues",
      ],
    },
    {
      title: "Exhaust System",
      faults: [
        "Exhaust pipe leakage",
        "Excessive smoke from the exhaust",
        "Unusual exhaust noises",
      ],
    },
    {
      title: "Additional Items",
      faults: [
        "Missing or damaged fire extinguisher",
        "Missing first aid kit",
        "Missing or damaged Basic Issue Items (BII)",
        "Loose or missing tow hooks",
        "Faulty seat belts or restraints",
      ],
    },
  ];

  const [selectedFaults, setSelectedFaults] = useState([]);

  const handleCheckboxChange = (fault) => {
    setSelectedFaults((prevSelected) =>
      prevSelected.includes(fault)
        ? prevSelected.filter((item) => item !== fault)
        : [...prevSelected, fault]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = "http://localhost:3000/api/v1/faults";
    const faultData = {
      vehicleId: "A50", // Placeholder; replace with dynamic data if needed
      issues: selectedFaults,
      createdBy: localStorage.getItem("username"),
    };

    try {
      await axios.post(url, faultData);
      store.dispatch(changeStatusListener());
      setSelectedFaults([]);
      toast.success("Fault submission successful!");
    } catch (error) {
      toast.error("Error submitting faults: " + error.message);
    }
  };

  return (
    <div className="fault-submission-main">
      <button className="back-button" onClick={() => navigate("/home")}>Back</button>
      <div className="vehicle-id-box">Vehicle: A50</div>
      <form className="fault-submission-form" onSubmit={handleSubmit}>
        <h1 className="form-title">PMCS Walkthrough</h1>
        <div className="checkbox-group">
          {faultGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="fault-group">
              <h3 className="group-title">{group.title}</h3>
              {group.faults.map((fault, faultIndex) => (
                <label key={faultIndex} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedFaults.includes(fault)}
                    onChange={() => handleCheckboxChange(fault)}
                  />
                  {fault}
                </label>
              ))}
            </div>
          ))}
        </div>
        <button type="submit" className="form-submit">
          Verify and Submit
        </button>
      </form>
    </div>
  );
};

export default FaultSubmissionForm;
