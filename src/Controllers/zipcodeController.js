const { ZipCode, zipcodeVali } = require("../models/zipcode");
module.exports = {
  async create(req, res) {
    if (req.userType !== "admin")
      return res.json({ message: "you can't access this page." });
    const { error } = zipcodeVali.validate(req.body);
    if (error) return res.json({ message: error.message });

    const data = ZipCode(req.body);

    try {
      await data.save((err, sucess) => {
        if (err) {
          return res.json({ message: err.message });
        }
        return res.json({ message: "ZipCode created successfully", sucess });
      });
    } catch (err) {
      res.json({ message: err.message });
    }
  },
  async creatBulk(req, res) {
    if (req.userType !== "admin")
      return res.json({ message: "you can't access this page." });

    try {
      const sucess =await ZipCode.insertMany(req.body)
      return res.json({ message: "ZipCode created successfully", sucess })
    } catch (err) {
      res.json({ message: err.message });
    }
  },
  async getData(req, res) {
    try {
      const getdata = await ZipCode.find(); 
      return res.json(getdata);
    } catch (err) {
      res.json({ message: err.message });
    }
  },
};
