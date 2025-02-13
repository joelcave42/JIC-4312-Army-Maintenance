const Fault = require("../models/Fault");

const getAllFaults = async (req, res) => {
    try {
        const faults = await Fault.find({});
        res.status(200).json({ faults, count: faults.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingFaults = async (req, res) => {
    try {
        const faults = await Fault.find({ status: "pending" });
        res.status(200).json({ faults, count: faults.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getCompletedFaults = async (req, res) => {
    try {
        const faults = await Fault.find({ status: "completed" });
        res.status(200).json({ faults, count: faults.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const addFault = async (req, res) => {
    try {
        const fault = await Fault.create(req.body);
        res.status(201).json({ fault });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getFault = async (req, res) => {
    try {
        const { id: faultID } = req.params;
        const fault = await Fault.findOne({ _id: faultID });
        if (!fault) {
            return res.status(404).json({ msg: `Fault with ID ${faultID} doesn't exist` });
        }
        res.status(200).json({ fault });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateFault = async (req, res) => {
    try {
        const { id: faultID } = req.params;
        const fault = await Fault.findByIdAndUpdate(faultID, req.body, {
            new: true,
            runValidators: true,
        });
        if (!fault) {
            return res.status(404).json({ msg: `Fault with ID ${faultID} doesn't exist` });
        }
        res.status(200).json({ fault });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const markFaultCorrected = async (req, res) => {
    try{
        const { id: faultID} = req.params;
        const updatedFault = await Fault.findByIdAndUpdate(
            faultID,
            { status: "completed" },
            { new: true }
        );

        if (!updatedFault) {
            return res.status(404).json({ msg: `Fault with ID ${faultID} doesn't exist`});
        }
        res.status(200).json({ updateFault });
    } catch (error) {
        res.status(500).json({ message: `Error marking fault as corrected: ${error.message}` });
    }
}

const deleteFault = async (req, res) => {
    const { id: faultID } = req.params;
    try {
        const fault = await Fault.findByIdAndDelete(faultID);
        if (!fault) {
            return res.status(404).json({ msg: `No fault with id ${faultID} found` });
        }
        res.status(200).json({ msg: "Fault successfully deleted" });
    } catch (error) {
        res.status(500).json({ msg: `Error deleting fault: ${error.message}` });
    }
};


module.exports = {
    getAllFaults,
    getPendingFaults,
    getCompletedFaults,
    addFault,
    getFault,
    updateFault,
    markFaultCorrected,
    deleteFault,
};
