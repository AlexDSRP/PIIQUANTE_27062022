const express = require("express");
const router = express.Router();

const sauceCtrl = require("../controllers/Sauce");
const midAuth = require("../middleware/auth");
const midMulter = require("../middleware/multer");

router.get("/sauces", midAuth, sauceCtrl.getAllSauce);
router.get("/sauces/:id", midAuth, sauceCtrl.getOneSauce);
router.post("/sauces", midAuth, midMulter, sauceCtrl.createSauce);
router.put("/sauces/:id", midAuth, midMulter, sauceCtrl.modifySauce);
router.delete("/sauces/:id", midAuth, sauceCtrl.deleteSauce);
router.post("/sauces/:id/like", midAuth, sauceCtrl.likeSauce);

module.exports = router;
