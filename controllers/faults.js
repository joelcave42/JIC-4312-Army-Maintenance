const Fault = require("../models/Fault");

// Get all faults
const getAllFaults = async (req, res) => {
    try {
        const faults = await Fault.find({});

        res.status(200).json({ faults, count: faults.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all pending faults
const getPendingFaults = async (req, res) => {
    try {
        // Include both pending and validated faults, since both are claimable by maintainers
        const faults = await Fault.find({ status: { $in: ["pending", "validated"] } });
        res.status(200).json({ faults, count: faults.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get all completed faults
const getCompletedFaults = async (req, res) => {
    try {
        const faults = await Fault.find({ status: "completed" });
        res.status(200).json({ faults, count: faults.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Add fault to the total and pending fault lists
const addFault = async (req, res) => {
    try {
      const {
        vehicleType,
        vehicleId,
        issues,
        createdBy,
        timelines,
      } = req.body;
  
      const faultData = {
        vehicleType,
        vehicleId,
        issues: Array.isArray(issues) ? issues : [issues],
        createdBy,
        timelines: Array.isArray(timelines) ? timelines : [timelines],
      };
  
      if (req.file) {
        faultData.image = req.file.buffer;
        faultData.imageMimeType = req.file.mimetype;
      }
  
      const fault = await Fault.create(faultData);
      res.status(201).json({ fault });
    } catch (error) {
      console.error("ADD FAULT ERROR:", error);
      res.status(500).json({ message: error.message });
    }
  };

// Get fault by object ID
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

// Update fault by object ID
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

const markFaultInProgress = async (req, res) => {
    try{
        const { id: faultID } = req.params;
        const updatedFault = await Fault.findByIdAndUpdate(
            faultID,
            { status: "in progress" },
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

const markFaultAwaitingPart = async (req, res) => {
    try{
        const { id: faultID } = req.params;
        const updatedFault = await Fault.findByIdAndUpdate(
            faultID,
            { status: "awaiting part" },
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

// Mark fault corrected by object ID
const markFaultCorrected = async (req, res) => {
    try{
        const { id: faultID} = req.params;
        const updatedFault = await Fault.findByIdAndUpdate(
            faultID,
            { status: "completed",
              completedAt: new Date()
            },

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

// Delete fault by object ID
const deleteFault = async (req, res) => {
    const { id: faultID } = req.params;
    const { userID } = req.body;
    try {
        const updatedFault = await Fault.findByIdAndUpdate(
            faultID,
            {
                status: "deleted",
                deletedAt: new Date().toISOString(),
                deletedBy: userID,
                isClaimed: false,
                claimedBy: null
            },
            { 
                new: true,
                select: 'vehicleId issues status maintainerComment isClaimed claimedBy createdAt deletedAt deletedBy'
            }
        );

        if (!updatedFault) {
            return res.status(404).json({ msg: `No fault with id ${faultID} found` });
        }

        res.status(200).json({ fault: updatedFault });
    } catch (error) {
        res.status(500).json({ msg: `Error marking fault as deleted: ${error.message}` });
    }
};

const claimFault = async (req, res) => {
    
    try {
      const { id: faultID } = req.params;
      const { maintainerID } = req.body; 
      console.log("maintainerID: ", maintainerID);
  
      const updatedFault = await Fault.findByIdAndUpdate(faultID, 
        { isClaimed: true, claimedBy: maintainerID }, 
        { new: true }
    );
    if (!updatedFault) {
        return res.status(404).json({ msg: `Fault with ID ${faultID} doesn't exist` });
    }
    res.status(200).json({ updateFault });
    
    } catch (error) {
        res.status(500).json({ message: `Error marking fault as corrected: ${error.message}` });
    }
  };

const getOperatorFaults = async (req, res) => {
    try {
        const { username } = req.params;
        const faults = await Fault.find({ createdBy: username })
            .select('vehicleId issues status maintainerComment isClaimed claimedBy createdAt deletedAt deletedBy')
            .sort({ createdAt: -1 });
        
        console.log('Operator faults:', faults);
        
        res.status(200).json({ faults, count: faults.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addFaultComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(400).json({ msg: 'Comment is required' });
    }
    
    const updatedFault = await Fault.findByIdAndUpdate(
      id,
      { maintainerComment: comment },
      { new: true }
    );
    
    if (!updatedFault) {
      return res.status(404).json({ msg: 'Fault not found' });
    }
    
    res.status(200).json({ fault: updatedFault });
  } catch (error) {
    console.error('Error updating fault comment:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

const undoDeleteFault = async (req, res) => {
  try {
    const { id: faultID } = req.params;
    const fault = await Fault.findById(faultID);
    if (!fault) {
      return res.status(404).json({ msg: `Fault with ID ${faultID} doesn't exist` });
    }
    if (fault.status !== "deleted") {
      return res.status(400).json({ msg: "Fault is not deleted" });
    }

    const deletedTime = new Date(fault.deletedAt);
    const now = new Date();
    if (now - deletedTime > 10000) {
      return res.status(400).json({ msg: "Undo period expired" });
    }
    fault.status = "pending";
    fault.deletedAt = null;
    fault.deletedBy = null;
    await fault.save();
    res.status(200).json({ fault });
  } catch (error) {
    res.status(500).json({ msg: `Error undoing deletion: ${error.message}` });
  }
};

const getFaultImage = async (req, res) => {
  try {
    const fault = await Fault.findById(req.params.id);
    if (!fault || !fault.image) {
      return res.status(404).json({ msg: "No image" });
    }

    res.set("Content-Type", fault.imageMimeType || "image/jpeg");
    res.send(fault.image);
  } catch (err) {
    res.status(500).json({ msg: "Image retrieval error" });
  }
};

const markFaultValidated = async (req, res) => {
  try {
    const { id: faultID } = req.params;
    const updatedFault = await Fault.findByIdAndUpdate(
      faultID,
      { status: "validated" },
      { new: true }
    );

    if (!updatedFault) {
      return res.status(404).json({ msg: `Fault with ID ${faultID} doesn't exist` });
    }

    res.status(200).json({ fault: updatedFault });
  } catch (error) {
    res.status(500).json({
      message: `Error marking fault as validated: ${error.message}`,
    });
  }
};

const getFaultsByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ msg: "Both start and end query parameters are required." });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

   
    const completedCount = await Fault.countDocuments({
      status: "completed",
      completedAt: { $gte: startDate, $lte: endDate }
    });

    
    const createdCount = await Fault.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const stillOpenCount = await Fault.countDocuments({
      status: { $nin: ["completed", "deleted"] }
    });

    res.status(200).json({
      completedCount,
      createdCount,
      stillOpenCount
    });

  } catch (error) {
    res.status(500).json({ msg: `Error fetching fault summary: ${error.message}` });
  }
};


module.exports = {
    getAllFaults,
    getPendingFaults,
    getCompletedFaults,
    addFault,
    getFault,
    updateFault,
    markFaultInProgress,
    markFaultAwaitingPart,
    markFaultCorrected,
    deleteFault,
    claimFault,
    getOperatorFaults,
    addFaultComment,
    undoDeleteFault,
    getFaultImage,
    markFaultValidated,
    getFaultsByDateRange
};
