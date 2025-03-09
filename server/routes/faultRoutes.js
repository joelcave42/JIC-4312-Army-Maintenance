// Add this route to your existing fault routes file

// Update fault with maintainer comment
router.patch('/api/v1/faults/:id/comment', async (req, res) => {
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
});

// In your operator faults route
router.get('/api/v1/faults/operator/:username', async (req, res) => {
  try {
    const { username } = req.params;
    // Make sure you're selecting all necessary fields including maintainerComment
    const faults = await Fault.find({ operatorUsername: username })
      .select('vehicleId issues status maintainerComment') // Add maintainerComment here if it's not included
      .sort({ createdAt: -1 });
    
    res.status(200).json({ faults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add this new route to handle fault comments
router.patch('/faults/:id/comment', async (req, res) => {
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
});

// Add this logging middleware
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}); 