import Vital from '../models/Vital.js';

// Record vital
export const recordVital = async (req, res) => {
  try {
    const vital = await Vital.create({ ...req.body, patient: req.user._id });
    res.status(201).json(vital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vitals
export const getVitals = async (req, res) => {
  try {
    const { type, from, to, page = 1, limit = 50 } = req.query;
    const query = { patient: req.user._id };

    if (type) query.type = type;
    if (from || to) {
      query.recordedAt = {};
      if (from) query.recordedAt.$gte = new Date(from);
      if (to) query.recordedAt.$lte = new Date(to);
    }

    const vitals = await Vital.find(query)
      .sort({ recordedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Vital.countDocuments(query);
    res.json({ vitals, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vital trends (for charts)
export const getVitalTrends = async (req, res) => {
  try {
    const { type, days = 30 } = req.query;
    const from = new Date();
    from.setDate(from.getDate() - Number(days));

    const query = { patient: req.user._id, recordedAt: { $gte: from } };
    if (type) query.type = type;

    const vitals = await Vital.find(query).sort({ recordedAt: 1 });

    // Group by type
    const grouped = {};
    for (const v of vitals) {
      if (!grouped[v.type]) grouped[v.type] = [];
      grouped[v.type].push({
        value: v.value,
        unit: v.unit,
        date: v.recordedAt,
        notes: v.notes,
      });
    }

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete vital
export const deleteVital = async (req, res) => {
  try {
    const vital = await Vital.findOneAndDelete({ _id: req.params.id, patient: req.user._id });
    if (!vital) return res.status(404).json({ message: 'Vital not found' });
    res.json({ message: 'Vital deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
